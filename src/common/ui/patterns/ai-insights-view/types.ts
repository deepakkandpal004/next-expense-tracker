import type { AiFinancialInsightsData } from "@/app/actions/getAiFinancialInsights";
import type { ReportingPeriod, ResolvedPeriod } from "@/src/common/domain/types";

export interface AiInsightsViewProps {
  initialData: AiFinancialInsightsData | null;
  period: ReportingPeriod;
  resolvedPeriod: ResolvedPeriod;
  currency: string;
  error?: string;
}
