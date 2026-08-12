"use client";

import { motion } from "motion/react";
import { AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";
import { cn } from "@/lib/ui/cn";
import { CurrencyText } from "@/components/ui";
import { MOTION_DURATION, MOTION_EASE } from "@/lib/ui/motion";
import type { BudgetMetric } from "@/lib/domain/types";
import type { ForecastData } from "./types";

export function ForecastCard({
  forecast,
  budget,
  currency,
}: {
  forecast: ForecastData;
  budget: BudgetMetric;
  currency: string;
}) {
  const hasBudget =
    budget.status === "on-track" ||
    budget.status === "approaching" ||
    budget.status === "exceeded";

  if (!hasBudget) return null;

  const projectionDiff = forecast.projectedTotal - budget.budgetMinor;
  const isOverProjection = projectionDiff > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: MOTION_DURATION.standard, ease: MOTION_EASE.emphasized, delay: 0.1 }}
      className="rounded-2xl border border-border/60 bg-surface p-5 shadow-premium-sm"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
          <TrendingUp size={16} className="text-accent" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">Monthly Forecast</h3>
      </div>

      <div className="space-y-4">
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-foreground-secondary">Projected total</span>
          <span className="text-lg font-bold text-foreground tabular-nums">
            <CurrencyText currency={currency} minorValue={Math.round(forecast.projectedTotal)} />
          </span>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-subtle">
          <motion.div
            className={cn(
              "h-full rounded-full",
              isOverProjection ? "bg-danger" : "bg-kpi-income",
            )}
            initial={{ width: "0%" }}
            animate={{ width: `${Math.min((forecast.projectedTotal / budget.budgetMinor) * 100, 100)}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
          />
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-foreground-secondary">
            {forecast.daysElapsed} of {forecast.daysInPeriod} days elapsed
          </span>
          {isOverProjection ? (
            <span className="flex items-center gap-1 text-danger font-medium">
              <AlertTriangle size={12} />
              <CurrencyText currency={currency} minorValue={Math.round(projectionDiff)} /> over
            </span>
          ) : (
            <span className="flex items-center gap-1 text-kpi-income font-medium">
              <CheckCircle2 size={12} />
              On pace
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
