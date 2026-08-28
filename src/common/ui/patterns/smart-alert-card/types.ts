import type { SmartPacingReport } from "@/src/common/domain/smart-alerts";
import type { ReportingPeriod } from "@/src/common/domain/types";

export interface SmartAlertCardProps {
  report: SmartPacingReport;
  currency: string;
  period: ReportingPeriod;
}
