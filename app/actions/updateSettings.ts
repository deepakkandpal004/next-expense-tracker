'use server';

import { getAuthUser } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  convertUserAmounts,
  countStoredAmounts,
  getExchangeRate,
} from '@/lib/data/currency-conversion';
import type { ActionResult } from '@/lib/domain/types';

export interface UserSettings {
  name: string;
  email: string;
  currency: string;
}

export async function getSettings(): Promise<ActionResult<UserSettings, never>> {
  const user = await getAuthUser();
  if (!user) return { status: 'error', message: 'Sign in to continue.', retryable: false };

  return {
    status: 'success',
    data: { name: user.name ?? '', email: user.email, currency: user.currency ?? 'INR' },
    message: 'Settings loaded.',
  };
}

export async function updateSettings(
  data: Partial<Pick<UserSettings, 'name' | 'currency'>>,
): Promise<ActionResult<UserSettings, 'name' | 'currency'>> {
  const user = await getAuthUser();
  if (!user) return { status: 'error', message: 'Sign in to continue.', retryable: false };

  const fieldErrors: Record<string, readonly string[]> = {};
  if (data.name !== undefined && data.name.trim().length > 0 && data.name.trim().length < 2) {
    fieldErrors.name = ['Name must be at least 2 characters.'];
  }
  if (data.currency !== undefined && data.currency.trim().length !== 3) {
    fieldErrors.currency = ['Currency must be a 3-letter code.'];
  }
  if (Object.keys(fieldErrors).length > 0) {
    return { status: 'validation-error', fieldErrors, message: 'Please fix the errors above.' };
  }

  try {
    const changes: { name?: string | null; currency?: string } = {};
    if (data.name !== undefined) {
      changes.name = data.name.trim() || null;
    }
    if (data.currency !== undefined) {
      changes.currency = data.currency.trim().toUpperCase();
    }

    let conversionMessage = '';
    let currencyHandledInTransaction = false;
    const targetCurrency = changes.currency;
    const currentCurrency = user.currency ?? 'INR';

    if (targetCurrency && targetCurrency !== currentCurrency) {
      let rate: number;
      try {
        rate = await getExchangeRate(currentCurrency, targetCurrency);
      } catch {
        return {
          status: 'error',
          message: `Could not switch to ${targetCurrency}: the exchange rate for ${currentCurrency} is temporarily unavailable. Your amounts were not changed. Please try again later.`,
          retryable: true,
        };
      }

      const storedAmounts = await countStoredAmounts(user.id);
      if (storedAmounts > 0) {
        await db.$transaction(async (tx) => {
          // Lock the user row so concurrent save requests serialize: a second
          // request waits until the first commits and then sees the new
          // currency, preventing the same amounts from being converted twice.
          const rows = await tx.$queryRaw<{ currency: string | null }[]>`
            SELECT "currency" FROM "User" WHERE "id" = ${user.id} FOR UPDATE
          `;
          const lockedCurrency = (rows[0]?.currency ?? 'INR').toUpperCase();

          if (lockedCurrency === targetCurrency) {
            currencyHandledInTransaction = true;
            return;
          }
          if (lockedCurrency !== currentCurrency) {
            // Currency changed underneath us; refuse to guess instead of
            // corrupting amounts a second time.
            return;
          }

          const { converted } = await convertUserAmounts(tx, user.id, targetCurrency, rate);
          await tx.user.update({ where: { id: user.id }, data: { currency: targetCurrency } });
          currencyHandledInTransaction = true;
          if (converted > 0) {
            conversionMessage = ` Converted ${converted} amount(s) at 1 ${currentCurrency} = ${rate.toFixed(4)} ${targetCurrency}.`;
          }
        });
      }
    }

    const updateData: { name?: string | null; currency?: string } = {
      ...(changes.name !== undefined ? { name: changes.name } : {}),
      ...(targetCurrency && !currencyHandledInTransaction ? { currency: targetCurrency } : {}),
    };
    const updated = await db.user.update({
      where: { id: user.id },
      data: updateData,
    });
    return {
      status: 'success',
      data: { name: updated.name ?? '', email: updated.email, currency: updated.currency ?? 'INR' },
      message: `Settings updated.${conversionMessage}`,
    };
  } catch (error) {
    console.error('Failed to update settings', error);
    return { status: 'error', message: 'Could not update settings.', retryable: true };
  }
}
