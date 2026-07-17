import type { PrismaClient } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import { createRecordOnce, deleteRecordOnce, RecordNotFoundError } from "./transaction-mutations";

function createStore() {
  const records = new Map<string, { id: string; userId: string; text: string; amount: number; type: string; category: string; date: Date; createdAt: Date }>();
  const requests: Array<{ userId: string; requestId: string; operation: string; recordId: string | null }> = [];
  const store = {
    mutationRequest: { findFirst: vi.fn(async ({ where }: { where: { userId: string; requestId: string; operation: string } }) => requests.find((request) => request.userId === where.userId && request.requestId === where.requestId && request.operation === where.operation) ?? null), create: vi.fn(async ({ data }: { data: { userId: string; requestId: string; operation: string; recordId: string } }) => { const request = { ...data }; requests.push(request); return request; }) },
    record: {
      findFirst: vi.fn(async ({ where }: { where: { id: string; userId: string } }) => records.get(where.id)?.userId === where.userId ? records.get(where.id) ?? null : null),
      create: vi.fn(async ({ data }: { data: Omit<(typeof records extends Map<string, infer T> ? T : never), 'id' | 'createdAt'> }) => { const record = { ...data, id: `record-${records.size + 1}`, createdAt: new Date() }; records.set(record.id, record); return record; }),
      delete: vi.fn(async ({ where }: { where: { id: string } }) => { const record = records.get(where.id)!; records.delete(where.id); return record; }),
    },
    $transaction: async <T>(callback: (transaction: PrismaClient) => Promise<T>) => callback(store as unknown as PrismaClient),
  };
  return { store: store as unknown as PrismaClient, records, requests };
}

const command = { type: "expense" as const, description: "Groceries", amount: 42, category: "Food" as const, date: "2025-01-01" };
describe("idempotent transaction mutations", () => {
  it("creates at most one user-scoped record for a retried request token", async () => {
    const { store, records } = createStore();
    const first = await createRecordOnce(store, "user-1", "request-1", command);
    const retry = await createRecordOnce(store, "user-1", "request-1", command);
    expect(records.size).toBe(1);
    expect(retry).toEqual({ value: first.value, replayed: true });
  });

  it("keeps idempotency tokens and delete authorization scoped to the authenticated user", async () => {
    const { store, records } = createStore();
    const first = await createRecordOnce(store, "user-1", "shared-token", command);
    await createRecordOnce(store, "user-2", "shared-token", command);
    await expect(deleteRecordOnce(store, "user-2", "delete-1", first.value.id)).rejects.toBeInstanceOf(RecordNotFoundError);
    expect(records.get(first.value.id)?.userId).toBe("user-1");
  });
});
