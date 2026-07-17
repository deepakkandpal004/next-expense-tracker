'use server';

import { getAuthUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { type TransactionCommand, type TransactionCommandField, type TransactionCommandInput, validateTransactionCommand } from '@/lib/domain/transaction-command';
import type { ActionResult, FieldErrors } from '@/lib/domain/types';
import { createActionBoundary, invalid, parsed, type ParseResult } from '@/lib/server/action-boundary';
import { createRecordOnce } from '@/lib/server/transaction-mutations';
import { revalidatePath } from 'next/cache';

type TransactionActionField = TransactionCommandField | 'requestId';
interface RecordData { id: string; text: string; amount: number; type: 'income' | 'expense'; category: string; date: string }
interface TransactionActionData { transaction?: RecordData; draft: TransactionCommandInput; replayed?: boolean }
export interface CreateTransactionRequest { requestId: string; command: TransactionCommandInput }
export type CreateTransactionResult = ActionResult<TransactionActionData, TransactionActionField>;
export type LegacyAddExpenseRecordResult = CreateTransactionResult & { error?: string };

const run = createActionBoundary({ authenticate: getAuthUser, revalidate: revalidatePath, reportError: (scope, error) => console.error(`${scope} action failed`, error) });
const requestIdError: FieldErrors<TransactionActionField> = { requestId: ['Retry this action with its original request token.'] };
function parseRequest(input: CreateTransactionRequest): ParseResult<{ requestId: string; command: TransactionCommand }, TransactionActionField> {
  if (typeof input.requestId !== 'string' || input.requestId.trim().length < 1 || input.requestId.length > 128) return invalid(requestIdError, 'The transaction request could not be identified.');
  const result = validateTransactionCommand(input.command);
  if (!result.success) return invalid(result.fieldErrors, 'Correct the highlighted transaction fields.');
  return parsed({ requestId: input.requestId, command: result.data });
}
const toRecordData = (record: Awaited<ReturnType<typeof createRecordOnce>>['value']): RecordData => ({ id: record.id, text: record.text, amount: record.amount, type: record.type === 'income' ? 'income' : 'expense', category: record.category, date: record.date.toISOString() });

export async function createTransaction(input: CreateTransactionRequest): Promise<CreateTransactionResult> {
  return run({ scope: 'transaction', input, parse: parseRequest, execute: async (actor, request): Promise<TransactionActionData> => { const mutation = await createRecordOnce(db, actor.userId, request.requestId, request.command); return { transaction: toRecordData(mutation.value), draft: input.command, replayed: mutation.replayed }; }, message: (data) => data.replayed ? 'Transaction already added.' : 'Transaction added.', revalidatePaths: ['/', '/dashboard', '/records', '/insights'], preserve: (request): TransactionActionData => ({ draft: request.command }) });
}

/** Compatibility adapter for the existing form; new workflows should call createTransaction with a stable requestId. */
export default async function addExpenseRecord(formData: FormData): Promise<LegacyAddExpenseRecordResult> {
  const result = await createTransaction({ requestId: String(formData.get('requestId') ?? crypto.randomUUID()), command: { type: formData.get('type') ?? 'expense', description: formData.get('text'), amount: formData.get('amount'), category: formData.get('category'), date: formData.get('date'), categorySource: formData.get('categorySource') ?? undefined, categoryConfirmed: formData.get('categoryConfirmed') ?? undefined } });
  return result.status === 'success' ? result : { ...result, error: result.message };
}
