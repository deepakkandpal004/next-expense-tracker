'use server';

import { getAuthUser } from '@/lib/auth';
import { db } from '@/lib/db';
import type { ActionResult } from '@/lib/domain/types';
import { createActionBoundary, parsed } from '@/lib/server/action-boundary';
import type { Record } from '@/types/Record';

type RecordsResult = ActionResult<{ records: Record[] }>;
type LegacyRecordsResult = RecordsResult & { records?: Record[]; error?: string };
const run = createActionBoundary({ authenticate: getAuthUser, revalidate: () => undefined, reportError: (scope, error) => console.error(`${scope} query failed`, error) });

export async function getRecentRecordsResult(): Promise<RecordsResult> {
  return run({ scope: 'record', input: undefined, parse: () => parsed(undefined), execute: async (actor) => ({ records: (await db.record.findMany({ where: { userId: actor.userId }, orderBy: { date: 'desc' }, take: 10 })) as unknown as Record[] }), message: 'Recent records loaded.' });
}

export default async function getRecords(): Promise<LegacyRecordsResult> {
  const result = await getRecentRecordsResult();
  return result.status === 'success' ? { ...result, records: result.data.records } : { ...result, error: result.message };
}
