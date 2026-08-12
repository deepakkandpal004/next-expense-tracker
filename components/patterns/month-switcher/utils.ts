import { formatDate } from "@/lib/formatters/locale";
import type { ResolvedPeriod } from "@/lib/domain/types";

const MONTH_LABEL = new Intl.DateTimeFormat("en-IN", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function isCalendarMonth(period: ResolvedPeriod): boolean {
  const start = new Date(`${period.start}T00:00:00Z`);
  const end = new Date(`${period.end}T00:00:00Z`);
  const lastDay = new Date(
    Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0),
  ).getUTCDate();
  return (
    start.getUTCDate() === 1 &&
    end.getUTCDate() === lastDay &&
    end.getUTCMonth() === start.getUTCMonth()
  );
}

export function monthLabel(period: ResolvedPeriod): string {
  if (!isCalendarMonth(period)) {
    return `${formatDate(period.start)} – ${formatDate(period.end)}`;
  }
  return MONTH_LABEL.format(new Date(`${period.start}T00:00:00Z`));
}