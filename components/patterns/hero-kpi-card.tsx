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
      <span className="inline-flex items-center gap-0.5 rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-on-surface-variant/50 font-geist">
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
        "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-medium tabular-nums font-geist",
        isFlat
          ? "bg-white/5 text-on-surface-variant/50"
          : isFavourable
            ? "bg-tertiary-container/15 text-tertiary-fixed"
            : "bg-secondary-container/15 text-secondary-fixed",
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
    <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5 backdrop-blur-sm">
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
        style={{ background: accentSurface, color: accentForeground }}
        aria-hidden="true"
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium text-on-surface-variant/50 uppercase tracking-wider leading-none mb-1 font-geist">
          {label}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-on-surface tabular-nums leading-none">
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
    positive: { bg: "bg-tertiary-container/15", text: "text-tertiary-fixed" },
    warning: { bg: "bg-secondary-container/15", text: "text-secondary-fixed" },
    info: { bg: "bg-primary-container/15", text: "text-primary-fixed" },
    celebration: { bg: "bg-secondary-container/15", text: "text-secondary-fixed" },
  };

  const Icon = iconMap[insight.type];
  const colors = colorMap[insight.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
      className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-3.5 py-3 backdrop-blur-sm"
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
        <p className="text-xs font-semibold text-on-surface leading-snug">
          {insight.title}
        </p>
        <p className="text-[11px] text-on-surface-variant/60 mt-0.5 leading-relaxed line-clamp-2">
          {insight.description}
        </p>

        {(insight.actionLabel || insight.secondaryActionLabel) && (
          <div className="flex items-center gap-2 mt-2">
            {insight.actionLabel && insight.actionHref && (
              <a
                href={insight.actionHref}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary-fixed bg-primary-container/15 px-3 py-1.5 rounded-full hover:bg-primary-container/25 transition-all"
              >
                {insight.actionLabel}
                <ArrowUp size={10} strokeWidth={2.5} />
              </a>
            )}
            {insight.secondaryActionLabel && insight.secondaryActionHref && (
              <a
                href={insight.secondaryActionHref}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-on-surface-variant/60 border border-white/10 px-3 py-1.5 rounded-full hover:bg-white/5 transition-all"
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
      className="relative overflow-hidden glass-vessel rounded-2xl"
      variants={listItemVariants}
      initial="hidden"
      animate="visible"
      aria-label="Financial overview"
    >
      {/* Subtle background glow */}
      <div
        className="absolute -top-20 -left-20 w-60 h-60 rounded-full blur-[100px] opacity-[0.08] pointer-events-none"
        aria-hidden="true"
        style={{ background: "var(--color-primary)" }}
      />

      <div className="relative px-5 py-5 sm:px-6 sm:py-6">

        {/* ── Balance ── */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wider font-geist">
              Available Balance
            </p>
            {streak >= 3 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary-container/15 px-2 py-0.5 text-[10px] font-semibold text-secondary-fixed font-geist">
                <Flame size={10} strokeWidth={2.5} />
                {streak}d streak
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-3">
            <AnimatedNumber
              value={minorToMajor(balance.currentMinor)}
              format={(v) => (
                <span className="font-plus-jakarta text-[36px] sm:text-[42px] font-bold text-primary-fixed tabular-nums leading-none tracking-tight drop-shadow-[0_0_10px_rgba(0,220,229,0.3)]">
                  ₹{v.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </span>
              )}
              duration={1}
              className="font-plus-jakarta text-[36px] sm:text-[42px] font-bold text-primary-fixed tabular-nums leading-none tracking-tight drop-shadow-[0_0_10px_rgba(0,220,229,0.3)]"
            />
            <TrendPill trend={balance.trend} invertPolarity={false} />
          </div>

          {savingsRate > 0 && (
            <p className="text-xs text-on-surface-variant/60 mt-1.5 font-geist">
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
            accentSurface="rgb(59 255 23 / 0.15)"
            accentForeground="#79ff5b"
          />
          <MetricCard
            icon={<TrendingDown size={14} strokeWidth={2.2} />}
            label="Expenses"
            value={formatCurrency({ minorValue: expense.currentMinor, currency })}
            trend={expense.trend}
            invertPolarity
            accentSurface="rgb(255 172 232 / 0.15)"
            accentForeground="#fface8"
          />
          <MetricCard
            icon={<PiggyBank size={14} strokeWidth={2.2} />}
            label="Savings"
            value={formatCurrency({ minorValue: savings.currentMinor, currency })}
            trend={savings.trend}
            invertPolarity={false}
            accentSurface="rgb(0 220 229 / 0.15)"
            accentForeground="#63f7ff"
          />
        </div>

        {/* ── AI Insight ── */}
        {aiInsight && <AIInsightCard insight={aiInsight} />}
      </div>
    </motion.section>
  );
}
