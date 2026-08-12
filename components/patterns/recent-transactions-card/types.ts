import type { Transaction } from "@/lib/domain/types";

export interface RecentTransactionsCardProps {
  transactions: readonly Transaction[];
  currency: string;
  allRecordsHref: string;
}
