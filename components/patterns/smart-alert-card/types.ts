import type { SmartPacingReport } from "@/lib/domain/smart-alerts";
import type { ReportingPeriod } from "@/lib/domain/types";

export interface SmartAlertCardProps {
  report: SmartPacingReport;
  currency: string;
  period: ReportingPeriod;
}
