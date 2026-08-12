import type { ChartOptions } from "chart.js";

function buildTooltip(currency: string, pointStyle: string) {
  return {
    enabled: true,
    backgroundColor: "rgba(10, 15, 22, 0.95)",
    titleColor: "#F5F7FA",
    bodyColor: "#C5CCD6",
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    padding: { top: 10, bottom: 10, left: 14, right: 14 },
    cornerRadius: 10,
    boxPadding: 4,
    caretSize: 0,
    displayColors: true,
    usePointStyle: true,
    pointStyle,
    callbacks: {
      title: (items: { label?: string }[]) => items[0]?.label ?? "",
      label: (ctx: { raw: unknown; dataset: { label?: string } }) => {
        const value = typeof ctx.raw === "number" ? ctx.raw : 0;
        return ` ${ctx.dataset.label}: ${currency}${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
      },
    },
  };
}

function buildScales(currency: string) {
  return {
    x: {
      grid: { display: false },
      border: { display: false },
      ticks: {
        maxTicksLimit: 7,
        font: { size: 11, weight: 500 },
        color: "#5B6472",
        padding: 8,
      },
    },
    y: {
      beginAtZero: true,
      border: { display: false },
      grid: {
        color: "rgba(255, 255, 255, 0.05)",
        lineWidth: 1,
      },
      ticks: {
        font: { size: 11 },
        color: "#5B6472",
        padding: 12,
        maxTicksLimit: 6,
        callback: (value: number) => {
          const num = typeof value === "number" ? value : 0;
          if (num >= 100000) return `${currency}${(num / 100000).toFixed(1)}L`;
          if (num >= 1000) return `${currency}${(num / 1000).toFixed(0)}K`;
          return `${currency}${num}`;
        },
      },
    },
  };
}

export function buildLineOptions(currency: string): ChartOptions {
  return {
    animation: { duration: 800, easing: "easeOutQuart" },
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: buildTooltip(currency, "circle"),
    },
    scales: buildScales(currency),
  } as ChartOptions;
}

export function buildBarOptions(currency: string): ChartOptions {
  return {
    animation: { duration: 800, easing: "easeOutQuart" },
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: buildTooltip(currency, "rectRounded"),
    },
    scales: buildScales(currency),
  } as ChartOptions;
}
