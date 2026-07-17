import { describe, expect, it } from "vitest";

import { formatCurrency, formatDate, formatPercentage } from "../formatters/locale";
import {
  buildCategoryChartModel,
  buildTrendChartModel,
} from "./chart-models";
import type { ResolvedPeriod, Transaction } from "./types";

const period: ResolvedPeriod = {
  kind: "custom",
  start: "2025-03-01",
  end: "2025-03-31",
  label: "Legacy label is not used by localized chart output",
};
const options = { period, currency: "INR", locale: "en-US" };

function transaction(
  id: string,
  occurredOn: string,
  type: "income" | "expense",
  amountMinor: number,
  categoryId = type === "income" ? "Income" : "Food",
): Transaction {
  return {
    id,
    description: id,
    amountMinor,
    currency: "INR",
    type,
    categoryId,
    occurredOn,
    createdAt: occurredOn,
  };
}

describe("shared chart-model builders", () => {
  /** Validates: Requirements 6.1, 6.2, 6.3, 6.13 */
  it("builds a localized time series with non-color series semantics", () => {
    const trend = buildTrendChartModel(
      [
        transaction("income", "2025-03-01T08:00:00.000Z", "income", 10_000),
        transaction("food", "2025-03-01T12:00:00.000Z", "expense", 2_500),
        transaction("bills", "2025-03-03T12:00:00.000Z", "expense", 1_500, "Bills"),
      ],
      options,
    );

    expect(trend).toMatchObject({
      state: "ready",
      title: "Income and spending trend",
      periodLabel: `${formatDate(period.start, options)} – ${formatDate(period.end, options)}`,
      unit: "currency",
      unitLabel: "INR",
      series: [
        { id: "income", label: "Income", semanticToken: "category-income", symbol: "star" },
        { id: "spending", label: "Spending", semanticToken: "danger", symbol: "circle" },
      ],
    });
    expect(trend.rows).toEqual([
      {
        key: "2025-03-01",
        label: formatDate("2025-03-01", options),
        values: [10_000, 2_500],
        formattedValues: [
          formatCurrency({ minorValue: 10_000, currency: "INR" }, options),
          formatCurrency({ minorValue: 2_500, currency: "INR" }, options),
        ],
      },
      {
        key: "2025-03-03",
        label: formatDate("2025-03-03", options),
        values: [0, 1_500],
        formattedValues: [
          formatCurrency({ minorValue: 0, currency: "INR" }, options),
          formatCurrency({ minorValue: 1_500, currency: "INR" }, options),
        ],
      },
    ]);
    expect(trend.interpretation).toBe(
      `Recorded income of ${formatCurrency({ minorValue: 10_000, currency: "INR" }, options)} and spending of ${formatCurrency({ minorValue: 4_000, currency: "INR" }, options)} across 2 days.`,
    );
  });

  /** Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.13 */
  it("builds a category distribution with registry tokens, symbols, and localized shares", () => {
    const categories = buildCategoryChartModel(
      [
        transaction("food", "2025-03-01T12:00:00.000Z", "expense", 5_000),
        transaction("bills", "2025-03-02T12:00:00.000Z", "expense", 3_000, "Bills"),
        transaction("unknown", "2025-03-03T12:00:00.000Z", "expense", 2_000, "Groceries"),
        transaction("income", "2025-03-03T12:00:00.000Z", "income", 10_000),
      ],
      options,
    );

    expect(categories).toMatchObject({
      state: "ready",
      title: "Spending by category",
      series: [{ id: "spending", label: "Spending", semanticToken: "danger", symbol: "circle" }],
    });
    expect(categories.rows).toEqual([
      expect.objectContaining({
        key: "Food",
        label: "Food & dining",
        values: [5_000],
        formattedValues: [formatCurrency({ minorValue: 5_000, currency: "INR" }, options)],
        percentages: [0.5],
        formattedPercentages: [formatPercentage(0.5, options)],
        semanticToken: "category-food",
        symbol: "circle",
      }),
      expect.objectContaining({
        key: "Bills",
        label: "Bills & utilities",
        values: [3_000],
        semanticToken: "category-bills",
        symbol: "cross",
      }),
      expect.objectContaining({
        key: "Other",
        label: "Other",
        values: [2_000],
        semanticToken: "category-other",
        symbol: "dash",
      }),
    ]);
    expect(categories.interpretation).toBe(
      `Food & dining is the largest spending category at ${formatCurrency({ minorValue: 5_000, currency: "INR" }, options)} (${formatPercentage(0.5, options)} of recorded spending).`,
    );
  });

  it("represents an active subset without expenses as an empty category chart", () => {
    expect(
      buildCategoryChartModel(
        [transaction("income", "2025-03-01T12:00:00.000Z", "income", 10_000)],
        options,
      ),
    ).toMatchObject({ state: "empty", title: "Spending by category", rows: [], series: [] });
  });
});
