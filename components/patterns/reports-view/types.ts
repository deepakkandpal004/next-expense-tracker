import type { ResolvedPeriod } from "@/lib/domain/types";
import type { CashFlowProjection } from "@/lib/domain/cash-flow";
import type { ReportData } from "@/app/actions/getReportData";

export interface ReportsViewProps {
  period: ResolvedPeriod;
  currency?: string;
  initialData: ReportData;
  initialCashFlow: CashFlowProjection;
}
