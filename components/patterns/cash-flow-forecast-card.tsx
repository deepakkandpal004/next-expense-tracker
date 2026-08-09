"use client";

import {
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
import { motion } from "motion/react";
import { Clock, TrendingDown, TrendingUp } from "lucide-react";
import { useMemo } from "react";
import { Chart as ChartCanvas } from "react-chartjs-2";
import { formatCurrency } from "@/lib/formatters/locale";
import { cn } from "@/lib/ui/cn";
import type { CashFlowProjection } from "@/lib/domain/cash-flow";

ChartJS.register(
  CategoryScale,
  Filler,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
);

export interface CashFlowForecastCardProps {
  projection: CashFlowProjection;
}

const LINE_COLOR = "#00DCE5";

function buildData(projection: CashFlowProjection): ChartData<"line"> {
  const labels = projection.daily.map((point) => point.label);
  const balances = projection.daily.map((point) => point.balanceMinor / 100);
  const recordedIndex = projection.daily.findIndex((point) => point.state === "projected");
  const boundary = recordedIndex >= 0 ? recordedIndex : projection.daily.length;

  return {
    labels,
    datasets: [
      {
        label: "Balance",
        data: balances,
        borderColor: LINE_COLOR,
        backgroundColor: "rgba(0, 220, 229, 0.10)",
        fill: true,
        tension: 0.4,
        borderWidth: 2.5,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBorderWidth: 3,
        pointHoverBorderColor: "#0B0F14",
        segment: {
          borderDash: (context) =>
            (context.p0DataIndex ?? 0) >= boundary ? [6, 6] : undefined,
        },
      } as ChartData<"line">["datasets"][number],
    ],
  };
}

function buildOptions(currency: string): ChartOptions {
  return {
    animation: { duration: 800, easing: "easeOutQuart" },
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(10, 15, 22, 0.95)",
        titleColor: "#F5F7FA",
        bodyColor: "#C5CCD6",
        borderColor: "rgba(255, 255, 255, 0.08)",
        borderWidth: 1,
        cornerRadius: 10,
        padding: { top: 10, bottom: 10, left: 14, right: 14 },
        displayColors: false,
        callbacks: {
          title: (items) => `Day ${items[0]?.label ?? ""}`,
          label: (ctx) => {
            const value = typeof ctx.raw === "number" ? ctx.raw : 0;
            return ` Balance: ${formatCurrency({ minorValue: Math.round(value * 100), currency })}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          maxTicksLimit: 8,
          font: { size: 11, weight: 500 },
          color: "#5B6472",
          padding: 8,
        },
      },
      y: {
        border: { display: false },
        grid: { color: "rgba(255, 255, 255, 0.05)", lineWidth: 1 },
        ticks: {
          font: { size: 11 },
          color: "#5B6472",
          padding: 12,
          maxTicksLimit: 6,
          callback: (value) =>
            formatCurrency({
              minorValue: Math.round((typeof value === "number" ? value : 0) * 100),
              currency,
            }),
        },
      },
    },
  } as ChartOptions;
}

export function CashFlowForecastCard({ projection }: CashFlowForecastCardProps) {
  const data = useMemo(() => buildData(projection), [projection]);
  const options = useMemo(() => buildOptions(projection.currency), [projection.currency]);

  const isEnded = projection.state === "ended";
  const netMinor = projection.projectedIncomeMinor - projection.projectedSpendMinor;
  const netPositive = netMinor >= 0;

  return (
    <section
      aria-labelledby="cash-flow-title"
      className="relative overflow-hidden glass-vessel"
    >
      <div className="relative flex flex-wrap items-center justify-between gap-3 px-5 pt-5 pb-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground" id="cash-flow-title">
            Cash-Flow Forecast
          </h2>
          <p className="mt-0.5 text-xs text-foreground-secondary">
            {projection.period.label}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isEnded ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-[11px] font-semibold text-foreground-secondary">
              <Clock size={12} aria-hidden="true" />
              Period ended
            </span>
          ) : (
            <motion.span
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold",
                netPositive
                  ? "bg-[#4ADE80]/10 text-[#4ADE80]"
                  : "bg-[#F5A524]/10 text-[#F5A524]",
              )}
            >
              {netPositive ? (
                <TrendingUp aria-hidden="true" size={12} />
              ) : (
                <TrendingDown aria-hidden="true" size={12} />
              )}
              {netPositive ? "Surplus" : "Deficit"} projected
            </motion.span>
          )}
        </div>
      </div>

      <div className="relative px-5 pb-4">
        <p className="text-xs text-foreground-secondary">Month-end balance</p>
        <p className="mt-0.5 text-3xl font-bold tracking-tight tabular-nums text-foreground">
          {formatCurrency({
            minorValue: projection.projectedMonthEndMinor,
            currency: projection.currency,
          })}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-foreground-secondary">
          <span>
            Income{" "}
            <span className="font-semibold text-foreground">
              {formatCurrency({
                minorValue: projection.projectedIncomeMinor,
                currency: projection.currency,
              })}
            </span>
          </span>
          <span>
            Spending{" "}
            <span className="font-semibold text-foreground">
              {formatCurrency({
                minorValue: projection.projectedSpendMinor,
                currency: projection.currency,
              })}
            </span>
          </span>
          {!isEnded && (
            <span>
              {projection.daysRemaining} day{projection.daysRemaining === 1 ? "" : "s"} to go
            </span>
          )}
        </div>
      </div>

      <div className="relative px-5">
        <div className="h-56 w-full sm:h-64">
          <ChartCanvas
            aria-label={`Day-by-day projected balance for ${projection.period.label}`}
            data={data}
            options={options}
            role="img"
            tabIndex={-1}
            type="line"
          />
        </div>
      </div>

      <div className="relative px-5 py-4">
        <div className="flex items-center gap-4 text-[11px] text-foreground-secondary">
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block h-0.5 w-4 rounded-full"
              style={{ backgroundColor: LINE_COLOR }}
            />
            Recorded
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block h-0.5 w-4 rounded-full border-t-2 border-dashed"
              style={{ borderColor: LINE_COLOR }}
            />
            Projected
          </span>
        </div>
      </div>
    </section>
  );
}