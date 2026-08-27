'use server';

import { getAuthUser } from '@/lib/auth';
import { db } from '@/lib/db';
import type { ActionResult } from '@/lib/domain/types';

export interface RecurringRecordDTO {
  id: string;
  text: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  frequency: string;
  interval: number;
  startDate: string;
  endDate: string | null;
  lastProcessed: string | null;
  active: boolean;
  nextDue: string | null;
  createdAt: string;
}

function computeNextDue(record: {
  frequency: string;
  interval: number;
  startDate: Date;
  lastProcessed: Date | null;
  endDate: Date | null;
}): string | null {
  const base = record.lastProcessed || record.startDate;
  const next = new Date(base);
  switch (record.frequency) {
    case 'daily': next.setDate(next.getDate() + record.interval); break;
    case 'weekly': next.setDate(next.getDate() + 7 * record.interval); break;
    case 'monthly': next.setMonth(next.getMonth() + record.interval); break;
    case 'yearly': next.setFullYear(next.getFullYear() + record.interval); break;
  }
  if (record.endDate && next > record.endDate) return null;
  return next.toISOString();
}

export async function getRecurringRecords(): Promise<ActionResult<{ records: RecurringRecordDTO[] }, never>> {
  const user = await getAuthUser();
  if (!user) return { status: 'error', message: 'Sign in to continue.', retryable: false };

  try {
    const rows = await db.recurringRecord.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    const records: RecurringRecordDTO[] = rows.map(row => ({
      id: row.id,
      text: row.text,
      amount: Number(row.amount),
      type: row.type as 'income' | 'expense',
      category: row.category,
      frequency: row.frequency,
      interval: row.interval,
      startDate: row.startDate.toISOString(),
      endDate: row.endDate?.toISOString() ?? null,
      lastProcessed: row.lastProcessed?.toISOString() ?? null,
      active: row.active,
      nextDue: computeNextDue(row),
      createdAt: row.createdAt.toISOString(),
    }));

    return { status: 'success', data: { records }, message: 'Recurring records loaded.' };
  } catch (error) {
    console.error('Failed to load recurring records', error);
    return { status: 'error', message: 'Could not load recurring records.', retryable: true };
  }
}
