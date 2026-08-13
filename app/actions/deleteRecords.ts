'use server';

import { getAuthUser } from '@/lib/auth';
import { CacheKey, deleteCacheByPattern } from '@/lib/cache';
import { db } from '@/lib/db';
import type { ActionResult, FieldErrors } from '@/lib/domain/types';
import { createActionBoundary, invalid, parsed, type ParseResult } from '@/lib/server/action-boundary';
import { deleteManyRecordsOnce } from '@/lib/server/transaction-mutations';
import { revalidatePath } from 'next/cache';

type BulkDeleteField = 'recordIds' | 'requestId';

interface BulkDeleteData {
  recordIds: string[];
  deletedCount: number;
  requestId: string;
  replayed?: boolean;
}

export interface DeleteRecordsRequest {
  recordIds: readonly string[];
  requestId: string;
}

export type DeleteRecordsResult = ActionResult<BulkDeleteData, BulkDeleteField>;

const run = createActionBoundary({
  authenticate: getAuthUser,
  revalidate: revalidatePath,
  reportError: (scope, error) => console.error(`${scope} action failed`, error),
});

function parseRequest(
  input: DeleteRecordsRequest,
): ParseResult<{ recordIds: string[]; requestId: string }, BulkDeleteField> {
  const fieldErrors: FieldErrors<BulkDeleteField> = {};
  const recordIds = Array.isArray(input.recordIds) ? [...new Set(input.recordIds)] : [];

  if (recordIds.length === 0 || recordIds.length > 500) {
    fieldErrors.recordIds = ['Choose at least one transaction to delete.'];
  } else if (recordIds.some((id) => typeof id !== 'string' || !id.trim())) {
    fieldErrors.recordIds = ['One or more selected transactions is invalid.'];
  }

  if (
    typeof input.requestId !== 'string' ||
    !input.requestId.trim() ||
    input.requestId.length > 128
  ) {
    fieldErrors.requestId = ['Retry this deletion with its original request token.'];
  }

  return Object.keys(fieldErrors).length
    ? invalid(fieldErrors, 'The deletion request is incomplete.')
    : parsed({ recordIds, requestId: input.requestId });
}

export async function deleteTransactionRecords(
  input: DeleteRecordsRequest,
): Promise<DeleteRecordsResult> {
  return run({
    scope: 'record',
    input,
    parse: parseRequest,
    execute: async (actor, request): Promise<BulkDeleteData> => {
      const mutation = await deleteManyRecordsOnce(
        db,
        actor.userId,
        request.requestId,
        request.recordIds,
      );
      await Promise.all([
        deleteCacheByPattern(CacheKey.userDashboardPattern(actor.userId)),
        deleteCacheByPattern(CacheKey.userRecordsPattern(actor.userId)),
      ]);
      return {
        recordIds: request.recordIds,
        deletedCount: mutation.value,
        requestId: request.requestId,
        replayed: mutation.replayed,
      };
    },
    message: (data) =>
      data.replayed
        ? 'Transactions were already deleted.'
        : `${data.deletedCount} transaction(s) deleted.`,
    revalidatePaths: ['/', '/dashboard', '/records', '/ai-insights'],
    preserve: (request): BulkDeleteData => ({
      recordIds: Array.isArray(request.recordIds)
        ? [...new Set(request.recordIds)]
        : [],
      deletedCount: 0,
      requestId: String(request.requestId ?? ''),
    }),
  });
}
