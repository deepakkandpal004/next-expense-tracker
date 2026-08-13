'use server';

import { getAuthUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import type { ActionResult } from '@/lib/domain/types';
import { z } from 'zod';
import { CacheKey, deleteCache } from '@/lib/cache';

const FREQUENCIES = ['daily', 'weekly', 'monthly', 'yearly'] as const;

const createRecurringSchema = z.object({
  text: z.string().min(1).max(120),
  amount: z.number().positive(),
  type: z.enum(['income', 'expense']),
  category: z.string().min(1),
  frequency: z.enum(FREQUENCIES),
  interval: z.number().int().min(1).max(365).default(1),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
});

export type RecurringRequest = z.infer<typeof createRecurringSchema>;
type RecurringField = keyof RecurringRequest;

export async function createRecurringRecord(
  input: RecurringRequest,
): Promise<ActionResult<{ id: string }, RecurringField>> {
  const user = await getAuthUser();
  if (!user) return { status: 'error', message: 'Sign in to continue.', retryable: false };

  const parsed = createRecurringSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<RecurringField, string[]>> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as RecurringField;
      if (!fieldErrors[field]) fieldErrors[field] = [];
      fieldErrors[field]!.push(issue.message);
    }
    return { status: 'validation-error', fieldErrors: fieldErrors as Record<string, string[]>, message: 'Correct the highlighted fields.' };
  }

  try {
    const record = await db.recurringRecord.create({
      data: {
        userId: user.id,
        text: parsed.data.text,
        amount: parsed.data.amount,
        type: parsed.data.type,
        category: parsed.data.category,
        frequency: parsed.data.frequency,
        interval: parsed.data.interval,
        startDate: new Date(`${parsed.data.startDate}T00:00:00.000Z`),
        endDate: parsed.data.endDate ? new Date(`${parsed.data.endDate}T00:00:00.000Z`) : null,
      },
    });

    revalidatePath('/recurring');
    await deleteCache(CacheKey.recurringRecords(user.id));

    return { status: 'success', data: { id: record.id }, message: 'Recurring transaction created.' };
  } catch (error) {
    console.error('Failed to create recurring record', error);
    return { status: 'error', message: 'Could not create recurring transaction.', retryable: true };
  }
}
