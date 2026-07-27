"use client";

import {
  BarController,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
  type ChartData,
  type ChartDataset,
  type ChartOptions,
} from "chart.js";
import { AnimatePresence, motion } from "motion/react";
import { BarChart2, LineChart, TrendingDown } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Chart as ChartCanvas } from "react-chartjs-2";
import { useTheme } from "@/contexts/ThemeContext";
import { applyChartTheme, createChartTheme, type MutableChartLike } from "@/lib/charts/chartjs";
import { cn } from "@/lib/ui/cn";
import type { ChartModel } from "@/lib/domain/types";
import type { KpiInsight } from "@/lib/domain/types";

ChartJS.register(
  BarController,
  BarElement,
  CategoryScale,
  Filler,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
);

export type ChartVisualization = "line" | "bar";

export interface SpendingOverviewPanelProps {
  trendModel: ChartModel;
  spendingInsight: KpiInsight;
  incomeInsight: KpiInsight;
  period: string;
  currency: string;
}

/* ────────────────────────────────────────────────────────────
   DATA BUILDERS
   ──────────────────────────────────────────────────────────── */

function buildLineData(model: ChartModel): ChartData<"line"> {
  const labels = model.rows.map((row) => row.label);
  const incomeData = model.rows.map((row) => (row.values[0] ?? 0) / 100);
  const spendingData = model.rows.map((row) => (row.values[1] ?? 0) / 100);

  return {
    labels,
    datasets: [
      {
        label: "Income",
        data: incomeData,
        borderColor: "var(--color-kpi-income)",
        backgroundColor: (ctx) => {
          const chart = ctx.chart;
          const { ctx: canvasCtx, chartArea } = chart;
          if (!chartArea) return "rgba(34, 197, 94, 0.08)";
          const gradient = canvasCtx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, "rgba(34, 197, 94, 0.15)");
          gradient.addColorStop(0.5, "rgba(34, 197, 94, 0.05)");
          gradient.addColorStop(1, "rgba(34, 197, 94, 0)");
          return gradient;
        },
        pointBackgroundColor: "var(--color-kpi-income)",
        pointBorderColor: "var(--color-surface)",
        pointBorderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBorderWidth: 3,
        pointHoverBorderColor: "var(--color-surface)",
        borderWidth: 2.5,
        tension: 0.4,
        fill: true,
        semanticToken: "kpi-income",
      } as ChartDataset<"line"> & { semanticToken: string },
      {
        label: "Spending",
        data: spendingData,
        borderColor: "var(--color-kpi-expense)",
        backgroundColor: (ctx) => {
          const chart = ctx.chart;
          const { ctx: canvasCtx, chartArea } = chart;
          if (!chartArea) return "rgba(249, 115, 22, 0.06)";
          const gradient = canvasCtx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, "rgba(249, 115, 22, 0.12)");
          gradient.addColorStop(0.5, "rgba(249, 115, 22, 0.04)");
          gradient.addColorStop(1, "rgba(249, 115, 22, 0)");
          return gradient;
        },
        pointBackgroundColor: "var(--color-kpi-expense)",
        pointBorderColor: "var(--color-surface)",
        pointBorderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBorderWidth: 3,
        pointHoverBorderColor: "var(--color-surface)",
        borderWidth: 2.5,
        tension: 0.4,
        fill: true,
        semanticToken: "kpi-expense",
      } as ChartDataset<"line"> & { semanticToken: string },
    ],
  };
}

function buildBarData(model: ChartModel): ChartData<"bar"> {
  const labels = model.rows.map((row) => row.label);
  const incomeData = model.rows.map((row) => (row.values[0] ?? 0) / 100);
  const spendingData = model.rows.map((row) => (row.values[1] ?? 0) / 100);
  return {
    labels,
    datasets: [
      {
        label: "Income",
        data: incomeData,
        backgroundColor: "var(--color-kpi-income)",
        hoverBackgroundColor: "var(--color-kpi-income)",
        borderRadius: { topLeft: 6, topRight: 6, bottomLeft: 0, bottomRight: 0 },
        borderWidth: 0,
        maxBarThickness: 32,
        borderSkipped: false,
        semanticToken: "kpi-income",
      } as ChartDataset<"bar"> & { semanticToken: string },
      {
        label: "Spending",
        data: spendingData,
        backgroundColor: "var(--color-kpi-expense)",
        hoverBackgroundColor: "var(--color-kpi-expense)",
        borderRadius: { topLeft: 6, topRight: 6, bottomLeft: 0, bottomRight: 0 },
        borderWidth: 0,
        maxBarThickness: 32,
        borderSkipped: false,
        semanticToken: "kpi-expense",
      } as ChartDataset<"bar"> & { semanticToken: string },
    ],
  };
}

