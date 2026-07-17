import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { normalizeReportingPeriod } from "./reporting-period";

type InvalidRange = { start: string; end: string };

const invalidRangeArbitrary: fc.Arbitrary<InvalidRange> = fc
  .integer({ min: 1, max: 27 })
  .chain((startDay) => fc.integer({ min: startDay + 1, max: 28 }).map((endDay) => ({
    start: `2025-02-${String(endDay).padStart(2, "0")}`,
    end: `2025-02-${String(startDay).padStart(2, "0")}`,
  })));

describe("invalid custom reporting period property", () => {
  /** Validates: Requirements 18.4 */
  it("Property 18: invalid custom periods are rejected without mutation", () => {
    fc.assert(fc.property(invalidRangeArbitrary, ({ start, end }) => {
      const input = { kind: "custom" as const, start, end };
      const result = normalizeReportingPeriod(input, new Date("2025-01-15T12:00:00.000Z"));
      expect(result.valid).toBe(false);
      if (result.valid) throw new Error("Expected an invalid reporting period.");
      expect(result.fieldErrors.end).toBe("End date must be on or after the start date.");
      expect(JSON.stringify(result.input)).toBe(JSON.stringify(input));
    }), { numRuns: 100 });
  });
});
