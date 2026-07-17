import { describe, expect, it } from "vitest";
import {
  TRANSACTION_AMOUNT_MAX,
  TRANSACTION_DESCRIPTION_MAX_LENGTH,
  TRANSACTION_FIELD_ORDER,
  expenseCategorySchema,
  supportedCategorySchema,
  transactionAmountSchema,
  transactionDateSchema,
  transactionDescriptionSchema,
  transactionTypeSchema,
  validateTransactionCommand,
} from "./transaction-command";

const validExpense = {
  type: "expense",
  description: "Groceries",
  date: "2025-02-28",
  amount: "125.50",
  category: "Food",
} as const;

describe("transaction command field schemas", () => {
  it("accepts only documented transaction types and supported categories", () => {
    expect(transactionTypeSchema.parse("income")).toBe("income");
    expect(transactionTypeSchema.parse("expense")).toBe("expense");
    expect(transactionTypeSchema.safeParse("transfer").success).toBe(false);

    expect(supportedCategorySchema.parse("Income")).toBe("Income");
    expect(expenseCategorySchema.parse("Food")).toBe("Food");
    expect(expenseCategorySchema.safeParse("Income").success).toBe(false);
    expect(supportedCategorySchema.safeParse("Groceries").success).toBe(false);
  });

  it("trims descriptions and applies the single documented length range", () => {
    expect(transactionDescriptionSchema.parse("  Salary  ")).toBe("Salary");
    expect(transactionDescriptionSchema.safeParse("   ").success).toBe(false);
    expect(
      transactionDescriptionSchema.safeParse(
        "x".repeat(TRANSACTION_DESCRIPTION_MAX_LENGTH + 1),
      ).success,
    ).toBe(false);
  });

  it("accepts only finite positive amounts within the server bound", () => {
    expect(transactionAmountSchema.parse("0.01")).toBe(0.01);
    expect(transactionAmountSchema.parse(TRANSACTION_AMOUNT_MAX)).toBe(
      TRANSACTION_AMOUNT_MAX,
    );

    for (const value of [0, -1, "", Number.NaN, Infinity, "Infinity"]) {
      expect(transactionAmountSchema.safeParse(value).success).toBe(false);
    }
    expect(
      transactionAmountSchema.safeParse(TRANSACTION_AMOUNT_MAX + 0.01).success,
    ).toBe(false);
  });

  it("validates exact calendar dates in YYYY-MM-DD format", () => {
    expect(transactionDateSchema.parse("2024-02-29")).toBe("2024-02-29");

    for (const value of [
      "2023-02-29",
      "2025-04-31",
      "2025-13-01",
      "2025-00-10",
      "0000-01-01",
      "2025-2-03",
      "03/02/2025",
    ]) {
      expect(transactionDateSchema.safeParse(value).success).toBe(false);
    }
  });
});

describe("transaction command normalization", () => {
  it("normalizes form-compatible expense values", () => {
    expect(
      validateTransactionCommand({
        ...validExpense,
        description: "  Weekly groceries  ",
      }),
    ).toEqual({
      success: true,
      data: {
        type: "expense",
        description: "Weekly groceries",
        date: "2025-02-28",
        amount: 125.5,
        category: "Food",
      },
    });
  });

  it("always normalizes income to the canonical Income category", () => {
    const result = validateTransactionCommand({
      ...validExpense,
      type: "income",
      category: "not-a-category",
      categorySource: "ai-suggested",
      categoryConfirmed: false,
    });

    expect(result).toEqual({
      success: true,
      data: {
        type: "income",
        description: "Groceries",
        date: "2025-02-28",
        amount: 125.5,
        category: "Income",
      },
    });
  });

  it("requires a supported expense category", () => {
    for (const category of [undefined, "Income", "Groceries"]) {
      const result = validateTransactionCommand({ ...validExpense, category });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.firstInvalidField).toBe("category");
        expect(result.fieldErrors.category).toHaveLength(1);
      }
    }
  });

  it("rejects untouched AI suggestions until explicitly confirmed", () => {
    const unconfirmed = validateTransactionCommand({
      ...validExpense,
      categorySource: "ai-suggested",
      categoryConfirmed: false,
    });
    expect(unconfirmed.success).toBe(false);
    if (!unconfirmed.success) {
      expect(unconfirmed.fieldErrors.category).toEqual([
        "Confirm or replace the AI-suggested category.",
      ]);
    }

    expect(
      validateTransactionCommand({
        ...validExpense,
        categorySource: "ai-suggested",
        categoryConfirmed: "true",
      }).success,
    ).toBe(true);
  });

  it("accepts an explicit replacement of an AI suggestion", () => {
    const result = validateTransactionCommand({
      ...validExpense,
      category: "Transportation",
      categorySource: "ai-replaced",
    });

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.category).toBe("Transportation");
  });

  it("returns one typed message per field in programmatic field order", () => {
    const result = validateTransactionCommand({
      type: "expense",
      description: " ",
      date: "2025-02-30",
      amount: "Infinity",
      category: "Income",
    });

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(TRANSACTION_FIELD_ORDER).toEqual([
      "type",
      "description",
      "date",
      "amount",
      "category",
    ]);
    expect(Object.keys(result.fieldErrors)).toEqual([
      "description",
      "date",
      "amount",
      "category",
    ]);
    expect(result.firstInvalidField).toBe("description");
    for (const errors of Object.values(result.fieldErrors)) {
      expect(errors).toHaveLength(1);
    }
  });

  it("reports type as the first invalid visible field", () => {
    const result = validateTransactionCommand({
      ...validExpense,
      type: "transfer",
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.firstInvalidField).toBe("type");
  });
});
