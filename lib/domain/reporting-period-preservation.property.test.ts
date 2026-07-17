import fc from "fast-check";
import { describe, expect, it } from "vitest";

import {
  APP_PERIOD_DESTINATIONS,
  parseReportingPeriod,
  withReportingPeriod,
  type AppPeriodDestination,
} from "./reporting-period";
import type { ReportingPeriod } from "./types";

const now = new Date("2025-03-15T12:00:00.000Z");

const presetArbitrary: fc.Arbitrary<ReportingPeriod> = fc.constantFrom(
  { kind: "current-month" as const },
  { kind: "previous-month" as const },
);

const customArbitrary: fc.Arbitrary<ReportingPeriod> = fc
  .integer({ min: 1, max: 27 })
  .chain((startDay) =>
    fc.integer({ min: startDay, max: 28 }).map((endDay) => ({
      kind: "custom" as const,
      start: `2025-02-${String(startDay).padStart(2, "0")}`,
      end: `2025-02-${String(endDay).padStart(2, "0")}`,
    })),
  );

const periodArbitrary = fc.oneof(presetArbitrary, customArbitrary);

const destinationArbitrary: fc.Arbitrary<AppPeriodDestination> = fc.constantFrom(
  ...(Object.keys(APP_PERIOD_DESTINATIONS) as AppPeriodDestination[]),
);

/** A non-period query/hash state a route or chart-view transition might carry. */
const nonPeriodStateArbitrary = fc.record({
  search: fc.constantFrom("", "view=category", "sort=amount-desc&type=expense", "addTransaction=1"),
  fragment: fc.constantFrom("", "section-highlights"),
});

describe("reporting-period preservation property", () => {
  /** Validates: Requirements 3.13, 6.7 */
  it("Property 2: reporting period survives non-period route and chart-view transitions", () => {
    fc.assert(
      fc.property(
        periodArbitrary,
        fc.array(fc.tuple(destinationArbitrary, nonPeriodStateArbitrary), { minLength: 1, maxLength: 6 }),
        (period, transitions) => {
          // Establish the canonical starting URL for the generated period.
          const baseHref = withReportingPeriod(APP_PERIOD_DESTINATIONS.dashboard, period, now);
          expect(baseHref).not.toBeNull();
          const baseResolved = parseReportingPeriod(
            new URLSearchParams(baseHref!.split("?")[1] ?? ""),
            now,
          );
          expect(baseResolved.valid).toBe(true);
          if (!baseResolved.valid) throw new Error("expected a valid starting period");

          for (const [destination, state] of transitions) {
            const currentHref = `${APP_PERIOD_DESTINATIONS[destination]}${state.search ? `?${state.search}` : ""}${state.fragment ? `#${state.fragment}` : ""}`;
            const nextHref = withReportingPeriod(currentHref, period, now);
            expect(nextHref).not.toBeNull();

            const [pathAndSearch, fragment] = nextHref!.split("#", 2);
            const [, search = ""] = pathAndSearch.split("?", 2);
            const resolved = parseReportingPeriod(new URLSearchParams(search), now);

            expect(resolved.valid).toBe(true);
            if (!resolved.valid) throw new Error("expected a valid transitioned period");
            expect(resolved.period).toEqual(baseResolved.period);
            expect(fragment ?? "").toBe(state.fragment);
            // Non-period parameters from the transition target are preserved verbatim.
            for (const [key, value] of new URLSearchParams(state.search)) {
              expect(new URLSearchParams(search).get(key)).toBe(value);
            }
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});
