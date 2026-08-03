'use server';

import { getAuthUser } from '@/lib/auth';
import { processDueRecurringRecords } from '@/lib/data/recurring';
import { revalidatePath } from 'next/cache';
import type { ActionResult } from '@/lib/domain/types';

export async function processRecurringRecords(): Promise<ActionResult<{ created: number }, never>> {
  const user = await getAuthUser();
  if (!user) return { status: 'error', message: 'Sign in to continue.', retryable: false };

  try {
    const created = await processDueRecurringRecords(user.id);

    if (created > 0) {
      revalidatePath('/dashboard');
      revalidatePath('/records');
    }

    return { status: 'success', data: { created }, message: `${created} recurring transaction(s) processed.` };
  } catch (error) {
    console.error('Failed to process recurring records', error);
    return { status: 'error', message: 'Could not process recurring transactions.', retryable: true };
  }
}
