"use client";

import {
  ArcElement,
  Chart as ChartJS,
  DoughnutController,
  Legend,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from "chart.js";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { Chart as ChartCanvas } from "react-chartjs-2";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/ui/cn";
import { formatCurrency, formatPercentage } from "@/lib/formatters/locale";
import type { CategoryBreakdownRow } from "@/lib/domain/types";

ChartJS.register(ArcElement, DoughnutController, Legend, Tooltip);

export interface CategoryBreakdownPanelProps {
  breakdown: readonly CategoryBreakdownRow[];
  totalSpendingMinor: number;
  currency: string;
  period: string;
}

/* ────────────────────────────────────────────────────────────
   DOUGHNUT DATA BUILDER
   ──────────────────────────────────────────────────────────── */

function buildDoughnutData(rows: readonly CategoryBreakdownRow[]): ChartData<"doughnut"> {
  const defaultColors = ["#36ADA3", "#2F578A", "#22C55E", "#F5A623", "#F04438", "#6E9BE3", "#4FB0C5", "#3D4AA0"];
  const styles = typeof window !== "undefined" ? window.getComputedStyle(document.documentElement) : null;
  return {
    labels: rows.map((row) => row.label),
    datasets: [{
      data: rows.map((row) => row.amountMinor / 100),
      backgroundColor: rows.map((row, i) => styles?.getPropertyValue(`--color-${row.semanticToken}`).trim() || defaultColors[i % defaultColors.length]),
      borderColor: styles?.getPropertyValue("--color-surface").trim() || "#0D1145",
      borderWidth: 3,
      hoverOffset: 8,
      spacing: 2,
    }],
  };
}

/* ────────────────────────────────────────────────────────────
   DOUGHNUT OPTIONS (Stripe-inspired)
   ──────────────────────────────────────────────────────────── */

function buildDoughnutOptions(currency: string): ChartOptions<"doughnut"> {
  return {
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000,
      easing: "easeOutQuart",
    },
    responsive: true,
    maintainAspectRatio: false,
    cutout: "72%",
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(15, 23, 42, 0.92)",
        titleColor: "#f8fafc",
        bodyColor: "#A9B4CF",
        borderColor: "rgba(255, 255, 255, 0.08)",
        borderWidth: 1,
        padding: { top: 10, bottom: 10, left: 14, right: 14 },
        cornerRadius: 10,
        boxPadding: 4,
        caretSize: 0,
        displayColors: true,
        usePointStyle: true,
        callbacks: {
          label: (ctx) => {
            const value = typeof ctx.raw === "number" ? ctx.raw : 0;
            const label = ctx.label ?? "";
            const total = ctx.dataset.data.reduce((a, b) => (typeof a === "number" ? a : 0) + (typeof b === "number" ? b : 0), 0);
            const pct = total > 0 ? ((value / total) * 100).toFixed(1) : "0";
            const formatted = formatCurrency({ minorValue: Math.round(value * 100), currency });
            return ` ${label}: ${formatted} (${pct}%)`;
          },
        },
      },
    },
  };
}

/* ────────────────────────────────────────────────────────────
   CATEGORY ROW
   ──────────────────────────────────────────────────────────── */

