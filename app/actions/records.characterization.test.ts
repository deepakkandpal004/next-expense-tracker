import { beforeEach, describe, expect, it, vi } from "vitest";
import { AUTHENTICATED_USERS } from "@/tests/fixtures";

/**
 * Characterization tests for the existing transaction/record server actions.
 *
 * These tests lock down the CURRENT authentication, authorization, transaction
 * creation/deletion, and record retrieval behavior that the app/actions modules
 * expose today, before any route/component migration changes their composition.
 * They intentionally test observable behavior rather than the target design, so
 * a regression during migration is caught even if the target contract differs.
 *
 * Validates: Requirements 5.12, 5.28, 7.14, 8.13, 17.10
 */

const { getAuthUser } = vi.hoisted(() => ({ getAuthUser: vi.fn() }));
vi.mock("@/lib/auth", () => ({ getAuthUser }));

const { revalidatePath } = vi.hoisted(() => ({ revalidatePath: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath }));

interface RecordRow {
  id: string;
  userId: string;
  text: string;
  amount: number;
  type: string;
  category: string;
  date: Date;
  createdAt: Date;
}

interface RecordFindManyArgs {
  where: { userId: string };
  orderBy?: { date?: string };
  take?: number;
  select?: Partial<Record<keyof RecordRow, boolean>>;
}

interface MutationRequestRow {
  userId: string;
  requestId: string;
  operation: string;
  recordId: string | null;
}

interface FakeDatabase {
  record: {
    findMany(args: RecordFindManyArgs): Promise<object[]>;
    findFirst(args: { where: { id: string; userId?: string } }): Promise<RecordRow | null>;
    create(args: { data: Omit<RecordRow, "id" | "createdAt"> }): Promise<RecordRow>;
    delete(args: { where: { id: string } }): Promise<RecordRow | undefined>;
  };
  mutationRequest: {
    findFirst(args: { where: Pick<MutationRequestRow, "userId" | "requestId" | "operation"> }): Promise<MutationRequestRow | null>;
    create(args: { data: MutationRequestRow }): Promise<MutationRequestRow>;
  };
  $transaction<T>(callback: (transaction: FakeDatabase) => Promise<T>): Promise<T>;
}

const { db, records, mutationRequests } = vi.hoisted(() => {
  const records = new Map<string, RecordRow>();
  const mutationRequests: MutationRequestRow[] = [];
  let counter = 0;

  const db: FakeDatabase = {
    record: {
      findMany: vi.fn(async ({ where, orderBy, take, select }: RecordFindManyArgs) => {
        let rows = Array.from(records.values()).filter(
          (row) => row.userId === where.userId,
        );
        if (orderBy?.date === "desc") {
          rows = [...rows].sort((a, b) => b.date.getTime() - a.date.getTime());
        }
        if (typeof take === "number") rows = rows.slice(0, take);
        if (select) {
          const keys = Object.keys(select) as Array<keyof RecordRow>;
          return rows.map((row) => Object.fromEntries(keys.map((key) => [key, row[key]])));
        }
        return rows.map((row) => ({ ...row }));
      }),
      findFirst: vi.fn(async ({ where }: { where: { id: string; userId?: string } }) => {
        const row = records.get(where.id);
        if (!row) return null;
        if (where.userId && row.userId !== where.userId) return null;
        return { ...row };
      }),
      create: vi.fn(async ({ data }: { data: Omit<RecordRow, "id" | "createdAt"> }) => {
        counter += 1;
        const row: RecordRow = { id: `record-${counter}`, createdAt: new Date(), ...data };
        records.set(row.id, row);
        return { ...row };
      }),
      delete: vi.fn(async ({ where }: { where: { id: string } }) => {
        const row = records.get(where.id);
        records.delete(where.id);
        return row;
      }),
    },
    mutationRequest: {
      findFirst: vi.fn(async ({ where }: { where: Pick<MutationRequestRow, "userId" | "requestId" | "operation"> }) =>
        mutationRequests.find(
          (request) =>
            request.userId === where.userId &&
            request.requestId === where.requestId &&
            request.operation === where.operation,
        ) ?? null,
      ),
      create: vi.fn(async ({ data }: { data: MutationRequestRow }) => {
        mutationRequests.push({ ...data });
        return { ...data };
      }),
    },
    $transaction: async <T,>(callback: (transaction: FakeDatabase) => Promise<T>) => callback(db),
  };

  return { db, records, mutationRequests };
});
vi.mock("@/lib/db", () => ({ db }));

