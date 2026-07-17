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
import { useEffect, useMemo, useRef, useState } from "react";
import { Chart as ChartCanvas } from "react-chartjs-2";
import { useTheme } from "@/contexts/ThemeContext";
import { applyChartTheme, createChartTheme, type MutableChartLike } from "@/lib/charts/chartjs";
import { formatCurrency } from "@/lib/formatters/locale";
import { cn } from "@/lib/ui/cn";
import type { CategoryBreakdownRow } from "@/lib/domain/types";

ChartJS.register(ArcElement, DoughnutController, Legend, Tooltip);

export interface CategoryBreakdownPanelProps {
  breakdown: readonly CategoryBreakdownRow[];
  totalSpendingMinor: number;
  currency: string;
  period: string;
}

function buildDoughnutData(rows: readonly CategoryBreakdownRow[]): ChartData<"doughnut"> {
  return {
    labels: rows.map((row) => row.label),
    datasets: [{
      data: rows.map((row) => row.amountMinor / 100),
      backgroundColor: rows.map((row) => `var(--${row.semanticToken})`),
      borderColor: "transparent",
      hoverOffset: 6,
      borderWidth: 0,
    }],
  };
}

const DOUGHNUT_OPTIONS: ChartOptions<"doughnut"> = {
  animation: false,
  responsive: true,
  maintainAspectRatio: false,
  cutout: "72%",
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "var(--color-surface)",
      titleColor: "var(--color-text)",
      bodyColor: "var(--color-text-muted)",
      borderColor: "var(--color-border)",
      borderWidth: 1,
      padding: 12,
      cornerRadius: 8,
      callbacks: {
        label: (ctx) => {
          const value = typeof ctx.raw === "number" ? ctx.raw : 0;
          return ` ₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
        },
      },
    },
  },
};

interface CategoryRowProps {
  row: CategoryBreakdownRow;
  currency: string;
  index: number;
}

function CategoryRow({ row, currency, index }: CategoryRowProps) {
  const percentDisplay = `${(row.percentage * 100).toFixed(1)}%`;
  const formatted = formatCurrency({ minorValue: row.amountMinor, currency });
  const cssVar = `var(--${row.semanticToken})`;
  return (
    <motion.div
      animate={{ opacity: 1, x: 0 }}
      className="flex min-w-0 items-center gap-2 py-1"
      initial={{ opacity: 0, x: 8 }}
      transition={{ duration: 0.25, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
    >
      <span
        aria-hidden="true"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: `color-mix(in srgb, ${cssVar} 18%, transparent)` }}
      >
        <span
          aria-hidden="true"
          className="h-2.5 w-2.5 rounded-sm"
          style={{ backgroundColor: cssVar }}
        />
      </span>
      <span className="min-w-0 flex-1 truncate text-interface-xs text-foreground">{row.label}</span>
      <span className="shrink-0 text-interface-xs font-semibold text-foreground">{formatted}</span>
      <span className="w-10 shrink-0 text-right text-interface-xs text-foreground-secondary">{percentDisplay}</span>
    </motion.div>
  );
}

export function CategoryBreakdownPanel({
  breakdown,
  totalSpendingMinor,
  currency,
  period,
}: CategoryBreakdownPanelProps) {
  const { resolvedAppearance } = useTheme();
  const chartRef = useRef<MutableChartLike | null>(null);
  const [viewAll, setViewAll] = useState(false);

  const visibleRows = viewAll ? breakdown : breakdown.slice(0, 5);
  const hasMore = breakdown.length > 5;
  const totalFormatted = formatCurrency({ minorValue: totalSpendingMinor, currency });

  const data = useMemo(() => (breakdown.length > 0 ? buildDoughnutData(breakdown) : null), [breakdown]);

  useEffect(() => {
    if (!chartRef.current) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    applyChartTheme(chartRef.current, createChartTheme({
      appearance: resolvedAppearance,
      reducedMotion: reduced,
      styles: window.getComputedStyle(document.documentElement),
    }));
  }, [resolvedAppearance]);

  return (
    <section
      aria-labelledby="category-breakdown-title"
      className="flex flex-col rounded-2xl border border-border bg-surface p-5 shadow-sm"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-interface-md font-semibold text-foreground" id="category-breakdown-title">
            Expense by Category
          </h2>
          <p className="mt-0.5 text-interface-xs text-foreground-secondary">{period}</p>
        </div>
        <button
          aria-label="View full category report"
          className="text-interface-xs font-semibold text-accent transition-colors hover:text-accent/70"
          type="button"
        >
          This month ▾
        </button>
      </div>

      {data ? (
        <div className="mt-4 flex flex-col items-center">
          <div className="relative h-48 w-48">
            <ChartCanvas
              aria-label={`Spending by category doughnut chart for ${period}`}
              data={data}
              options={DOUGHNUT_OPTIONS}
              ref={(c) => { chartRef.current = c as unknown as MutableChartLike | null; }}
              role="img"
              tabIndex={-1}
              type="doughnut"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
            >
              <p className="financial-value text-display-sm font-bold text-foreground">{totalFormatted}</p>
              <p className="text-interface-xs text-foreground-secondary">Total</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex h-48 items-center justify-center">
          <p className="text-interface-sm text-foreground-secondary">No expense data for this period yet.</p>
        </div>
      )}

      <div className={cn("mt-4 grid gap-0.5", !breakdown.length && "hidden")}>
        {visibleRows.map((row, index) => (
          <CategoryRow currency={currency} index={index} key={row.categoryId} row={row} />
        ))}
        {hasMore ? (
          <button
            className="mt-1 w-full rounded-lg border border-border py-2 text-center text-interface-xs font-semibold text-foreground-secondary transition-colors hover:bg-surface-subtle"
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
