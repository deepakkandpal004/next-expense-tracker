"use client";

import { motion } from "motion/react";
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  Brain,
  Flame,
  Minus,
  PiggyBank,
  Target,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/ui/cn";
import { formatCurrency, formatPercentage } from "@/lib/formatters/locale";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { listItemVariants } from "@/lib/ui/motion";
import type { KpiInsight, KpiTrend } from "@/lib/domain/types";

export interface HeroKpiCardProps {
  currency: string;
  balance: KpiInsight;
  income: KpiInsight;
  expense: KpiInsight;
  savings: KpiInsight;
  savingsRate: number;
  snapshot?: {
    daysInPeriod: number;
  };
  aiInsight?: {
    title: string;
    description: string;
    type: "positive" | "warning" | "info" | "celebration";
    actionLabel?: string;
    actionHref?: string;
    secondaryActionLabel?: string;
    secondaryActionHref?: string;
  };
}

/* ────────────────────────────────────────────────────────────
   HELPERS
   ──────────────────────────────────────────────────────────── */

const minorToMajor = (minor: number) => minor / 100;

/* ────────────────────────────────────────────────────────────
   TREND PILL
   ──────────────────────────────────────────────────────────── */

function TrendPill({
  trend,
  invertPolarity,
}: {
  trend: KpiTrend | null;
  invertPolarity: boolean;
}) {
  if (!trend) {
    return (
      <span className="inline-flex items-center gap-0.5 rounded-full bg-surface-subtle px-2 py-0.5 text-[10px] text-foreground-secondary">
        <Minus size={10} strokeWidth={2.5} />
        0%
      </span>
    );
  }

  const percent = Math.abs(trend.changePercent * 100).toFixed(0);
  const isFlat = trend.direction === "flat";
  const isFavourable = invertPolarity
    ? trend.direction === "down"
    : trend.direction === "up";

  const Icon = isFlat ? Minus : trend.direction === "up" ? ArrowUp : ArrowDown;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-medium tabular-nums",
        isFlat
          ? "bg-surface-subtle text-foreground-secondary"
          : isFavourable
            ? "bg-kpi-income-surface text-kpi-income"
            : "bg-kpi-expense-surface text-kpi-expense",
      )}
    >
      <Icon size={10} strokeWidth={2.5} />
      {isFlat ? "0" : percent}%
    </span>
  );
}

/* ────────────────────────────────────────────────────────────
   METRIC CARD (Compact)
   ──────────────────────────────────────────────────────────── */

