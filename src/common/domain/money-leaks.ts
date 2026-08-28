import { CATEGORY_REGISTRY } from "./categories";
import type { ResolvedPeriod } from "./types";

/**
 * Deterministic "money leak" detector.
 *
 * A leak is a discretionary category whose projected month spend runs clearly
 * above the user's own recent-month median. The exposure we surface — "you
 * could save ₹X/month" — is *exactly* current spend minus that median, so every
 * figure is derivable, verifiable, and deep-links to the category's records
 * (DESIGN.md rule 1). No AI, no invented economics: this is app-computed truth
 * with an AI narrative layered on top later if the user generates one.
 */

export const MONEY_LEAK_MIN_MONTHS = 3;
/** A category must spend at least this much above its median to be a leak. Minor units. */
export const MONEY_LEAK_MIN_EXCESS_MINOR = 15_000; // ₹150
/** ... and at least 50% above the median. */
export const MONEY_LEAK_MIN_RATIO = 1.5;

/** Categories monitored for leaks (discretionary spend; never essentials/income). */
export const MONEY_LEAK_CATEGORIES = [
  "Food",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Other",
] as const;

/** Up to this many leaks shown before "noise" crowds the card. */
export const MONEY_LEAK_LIMIT = 5;

export interface MoneyLeak {
  categoryId: string;
  label: string;
  /** Full-month equivalent spend for the current period, minor units. */
  currentMonthlyMinor: number;
  /** Median of the user's recent full months for this category, minor units. */
  typicalMonthlyMinor: number;
  /** current - typical, minor units; the amount returning to normal recovers. */
  potentialSavingsMinor: number;
  /** Months of history used for the typical value. */
  monthsAnalyzed: number;
}

export interface MoneyLeakReport {
  status: "available" | "insufficient-data";
  /** Whether these is at least one detected leak; empty when identified none. */
  hasLeaks: boolean;
  /** Sorted by potential savings (most savings first), capped at MONEY_LEAK_LIMIT. */
  leaks: readonly MoneyLeak[];
  /** Sum of potentialSavingsMinor across detected leaks. */
  totalMonthlySavingsMinor: number;
  /** totalMonthlySavingsMinor * 12. */
  totalAnnualSavingsMinor: number;
  monthsAnalyzed: number;
}

export interface MoneyLeakInput {
  /** Full-month equivalent spend per category for the current period, minor units. */
  currentMonthlySpendByCategory: Readonly<Record<string, number>>;
  /**
   * Zero-padded monthly totals per category for the trailing window, most
   * recent last. Each bucket is a calendar month (YYYY-MM).
   */
  historyMonthlyTotals: readonly { categoryId: string; month: string; totalMinor: number }[];
  /** Optional anchor for the report; unused by the engine but retained metadata. */
  period?: ResolvedPeriod;
}

function median(values: readonly number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

export function computeMoneyLeaks(input: MoneyLeakInput): MoneyLeakReport {
  // Build per-category monthly series, latest-first to match zero-padding.
  const byCategory = new Map<string, { month: string; totalMinor: number }[]>();
  for (const entry of input.historyMonthlyTotals) {
    const list = byCategory.get(entry.categoryId) ?? [];
    list.push({ month: entry.month, totalMinor: entry.totalMinor });
    byCategory.set(entry.categoryId, list);
  }

  let maxMonthsAnalyzed = 0;
  const leaks: MoneyLeak[] = [];

  for (const categoryId of MONEY_LEAK_CATEGORIES) {
    const current = input.currentMonthlySpendByCategory[categoryId] ?? 0;
    if (current <= 0) continue;

    const months = (byCategory.get(categoryId) ?? []).sort((a, b) =>
      a.month.localeCompare(b.month),
    );
    if (months.length < MONEY_LEAK_MIN_MONTHS) continue;
    maxMonthsAnalyzed = Math.max(maxMonthsAnalyzed, months.length);

    const typical = median(months.map((m) => m.totalMinor));
    if (typical <= 0) continue;

    const ratio = current / typical;
    const excess = current - typical;
    if (ratio < MONEY_LEAK_MIN_RATIO || excess < MONEY_LEAK_MIN_EXCESS_MINOR) continue;

    const definition = CATEGORY_REGISTRY[categoryId as keyof typeof CATEGORY_REGISTRY];
    leaks.push({
      categoryId,
      label: definition?.label ?? categoryId,
      currentMonthlyMinor: current,
      typicalMonthlyMinor: Math.round(typical),
      potentialSavingsMinor: excess,
      monthsAnalyzed: months.length,
    });
  }

  leaks.sort((a, b) => b.potentialSavingsMinor - a.potentialSavingsMinor);
  const top = leaks.slice(0, MONEY_LEAK_LIMIT);

  const totalMonthlyMinor = top.reduce((sum, leak) => sum + leak.potentialSavingsMinor, 0);

  return {
    status: maxMonthsAnalyzed >= MONEY_LEAK_MIN_MONTHS ? "available" : "insufficient-data",
    hasLeaks: top.length > 0,
    leaks: top,
    totalMonthlySavingsMinor: totalMonthlyMinor,
    totalAnnualSavingsMinor: totalMonthlyMinor * 12,
    monthsAnalyzed: maxMonthsAnalyzed,
  };
}