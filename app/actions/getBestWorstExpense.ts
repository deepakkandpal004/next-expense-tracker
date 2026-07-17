'use server';

import { getAuthUser } from '@/lib/auth';
import { db } from '@/lib/db';
import type { ActionResult } from '@/lib/domain/types';
import { createActionBoundary, parsed } from '@/lib/server/action-boundary';

export interface ExpenseRange { bestExpense: number; worstExpense: number }
type RangeResult = ActionResult<ExpenseRange>;
type LegacyRangeResult = RangeResult & Partial<ExpenseRange> & { error?: string };
const run = createActionBoundary({ authenticate: getAuthUser, revalidate: () => undefined, reportError: (scope, error) => console.error(`${scope} query failed`, error) });

export async function getDashboardExpenseRange(): Promise<RangeResult> {
  return run({ scope: 'dashboard', input: undefined, parse: () => parsed(undefined), execute: async (actor) => {
    const records = await db.record.findMany({ where: { userId: actor.userId }, select: { amount: true } });
    if (!records.length) return { bestExpense: 0, worstExpense: 0 };
    const amounts = records.map((record) => record.amount);
    return { bestExpense: Math.max(...amounts), worstExpense: Math.min(...amounts) };
  }, message: 'Dashboard range loaded.' });
}

export default async function getBestWorstExpense(): Promise<LegacyRangeResult> {
  const result = await getDashboardExpenseRange();
  return result.status === 'success' ? { ...result, ...result.data } : { ...result, error: result.message };
}
