'use server';

import { getAuthUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import type { ActionResult } from '@/src/common/domain/types';
import { CacheKey, deleteCache } from '@/lib/cache';

export async function toggleRecurringRecord(
  recordId: string,
  active: boolean,
): Promise<ActionResult<{ id: string; active: boolean }, never>> {
  const user = await getAuthUser();
  if (!user) return { status: 'error', message: 'Sign in to continue.', retryable: false };

  try {
    const record = await db.recurringRecord.findFirst({
      where: { id: recordId, userId: user.id },
    });
    if (!record) return { status: 'error', message: 'Recurring transaction not found.', retryable: false };

    await db.recurringRecord.update({
      where: { id: recordId },
      data: { active },
    });

    revalidatePath('/recurring');
    await deleteCache(CacheKey.recurringRecords(user.id));
    return { status: 'success', data: { id: recordId, active }, message: active ? 'Recurring transaction activated.' : 'Recurring transaction paused.' };
  } catch (error) {
    console.error('Failed to toggle recurring record', error);
    return { status: 'error', message: 'Could not update recurring transaction.', retryable: true };
  }
}
