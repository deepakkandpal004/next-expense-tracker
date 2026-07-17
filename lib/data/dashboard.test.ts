import { describe, expect, it, vi } from "vitest";

import {
  createDashboardQueryService,
  toDashboardTransactionDTO,
  type DashboardQuerySource,
} from "./dashboard";
import type { ResolvedPeriod } from "../domain/types";

const period: ResolvedPeriod = {
  kind: "custom",
  start: "2025-03-01",
  end: "2025-03-31",
  label: "Mar 1, 2025 – Mar 31, 2025",
};

const income = {
  id: "income-1",
  text: "March salary",
  amount: 1000.5,
  type: "income",
  category: "Income",
  date: new Date("2025-03-01T00:00:00.000Z"),
  createdAt: new Date("2025-03-01T01:00:00.000Z"),
};

const expense = {
  id: "expense-1",
  text: "Groceries",
  amount: 250.25,
  type: "expense",
  category: "Food",
  date: new Date("2025-03-15T12:00:00.000Z"),
  createdAt: new Date("2025-03-15T12:00:00.000Z"),
};

describe("dashboard query service", () => {
  it("loads one bounded user snapshot and derives every non-AI result from it", async () => {
    const source: DashboardQuerySource = {
      loadRecords: vi.fn().mockResolvedValue([income, expense]),
      loadBudget: vi.fn().mockResolvedValue(null),
    };
    const getDashboardData = createDashboardQueryService(source);

    const dashboard = await getDashboardData("user-1", period, "INR");

    expect(source.loadRecords).toHaveBeenCalledTimes(1);
    expect(source.loadRecords).toHaveBeenCalledWith({
      userId: "user-1",
      period,
      startsAt: new Date("2025-03-01T00:00:00.000Z"),
      endsAt: new Date("2025-03-31T23:59:59.999Z"),
    });
    expect(source.loadBudget).toHaveBeenCalledTimes(1);
    expect(source.loadBudget).toHaveBeenCalledWith("user-1", period);

    expect(dashboard).toMatchObject({
      period,
      currency: "INR",
      updatedAt: "2025-03-15T12:00:00.000Z",
      kpis: {
        balance: { status: "available", minorValue: 75_025, direction: "surplus" },
        income: { status: "available", minorValue: 100_050 },
        spending: { status: "available", minorValue: 25_025 },
        budget: { status: "not-configured", period },
      },
      recentTransactions: [
        { id: "expense-1", occurredOn: "2025-03-15T12:00:00.000Z" },
        { id: "income-1", occurredOn: "2025-03-01T00:00:00.000Z" },
      ],
      aiFactInputs: {
        status: "available",
        transactionIds: ["income-1", "expense-1"],
        incomeMinor: 100_050,
        spendingMinor: 25_025,
      },
    });
    expect(dashboard.trend.periodLabel).toBe(period.label);
    expect(dashboard.categories.periodLabel).toBe(period.label);
    expect(JSON.parse(JSON.stringify(dashboard))).toEqual(dashboard);
  });

  it("adapts persistence values into primitive transaction DTO fields", () => {
    expect(toDashboardTransactionDTO(expense, "USD")).toEqual({
      id: "expense-1",
      description: "Groceries",
      amountMinor: 25_025,
      currency: "USD",
      type: "expense",
      categoryId: "Food",
      occurredOn: "2025-03-15T12:00:00.000Z",
      createdAt: "2025-03-15T12:00:00.000Z",
    });
  });
});
