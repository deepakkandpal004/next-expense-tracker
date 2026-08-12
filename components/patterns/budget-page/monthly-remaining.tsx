"use client";

import { motion } from "motion/react";
import { Calendar, Clock, Target, TrendingUp, Wallet } from "lucide-react";
import { cn } from "@/lib/ui/cn";
import { MOTION_DURATION, MOTION_EASE } from "@/lib/ui/motion";
import { formatCurrency } from "@/lib/formatters/locale";
import type { BudgetMetric } from "@/lib/domain/types";
import type { ForecastData } from "./types";

export function MonthlyRemaining({
  budget,
  forecast,
  currency,
}: {
  budget: BudgetMetric;
  forecast: ForecastData;
  currency: string;
}) {
  const hasBudget =
    budget.status === "on-track" ||
    budget.status === "approaching" ||
    budget.status === "exceeded";

  if (!hasBudget) return null;

  const remainingMinor =
    budget.status === "exceeded" ? -budget.excessMinor : budget.remainingMinor;

  const dailyAllowance =
    forecast.daysRemaining > 0 ? Math.round(remainingMinor / forecast.daysRemaining) : 0;

  const stats = [
    {
      label: "Days remaining",
      value: forecast.daysRemaining.toString(),
      icon: Calendar,
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      label: "Money left",
      value: formatCurrency({ minorValue: Math.max(remainingMinor, 0), currency }),
      icon: Wallet,
      color: remainingMinor >= 0 ? "text-kpi-income" : "text-danger",
      bg: remainingMinor >= 0 ? "bg-kpi-income-surface" : "bg-danger-surface",
    },
    {
      label: "Daily allowance",
      value: formatCurrency({ minorValue: Math.max(dailyAllowance, 0), currency }),
      icon: Target,
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      label: "Daily rate",
      value: formatCurrency({ minorValue: Math.round(forecast.dailyRate), currency }),
      icon: TrendingUp,
      color: forecast.dailyRate > dailyAllowance ? "text-danger" : "text-kpi-income",
      bg: forecast.dailyRate > dailyAllowance ? "bg-danger-surface" : "bg-kpi-income-surface",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: MOTION_DURATION.standard, ease: MOTION_EASE.emphasized, delay: 0.2 }}
      className="rounded-2xl border border-border/60 bg-surface p-5 shadow-premium-sm"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
          <Clock size={16} className="text-accent" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">Monthly Overview</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: MOTION_DURATION.standard, delay: index * 0.08 }}
              className="rounded-xl bg-surface-subtle p-3"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={cn("flex h-6 w-6 items-center justify-center rounded-md", stat.bg)}>
                  <Icon size={12} className={stat.color} />
                </div>
                <span className="text-xs text-foreground-secondary">{stat.label}</span>
              </div>
              <p className="text-lg font-bold text-foreground tabular-nums">{stat.value}</p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
