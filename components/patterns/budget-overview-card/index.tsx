"use client";

import { AlertTriangle, CheckCircle2, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/formatters/locale";
import { cn } from "@/lib/ui/cn";
import { SetBudgetDialog } from "@/components/patterns/set-budget-dialog";
import { StatusPill } from "./status";
import { UtilizationBar } from "./utilization-bar";
import { CategoryRow } from "./category-row";
import type { BudgetOverviewCardProps } from "./types";

export { type BudgetOverviewCardProps } from "./types";

export function BudgetOverviewCard({
  budget,
  categoryBreakdown,
  currency,
  onBudgetSaved,
}: BudgetOverviewCardProps) {
  const hasBudget =
    budget.status === "on-track" ||
    budget.status === "approaching" ||
    budget.status === "exceeded";

  const budgetMinor = hasBudget ? budget.budgetMinor : 0;
  const spentMinor = budget.status === "exceeded"
    ? budgetMinor + budget.excessMinor
    : hasBudget
      ? budget.budgetMinor - budget.remainingMinor
      : 0;

  const remainingMinor =
    budget.status === "on-track" || budget.status === "approaching"
      ? budget.remainingMinor
      : budget.status === "exceeded"
        ? -(budget.excessMinor)
        : 0;

  const remainingFormatted = formatCurrency({
    minorValue: Math.abs(remainingMinor),
    currency,
  });

  const isExceeded = budget.status === "exceeded";
  const spentFormatted = formatCurrency({ minorValue: spentMinor, currency });
  const budgetFormatted = formatCurrency({ minorValue: budgetMinor, currency });

  const topCategories = categoryBreakdown.slice(0, 4);

  return (
    <section
      aria-labelledby="budget-overview-title"
      className="relative overflow-hidden glass-vessel"
    >
      <header className="flex items-center justify-between gap-2 px-5 pt-5 pb-4">
        <h2 className="text-sm font-semibold text-foreground" id="budget-overview-title">
          Budget Overview
        </h2>
        <div className="flex items-center gap-2">
          {hasBudget && <StatusPill status={budget.status} />}
          {hasBudget && (
            <SetBudgetDialog currency={currency} label="Update budget" onSaved={onBudgetSaved} />
          )}
        </div>
      </header>

      {!hasBudget ? (
        <div className="px-5 pb-5">
          <div className="flex flex-col items-center rounded-xl border border-dashed border-border-strong py-8 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-subtle mb-3">
              <Wallet size={20} className="text-foreground-secondary" />
            </span>
            <p className="text-sm font-medium text-foreground mb-1">No budget set</p>
            <p className="text-xs text-foreground-secondary mb-3 max-w-[200px]">
              Set a monthly budget to track spending against a target.
            </p>
            <SetBudgetDialog currency={currency} onSaved={onBudgetSaved} />
          </div>
        </div>
      ) : (
        <div className="px-5 pb-5 space-y-4">
          <div className="rounded-xl bg-surface-subtle p-3">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-lg font-bold text-foreground tabular-nums">{spentFormatted}</span>
              <span className="text-xs text-foreground-secondary">of {budgetFormatted}</span>
            </div>
            <UtilizationBar spent={spentMinor} total={budgetMinor} />
          </div>

          <div
            className={cn(
              "flex items-center gap-2 rounded-lg border px-3 py-2",
              isExceeded
                ? "border-danger-border bg-danger-surface"
                : "border-kpi-income-border bg-kpi-income-surface",
            )}
          >
            {isExceeded ? (
              <AlertTriangle size={14} className="text-danger shrink-0" />
            ) : (
              <CheckCircle2 size={14} className="text-kpi-income shrink-0" />
            )}
            <p
              className={cn(
                "text-xs font-medium",
                isExceeded ? "text-danger-foreground" : "text-kpi-income-foreground",
              )}
            >
              {isExceeded
                ? `${remainingFormatted} over budget`
                : `${remainingFormatted} remaining`}
            </p>
          </div>

          {topCategories.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-foreground-secondary mb-2 px-1">
                Top Categories
              </p>
              <div className="space-y-0.5">
                {topCategories.map((row, index) => (
                  <CategoryRow
                    budgetMinor={budgetMinor}
                    currency={currency}
                    index={index}
                    key={row.categoryId}
                    row={row}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
