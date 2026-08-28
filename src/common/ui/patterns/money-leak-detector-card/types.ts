import type { MoneyLeakReport } from "@/src/common/domain/money-leaks";
import type { ReportingPeriod } from "@/src/common/domain/types";

export interface MoneyLeakDetectorCardProps {
  report: MoneyLeakReport;
  currency: string;
  period: ReportingPeriod;
}
