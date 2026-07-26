import { describe, it, expect } from "vitest";
import {
  validateTransactionCommand,
  type TransactionCommandInput,
} from "@/lib/domain/transaction-command";

function validInput(overrides?: Partial<TransactionCommandInput>): TransactionCommandInput {
  return {
    type: "expense",
    description: "Test transaction",
    date: "2026-07-15",
    amount: 42.50,
    category: "Food",
    categorySource: "manual",
    categoryConfirmed: true,
    ...overrides,
  };
}

describe("validateTransactionCommand", () => {
  it("validates a correct expense command", () => {
    const result = validateTransactionCommand(validInput());
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBe("Test transaction");
      expect(result.data.amount).toBe(42.50);
      expect(result.data.type).toBe("expense");
      expect(result.data.category).toBe("Food");
    }
  });

  it("validates a correct income command", () => {
    const result = validateTransactionCommand(validInput({ type: "income", category: undefined }));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.type).toBe("income");
      expect(result.data.category).toBe("Income");
    }
  });

  it("rejects missing description", () => {
    const result = validateTransactionCommand(validInput({ description: "" }));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fieldErrors.description).toBeDefined();
    }
  });

  it("rejects description over 120 chars", () => {
    const result = validateTransactionCommand(validInput({ description: "x".repeat(121) }));
    expect(result.success).toBe(false);
  });

  it("rejects invalid type", () => {
    const result = validateTransactionCommand(validInput({ type: "investment" }));
    expect(result.success).toBe(false);
  });

  it("rejects zero amount", () => {
    const result = validateTransactionCommand(validInput({ amount: 0 }));
    expect(result.success).toBe(false);
  });

  it("rejects negative amount", () => {
    const result = validateTransactionCommand(validInput({ amount: -10 }));
    expect(result.success).toBe(false);
  });

  it("rejects invalid date", () => {
    const result = validateTransactionCommand(validInput({ date: "not-a-date" }));
    expect(result.success).toBe(false);
  });

  it("rejects invalid category", () => {
    const result = validateTransactionCommand(validInput({ category: "Investment" }));
    expect(result.success).toBe(false);
  });

  it("rejects empty description after trim", () => {
    const result = validateTransactionCommand(validInput({ description: "   " }));
    expect(result.success).toBe(false);
  });

  it("handles amount as string", () => {
    const result = validateTransactionCommand(validInput({ amount: "99.99" as unknown as number }));
    expect(result.success).toBe(true);
  });
});
