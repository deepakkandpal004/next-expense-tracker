import { describe, it, expect } from "vitest";
import {
  filterRecords,
  sortRecords,
  selectRecords,
  clearRecordFilters,
  createExportScope,
  serializeCsvExport,
  escapeCsvCell,
} from "@/lib/domain/record-selection";
import type { Transaction, ResolvedPeriod } from "@/lib/domain/types";
import type { ExportScope } from "@/lib/domain/record-selection";

function makeTransaction(overrides?: Partial<Transaction>): Transaction {
  return {
    id: "tx-1",
    description: "Test transaction",
    amountMinor: 1000,
    currency: "INR",
    type: "expense",
    categoryId: "Food",
    occurredOn: "2026-07-15T12:00:00.000Z",
    createdAt: "2026-07-15T12:00:00.000Z",
    ...overrides,
  };
}

const period: ResolvedPeriod = {
  kind: "current-month",
  start: "2026-07-01",
  end: "2026-07-31",
  label: "July 2026",
};

describe("filterRecords", () => {
  const records = [
    makeTransaction({ id: "1", description: "Coffee", categoryId: "Food" }),
    makeTransaction({ id: "2", description: "Bus fare", categoryId: "Transportation" }),
    makeTransaction({ id: "3", description: "Salary", type: "income", categoryId: "Income" }),
  ];

  it("returns all records with no filters", () => {
    const result = filterRecords(records, { search: "", types: [], categories: [] });
    expect(result.length).toBe(3);
  });

  it("filters by search", () => {
    const result = filterRecords(records, { search: "coffee", types: [], categories: [] });
    expect(result.length).toBe(1);
    expect(result[0].id).toBe("1");
  });

  it("filters by type", () => {
    const result = filterRecords(records, { search: "", types: ["income"], categories: [] });
    expect(result.length).toBe(1);
    expect(result[0].id).toBe("3");
  });

  it("filters by category", () => {
    const result = filterRecords(records, { search: "", types: [], categories: ["Food"] });
    expect(result.length).toBe(1);
    expect(result[0].id).toBe("1");
  });

  it("search is case-insensitive", () => {
    const result = filterRecords(records, { search: "COFFEE", types: [], categories: [] });
    expect(result.length).toBe(1);
  });
});

describe("sortRecords", () => {
  it("sorts by date descending by default", () => {
    const records = [
      makeTransaction({ id: "1", occurredOn: "2026-07-01T00:00:00.000Z" }),
      makeTransaction({ id: "2", occurredOn: "2026-07-15T00:00:00.000Z" }),
      makeTransaction({ id: "3", occurredOn: "2026-07-10T00:00:00.000Z" }),
    ];
    const sorted = sortRecords(records, { key: "date", direction: "desc" });
    expect(sorted[0].id).toBe("2");
    expect(sorted[1].id).toBe("3");
    expect(sorted[2].id).toBe("1");
  });

  it("sorts by amount ascending", () => {
    const records = [
      makeTransaction({ id: "1", amountMinor: 500 }),
      makeTransaction({ id: "2", amountMinor: 100 }),
      makeTransaction({ id: "3", amountMinor: 1000 }),
    ];
    const sorted = sortRecords(records, { key: "amount", direction: "asc" });
    expect(sorted[0].id).toBe("2");
    expect(sorted[1].id).toBe("1");
    expect(sorted[2].id).toBe("3");
  });
});

describe("selectRecords", () => {
  it("returns selection with active filter count", () => {
    const records = [makeTransaction()];
    const result = selectRecords(records, { search: "test", types: [], categories: [], sort: { key: "date", direction: "desc" } });
    expect(result.records.length).toBe(1);
    expect(result.activeFilterCount).toBe(1);
  });
});

describe("clearRecordFilters", () => {
  it("clears search, types, and categories", () => {
    const query = { period: { kind: "current-month" as const }, search: "test", types: ["expense"] as const, categories: ["Food"], sort: { key: "date" as const, direction: "desc" as const } };
    const cleared = clearRecordFilters(query);
    expect(cleared.search).toBe("");
    expect(cleared.types).toEqual([]);
    expect(cleared.categories).toEqual([]);
    expect(cleared.sort).toEqual(query.sort);
  });
});

describe("createExportScope", () => {
  it("returns ready scope for non-empty records", () => {
    const records = [makeTransaction()];
    const selection = selectRecords(records, { search: "", types: [], categories: [], sort: { key: "date", direction: "desc" } });
    const scope = createExportScope({ period, selection });
    expect(scope.status).toBe("ready");
  });

  it("returns empty scope for no records", () => {
    const selection = selectRecords([], { search: "", types: [], categories: [], sort: { key: "date", direction: "desc" } });
    const scope = createExportScope({ period, selection });
    expect(scope.status).toBe("empty");
  });
});

describe("serializeCsvExport", () => {
  it("returns null for non-ready scope", () => {
    const scope: ExportScope = { status: "empty", summary: { period, activeFilters: [], format: "csv", recordCount: 0, columns: ["ID" as const], canCreate: false }, message: "Empty" };
    expect(serializeCsvExport(scope)).toBeNull();
  });
});

describe("escapeCsvCell", () => {
  it("wraps cells containing commas in quotes", () => {
    expect(escapeCsvCell("hello, world")).toBe('"hello, world"');
  });

  it("wraps cells containing quotes in quotes", () => {
    expect(escapeCsvCell('say "hello"')).toBe('"say ""hello"""');
  });

  it("does not wrap plain text", () => {
    expect(escapeCsvCell("hello")).toBe("hello");
  });

  it("escapes formula prefixes", () => {
    expect(escapeCsvCell("=SUM(A1:A2)")).toBe("'=SUM(A1:A2)");
    expect(escapeCsvCell("+cmd")).toBe("'+cmd");
    expect(escapeCsvCell("-cmd")).toBe("'-cmd");
    expect(escapeCsvCell("@cmd")).toBe("'@cmd");
  });
});
