'use server';

import { getAuthUser } from '@/lib/auth';
import { processDueRecurringRecords } from '@/lib/data/recurring';
import { CacheKey, deleteCache, deleteCacheByPattern } from '@/lib/cache';
import { revalidatePath } from 'next/cache';
import type { ActionResult } from '@/lib/domain/types';

export async function processRecurringRecords(): Promise<ActionResult<{ created: number }, never>> {
  const user = await getAuthUser();
  if (!user) return { status: 'error', message: 'Sign in to continue.', retryable: false };

  try {
    const created = await processDueRecurringRecords(user.id);

    if (created > 0) {
      await deleteCacheByPattern(CacheKey.userAllPattern(user.id));
      // userAllPattern (`app:*:uid:*`) never matches keys without a trailing
      // segment, so clear those explicitly.
      await deleteCache(
        CacheKey.recurringRecords(user.id),
        CacheKey.categories(user.id),
        CacheKey.budget(user.id),
      );
      revalidatePath('/dashboard');
      revalidatePath('/records');
    }

    return { status: 'success', data: { created }, message: `${created} recurring transaction${created === 1 ? "" : "s"} processed.` };
  } catch (error) {
    console.error('Failed to process recurring records', error);
    return { status: 'error', message: 'Could not process recurring transactions.', retryable: true };
  }
}
