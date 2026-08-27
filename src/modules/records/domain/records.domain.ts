/**
 * Records domain — re-exports pure transaction logic.
 * Previously lib/domain/transaction-command + record-selection.
 */
export {
  validateTransactionCommand,
  type TransactionCommand,
  type TransactionCommandInput,
  type TransactionCommandField,
} from "@/lib/domain/transaction-command";

export {
  filterRecords as selectRecords,
  type RecordSelection,
  type ActiveRecordFilter,
} from "@/lib/domain/record-selection";

export type { Transaction } from "@/lib/domain/types";
export { isCategoryId, CATEGORY_DEFINITIONS } from "@/lib/domain/categories";