function CategoryRow({
  row,
  currency,
  index,
}: {
  row: CategoryBreakdownRow;
  currency: string;
  index: number;
}) {
  const percentDisplay = formatPercentage(row.percentage);
  const formatted = formatCurrency({ minorValue: row.amountMinor, currency });
  const cssVar = `var(--color-${row.semanticToken})`;

  return (
    <motion.div
      animate={{ opacity: 1, x: 0 }}
      className="group flex items-center gap-3 rounded-lg px-2.5 py-2 transition-colors duration-150 hover:bg-surface-subtle/50"
      initial={{ opacity: 0, x: 8 }}
      transition={{ duration: 0.25, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Color dot */}
      <span
        aria-hidden="true"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-transform duration-150 group-hover:scale-110"
        style={{ backgroundColor: `color-mix(in srgb, ${cssVar} 15%, transparent)` }}
      >
        <span
          aria-hidden="true"
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: cssVar }}
        />
      </span>

      {/* Label */}
      <span className="min-w-0 flex-1 truncate text-xs font-medium text-foreground">{row.label}</span>

      {/* Amount */}
      <span className="shrink-0 text-xs font-semibold text-foreground tabular-nums">{formatted}</span>

      {/* Percentage bar */}
      <div className="h-1 w-14 shrink-0 overflow-hidden rounded-full bg-surface-subtle">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: cssVar }}
          initial={{ width: "0%" }}
          animate={{ width: `${row.percentage * 100}%` }}
          transition={{ duration: 0.6, delay: index * 0.05 + 0.3, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      {/* Percentage */}
      <span className="w-10 shrink-0 text-right text-[10px] tabular-nums text-foreground-secondary">{percentDisplay}</span>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────
   MAIN COMPONENT
   ──────────────────────────────────────────────────────────── */

export function CategoryBreakdownPanel({
  breakdown,
  totalSpendingMinor,
  currency,
  period,
}: CategoryBreakdownPanelProps) {
  const { resolvedAppearance } = useTheme();
  const [viewAll, setViewAll] = useState(false);

  const visibleRows = viewAll ? breakdown : breakdown.slice(0, 5);
  const hasMore = breakdown.length > 5;
  const totalFormatted = formatCurrency({ minorValue: totalSpendingMinor, currency });

  // resolvedAppearance triggers rebuild when theme changes so CSS variables resolve to correct colors
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const data = useMemo(() => (breakdown.length > 0 ? buildDoughnutData(breakdown) : null), [breakdown, resolvedAppearance]);
  const options = useMemo(() => buildDoughnutOptions(currency), [currency]);

  return (
    <section
      aria-labelledby="category-breakdown-title"
      className="relative overflow-hidden glass-vessel"
    >
      {/* Header */}
      <div className="relative px-5 pt-4 pb-3">
        <h2 className="text-sm font-semibold text-foreground" id="category-breakdown-title">
          Spending by Category
        </h2>
        <p className="mt-0.5 text-xs text-foreground-secondary">{period}</p>
      </div>

      {/* Doughnut chart */}
      {data ? (
        <div className="relative px-5 pb-4">
          <div className="relative mx-auto" style={{ height: 200, width: 200 }}>
            <ChartCanvas
              aria-label={`Spending by category doughnut chart for ${period}`}
              data={data}
              options={options}
              role="img"
              tabIndex={-1}
              type="doughnut"
            />
            {/* Center overlay */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
            >
              <p className="text-lg font-bold text-foreground tabular-nums leading-none">{totalFormatted}</p>
              <p className="text-[10px] text-foreground-secondary mt-1">Total spent</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="px-5 pb-5">
          <div className="flex h-48 flex-col items-center justify-center text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-on-surface-variant/40">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path d="M9 12a3 3 0 106 0 3 3 0 00-6 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-on-surface">No expense data yet</p>
            <p className="mt-1 text-xs text-on-surface-variant/50 max-w-[200px]">
              Add expenses to see your spending breakdown by category
            </p>
          </div>
        </div>
      )}

      {/* Category list */}
      <div className={cn("px-3 pb-3", !breakdown.length && "hidden")}>
        <div className="space-y-0.5">
          {visibleRows.map((row, index) => (
            <CategoryRow
              currency={currency}
              index={index}
              key={row.categoryId}
              row={row}
            />
          ))}
        </div>
        {hasMore ? (
          <button
            className="mt-2 w-full rounded-lg py-2 text-center text-xs font-medium text-foreground-secondary transition-colors duration-150 hover:bg-surface-subtle/50 hover:text-foreground"
            onClick={() => setViewAll((prev) => !prev)}
            type="button"
          >
            {viewAll ? "Show less" : `Show all ${breakdown.length} categories`}
          </button>
        ) : null}
      </div>
    </section>
  );
}
