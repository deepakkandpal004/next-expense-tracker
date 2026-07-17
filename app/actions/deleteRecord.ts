'use server';

import { getAuthUser } from '@/lib/auth';
import { db } from '@/lib/db';
import type { ActionResult, FieldErrors } from '@/lib/domain/types';
import { createActionBoundary, invalid, parsed, type ParseResult } from '@/lib/server/action-boundary';
import { deleteRecordOnce } from '@/lib/server/transaction-mutations';
import { revalidatePath } from 'next/cache';

type DeleteField = 'recordId' | 'requestId';
interface DeleteData { recordId?: string; requestId: string; replayed?: boolean }
export interface DeleteRecordRequest { recordId: string; requestId: string }
export type DeleteRecordResult = ActionResult<DeleteData, DeleteField>;
export type LegacyDeleteRecordResult = DeleteRecordResult & { error?: string } & { message?: string };
const run = createActionBoundary({ authenticate: getAuthUser, revalidate: revalidatePath, reportError: (scope, error) => console.error(`${scope} action failed`, error) });
function parseRequest(input: DeleteRecordRequest): ParseResult<DeleteRecordRequest, DeleteField> {
  const fieldErrors: FieldErrors<DeleteField> = {};
  if (typeof input.recordId !== 'string' || !input.recordId.trim()) fieldErrors.recordId = ['Choose a record to delete.'];
  if (typeof input.requestId !== 'string' || !input.requestId.trim() || input.requestId.length > 128) fieldErrors.requestId = ['Retry this deletion with its original request token.'];
  return Object.keys(fieldErrors).length ? invalid(fieldErrors, 'The deletion request is incomplete.') : parsed(input);
}

export async function deleteTransactionRecord(input: DeleteRecordRequest): Promise<DeleteRecordResult> {
  return run({ scope: 'record', input, parse: parseRequest, execute: async (actor, request): Promise<DeleteData> => { const mutation = await deleteRecordOnce(db, actor.userId, request.requestId, request.recordId); return { recordId: mutation.value.id, requestId: request.requestId, replayed: mutation.replayed }; }, message: (data) => data.replayed ? 'Transaction was already deleted.' : 'Transaction deleted.', revalidatePaths: ['/', '/dashboard', '/records', '/insights'], preserve: (request): DeleteData => ({ recordId: request.recordId, requestId: request.requestId }) });
}

/** Compatibility adapter for the existing record card; new workflows must retain requestId for retries. */
export default async function deleteRecord(recordId: string, requestId = crypto.randomUUID()): Promise<LegacyDeleteRecordResult> {
  const result = await deleteTransactionRecord({ recordId, requestId });
  if (result.status === 'success') return { ...result, message: result.message };
  return { ...result, error: result.message };
}
