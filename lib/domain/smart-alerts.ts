import { CATEGORY_REGISTRY } from "./categories";
import { MONEY_LEAK_CATEGORIES } from "./money-leaks";
import { daysInResolvedPeriod } from "./reporting-period";
import type { ResolvedPeriod } from "./types";

/**
 * Deterministic "smart pacing" alert engine.
 *
 * A pacing alert is not a generic notification ("you exceeded Food"). It is a
 * concrete decision: how much you have spent so far, what your own normal pace
 * is, where you will land at month end at the current rate, and a recommended
 * daily cap for the remaining days to get back under that normal. Every figure
 * is derived from the user's own data (DESIGN.md rule 1) — the loader is the
 * only place that touches the database; this module is pure.
 */

/** A category must have spent historically in at least this many months. */
export const PACING_MIN_HISTORY_MONTHS = 3;
/** Alert only fires once the month-end projection runs ≥ this × normal. */
export const PACING_MIN_RATIO = 1.25;
/** ...and overshoots the normal by at least this much (minor units, ₹300). */
export const PACING_MIN_EXCESS_MINOR = 30_000;
/** Too little of the period observed makes a projection meaningless. */
export const PACING_MIN_ELAPSED_DAYS = 5;
/** Cap the list so real alerts never become noise. */
export const PACING_LIMIT = 3;

export interface SmartPacingAlert {
  categoryId: string;
  label: string;
  /** Recorded spend in the current period to date, minor units. */
  spentMinor: number;
  /** Number of observed days so far in the period. */
  daysElapsed: number;
  /** Days from today through period end (inclusive). */
  daysRemaining: number;
  /** Days in the whole period. */
  daysInPeriod: number;
  /** User's own median monthly spend for this category, minor units. */
  typicalMonthlyMinor: number;
  /** current rate × full period, minor units. */
  projectedMonthEndMinor: number;
  /** typicalMonthlyMinor prorated to daysElapsed — the verifiable "normal pace". */
  normalElapsedMinor: number;
  /** Recommend daily cap for the remaining days, minor units. */
  recommendedDailyCapMinor: number;
  /** projected - typical, minor units. */
  excessMinor: number;
  /** Number of historical months used to compute the normal pace. */
  monthsAnalyzed: number;
}

export interface PacingCategoryHistory {
  categoryId: string;
  month: string;
  totalMinor: number;
}

export interface SmartPacingInput {
  period: ResolvedPeriod;
  /** UTC calendar date treated as "now"; inclusive for recorded data. */
  today: string;
  /** Recorded spend to date per category, minor units. */
  spendToDateByCategory: Readonly<Record<string, number>>;
  /** Per-category monthly totals for the trailing window (zero-pad optional). */
  historyMonthlyTotals: readonly PacingCategoryHistory[];
}

export interface SmartPacingReport {
  status: "available" | "insufficient-data";
  hasAlerts: boolean;
  alerts: readonly SmartPacingAlert[];
  monthsAnalyzed: number;
}

function median(values: readonly number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

export function computeSmartPacingAlerts(
  input: SmartPacingInput,
): SmartPacingReport {
  const { period, today, spendToDateByCategory, historyMonthlyTotals } = input;

  const daysInPeriod = daysInResolvedPeriod(period);
  const dayMs = 24 * 60 * 60 * 1000;
  const startMs = new Date(`${period.start}T00:00:00Z`).getTime();
  const nowMs = new Date(`${today}T00:00:00Z`).getTime();

  const pastDays = nowMs >= startMs ? Math.floor((nowMs - startMs) / dayMs) + 1 : 0;
  const daysElapsed = Math.max(0, Math.min(pastDays, daysInPeriod));
  const daysRemaining = Math.max(0, daysInPeriod - daysElapsed);

  // Collapse history rows into per-category, per-month totals (zero-padded).
  const byCategory = new Map<string, Map<string, number>>();
  for (const entry of historyMonthlyTotals) {
    let months = byCategory.get(entry.categoryId);
    if (!months) {
      months = new Map();
      byCategory.set(entry.categoryId, months);
    }
    months.set(entry.month, (months.get(entry.month) ?? 0) + entry.totalMinor);
  }

  let maxMonthsAnalyzed = 0;
  const alerts: SmartPacingAlert[] = [];

  for (const categoryId of MONEY_LEAK_CATEGORIES) {
    const spentMinor = spendToDateByCategory[categoryId] ?? 0;
    if (spentMinor <= 0) continue;
    if (daysElapsed < PACING_MIN_ELAPSED_DAYS) continue;

    const monthsMap = byCategory.get(categoryId);
    if (!monthsMap || monthsMap.size < PACING_MIN_HISTORY_MONTHS) continue;
    const typicalMonthly = median(Array.from(monthsMap.values()));
    if (typicalMonthly <= 0) continue;
    maxMonthsAnalyzed = Math.max(maxMonthsAnalyzed, monthsMap.size);

    const normalElapsed = Math.round((typicalMonthly / daysInPeriod) * daysElapsed);
    if (spentMinor <= normalElapsed) continue;

    const projectedMonthEnd = Math.round((spentMinor / daysElapsed) * daysInPeriod);
    const excess = projectedMonthEnd - typicalMonthly;
    if (excess < PACING_MIN_EXCESS_MINOR) continue;
    if (projectedMonthEnd / typicalMonthly < PACING_MIN_RATIO) continue;

    const remainingBudget = Math.max(0, typicalMonthly - spentMinor);
    const recommendedDailyCap =
      daysRemaining > 0 ? Math.round(remainingBudget / daysRemaining) : 0;

    const definition = CATEGORY_REGISTRY[categoryId as keyof typeof CATEGORY_REGISTRY];

    alerts.push({
      categoryId,
      label: definition?.label ?? categoryId,
      spentMinor,
      daysElapsed,
      daysRemaining,
      daysInPeriod,
      typicalMonthlyMinor: Math.round(typicalMonthly),
      projectedMonthEndMinor: projectedMonthEnd,
      normalElapsedMinor: normalElapsed,
      recommendedDailyCapMinor: recommendedDailyCap,
      excessMinor: Math.round(excess),
      monthsAnalyzed: monthsMap.size,
    });
  }

  alerts.sort((a, b) => b.excessMinor - a.excessMinor);
  const top = alerts.slice(0, PACING_LIMIT);

  return {
    status: maxMonthsAnalyzed >= PACING_MIN_HISTORY_MONTHS ? "available" : "insufficient-data",
    hasAlerts: top.length > 0,
    alerts: top,
    monthsAnalyzed: maxMonthsAnalyzed,
  };
}