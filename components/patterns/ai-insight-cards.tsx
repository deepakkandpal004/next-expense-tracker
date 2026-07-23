"use client";

import { motion } from "motion/react";
import {
  AlertCircle,
  ArrowUpRight,
  Brain,
  ChefHat,
  CreditCard,
  DollarSign,
  Flame,
  Lightbulb,
  PiggyBank,
  Shield,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/ui/cn";
import { formatCurrency, formatPercentage } from "@/lib/formatters/locale";
import type { CategoryBreakdownRow } from "@/lib/domain/types";

export interface AIInsightCardProps {
  title: string;
  description: string;
  type: "positive" | "warning" | "info" | "celebration" | "tip";
  icon?: ReactNode;
  iconBg?: string;
  iconColor?: string;
  metric?: {
    label: string;
    value: string | number;
    trend?: "up" | "down" | "neutral";
  };
  action?: {
    label: string;
    href: string;
    icon?: ReactNode;
  };
  badge?: string;
  className?: string;
}

const TYPE_STYLES: Record<
  AIInsightCardProps["type"],
  { gradient: string; border: string; iconBg: string; iconColor: string; badgeClass: string }
> = {
  positive: {
    gradient: "bg-surface",
    border: "border-border/50",
    iconBg: "bg-success-surface",
    iconColor: "text-success",
    badgeClass: "badge-premium--success",
  },
  warning: {
    gradient: "bg-surface",
    border: "border-border/50",
    iconBg: "bg-warning-surface",
    iconColor: "text-warning",
    badgeClass: "badge-premium--warning",
  },
  info: {
    gradient: "bg-surface",
    border: "border-border/50",
    iconBg: "bg-info-surface",
    iconColor: "text-info",
    badgeClass: "badge-premium--info",
  },
  celebration: {
    gradient: "bg-surface",
    border: "border-border/50",
    iconBg: "bg-success-surface",
    iconColor: "text-success",
    badgeClass: "badge-premium--success",
  },
  tip: {
    gradient: "bg-surface",
    border: "border-border/50",
    iconBg: "bg-info-surface",
    iconColor: "text-info",
    badgeClass: "badge-premium--info",
  },
};

const TYPE_ICONS: Record<AIInsightCardProps["type"], ReactNode> = {
  positive: <TrendingUp size={20} strokeWidth={2.2} />,
  warning: <AlertCircle size={20} strokeWidth={2.2} />,
  info: <Lightbulb size={20} strokeWidth={2.2} />,
  celebration: <Target size={20} strokeWidth={2.2} />,
  tip: <Brain size={20} strokeWidth={2.2} />,
};

export function AIInsightCard({
  title,
  description,
  type,
  icon,
  iconBg,
  iconColor,
  metric,
  action,
  badge,
  className,
}: AIInsightCardProps) {
  const styles = TYPE_STYLES[type];
  const Icon = icon || TYPE_ICONS[type];

  return (
    <motion.article
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:shadow-lg",
        styles.gradient,
        styles.border,
        className,
      )}
    >
      <div className="relative flex items-start gap-4">
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            iconBg || styles.iconBg,
            iconColor || styles.iconColor,
          )}
          aria-hidden="true"
        >
          {Icon}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-interface-sm font-semibold text-foreground">{title}</h3>
              {badge && (
                <span className={cn("mt-1.5 inline-block", styles.badgeClass)}>
                  {badge}
                </span>
              )}
            </div>
            {metric && (
              <div className="flex-shrink-0 text-right">
                <p className="financial-value text-lg font-bold text-foreground tabular-nums">
                  {metric.value}
                </p>
                <p className="text-interface-xs text-foreground-secondary">{metric.label}</p>
                {metric.trend && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 mt-0.5 text-interface-xs font-medium",
                      metric.trend === "up" && "text-success",
                      metric.trend === "down" && "text-danger",
                      metric.trend === "neutral" && "text-foreground-secondary",
                    )}
                  >
                    {metric.trend === "up" && <TrendingUp size={12} strokeWidth={2.5} />}
                    {metric.trend === "down" && <TrendingDown size={12} strokeWidth={2.5} />}
                    {metric.trend === "up" ? "Improving" : metric.trend === "down" ? "Declining" : "Stable"}
                  </span>
                )}
              </div>
            )}
          </div>
          <p className="mt-2 text-interface-sm text-foreground-secondary leading-relaxed">{description}</p>
          {action && (
            <a
              href={action.href}
              className="mt-4 inline-flex items-center gap-1.5 text-interface-sm font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              {action.label}
              {action.icon || <ArrowUpRight size={14} strokeWidth={2.5} />}
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}

export function generateAIInsights(data: {
  currency: string;
  balance: number;
  income: number;
  expense: number;
  savings: number;
  savingsRate: number;
  categoryBreakdown: readonly CategoryBreakdownRow[];
  previousPeriodExpense: number;
  previousPeriodIncome: number;
  budget?: {
    status: "on-track" | "approaching" | "exceeded" | "unavailable" | "not-set";
    budgetMinor: number;
    remainingMinor: number;
    excessMinor: number;
  };
  daysSinceLastEntry: number;
  topCategory?: CategoryBreakdownRow;
  topCategoryChange?: number;
  highestExpense?: { amount: number; category: string; date: string };
}): AIInsightCardProps[] {
  const insights: AIInsightCardProps[] = [];
  const { currency, income, expense, savings, savingsRate, categoryBreakdown, previousPeriodExpense, previousPeriodIncome, budget, daysSinceLastEntry, topCategory, topCategoryChange, highestExpense } = data;

  const expenseChangePercent = previousPeriodExpense > 0 ? ((expense - previousPeriodExpense) / previousPeriodExpense) * 100 : 0;
  const incomeChangePercent = previousPeriodIncome > 0 ? ((income - previousPeriodIncome) / previousPeriodIncome) * 100 : 0;

  if (expenseChangePercent > 15) {
    insights.push({
      title: "Spending Increased Significantly",
      description: `Your expenses are up ${Math.abs(expenseChangePercent).toFixed(0)}% compared to last period. Review your top categories to find savings opportunities.`,
      type: "warning",
      icon: <TrendingUp size={20} strokeWidth={2.2} />,
      iconBg: "bg-warning-surface",
      iconColor: "text-warning",
      metric: { label: "vs Last Period", value: `+${expenseChangePercent.toFixed(0)}%`, trend: "down" },
      badge: "Attention Needed",
      action: { label: "View Categories", href: "/ai-insights?focus=categories" },
    });
  } else if (expenseChangePercent < -10) {
    insights.push({
      title: "Great Job Reducing Spending!",
      description: `You've spent ${Math.abs(expenseChangePercent).toFixed(0)}% less than last period. Your disciplined approach is paying off.`,
      type: "celebration",
      metric: { label: "vs Last Period", value: `${expenseChangePercent.toFixed(0)}%`, trend: "up" },
      badge: "Achievement",
    });
  }

  if (savingsRate >= 20) {
    insights.push({
      title: "Excellent Savings Rate",
      description: `You're saving ${formatPercentage(savingsRate / 100)} of your income — well above the recommended 20%. Keep building that financial cushion!`,
      type: "positive",
      icon: <PiggyBank size={20} strokeWidth={2.2} />,
      metric: { label: "Savings Rate", value: formatPercentage(savingsRate / 100), trend: "up" },
      badge: "On Track",
    });
  } else if (savingsRate > 0 && savingsRate < 10) {
    insights.push({
      title: "Low Savings Rate",
      description: `You're only saving ${formatPercentage(savingsRate / 100)} of your income. Try reducing discretionary spending or setting up automatic transfers to boost savings.`,
      type: "warning",
      icon: <Wallet size={20} strokeWidth={2.2} />,
      metric: { label: "Savings Rate", value: formatPercentage(savingsRate / 100), trend: "down" },
      badge: "Action Recommended",
      action: { label: "Set Savings Goal", href: "/goals" },
    });
  } else if (savingsRate <= 0) {
    insights.push({
      title: "Spending Exceeds Income",
      description: `Your expenses (${formatCurrency({ minorValue: expense, currency })}) exceed your income (${formatCurrency({ minorValue: income, currency })}). This isn't sustainable — review your budget immediately.`,
      type: "warning",
      icon: <AlertCircle size={20} strokeWidth={2.2} />,
      metric: { label: "Deficit", value: formatCurrency({ minorValue: Math.abs(savings), currency }), trend: "down" },
      badge: "Urgent",
      action: { label: "Review Budget", href: "/budgets" },
    });
  }

  if (topCategory && topCategoryChange !== undefined && Math.abs(topCategoryChange) > 20) {
    const isIncrease = topCategoryChange > 0;
    insights.push({
      title: `${topCategory.label} Spending ${isIncrease ? "Surged" : "Dropped"}`,
      description: `Your ${topCategory.label.toLowerCase()} spending ${isIncrease ? "increased" : "decreased"} by ${Math.abs(topCategoryChange).toFixed(0)}% this period. ${isIncrease ? "Consider setting a category budget." : "Great job cutting back!"}`,
      type: isIncrease ? "warning" : "positive",
      icon: isIncrease ? <Flame size={20} strokeWidth={2.2} /> : <TrendingDown size={20} strokeWidth={2.2} />,
      iconBg: isIncrease ? "bg-warning-surface" : "bg-kpi-income-surface",
      iconColor: isIncrease ? "text-warning" : "text-kpi-income",
      metric: { label: topCategory.label, value: formatCurrency({ minorValue: topCategory.amountMinor, currency }), trend: isIncrease ? "down" : "up" },
      badge: isIncrease ? "Review Needed" : "Improving",
      action: { label: "Set Category Budget", href: "/budgets" },
    });
  }

  if (budget) {
    if (budget.status === "exceeded") {
      insights.push({
        title: "Budget Exceeded",
        description: `You've gone ${formatCurrency({ minorValue: budget.excessMinor, currency })} over your ${formatCurrency({ minorValue: budget.budgetMinor, currency })} monthly budget. Consider adjusting spending or increasing your budget.`,
        type: "warning",
        icon: <CreditCard size={20} strokeWidth={2.2} />,
        metric: { label: "Over Budget", value: formatCurrency({ minorValue: budget.excessMinor, currency }), trend: "down" },
        badge: "Over Limit",
        action: { label: "Adjust Budget", href: "/budgets" },
      });
    } else if (budget.status === "approaching") {
      const usedPercent = (budget.budgetMinor - budget.remainingMinor) / budget.budgetMinor;
      insights.push({
        title: "Approaching Budget Limit",
        description: `You've used ${formatPercentage(usedPercent)} of your monthly budget. ${formatCurrency({ minorValue: budget.remainingMinor, currency })} remaining.`,
        type: "info",
        icon: <Target size={20} strokeWidth={2.2} />,
        metric: { label: "Budget Used", value: formatPercentage(usedPercent), trend: "neutral" },
        badge: "Monitor",
      });
    } else if (budget.status === "on-track") {
      const usedPercent = (budget.budgetMinor - budget.remainingMinor) / budget.budgetMinor;
      insights.push({
        title: "Budget On Track",
        description: `You're doing well — only ${formatPercentage(usedPercent)} of your budget used with ${formatCurrency({ minorValue: budget.remainingMinor, currency })} to spare.`,
        type: "positive",
        icon: <Shield size={20} strokeWidth={2.2} />,
        metric: { label: "Remaining", value: formatCurrency({ minorValue: budget.remainingMinor, currency }), trend: "up" },
        badge: "Healthy",
      });
    }
  }

  if (daysSinceLastEntry > 3) {
    insights.push({
      title: "No Recent Entries",
      description: `You haven't logged an expense in ${daysSinceLastEntry} days. Regular tracking helps you stay on top of your finances and catch unusual charges early.`,
      type: "tip",
      icon: <Brain size={20} strokeWidth={2.2} />,
      badge: "Reminder",
      action: { label: "Add Transaction", href: "/records?addTransaction=1" },
    });
  }

  if (highestExpense) {
    insights.push({
      title: "Highest Single Expense",
      description: `Your largest expense this period was ${formatCurrency({ minorValue: highestExpense.amount, currency })} for ${highestExpense.category} on ${new Date(highestExpense.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}.`,
      type: "info",
      icon: <DollarSign size={20} strokeWidth={2.2} />,
      metric: { label: "Largest Expense", value: formatCurrency({ minorValue: highestExpense.amount, currency }), trend: "neutral" },
      badge: "Notable",
    });
  }

  if (incomeChangePercent > 10) {
    insights.push({
      title: "Income Growth Detected",
      description: `Your income increased by ${incomeChangePercent.toFixed(0)}% compared to last period. Consider allocating the extra toward savings or debt paydown.`,
      type: "positive",
      icon: <ArrowUpRight size={20} strokeWidth={2.2} />,
      metric: { label: "Income Growth", value: `+${incomeChangePercent.toFixed(0)}%`, trend: "up" },
      badge: "Good News",
    });
  }

  if (categoryBreakdown.length > 0) {
    const foodCategory = categoryBreakdown.find((c) => c.categoryId === "Food");
    if (foodCategory && foodCategory.percentage > 0.35) {
      insights.push({
        title: "High Food Spending",
        description: `Food accounts for ${formatPercentage(foodCategory.percentage)} of your expenses (${formatCurrency({ minorValue: foodCategory.amountMinor, currency })}). Meal planning could save you significantly.`,
        type: "tip",
        icon: <ChefHat size={20} strokeWidth={2.2} />,
        metric: { label: "Food %", value: formatPercentage(foodCategory.percentage), trend: "neutral" },
        badge: "Optimization",
        action: { label: "Set Food Budget", href: "/budgets" },
      });
    }
  }

  if (insights.length === 0) {
    insights.push({
      title: "All Looks Good",
      description: "Your spending patterns are within normal ranges. No immediate actions needed — keep up the good habits!",
      type: "positive",
      icon: <Shield size={20} strokeWidth={2.2} />,
      badge: "Healthy",
    });
  }

  return insights.slice(0, 2);
}