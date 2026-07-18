"use client";

import { motion } from "motion/react";
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Wallet,
  Calendar,
  Clock,
  Target,
  Lightbulb,
  Info,
} from "lucide-react";
import { useMemo } from "react";
import { cn } from "@/lib/ui/cn";
import { CurrencyText } from "@/components/ui";
import { CATEGORY_REGISTRY } from "@/lib/domain/categories";
import { formatCurrency, formatPercentage } from "@/lib/formatters/locale";
import {
  listContainerVariants,
  listItemVariants,
  MOTION_DURATION,
  MOTION_EASE,
} from "@/lib/ui/motion";
import type { BudgetMetric, CategoryBreakdownRow, ResolvedPeriod } from "@/lib/domain/types";

/* ────────────────────────────────────────────────────────────
   TYPES
   ──────────────────────────────────────────────────────────── */

export interface BudgetPageProps {
  budget: BudgetMetric;
  categoryBreakdown: readonly CategoryBreakdownRow[];
  currency: string;
  resolvedPeriod: ResolvedPeriod;
}

interface ForecastData {
  projectedTotal: number;
  dailyRate: number;
  daysRemaining: number;
  daysInPeriod: number;
  daysElapsed: number;
  onPace: boolean;
}

interface AISuggestion {
  type: "tip" | "warning" | "insight";
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

/* ────────────────────────────────────────────────────────────
   UTILITY FUNCTIONS
   ──────────────────────────────────────────────────────────── */

function calculateForecast(
  spentMinor: number,
  period: ResolvedPeriod,
): ForecastData {
  const now = new Date();
  const startDate = new Date(period.start);
  const endDate = new Date(period.end);

  const totalDays = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
  );
  const elapsedDays = Math.max(
    1,
    Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
  );
  const remainingDays = Math.max(0, totalDays - elapsedDays);

  const dailyRate = spentMinor / elapsedDays;
  const projectedTotal = dailyRate * totalDays;

  return {
    projectedTotal,
    dailyRate,
    daysRemaining: remainingDays,
    daysInPeriod: totalDays,
    daysElapsed: elapsedDays,
    onPace: projectedTotal <= spentMinor * 1.1,
  };
}

function generateAISuggestions(
  budget: BudgetMetric,
  forecast: ForecastData,
  categoryBreakdown: readonly CategoryBreakdownRow[],
): AISuggestion[] {
  const suggestions: AISuggestion[] = [];

  if (budget.status === "exceeded") {
    suggestions.push({
      type: "warning",
      title: "Budget exceeded",
      description: `You've exceeded your budget by ${formatCurrency({ minorValue: budget.excessMinor, currency: budget.currency })}. Consider reducing spending in the remaining days.`,
      icon: AlertTriangle,
    });
  } else if (budget.status === "approaching") {
    suggestions.push({
      type: "warning",
      title: "Approaching limit",
      description: `You've used ${formatPercentage(budget.utilization)} of your budget with ${forecast.daysRemaining} days remaining. Pace yourself carefully.`,
      icon: AlertTriangle,
    });
  }

  if (forecast.dailyRate > 0 && forecast.daysRemaining > 0) {
    const topCategory = categoryBreakdown[0];
    if (topCategory && topCategory.percentage > 0.4) {
      suggestions.push({
        type: "insight",
        title: "Category concentration",
        description: `${topCategory.label} accounts for ${formatPercentage(topCategory.percentage)} of spending. Diversifying could help balance your budget.`,
        icon: Info,
      });
    }
  }

  if (budget.status === "on-track" && forecast.daysRemaining > 7) {
    suggestions.push({
      type: "tip",
      title: "On track",
      description: "Great job! You're within budget with time to spare. Consider setting aside savings for unexpected expenses.",
      icon: Lightbulb,
    });
  }

  if (forecast.daysRemaining <= 5 && budget.status !== "exceeded") {
    suggestions.push({
      type: "tip",
      title: "Month ending soon",
      description: `${forecast.daysRemaining} days left. ${budget.status === "approaching" ? "Be mindful of spending." : "You're doing well!"}`,
      icon: Clock,
    });
  }

  return suggestions;
}

/* ────────────────────────────────────────────────────────────
   CIRCULAR PROGRESS RING
   ──────────────────────────────────────────────────────────── */

