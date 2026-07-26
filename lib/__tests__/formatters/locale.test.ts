import { describe, it, expect } from "vitest";
import { formatCurrency, formatMetricValue, formatDate, formatPercentage } from "@/lib/formatters/locale";

describe("formatCurrency", () => {
  it("formats a valid minor value", () => {
    const result = formatCurrency({ minorValue: 4250, currency: "INR" });
    expect(result).toContain("42.50");
  });

  it("formats zero", () => {
    const result = formatCurrency({ minorValue: 0, currency: "INR" });
    expect(result).toContain("0");
  });

  it("handles different currencies", () => {
    const result = formatCurrency({ minorValue: 10000, currency: "USD" });
    expect(result).toBeTruthy();
  });

  it("throws for non-integer minorValue", () => {
    expect(() => formatCurrency({ minorValue: 10.5, currency: "INR" })).toThrow();
  });
});

describe("formatDate", () => {
  it("formats a Date object", () => {
    const result = formatDate(new Date("2026-07-15"));
    expect(result).toContain("Jul");
    expect(result).toContain("15");
    expect(result).toContain("2026");
  });

  it("formats an ISO date string", () => {
    const result = formatDate("2026-07-15");
    expect(result).toContain("Jul");
  });
});

describe("formatMetricValue", () => {
  it("returns formatted currency when available", () => {
    const result = formatMetricValue(
      { status: "available", minorValue: 5000 },
      "INR",
    );
    expect(result).toContain("50");
  });

  it('returns "Unavailable" when unavailable', () => {
    const result = formatMetricValue(
      { status: "unavailable", reason: "No data yet" },
      "INR",
    );
    expect(result).toBe("Unavailable");
  });
});

describe("formatPercentage", () => {
  it("formats a ratio", () => {
    expect(formatPercentage(0.25)).toContain("25");
  });

  it("formats 100%", () => {
    expect(formatPercentage(1)).toContain("100");
  });

  it("throws for non-finite values", () => {
    expect(() => formatPercentage(Infinity)).toThrow();
    expect(() => formatPercentage(NaN)).toThrow();
  });
});
