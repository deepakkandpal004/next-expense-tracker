"use client";

import { motion } from "motion/react";
import { Calendar, TrendingUp, Wallet } from "lucide-react";
import { cn } from "@/lib/ui/cn";
import { CurrencyText } from "@/components/ui";
import { MOTION_DURATION, MOTION_EASE } from "@/lib/ui/motion";
import type { BudgetMetric } from "@/lib/domain/types";
import { CircularProgress } from "./circular-progress";
import type { ForecastData } from "./types";

export function BudgetHero({
  budget,
  currency,
  forecast,
}: {
  budget: BudgetMetric;
  currency: string;
  forecast: ForecastData;
}) {
  const hasBudget =
    budget.status === "on-track" ||
    budget.status === "approaching" ||
    budget.status === "exceeded";

  if (!hasBudget) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: MOTION_DURATION.slow, ease: MOTION_EASE.emphasized }}
        className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface-subtle/30 px-6 py-16 text-center"
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-surface-subtle mb-4">
          <Wallet size={32} className="text-foreground-secondary" strokeWidth={1.5} />
        </div>
        <h2 className="text-lg font-semibold text-foreground">No budget set</h2>
        <p className="mt-2 max-w-sm text-sm text-foreground-secondary">
          Set a monthly budget to track your spending and stay on top of your finances.
        </p>
      </motion.div>
    );
  }

  const spentMinor =
    budget.status === "exceeded"
      ? budget.budgetMinor + budget.excessMinor
      : budget.budgetMinor - budget.remainingMinor;

  const remainingMinor =
    budget.status === "exceeded" ? -budget.excessMinor : budget.remainingMinor;

  const isExceeded = budget.status === "exceeded";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: MOTION_DURATION.slow, ease: MOTION_EASE.emphasized }}
      className="rounded-2xl border border-border/60 bg-surface p-6 shadow-premium-sm"
    >
      <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start">
        <div className="flex flex-col items-center gap-4">
          <CircularProgress
            value={budget.utilization}
            status={budget.status}
          />
          <div className="text-center">
            <p className="text-xs text-foreground-secondary">
              {budget.status === "exceeded" ? "Over budget" : "Under budget"}
            </p>
          </div>
        </div>

        <div className="flex-1 space-y-4 text-center lg:text-left">
          <div>
            <h2 className="text-sm font-semibold text-foreground-secondary">Monthly Budget</h2>
            <p className="mt-1 text-3xl font-bold text-foreground tabular-nums">
              <CurrencyText currency={currency} minorValue={budget.budgetMinor} />
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 lg:justify-start">
            <div className="rounded-xl bg-surface-subtle px-4 py-3">
              <p className="text-xs text-foreground-secondary">Spent</p>
              <p className="text-lg font-bold text-foreground tabular-nums">
                <CurrencyText currency={currency} minorValue={spentMinor} />
              </p>
            </div>
            <div className={cn(
              "rounded-xl px-4 py-3",
              isExceeded ? "bg-danger-surface" : "bg-kpi-income-surface",
            )}>
              <p className={cn(
                "text-xs",
                isExceeded ? "text-danger-foreground" : "text-kpi-income-foreground",
              )}>
                {isExceeded ? "Over" : "Remaining"}
              </p>
              <p className={cn(
                "text-lg font-bold tabular-nums",
                isExceeded ? "text-danger" : "text-kpi-income",
              )}>
                <CurrencyText currency={currency} minorValue={Math.abs(remainingMinor)} />
              </p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-sm text-foreground-secondary lg:justify-start">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} />
              <span>{forecast.daysRemaining} days left</span>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp size={14} />
              <span>
                <CurrencyText currency={currency} minorValue={Math.round(forecast.dailyRate)} />/day
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
