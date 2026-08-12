import type { ReportingPeriod } from "@/lib/domain/types";
import type { SafeToSpendBreakdown } from "@/lib/domain/safe-to-spend";

export interface SafeToSpendCardProps {
  period: ReportingPeriod;
  initialBreakdown: SafeToSpendBreakdown;
}