function MetricCard({
  icon,
  label,
  value,
  trend,
  invertPolarity,
  accentSurface,
  accentForeground,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: KpiTrend | null;
  invertPolarity: boolean;
  accentSurface: string;
  accentForeground: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/40 bg-surface-subtle/50 px-3 py-2.5">
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
        style={{ background: accentSurface, color: accentForeground }}
        aria-hidden="true"
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium text-foreground-secondary uppercase tracking-wider leading-none mb-1">
          {label}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground tabular-nums leading-none">
            {value}
          </span>
          <TrendPill trend={trend} invertPolarity={invertPolarity} />
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   AI INSIGHT CARD (Compact)
   ──────────────────────────────────────────────────────────── */

function AIInsightCard({ insight }: { insight: NonNullable<HeroKpiCardProps["aiInsight"]> }) {
  const iconMap = {
    positive: TrendingUp,
    warning: Zap,
    info: Brain,
    celebration: Target,
  };

  const colorMap = {
    positive: { bg: "bg-kpi-income-surface", text: "text-kpi-income" },
    warning: { bg: "bg-warning-surface", text: "text-warning" },
    info: { bg: "bg-info-surface", text: "text-info" },
    celebration: { bg: "bg-kpi-savings-surface", text: "text-kpi-savings" },
  };

  const Icon = iconMap[insight.type];
  const colors = colorMap[insight.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
      className="flex items-start gap-3 rounded-xl border border-border/40 bg-surface-subtle/50 px-3.5 py-3"
    >
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          colors.bg,
          colors.text,
        )}
        aria-hidden="true"
      >
        <Icon size={16} strokeWidth={2} />
      </span>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-foreground leading-snug">
          {insight.title}
        </p>
        <p className="text-[11px] text-foreground-secondary mt-0.5 leading-relaxed line-clamp-2">
          {insight.description}
        </p>

        {(insight.actionLabel || insight.secondaryActionLabel) && (
          <div className="flex items-center gap-2 mt-2">
            {insight.actionLabel && insight.actionHref && (
              <a
                href={insight.actionHref}
                className="btn-premium inline-flex items-center gap-1 text-[11px]"
              >
                {insight.actionLabel}
                <ArrowUp size={10} strokeWidth={2.5} />
              </a>
            )}
            {insight.secondaryActionLabel && insight.secondaryActionHref && (
              <a
                href={insight.secondaryActionHref}
                className="btn-ghost-premium inline-flex items-center gap-1 text-[11px]"
              >
                {insight.secondaryActionLabel}
                <BookOpen size={10} strokeWidth={2} />
              </a>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────
   MAIN COMPONENT
   ──────────────────────────────────────────────────────────── */

export function HeroKpiCard({
  currency,
  balance,
  income,
  expense,
  savings,
  savingsRate,
  snapshot,
  aiInsight,
}: HeroKpiCardProps) {
  const streak = (() => {
    const days = snapshot?.daysInPeriod ?? 0;
    return Math.min(days, 30);
  })();

  return (
    <motion.section
      className="relative overflow-hidden rounded-2xl bg-surface shadow-premium-lg"
      variants={listItemVariants}
      initial="hidden"
      animate="visible"
      aria-label="Financial overview"
    >
      {/* Subtle background glow */}
      <div
        className="absolute -top-20 -left-20 w-60 h-60 rounded-full blur-[100px] opacity-[0.03] pointer-events-none"
        aria-hidden="true"
        style={{ background: "var(--color-primary)" }}
      />

      <div className="relative px-5 py-5 sm:px-6 sm:py-6">

        {/* ── Balance ── */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-xs font-medium text-foreground-secondary uppercase tracking-wider">
              Available Balance
            </p>
            {streak >= 3 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-kpi-savings-surface px-2 py-0.5 text-[10px] font-semibold text-kpi-savings">
                <Flame size={10} strokeWidth={2.5} />
                {streak}d streak
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-3">
            <AnimatedNumber
              value={minorToMajor(balance.currentMinor)}
              format={(v) => (
                <span className="font-sora text-[36px] sm:text-[42px] font-bold text-foreground tabular-nums leading-none tracking-tight">
                  ₹{v.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </span>
              )}
              duration={1}
              className="font-sora text-[36px] sm:text-[42px] font-bold text-foreground tabular-nums leading-none tracking-tight"
            />
            <TrendPill trend={balance.trend} invertPolarity={false} />
          </div>

          {savingsRate > 0 && (
            <p className="text-xs text-foreground-secondary mt-1.5">
              {formatPercentage(savingsRate / 100)} savings rate
            </p>
          )}
        </div>

        {/* ── Key Metrics ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <MetricCard
            icon={<TrendingUp size={14} strokeWidth={2.2} />}
            label="Income"
            value={formatCurrency({ minorValue: income.currentMinor, currency })}
            trend={income.trend}
            invertPolarity={false}
            accentSurface="var(--color-kpi-income-surface)"
            accentForeground="var(--color-kpi-income-foreground)"
          />
          <MetricCard
            icon={<TrendingDown size={14} strokeWidth={2.2} />}
            label="Expenses"
            value={formatCurrency({ minorValue: expense.currentMinor, currency })}
            trend={expense.trend}
            invertPolarity
            accentSurface="var(--color-kpi-expense-surface)"
            accentForeground="var(--color-kpi-expense-foreground)"
          />
          <MetricCard
            icon={<PiggyBank size={14} strokeWidth={2.2} />}
            label="Savings"
            value={formatCurrency({ minorValue: savings.currentMinor, currency })}
            trend={savings.trend}
            invertPolarity={false}
            accentSurface="var(--color-kpi-savings-surface)"
            accentForeground="var(--color-kpi-savings-foreground)"
          />
        </div>

        {/* ── AI Insight ── */}
        {aiInsight && <AIInsightCard insight={aiInsight} />}
      </div>
    </motion.section>
  );
}
