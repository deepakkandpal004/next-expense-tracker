'use server';

import { getAuthUser } from '@/lib/auth';
import { db } from '@/lib/db';
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
    const updated = await db.user.update({
      where: { id: user.id },
      data: {
        ...(data.name !== undefined ? { name: data.name.trim() || null } : {}),
        ...(data.currency !== undefined ? { currency: data.currency.toUpperCase() } : {}),
      },
    });
    return {
      status: 'success',
      data: { name: updated.name ?? '', email: updated.email, currency: updated.currency ?? 'INR' },
      message: 'Settings updated.',
    };
  } catch (error) {
    console.error('Failed to update settings', error);
    return { status: 'error', message: 'Could not update settings.', retryable: true };
  }
}
