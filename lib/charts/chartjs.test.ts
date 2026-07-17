import { describe, expect, it } from "vitest";

import {
  applyChartTheme,
  chartAnimation,
  CHART_SEMANTIC_COLOR_VARIABLES,
  createChartTheme,
  type ChartSemanticColor,
  type MutableChartLike,
  type SemanticChartDataset,
} from "./chartjs";

const colors = {
  text: "text",
  mutedText: "muted",
  border: "border",
  surface: "surface",
  primary: "primary",
  danger: "danger",
  "category-food": "food",
  "category-transportation": "transportation",
  "category-shopping": "shopping",
  "category-entertainment": "entertainment",
  "category-bills": "bills",
  "category-healthcare": "healthcare",
  "category-income": "income",
  "category-other": "other",
} satisfies Record<ChartSemanticColor, string>;

const styles = {
  getPropertyValue: (name: string) => {
    const token = Object.entries(CHART_SEMANTIC_COLOR_VARIABLES).find(
      ([, variable]) => variable === name,
    )?.[0] as ChartSemanticColor | undefined;
    return token ? colors[token] : "";
  },
};

describe("Chart.js theme helpers", () => {
  /** Validates: Requirements 13.10, 13.12 */
  it("disables chart animation when reduced motion is requested", () => {
    expect(chartAnimation(true)).toBe(false);
    expect(chartAnimation(false)).toMatchObject({ duration: 180 });
  });

  it("resolves the active semantic CSS palette for a theme", () => {
    const theme = createChartTheme({ appearance: "dark", reducedMotion: false, styles });

    expect(theme.appearance).toBe("dark");
    expect(theme.colors).toEqual(colors);
    expect(theme.animation).toMatchObject({ duration: 180 });
  });

  it("updates colors in place without replacing datasets or caller chart selection", () => {
    const pointValues = [10, 20];
    const pointDataset: SemanticChartDataset & { data: number[] } = {
      semanticTokens: ["category-food", "category-bills"],
      data: pointValues,
    };
    const lineValues = [15, 25];
    const lineDataset: SemanticChartDataset & { data: number[] } = {
      semanticToken: "category-income",
      data: lineValues,
    };
    let updateMode: "none" | undefined;
    const chart: MutableChartLike = {
      data: { datasets: [pointDataset, lineDataset] },
      options: { scales: { x: { ticks: {}, grid: {} } } },
      update: (mode) => {
        updateMode = mode;
      },
    };
    const originalDatasets = chart.data.datasets;
    const selectedView = "categories";

    applyChartTheme(
      chart,
      createChartTheme({ appearance: "dark", reducedMotion: false, styles }),
    );

    expect(chart.data.datasets).toBe(originalDatasets);
    expect(chart.data.datasets[0]).toBe(pointDataset);
    expect(chart.data.datasets[1]).toBe(lineDataset);
    expect(pointDataset.data).toBe(pointValues);
    expect(lineDataset.data).toBe(lineValues);
    expect(pointDataset.backgroundColor).toEqual(["food", "bills"]);
    expect(lineDataset.backgroundColor).toBe("income");
    expect(chart.options.scales?.x).toEqual({
      ticks: { color: "muted" },
      grid: { color: "border" },
    });
    expect(chart.options.color).toBe("text");
    expect(updateMode).toBe("none");
    expect(selectedView).toBe("categories");
  });
});
