import type { BudgetMetric, CategoryBreakdownRow } from "@/lib/domain/types";

export interface BudgetOverviewCardProps {
  budget: BudgetMetric;
  categoryBreakdown: readonly CategoryBreakdownRow[];
  currency: string;
  onBudgetSaved?: () => void | Promise<void>;
}
