import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { CSV_EXPORT_COLUMNS, createExportScope, serializeCsvExport } from "./record-selection";
import type { RecordSelection } from "./record-selection";
import type { ResolvedPeriod, Transaction } from "./types";

const period: ResolvedPeriod = { kind: "custom", start: "2025-02-01", end: "2025-02-28", label: "February 2025" };

function parseCsv(content: string): string[][] {
  const rows: string[][] = [[]]; let cell = ""; let quoted = false;
  for (let index = 0; index < content.length; index += 1) {
    const character = content[index];
    if (quoted && character === '"' && content[index + 1] === '"') { cell += '"'; index += 1; }
    else if (character === '"') quoted = !quoted;
    else if (!quoted && character === ",") { rows[rows.length - 1].push(cell); cell = ""; }
    else if (!quoted && character === "\r" && content[index + 1] === "\n") { rows[rows.length - 1].push(cell); rows.push([]); cell = ""; index += 1; }
    else cell += character;
  }
  rows[rows.length - 1].push(cell); return rows;
}

describe("record export property", () => {
  /** Validates: Requirements 5.15, 18.6 */
  it("Property 9: export is faithful to the displayed scope", () => {
    fc.assert(fc.property(fc.array(fc.string({ maxLength: 20 }), { minLength: 1, maxLength: 20 }), fc.array(fc.string({ maxLength: 8 }), { maxLength: 3 }), (values, filters) => {
      const records: Transaction[] = values.map((value, index) => ({
        id: `record-${index}-${value}`, description: `Description ${value}`, amountMinor: index + 1, currency: "INR",
        type: index % 2 ? "expense" : "income", categoryId: `Category ${value}`,
        occurredOn: "2025-02-10T12:00:00.000Z", createdAt: "2025-02-10T12:00:00.000Z",
      }));
      const selection: RecordSelection = { records, activeFilters: filters.map((value) => ({ kind: "search", value })), activeFilterCount: filters.length };
      const scope = createExportScope({ period, selection });
      expect(scope.status).toBe("ready");
      if (scope.status !== "ready") throw new Error("Expected a ready export scope.");
      expect(scope.summary).toMatchObject({ period, activeFilters: selection.activeFilters, format: "csv", recordCount: records.length, columns: CSV_EXPORT_COLUMNS, canCreate: true });
      const file = serializeCsvExport(scope, new Date("2025-03-04T12:00:00.000Z"));
      expect(file).not.toBeNull();
      expect(parseCsv(file!.content)).toEqual([CSV_EXPORT_COLUMNS, ...records.map((record) => [record.id, record.description, String(record.amountMinor), record.currency, record.type, record.categoryId, record.occurredOn, record.createdAt])]);
    }), { numRuns: 100 });
  });
});
