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
  Wallet,
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
      <span className="inline-flex items-center gap-0.5 rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium text-on-surface-variant/50 tabular-nums">
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
        "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums",
        isFlat
          ? "bg-white/5 text-on-surface-variant/50"
          : isFavourable
            ? "bg-[#4ADE80]/15 text-[#4ADE80]"
            : "bg-[#FF7AC6]/15 text-[#FF7AC6]",
      )}
    >
      <Icon size={10} strokeWidth={2.5} />
      {isFlat ? "0" : percent}%
    </span>
  );
}

/* ────────────────────────────────────────────────────────────
   SPARKLINE
   ──────────────────────────────────────────────────────────── */

function Sparkline({ data, color }: { data: readonly number[]; color: string }) {
  if (data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const height = 28;
  const width = 64;
  const padding = 2;

  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((value - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      aria-hidden="true"
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────
   KPI CARD
   ──────────────────────────────────────────────────────────── */

const KPI_STYLES = {
  balance: {
    label: "Balance",
    icon: Wallet,
    chip: "bg-[#00DCE5]/15 text-[#00DCE5]",
    spark: "#00DCE5",
  },
  income: {
    label: "Income",
    icon: TrendingUp,
    chip: "bg-[#4ADE80]/15 text-[#4ADE80]",
    spark: "#4ADE80",
  },
  expense: {
    label: "Expenses",
    icon: TrendingDown,
    chip: "bg-[#FF7AC6]/15 text-[#FF7AC6]",
    spark: "#FF7AC6",
  },
  savings: {
    label: "Savings",
    icon: PiggyBank,
    chip: "bg-[#A855F7]/15 text-[#A855F7]",
    spark: "#A855F7",
  },
} as const;

function KpiCard({
  kind,
  valueMinor,
  currency,
  trend,
  sparkline,
  invertPolarity,
  footer,
}: {
  kind: keyof typeof KPI_STYLES;
  valueMinor: number;
  currency: string;
  trend: KpiTrend | null;
  sparkline?: readonly number[];
  invertPolarity: boolean;
  footer?: React.ReactNode;
}) {
  const style = KPI_STYLES[kind];
  const Icon = style.icon;

  return (
    <div className="flex flex-col gap-4 rounded-2xl glass-vessel p-5">
      <div className="flex items-center justify-between">
        <span
          className={cn("flex h-9 w-9 items-center justify-center rounded-xl", style.chip)}
          aria-hidden="true"
        >
          <Icon size={17} strokeWidth={2.2} />
        </span>
        <span className="text-[11px] font-medium uppercase tracking-wider text-on-surface-variant/60">
          {style.label}
        </span>
      </div>

      <div className="flex items-end justify-between gap-2">
        <AnimatedNumber
          value={minorToMajor(valueMinor)}
          format={(v) => formatCurrency({ minorValue: Math.round(v * 100), currency })}
          className="text-2xl font-bold tabular-nums tracking-tight text-on-surface"
        />
        {sparkline && sparkline.length >= 2 && (
          <span className="shrink-0 opacity-70">
            <Sparkline data={sparkline} color={style.spark} />
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <TrendPill trend={trend} invertPolarity={invertPolarity} />
        {footer}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   AI INSIGHT STRIP
   ──────────────────────────────────────────────────────────── */

const AI_STYLES = {
  positive: { icon: TrendingUp, chip: "bg-[#4ADE80]/15 text-[#4ADE80]" },
  warning: { icon: Zap, chip: "bg-[#FF7AC6]/15 text-[#FF7AC6]" },
  info: { icon: Brain, chip: "bg-[#00DCE5]/15 text-[#00DCE5]" },
  celebration: { icon: Target, chip: "bg-[#A855F7]/15 text-[#A855F7]" },
} as const;

function AIInsightStrip({ insight }: { insight: NonNullable<HeroKpiCardProps["aiInsight"]> }) {
  const style = AI_STYLES[insight.type];
  const Icon = style.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
      className="flex flex-col gap-3 rounded-2xl glass-vessel p-5 sm:flex-row sm:items-center"
    >
      <span
        className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", style.chip)}
        aria-hidden="true"
      >
        <Icon size={18} strokeWidth={2.2} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-on-surface">{insight.title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-on-surface-variant/60">
          {insight.description}
        </p>
      </div>

      {(insight.actionLabel || insight.secondaryActionLabel) && (
        <div className="flex shrink-0 items-center gap-2">
          {insight.actionLabel && insight.actionHref && (
            <a
              href={insight.actionHref}
              className="inline-flex items-center gap-1 rounded-full bg-[#00DCE5]/15 px-3.5 py-1.5 text-xs font-semibold text-[#00DCE5] transition-colors hover:bg-[#00DCE5]/25"
            >
              {insight.actionLabel}
            </a>
          )}
          {insight.secondaryActionLabel && insight.secondaryActionHref && (
            <a
              href={insight.secondaryActionHref}
              className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3.5 py-1.5 text-xs font-medium text-on-surface-variant/70 transition-colors hover:bg-white/5 hover:text-on-surface"
            >
              {insight.secondaryActionLabel}
              <BookOpen size={12} strokeWidth={2} />
            </a>
          )}
        </div>
      )}
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
  const streak = Math.min(snapshot?.daysInPeriod ?? 0, 30);

  return (
    <motion.section
      className="grid gap-4"
      variants={listItemVariants}
      initial="hidden"
      animate="visible"
      aria-label="Financial overview"
    >
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <KpiCard
          kind="balance"
          valueMinor={balance.currentMinor}
          currency={currency}
          trend={balance.trend}
          sparkline={balance.sparkline}
          invertPolarity={false}
          footer={
            streak >= 3 ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#FFB020]">
                <Flame size={10} strokeWidth={2.5} />
                {streak}d
              </span>
            ) : undefined
          }
        />
        <KpiCard
          kind="income"
          valueMinor={income.currentMinor}
          currency={currency}
          trend={income.trend}
          sparkline={income.sparkline}
          invertPolarity={false}
        />
        <KpiCard
          kind="expense"
          valueMinor={expense.currentMinor}
          currency={currency}
          trend={expense.trend}
          sparkline={expense.sparkline}
          invertPolarity
        />
        <KpiCard
          kind="savings"
          valueMinor={savings.currentMinor}
          currency={currency}
          trend={savings.trend}
          sparkline={savings.sparkline}
          invertPolarity={false}
          footer={
            savingsRate > 0 ? (
              <span className="text-[10px] font-medium text-on-surface-variant/60">
                {formatPercentage(savingsRate / 100)} rate
              </span>
            ) : undefined
          }
        />
      </div>

      {aiInsight && <AIInsightStrip insight={aiInsight} />}
    </motion.section>
  );
}
