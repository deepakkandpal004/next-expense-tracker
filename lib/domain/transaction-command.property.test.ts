import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { validateTransactionCommand } from "./transaction-command";

const descriptionArbitrary = fc.string({ maxLength: 30 }).map((value) => `Record ${value}`);

describe("transaction command category property", () => {
  /** Validates: Requirements 5.3, 5.4 */
  it("Property 6: transaction type determines category validity", () => {
    fc.assert(
      fc.property(
        descriptionArbitrary,
        fc.integer({ min: 1, max: 100_000 }),
        fc.oneof(fc.constant(undefined), fc.string({ maxLength: 30 })),
        (description, cents, ignoredIncomeCategory) => {
          const command = { description, date: "2025-02-28", amount: cents / 100 };
          const expense = validateTransactionCommand({ ...command, type: "expense" });
          expect(expense.success).toBe(false);
          if (!expense.success) expect(expense.fieldErrors.category).toHaveLength(1);

          const income = validateTransactionCommand({
            ...command,
            type: "income",
            category: ignoredIncomeCategory,
          });
          expect(income).toMatchObject({
            success: true,
            data: { category: "Income" },
          });
        },
      ),
      { numRuns: 100 },
    );
  });
});
