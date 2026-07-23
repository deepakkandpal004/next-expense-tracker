"use client";

import { motion } from "motion/react";
import { ArrowDown, ArrowUp, Minus, PiggyBank, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import type { ReactNode } from "react";
import { AnimatedNumber } from "@/components/ui";
import { cn } from "@/lib/ui/cn";
import { listItemVariants } from "@/lib/ui/motion";
import { formatMetricValue } from "@/lib/formatters/locale";
import type { KpiInsight, KpiTrend } from "@/lib/domain/types";
import { MiniSparkline } from "./mini-sparkline";

export type KpiRole = "balance" | "income" | "expense" | "savings";

interface KpiCardProps {
  role: KpiRole;
  label: string;
  currency: string;
  insight: KpiInsight;
  className?: string;
}

const ROLE_CONFIG: Record<KpiRole, {
  icon: ReactNode;
  surface: string;
  foreground: string;
  sparkline: string;
  gradient: string;
  borderHover: string;
  trendFg: string;
}> = {
  balance: {
    icon: <Wallet size={16} strokeWidth={2.2} />,
    surface: "bg-kpi-balance-surface",
    foreground: "text-kpi-balance-foreground",
    sparkline: "var(--color-kpi-balance)",
    gradient: "from-kpi-balance/5 via-transparent to-transparent",
    borderHover: "hover:border-kpi-balance/40",
    trendFg: "text-kpi-balance",
  },
  income: {
    icon: <TrendingUp size={16} strokeWidth={2.2} />,
    surface: "bg-kpi-income-surface",
    foreground: "text-kpi-income-foreground",
    sparkline: "var(--color-kpi-income)",
    gradient: "from-kpi-income/5 via-transparent to-transparent",
    borderHover: "hover:border-kpi-income/40",
    trendFg: "text-kpi-income",
  },
  expense: {
    icon: <TrendingDown size={16} strokeWidth={2.2} />,
    surface: "bg-kpi-expense-surface",
    foreground: "text-kpi-expense-foreground",
    sparkline: "var(--color-kpi-expense)",
    gradient: "from-kpi-expense/5 via-transparent to-transparent",
    borderHover: "hover:border-kpi-expense/40",
    trendFg: "text-kpi-expense",
  },
  savings: {
    icon: <PiggyBank size={16} strokeWidth={2.2} />,
    surface: "bg-kpi-savings-surface",
    foreground: "text-kpi-savings-foreground",
    sparkline: "var(--color-kpi-savings)",
    gradient: "from-kpi-savings/5 via-transparent to-transparent",
    borderHover: "hover:border-kpi-savings/40",
    trendFg: "text-kpi-savings",
  },
};

/* ────────────────────────────────────────────────────────────
   TREND PILL
   ──────────────────────────────────────────────────────────── */

function TrendPill({ trend, invertPolarity }: { trend: KpiTrend | null; invertPolarity: boolean }) {
  if (!trend) {
    return (
      <span className="inline-flex items-center rounded-md bg-surface-subtle px-1.5 py-0.5 text-[10px] font-medium text-foreground-secondary">
        New
      </span>
    );
  }

  const percent = Math.abs(trend.changePercent * 100).toFixed(1);
  const isFlat = trend.direction === "flat";
  const isFavourable = invertPolarity ? trend.direction === "down" : trend.direction === "up";

  const Icon = isFlat ? Minus : trend.direction === "up" ? ArrowUp : ArrowDown;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
        isFlat
          ? "bg-surface-subtle text-foreground-secondary"
          : isFavourable
            ? "bg-kpi-income-surface text-kpi-income-foreground"
            : "bg-kpi-expense-surface text-kpi-expense-foreground",
      )}
    >
      <Icon size={10} strokeWidth={2.5} />
      {isFlat ? "0" : percent}%
    </span>
  );
}

/* ────────────────────────────────────────────────────────────
   KPI CARD
   ──────────────────────────────────────────────────────────── */

export function KpiCard({ role, label, currency, insight, className }: KpiCardProps) {
  const config = ROLE_CONFIG[role];
  const invertPolarity = role === "expense";
  const formattedValue = formatMetricValue(
    { status: "available", minorValue: insight.currentMinor },
    currency,
  );

  return (
    <motion.article
      className={cn(
        "group relative overflow-hidden glass-vessel p-4 transition-all duration-200",
        "hover:border-white/10",
        config.borderHover,
        className,
      )}
      variants={listItemVariants}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Color gradient overlay */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none",
          config.gradient,
        )}
        aria-hidden="true"
      />

      <div className="relative">
        {/* Header: Icon + Label + Trend */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <span
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-110",
                config.surface,
              )}
              aria-hidden="true"
            >
              <span className={config.foreground}>{config.icon}</span>
            </span>
            <span className="text-xs font-medium text-on-surface-variant/60 font-geist">{label}</span>
          </div>
          <TrendPill trend={insight.trend} invertPolarity={invertPolarity} />
        </div>

        {/* Value */}
        <p className="font-geist text-2xl font-bold text-[#F5F7FA] tabular-nums leading-none mb-3">
          <AnimatedNumber
            fallback={formattedValue}
            format={(current) =>
              formatMetricValue(
                { status: "available", minorValue: Math.round(current * 100) },
                currency,
              )
            }
            value={insight.currentMinor / 100}
          />
        </p>

        {/* Sparkline */}
        {insight.sparkline.length >= 2 && (
          <div className="h-10 -mx-1 -mb-1" aria-hidden="true">
            <MiniSparkline
              color={config.sparkline}
              data={insight.sparkline.map((v) => v / 100)}
              height={40}
              animated
            />
          </div>
        )}
      </div>
    </motion.article>
  );
}
