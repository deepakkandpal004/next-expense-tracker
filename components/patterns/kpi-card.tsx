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
}

const ROLE_ICON: Record<KpiRole, ReactNode> = {
  balance: <Wallet size={20} strokeWidth={2.2} />,
  income: <TrendingUp size={20} strokeWidth={2.2} />,
  expense: <TrendingDown size={20} strokeWidth={2.2} />,
  savings: <PiggyBank size={20} strokeWidth={2.2} />,
};

const ROLE_STYLES: Record<KpiRole, { surface: string; foreground: string; sparkline: string }> = {
  balance: {
    surface: "bg-kpi-balance-surface",
    foreground: "text-kpi-balance-foreground",
    sparkline: "var(--color-kpi-balance)",
  },
  income: {
    surface: "bg-kpi-income-surface",
    foreground: "text-kpi-income-foreground",
    sparkline: "var(--color-kpi-income)",
  },
  expense: {
    surface: "bg-kpi-expense-surface",
    foreground: "text-kpi-expense-foreground",
    sparkline: "var(--color-kpi-expense)",
  },
  savings: {
    surface: "bg-kpi-savings-surface",
    foreground: "text-kpi-savings-foreground",
    sparkline: "var(--color-kpi-savings)",
  },
};

/**
 * Renders the "% vs last month" indicator. `invertPolarity` flips the meaning
 * so that "spending up" reads as bad (red) and "spending down" reads as good.
 */
function TrendChip({ trend, invertPolarity }: { trend: KpiTrend | null; invertPolarity: boolean }) {
  if (!trend) {
    return (
      <span className="text-interface-xs text-foreground-secondary">
        No comparison available for last period
      </span>
    );
  }

  const percent = Math.abs(trend.changePercent * 100).toFixed(1);
  const isFlat = trend.direction === "flat";
  const isFavourable = invertPolarity
    ? trend.direction === "down"
    : trend.direction === "up";

  const Icon = isFlat ? Minus : trend.direction === "up" ? ArrowUp : ArrowDown;

  const toneClass = isFlat
    ? "text-foreground-secondary"
    : isFavourable
      ? "text-trend-up-foreground"
      : "text-trend-down-foreground";

  return (
    <p className="mt-1 flex items-center gap-1 text-interface-xs">
      <span
        aria-hidden="true"
        className={cn("inline-flex items-center", toneClass)}
      >
        <Icon size={14} strokeWidth={2.4} />
      </span>
      <span className={cn("font-semibold", toneClass)}>{percent}%</span>
      <span className="text-foreground-secondary">vs last period</span>
    </p>
  );
}

export function KpiCard({ role, label, currency, insight }: KpiCardProps) {
  const styles = ROLE_STYLES[role];
  const invertPolarity = role === "expense";
  const formattedValue = formatMetricValue(
    { status: "available", minorValue: insight.currentMinor },
    currency,
  );

  return (
    <motion.article
      className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-sm transition-shadow duration-200 hover:shadow-md"
      variants={listItemVariants}
    >
      <div className={cn("inline-flex h-10 w-10 items-center justify-center rounded-full", styles.surface)}>
        <span className={styles.foreground} aria-hidden="true">
          {ROLE_ICON[role]}
        </span>
      </div>

      <p className="mt-3 text-interface-sm font-medium text-foreground-secondary">{label}</p>

      <p className="financial-value mt-1 text-display-sm font-bold text-foreground">
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

      <TrendChip trend={insight.trend} invertPolarity={invertPolarity} />

      {insight.sparkline.length >= 2 ? (
        <div className="pointer-events-none mt-3">
          <MiniSparkline
            className="opacity-90"
            color={styles.sparkline}
            data={insight.sparkline.map((value) => value / 100)}
            height={44}
          />
        </div>
      ) : null}
    </motion.article>
  );
}
