/**
 * @deprecated Use `@/src/modules/dashboard/infrastructure/safe-to-spend.repository` instead.
 */
export {
  computeUpcomingBillsMinor,
  goalReservationMinor,
  recurringMonthlyExpenseMinor,
  getSafeToSpendData,
  getCachedSafeToSpendData,
  SAFE_TO_SPEND_DEFAULT_CURRENCY,
  type RecurringRule,
  type GoalReservationRow,
} from "@/src/modules/dashboard/infrastructure/safe-to-spend.repository";