function CircularProgress({
  value,
  size = 180,
  strokeWidth = 12,
  status,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  status: BudgetMetric["status"];
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value, 1);
  const strokeDashoffset = circumference * (1 - progress);

  const colorMap = {
    "on-track": "stroke-kpi-income",
    approaching: "stroke-warning",
    exceeded: "stroke-danger",
    "not-configured": "stroke-foreground-secondary/30",
    unavailable: "stroke-foreground-secondary/30",
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        className="rotate-[-90deg]"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-surface-subtle"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={colorMap[status]}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-foreground tabular-nums">
          {Math.round(progress * 100)}%
        </span>
        <span className="text-xs text-foreground-secondary">used</span>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   BUDGET HERO
   ──────────────────────────────────────────────────────────── */

function BudgetHero({
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

/* ────────────────────────────────────────────────────────────
   FORECAST CARD
   ──────────────────────────────────────────────────────────── */

function ForecastCard({
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

/* ────────────────────────────────────────────────────────────
   CATEGORY BREAKDOWN
   ──────────────────────────────────────────────────────────── */

function CategoryBreakdown({
  categoryBreakdown,
  currency,
}: {
  categoryBreakdown: readonly CategoryBreakdownRow[];
  currency: string;
}) {
  if (categoryBreakdown.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: MOTION_DURATION.standard, ease: MOTION_EASE.emphasized, delay: 0.2 }}
      className="rounded-2xl border border-border/60 bg-surface p-5 shadow-premium-sm"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
          <Target size={16} className="text-accent" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">Spending by Category</h3>
      </div>

      <motion.div
        animate="visible"
        initial="hidden"
        variants={listContainerVariants}
        className="space-y-2"
      >
        {categoryBreakdown.map((row, index) => {
          const categoryDef = CATEGORY_REGISTRY[row.categoryId as keyof typeof CATEGORY_REGISTRY];
          const color = `var(--color-${row.semanticToken})`;
          const percentage = Math.round(row.percentage * 100);

          return (
            <motion.div
              key={row.categoryId}
              variants={listItemVariants}
              className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-surface-subtle"
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{
                  backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
                }}
              >
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground truncate">
                    {categoryDef?.label ?? row.categoryId}
                  </span>
                  <span className="text-sm font-semibold text-foreground tabular-nums">
                    <CurrencyText currency={currency} minorValue={row.amountMinor} />
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-subtle">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: color }}
                      initial={{ width: "0%" }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.6, delay: index * 0.05 + 0.3, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                  <span className="text-xs text-foreground-secondary tabular-nums w-10 text-right">
                    {percentage}%
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────
   BUDGET WARNINGS
   ──────────────────────────────────────────────────────────── */

function BudgetWarnings({
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
      tone: budget.status === "on-track" ? "warning" : "warning",
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

/* ────────────────────────────────────────────────────────────
   AI SUGGESTIONS
   ──────────────────────────────────────────────────────────── */

function AISuggestions({
  suggestions,
}: {
  suggestions: AISuggestion[];
}) {
  if (suggestions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: MOTION_DURATION.standard, ease: MOTION_EASE.emphasized, delay: 0.25 }}
      className="rounded-2xl border border-border/60 bg-surface p-5 shadow-premium-sm"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
          <Lightbulb size={16} className="text-accent" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">AI Suggestions</h3>
      </div>

      <div className="space-y-3">
        {suggestions.map((suggestion, index) => {
          const Icon = suggestion.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: MOTION_DURATION.standard, delay: index * 0.08 }}
              className="flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-surface-subtle"
            >
              <div className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                suggestion.type === "warning"
                  ? "bg-warning-surface"
                  : suggestion.type === "insight"
                    ? "bg-info-surface"
                    : "bg-kpi-income-surface",
              )}>
                <Icon
                  size={16}
                  className={cn(
                    suggestion.type === "warning"
                      ? "text-warning"
                      : suggestion.type === "insight"
                        ? "text-info"
                        : "text-kpi-income",
                  )}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{suggestion.title}</p>
                <p className="mt-0.5 text-xs text-foreground-secondary leading-relaxed">
                  {suggestion.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────
   MONTHLY REMAINING
   ──────────────────────────────────────────────────────────── */

function MonthlyRemaining({
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
    forecast.daysRemaining > 0 ? remainingMinor / forecast.daysRemaining : 0;

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

/* ────────────────────────────────────────────────────────────
   MAIN COMPONENT
   ──────────────────────────────────────────────────────────── */

export function BudgetPage({
  budget,
  categoryBreakdown,
  currency,
  resolvedPeriod,
}: BudgetPageProps) {
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
      <header className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-display-xl font-bold text-foreground">Budget</h1>
          <p className="mt-1 text-body text-foreground-secondary">{resolvedPeriod.label}</p>
        </div>
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
