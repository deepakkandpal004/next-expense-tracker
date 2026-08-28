import type { CashFlowProjection } from "@/src/common/domain/cash-flow";
import type { DashboardDTO } from "@/src/common/domain/dashboard";
import type { SafeToSpendBreakdown } from "@/src/common/domain/safe-to-spend";
import type { SmartPacingReport } from "@/src/common/domain/smart-alerts";
import type { ReportingPeriod } from "@/src/common/domain/types";

export interface DashboardUser {
  name: string | null;
}

export interface DashboardViewProps {
  dashboard: DashboardDTO;
  period: ReportingPeriod;
  safeToSpend: SafeToSpendBreakdown;
  cashFlow: CashFlowProjection;
  smartPacing: SmartPacingReport;
  user?: DashboardUser;
}
