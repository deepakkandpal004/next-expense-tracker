/**
 * Recurring domain — frequency helpers.
 */
export { nextRecurrenceOccurrence } from "@/src/common/utils/date";
export type RecurringFrequency = "daily" | "weekly" | "monthly" | "yearly";

export interface RecurringRecordDTO {
  id: string;
  text: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  frequency: string;
  interval: number;
  startDate: string;
  endDate: string | null;
  lastProcessed: string | null;
  active: boolean;
  nextDue: string | null;
  createdAt: string;
}
