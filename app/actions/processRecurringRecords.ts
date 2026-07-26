'use server';

import { getAuthUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import type { ActionResult } from '@/lib/domain/types';

export async function processRecurringRecords(): Promise<ActionResult<{ created: number }, never>> {
  const user = await getAuthUser();
  if (!user) return { status: 'error', message: 'Sign in to continue.', retryable: false };

  try {
    const recurringRecords = await db.recurringRecord.findMany({
      where: { userId: user.id, active: true },
    });

    let created = 0;
    const now = new Date();

    for (const record of recurringRecords) {
      const base = record.lastProcessed || record.startDate;
      const nextDue = new Date(base);

      switch (record.frequency) {
        case 'daily': nextDue.setDate(nextDue.getDate() + record.interval); break;
        case 'weekly': nextDue.setDate(nextDue.getDate() + 7 * record.interval); break;
        case 'monthly': nextDue.setMonth(nextDue.getMonth() + record.interval); break;
        case 'yearly': nextDue.setFullYear(nextDue.getFullYear() + record.interval); break;
      }

      if (nextDue > now) continue;
      if (record.endDate && nextDue > record.endDate) continue;

      await db.record.create({
        data: {
          text: record.text,
          amount: record.amount,
          type: record.type,
          category: record.category,
          date: nextDue,
          userId: user.id,
          recurringId: record.id,
        },
      });

      await db.recurringRecord.update({
        where: { id: record.id },
        data: { lastProcessed: nextDue },
      });

      created += 1;
    }

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
