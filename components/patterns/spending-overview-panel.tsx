"use client";

import {
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
  type ChartOptions,
} from "chart.js";
import { AnimatePresence, motion } from "motion/react";
import { BarChart2, LineChart, PartyPopper, TrendingDown } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Chart as ChartCanvas } from "react-chartjs-2";
import { useTheme } from "@/contexts/ThemeContext";
import { applyChartTheme, createChartTheme, type MutableChartLike } from "@/lib/charts/chartjs";
import { cn } from "@/lib/ui/cn";
import type { ChartModel } from "@/lib/domain/types";
import type { KpiInsight } from "@/lib/domain/types";

ChartJS.register(
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
  currency: string;
  period: string;
}

function SuccessBanner({ spendingInsight }: { spendingInsight: KpiInsight }) {
  const trend = spendingInsight.trend;
  if (!trend || trend.direction === "up") return null;

  const percentDown = Math.abs(trend.changePercent * 100).toFixed(0);
  const isSig = Math.abs(trend.changePercent) >= 0.05;

  const Icon = isSig ? PartyPopper : TrendingDown;
  const message = isSig
    ? `Great job! 🎉 You spent ${percentDown}% less this month compared to last month.`
    : `Spending is down ${percentDown}% vs last month. Keep it up!`;

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3 rounded-xl border border-trend-up-surface bg-trend-up-surface px-4 py-3"
      exit={{ opacity: 0, y: -4 }}
      initial={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
    >
      <Icon aria-hidden="true" className="mt-0.5 shrink-0 text-trend-up-foreground" size={18} />
      <p className="text-interface-sm font-medium text-trend-up-foreground">{message}</p>
    </motion.div>
  );
}

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
        backgroundColor: "transparent",
        pointBackgroundColor: "var(--color-kpi-income)",
        pointBorderColor: "var(--color-surface)",
        pointBorderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 6,
        borderWidth: 2,
        tension: 0.45,
        fill: false,
      },
      {
        label: "Spending",
        data: spendingData,
        borderColor: "var(--color-kpi-expense)",
        backgroundColor: "rgba(249,115,22,0.07)",
        pointBackgroundColor: "var(--color-kpi-expense)",
        pointBorderColor: "var(--color-surface)",
        pointBorderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 6,
        borderWidth: 2,
        tension: 0.45,
        fill: true,
      },
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
      { label: "Income", data: incomeData, backgroundColor: "var(--color-kpi-income)", borderRadius: 4, borderWidth: 0 },
      { label: "Spending", data: spendingData, backgroundColor: "var(--color-kpi-expense)", borderRadius: 4, borderWidth: 0 },
    ],
  };
}

function buildOptions(): ChartOptions {
  return {
    animation: false,
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
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
            return ` ${ctx.dataset.label}: ₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
          },
        },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { maxTicksLimit: 8, font: { size: 11 } } },
      y: { beginAtZero: true, grid: { color: "var(--color-border)" }, ticks: { font: { size: 11 } } },
    },
  } as ChartOptions;
}

export function SpendingOverviewPanel({
  trendModel,
  spendingInsight,
  period,
}: SpendingOverviewPanelProps) {
  const { resolvedAppearance } = useTheme();
  const chartRef = useRef<MutableChartLike | null>(null);
  const [vizType, setVizType] = useState<ChartVisualization>("line");
  const isReady = trendModel.state === "ready";

  const lineData = useMemo(
    () => (isReady ? buildLineData(trendModel) : null),
    [isReady, trendModel],
  );
  const barData = useMemo(
    () => (isReady ? buildBarData(trendModel) : null),
    [isReady, trendModel],
  );

  const lineOptions = useMemo(() => buildOptions(), []);
  const barOptions = useMemo(() => buildOptions(), []);

  useEffect(() => {
    if (!chartRef.current) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    applyChartTheme(chartRef.current, createChartTheme({
      appearance: resolvedAppearance,
      reducedMotion: reduced,
      styles: window.getComputedStyle(document.documentElement),
    }));
  }, [resolvedAppearance, vizType]);

  return (
    <section
      aria-labelledby="spending-overview-title"
      className="flex flex-col rounded-2xl border border-border bg-surface p-5 shadow-sm"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-interface-md font-semibold text-foreground" id="spending-overview-title">
            Spending Overview
          </h2>
          <p className="mt-0.5 text-interface-xs text-foreground-secondary">{period}</p>
        </div>
        <div
          aria-label="Chart type"
          className="flex overflow-hidden rounded-lg border border-border"
          role="group"
        >
          {(["line", "bar"] as ChartVisualization[]).map((type) => (
            <button
              aria-pressed={vizType === type}
              className={cn(
                "inline-flex min-h-9 items-center gap-1.5 px-3 text-interface-xs font-semibold transition-colors duration-100",
                vizType === type
                  ? "bg-accent text-accent-foreground"
                  : "bg-surface text-foreground-secondary hover:bg-surface-subtle",
              )}
              key={type}
              onClick={() => setVizType(type)}
              type="button"
            >
              {type === "line" ? <LineChart aria-hidden="true" size={14} /> : <BarChart2 aria-hidden="true" size={14} />}
              <span>{type === "line" ? "Line" : "Bar"}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-4 text-interface-xs text-foreground-secondary">
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="inline-block h-2 w-4 rounded-sm bg-kpi-income" />
          Income
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="inline-block h-2 w-4 rounded-sm bg-kpi-expense" />
          Expense
        </span>
      </div>

      <div className="mt-4 min-h-[18rem] flex-1">
        {isReady && lineData && barData ? (
          <AnimatePresence mode="wait">
            <motion.div
              animate={{ opacity: 1 }}
              className="h-72"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              key={vizType}
              transition={{ duration: 0.18 }}
            >
              {vizType === "line" ? (
                <ChartCanvas
                  aria-label={`${trendModel.title} line chart`}
                  data={lineData}
                  options={lineOptions}
                  ref={(c) => { chartRef.current = c as unknown as MutableChartLike | null; }}
                  role="img"
                  tabIndex={-1}
                  type="line"
                />
              ) : (
                <ChartCanvas
                  aria-label={`${trendModel.title} bar chart`}
                  data={barData}
                  options={barOptions}
                  ref={(c) => { chartRef.current = c as unknown as MutableChartLike | null; }}
                  role="img"
                  tabIndex={-1}
                  type="bar"
                />
              )}
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="flex h-72 items-center justify-center">
            <p className="text-interface-sm text-foreground-secondary">
              {trendModel.state === "error"
                ? (trendModel.errorMessage ?? "Chart unavailable.")
                : "No transactions recorded for this period yet."}
            </p>
          </div>
        )}
      </div>

      <AnimatePresence>
        <SuccessBanner spendingInsight={spendingInsight} />
      </AnimatePresence>
    </section>
  );
}
