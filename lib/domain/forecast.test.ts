import { describe, it, expect } from "vitest";
import {
  computeSpendingForecast,
  computeCategoryAverages,
  detectAnomalies,
  type MonthlySpendingSummary,
  type CategoryMonthlySpending,
} from "./forecast";

describe("computeSpendingForecast", () => {
  it("returns insufficient-data when fewer than 2 months", () => {
    const result = computeSpendingForecast([{ month: "2025-01", totalMinor: 10000, transactionCount: 5 }]);
    expect(result.status).toBe("insufficient-data");
  });

  it("computes a forecast with 3+ months of data", () => {
    const summaries: MonthlySpendingSummary[] = [
      { month: "2025-01", totalMinor: 30000, transactionCount: 10 },
      { month: "2025-02", totalMinor: 32000, transactionCount: 12 },
      { month: "2025-03", totalMinor: 35000, transactionCount: 11 },
    ];
    const result = computeSpendingForecast(summaries);
    expect(result.status).toBe("available");
    expect(result.monthsAnalyzed).toBe(3);
    expect(result.confidence).toBe("moderate");
    expect(result.predictedNextMonthMinor).toBeGreaterThan(0);
    expect(result.averageMonthlyMinor).toBeGreaterThan(0);
  });

  it("detects increasing trend >10%", () => {
    const summaries: MonthlySpendingSummary[] = [
      { month: "2025-01", totalMinor: 10000, transactionCount: 5 },
      { month: "2025-02", totalMinor: 15000, transactionCount: 6 },
      { month: "2025-03", totalMinor: 20000, transactionCount: 7 },
      { month: "2025-04", totalMinor: 25000, transactionCount: 8 },
    ];
    const result = computeSpendingForecast(summaries);
    expect(result.trend).toBe("increasing");
    expect(result.changePercent).toBeGreaterThanOrEqual(66);
  });

  it("detects decreasing trend", () => {
    const summaries: MonthlySpendingSummary[] = [
      { month: "2025-01", totalMinor: 50000, transactionCount: 10 },
      { month: "2025-02", totalMinor: 40000, transactionCount: 8 },
      { month: "2025-03", totalMinor: 30000, transactionCount: 6 },
      { month: "2025-04", totalMinor: 20000, transactionCount: 4 },
    ];
    const result = computeSpendingForecast(summaries);
    expect(result.trend).toBe("decreasing");
  });

  it("detects stable trend when change is within 10%", () => {
    const summaries: MonthlySpendingSummary[] = [
      { month: "2025-01", totalMinor: 20000, transactionCount: 5 },
      { month: "2025-02", totalMinor: 20500, transactionCount: 6 },
      { month: "2025-03", totalMinor: 21000, transactionCount: 5 },
      { month: "2025-04", totalMinor: 19500, transactionCount: 6 },
    ];
    const result = computeSpendingForecast(summaries);
    expect(result.trend).toBe("stable");
  });

  it("high confidence with 6+ months", () => {
    const summaries: MonthlySpendingSummary[] = Array.from({ length: 6 }, (_, i) => ({
      month: `2025-${String(i + 1).padStart(2, "0")}`,
      totalMinor: 20000 + i * 1000,
      transactionCount: 5,
    }));
    const result = computeSpendingForecast(summaries);
    expect(result.confidence).toBe("high");
  });

  it("handles empty input", () => {
    const result = computeSpendingForecast([]);
    expect(result.status).toBe("insufficient-data");
  });
});

describe("computeCategoryAverages", () => {
  it("computes average, median, and std dev per category", () => {
    const input: CategoryMonthlySpending[] = [
      { categoryId: "food", label: "food", month: "2025-01", totalMinor: 10000 },
      { categoryId: "food", label: "food", month: "2025-02", totalMinor: 20000 },
      { categoryId: "food", label: "food", month: "2025-03", totalMinor: 30000 },
      { categoryId: "transport", label: "transport", month: "2025-01", totalMinor: 5000 },
    ];
    const result = computeCategoryAverages(input);
    const food = result.find(c => c.categoryId === "food");
    expect(food).toBeDefined();
    expect(food!.averageMinor).toBe(20000);
    expect(food!.medianMinor).toBe(20000);
    expect(food!.transactionCount).toBe(3);
    expect(food!.stdDevMinor).toBeGreaterThan(0);

    const transport = result.find(c => c.categoryId === "transport");
    expect(transport).toBeDefined();
    expect(transport!.averageMinor).toBe(5000);
  });

  it("returns empty array for no data", () => {
    const result = computeCategoryAverages([]);
    expect(result).toEqual([]);
  });
});

describe("detectAnomalies", () => {
  const cartAverages = [{
    categoryId: "shopping",
    label: "Shopping",
    averageMinor: 5000,
    medianMinor: 4500,
    stdDevMinor: 2000,
    transactionCount: 10,
  }];

  it("flags transactions with high deviation multiplier", () => {
    const records = [
      { id: "1", description: "Laptop", amountMinor: 50000, categoryId: "shopping", occurredOn: "2025-03-15" },
      { id: "2", description: "Shirt", amountMinor: 3000, categoryId: "shopping", occurredOn: "2025-03-16" },
    ];
    const result = detectAnomalies(records, cartAverages);
    expect(result).toHaveLength(1);
    expect(result[0].transactionId).toBe("1");
    expect(result[0].deviationMultiplier).toBe(10);
    expect(result[0].severity).toBe("high");
  });

  it("marks medium severity at 2x-3x", () => {
    const records = [
      { id: "1", description: "Jacket", amountMinor: 12000, categoryId: "shopping", occurredOn: "2025-03-15" },
    ];
    const result = detectAnomalies(records, cartAverages);
    expect(result).toHaveLength(1);
    expect(result[0].severity).toBe("medium");
    expect(result[0].deviationMultiplier).toBe(2.4);
  });

  it("skips transactions below 1.5x multiplier", () => {
    const records = [
      { id: "1", description: "Socks", amountMinor: 6000, categoryId: "shopping", occurredOn: "2025-03-15" },
    ];
    const result = detectAnomalies(records, cartAverages);
    expect(result).toHaveLength(0);
  });

  it("skips categories with insufficient data", () => {
    const records = [
      { id: "1", description: "Strange", amountMinor: 99999, categoryId: "unknown", occurredOn: "2025-03-15" },
    ];
    const result = detectAnomalies(records, []);
    expect(result).toHaveLength(0);
  });

  it("sorts anomalies by deviation desc", () => {
    const records = [
      { id: "1", description: "Big", amountMinor: 100000, categoryId: "shopping", occurredOn: "2025-03-15" },
      { id: "2", description: "Medium", amountMinor: 30000, categoryId: "shopping", occurredOn: "2025-03-15" },
    ];
    const result = detectAnomalies(records, cartAverages);
    expect(result[0].transactionId).toBe("1");
    expect(result[1].transactionId).toBe("2");
  });
});
