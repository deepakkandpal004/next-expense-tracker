import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { buildCategoryChartModel, buildTrendChartModel } from "../domain/chart-models";
import type { ResolvedPeriod, Transaction } from "../domain/types";
import { formatCurrency, formatDate, formatMetricValue, formatPercentage } from "./locale";

const locales = ["en-IN", "en-US", "de-DE", "ja-JP"] as const;
const currencies = ["INR", "USD", "EUR", "JPY"] as const;

describe("shared financial formatting property", () => {
  /** Validates: Requirements 6.12, 14.3, 14.4 */
  it("Property 12: shared financial formatting is consumer-independent", () => {
    fc.assert(fc.property(
      fc.constantFrom(...locales), fc.constantFrom(...currencies),
      fc.integer({ min: 1, max: 1_000_000 }), fc.integer({ min: 1, max: 1_000_000 }),
      fc.integer({ min: 1, max: 28 }),
      (locale, currency, firstAmount, secondAmount, day) => {
        const date = `2025-02-${String(day).padStart(2, "0")}`;
        const period: ResolvedPeriod = { kind: "custom", start: date, end: date, label: date };
        const options = { period, currency, locale, browserLocales: [], timeZone: "UTC" };
        const income: Transaction = { id: "income", description: "Income", amountMinor: firstAmount, currency, type: "income", categoryId: "Income", occurredOn: `${date}T12:00:00.000Z`, createdAt: `${date}T12:00:00.000Z` };
        const expense: Transaction = { ...income, id: "expense", amountMinor: secondAmount, type: "expense", categoryId: "Food" };
        const comparisonExpense: Transaction = { ...income, id: "comparison-expense", amountMinor: firstAmount, type: "expense", categoryId: "Shopping" };
        const sharedCurrency = formatCurrency({ minorValue: firstAmount, currency }, options);
        const sharedPercentage = formatPercentage(secondAmount / (firstAmount + secondAmount), options);
        expect(formatMetricValue({ status: "available", minorValue: firstAmount }, currency, options)).toBe(sharedCurrency);
        expect(buildTrendChartModel([income], options).rows[0].formattedValues[0]).toBe(sharedCurrency);
        expect(buildTrendChartModel([income], options).rows[0].label).toBe(formatDate(date, options));
        const foodRow = buildCategoryChartModel([income, expense, comparisonExpense], options).rows.find((row) => row.key === "Food");
        expect(foodRow?.formattedPercentages?.[0]).toBe(sharedPercentage);
      },
    ), { numRuns: 100 });
  });
});
