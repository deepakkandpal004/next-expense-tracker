import { describe, expect, it } from "vitest";
import {
  CSV_EXPORT_COLUMNS,
  clearRecordFilters,
  createExportScope,
  escapeCsvCell,
  selectRecords,
  serializeCsvExport,
  sortRecords,
} from "./record-selection";
import type { ResolvedPeriod, Transaction, TransactionQuery } from "./types";

const period: ResolvedPeriod = {
  kind: "custom",
  start: "2025-02-01",
  end: "2025-02-28",
  label: "1 Feb 2025 – 28 Feb 2025",
};

const records: readonly Transaction[] = [
  {
    id: "rent",
    description: "Monthly Rent",
    amountMinor: 120_000,
    currency: "INR",
    type: "expense",
    categoryId: "Bills",
    occurredOn: "2025-02-05T10:00:00.000Z",
    createdAt: "2025-02-05T10:00:00.000Z",
  },
  {
    id: "coffee",
    description: "Coffee shop",
    amountMinor: 450,
    currency: "INR",
    type: "expense",
    categoryId: "Food",
    occurredOn: "2025-02-05T10:00:00.000Z",
    createdAt: "2025-02-05T11:00:00.000Z",
  },
  {
    id: "salary",
    description: "February Salary",
    amountMinor: 250_000,
    currency: "INR",
    type: "income",
    categoryId: "Income",
    occurredOn: "2025-02-01T09:00:00.000Z",
    createdAt: "2025-02-01T09:00:00.000Z",
  },
] as const;

const defaultQuery: TransactionQuery = {
  period: { kind: "custom", start: "2025-02-01", end: "2025-02-28" },
  search: "",
  types: [],
  categories: [],
  sort: { key: "date", direction: "asc" },
};

describe("record selection", () => {
  it("matches descriptions case-insensitively and combines type/category predicates", () => {
    const selection = selectRecords(records, {
      ...defaultQuery,
      search: "  rEnT ",
      types: ["expense"],
      categories: ["Bills", "Bills"],
    });

    expect(selection.records.map(({ id }) => id)).toEqual(["rent"]);
    expect(selection.activeFilters).toEqual([
      { kind: "search", value: "rEnT" },
      { kind: "type", value: "expense" },
      { kind: "category", value: "Bills" },
    ]);
    expect(selection.activeFilterCount).toBe(3);
  });

  it("sorts date and amount values stably without mutating input", () => {
    const dateSorted = sortRecords(records, { key: "date", direction: "asc" });
    const amountSorted = sortRecords(
      [
        { ...records[0], id: "first", amountMinor: 10 },
        { ...records[1], id: "second", amountMinor: 10 },
        { ...records[2], id: "third", amountMinor: 5 },
      ],
      { key: "amount", direction: "desc" },
    );

    expect(dateSorted.map(({ id }) => id)).toEqual(["salary", "rent", "coffee"]);
    expect(amountSorted.map(({ id }) => id)).toEqual(["first", "second", "third"]);
    expect(records.map(({ id }) => id)).toEqual(["rent", "coffee", "salary"]);
  });

  it("clears only predicates while preserving the exact period and sort", () => {
    const cleared = clearRecordFilters({
      ...defaultQuery,
      search: "rent",
      types: ["expense"],
      categories: ["Bills"],
      sort: { key: "amount", direction: "desc" },
    });

    expect(cleared).toMatchObject({ search: "", types: [], categories: [] });
    expect(cleared.period).toBe(defaultQuery.period);
    expect(cleared.sort).toEqual({ key: "amount", direction: "desc" });
  });
});

describe("record export scope and CSV serialization", () => {
  it("summarizes the complete displayed scope before creating a CSV", () => {
    const selection = selectRecords(records, {
      ...defaultQuery,
      types: ["expense"],
      categories: ["Bills", "Food"],
      sort: { key: "amount", direction: "desc" },
    });
    const scope = createExportScope({ period, selection });

    expect(scope.status).toBe("ready");
    expect(scope.summary).toEqual({
      period,
      activeFilters: [
        { kind: "type", value: "expense" },
        { kind: "category", value: "Bills" },
        { kind: "category", value: "Food" },
      ],
      format: "csv",
      recordCount: 2,
      columns: CSV_EXPORT_COLUMNS,
      canCreate: true,
    });
    if (scope.status === "ready") {
      expect(scope.records.map(({ id }) => id)).toEqual(["rent", "coffee"]);
    }
  });

  it("serializes explicit UTF-8 machine-readable columns with escaped safe cells", () => {
    const selection = selectRecords(
      [
        {
          ...records[1],
          id: "+record",
          description: '=SUM(A1:A2), "Café"\nsecond line',
          categoryId: "@unsafe",
        },
      ],
      defaultQuery,
    );
    const scope = createExportScope({ period, selection });
    const file = serializeCsvExport(scope, new Date("2025-03-04T12:00:00.000Z"));

    expect(file).toMatchObject({
      filename: "expense-ai-records-2025-03-04.csv",
      mediaType: "text/csv;charset=utf-8",
      encoding: "utf-8",
      columns: CSV_EXPORT_COLUMNS,
    });
    expect(file?.content).toBe(
      'ID,Description,Amount (minor units),Currency,Type,Category,Occurred on,Created at\r\n' +
        "'+record,\"'=SUM(A1:A2), \"\"Café\"\"\nsecond line\",450,INR,expense,'@unsafe,2025-02-05T10:00:00.000Z,2025-02-05T11:00:00.000Z",
    );
    expect(new TextDecoder("utf-8").decode(file?.bytes)).toBe(file?.content);
    expect(escapeCsvCell("-formula")).toBe("'-formula");
  });

  it("does not create a file for empty, failed, or invalidly dated scopes", () => {
    const empty = createExportScope({
      period,
      selection: selectRecords([], defaultQuery),
    });
    const failed = createExportScope({
      period,
      selection: selectRecords(records, defaultQuery),
      failureMessage: "Could not load the complete export scope.",
    });

    expect(empty).toMatchObject({
      status: "empty",
      summary: { recordCount: 0, canCreate: false },
    });
    expect(failed).toMatchObject({
      status: "failed",
      summary: { recordCount: records.length, canCreate: false },
    });
    expect(serializeCsvExport(empty)).toBeNull();
    expect(serializeCsvExport(failed)).toBeNull();
    expect(serializeCsvExport(createExportScope({ period, selection: selectRecords(records, defaultQuery) }), new Date("invalid"))).toBeNull();
  });
});
