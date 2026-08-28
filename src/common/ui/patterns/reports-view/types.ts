import type { ResolvedPeriod } from "@/src/common/domain/types";
import type { CashFlowProjection } from "@/src/common/domain/cash-flow";
import type { ReportData } from "@/app/actions/getReportData";

export interface ReportsViewProps {
  period: ResolvedPeriod;
  currency?: string;
  initialData: ReportData;
  initialCashFlow: CashFlowProjection;
}