import addExpenseRecordDefault, { createTransaction } from "@/app/actions/addExpenseRecord";
import deleteRecordDefault, { deleteTransactionRecord } from "@/app/actions/deleteRecord";
import getAllRecordsDefault, { getAllRecordsResult } from "@/app/actions/getAllRecords";
import { getRecentRecordsResult } from "@/app/actions/getRecords";
import getUserRecordDefault, { getDashboardRecordSummary } from "@/app/actions/getUserRecord";
import { getDashboardExpenseRange } from "@/app/actions/getBestWorstExpense";

const [userA, userB] = AUTHENTICATED_USERS;
const command = {
  type: "expense" as const,
  description: "Coffee",
  amount: 4.5,
  category: "Food",
  date: "2025-03-10",
};

function signInAs(user: { id: string } | null) {
  getAuthUser.mockResolvedValue(user);
}

beforeEach(() => {
  records.clear();
  mutationRequests.length = 0;
  getAuthUser.mockReset();
  revalidatePath.mockClear();
});

describe("existing authentication authorization contract", () => {
  it.each([
    ["createTransaction", () => createTransaction({ requestId: "req-1", command })],
    ["deleteTransactionRecord", () => deleteTransactionRecord({ recordId: "record-1", requestId: "req-1" })],
    ["getAllRecordsResult", () => getAllRecordsResult()],
    ["getRecentRecordsResult", () => getRecentRecordsResult()],
    ["getDashboardRecordSummary", () => getDashboardRecordSummary()],
    ["getDashboardExpenseRange", () => getDashboardExpenseRange()],
  ])("denies %s for an unauthenticated caller without touching the database", async (_name, run) => {
    signInAs(null);

    const result = await run();

    expect(result).toMatchObject({
      status: "error",
      message: "Sign in to continue.",
      retryable: false,
    });
    expect(db.record.findMany).not.toHaveBeenCalled();
    expect(db.record.create).not.toHaveBeenCalled();
    expect(db.record.delete).not.toHaveBeenCalled();
  });
});

describe("existing transaction creation contract", () => {
  it("creates a user-scoped record, announces success, and revalidates every affected view", async () => {
    signInAs({ id: userA.id });

    const result = await createTransaction({ requestId: "req-create-1", command });

    expect(result.status).toBe("success");
    if (result.status !== "success") throw new Error("expected success");
    expect(result.data.transaction).toMatchObject({
      text: "Coffee",
      amount: 4.5,
      type: "expense",
      category: "Food",
    });
    expect(result.message).toBe("Transaction added.");
    expect(records.get(result.data.transaction!.id)?.userId).toBe(userA.id);
    expect(revalidatePath).toHaveBeenCalledWith("/");
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
    expect(revalidatePath).toHaveBeenCalledWith("/records");
    expect(revalidatePath).toHaveBeenCalledWith("/insights");
  });

  it("does not create a duplicate record when the same request token is retried", async () => {
    signInAs({ id: userA.id });

    const first = await createTransaction({ requestId: "req-create-2", command });
    const retry = await createTransaction({ requestId: "req-create-2", command });

    expect(records.size).toBe(1);
    if (first.status !== "success" || retry.status !== "success") throw new Error("expected success");
    expect(retry.data.transaction?.id).toBe(first.data.transaction?.id);
    expect(retry.message).toBe("Transaction already added.");
  });

  it("rejects an invalid transaction command with field errors instead of writing a record", async () => {
    signInAs({ id: userA.id });

    const result = await createTransaction({
      requestId: "req-invalid-1",
      command: { ...command, amount: -5 },
    });

    expect(result.status).toBe("validation-error");
    expect(records.size).toBe(0);
  });
});

