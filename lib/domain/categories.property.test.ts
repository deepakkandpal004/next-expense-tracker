import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { CATEGORY_IDS, getCategoryDefinition } from "./categories";
import { buildCategoryChartModel } from "./chart-models";
import type { ResolvedPeriod, Transaction } from "./types";

const period: ResolvedPeriod = { kind: "custom", start: "2025-02-01", end: "2025-02-28", label: "February 2025" };

function expense(categoryId: string): Transaction {
  return { id: "record", description: "Record", amountMinor: 100, currency: "INR", type: "expense", categoryId, occurredOn: "2025-02-10T12:00:00.000Z", createdAt: "2025-02-10T12:00:00.000Z" };
}

describe("category semantics property", () => {
  /** Validates: Requirements 6.4 */
  it("Property 10: category semantics are consistent across consumers", () => {
    fc.assert(fc.property(fc.oneof(fc.constantFrom(...CATEGORY_IDS), fc.string()), (categoryId) => {
      const definition = getCategoryDefinition(categoryId);
      const chart = buildCategoryChartModel([expense(categoryId)], { period, currency: "INR", locale: "en-IN" });
      expect(chart.state).toBe("ready");
      if (chart.state !== "ready") throw new Error("Expected a category chart.");
      const row = chart.rows[0];
      const legendDefinition = getCategoryDefinition(categoryId);
      const filterDefinition = getCategoryDefinition(categoryId);
      const recordDefinition = getCategoryDefinition(categoryId);
      expect(row).toMatchObject({ key: definition.id, label: definition.label, semanticToken: definition.semanticToken, symbol: definition.symbol });
      for (const consumer of [legendDefinition, filterDefinition, recordDefinition]) {
        expect(consumer).toBe(definition);
      }
    }), { numRuns: 100 });
  });
});
