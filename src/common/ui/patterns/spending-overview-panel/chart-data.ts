import {
  type ChartData,
  type ChartDataset,
} from "chart.js";
import type { ChartModel } from "@/src/common/domain/types";

export function buildLineData(model: ChartModel): ChartData<"line"> {
  const labels = model.rows.map((row) => row.label);
  const incomeData = model.rows.map((row) => (row.values[0] ?? 0) / 100);
  const spendingData = model.rows.map((row) => (row.values[1] ?? 0) / 100);

  return {
    labels,
    datasets: [
      {
        label: "Income",
        data: incomeData,
        borderColor: "#4ADE80",
        backgroundColor: (ctx) => {
          const chart = ctx.chart;
          const { ctx: canvasCtx, chartArea } = chart;
          if (!chartArea) return "rgba(74, 222, 128, 0.08)";
          const gradient = canvasCtx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, "rgba(74, 222, 128, 0.18)");
          gradient.addColorStop(0.5, "rgba(74, 222, 128, 0.05)");
          gradient.addColorStop(1, "rgba(74, 222, 128, 0)");
          return gradient;
        },
        pointBackgroundColor: "#4ADE80",
        pointBorderColor: "#0B0F14",
        pointBorderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBorderWidth: 3,
        pointHoverBorderColor: "#0B0F14",
        borderWidth: 2.5,
        tension: 0.4,
        fill: true,
      } as ChartDataset<"line">,
      {
        label: "Spending",
        data: spendingData,
        borderColor: "#FF7AC6",
        backgroundColor: (ctx) => {
          const chart = ctx.chart;
          const { ctx: canvasCtx, chartArea } = chart;
          if (!chartArea) return "rgba(255, 122, 198, 0.08)";
          const gradient = canvasCtx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, "rgba(255, 122, 198, 0.15)");
          gradient.addColorStop(0.5, "rgba(255, 122, 198, 0.04)");
          gradient.addColorStop(1, "rgba(255, 122, 198, 0)");
          return gradient;
        },
        pointBackgroundColor: "#FF7AC6",
        pointBorderColor: "#0B0F14",
        pointBorderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBorderWidth: 3,
        pointHoverBorderColor: "#0B0F14",
        borderWidth: 2.5,
        tension: 0.4,
        fill: true,
      } as ChartDataset<"line">,
    ],
  };
}

export function buildBarData(model: ChartModel): ChartData<"bar"> {
  const labels = model.rows.map((row) => row.label);
  const incomeData = model.rows.map((row) => (row.values[0] ?? 0) / 100);
  const spendingData = model.rows.map((row) => (row.values[1] ?? 0) / 100);
  return {
    labels,
    datasets: [
      {
        label: "Income",
        data: incomeData,
        backgroundColor: "rgba(74, 222, 128, 0.75)",
        hoverBackgroundColor: "#4ADE80",
        borderRadius: 6,
        borderWidth: 0,
        maxBarThickness: 24,
        borderSkipped: false,
      } as ChartDataset<"bar">,
      {
        label: "Spending",
        data: spendingData,
        backgroundColor: "rgba(255, 122, 198, 0.75)",
        hoverBackgroundColor: "#FF7AC6",
        borderRadius: 6,
        borderWidth: 0,
        maxBarThickness: 24,
        borderSkipped: false,
      } as ChartDataset<"bar">,
    ],
  };
}
