"use client";

import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  DoughnutController,
  Filler,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
  type ChartData,
  type ChartOptions,
  type ChartType,
} from "chart.js";
import { Chart as ChartCanvas } from "react-chartjs-2";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import { AlertTriangle, Plus } from "lucide-react";
import { Button, LinkButton } from "@/components/ui/actions";
import { Card } from "@/components/ui/data-display";
import { EmptyState, ErrorState } from "@/components/ui/feedback";
import { useTheme } from "@/contexts/ThemeContext";
import type { ChartModel, ChartRow, ChartSeries } from "@/lib/domain/types";
import {
  applyChartTheme,
  createChartTheme,
  type ChartSemanticColor,
  type MutableChartLike,
  type SemanticChartDataset,
} from "@/lib/charts/chartjs";

ChartJS.register(
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  DoughnutController,
  Filler,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
);

export type ChartVisualization = "auto" | "bar" | "doughnut" | "line";

export interface AccessibleChartTableProps {
  model: ChartModel;
  id?: string;
}

export interface ChartPanelProps {
  model: ChartModel;
  visualization?: ChartVisualization;
  /** Shown as the empty-state primary action; omitted when no transaction entry point applies. */
  addTransactionHref?: string;
  /** Enables a scoped retry in the load-failure state without affecting sibling sections. */
  onRetry?: () => void;
  retrying?: boolean;
}

interface LegendItem {
  key: string;
  label: string;
  symbol: string;
  semanticToken?: string;
  detail?: string;
}

function resolveVisualization(model: ChartModel, visualization: ChartVisualization): Exclude<ChartVisualization, "auto"> {
  if (visualization !== "auto") return visualization;
  return model.series.length === 1 ? "doughnut" : "line";
}

function chartData(model: ChartModel, visualization: Exclude<ChartVisualization, "auto">): ChartData<ChartType, number[], string> {
  const labels = model.rows.map((row) => row.label);
  const datasets: Array<SemanticChartDataset & { data: number[]; label: string; borderWidth: number }> = visualization === "doughnut"
    ? [{
      label: model.series[0]?.label ?? model.title,
      data: model.rows.map((row) => row.values[0] ?? 0),
      semanticTokens: model.rows.map((row) => (row.semanticToken ?? model.series[0]?.semanticToken) as ChartSemanticColor),
      borderWidth: 2,
    }]
    : model.series.map((series, index) => ({
      label: series.label,
      data: model.rows.map((row) => row.values[index] ?? 0),
      semanticToken: series.semanticToken as ChartSemanticColor,
      borderWidth: 2,
    }));

  return { labels, datasets } as unknown as ChartData<ChartType, number[], string>;
}

function chartOptions(visualization: Exclude<ChartVisualization, "auto">): ChartOptions<ChartType> {
  return {
    animation: false,
    maintainAspectRatio: false,
    responsive: true,
    plugins: { legend: { display: false } },
    ...(visualization === "doughnut" ? {} : {
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true },
      },
    }),
  } as ChartOptions<ChartType>;
}

function valueCell(row: ChartRow, index: number): string {
  const formatted = row.formattedValues[index] ?? String(row.values[index] ?? "");
  const percentage = row.formattedPercentages?.[index];
  return percentage ? `${formatted} (${percentage})` : formatted;
}

function seriesHeader(series: ChartSeries, unitLabel: string): string {
  return `${series.label} (${series.symbol}; ${unitLabel})`;
}

function legendItems(model: ChartModel, visualization: Exclude<ChartVisualization, "auto">): readonly LegendItem[] {
  if (visualization === "doughnut") {
    return model.rows.map((row) => ({
      key: row.key,
      label: row.label,
      symbol: row.symbol ?? model.series[0]?.symbol ?? "value",
      semanticToken: row.semanticToken ?? model.series[0]?.semanticToken,
      detail: valueCell(row, 0),
    }));
  }
  return model.series.map((series) => ({
    key: series.id,
    label: series.label,
    symbol: series.symbol,
    semanticToken: series.semanticToken,
  }));
}

