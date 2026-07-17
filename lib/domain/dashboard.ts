import { getCategoryDefinition } from "./categories";
import {
  buildCategoryChartModel,
  buildErrorChartModel,
  buildTrendChartModel,
  CATEGORY_CHART_TITLE,
  TREND_CHART_TITLE,
} from "./chart-models";
import { daysInResolvedPeriod } from "./reporting-period";
import type {
  Budget,
  BudgetMetric,
  CategoryBreakdownRow,
  ChartModel,
  DashboardKpiInsights,
  DashboardSnapshot,
  DashboardMetrics,
  KpiInsight,
  KpiTrend,
  MetricValue,
  ResolvedPeriod,
  Transaction,
  TrendDirection,
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
  previousPeriod: ResolvedPeriod | null;
  currency: string;
  updatedAt: string | null;
  kpis: DashboardMetrics;
  insights: DashboardKpiInsights;
  snapshot: DashboardSnapshot;
  categoryBreakdown: readonly CategoryBreakdownRow[];
  trend: ChartModel;
  categories: ChartModel;
  recentTransactions: readonly Transaction[];
  aiFactInputs: DashboardAiFactInputs;
}

export interface DashboardAggregationInput {
  period: ResolvedPeriod;
  previousPeriod?: ResolvedPeriod | null;
  currency: string;
  records: readonly Transaction[] | undefined;
  previousRecords?: readonly Transaction[] | null;
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

interface DailySeries {
  income: number[];
  expense: number[];
  count: number[];
}

function buildDailySeries(subset: readonly Transaction[], period: ResolvedPeriod): DailySeries {
  const days = daysInResolvedPeriod(period);
  const income = new Array<number>(days).fill(0);
  const expense = new Array<number>(days).fill(0);
  const count = new Array<number>(days).fill(0);
  const startTime = new Date(`${period.start}T00:00:00Z`).getTime();
  const dayMs = 24 * 60 * 60 * 1000;

  for (const record of subset) {
    const dateOnly = record.occurredOn.slice(0, 10);
    const recordTime = new Date(`${dateOnly}T00:00:00Z`).getTime();
    if (Number.isNaN(recordTime)) continue;
    const index = Math.floor((recordTime - startTime) / dayMs);
    if (index < 0 || index >= days) continue;
    count[index] += 1;
    if (record.type === "income") income[index] += record.amountMinor;
    else expense[index] += record.amountMinor;
  }

  return { income, expense, count };
}

function computeTrend(currentMinor: number, previousMinor: number): KpiTrend | null {
  if (previousMinor === 0) return null;
  const changePercent = (currentMinor - previousMinor) / previousMinor;
  const direction: TrendDirection =
    changePercent > 0.005 ? "up" : changePercent < -0.005 ? "down" : "flat";
  return { changePercent, direction, previousMinor };
}

interface PreviousTotals {
  incomeMinor: number;
  spendingMinor: number;
  balanceMinor: number;
}

function aggregatePreviousTotals(
  previousRecords: readonly Transaction[] | undefined | null,
  previousPeriod: ResolvedPeriod | undefined | null,
  currency: string,
): PreviousTotals | null {
  if (!previousRecords || !previousPeriod) return null;
  const subset = previousRecords.filter((record) => isTransactionInPeriod(record, previousPeriod));
  if (subset.some((record) => record.currency !== currency)) return null;

  let incomeMinor = 0;
  let spendingMinor = 0;
  for (const record of subset) {
    if (record.type === "income") incomeMinor += record.amountMinor;
    else spendingMinor += record.amountMinor;
  }
  return { incomeMinor, spendingMinor, balanceMinor: incomeMinor - spendingMinor };
}

function safeRatio(numerator: number, denominator: number): number {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) return 0;
  return Math.max(0, Math.min(1, numerator / denominator));
}

function emptyKpiInsight(): KpiInsight {
  return { currentMinor: 0, trend: null, sparkline: [] };
}

function emptySnapshot(period: ResolvedPeriod): DashboardSnapshot {
  const days = daysInResolvedPeriod(period);
  const zeros = new Array<number>(days).fill(0);
  return {
    daysInPeriod: days,
    averageDailyExpenseMinor: 0,
    transactionCount: 0,
    savingsRate: 0,
    highestExpense: null,
    sparklines: {
      dailyIncome: zeros,
      dailyExpense: zeros,
      dailyNet: zeros,
      dailyTransactionCount: zeros,
    },
  };
}

