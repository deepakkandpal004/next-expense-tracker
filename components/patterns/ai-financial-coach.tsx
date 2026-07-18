"use client";

import { motion } from "motion/react";
import {
  ArrowUpRight,
  Brain,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  Lightbulb,
  ChevronRight,
  Zap,
  PiggyBank,
  CreditCard,
  Calendar,
} from "lucide-react";
import { useMemo } from "react";
import { cn } from "@/lib/ui/cn";
import { formatCurrency, formatPercentage } from "@/lib/formatters/locale";
import { listItemVariants } from "@/lib/ui/motion";
import type { DashboardDTO } from "@/lib/domain/dashboard";

/* ────────────────────────────────────────────────────────────
   TYPES
   ──────────────────────────────────────────────────────────── */

export interface AICoachInsight {
  title: string;
  description: string;
  type: "positive" | "warning" | "info" | "celebration";
  confidence: number; // 0-100
  prediction?: {
    label: string;
    value: string;
    trend: "up" | "down" | "flat";
  };
  recommendations: string[];
  monthlySummary: {
    income: number;
    expense: number;
    savings: number;
    transactions: number;
  };
  primaryAction?: { label: string; href: string };
  secondaryAction?: { label: string; href: string };
}

interface AIFinancialCoachProps {
  insight: AICoachInsight;
  currency: string;
  className?: string;
}

/* ────────────────────────────────────────────────────────────
   CONFIDENCE RING
   ──────────────────────────────────────────────────────────── */

