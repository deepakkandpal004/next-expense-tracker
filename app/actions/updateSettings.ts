'use server';

import { getAuthUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { countStoredAmounts, getExchangeRate } from '@/lib/data/currency-conversion';
import type { ActionResult } from '@/lib/domain/types';
import { CacheKey, deleteCacheByPattern } from '@/lib/cache';


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
        // Runs inside a Postgres function (convert_user_currency) so the lock,
        // the conditional checks and every amount update commit atomically on a
        // single backend connection, which works through the transaction pooler
        // that carries the runtime traffic.
        const [row] = await db.$queryRaw<{ result: string }[]>`
          SELECT convert_user_currency(
            ${user.id},
            ${currentCurrency},
            ${targetCurrency},
            ${rate}
          ) AS result
        `;
        const outcome = row?.result ?? '';
        if (outcome === 'already' || outcome.startsWith('converted:')) {
          currencyHandledInTransaction = true;
        }
        if (outcome.startsWith('converted:')) {
          const converted = Number(outcome.slice('converted:'.length));
          if (converted > 0) {
            conversionMessage = ` Converted ${converted} amount(s) at 1 ${currentCurrency} = ${rate.toFixed(6)} ${targetCurrency}.`;
          }
        }
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
    await deleteCacheByPattern(CacheKey.userAllPattern(user.id));
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
