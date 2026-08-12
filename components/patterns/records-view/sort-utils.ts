import type { SortDirection, SortKey } from "@/lib/domain/types";

export function parseSort(value: string | null): { key: SortKey; direction: SortDirection } {
  if (value === "date-asc") return { key: "date", direction: "asc" };
  if (value === "amount-desc") return { key: "amount", direction: "desc" };
  if (value === "amount-asc") return { key: "amount", direction: "asc" };
  return { key: "date", direction: "desc" };
}

export function sortValue(sort: { key: SortKey; direction: SortDirection }): string {
  return `${sort.key}-${sort.direction}`;
}
