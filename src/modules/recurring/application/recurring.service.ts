'use server';
import { getAuthUser } from "@/src/modules/auth";
import { processDueRecurringRecords, findByIdAndUser, create, remove, toggle, findByUser } from "../infrastructure/recurring.repository";
import { CacheKey, deleteCache, deleteCacheByPattern } from "@/src/common/cache";
import { revalidatePath } from "next/cache";
import { createActionBoundary, parsed } from "@/src/common/server/action-boundary";
import type { ActionResult } from "@/src/common/domain/types";
import { z } from "zod";

const run = createActionBoundary({ authenticate: getAuthUser, revalidate: revalidatePath, reportError: (s, e) => console.error(`${s} failed`, e) });

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

export async function processRecurringNow() {
  return run({
    scope: "record",
    input: {},
    parse: () => parsed({}),
    execute: async (actor) => {
      const created = await processDueRecurringRecords(actor.userId);
      if (created > 0) await deleteCacheByPattern(CacheKey.userAllPattern(actor.userId));
      return { created };
    },
    message: "Recurring processed",
    revalidatePaths: ["/recurring", "/dashboard", "/records"],
  });
}

export async function createRecurringRecord(
  input: RecurringRequest,
): Promise<ActionResult<{ id: string }, RecurringField>> {
  const user = await getAuthUser();
  if (!user) return { status: 'error', message: 'Sign in to continue.', retryable: false };

  const parsedResult = createRecurringSchema.safeParse(input);
  if (!parsedResult.success) {
    const fieldErrors: Partial<Record<RecurringField, string[]>> = {};
    for (const issue of parsedResult.error.issues) {
      const field = issue.path[0] as RecurringField;
      if (!fieldErrors[field]) fieldErrors[field] = [];
      fieldErrors[field]!.push(issue.message);
    }
    return { status: 'validation-error', fieldErrors: fieldErrors as Record<string, string[]>, message: 'Correct the highlighted fields.' };
  }

  try {
    const record = await create({
      userId: user.id,
      text: parsedResult.data.text,
      amount: parsedResult.data.amount,
      type: parsedResult.data.type,
      category: parsedResult.data.category,
      frequency: parsedResult.data.frequency,
      interval: parsedResult.data.interval,
      startDate: new Date(`${parsedResult.data.startDate}T00:00:00.000Z`),
      endDate: parsedResult.data.endDate ? new Date(`${parsedResult.data.endDate}T00:00:00.000Z`) : null,
    });

    revalidatePath('/recurring');
    await deleteCache(CacheKey.recurringRecords(user.id));

    return { status: 'success', data: { id: record.id }, message: 'Recurring transaction created.' };
  } catch (error) {
    console.error('Failed to create recurring record', error);
    return { status: 'error', message: 'Could not create recurring transaction.', retryable: true };
  }
}

export async function deleteRecurringRecord(
  recordId: string,
): Promise<ActionResult<{ id: string }, never>> {
  const user = await getAuthUser();
  if (!user) return { status: 'error', message: 'Sign in to continue.', retryable: false };

  try {
    const record = await findByIdAndUser(recordId, user.id);
    if (!record) return { status: 'error', message: 'Recurring transaction not found.', retryable: false };

    await remove(recordId);

    revalidatePath('/recurring');
    await deleteCache(CacheKey.recurringRecords(user.id));
    return { status: 'success', data: { id: recordId }, message: 'Recurring transaction deleted.' };
  } catch (error) {
    console.error('Failed to delete recurring record', error);
    return { status: 'error', message: 'Could not delete recurring transaction.', retryable: true };
  }
}

export async function toggleRecurringRecord(
  recordId: string,
  active: boolean,
): Promise<ActionResult<{ id: string; active: boolean }, never>> {
  const user = await getAuthUser();
  if (!user) return { status: 'error', message: 'Sign in to continue.', retryable: false };

  try {
    const record = await findByIdAndUser(recordId, user.id);
    if (!record) return { status: 'error', message: 'Recurring transaction not found.', retryable: false };

    await toggle(recordId, active);

    revalidatePath('/recurring');
    await deleteCache(CacheKey.recurringRecords(user.id));
    return { status: 'success', data: { id: recordId, active }, message: active ? 'Recurring transaction activated.' : 'Recurring transaction paused.' };
  } catch (error) {
    console.error('Failed to toggle recurring record', error);
    return { status: 'error', message: 'Could not update recurring transaction.', retryable: true };
  }
}

export async function getRecurringRecords(): Promise<ActionResult<{ records: Array<{
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
}> }, never>> {
  const user = await getAuthUser();
  if (!user) return { status: 'error', message: 'Sign in to continue.', retryable: false };

  try {
    const rows = await findByUser(user.id);

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

    const records = rows.map(row => ({
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
