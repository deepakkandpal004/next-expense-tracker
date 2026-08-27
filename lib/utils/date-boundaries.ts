/**
 * Single source of truth for UTC day boundaries used across data loaders.
 * Previously duplicated in 7 files — centralizing removes drift and
 * makes period logic testable in one place.
 */

export function boundaryAtStart(date: string): Date {
  return new Date(`${date}T00:00:00.000Z`);
}

export function boundaryAtEnd(date: string): Date {
  return new Date(`${date}T23:59:59.999Z`);
}

export function startOfUtcDay(date: string): Date {
  return boundaryAtStart(date);
}

export function endOfUtcDay(date: string): Date {
  return boundaryAtEnd(date);
}

export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function periodDays(start: string, end: string): number {
  const startMs = boundaryAtStart(start).getTime();
  const endMs = boundaryAtEnd(end).getTime();
  return Math.max(1, Math.round((endMs - startMs) / (24 * 60 * 60 * 1000)) + 1);
}

/** Days from tomorrow through period end (0 if period already ended) */
export function remainingDaysFromTomorrow(periodEnd: string): number {
  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;
  const todayStart = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const tomorrowStart = todayStart + dayMs;
  const endMs = boundaryAtEnd(periodEnd).getTime();
  if (endMs < tomorrowStart) return 0;
  return Math.floor((endMs - tomorrowStart) / dayMs) + 1;
}

export function monthKeyUtc(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function trailingMonths(now: Date, count: number): string[] {
  const months: string[] = [];
  const cursor = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  for (let index = 0; index < count; index += 1) {
    cursor.setUTCMonth(cursor.getUTCMonth() - 1);
    months.push(`${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, "0")}`);
  }
  return months;
}

export function nextRecurrenceOccurrence(base: Date, frequency: string, interval: number): Date {
  const next = new Date(base);
  switch (frequency) {
    case "daily":
      next.setDate(next.getDate() + interval);
      break;
    case "weekly":
      next.setDate(next.getDate() + 7 * interval);
      break;
    case "monthly":
      next.setMonth(next.getMonth() + interval);
      break;
    case "yearly":
      next.setFullYear(next.getFullYear() + interval);
      break;
  }
  return next;
}
