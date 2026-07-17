'use server';

import { getAuthUser } from '@/lib/auth';
import { db } from '@/lib/db';
import type { ActionResult } from '@/lib/domain/types';
import { createActionBoundary, parsed } from '@/lib/server/action-boundary';

export interface DashboardRecordSummary { totalExpenses: number; totalIncome: number; netBalance: number; daysWithRecords: number }
type SummaryResult = ActionResult<DashboardRecordSummary>;
type LegacySummaryResult = SummaryResult & Partial<DashboardRecordSummary> & { error?: string };
const run = createActionBoundary({ authenticate: getAuthUser, revalidate: () => undefined, reportError: (scope, error) => console.error(`${scope} query failed`, error) });

export async function getDashboardRecordSummary(): Promise<SummaryResult> {
  return run({ scope: 'dashboard', input: undefined, parse: () => parsed(undefined), execute: async (actor) => {
    const records = await db.record.findMany({ where: { userId: actor.userId } });
    const totalExpenses = records.filter((record) => record.type !== 'income').reduce((sum, record) => sum + record.amount, 0);
    const totalIncome = records.filter((record) => record.type === 'income').reduce((sum, record) => sum + record.amount, 0);
    const daysWithRecords = new Set(records.filter((record) => record.type !== 'income' && record.amount > 0).map((record) => record.date.toISOString().slice(0, 10))).size;
    return { totalExpenses, totalIncome, netBalance: totalIncome - totalExpenses, daysWithRecords };
  }, message: 'Dashboard records loaded.' });
}

export default async function getUserRecord(): Promise<LegacySummaryResult> {
  const result = await getDashboardRecordSummary();
  return result.status === 'success' ? { ...result, ...result.data } : { ...result, error: result.message };
}