/* ────────────────────────────────────────────────────────────
   CHART OPTIONS (Stripe-inspired)
   ──────────────────────────────────────────────────────────── */

function buildLineOptions(): ChartOptions {
  return {
    animation: { duration: 800, easing: "easeOutQuart" },
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(15, 23, 42, 0.92)",
        titleColor: "#f8fafc",
        bodyColor: "#cbd5e1",
        borderColor: "rgba(255, 255, 255, 0.08)",
        borderWidth: 1,
        padding: { top: 10, bottom: 10, left: 14, right: 14 },
        cornerRadius: 10,
        boxPadding: 4,
        caretSize: 0,
        displayColors: true,
        usePointStyle: true,
        pointStyle: "circle",
        callbacks: {
          title: (items) => items[0]?.label ?? "",
          label: (ctx) => {
            const value = typeof ctx.raw === "number" ? ctx.raw : 0;
            return ` ${ctx.dataset.label}: ₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          maxTicksLimit: 7,
          font: { size: 11, weight: 500 },
          color: "var(--color-text-muted)",
          padding: 8,
        },
      },
      y: {
        beginAtZero: true,
        border: { display: false },
        grid: {
          color: "var(--color-border)",
          lineWidth: 0.5,
        },
        ticks: {
          font: { size: 11 },
          color: "var(--color-text-muted)",
          padding: 12,
          maxTicksLimit: 6,
          callback: (value) => {
            const num = typeof value === "number" ? value : 0;
            if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
            if (num >= 1000) return `₹${(num / 1000).toFixed(0)}K`;
            return `₹${num}`;
          },
        },
      },
    },
  } as ChartOptions;
}

function buildBarOptions(): ChartOptions {
  return {
    animation: { duration: 800, easing: "easeOutQuart" },
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(15, 23, 42, 0.92)",
        titleColor: "#f8fafc",
        bodyColor: "#cbd5e1",
        borderColor: "rgba(255, 255, 255, 0.08)",
        borderWidth: 1,
        padding: { top: 10, bottom: 10, left: 14, right: 14 },
        cornerRadius: 10,
        boxPadding: 4,
        caretSize: 0,
        displayColors: true,
        usePointStyle: true,
        pointStyle: "rectRounded",
        callbacks: {
          title: (items) => items[0]?.label ?? "",
          label: (ctx) => {
            const value = typeof ctx.raw === "number" ? ctx.raw : 0;
            return ` ${ctx.dataset.label}: ₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          maxTicksLimit: 7,
          font: { size: 11, weight: 500 },
          color: "var(--color-text-muted)",
          padding: 8,
        },
      },
      y: {
        beginAtZero: true,
        border: { display: false },
        grid: {
          color: "var(--color-border)",
          lineWidth: 0.5,
        },
        ticks: {
          font: { size: 11 },
          color: "var(--color-text-muted)",
          padding: 12,
          maxTicksLimit: 6,
          callback: (value) => {
            const num = typeof value === "number" ? value : 0;
            if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
            if (num >= 1000) return `₹${(num / 1000).toFixed(0)}K`;
            return `₹${num}`;
          },
        },
      },
    },
  } as ChartOptions;
}

/* ────────────────────────────────────────────────────────────
   INTERACTIVE LEGEND
   ──────────────────────────────────────────────────────────── */

