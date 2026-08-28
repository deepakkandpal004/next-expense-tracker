import { db } from "@/src/database/client";
import {
  aggregateDashboard,
  type DashboardAiFactInputs,
  type DashboardDTO,
} from "@/src/common/domain/dashboard";
import { previousResolvedPeriod } from "@/src/common/domain/reporting-period";
import type {
  Budget,
  Transaction,
  TransactionType,
  ResolvedPeriod,
} from "@/src/common/domain/types";
import { getBudgetForUser } from "@/src/modules/budgets/infrastructure/budgets.repository";
import { boundaryAtStart, boundaryAtEnd } from "@/src/common/utils/date-boundaries";
import { Decimal } from "@prisma/client/runtime/library";

export const DEFAULT_CURRENCY = "INR";

export interface DashboardRecordRow {
  id: string;
  text: string;
  amount: number | Decimal;
  type: string;
  category: string;
  date: Date;
  createdAt: Date;
}

export interface DashboardRecordQuery {
  userId: string;
  startsAt: Date;
  endsAt: Date;
}

export interface DashboardQuerySource {
  loadRecords(query: DashboardRecordQuery): Promise<readonly DashboardRecordRow[]>;
  loadBudget(userId: string, period: ResolvedPeriod): Promise<Budget | null>;
}

function toTransactionType(type: string): TransactionType {
  return type === "income" ? "income" : "expense";
}

export function toDashboardTransactionDTO(
  record: DashboardRecordRow,
  currency = DEFAULT_CURRENCY,
): Transaction {
  return {
    id: record.id,
    description: record.text,
    amountMinor: Math.round(Number(record.amount) * 100),
    currency,
    type: toTransactionType(record.type),
    categoryId: record.category,
    occurredOn: record.date.toISOString(),
    createdAt: record.createdAt.toISOString(),
  };
}

function copyPeriod(period: ResolvedPeriod): ResolvedPeriod {
  return { kind: period.kind, start: period.start, end: period.end, label: period.label };
}

function copyMetric(metric: import("@/src/common/domain/types").MetricValue): import("@/src/common/domain/types").MetricValue {
  return metric.status === "available"
    ? { ...metric }
    : { status: "unavailable", reason: metric.reason };
}

function copyBudgetMetric(metric: import("@/src/common/domain/types").BudgetMetric): import("@/src/common/domain/types").BudgetMetric {
  if (metric.status === "not-configured") return { status: metric.status, period: copyPeriod(metric.period) };
  return { ...metric, period: copyPeriod(metric.period) };
}

function copyChart(chart: import("@/src/common/domain/types").ChartModel): import("@/src/common/domain/types").ChartModel {
  return {
    state: chart.state,
    title: chart.title,
    periodLabel: chart.periodLabel,
    unit: chart.unit,
    unitLabel: chart.unitLabel,
    ...(chart.currency ? { currency: chart.currency } : {}),
    ...(chart.interpretation ? { interpretation: chart.interpretation } : {}),
    ...(chart.errorMessage ? { errorMessage: chart.errorMessage } : {}),
    series: chart.series.map((series) => ({ ...series })),
    rows: chart.rows.map((row) => ({ ...row, values: [...row.values] })),
  };
}

function copyAiFactInputs(inputs: DashboardAiFactInputs): DashboardAiFactInputs {
  if (inputs.status === "unavailable") return { ...inputs, period: copyPeriod(inputs.period) };
  return {
    ...inputs,
    period: copyPeriod(inputs.period),
    transactionIds: [...inputs.transactionIds],
    categorySpending: inputs.categorySpending.map((category) => ({ ...category })),
  };
}

function copyKpiInsight(insight: import("@/src/common/domain/types").KpiInsight): import("@/src/common/domain/types").KpiInsight {
  return {
    currentMinor: insight.currentMinor,
    trend: insight.trend ? { ...insight.trend } : null,
    sparkline: [...insight.sparkline],
  };
}

function copyInsights(insights: import("@/src/common/domain/types").DashboardKpiInsights): import("@/src/common/domain/types").DashboardKpiInsights {
  return {
    balance: copyKpiInsight(insights.balance),
    income: copyKpiInsight(insights.income),
    spending: copyKpiInsight(insights.spending),
    savings: copyKpiInsight(insights.savings),
  };
}

