import { Prisma, type PrismaClient, type Record as PersistedRecord } from "@prisma/client";
import type { TransactionCommand } from "@/lib/domain/transaction-command";

export interface IdempotentMutation<T> { readonly value: T; readonly replayed: boolean }
export class MutationInProgressError extends Error { constructor() { super("The matching request is still processing."); } }
export class RecordNotFoundError extends Error { constructor() { super("The requested record was not found."); } }
const operation = { create: "transaction-create", remove: "transaction-delete" } as const;
const uniqueViolation = (error: unknown) => error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";

async function existingCreate(db: PrismaClient, userId: string, requestId: string) {
  const request = await db.mutationRequest.findFirst({ where: { userId, requestId, operation: operation.create } });
  if (!request) return undefined;
  if (!request.recordId) throw new MutationInProgressError();
  const record = await db.record.findFirst({ where: { id: request.recordId, userId } });
  if (!record) throw new MutationInProgressError();
  return record;
}

export async function createRecordOnce(db: PrismaClient, userId: string, requestId: string, command: TransactionCommand): Promise<IdempotentMutation<PersistedRecord>> {
  const replay = await existingCreate(db, userId, requestId);
  if (replay) return { value: replay, replayed: true };
  try {
    return await db.$transaction(async (tx) => {
      const existing = await tx.mutationRequest.findFirst({ where: { userId, requestId, operation: operation.create } });
      if (existing?.recordId) {
        const record = await tx.record.findFirst({ where: { id: existing.recordId, userId } });
        if (record) return { value: record, replayed: true };
      }
      if (existing) throw new MutationInProgressError();
      const value = await tx.record.create({ data: { text: command.description, amount: command.amount, type: command.type, category: command.category, date: new Date(`${command.date}T12:00:00.000Z`), userId } });
      await tx.mutationRequest.create({ data: { userId, requestId, operation: operation.create, recordId: value.id } });
      return { value, replayed: false };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  } catch (error) {
    if (!uniqueViolation(error)) throw error;
    const record = await existingCreate(db, userId, requestId);
    if (!record) throw new MutationInProgressError();
    return { value: record, replayed: true };
  }
}

export async function deleteRecordOnce(db: PrismaClient, userId: string, requestId: string, recordId: string): Promise<IdempotentMutation<{ id: string }>> {
  const existing = await db.mutationRequest.findFirst({ where: { userId, requestId, operation: operation.remove } });
  if (existing) return { value: { id: existing.recordId ?? recordId }, replayed: true };
  try {
    return await db.$transaction(async (tx) => {
      const request = await tx.mutationRequest.findFirst({ where: { userId, requestId, operation: operation.remove } });
      if (request) return { value: { id: request.recordId ?? recordId }, replayed: true };
      const record = await tx.record.findFirst({ where: { id: recordId, userId } });
      if (!record) throw new RecordNotFoundError();
      await tx.record.delete({ where: { id: record.id } });
      await tx.mutationRequest.create({ data: { userId, requestId, operation: operation.remove, recordId: record.id } });
      return { value: { id: record.id }, replayed: false };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  } catch (error) {
    if (!uniqueViolation(error)) throw error;
    const request = await db.mutationRequest.findFirst({ where: { userId, requestId, operation: operation.remove } });
    if (!request) throw new MutationInProgressError();
    return { value: { id: request.recordId ?? recordId }, replayed: true };
  }
}
