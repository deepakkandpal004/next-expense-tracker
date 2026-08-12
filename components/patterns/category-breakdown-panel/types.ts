import type { CategoryBreakdownRow } from "@/lib/domain/types";

export interface CategoryBreakdownPanelProps {
  breakdown: readonly CategoryBreakdownRow[];
  totalSpendingMinor: number;
  currency: string;
  period: string;
}
