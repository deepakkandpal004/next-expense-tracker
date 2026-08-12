import type { CurrencyCode } from "@/lib/domain/types";

export interface TransactionTableRow {
  id: string;
  description: string;
  amountMinor: number;
  currency: CurrencyCode;
  type: "income" | "expense";
  categoryId: string;
  occurredOn: string;
  createdAt: string;
}

export interface TransactionTableProps {
  rows: readonly TransactionTableRow[];
  onDelete?: (row: TransactionTableRow) => void;
  deletingId?: string | null;
  anomalyIds?: ReadonlySet<string>;
  selectedIds?: ReadonlySet<string>;
  onSelectionChange?: (ids: ReadonlySet<string>) => void;
}
