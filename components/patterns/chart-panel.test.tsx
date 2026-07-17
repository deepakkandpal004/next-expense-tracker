import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("react-chartjs-2", () => ({
  Chart: ({ "aria-label": label }: { "aria-label": string }) => <div aria-label={label} role="img" />,
}));
vi.mock("@/contexts/ThemeContext", () => ({
  useTheme: () => ({ resolvedAppearance: "light" }),
}));

import type { ChartModel } from "@/lib/domain/types";
import { AccessibleChartTable, ChartPanel } from "./chart-panel";

const trendModel: ChartModel = {
  state: "ready",
  title: "Income and spending trend",
  periodLabel: "March 1 – March 31, 2025",
  unit: "currency",
  unitLabel: "INR",
  interpretation: "Income exceeded spending during the selected period.",
  series: [
    { id: "income", label: "Income", semanticToken: "category-income", symbol: "star" },
    { id: "spending", label: "Spending", semanticToken: "danger", symbol: "circle" },
  ],
  rows: [
    {
      key: "2025-03-01",
      label: "March 1, 2025",
      values: [150_000, 42_000],
      formattedValues: ["₹1,500.00", "₹420.00"],
    },
  ],
};

describe("AccessibleChartTable", () => {
  /** Validates: Requirements 6.5, 6.6, 6.14 */
  it("exposes every chart group, series, formatted value, and unit in a semantic table", () => {
    render(<AccessibleChartTable id="trend-data" model={trendModel} />);

    const table = screen.getByRole("table", { name: /income and spending trend data/i });
    expect(table).toHaveAccessibleName(/income and spending trend data/i);
    expect(table.querySelector("caption")).toHaveTextContent("March 1 – March 31, 2025");
    expect(table.querySelector("caption")).toHaveTextContent("INR");
    expect(screen.getByRole("columnheader", { name: "Group" })).toHaveAttribute("scope", "col");
    expect(screen.getByRole("columnheader", { name: /income.*inr/i })).toHaveAttribute("scope", "col");
    expect(screen.getByRole("columnheader", { name: /spending.*inr/i })).toHaveAttribute("scope", "col");
    expect(screen.getByRole("rowheader", { name: /march 1, 2025/i })).toHaveAttribute("scope", "row");
    expect(screen.getByText("₹1,500.00")).toBeInTheDocument();
    expect(screen.getByText("₹420.00")).toBeInTheDocument();
  });
});


describe("ChartPanel states", () => {
  /** Validates: Requirements 6.1–6.14, 10.1, 12.17, 13.10, 13.12 */
  it("shows complete context and a keyboard-reachable equivalent table", async () => {
    const user = userEvent.setup();
    render(<ChartPanel model={trendModel} visualization="line" />);
    expect(screen.getByRole("heading", { name: trendModel.title })).toBeInTheDocument();
    expect(screen.getByText(/March 1 – March 31, 2025 · Values in INR/)).toBeInTheDocument();
    expect(screen.getByText(trendModel.interpretation!)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "View data table" }));
    const tableRegion = screen.getByRole("region", { name: `Data table: ${trendModel.title}` });
    await waitFor(() => expect(tableRegion).toHaveFocus());
  });

  it("distinguishes empty data from a chart load failure", async () => {
    const retry = vi.fn();
    const empty: ChartModel = { ...trendModel, state: "empty", rows: [], series: [] };
    const { rerender } = render(<ChartPanel addTransactionHref="/records?addTransaction=1" model={empty} />);
    expect(screen.getByRole("heading", { name: "No data to display" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Add transaction" })).toHaveAttribute("href", "/records?addTransaction=1");

    const failed: ChartModel = { ...empty, state: "error", errorMessage: "Chart data is unavailable." };
    rerender(<ChartPanel model={failed} onRetry={retry} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Chart data is unavailable.");
    await userEvent.click(screen.getByRole("button", { name: "Retry chart" }));
    expect(retry).toHaveBeenCalledOnce();
  });
});