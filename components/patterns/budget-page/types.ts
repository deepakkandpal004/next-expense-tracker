import type { BudgetMetric, CategoryBreakdownRow, ResolvedPeriod } from "@/lib/domain/types";

export interface BudgetPageProps {
  budget: BudgetMetric;
  categoryBreakdown: readonly CategoryBreakdownRow[];
  currency: string;
  resolvedPeriod: ResolvedPeriod;
}

export interface ForecastData {
  projectedTotal: number;
  dailyRate: number;
  daysRemaining: number;
  daysInPeriod: number;
  daysElapsed: number;
  onPace: boolean;
}

export interface AISuggestion {
  type: "tip" | "warning" | "insight";
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}
