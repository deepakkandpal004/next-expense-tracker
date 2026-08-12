import type { KpiInsight } from "@/lib/domain/types";

export interface AiInsight {
  title: string;
  description: string;
  type: "positive" | "warning" | "info" | "celebration";
  actionLabel?: string;
  actionHref?: string;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
}

export interface HeroKpiCardProps {
  currency: string;
  balance: KpiInsight;
  income: KpiInsight;
  expense: KpiInsight;
  savings: KpiInsight;
  savingsRate: number;
  snapshot?: {
    daysInPeriod: number;
  };
  aiInsight?: AiInsight;
}
