import type { ChartModel } from "@/src/common/domain/types";
import type { KpiInsight } from "@/src/common/domain/types";

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
