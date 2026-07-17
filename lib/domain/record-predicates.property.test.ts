import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { selectRecords } from "./record-selection";
import type { Transaction } from "./types";

const transactionArbitrary = fc
  .tuple(
    fc.integer({ min: 1, max: 28 }), fc.string({ maxLength: 20 }),
    fc.integer({ min: 0, max: 100_000 }), fc.constantFrom("income" as const, "expense" as const),
    fc.constantFrom("Food", "Bills", "Income", "Unknown"),
  )
  .map(([day, description, amountMinor, type, categoryId]) => ({
    id: `${day}-${description}`, description, amountMinor, currency: "INR",
    type, categoryId, occurredOn: `2025-02-${String(day).padStart(2, "0")}T12:00:00.000Z`,
    createdAt: "2025-02-28T12:00:00.000Z",
  }) satisfies Transaction);

const queryArbitrary = fc.record({
  search: fc.string({ maxLength: 20 }),
  types: fc.array(fc.constantFrom("income" as const, "expense" as const), { maxLength: 3 }),
  categories: fc.array(fc.constantFrom("", "Food", "Bills", "Income", "Unknown"), { maxLength: 4 }),
  sort: fc.constantFrom({ key: "date" as const, direction: "asc" as const }, { key: "amount" as const, direction: "desc" as const }),
});

describe("record predicate property", () => {
  /** Validates: Requirements 5.11, 5.12, 18.5 */
  it("Property 7: record selection exactly matches active predicates", () => {
    fc.assert(fc.property(fc.array(transactionArbitrary, { maxLength: 25 }), queryArbitrary, (records, query) => {
      const selection = selectRecords(records, query);
      const search = query.search.trim().toLowerCase();
      const expected = records.filter((record) =>
        (!search || record.description.toLowerCase().includes(search)) &&
        (!query.types.length || query.types.includes(record.type)) &&
        (!query.categories.filter(Boolean).length || query.categories.filter(Boolean).includes(record.categoryId)));
      const filters = [
        ...(query.search.trim() ? [{ kind: "search" as const, value: query.search.trim() }] : []),
        ...Array.from(new Set(query.types)).map((value) => ({ kind: "type" as const, value })),
        ...Array.from(new Set(query.categories.filter(Boolean))).map((value) => ({ kind: "category" as const, value })),
      ];
      expect(selection.records.map(({ id }) => id).sort()).toEqual(expected.map(({ id }) => id).sort());
      expect(selection.activeFilters).toEqual(filters);
      expect(selection.activeFilterCount).toBe(filters.length);
    }), { numRuns: 100 });
  });
});
