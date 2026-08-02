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
  const recordId = crypto.randomUUID();
  try {
    const [value] = await db.$transaction([
      db.record.create({
        data: { id: recordId, text: command.description, amount: command.amount, type: command.type, category: command.category, date: new Date(`${command.date}T12:00:00.000Z`), userId },
      }),
      db.mutationRequest.create({ data: { userId, requestId, operation: operation.create, recordId } }),
    ]);
    return { value, replayed: false };
  } catch (error) {
    if (!uniqueViolation(error)) throw error;
    const record = await existingCreate(db, userId, requestId);
    if (!record) throw new MutationInProgressError();
    return { value: record, replayed: true };
  }
}

export async function deleteRecordOnce(db: PrismaClient, userId: string, requestId: string, recordId: string): Promise<IdempotentMutation<{ id: string }>> {
  try {
    const [removed] = await db.$transaction([
      db.record.deleteMany({ where: { id: recordId, userId } }),
      db.mutationRequest.create({ data: { userId, requestId, operation: operation.remove, recordId } }),
    ]);
    if (removed.count === 0) throw new RecordNotFoundError();
    return { value: { id: recordId }, replayed: false };
  } catch (error) {
    if (!uniqueViolation(error)) throw error;
    const request = await db.mutationRequest.findFirst({ where: { userId, requestId, operation: operation.remove } });
    if (!request) throw new MutationInProgressError();
    return { value: { id: request.recordId ?? recordId }, replayed: true };
  }
}
