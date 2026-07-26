import { describe, it, expect } from "vitest";
import {
  normalizeReportingPeriod,
  previousResolvedPeriod,
  daysInResolvedPeriod,
} from "@/lib/domain/reporting-period";

describe("normalizeReportingPeriod", () => {
  it("normalizes current-month", () => {
    const result = normalizeReportingPeriod({ kind: "current-month" });
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.period.kind).toBe("current-month");
      expect(result.period.start).toBeTruthy();
      expect(result.period.end).toBeTruthy();
    }
  });

  it("normalizes previous-month", () => {
    const result = normalizeReportingPeriod({ kind: "previous-month" });
    expect(result.valid).toBe(true);
  });

  it("validates custom period", () => {
    const result = normalizeReportingPeriod({ kind: "custom", start: "2026-01-01", end: "2026-01-31" });
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.period.start).toBe("2026-01-01");
      expect(result.period.end).toBe("2026-01-31");
    }
  });

  it("rejects custom period with start after end", () => {
    const result = normalizeReportingPeriod({ kind: "custom", start: "2026-06-01", end: "2026-01-01" });
    expect(result.valid).toBe(false);
  });
});

describe("previousResolvedPeriod", () => {
  it("computes previous month correctly", () => {
    const period = { kind: "current-month" as const, start: "2026-07-01", end: "2026-07-31", label: "July" };
    const prev = previousResolvedPeriod(period);
    expect(prev.start).toBe("2026-06-01");
    expect(prev.end).toBe("2026-06-30");
  });

  it("handles January to December rollover", () => {
    const period = { kind: "current-month" as const, start: "2026-01-15", end: "2026-01-31", label: "January" };
    const prev = previousResolvedPeriod(period);
    expect(prev.start).toBe("2025-12-01");
    expect(prev.end).toBe("2025-12-31");
  });
});

describe("daysInResolvedPeriod", () => {
  it("counts days correctly", () => {
    const period = { kind: "custom" as const, start: "2026-01-01", end: "2026-01-15", label: "Custom" };
    expect(daysInResolvedPeriod(period)).toBe(15);
  });
});
