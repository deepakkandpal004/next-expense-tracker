import { formatDate } from "../formatters/locale";
import type { ReportingPeriod, ResolvedPeriod } from "./types";

export const REPORTING_PERIOD_PARAM = "period";
export const REPORTING_PERIOD_START_PARAM = "start";
export const REPORTING_PERIOD_END_PARAM = "end";
export const REPORTING_PERIOD_SESSION_KEY = "expense-ai.reporting-period";

export const APP_PERIOD_DESTINATIONS = Object.freeze({
  dashboard: "/dashboard",
  records: "/records",
  insights: "/insights",
  "ai-insights": "/ai-insights",
  budgets: "/budgets",
  goals: "/goals",
  recurring: "/recurring",
});

export type AppPeriodDestination = keyof typeof APP_PERIOD_DESTINATIONS;
export type CustomReportingPeriod = Extract<
  ReportingPeriod,
  { kind: "custom" }
>;
export type PeriodSearchParams = Pick<URLSearchParams, "get">;

export type ReportingPeriodValidationResult =
  | {
      valid: true;
      input: ReportingPeriod;
      period: ResolvedPeriod;
    }
  | {
      valid: false;
      input: CustomReportingPeriod;
      fieldErrors: Readonly<Partial<Record<"start" | "end", string>>>;
      firstInvalidField: "start" | "end";
    };

export interface SessionStorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const INVALID_DATE_MESSAGE = "Enter a valid calendar date in YYYY-MM-DD format.";
const INVALID_RANGE_MESSAGE = "End date must be on or after the start date.";
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function isValidCalendarDate(value: string): boolean {
  const match = ISO_DATE_PATTERN.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1 || month < 1 || month > 12 || day < 1) return false;

  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return day <= lastDay;
}

function toISODate(date: Date): string {
  return `${date.getUTCFullYear().toString().padStart(4, "0")}-${(
    date.getUTCMonth() + 1
  )
    .toString()
    .padStart(2, "0")}-${date.getUTCDate().toString().padStart(2, "0")}`;
}

function resolvedPeriod(
  kind: ReportingPeriod["kind"],
  start: string,
  end: string,
): ResolvedPeriod {
  return { kind, start, end, label: `${formatDate(start)} – ${formatDate(end)}` };
}

function resolvePreset(kind: "current-month" | "previous-month", now: Date): ResolvedPeriod {
  if (Number.isNaN(now.getTime())) throw new RangeError("now must be a valid Date");

  const offset = kind === "previous-month" ? -1 : 0;
  const firstDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offset, 1));
  const lastDay = new Date(
    Date.UTC(firstDay.getUTCFullYear(), firstDay.getUTCMonth() + 1, 0),
  );
  return resolvedPeriod(kind, toISODate(firstDay), toISODate(lastDay));
}

function shiftISODate(date: string, days: number): string {
  const parsed = new Date(`${date}T00:00:00Z`);
  parsed.setUTCDate(parsed.getUTCDate() + days);
  return toISODate(parsed);
}

/** Inclusive day count between two ISO dates on the same calendar. */
export function daysInResolvedPeriod(period: ResolvedPeriod): number {
  const startTime = new Date(`${period.start}T00:00:00Z`).getTime();
  const endTime = new Date(`${period.end}T00:00:00Z`).getTime();
  return Math.round((endTime - startTime) / (24 * 60 * 60 * 1000)) + 1;
}

/**
 * Produces the previous equivalent reporting period. Calendar presets shift by a full
 * calendar month so 28/29/30/31-day differences are preserved. Custom ranges shift by
 * their own length, ending the day before the current period starts.
 */
export function previousResolvedPeriod(period: ResolvedPeriod): ResolvedPeriod {
  if (period.kind === "current-month" || period.kind === "previous-month") {
    const parsedStart = new Date(`${period.start}T00:00:00Z`);
    const previousStart = new Date(
      Date.UTC(parsedStart.getUTCFullYear(), parsedStart.getUTCMonth() - 1, 1),
    );
    const previousEnd = new Date(
      Date.UTC(previousStart.getUTCFullYear(), previousStart.getUTCMonth() + 1, 0),
    );
    return resolvedPeriod(period.kind, toISODate(previousStart), toISODate(previousEnd));
  }

  const previousEnd = shiftISODate(period.start, -1);
  const days = daysInResolvedPeriod(period);
  const previousStart = shiftISODate(previousEnd, -(days - 1));
  return resolvedPeriod("custom", previousStart, previousEnd);
}

/**
 * Validates user input without rewriting it. Invalid custom values remain in
 * `input` so form fields can display exactly what the user entered.
 */
export function normalizeReportingPeriod(
  input: ReportingPeriod,
  now: Date = new Date(),
): ReportingPeriodValidationResult {
  if (input.kind !== "custom") {
    return { valid: true, input, period: resolvePreset(input.kind, now) };
  }

  const fieldErrors: Partial<Record<"start" | "end", string>> = {};
  if (!isValidCalendarDate(input.start)) fieldErrors.start = INVALID_DATE_MESSAGE;
  if (!isValidCalendarDate(input.end)) fieldErrors.end = INVALID_DATE_MESSAGE;
  if (Object.keys(fieldErrors).length === 0 && input.end < input.start) {
    fieldErrors.end = INVALID_RANGE_MESSAGE;
  }

  const preservedInput = { kind: "custom", start: input.start, end: input.end } as const;
  if (fieldErrors.start || fieldErrors.end) {
    return {
      valid: false,
      input: preservedInput,
      fieldErrors,
      firstInvalidField: fieldErrors.start ? "start" : "end",
    };
  }

  return {
    valid: true,
    input: preservedInput,
    period: resolvedPeriod("custom", input.start, input.end),
  };
}

