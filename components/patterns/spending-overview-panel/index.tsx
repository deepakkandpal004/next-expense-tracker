"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "motion/react";
import { BarChart2, LineChart, TrendingDown } from "lucide-react";
import { useState } from "react";
import { ViewportMount } from "@/components/ui";
import { cn } from "@/lib/ui/cn";
import { ChartLegend } from "./chart-legend";
import type { ChartVisualization, SpendingOverviewPanelProps } from "./types";

export { type ChartVisualization, type SpendingOverviewPanelProps } from "./types";

const SpendingChartCanvas = dynamic(
  () => import("./chart-canvas").then((mod) => mod.SpendingChartCanvas),
  { ssr: false },
);

export function SpendingOverviewPanel({
  trendModel,
  spendingInsight,
  period,
  currency,
}: SpendingOverviewPanelProps) {
  const [vizType, setVizType] = useState<ChartVisualization>("line");
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());
  const isReady = trendModel.state === "ready";

  // Toggle series visibility
  const toggleSeries = (key: string) => {
    setHiddenSeries((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const spendingTrend = spendingInsight.trend;
  const showSuccessBanner = spendingTrend && spendingTrend.direction === "down" && spendingTrend.changePercent < -0.05;

  const legendSeries = [
    { label: "Income", color: "#4ADE80", key: "Income" },
    { label: "Spending", color: "#FF7AC6", key: "Spending" },
  ];

  return (
    <section
      aria-labelledby="spending-overview-title"
      className="relative overflow-hidden glass-vessel"
    >
      {/* Header */}
      <div className="relative flex flex-wrap items-center justify-between gap-3 px-5 pt-5 pb-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground" id="spending-overview-title">
            Income & Spending
          </h2>
          <p className="mt-0.5 text-xs text-foreground-secondary">{period}</p>
        </div>
        <div
          aria-label="Chart type"
          className="flex overflow-hidden rounded-lg border border-white/10"
          role="group"
        >
          {(["line", "bar"] as ChartVisualization[]).map((type) => (
            <button
              aria-pressed={vizType === type}
              className={cn(
                "inline-flex min-h-[34px] items-center gap-1.5 px-3 text-xs font-medium transition-colors duration-150",
                vizType === type
                  ? "bg-primary text-foreground-inverse"
                  : "bg-transparent text-foreground-secondary hover:bg-white/5",
              )}
              key={type}
              onClick={() => setVizType(type)}
              type="button"
            >
              {type === "line" ? <LineChart aria-hidden="true" size={13} /> : <BarChart2 aria-hidden="true" size={13} />}
              <span>{type === "line" ? "Area" : "Bar"}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="relative flex items-center justify-between px-5 pb-4">
        <ChartLegend
          series={legendSeries}
          hiddenSeries={hiddenSeries}
          onToggle={toggleSeries}
        />
        {showSuccessBanner && (
          <motion.span
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-1.5 rounded-full bg-kpi-income-surface px-3 py-1 text-[11px] font-semibold text-kpi-income"
          >
            <TrendingDown aria-hidden="true" size={12} />
            {Math.abs(spendingTrend!.changePercent * 100).toFixed(0)}% this period
          </motion.span>
        )}
      </div>

      {/* Chart */}
      <div className="relative px-5 pb-5">
        <div className="relative h-72 w-full sm:h-80">
          {isReady ? (
            <AnimatePresence mode="wait">
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="absolute inset-0"
                exit={{ opacity: 0, y: 4 }}
                initial={{ opacity: 0, y: 4 }}
                key={vizType}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                <ViewportMount className="absolute inset-0" fallback={<div className="h-full animate-pulse rounded-lg bg-surface-subtle/60" />}>
                  <SpendingChartCanvas currency={currency} hiddenSeries={hiddenSeries} trendModel={trendModel} visualization={vizType} />
                </ViewportMount>
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-on-surface-variant/40">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 3v18h18" />
                  <path d="M7 16l4-8 4 4 4-6" />
                </svg>
              </div>
              <p className="text-sm font-medium text-on-surface">
                {trendModel.state === "error"
                  ? (trendModel.errorMessage ?? "Chart unavailable.")
                  : "No transactions recorded yet"}
              </p>
              <p className="mt-1 text-xs text-on-surface-variant/50 max-w-[220px]">
                {trendModel.state === "error"
                  ? "Please try again later"
                  : "Your spending chart will appear here once you add transactions"}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
