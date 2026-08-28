import type { BudgetMetric, CategoryBreakdownRow } from "@/src/common/domain/types";

export interface BudgetOverviewCardProps {
  budget: BudgetMetric;
  categoryBreakdown: readonly CategoryBreakdownRow[];
  currency: string;
  onBudgetSaved?: () => void | Promise<void>;
}
