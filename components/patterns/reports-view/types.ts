import type { ResolvedPeriod } from "@/lib/domain/types";

export interface ReportsViewProps {
  period: ResolvedPeriod;
  currency?: string;
}