function copySnapshot(snapshot: import("@/src/common/domain/types").DashboardSnapshot): import("@/src/common/domain/types").DashboardSnapshot {
  return {
    daysInPeriod: snapshot.daysInPeriod,
    averageDailyExpenseMinor: snapshot.averageDailyExpenseMinor,
    transactionCount: snapshot.transactionCount,
    savingsRate: snapshot.savingsRate,
    highestExpense: snapshot.highestExpense ? { ...snapshot.highestExpense } : null,
    sparklines: {
      dailyIncome: [...snapshot.sparklines.dailyIncome],
      dailyExpense: [...snapshot.sparklines.dailyExpense],
      dailyNet: [...snapshot.sparklines.dailyNet],
      dailyTransactionCount: [...snapshot.sparklines.dailyTransactionCount],
    },
  };
}

function copyCategoryBreakdown(
  breakdown: readonly import("@/src/common/domain/types").CategoryBreakdownRow[],
): readonly import("@/src/common/domain/types").CategoryBreakdownRow[] {
  return breakdown.map((row) => ({ ...row }));
}

export function toSerializableDashboardDTO(snapshot: DashboardDTO): DashboardDTO {
  return {
    period: copyPeriod(snapshot.period),
    previousPeriod: snapshot.previousPeriod ? copyPeriod(snapshot.previousPeriod) : null,
    currency: snapshot.currency,
    updatedAt: snapshot.updatedAt,
    kpis: {
      balance: copyMetric(snapshot.kpis.balance),
      income: copyMetric(snapshot.kpis.income),
      spending: copyMetric(snapshot.kpis.spending),
      budget: copyBudgetMetric(snapshot.kpis.budget),
    },
    insights: copyInsights(snapshot.insights),
    snapshot: copySnapshot(snapshot.snapshot),
    categoryBreakdown: copyCategoryBreakdown(snapshot.categoryBreakdown),
    trend: copyChart(snapshot.trend),
    categories: copyChart(snapshot.categories),
    recentTransactions: snapshot.recentTransactions.map((transaction) => ({ ...transaction })),
    aiFactInputs: copyAiFactInputs(snapshot.aiFactInputs),
  };
}

export function createDashboardQueryService(source: DashboardQuerySource) {
  return async function getDashboardData(
    userId: string,
    period: ResolvedPeriod,
    currency = DEFAULT_CURRENCY,
  ): Promise<DashboardDTO> {
    const previousPeriod = previousResolvedPeriod(period);

    const rangeQuery: DashboardRecordQuery = {
      userId,
      startsAt: boundaryAtStart(previousPeriod.start),
      endsAt: boundaryAtEnd(period.end),
    };

    const [allRecords, budget] = await Promise.all([
      source.loadRecords(rangeQuery),
      source.loadBudget(userId, period),
    ]);

    const currentStartMs = boundaryAtStart(period.start).getTime();
    const records: readonly DashboardRecordRow[] = allRecords.filter((record) => record.date.getTime() >= currentStartMs);
    const previousRecords: readonly DashboardRecordRow[] = allRecords.filter((record) => record.date.getTime() < currentStartMs);

    return toSerializableDashboardDTO(
      aggregateDashboard({
        period,
        previousPeriod,
        currency,
        records: records.map((record) => toDashboardTransactionDTO(record, currency)),
        previousRecords: previousRecords.map((record) =>
          toDashboardTransactionDTO(record, currency),
        ),
        budget,
      }),
    );
  };
}

const prismaDashboardQuerySource: DashboardQuerySource = {
  loadRecords: ({ userId, startsAt, endsAt }) =>
    db.record.findMany({
      where: { userId, date: { gte: startsAt, lte: endsAt } },
      orderBy: { date: "desc" },
    }),
  loadBudget: getBudgetForUser,
};

export const getDashboardData = createDashboardQueryService(prismaDashboardQuerySource);

export async function getCachedDashboardData(
  userId: string,
  period: ResolvedPeriod,
  currency = DEFAULT_CURRENCY,
): Promise<DashboardDTO> {
  const { getCache, setCache, CacheKey } = await import("@/src/common/cache");
  const key = CacheKey.dashboard(userId, `${period.start}_${period.end}`);
  const cached = await getCache<DashboardDTO>(key);
  if (cached) return cached;

  const data = await getDashboardData(userId, period, currency);
  await setCache(key, data, 60 * 5);
  return data;
}