function ChartLegend({
  series,
  hiddenSeries,
  onToggle,
}: {
  series: { label: string; color: string; key: string }[];
  hiddenSeries: Set<string>;
  onToggle: (key: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {series.map((s) => {
        const hidden = hiddenSeries.has(s.key);
        return (
            <button
            key={s.key}
            type="button"
            onClick={() => onToggle(s.key)}
            className={cn(
              "flex items-center gap-1.5 text-xs font-medium transition-all duration-150",
              hidden ? "text-foreground-secondary/50" : "text-foreground-secondary hover:text-foreground",
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "inline-block h-2 w-2.5 rounded-sm transition-opacity duration-150",
                hidden && "opacity-40",
              )}
              style={{ backgroundColor: s.color }}
            />
            {s.label}
          </button>
        );
      })}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   MAIN COMPONENT
   ──────────────────────────────────────────────────────────── */

export function SpendingOverviewPanel({
  trendModel,
  spendingInsight,
  period,
}: SpendingOverviewPanelProps) {
  const { resolvedAppearance } = useTheme();
  const chartRef = useRef<MutableChartLike | null>(null);
  const [vizType, setVizType] = useState<ChartVisualization>("line");
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());
  const isReady = trendModel.state === "ready";

  const lineData = useMemo(() => (isReady ? buildLineData(trendModel) : null), [isReady, trendModel]);
  const barData = useMemo(() => (isReady ? buildBarData(trendModel) : null), [isReady, trendModel]);
  const lineOptions = useMemo(() => buildLineOptions(), []);
  const barOptions = useMemo(() => buildBarOptions(), []);

  // Toggle series visibility
  const toggleSeries = (key: string) => {
    setHiddenSeries((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Apply theme to chart
  const applyThemeToChart = (chart: MutableChartLike | null) => {
    if (!chart) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    applyChartTheme(chart, createChartTheme({
      appearance: resolvedAppearance,
      reducedMotion: reduced,
      styles: window.getComputedStyle(document.documentElement),
    }));
  };

  // Store chart instance and apply theme
  const setChartRef = (chart: ChartJS | null | undefined) => {
    const instance = chart ?? null;
    chartRef.current = instance as unknown as MutableChartLike | null;
    if (instance) {
      requestAnimationFrame(() => {
        if (chartRef.current) {
          applyThemeToChart(chartRef.current);
        }
      });
    }
  };

  // Apply hidden series to chart data
  const filteredLineData = useMemo(() => {
    if (!lineData) return null;
    return {
      ...lineData,
      datasets: lineData.datasets.filter((ds) => !hiddenSeries.has(ds.label!)),
    };
  }, [lineData, hiddenSeries]);

  const filteredBarData = useMemo(() => {
    if (!barData) return null;
    return {
      ...barData,
      datasets: barData.datasets.filter((ds) => !hiddenSeries.has(ds.label!)),
    };
  }, [barData, hiddenSeries]);

  // Apply theme when appearance changes
  useEffect(() => {
    applyThemeToChart(chartRef.current);
  }, [resolvedAppearance]);

  const spendingTrend = spendingInsight.trend;
  const showSuccessBanner = spendingTrend && spendingTrend.direction === "down" && spendingTrend.changePercent < -0.05;

  const legendSeries = [
    { label: "Income", color: "var(--color-kpi-income)", key: "Income" },
    { label: "Spending", color: "var(--color-kpi-expense)", key: "Spending" },
  ];

  return (
    <section
      aria-labelledby="spending-overview-title"
      className="relative overflow-hidden glass-vessel"
    >
      {/* Header */}
      <div className="relative flex flex-wrap items-start justify-between gap-3 px-5 pt-4 pb-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground" id="spending-overview-title">
            Income & Spending
          </h2>
          <p className="mt-0.5 text-xs text-foreground-secondary">{period}</p>
        </div>
        <div
          aria-label="Chart type"
            className="flex overflow-hidden rounded-lg border border-border/50"
          role="group"
        >
          {(["line", "bar"] as ChartVisualization[]).map((type) => (
            <button
              aria-pressed={vizType === type}
              className={cn(
                "inline-flex min-h-[36px] items-center gap-1.5 px-3 text-xs font-medium transition-colors duration-150",
                vizType === type
                  ? "bg-primary text-primary-foreground"
                  : "bg-transparent text-foreground-secondary hover:bg-surface-subtle",
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
      <div className="relative px-5 pb-3">
        <ChartLegend
          series={legendSeries}
          hiddenSeries={hiddenSeries}
          onToggle={toggleSeries}
        />
      </div>

      {/* Chart */}
      <div className="relative px-5 pb-5">
        <div className="min-h-[20rem]">
          {isReady && filteredLineData && filteredBarData ? (
            <AnimatePresence mode="wait">
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="h-80"
                exit={{ opacity: 0, y: 4 }}
                initial={{ opacity: 0, y: 4 }}
                key={vizType}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                {vizType === "line" ? (
                  <ChartCanvas
                    aria-label={`${trendModel.title} area chart`}
                    data={filteredLineData}
                    options={lineOptions}
                    ref={setChartRef}
                    role="img"
                    tabIndex={-1}
                    type="line"
                  />
                ) : (
                  <ChartCanvas
                    aria-label={`${trendModel.title} bar chart`}
                    data={filteredBarData}
                    options={barOptions}
                    ref={setChartRef}
                    role="img"
                    tabIndex={-1}
                    type="bar"
                  />
                )}
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="flex h-80 flex-col items-center justify-center text-center">
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

        {/* Success banner */}
        {showSuccessBanner && (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 flex items-start gap-2.5 rounded-xl border border-kpi-income/20 bg-kpi-income-surface/50 px-3.5 py-2.5"
            exit={{ opacity: 0, y: -4 }}
            initial={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <TrendingDown aria-hidden="true" className="mt-0.5 shrink-0 text-kpi-income" size={15} />
            <p className="text-xs font-medium text-kpi-income-foreground">
              Spending down {Math.abs(spendingTrend!.changePercent * 100).toFixed(0)}% vs last period. Keep it up.
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
