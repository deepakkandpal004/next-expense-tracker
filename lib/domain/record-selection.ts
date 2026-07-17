import type {
  ResolvedPeriod,
  SortDirection,
  SortKey,
  Transaction,
  TransactionQuery,
  TransactionType,
} from "./types";

export type ActiveRecordFilter =
  | { kind: "search"; value: string }
  | { kind: "type"; value: TransactionType }
  | { kind: "category"; value: string };

export interface RecordSelection {
  records: readonly Transaction[];
  activeFilters: readonly ActiveRecordFilter[];
  activeFilterCount: number;
}

export type ExportFormat = "csv";

export const CSV_EXPORT_COLUMNS = [
  "ID",
  "Description",
  "Amount (minor units)",
  "Currency",
  "Type",
  "Category",
  "Occurred on",
  "Created at",
] as const;

export interface ExportScopeSummary {
  period: ResolvedPeriod;
  activeFilters: readonly ActiveRecordFilter[];
  format: ExportFormat;
  recordCount: number;
  columns: readonly (typeof CSV_EXPORT_COLUMNS)[number][];
  canCreate: boolean;
}

export type ExportScope =
  | { status: "ready"; summary: ExportScopeSummary; records: readonly Transaction[] }
  | { status: "empty"; summary: ExportScopeSummary; message: string }
  | { status: "failed"; summary: ExportScopeSummary; message: string };

export interface ExportScopeInput {
  period: ResolvedPeriod;
  selection: RecordSelection;
  format?: ExportFormat;
  failureMessage?: string;
}

export interface CsvExportFile {
  filename: string;
  mediaType: "text/csv;charset=utf-8";
  encoding: "utf-8";
  columns: readonly (typeof CSV_EXPORT_COLUMNS)[number][];
  content: string;
  bytes: Uint8Array;
}

const EMPTY_SCOPE_MESSAGE =
  "No records match the selected reporting period and filters. Change the scope before exporting.";
const FORMULA_PREFIX_PATTERN = /^\s*[=+\-@]/u;

function normalizedSearch(search: string): string {
  return search.trim().toLowerCase();
}

/** Returns each non-default search/type/category filter in presentation order. */
export function getActiveRecordFilters(
  query: Pick<TransactionQuery, "search" | "types" | "categories">,
): readonly ActiveRecordFilter[] {
  const filters: ActiveRecordFilter[] = [];
  const search = query.search.trim();
  if (search) filters.push({ kind: "search", value: search });

  for (const type of new Set(query.types)) {
    filters.push({ kind: "type", value: type });
  }
  for (const category of new Set(query.categories)) {
    if (category) filters.push({ kind: "category", value: category });
  }
  return filters;
}

/** Applies all active predicates. Values within a type/category filter are ORed. */
export function filterRecords(
  records: readonly Transaction[],
  query: Pick<TransactionQuery, "search" | "types" | "categories">,
): readonly Transaction[] {
  const search = normalizedSearch(query.search);
  const types = new Set(query.types);
  const categories = new Set(query.categories.filter(Boolean));

  return records.filter((record) => {
    const descriptionMatches =
      search.length === 0 || record.description.toLowerCase().includes(search);
    const typeMatches = types.size === 0 || types.has(record.type);
    const categoryMatches = categories.size === 0 || categories.has(record.categoryId);
    return descriptionMatches && typeMatches && categoryMatches;
  });
}

function compareDate(left: Transaction, right: Transaction): number {
  const leftTime = Date.parse(left.occurredOn);
  const rightTime = Date.parse(right.occurredOn);
  const leftValid = Number.isFinite(leftTime);
  const rightValid = Number.isFinite(rightTime);

  if (leftValid && rightValid) return leftTime - rightTime;
  if (leftValid) return -1;
  if (rightValid) return 1;
  return 0;
}

function compareAmount(left: Transaction, right: Transaction): number {
  const leftValid = Number.isFinite(left.amountMinor);
  const rightValid = Number.isFinite(right.amountMinor);

  if (leftValid && rightValid) return left.amountMinor - right.amountMinor;
  if (leftValid) return -1;
  if (rightValid) return 1;
  return 0;
}

