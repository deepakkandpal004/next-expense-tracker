import type { ChartModel } from "@/lib/domain/types";
import type { KpiInsight } from "@/lib/domain/types";

export type ChartVisualization = "line" | "bar";

export interface SpendingOverviewPanelProps {
  trendModel: ChartModel;
  spendingInsight: KpiInsight;
  incomeInsight: KpiInsight;
  period: string;
  currency: string;
}

export interface LegendSeries {
  label: string;
  color: string;
  key: string;
}
