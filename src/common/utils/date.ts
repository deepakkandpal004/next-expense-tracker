/**
 * Shared date utilities — single source for UTC boundaries.
 * Re-exports lib/utils/date-boundaries for modular imports.
 * New code should import from `@/src/common/utils/date`.
 * Legacy `@/lib/utils/date-boundaries` remains for compat.
 */
export {
  boundaryAtStart,
  boundaryAtEnd,
  startOfUtcDay,
  endOfUtcDay,
  toIsoDate,
  periodDays,
  remainingDaysFromTomorrow,
  monthKeyUtc,
  trailingMonths,
  nextRecurrenceOccurrence,
} from "@/lib/utils/date-boundaries";

export { daysInResolvedPeriod, previousResolvedPeriod, nextResolvedPeriod } from "@/lib/domain/reporting-period";