function ConfidenceRing({ score }: { score: number }) {
  const size = 44;
  const strokeWidth = 3.5;
  const circumference = 2 * Math.PI * ((size - strokeWidth) / 2);
  const progress = Math.max(0, Math.min(1, score / 100));
  const offset = circumference * (1 - progress);

  let color = "var(--color-kpi-expense)";
  if (score >= 80) color = "var(--color-kpi-income)";
  else if (score >= 60) color = "var(--color-warning)";

  return (
    <div className="relative flex items-center gap-2">
      <div className="relative">
        <svg className="progress-ring -rotate-90" width={size} height={size} aria-hidden="true">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={(size - strokeWidth) / 2}
            strokeWidth={strokeWidth}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.1}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={(size - strokeWidth) / 2}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
            style={{ stroke: color }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[11px] font-bold tabular-nums text-foreground">{score}</span>
        </div>
      </div>
      <span className="text-[10px] font-medium text-foreground-secondary">Confidence</span>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   MONTHLY STAT
   ──────────────────────────────────────────────────────────── */

function MonthlyStat({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-white/5 dark:bg-white/[0.03] px-2.5 py-2">
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
        style={{ background: `${color}15`, color }}
        aria-hidden="true"
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[9px] font-medium text-foreground-secondary uppercase tracking-wider leading-none">
          {label}
        </p>
        <p className="text-xs font-semibold text-foreground tabular-nums leading-none mt-0.5">
          {value}
        </p>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   RECOMMENDATION CHIP
   ──────────────────────────────────────────────────────────── */

function RecommendationChip({ text, index }: { text: string; index: number }) {
  return (
    <motion.div
      className="flex items-start gap-2 rounded-lg border border-border/40 bg-surface/50 px-3 py-2"
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.6 + index * 0.08, ease: [0.16, 1, 0.3, 1] }}
    >
      <Lightbulb
        size={12}
        className="mt-0.5 shrink-0 text-accent"
        strokeWidth={2.5}
      />
      <span className="text-xs text-foreground-secondary leading-relaxed">{text}</span>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────
   MAIN COMPONENT
   ──────────────────────────────────────────────────────────── */

export function AIFinancialCoach({
  insight,
  currency,
  className,
}: AIFinancialCoachProps) {
  const typeConfig = useMemo(() => ({
    positive: {
      gradient: "from-kpi-income/8 via-kpi-balance/4 to-transparent",
      glow: "var(--color-kpi-income)",
      border: "border-kpi-income/20",
      icon: <TrendingUp size={18} strokeWidth={2} />,
      iconColor: "text-kpi-income",
      label: "Financial Health",
    },
    warning: {
      gradient: "from-warning/8 via-kpi-expense/4 to-transparent",
      glow: "var(--color-warning)",
      border: "border-warning/20",
      icon: <Zap size={18} strokeWidth={2} />,
      iconColor: "text-warning",
      label: "Attention Needed",
    },
    info: {
      gradient: "from-info/8 via-accent/4 to-transparent",
      glow: "var(--color-info)",
      border: "border-info/20",
      icon: <Brain size={18} strokeWidth={2} />,
      iconColor: "text-info",
      label: "AI Analysis",
    },
    celebration: {
      gradient: "from-kpi-savings/8 via-accent/4 to-transparent",
      glow: "var(--color-kpi-savings)",
      border: "border-kpi-savings/20",
      icon: <Target size={18} strokeWidth={2} />,
      iconColor: "text-kpi-savings",
      label: "Achievement",
    },
  }), []);

  const config = typeConfig[insight.type];

  const trendIcon = {
    up: <TrendingUp size={12} strokeWidth={2.5} />,
    down: <TrendingDown size={12} strokeWidth={2.5} />,
    flat: <Minus size={12} strokeWidth={2.5} />,
  };

  return (
    <motion.article
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-surface",
        config.border,
        className,
      )}
      variants={listItemVariants}
      initial="hidden"
      animate="visible"
      aria-label="AI Financial Coach"
    >
      {/* Background gradient */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br pointer-events-none",
          config.gradient,
        )}
        aria-hidden="true"
      />

      {/* Glow orb */}
      <motion.div
        className="absolute -top-20 -right-20 w-48 h-48 rounded-full blur-[80px] opacity-20 pointer-events-none"
        aria-hidden="true"
        style={{ background: config.glow }}
        animate={{ opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative p-5">
        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-surface shadow-[0_0_20px_rgb(139_92_246/0.2)]">
              <Sparkles size={18} className="text-accent" strokeWidth={2} />
            </span>
            <div>
              <p className="text-xs font-semibold text-foreground-secondary uppercase tracking-wider">
                AI Financial Coach
              </p>
              <p className="text-[10px] text-foreground-secondary/60">
                Personalized insight for this period
              </p>
            </div>
          </div>
          <ConfidenceRing score={insight.confidence} />
        </div>

        {/* ── Insight ── */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={cn("flex-shrink-0", config.iconColor)} aria-hidden="true">
              {config.icon}
            </span>
            <h3 className="text-base font-semibold text-foreground leading-snug">
              {insight.title}
            </h3>
          </div>
          <p className="text-sm text-foreground-secondary leading-relaxed pl-[30px]">
            {insight.description}
          </p>
        </div>

        {/* ── Prediction ── */}
        {insight.prediction && (
          <motion.div
            className="flex items-center gap-3 rounded-xl border border-border/40 bg-surface/50 px-3.5 py-2.5 mb-4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-surface">
              <Calendar size={14} className="text-accent" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-medium text-foreground-secondary uppercase tracking-wider">
                {insight.prediction.label}
              </p>
              <p className="text-sm font-semibold text-foreground tabular-nums">
                {insight.prediction.value}
              </p>
            </div>
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
                insight.prediction.trend === "up"
                  ? "bg-kpi-expense-surface text-kpi-expense-foreground"
                  : insight.prediction.trend === "down"
                    ? "bg-kpi-income-surface text-kpi-income-foreground"
                    : "bg-surface-subtle text-foreground-secondary",
              )}
            >
              {trendIcon[insight.prediction.trend]}
              {insight.prediction.trend === "up" ? "Rising" : insight.prediction.trend === "down" ? "Falling" : "Stable"}
            </span>
          </motion.div>
        )}

        {/* ── Monthly Summary ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          <MonthlyStat
            icon={<TrendingUp size={12} strokeWidth={2} />}
            label="Income"
            value={formatCurrency({ minorValue: insight.monthlySummary.income, currency })}
            color="var(--color-kpi-income)"
          />
          <MonthlyStat
            icon={<TrendingDown size={12} strokeWidth={2} />}
            label="Expense"
            value={formatCurrency({ minorValue: insight.monthlySummary.expense, currency })}
            color="var(--color-kpi-expense)"
          />
          <MonthlyStat
            icon={<PiggyBank size={12} strokeWidth={2} />}
            label="Savings"
            value={formatCurrency({ minorValue: insight.monthlySummary.savings, currency })}
            color="var(--color-kpi-savings)"
          />
          <MonthlyStat
            icon={<CreditCard size={12} strokeWidth={2} />}
            label="Transactions"
            value={String(insight.monthlySummary.transactions)}
            color="var(--color-primary)"
          />
        </div>

        {/* ── Recommendations ── */}
        {insight.recommendations.length > 0 && (
          <div className="mb-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-foreground-secondary mb-2">
              Recommendations
            </p>
            <div className="space-y-1.5">
              {insight.recommendations.map((rec, i) => (
                <RecommendationChip key={i} text={rec} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* ── CTA Footer ── */}
        {(insight.primaryAction || insight.secondaryAction) && (
          <div className="flex items-center gap-3 pt-2 border-t border-border/30">
            {insight.primaryAction && (
              <a
                href={insight.primaryAction.href}
                className="btn-premium inline-flex items-center gap-1.5"
              >
                {insight.primaryAction.label}
                <ArrowUpRight size={13} strokeWidth={2.5} />
              </a>
            )}
            {insight.secondaryAction && (
              <a
                href={insight.secondaryAction.href}
                className="btn-ghost-premium inline-flex items-center gap-1.5"
              >
                {insight.secondaryAction.label}
                <ChevronRight size={13} strokeWidth={2} />
              </a>
            )}
          </div>
        )}
      </div>
    </motion.article>
  );
}

/* ────────────────────────────────────────────────────────────
   INSIGHT GENERATOR (Pure function, no backend changes)
   ──────────────────────────────────────────────────────────── */

export function generateAICoachInsight(dashboard: DashboardDTO): AICoachInsight {
  const { insights, snapshot, kpis, categoryBreakdown, currency } = dashboard;
  const savingsRate = snapshot.savingsRate * 100;
  const expenseTrend = insights.spending.trend;

  // Determine insight type and content
  let title: string;
  let description: string;
  let type: AICoachInsight["type"];
  let confidence: number;
  let recommendations: string[];
  let primaryAction: AICoachInsight["primaryAction"];
  let secondaryAction: AICoachInsight["secondaryAction"];

  if (expenseTrend && expenseTrend.direction === "up" && expenseTrend.changePercent > 0.2) {
    title = "Spending Spike Detected";
    description = `Your expenses increased ${(expenseTrend.changePercent * 100).toFixed(0)}% vs last period. This trend could impact your savings goals if it continues.`;
    type = "warning";
    confidence = 85;
    recommendations = [
      "Review your top spending categories for unusual charges",
      "Set category budgets to cap discretionary spending",
      "Consider pausing non-essential subscriptions this month",
    ];
    primaryAction = { label: "Analyze Categories", href: "/insights?focus=categories" };
    secondaryAction = { label: "Set Budget", href: "/budgets" };
  } else if (savingsRate >= 25) {
    title = "Exceptional Savings Discipline";
    description = `You're saving ${savingsRate.toFixed(0)}% of your income — well above the 20% benchmark. Your financial trajectory is strong.`;
    type = "celebration";
    confidence = 92;
    recommendations = [
      "Consider investing surplus savings for long-term growth",
      "Build an emergency fund covering 6 months of expenses",
      "Explore tax-saving investment options",
    ];
    primaryAction = { label: "Set Savings Goal", href: "/goals" };
    secondaryAction = { label: "View Trends", href: "/insights" };
  } else if (savingsRate > 0 && savingsRate < 10) {
    title = "Savings Rate Below Target";
    description = `You're saving only ${savingsRate.toFixed(0)}% of income. The 50/30/20 rule suggests 20% for savings. Small adjustments can make a big difference.`;
    type = "warning";
    confidence = 78;
    recommendations = [
      "Track daily spending to identify quick wins",
      "Automate a fixed transfer to savings each payday",
      "Review recurring expenses for cancellation opportunities",
    ];
    primaryAction = { label: "Set Savings Goal", href: "/goals" };
    secondaryAction = { label: "Review Spending", href: "/insights" };
  } else if (kpis.budget.status === "exceeded") {
    title = "Budget Exceeded";
    description = `You're over budget by ${formatCurrency({ minorValue: kpis.budget.excessMinor, currency })}. This month needs attention to get back on track.`;
    type = "warning";
    confidence = 95;
    recommendations = [
      "Identify the top 3 categories driving the overspend",
      "Set a daily spending limit for the rest of the month",
      "Consider increasing your budget if it was set too low",
    ];
    primaryAction = { label: "Adjust Budget", href: "/budgets" };
    secondaryAction = { label: "View Breakdown", href: "/insights?focus=categories" };
  } else if (kpis.budget.status === "approaching") {
    const used = (kpis.budget.budgetMinor - kpis.budget.remainingMinor) / kpis.budget.budgetMinor;
    title = "Approaching Budget Limit";
    description = `You've used ${formatPercentage(used)} of your monthly budget with ${formatCurrency({ minorValue: kpis.budget.remainingMinor, currency })} remaining.`;
    type = "info";
    confidence = 82;
    recommendations = [
      "Slow down discretionary spending for the rest of the period",
      "Prioritize essentials over non-essential purchases",
      "Review if your budget allocation matches your priorities",
    ];
    primaryAction = { label: "View Budget", href: "/budgets" };
  } else if (categoryBreakdown.length > 0 && categoryBreakdown[0].percentage > 0.4) {
    const top = categoryBreakdown[0];
    title = `High ${top.label} Concentration`;
    description = `${top.label} accounts for ${formatPercentage(top.percentage)} of your spending. Diversifying can improve financial resilience.`;
    type = "info";
    confidence = 75;
    recommendations = [
      `Set a specific budget for ${top.label.toLowerCase()}`,
      "Explore alternatives to reduce this category",
      "Track this category weekly to stay aware",
    ];
    primaryAction = { label: "Set Category Budget", href: "/budgets" };
  } else if (snapshot.transactionCount === 0) {
    title = "Start Tracking to Unlock Insights";
    description = "Add your first transaction to see personalized AI insights and build your financial health score.";
    type = "info";
    confidence = 100;
    recommendations = [
      "Log your daily expenses as they happen",
      "Connect recurring bills for automatic tracking",
      "Set a monthly budget to get started",
    ];
    primaryAction = { label: "Add Transaction", href: "/records?addTransaction=1" };
  } else {
    title = "Financial Health Looks Good";
    description = "Your spending patterns are within healthy ranges. Keep tracking consistently to maintain this momentum.";
    type = "positive";
    confidence = 88;
    recommendations = [
      "Continue tracking daily to maintain accuracy",
      "Review your financial health weekly",
      "Set new savings goals to keep improving",
    ];
    primaryAction = { label: "View Dashboard", href: "/dashboard" };
    secondaryAction = { label: "Ask AI a Question", href: "/insights" };
  }

  // Build prediction
  const avgDailyExpense = snapshot.averageDailyExpenseMinor;
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const projectedMonthly = (avgDailyExpense * daysInMonth) / 100;

  const prediction = {
    label: "Projected This Month",
    value: formatCurrency({ minorValue: Math.round(projectedMonthly * 100), currency }),
    trend: expenseTrend?.direction === "up" ? "up" as const : expenseTrend?.direction === "down" ? "down" as const : "flat" as const,
  };

  return {
    title,
    description,
    type,
    confidence,
    prediction,
    recommendations,
    monthlySummary: {
      income: insights.income.currentMinor,
      expense: insights.spending.currentMinor,
      savings: insights.savings.currentMinor,
      transactions: snapshot.transactionCount,
    },
    primaryAction,
    secondaryAction,
  };
}
