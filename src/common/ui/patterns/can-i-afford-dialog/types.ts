import type { ReportingPeriod } from "@/src/common/domain/types";

export interface CanIAffordDialogProps {
  period: ReportingPeriod;
  currency: string;
  /** Optional anchor label for the trigger button. */
  triggerLabel?: string;
}
