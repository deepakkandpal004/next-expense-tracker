import {
  ArcElement,
  Chart as ChartJS,
  DoughnutController,
  Legend,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from "chart.js";
import { formatCurrency } from "@/lib/formatters/locale";
import type { CategoryBreakdownRow } from "@/lib/domain/types";

ChartJS.register(ArcElement, DoughnutController, Legend, Tooltip);

export function buildDoughnutData(rows: readonly CategoryBreakdownRow[]): ChartData<"doughnut"> {
  const defaultColors = ["#00DCE5", "#A855F7", "#22C55E", "#FBBF24", "#F04438", "#3B82F6", "#EC4899", "#F97316"];
  const styles = typeof window !== "undefined" ? window.getComputedStyle(document.documentElement) : null;
  return {
    labels: rows.map((row) => row.label),
    datasets: [{
      data: rows.map((row) => row.amountMinor / 100),
      backgroundColor: rows.map((row, i) => styles?.getPropertyValue(`--color-${row.semanticToken}`).trim() || defaultColors[i % defaultColors.length]),
      borderColor: styles?.getPropertyValue("--color-surface").trim() || "#080C10",
      borderWidth: 3,
      hoverOffset: 8,
      spacing: 2,
    }],
  };
}

export function buildDoughnutOptions(currency: string): ChartOptions<"doughnut"> {
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
        bodyColor: "#cbd5e1",
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
