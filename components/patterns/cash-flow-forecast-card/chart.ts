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
import { formatCurrency } from "@/lib/formatters/locale";
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

export const LINE_COLOR = "#00DCE5";

export function buildData(projection: CashFlowProjection): ChartData<"line"> {
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

export function buildOptions(currency: string): ChartOptions {
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
