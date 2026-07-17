import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { aggregateDashboard, isTransactionInPeriod, RECENT_TRANSACTIONS_LIMIT } from "./dashboard";
import type { ResolvedPeriod, Transaction } from "./types";

const period: ResolvedPeriod = { kind: "custom", start: "2025-03-01", end: "2025-03-31", label: "March 2025" };
const occurredOn = ["2025-02-28T12:00:00.000Z", "2025-03-01T12:00:00.000Z", "2025-03-15T12:00:00.000Z", "2025-03-31T12:00:00.000Z", "2025-04-01T12:00:00.000Z"] as const;

const recordsArbitrary = fc.array(fc.record({
  occurredOn: fc.constantFrom(...occurredOn), amountMinor: fc.integer({ min: 0, max: 100_000 }),
  type: fc.constantFrom("income" as const, "expense" as const),
}), { maxLength: 30 }).map((records) => records.map((record, index) => ({
  id: String(index), description: `Record ${index}`, currency: "INR",
  categoryId: record.type === "income" ? "Income" : "Food", createdAt: record.occurredOn,
  ...record,
}) satisfies Transaction));

describe("dashboard subset property", () => {
  /** Validates: Requirements 18.3 */
  it("Property 17: one reporting subset drives every dashboard output", () => {
    fc.assert(fc.property(recordsArbitrary, (records) => {
      const subset = records.filter((record) => isTransactionInPeriod(record, period));
      const dashboard = aggregateDashboard({ period, currency: "INR", records });
      const income = subset.filter(({ type }) => type === "income").reduce((sum, record) => sum + record.amountMinor, 0);
      const spending = subset.filter(({ type }) => type === "expense").reduce((sum, record) => sum + record.amountMinor, 0);
      expect(dashboard.kpis).toMatchObject({ income: { minorValue: income }, spending: { minorValue: spending }, balance: { minorValue: income - spending } });
      expect(dashboard.trend.rows.flatMap((row) => row.values).reduce((sum, value) => sum + value, 0)).toBe(income + spending);
      expect(dashboard.categories.rows.flatMap((row) => row.values).reduce((sum, value) => sum + value, 0)).toBe(spending);
      expect(dashboard.aiFactInputs).toMatchObject({ transactionIds: subset.map(({ id }) => id), transactionCount: subset.length, incomeMinor: income, spendingMinor: spending });
      expect(dashboard.recentTransactions.map(({ id }) => id)).toEqual([...subset].sort((a, b) => b.occurredOn.localeCompare(a.occurredOn)).slice(0, RECENT_TRANSACTIONS_LIMIT).map(({ id }) => id));
    }), { numRuns: 100 });
  });
});
