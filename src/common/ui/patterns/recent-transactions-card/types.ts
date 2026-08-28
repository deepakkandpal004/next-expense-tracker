import type { Transaction } from "@/src/common/domain/types";

export interface RecentTransactionsCardProps {
  transactions: readonly Transaction[];
  currency: string;
  allRecordsHref: string;
}