describe("existing transaction deletion contract", () => {
  it("deletes only the record owned by the authenticated user and announces the result", async () => {
    signInAs({ id: userA.id });
    const created = await createTransaction({ requestId: "req-create-3", command });
    if (created.status !== "success") throw new Error("expected success");
    const recordId = created.data.transaction!.id;

    const result = await deleteTransactionRecord({ recordId, requestId: "req-delete-1" });

    expect(result).toMatchObject({ status: "success", message: "Transaction deleted." });
    expect(records.has(recordId)).toBe(false);
  });

  it("denies cross-user deletion and leaves the other user's record intact", async () => {
    signInAs({ id: userA.id });
    const created = await createTransaction({ requestId: "req-create-4", command });
    if (created.status !== "success") throw new Error("expected success");
    const recordId = created.data.transaction!.id;

    signInAs({ id: userB.id });
    const result = await deleteTransactionRecord({ recordId, requestId: "req-delete-2" });

    expect(result.status).toBe("error");
    expect(records.has(recordId)).toBe(true);
    expect(records.get(recordId)?.userId).toBe(userA.id);
  });

  it("does not remove a record again when a successful deletion request is retried", async () => {
    signInAs({ id: userA.id });
    const created = await createTransaction({ requestId: "req-create-5", command });
    if (created.status !== "success") throw new Error("expected success");
    const recordId = created.data.transaction!.id;

    const first = await deleteTransactionRecord({ recordId, requestId: "req-delete-3" });
    const retry = await deleteTransactionRecord({ recordId, requestId: "req-delete-3" });

    expect(first).toMatchObject({ status: "success", message: "Transaction deleted." });
    expect(retry).toMatchObject({ status: "success", message: "Transaction was already deleted." });
  });
});

describe("existing record retrieval contract", () => {
  beforeEach(async () => {
    signInAs({ id: userA.id });
    await createTransaction({
      requestId: "seed-a-1",
      command: { ...command, description: "User A groceries" },
    });
    signInAs({ id: userB.id });
    await createTransaction({
      requestId: "seed-b-1",
      command: { ...command, description: "User B private record", amount: 999 },
    });
  });

  it("returns only the authenticated user's records from getAllRecordsResult", async () => {
    signInAs({ id: userA.id });

    const result = await getAllRecordsResult();

    expect(result.status).toBe("success");
    if (result.status !== "success") throw new Error("expected success");
    expect(result.data.records).toHaveLength(1);
    expect(result.data.records[0]).toMatchObject({ text: "User A groceries", userId: userA.id });
  });

  it("preserves raw Prisma record fields on the legacy Record contract", async () => {
    signInAs({ id: userA.id });

    const result = await getAllRecordsResult();
    if (result.status !== "success") throw new Error("expected success");
    const [record] = result.data.records;

    expect(record).toMatchObject({
      id: expect.any(String),
      text: "User A groceries",
      amount: 4.5,
      type: "expense",
      category: "Food",
      userId: userA.id,
    });
    expect(record.date).toBeInstanceOf(Date);
    expect(record.createdAt).toBeInstanceOf(Date);
  });

  it("scopes recent records, dashboard summary, and expense range to the authenticated user", async () => {
    signInAs({ id: userA.id });

    const recent = await getRecentRecordsResult();
    const summary = await getDashboardRecordSummary();
    const range = await getDashboardExpenseRange();

    if (recent.status !== "success") throw new Error("expected success");
    expect(recent.data.records.every((record) => record.userId === userA.id)).toBe(true);
    expect(summary).toMatchObject({
      status: "success",
      data: { totalExpenses: 4.5, totalIncome: 0, netBalance: -4.5 },
    });
    expect(range).toMatchObject({
      status: "success",
      data: { bestExpense: 4.5, worstExpense: 4.5 },
    });
  });
});

describe("legacy compatibility adapters", () => {
  it("adapts createTransaction failures with a top-level error string for the legacy form", async () => {
    signInAs(null);
    const formData = new FormData();
    formData.set("type", "expense");
    formData.set("text", "Coffee");
    formData.set("amount", "4.5");
    formData.set("category", "Food");
    formData.set("date", "2025-03-10");

    const result = await addExpenseRecordDefault(formData);

    expect(result.status).toBe("error");
    expect(result.error).toBe("Sign in to continue.");
  });

  it("adapts deleteRecord failures with a top-level error string for the legacy record card", async () => {
    signInAs(null);

    const result = await deleteRecordDefault("record-1");

    expect(result.status).toBe("error");
    expect(result.error).toBe("Sign in to continue.");
  });

  it("spreads records at the top level for the legacy RecordHistoryList consumer", async () => {
    signInAs({ id: userA.id });
    await createTransaction({ requestId: "seed-legacy-1", command });

    const legacy = await getAllRecordsDefault();

    expect(legacy.status).toBe("success");
    expect(legacy.records).toHaveLength(1);
  });

  it("spreads dashboard summary fields at the top level for the legacy ExpenseStats consumer", async () => {
    signInAs({ id: userA.id });
    await createTransaction({ requestId: "seed-legacy-2", command });

    const legacy = await getUserRecordDefault();

    expect(legacy).toMatchObject({
      status: "success",
      totalExpenses: 4.5,
      totalIncome: 0,
      netBalance: -4.5,
    });
  });
});
