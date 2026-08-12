"use client";

import { motion } from "motion/react";
import { AlertTriangle, Clock } from "lucide-react";
import { cn } from "@/lib/ui/cn";
import { MOTION_DURATION, MOTION_EASE } from "@/lib/ui/motion";
import { formatCurrency, formatPercentage } from "@/lib/formatters/locale";
import type { BudgetMetric } from "@/lib/domain/types";
import type { ForecastData } from "./types";

export function BudgetWarnings({
  budget,
  forecast,
  currency,
}: {
  budget: BudgetMetric;
  forecast: ForecastData;
  currency: string;
}) {
  const warnings: Array<{
    title: string;
    description: string;
    tone: "warning" | "danger";
    icon: React.ComponentType<{ size?: number; className?: string }>;
  }> = [];

  if (budget.status === "exceeded") {
    warnings.push({
      title: "Budget exceeded",
      description: `You've spent ${formatCurrency({ minorValue: budget.excessMinor, currency })} more than your budget. Consider cutting back for the rest of the month.`,
      tone: "danger",
      icon: AlertTriangle,
    });
  } else if (budget.status === "approaching") {
    warnings.push({
      title: "Approaching limit",
      description: `You've used ${formatPercentage(budget.utilization)} of your budget with ${forecast.daysRemaining} days remaining. Daily spending should be around ${formatCurrency({ minorValue: Math.round(budget.remainingMinor / Math.max(forecast.daysRemaining, 1)), currency })} to stay on track.`,
      tone: "warning",
      icon: AlertTriangle,
    });
  }

  if (forecast.daysRemaining <= 3 && budget.status !== "exceeded") {
    warnings.push({
      title: "Month ending soon",
      description: `Only ${forecast.daysRemaining} day${forecast.daysRemaining === 1 ? "" : "s"} left in the month. ${budget.status === "on-track" ? "Great job staying within budget!" : "Keep an eye on your spending."}`,
      tone: "warning",
      icon: Clock,
    });
  }

  if (warnings.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: MOTION_DURATION.standard, ease: MOTION_EASE.emphasized, delay: 0.15 }}
      className="space-y-3"
    >
      {warnings.map((warning, index) => {
        const Icon = warning.icon;
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: MOTION_DURATION.standard, delay: index * 0.1 }}
            className={cn(
              "flex items-start gap-3 rounded-xl border px-4 py-3",
              warning.tone === "danger"
                ? "border-danger-border bg-danger-surface"
                : "border-warning-border bg-warning-surface",
            )}
          >
            <Icon
              size={18}
              className={cn(
                "mt-0.5 shrink-0",
                warning.tone === "danger" ? "text-danger" : "text-warning",
              )}
            />
            <div>
              <p className={cn(
                "text-sm font-semibold",
                warning.tone === "danger" ? "text-danger-foreground" : "text-warning-foreground",
              )}>
                {warning.title}
              </p>
              <p className={cn(
                "mt-1 text-xs",
                warning.tone === "danger" ? "text-danger-foreground/80" : "text-warning-foreground/80",
              )}>
                {warning.description}
              </p>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
