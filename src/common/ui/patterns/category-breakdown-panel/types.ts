import type { CategoryBreakdownRow } from "@/src/common/domain/types";

export interface CategoryBreakdownPanelProps {
  breakdown: readonly CategoryBreakdownRow[];
  totalSpendingMinor: number;
  currency: string;
  period: string;
}
