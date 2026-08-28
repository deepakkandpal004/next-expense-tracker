import type { ReportingPeriod } from "@/src/common/domain/types";
import type { SafeToSpendBreakdown } from "@/src/common/domain/safe-to-spend";

export interface SafeToSpendCardProps {
  period: ReportingPeriod;
  initialBreakdown: SafeToSpendBreakdown;
}