export function AccessibleChartTable({ model, id }: AccessibleChartTableProps) {
  const caption = `${model.title} data for ${model.periodLabel}. Values are in ${model.unitLabel}.`;
  return (
    <div aria-label={`Data table: ${model.title}`} id={id} role="region" tabIndex={-1}>
      <table className="w-full min-w-max border-collapse text-left text-interface-sm">
        <caption className="p-3 text-left font-semibold text-foreground">{caption}</caption>
        <thead className="bg-surface-subtle text-foreground">
          <tr>
            <th className="border-y border-border px-3 py-2 font-semibold" scope="col">Group</th>
            {model.series.map((series) => (
              <th className="border-y border-border px-3 py-2 text-right font-semibold" key={series.id} scope="col">
                {seriesHeader(series, model.unitLabel)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {model.rows.map((row) => (
            <tr className="border-b border-border last:border-0" key={row.key}>
              <th className="px-3 py-3 text-left font-medium text-foreground" scope="row">
                {row.symbol ? <span aria-hidden="true">{row.symbol} </span> : null}{row.label}
              </th>
              {model.series.map((series, index) => (
                <td className="financial-value px-3 py-3 text-right text-foreground" data-value={row.values[index]} key={series.id}>
                  {valueCell(row, index)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ChartPanel({ model, visualization = "auto", addTransactionHref, onRetry, retrying = false }: ChartPanelProps) {
  const { resolvedAppearance } = useTheme();
  const chartRef = useRef<MutableChartLike | null>(null);
  const [showTable, setShowTable] = useState(false);
  const generatedId = useId().replace(/:/g, "");
  const titleId = `chart-title-${generatedId}`;
  const tableId = `chart-data-${generatedId}`;
  const visualType = resolveVisualization(model, visualization);
  const isReady = model.state === "ready";
  const data = useMemo(() => (isReady ? chartData(model, visualType) : null), [isReady, model, visualType]);
  const options = useMemo(() => chartOptions(visualType), [visualType]);
  const items = useMemo(() => (isReady ? legendItems(model, visualType) : []), [isReady, model, visualType]);

  useEffect(() => {
    if (!chartRef.current || !data) return;
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    applyChartTheme(chartRef.current, createChartTheme({
      appearance: resolvedAppearance,
      reducedMotion,
      styles: window.getComputedStyle(document.documentElement),
    }));
  }, [data, resolvedAppearance]);

  useEffect(() => {
    if (showTable) document.getElementById(tableId)?.focus();
  }, [showTable, tableId]);

  return (
    <Card aria-labelledby={titleId} as="section" elevation="raised" className="space-y-4">
      <header>
        <h2 className="text-display-sm font-semibold text-foreground" id={titleId}>{model.title}</h2>
        <p className="mt-1 text-interface-sm text-foreground-secondary">{model.periodLabel} · Values in {model.unitLabel}</p>
        {model.interpretation ? <p className="mt-2 text-interface-sm text-foreground">{model.interpretation}</p> : null}
      </header>

      {model.state === "error" ? (
        <ErrorState
          action={onRetry ? <Button icon={<AlertTriangle size={18} />} label="Retry chart" loading={retrying} onClick={onRetry} /> : undefined}
          description={model.errorMessage ?? "This chart could not be loaded. Please retry."}
          title="Chart unavailable"
        />
      ) : model.state === "empty" ? (
        <EmptyState
          action={addTransactionHref ? <LinkButton href={addTransactionHref} icon={<Plus size={18} />} label="Add transaction" /> : undefined}
          description="No transactions are recorded for this reporting period yet."
          title="No data to display"
        />
      ) : (
        <>
          <div className="h-72 min-w-0" role="group" aria-label={`${model.title} visualization`}>
            <ChartCanvas
              aria-label={`${model.title} visual chart. Use View data table for the complete data.`}
              data={data!}
              options={options}
              ref={(chart) => { chartRef.current = chart as unknown as MutableChartLike | null; }}
              role="img"
              tabIndex={-1}
              type={visualType}
            />
          </div>
          <ul aria-label={`${model.title} legend`} className="grid gap-2 text-interface-sm sm:grid-cols-2">
            {items.map((item) => (
              <li className="flex min-w-0 items-center gap-2" key={item.key}>
                <span aria-hidden="true" className="h-3 w-3 shrink-0 rounded-circular border border-border" style={{ backgroundColor: item.semanticToken ? `var(--color-${item.semanticToken})` : "currentColor" }} />
                <span className="min-w-0 break-words text-foreground">{item.symbol}: {item.label}{item.detail ? ` — ${item.detail}` : ""}</span>
              </li>
            ))}
          </ul>
          <Button aria-controls={tableId} aria-expanded={showTable} intent="secondary" label={showTable ? "Hide data table" : "View data table"} onClick={() => setShowTable((visible) => !visible)} />
          {showTable ? <div className="custom-scrollbar max-w-full overflow-x-auto rounded-container border border-border"><AccessibleChartTable id={tableId} model={model} /></div> : null}
        </>
      )}
    </Card>
  );
}
