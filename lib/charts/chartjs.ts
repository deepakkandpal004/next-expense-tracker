import type { ChartOptions } from "chart.js";

import type { ResolvedAppearance } from "../domain/types";

export const CHART_SEMANTIC_COLOR_VARIABLES = Object.freeze({
  text: "--color-text",
  mutedText: "--color-text-muted",
  border: "--color-border",
  surface: "--color-surface",
  primary: "--color-primary",
  danger: "--color-danger",
  "category-food": "--color-category-food",
  "category-transportation": "--color-category-transportation",
  "category-shopping": "--color-category-shopping",
  "category-entertainment": "--color-category-entertainment",
  "category-bills": "--color-category-bills",
  "category-healthcare": "--color-category-healthcare",
  "category-income": "--color-category-income",
  "category-other": "--color-category-other",
  "kpi-balance": "--color-kpi-balance",
  "kpi-income": "--color-kpi-income",
  "kpi-expense": "--color-kpi-expense",
  "kpi-savings": "--color-kpi-savings",
});

export type ChartSemanticColor = keyof typeof CHART_SEMANTIC_COLOR_VARIABLES;
export type ChartColorPalette = Readonly<Record<ChartSemanticColor, string>>;

export interface CssVariableReader {
  getPropertyValue(name: string): string;
}

export interface ChartTheme {
  appearance: ResolvedAppearance;
  colors: ChartColorPalette;
  animation: ChartOptions["animation"];
}

export interface ChartThemeOptions {
  appearance: ResolvedAppearance;
  reducedMotion: boolean;
  styles: CssVariableReader;
}

export interface SemanticChartDataset {
  semanticToken?: ChartSemanticColor;
  semanticTokens?: readonly ChartSemanticColor[];
  backgroundColor?: unknown;
  borderColor?: unknown;
  pointBackgroundColor?: unknown;
  pointBorderColor?: unknown;
}

export interface MutableChartLike {
  data: { datasets: SemanticChartDataset[] };
  options: {
    color?: string;
    scales?: Record<string, { ticks?: { color?: string }; grid?: { color?: string } }>;
  };
  update: (mode?: "none") => void;
}

/** Reduced-motion users get an immediate chart update rather than a transition. */
export function chartAnimation(reducedMotion: boolean): ChartOptions["animation"] {
  return reducedMotion ? false : { duration: 180, easing: "easeOutQuart" };
}

export function readChartColorPalette(styles: CssVariableReader): ChartColorPalette {
  return Object.fromEntries(
    Object.entries(CHART_SEMANTIC_COLOR_VARIABLES).map(([token, variable]) => [
      token,
      styles.getPropertyValue(variable).trim() || "currentColor",
    ]),
  ) as ChartColorPalette;
}

/** Resolves current semantic CSS variables so the canvas matches the active theme. */
export function createChartTheme({
  appearance,
  reducedMotion,
  styles,
}: ChartThemeOptions): ChartTheme {
  return {
    appearance,
    colors: readChartColorPalette(styles),
    animation: chartAnimation(reducedMotion),
  };
}

function colorFor(dataset: SemanticChartDataset, colors: ChartColorPalette): string | undefined {
  return dataset.semanticToken ? colors[dataset.semanticToken] : undefined;
}

function colorsFor(dataset: SemanticChartDataset, colors: ChartColorPalette): readonly string[] | undefined {
  return dataset.semanticTokens?.map((token) => colors[token]);
}

/**
 * Mutates only presentation properties of existing Chart.js datasets. Data
 * arrays, dataset objects, and caller-owned selected chart state remain intact.
 */
export function applyChartTheme(
  chart: MutableChartLike,
  theme: ChartTheme,
): void {
  for (const dataset of chart.data.datasets) {
    const dataPointColors = colorsFor(dataset, theme.colors);
    const color = colorFor(dataset, theme.colors);
    const nextColor = dataPointColors ?? color;
    if (!nextColor) continue;

    dataset.backgroundColor = nextColor;
    dataset.borderColor = nextColor;
    dataset.pointBackgroundColor = nextColor;
    dataset.pointBorderColor = theme.colors.surface;
  }

  chart.options.color = theme.colors.text;
  for (const scale of Object.values(chart.options.scales ?? {})) {
    if (scale.ticks) scale.ticks.color = theme.colors.mutedText;
    if (scale.grid) scale.grid.color = theme.colors.border;
  }

  // Theme changes should not introduce motion, even when normal chart motion is enabled.
  chart.update("none");
}
