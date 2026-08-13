'use server';

import { getAuthUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import type { ActionResult } from '@/lib/domain/types';
import { CacheKey, deleteCache } from '@/lib/cache';


export async function deleteRecurringRecord(
  recordId: string,
): Promise<ActionResult<{ id: string }, never>> {
  const user = await getAuthUser();
  if (!user) return { status: 'error', message: 'Sign in to continue.', retryable: false };

  try {
    const record = await db.recurringRecord.findFirst({
      where: { id: recordId, userId: user.id },
    });
    if (!record) return { status: 'error', message: 'Recurring transaction not found.', retryable: false };

    await db.recurringRecord.delete({ where: { id: recordId } });

    revalidatePath('/recurring');
    await deleteCache(CacheKey.recurringRecords(user.id));
    return { status: 'success', data: { id: recordId }, message: 'Recurring transaction deleted.' };
  } catch (error) {
    console.error('Failed to delete recurring record', error);
    return { status: 'error', message: 'Could not delete recurring transaction.', retryable: true };
  }
}
