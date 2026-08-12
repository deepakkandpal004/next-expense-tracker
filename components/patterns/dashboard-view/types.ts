import type { CashFlowProjection } from "@/lib/domain/cash-flow";
import type { DashboardDTO } from "@/lib/domain/dashboard";
import type { SafeToSpendBreakdown } from "@/lib/domain/safe-to-spend";
import type { SmartPacingReport } from "@/lib/domain/smart-alerts";
import type { ReportingPeriod } from "@/lib/domain/types";

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
