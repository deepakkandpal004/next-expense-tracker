import type { MoneyLeakReport } from "@/lib/domain/money-leaks";
import type { ReportingPeriod } from "@/lib/domain/types";

export interface MoneyLeakDetectorCardProps {
  report: MoneyLeakReport;
  currency: string;
  period: ReportingPeriod;
}