function emptyInsights(): DashboardKpiInsights {
  return {
    balance: emptyKpiInsight(),
    income: emptyKpiInsight(),
    spending: emptyKpiInsight(),
    savings: emptyKpiInsight(),
  };
}

export function aggregateDashboard({
  period,
  previousPeriod = null,
  currency,
  records,
  previousRecords = null,
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
      previousPeriod,
      currency,
      updatedAt: null,
      kpis: {
        balance: unavailable,
        income: unavailableMetric(unavailableReason),
        spending: unavailableMetric(unavailableReason),
        budget: { status: "unavailable", period, currency, reason: unavailableReason },
      },
      insights: emptyInsights(),
      snapshot: emptySnapshot(period),
      categoryBreakdown: [],
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
      previousPeriod,
      currency,
      records: undefined,
      budget,
      locale,
      browserLocales,
    });
  }

  let incomeMinor = 0;
  let spendingMinor = 0;
  let highestExpenseRecord: Transaction | null = null;
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
    if (!highestExpenseRecord || record.amountMinor > highestExpenseRecord.amountMinor) {
      highestExpenseRecord = record;
    }
  }

  const balanceMinor = incomeMinor - spendingMinor;
  const savingsMinor = Math.max(balanceMinor, 0);
  const latestUpdate = subset.reduce<string | null>(
    (latest, record) => (!latest || record.createdAt > latest ? record.createdAt : latest),
    null,
  );
  const recentTransactions = [...subset]
    .sort((first, second) => second.occurredOn.localeCompare(first.occurredOn))
    .slice(0, RECENT_TRANSACTIONS_LIMIT);

  const daily = buildDailySeries(subset, period);
  const dailyNet = daily.income.map((amount, index) => amount - daily.expense[index]);
  const daysInPeriod = daily.income.length;
  const averageDailyExpenseMinor = daysInPeriod > 0
    ? Math.round(spendingMinor / daysInPeriod)
    : 0;

  const previousTotals = aggregatePreviousTotals(previousRecords, previousPeriod, currency);

  const insights: DashboardKpiInsights = {
    balance: {
      currentMinor: balanceMinor,
      trend: previousTotals ? computeTrend(balanceMinor, previousTotals.balanceMinor) : null,
      sparkline: dailyNet,
    },
    income: {
      currentMinor: incomeMinor,
      trend: previousTotals ? computeTrend(incomeMinor, previousTotals.incomeMinor) : null,
      sparkline: daily.income,
    },
    spending: {
      currentMinor: spendingMinor,
      trend: previousTotals ? computeTrend(spendingMinor, previousTotals.spendingMinor) : null,
      sparkline: daily.expense,
    },
    savings: {
      currentMinor: savingsMinor,
      trend: previousTotals
        ? computeTrend(savingsMinor, Math.max(previousTotals.balanceMinor, 0))
        : null,
      sparkline: dailyNet,
    },
  };

  const snapshot: DashboardSnapshot = {
    daysInPeriod,
    averageDailyExpenseMinor,
    transactionCount: subset.length,
    savingsRate: safeRatio(savingsMinor, incomeMinor),
    highestExpense: highestExpenseRecord
      ? {
          amountMinor: highestExpenseRecord.amountMinor,
          occurredOn: highestExpenseRecord.occurredOn,
          description: highestExpenseRecord.description,
          categoryId: highestExpenseRecord.categoryId,
        }
      : null,
    sparklines: {
      dailyIncome: daily.income,
      dailyExpense: daily.expense,
      dailyNet,
      dailyTransactionCount: daily.count,
    },
  };

  const categoryBreakdown: readonly CategoryBreakdownRow[] = Array.from(
    spendingByCategory.entries(),
  )
    .map(([categoryId, amountMinor]) => {
      const definition = getCategoryDefinition(categoryId);
      return {
        categoryId,
        label: definition.label,
        semanticToken: definition.semanticToken,
        amountMinor,
        percentage: spendingMinor > 0 ? amountMinor / spendingMinor : 0,
      };
    })
    .sort((first, second) => second.amountMinor - first.amountMinor);

  return {
    period,
    previousPeriod,
    currency,
    updatedAt: latestUpdate,
    kpis: {
      balance: availableMetric(balanceMinor, balanceMinor >= 0 ? "surplus" : "deficit"),
      income: availableMetric(incomeMinor),
      spending: availableMetric(spendingMinor),
      budget: calculateBudgetMetric(budget, spendingMinor, period, currency),
    },
    insights,
    snapshot,
    categoryBreakdown,
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
