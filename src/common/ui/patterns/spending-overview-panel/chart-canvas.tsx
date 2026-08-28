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
} from "chart.js";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { Chart as ChartCanvas } from "react-chartjs-2";
import { useTheme } from "@/contexts/ThemeContext";
import { applyChartTheme, createChartTheme, type MutableChartLike } from "@/src/common/charts/chartjs";
import { buildBarData, buildLineData } from "./chart-data";
import { buildBarOptions, buildLineOptions } from "./chart-options";
import type { ChartVisualization, SpendingOverviewPanelProps } from "./types";

ChartJS.register(BarController, BarElement, CategoryScale, Filler, Legend, LineController, LineElement, LinearScale, PointElement, Tooltip);

interface SpendingChartCanvasProps {
  trendModel: SpendingOverviewPanelProps["trendModel"];
  currency: string;
  visualization: ChartVisualization;
  hiddenSeries: ReadonlySet<string>;
}

export function SpendingChartCanvas({ trendModel, currency, visualization, hiddenSeries }: SpendingChartCanvasProps) {
  const { resolvedAppearance } = useTheme();
  const chartRef = useRef<MutableChartLike | null>(null);
  const lineData = useMemo(() => buildLineData(trendModel), [trendModel]);
  const barData = useMemo(() => buildBarData(trendModel), [trendModel]);
  const lineOptions = useMemo(() => buildLineOptions(currency), [currency]);
  const barOptions = useMemo(() => buildBarOptions(currency), [currency]);

  const applyTheme = useCallback((chart: MutableChartLike | null) => {
    if (!chart) return;
    applyChartTheme(chart, createChartTheme({
      appearance: resolvedAppearance,
      reducedMotion: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
      styles: window.getComputedStyle(document.documentElement),
    }));
  }, [resolvedAppearance]);

  useEffect(() => applyTheme(chartRef.current), [applyTheme]);

  const filteredLineData = useMemo<ChartData<"line">>(
    () => ({ ...lineData, datasets: lineData.datasets.filter((dataset) => !hiddenSeries.has(dataset.label ?? "")) }),
    [hiddenSeries, lineData],
  );
  const filteredBarData = useMemo<ChartData<"bar">>(
    () => ({ ...barData, datasets: barData.datasets.filter((dataset) => !hiddenSeries.has(dataset.label ?? "")) }),
    [barData, hiddenSeries],
  );

  const setChartRef = (chart: ChartJS | null | undefined) => {
    chartRef.current = (chart ?? null) as unknown as MutableChartLike | null;
    requestAnimationFrame(() => applyTheme(chartRef.current));
  };

  return visualization === "line" ? (
    <ChartCanvas aria-label={`${trendModel.title} area chart`} data={filteredLineData} options={lineOptions} ref={setChartRef} role="img" tabIndex={-1} type="line" />
  ) : (
    <ChartCanvas aria-label={`${trendModel.title} bar chart`} data={filteredBarData} options={barOptions} ref={setChartRef} role="img" tabIndex={-1} type="bar" />
  );
}