function comparatorFor(key: SortKey): (left: Transaction, right: Transaction) => number {
  return key === "date" ? compareDate : compareAmount;
}

/** Sorts without mutating input and preserves input order for equal sort keys. */
export function sortRecords(
  records: readonly Transaction[],
  sort: { key: SortKey; direction: SortDirection },
): readonly Transaction[] {
  const multiplier = sort.direction === "desc" ? -1 : 1;
  const compare = comparatorFor(sort.key);

  return records
    .map((record, index) => ({ record, index }))
    .sort((left, right) => multiplier * compare(left.record, right.record) || left.index - right.index)
    .map(({ record }) => record);
}

/** Selects the displayed sequence and exposes matching active-filter metadata. */
export function selectRecords(
  records: readonly Transaction[],
  query: Pick<TransactionQuery, "search" | "types" | "categories" | "sort">,
): RecordSelection {
  const activeFilters = getActiveRecordFilters(query);
  return {
    records: sortRecords(filterRecords(records, query), query.sort),
    activeFilters,
    activeFilterCount: activeFilters.length,
  };
}

/** Resets only record predicates; reporting period and selected sort remain unchanged. */
export function clearRecordFilters(query: TransactionQuery): TransactionQuery {
  return {
    period: query.period,
    search: "",
    types: [],
    categories: [],
    sort: query.sort,
  };
}

function buildSummary(
  period: ResolvedPeriod,
  selection: RecordSelection,
  format: ExportFormat,
  canCreate: boolean,
): ExportScopeSummary {
  return {
    period,
    activeFilters: selection.activeFilters,
    format,
    recordCount: selection.records.length,
    columns: CSV_EXPORT_COLUMNS,
    canCreate,
  };
}

/** Builds the exact displayed scope used by the confirmation and eventual file. */
export function createExportScope({
  period,
  selection,
  format = "csv",
  failureMessage,
}: ExportScopeInput): ExportScope {
  if (failureMessage) {
    return {
      status: "failed",
      summary: buildSummary(period, selection, format, false),
      message: failureMessage,
    };
  }

  if (selection.records.length === 0) {
    return {
      status: "empty",
      summary: buildSummary(period, selection, format, false),
      message: EMPTY_SCOPE_MESSAGE,
    };
  }

  return {
    status: "ready",
    summary: buildSummary(period, selection, format, true),
    records: selection.records,
  };
}

/** Prefixes spreadsheet formula starters so all fields remain literal CSV data. */
export function protectCsvFormula(value: string): string {
  return FORMULA_PREFIX_PATTERN.test(value) ? `'${value}` : value;
}

/** Escapes a cell according to RFC 4180-compatible delimiter, quote, and newline rules. */
export function escapeCsvCell(value: string): string {
  const safeValue = protectCsvFormula(value);
  return /[",\r\n]/u.test(safeValue)
    ? `"${safeValue.replace(/"/gu, '""')}"`
    : safeValue;
}

function csvRow(record: Transaction): readonly string[] {
  return [
    record.id,
    record.description,
    String(record.amountMinor),
    record.currency,
    record.type,
    record.categoryId,
    record.occurredOn,
    record.createdAt,
  ];
}

function exportDate(value: Date): string | null {
  if (Number.isNaN(value.getTime())) return null;
  return value.toISOString().slice(0, 10);
}

/**
 * Produces a complete UTF-8 CSV only for a ready scope. Building content and
 * bytes finishes before returning, so callers never receive a partial file.
 */
export function serializeCsvExport(
  scope: ExportScope,
  createdAt: Date = new Date(),
): CsvExportFile | null {
  if (scope.status !== "ready") return null;

  const date = exportDate(createdAt);
  if (!date) return null;

  try {
    const content = [
      CSV_EXPORT_COLUMNS.map(escapeCsvCell).join(","),
      ...scope.records.map((record) => csvRow(record).map(escapeCsvCell).join(",")),
    ].join("\r\n");

    return {
      filename: `expense-ai-records-${date}.csv`,
      mediaType: "text/csv;charset=utf-8",
      encoding: "utf-8",
      columns: CSV_EXPORT_COLUMNS,
      content,
      bytes: new TextEncoder().encode(content),
    };
  } catch {
    return null;
  }
}
