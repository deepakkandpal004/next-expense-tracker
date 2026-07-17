import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { sortRecords } from "./record-selection";
import type { Transaction } from "./types";

const recordsArbitrary = fc.array(
  fc.record({ day: fc.integer({ min: 1, max: 28 }), amountMinor: fc.integer({ min: 0, max: 100_000 }) }),
  { maxLength: 30 },
).map((records) => records.map(({ day, amountMinor }, index) => ({
  id: String(index), description: `Record ${index}`, amountMinor, currency: "INR",
  type: "expense" as const, categoryId: "Food",
  occurredOn: `2025-02-${String(day).padStart(2, "0")}T12:00:00.000Z`,
  createdAt: "2025-02-28T12:00:00.000Z",
}) satisfies Transaction));

describe("record sorting property", () => {
  /** Validates: Requirements 5.13 */
  it("Property 8: record sorting is ordered and lossless", () => {
    fc.assert(fc.property(
      recordsArbitrary,
      fc.constantFrom(
        { key: "date" as const, direction: "asc" as const }, { key: "date" as const, direction: "desc" as const },
        { key: "amount" as const, direction: "asc" as const }, { key: "amount" as const, direction: "desc" as const },
      ),
      (records, sort) => {
        const sorted = sortRecords(records, sort);
        expect(sorted.map(({ id }) => id).sort()).toEqual(records.map(({ id }) => id).sort());
        for (let index = 1; index < sorted.length; index += 1) {
          const previous = sort.key === "date" ? Date.parse(sorted[index - 1].occurredOn) : sorted[index - 1].amountMinor;
          const current = sort.key === "date" ? Date.parse(sorted[index].occurredOn) : sorted[index].amountMinor;
          expect(sort.direction === "asc" ? previous <= current : previous >= current).toBe(true);
        }
      },
    ), { numRuns: 100 });
  });
});
