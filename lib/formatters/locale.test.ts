import fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
  APPLICATION_LOCALE_FALLBACK,
  formatCurrency,
  formatMetricValue,
  formatDate,
  formatDateTime,
  formatExactTime,
  formatPercentage,
  formatTime,
  resolveFormattingLocale,
} from "./locale";

describe("locale resolution", () => {
  it("prefers the selected locale, then browser locale, then app fallback", () => {
    expect(resolveFormattingLocale("fr-FR", ["de-DE"])).toBe("fr-FR");
    expect(resolveFormattingLocale(null, ["de-DE"])).toBe("de-DE");
    expect(resolveFormattingLocale("not_a_locale", [])).toBe(
      APPLICATION_LOCALE_FALLBACK,
    );
  });
});

describe("shared locale formatters", () => {
  it("formats integer minor units with the configured currency and locale", () => {
    const expected = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(1234.56);

    expect(
      formatCurrency(
        { minorValue: 123456, currency: "INR" },
        { locale: "en-IN" },
      ),
    ).toBe(expected);
  });

  it("rejects fractional minor units rather than introducing rounding", () => {
    expect(() =>
      formatCurrency({ minorValue: 100.5, currency: "INR" }),
    ).toThrow(/safe integer/);
  });

  it("preserves date-only calendar values across time zones", () => {
    expect(
      formatDate("2025-01-02", {
        locale: "en-US",
        timeZone: "America/Los_Angeles",
      }),
    ).toBe("Jan 2, 2025");
  });

  it("formats human and exact representations from the same instant", () => {
    const instant = "2025-01-02T15:04:05.000Z";
    const options = { locale: "en-US", timeZone: "UTC" } as const;

    expect(formatDate(instant, options)).toBe("Jan 2, 2025");
    expect(formatTime(instant, options)).toBe("3:04 PM");
    expect(formatDateTime(instant, options)).toContain("Jan 2, 2025");
    expect(formatExactTime(instant, options)).toBe(
      new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZoneName: "short",
        timeZone: "UTC",
      }).format(new Date(instant)),
    );
  });

  it("formats ratios as locale-aware percentages", () => {
    expect(formatPercentage(0.125, { locale: "en-US" })).toBe("12.5%");
    expect(() => formatPercentage(Number.NaN)).toThrow(/finite/);
  });

  it("rejects impossible calendar dates", () => {
    expect(() => formatDate("2025-02-30", { locale: "en-US" })).toThrow(
      /Invalid calendar date/,
    );
  });
});


describe("unavailable metric formatting", () => {
  /** Validates: Requirements 4.8 */
  it("Property 4: unavailable metrics never fabricate values", () => {
    fc.assert(
      fc.property(fc.string(), (reason) => {
        const formatted = formatMetricValue(
          { status: "unavailable", reason },
          "INR",
          { locale: "en-IN", browserLocales: [] },
        );

        expect(formatted).toBe("Unavailable");
        expect(formatted).not.toMatch(/\d/);
      }),
      { numRuns: 100 },
    );
  });
});