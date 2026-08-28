/**
 * Records domain — re-exports pure transaction logic.
 * Previously lib/domain/transaction-command + record-selection.
 */
export {
  validateTransactionCommand,
  type TransactionCommand,
  type TransactionCommandInput,
  type TransactionCommandField,
} from "@/src/common/domain/transaction-command";

export {
  filterRecords as selectRecords,
  type RecordSelection,
  type ActiveRecordFilter,
} from "@/src/common/domain/record-selection";

export type { Transaction } from "@/src/common/domain/types";
export { isCategoryId, CATEGORY_DEFINITIONS } from "@/src/common/domain/categories";
