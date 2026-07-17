import fc from "fast-check";
import { describe, expect, it } from "vitest";

import {
  BUDGET_APPROACHING_UTILIZATION,
  aggregateDashboard,
} from "./dashboard";
import type { Budget, ResolvedPeriod, Transaction } from "./types";

const period: ResolvedPeriod = {
  kind: "custom",
  start: "2025-03-01",
  end: "2025-03-31",
  label: "Mar 1, 2025 – Mar 31, 2025",
};

function transaction(
  id: string,
  occurredOn: string,
  type: "income" | "expense",
  amountMinor: number,
  categoryId = type === "income" ? "Income" : "Food",
): Transaction {
  return {
    id,
    description: id,
    amountMinor,
    currency: "INR",
    type,
    categoryId,
    occurredOn,
    createdAt: occurredOn,
  };
}

function budget(amountMinor: number): Budget {
  return {
    id: "budget-1",
    userId: "user-1",
    amountMinor,
    cadence: "monthly",
    effectiveFrom: "2025-03-01",
    currency: "INR",
  };
}

describe("aggregateDashboard", () => {
  it("derives every dashboard output from one inclusive reporting subset", () => {
    const dashboard = aggregateDashboard({
      period,
      currency: "INR",
      budget: budget(10_000),
      records: [
        transaction("before", "2025-02-28T23:59:59.999Z", "expense", 500),
        transaction("start-income", "2025-03-01T00:00:00.000Z", "income", 10_000),
        transaction("start-expense", "2025-03-01T12:00:00.000Z", "expense", 2_500),
        transaction("end-expense", "2025-03-31T23:59:59.999Z", "expense", 1_500, "Bills"),
        transaction("after", "2025-04-01T00:00:00.000Z", "expense", 500),
      ],
    });

    expect(dashboard.kpis).toMatchObject({
      balance: { status: "available", minorValue: 6_000, direction: "surplus" },
      income: { status: "available", minorValue: 10_000 },
      spending: { status: "available", minorValue: 4_000 },
    });
    expect(dashboard.recentTransactions.map(({ id }) => id)).toEqual([
      "end-expense",
      "start-expense",
      "start-income",
    ]);
    expect(dashboard.trend.rows).toMatchObject([
      { key: "2025-03-01", values: [10_000, 2_500] },
      { key: "2025-03-31", values: [0, 1_500] },
    ]);
    expect(dashboard.categories.rows).toMatchObject([
      { key: "Food", label: "Food & dining", values: [2_500] },
      { key: "Bills", label: "Bills & utilities", values: [1_500] },
    ]);
    expect(dashboard.aiFactInputs).toMatchObject({
      status: "available",
      transactionIds: ["start-income", "start-expense", "end-expense"],
      transactionCount: 3,
      incomeMinor: 10_000,
      spendingMinor: 4_000,
      balanceMinor: 6_000,
    });
  });

  it("models each budget state with exact amount and period context", () => {
    const records = [transaction("expense", "2025-03-15T12:00:00.000Z", "expense", 9_000)];
    const input = { period, currency: "INR", records };

    expect(aggregateDashboard(input).kpis.budget).toEqual({
      status: "not-configured",
      period,
    });
    expect(aggregateDashboard({ ...input, budget: budget(20_000) }).kpis.budget).toEqual({
      status: "on-track",
      period,
      currency: "INR",
      spentMinor: 9_000,
      budgetMinor: 20_000,
      remainingMinor: 11_000,
      utilization: 0.45,
    });
    expect(aggregateDashboard({ ...input, budget: budget(10_000) }).kpis.budget).toEqual({
      status: "approaching",
      period,
      currency: "INR",
      spentMinor: 9_000,
      budgetMinor: 10_000,
      remainingMinor: 1_000,
      utilization: BUDGET_APPROACHING_UTILIZATION + 0.1,
    });
    expect(aggregateDashboard({ ...input, budget: budget(5_000) }).kpis.budget).toEqual({
      status: "exceeded",
      period,
      currency: "INR",
      spentMinor: 9_000,
      budgetMinor: 5_000,
      excessMinor: 4_000,
      utilization: 1.8,
    });
  });

  it("never fabricates zero values when transaction data is unavailable", () => {
    const dashboard = aggregateDashboard({
      period,
      currency: "INR",
      records: undefined,
      budget: budget(10_000),
    });

    expect(dashboard.kpis.balance).toEqual({
      status: "unavailable",
      reason: "Transaction data is unavailable for this reporting period.",
    });
    expect(dashboard.kpis.budget).toEqual({
      status: "unavailable",
      period,
      currency: "INR",
      reason: "Transaction data is unavailable for this reporting period.",
    });
    expect(dashboard.trend.state).toBe("error");
    expect(dashboard.aiFactInputs.status).toBe("unavailable");
  });

  /** Validates: Requirements 4.10 */
  it("Property 5: exceeded budget reports the exact excess", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1_000_000_000 }),
        fc.integer({ min: 1, max: 1_000_000_000 }),
        (budgetMinor, excessMinor) => {
          const spentMinor = budgetMinor + excessMinor;
          const dashboard = aggregateDashboard({
            period,
            currency: "INR",
            budget: budget(budgetMinor),
            records: [
              transaction("expense", "2025-03-15T12:00:00.000Z", "expense", spentMinor),
            ],
          });
          const budgetMetric = dashboard.kpis.budget;

          expect(budgetMetric.status).toBe("exceeded");
          if (budgetMetric.status !== "exceeded") {
            throw new Error("Expected an exceeded budget metric.");
          }

          expect(budgetMetric.excessMinor).toBe(spentMinor - budgetMinor);
          expect(budgetMetric.period).toEqual(period);
        },
      ),
      { numRuns: 100 },
    );
  });
});
