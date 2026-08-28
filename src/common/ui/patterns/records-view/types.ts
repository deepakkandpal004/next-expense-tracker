import type { ReportingPeriod, ResolvedPeriod, Transaction } from "@/src/common/domain/types";

export const ITEMS_PER_PAGE = 15;

export interface RecordsViewProps {
  records: readonly Transaction[];
  period: ReportingPeriod;
  resolvedPeriod: ResolvedPeriod;
  pagination?: {
    total: number;
    page: number;
    hasMore: boolean;
    take: number;
  };
}
