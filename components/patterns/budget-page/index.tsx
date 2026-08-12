"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { SetBudgetDialog } from "@/components/patterns/set-budget-dialog";
import { BudgetWarnings } from "./budget-warnings";
import { BudgetHero } from "./budget-hero";
import { ForecastCard } from "./forecast-card";
import { MonthlyRemaining } from "./monthly-remaining";
import { CategoryBreakdown } from "./category-breakdown";
import { AISuggestions } from "./ai-suggestions";
import { calculateForecast, generateAISuggestions } from "./utils";
import type { BudgetPageProps } from "./types";

export function BudgetPage({
  budget,
  categoryBreakdown,
  currency,
  resolvedPeriod,
}: BudgetPageProps) {
  const router = useRouter();
  const hasBudget =
    budget.status === "on-track" ||
    budget.status === "approaching" ||
    budget.status === "exceeded";

  const spentMinor = hasBudget
    ? budget.status === "exceeded"
      ? budget.budgetMinor + budget.excessMinor
      : budget.budgetMinor - budget.remainingMinor
    : 0;

  const forecast = useMemo(
    () => calculateForecast(spentMinor, resolvedPeriod),
    [spentMinor, resolvedPeriod],
  );

  const suggestions = useMemo(
    () => generateAISuggestions(budget, forecast, categoryBreakdown),
    [budget, forecast, categoryBreakdown],
  );

  return (
    <div className="grid gap-6">
      <header className="flex min-w-0 flex-wrap items-center justify-between gap-3">
        <h1 className="text-display-2xl font-bold tracking-tight text-foreground">Budget</h1>
        <SetBudgetDialog
          currency={currency}
          label={hasBudget ? "Update budget" : "Set budget"}
          onSaved={() => router.refresh()}
        />
      </header>

      <BudgetWarnings budget={budget} forecast={forecast} currency={currency} />

      <BudgetHero budget={budget} currency={currency} forecast={forecast} />

      <div className="grid gap-6 lg:grid-cols-2">
        <ForecastCard forecast={forecast} budget={budget} currency={currency} />
        <MonthlyRemaining budget={budget} forecast={forecast} currency={currency} />
      </div>

      <CategoryBreakdown categoryBreakdown={categoryBreakdown} currency={currency} />

      <AISuggestions suggestions={suggestions} />
    </div>
  );
}
