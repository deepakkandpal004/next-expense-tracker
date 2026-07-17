import {
  buildCategoryChartModel,
  buildErrorChartModel,
  buildTrendChartModel,
  CATEGORY_CHART_TITLE,
  TREND_CHART_TITLE,
} from "./chart-models";
import type {
  Budget,
  BudgetMetric,
  ChartModel,
  DashboardMetrics,
  MetricValue,
  ResolvedPeriod,
  Transaction,
} from "./types";

export const BUDGET_APPROACHING_UTILIZATION = 0.8;
export const RECENT_TRANSACTIONS_LIMIT = 5;

export type DashboardAiFactInputs =
  | {
      status: "available";
      period: ResolvedPeriod;
      currency: string;
      transactionIds: readonly string[];
      transactionCount: number;
      incomeMinor: number;
      spendingMinor: number;
      balanceMinor: number;
      categorySpending: readonly { categoryId: string; amountMinor: number }[];
    }
  | { status: "unavailable"; period: ResolvedPeriod; currency: string; reason: string };

export interface DashboardDTO {
  period: ResolvedPeriod;
  currency: string;
  updatedAt: string | null;
  kpis: DashboardMetrics;
  trend: ChartModel;
  categories: ChartModel;
  recentTransactions: readonly Transaction[];
  aiFactInputs: DashboardAiFactInputs;
}

export interface DashboardAggregationInput {
  period: ResolvedPeriod;
  currency: string;
  records: readonly Transaction[] | undefined;
  budget?: Budget | null;
  locale?: string | null;
  browserLocales?: readonly string[];
}

export function isTransactionInPeriod(transaction: Transaction, period: ResolvedPeriod): boolean {
  const date = transaction.occurredOn.slice(0, 10);
  return date >= period.start && date <= period.end;
}

function unavailableMetric(reason: string): MetricValue {
  return { status: "unavailable", reason };
}

function availableMetric(value: number, direction?: "surplus" | "deficit"): MetricValue {
  return direction
    ? { status: "available", minorValue: value, direction }
    : { status: "available", minorValue: value };
}

function calculateBudgetMetric(
  budget: Budget | null | undefined,
  spentMinor: number,
  period: ResolvedPeriod,
  currency: string,
): BudgetMetric {
  if (!budget || budget.effectiveFrom > period.end) {
    return { status: "not-configured", period };
  }
  if (budget.currency !== currency) {
    return {
      status: "unavailable",
      period,
      currency,
      reason: "Budget currency does not match the reporting currency.",
    };
  }

  const budgetMinor = budget.amountMinor;
  const utilization = budgetMinor > 0 ? spentMinor / budgetMinor : spentMinor > 0 ? Infinity : 0;
  if (spentMinor > budgetMinor) {
    return {
      status: "exceeded",
      period,
      currency,
      spentMinor,
      budgetMinor,
      excessMinor: spentMinor - budgetMinor,
      utilization,
    };
  }

  return {
    status: utilization >= BUDGET_APPROACHING_UTILIZATION ? "approaching" : "on-track",
    period,
    currency,
    spentMinor,
    budgetMinor,
    remainingMinor: budgetMinor - spentMinor,
    utilization,
  };
}

export function aggregateDashboard({
  period,
  currency,
  records,
  budget,
  locale,
  browserLocales,
}: DashboardAggregationInput): DashboardDTO {
  const chartOptions = { period, currency, locale, browserLocales };
  const unavailableReason = "Transaction data is unavailable for this reporting period.";
  if (!records) {
    const unavailable = unavailableMetric(unavailableReason);
    return {
      period,
      currency,
      updatedAt: null,
      kpis: {
        balance: unavailable,
        income: unavailableMetric(unavailableReason),
        spending: unavailableMetric(unavailableReason),
        budget: { status: "unavailable", period, currency, reason: unavailableReason },
      },
      trend: buildErrorChartModel(TREND_CHART_TITLE, chartOptions, unavailableReason),
      categories: buildErrorChartModel(CATEGORY_CHART_TITLE, chartOptions, unavailableReason),
      recentTransactions: [],
      aiFactInputs: { status: "unavailable", period, currency, reason: unavailableReason },
    };
  }

  const subset = records.filter((record) => isTransactionInPeriod(record, period));
  if (subset.some((record) => record.currency !== currency)) {
    return aggregateDashboard({
      period,
      currency,
      records: undefined,
      budget,
      locale,
      browserLocales,
    });
  }

  let incomeMinor = 0;
  let spendingMinor = 0;
  const spendingByCategory = new Map<string, number>();
  for (const record of subset) {
    if (record.type === "income") {
      incomeMinor += record.amountMinor;
      continue;
    }
    spendingMinor += record.amountMinor;
    spendingByCategory.set(
      record.categoryId,
      (spendingByCategory.get(record.categoryId) ?? 0) + record.amountMinor,
    );
  }

  const balanceMinor = incomeMinor - spendingMinor;
  const latestUpdate = subset.reduce<string | null>(
    (latest, record) => (!latest || record.createdAt > latest ? record.createdAt : latest),
    null,
  );
  const recentTransactions = [...subset]
    .sort((first, second) => second.occurredOn.localeCompare(first.occurredOn))
    .slice(0, RECENT_TRANSACTIONS_LIMIT);

  return {
    period,
    currency,
    updatedAt: latestUpdate,
    kpis: {
      balance: availableMetric(balanceMinor, balanceMinor >= 0 ? "surplus" : "deficit"),
      income: availableMetric(incomeMinor),
      spending: availableMetric(spendingMinor),
      budget: calculateBudgetMetric(budget, spendingMinor, period, currency),
    },
    trend: buildTrendChartModel(subset, chartOptions),
    categories: buildCategoryChartModel(subset, chartOptions),
    recentTransactions,
    aiFactInputs: {
      status: "available",
      period,
      currency,
      transactionIds: subset.map((record) => record.id),
      transactionCount: subset.length,
      incomeMinor,
      spendingMinor,
      balanceMinor,
      categorySpending: Array.from(spendingByCategory.entries())
        .sort(([first], [second]) => first.localeCompare(second))
        .map(([categoryId, amountMinor]) => ({ categoryId, amountMinor })),
    },
  };
}