/** Parse canonical URL state; an absent or unrecognized preset defaults safely. */
export function parseReportingPeriod(
  searchParams: PeriodSearchParams,
  now: Date = new Date(),
): ReportingPeriodValidationResult {
  const kind = searchParams.get(REPORTING_PERIOD_PARAM);
  if (kind === "custom") {
    return normalizeReportingPeriod(
      {
        kind,
        start: searchParams.get(REPORTING_PERIOD_START_PARAM) ?? "",
        end: searchParams.get(REPORTING_PERIOD_END_PARAM) ?? "",
      },
      now,
    );
  }

  return normalizeReportingPeriod(
    { kind: kind === "previous-month" ? "previous-month" : "current-month" },
    now,
  );
}

/** Returns only server-safe canonical parameters; invalid form input is not persisted. */
export function toCanonicalReportingPeriodSearchParams(
  input: ReportingPeriod,
  now: Date = new Date(),
): URLSearchParams | null {
  const normalized = normalizeReportingPeriod(input, now);
  if (!normalized.valid) return null;

  const params = new URLSearchParams();
  params.set(REPORTING_PERIOD_PARAM, normalized.period.kind);
  if (normalized.period.kind === "custom") {
    params.set(REPORTING_PERIOD_START_PARAM, normalized.period.start);
    params.set(REPORTING_PERIOD_END_PARAM, normalized.period.end);
  }
  return params;
}

/** Replaces only period parameters, preserving route-owned state such as filters or chart view. */
export function withReportingPeriodSearchParams(
  search: string | URLSearchParams,
  input: ReportingPeriod,
  now: Date = new Date(),
): URLSearchParams | null {
  const periodParams = toCanonicalReportingPeriodSearchParams(input, now);
  if (!periodParams) return null;

  const params = new URLSearchParams(search);
  params.delete(REPORTING_PERIOD_PARAM);
  params.delete(REPORTING_PERIOD_START_PARAM);
  params.delete(REPORTING_PERIOD_END_PARAM);
  periodParams.forEach((value, key) => params.set(key, value));
  return params;
}

/**
 * Carries the canonical period through route and chart-view links without
 * altering their existing query parameters or fragment.
 */
export function withReportingPeriod(
  href: string,
  input: ReportingPeriod,
  now: Date = new Date(),
): string | null {
  const [pathAndSearch, fragment] = href.split("#", 2);
  const [path, search = ""] = pathAndSearch.split("?", 2);
  const params = withReportingPeriodSearchParams(search, input, now);
  if (!params) return null;

  const query = params.toString();
  return `${path}${query ? `?${query}` : ""}${fragment ? `#${fragment}` : ""}`;
}

export function appPeriodHref(
  destination: AppPeriodDestination,
  input: ReportingPeriod,
  now: Date = new Date(),
): string | null {
  return withReportingPeriod(APP_PERIOD_DESTINATIONS[destination], input, now);
}

/** Stores a mirror only after successful URL serialization; it never supersedes URL state. */
export function writeReportingPeriodSession(
  storage: SessionStorageAdapter,
  input: ReportingPeriod,
  now: Date = new Date(),
): boolean {
  const params = toCanonicalReportingPeriodSearchParams(input, now);
  if (!params) return false;

  try {
    storage.setItem(REPORTING_PERIOD_SESSION_KEY, params.toString());
    return true;
  } catch {
    return false;
  }
}

export function readReportingPeriodSession(
  storage: SessionStorageAdapter,
  now: Date = new Date(),
): ReportingPeriod | undefined {
  try {
    const serialized = storage.getItem(REPORTING_PERIOD_SESSION_KEY);
    if (!serialized) return undefined;
    const parsed = parseReportingPeriod(new URLSearchParams(serialized), now);
    return parsed.valid ? parsed.input : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Resolves a guaranteed-valid period for server route composition. Invalid
 * custom URL values fall back to the current month rather than blocking the
 * route; period-editing UI should validate before writing new URL state.
 */
export function resolveValidReportingPeriod(
  searchParams: PeriodSearchParams,
  now: Date = new Date(),
): { input: ReportingPeriod; period: ResolvedPeriod } {
  const parsed = parseReportingPeriod(searchParams, now);
  if (parsed.valid) return { input: parsed.input, period: parsed.period };

  const fallback = normalizeReportingPeriod({ kind: "current-month" }, now);
  // normalizeReportingPeriod always resolves a preset kind successfully.
  if (!fallback.valid) throw new Error("current-month period failed to resolve.");
  return { input: fallback.input, period: fallback.period };
}

/**
 * URL parameters are authoritative for rendering. The session mirror is read
 * only when no period parameter is supplied, so it cannot become a second
 * competing source of truth.
 */
export function resolveReportingPeriodState(
  searchParams: PeriodSearchParams,
  storage?: SessionStorageAdapter,
  now: Date = new Date(),
): ReportingPeriodValidationResult {
  if (searchParams.get(REPORTING_PERIOD_PARAM) !== null) {
    return parseReportingPeriod(searchParams, now);
  }

  const sessionPeriod = storage && readReportingPeriodSession(storage, now);
  return normalizeReportingPeriod(sessionPeriod ?? { kind: "current-month" }, now);
}
