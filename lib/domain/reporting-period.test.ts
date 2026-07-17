import { describe, expect, it } from "vitest";
import {
  APP_PERIOD_DESTINATIONS,
  REPORTING_PERIOD_SESSION_KEY,
  appPeriodHref,
  normalizeReportingPeriod,
  parseReportingPeriod,
  readReportingPeriodSession,
  resolveReportingPeriodState,
  toCanonicalReportingPeriodSearchParams,
  withReportingPeriod,
  withReportingPeriodSearchParams,
  writeReportingPeriodSession,
  type SessionStorageAdapter,
} from "./reporting-period";

const januaryReference = new Date("2025-01-15T12:00:00.000Z");

class MemorySessionStorage implements SessionStorageAdapter {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

describe("reporting period normalization", () => {
  it("normalizes current and previous months at year boundaries", () => {
    const current = normalizeReportingPeriod(
      { kind: "current-month" },
      januaryReference,
    );
    const previous = normalizeReportingPeriod(
      { kind: "previous-month" },
      januaryReference,
    );

    expect(current).toMatchObject({
      valid: true,
      period: { kind: "current-month", start: "2025-01-01", end: "2025-01-31" },
    });
    expect(previous).toMatchObject({
      valid: true,
      period: { kind: "previous-month", start: "2024-12-01", end: "2024-12-31" },
    });
  });

  it("retains valid inclusive custom boundaries", () => {
    const result = normalizeReportingPeriod(
      { kind: "custom", start: "2024-02-29", end: "2024-02-29" },
      januaryReference,
    );

    expect(result).toMatchObject({
      valid: true,
      period: { kind: "custom", start: "2024-02-29", end: "2024-02-29" },
    });
  });

  it("preserves raw invalid custom values and reports a field-associated range error", () => {
    const result = normalizeReportingPeriod(
      { kind: "custom", start: "2025-02-31", end: "2025-02-30" },
      januaryReference,
    );

    expect(result).toEqual({
      valid: false,
      input: { kind: "custom", start: "2025-02-31", end: "2025-02-30" },
      fieldErrors: {
        start: "Enter a valid calendar date in YYYY-MM-DD format.",
        end: "Enter a valid calendar date in YYYY-MM-DD format.",
      },
      firstInvalidField: "start",
    });

    const reversed = normalizeReportingPeriod(
      { kind: "custom", start: "2025-03-02", end: "2025-03-01" },
      januaryReference,
    );
    expect(reversed).toMatchObject({
      valid: false,
      input: { kind: "custom", start: "2025-03-02", end: "2025-03-01" },
      fieldErrors: { end: "End date must be on or after the start date." },
      firstInvalidField: "end",
    });
  });
});

describe("reporting period URL adapters", () => {
  it("parses and serializes the canonical URL representation", () => {
    const parsed = parseReportingPeriod(
      new URLSearchParams("period=custom&start=2025-02-01&end=2025-02-28"),
      januaryReference,
    );
    expect(parsed).toMatchObject({
      valid: true,
      period: { kind: "custom", start: "2025-02-01", end: "2025-02-28" },
    });

    expect(
      toCanonicalReportingPeriodSearchParams(
        { kind: "custom", start: "2025-02-01", end: "2025-02-28" },
        januaryReference,
      )?.toString(),
    ).toBe("period=custom&start=2025-02-01&end=2025-02-28");
    expect(
      toCanonicalReportingPeriodSearchParams({ kind: "current-month" }, januaryReference)?.toString(),
    ).toBe("period=current-month");
  });

  it("does not serialize invalid form state and clears stale custom parameters", () => {
    expect(
      toCanonicalReportingPeriodSearchParams(
        { kind: "custom", start: "2025-03-02", end: "2025-03-01" },
        januaryReference,
      ),
    ).toBeNull();
    expect(
      withReportingPeriodSearchParams(
        "view=category&period=custom&start=2025-01-01&end=2025-01-31",
        { kind: "previous-month" },
        januaryReference,
      )?.toString(),
    ).toBe("view=category&period=previous-month");
  });
});

describe("reporting period navigation and session adapters", () => {
  it("carries the active period across app routes and chart-view links", () => {
    const period = { kind: "custom", start: "2025-01-01", end: "2025-01-31" } as const;

    expect(APP_PERIOD_DESTINATIONS).toEqual({
      dashboard: "/dashboard",
      records: "/records",
      insights: "/insights",
    });
    expect(appPeriodHref("records", period, januaryReference)).toBe(
      "/records?period=custom&start=2025-01-01&end=2025-01-31",
    );
    expect(withReportingPeriod("/dashboard?view=category#chart", period, januaryReference)).toBe(
      "/dashboard?view=category&period=custom&start=2025-01-01&end=2025-01-31#chart",
    );
  });

  it("uses session storage only as a fallback mirror when URL period state is absent", () => {
    const storage = new MemorySessionStorage();
    const mirrored = { kind: "custom", start: "2025-02-01", end: "2025-02-28" } as const;

    expect(writeReportingPeriodSession(storage, mirrored, januaryReference)).toBe(true);
    expect(storage.getItem(REPORTING_PERIOD_SESSION_KEY)).toBe(
      "period=custom&start=2025-02-01&end=2025-02-28",
    );
    expect(readReportingPeriodSession(storage, januaryReference)).toEqual(mirrored);

    expect(
      resolveReportingPeriodState(new URLSearchParams(), storage, januaryReference),
    ).toMatchObject({ valid: true, period: mirrored });
    expect(
      resolveReportingPeriodState(
        new URLSearchParams("period=previous-month"),
        storage,
        januaryReference,
      ),
    ).toMatchObject({
      valid: true,
      period: { kind: "previous-month", start: "2024-12-01", end: "2024-12-31" },
    });
  });

  it("leaves an existing valid session value untouched when invalid custom input is submitted", () => {
    const storage = new MemorySessionStorage();
    writeReportingPeriodSession(storage, { kind: "current-month" }, januaryReference);

    expect(
      writeReportingPeriodSession(
        storage,
        { kind: "custom", start: "2025-03-02", end: "2025-03-01" },
        januaryReference,
      ),
    ).toBe(false);
    expect(storage.getItem(REPORTING_PERIOD_SESSION_KEY)).toBe("period=current-month");
  });
});
