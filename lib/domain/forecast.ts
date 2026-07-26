import type { ResolvedPeriod } from "./types";

export interface MonthlySpendingSummary {
  month: string;
  totalMinor: number;
  transactionCount: number;
}

export interface CategoryMonthlySpending {
  categoryId: string;
  label: string;
  month: string;
  totalMinor: number;
}

export interface SpendingForecast {
  status: "available" | "insufficient-data";
  predictedNextMonthMinor: number;
  confidence: "high" | "moderate" | "low";
  monthsAnalyzed: number;
  trend: "increasing" | "decreasing" | "stable";
  changePercent: number;
  averageMonthlyMinor: number;
}

export interface TransactionAnomaly {
  transactionId: string;
  description: string;
  amountMinor: number;
  categoryId: string;
  categoryLabel: string;
  occurredOn: string;
  severity: "high" | "medium" | "low";
  reason: string;
  typicalAmountMinor: number;
  deviationMultiplier: number;
}

export interface CategoryAverage {
  categoryId: string;
  label: string;
  averageMinor: number;
  medianMinor: number;
  stdDevMinor: number;
  transactionCount: number;
}

export function computeCategoryAverages(
  monthlySpending: CategoryMonthlySpending[],
): CategoryAverage[] {
  const grouped = new Map<string, number[]>();
  for (const entry of monthlySpending) {
    const values = grouped.get(entry.categoryId) ?? [];
    values.push(entry.totalMinor);
    grouped.set(entry.categoryId, values);
  }

  const result: CategoryAverage[] = [];
  for (const [categoryId, values] of grouped) {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const medianMinor = sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
    const avg = values.reduce((s, v) => s + v, 0) / values.length;
    const variance = values.reduce((s, v) => s + (v - avg) ** 2, 0) / values.length;
    const stdDevMinor = Math.sqrt(variance);

    const label = categoryId;
    result.push({
      categoryId,
      label,
      averageMinor: Math.round(avg),
      medianMinor: Math.round(medianMinor),
      stdDevMinor: Math.round(stdDevMinor),
      transactionCount: values.length,
    });
  }

  return result;
}

export function computeSpendingForecast(
  monthlySummaries: MonthlySpendingSummary[],
): SpendingForecast {
  const sorted = [...monthlySummaries].sort((a, b) => a.month.localeCompare(b.month));

  if (sorted.length < 2) {
    return {
      status: "insufficient-data",
      predictedNextMonthMinor: 0,
      confidence: "low",
      monthsAnalyzed: sorted.length,
      trend: "stable",
      changePercent: 0,
      averageMonthlyMinor: sorted.length === 1 ? sorted[0].totalMinor : 0,
    };
  }

  const totals = sorted.map(s => s.totalMinor);
  const averageMonthlyMinor = Math.round(totals.reduce((a, b) => a + b, 0) / totals.length);

  // Weighted moving average (more recent = higher weight)
  const weights = sorted.map((_, i) => (i + 1) / (sorted.length * (sorted.length + 1) / 2));
  const weightedAvg = Math.round(totals.reduce((sum, val, i) => sum + val * weights[i], 0));

  // Trend detection: compare recent 3 to older months
  const recentMonths = sorted.slice(-3);
  const olderMonths = sorted.slice(0, -3);
  let trend: "increasing" | "decreasing" | "stable" = "stable";
  let changePercent = 0;

  if (olderMonths.length > 0) {
    const recentAvg = recentMonths.reduce((s, m) => s + m.totalMinor, 0) / recentMonths.length;
    const olderAvg = olderMonths.reduce((s, m) => s + m.totalMinor, 0) / olderMonths.length;
    changePercent = olderAvg > 0 ? Math.round(((recentAvg - olderAvg) / olderAvg) * 100) : 0;
    if (changePercent > 10) trend = "increasing";
    else if (changePercent < -10) trend = "decreasing";
  } else if (sorted.length >= 2) {
    const lastTwo = sorted.slice(-2);
    const diff = lastTwo[1].totalMinor - lastTwo[0].totalMinor;
    changePercent = lastTwo[0].totalMinor > 0 ? Math.round((diff / lastTwo[0].totalMinor) * 100) : 0;
    if (diff > 0) trend = "increasing";
    else if (diff < 0) trend = "decreasing";
  }

  // Confidence based on data quantity
  const confidence = sorted.length >= 6 ? "high" : sorted.length >= 3 ? "moderate" : "low";

  // Forecast: recent trend applied to weighted average
  const trendFactor = 1 + (changePercent / 100) * 0.5;
  const predictedNextMonthMinor = Math.round(weightedAvg * Math.max(trendFactor, 0.5));

  return {
    status: "available",
    predictedNextMonthMinor,
    confidence,
    monthsAnalyzed: sorted.length,
    trend,
    changePercent,
    averageMonthlyMinor,
  };
}

export function detectAnomalies(
  currentRecords: Array<{ id: string; description: string; amountMinor: number; categoryId: string; occurredOn: string }>,
  categoryAverages: CategoryAverage[],
): TransactionAnomaly[] {
  const anomalies: TransactionAnomaly[] = [];
  const avgMap = new Map(categoryAverages.map(a => [a.categoryId, a]));

  for (const record of currentRecords) {
    const avg = avgMap.get(record.categoryId);
    if (!avg || avg.transactionCount < 2 || avg.stdDevMinor === 0) continue;

    const multiplier = record.amountMinor / (avg.averageMinor || 1);
    if (multiplier < 1.5) continue;

    const deviationMultiplier = Math.round(multiplier * 10) / 10;
    const severity = deviationMultiplier >= 3 ? "high" : deviationMultiplier >= 2 ? "medium" : "low";

    anomalies.push({
      transactionId: record.id,
      description: record.description,
      amountMinor: record.amountMinor,
      categoryId: record.categoryId,
      categoryLabel: record.categoryId,
      occurredOn: record.occurredOn,
      severity,
      reason: `${deviationMultiplier}x higher than typical ${record.categoryId.toLowerCase()} spending`,
      typicalAmountMinor: avg.averageMinor,
      deviationMultiplier,
    });
  }

  return anomalies.sort((a, b) => b.deviationMultiplier - a.deviationMultiplier);
}

export function createResolvedPeriodFromRange(start: string, end: string): ResolvedPeriod {
  return { kind: "custom", start, end, label: `${start} to ${end}` };
}
