import type {
  CurrencyCode,
  ISODate,
  MetricValue,
  MinorUnitAmount,
} from "../domain/types";

export const APPLICATION_LOCALE_FALLBACK = "en-IN";
export const APPLICATION_CURRENCY_FALLBACK = "INR";

export interface LocaleOptions {
  locale?: string | null;
  browserLocales?: readonly string[];
}

export interface DateTimeFormatOptions extends LocaleOptions {
  timeZone?: string;
}

export interface CurrencyAmount {
  minorValue: MinorUnitAmount;
  currency: CurrencyCode;
}

export interface CurrencyFormatOptions extends LocaleOptions {
  currencyDisplay?: "symbol" | "narrowSymbol" | "code" | "name";
}

function firstSupportedLocale(candidates: readonly string[]): string | undefined {
  for (const candidate of candidates) {
    try {
      const canonical = Intl.getCanonicalLocales(candidate)[0];
      if (canonical && Intl.DateTimeFormat.supportedLocalesOf(canonical).length > 0) {
        return canonical;
      }
    } catch {
      // Ignore malformed preferences and continue to the documented fallback.
    }
  }

  return undefined;
}

function runtimeBrowserLocales(): readonly string[] {
  return [APPLICATION_LOCALE_FALLBACK];
}

export function resolveFormattingLocale(
  selectedLocale?: string | null,
  browserLocales?: readonly string[],
): string {
  const selected = selectedLocale
    ? firstSupportedLocale([selectedLocale])
    : undefined;

  const locales = browserLocales ?? runtimeBrowserLocales();

  return (
    selected ??
    firstSupportedLocale(locales) ??
    APPLICATION_LOCALE_FALLBACK
  );
}

function localeFrom(options: LocaleOptions): string {
  return resolveFormattingLocale(options.locale, options.browserLocales);
}

export function getCurrencyMinorUnitDigits(
  currency: CurrencyCode,
  options: LocaleOptions = {},
): number {
  return (
    new Intl.NumberFormat(localeFrom(options), {
      style: "currency",
      currency,
    }).resolvedOptions().maximumFractionDigits ?? 2
  );
}

export function formatCurrency(
  amount: CurrencyAmount,
  options: CurrencyFormatOptions = {},
): string {
  if (!Number.isSafeInteger(amount.minorValue)) {
    throw new RangeError("Currency minorValue must be a safe integer");
  }

  const locale = localeFrom(options);
  const fractionDigits = getCurrencyMinorUnitDigits(amount.currency, options);
  const majorValue = amount.minorValue / 10 ** fractionDigits;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: amount.currency,
    currencyDisplay: options.currencyDisplay ?? "symbol",
  }).format(majorValue);
}

export function getCurrencySymbol(
  currency: CurrencyCode,
  options: LocaleOptions = {},
): string {
  const part = new Intl.NumberFormat(localeFrom(options), {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
  })
    .formatToParts(0)
    .find(({ type }) => type === "currency");

  return part?.value ?? currency;
}

export const UNAVAILABLE_METRIC_LABEL = "Unavailable";

export function formatMetricValue(
  metric: MetricValue,
  currency: CurrencyCode,
  options: CurrencyFormatOptions = {},
): string {
  return metric.status === "unavailable"
    ? UNAVAILABLE_METRIC_LABEL
    : formatCurrency({ minorValue: metric.minorValue, currency }, options);
}

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function parseDateOnly(value: string): Date | undefined {
  const match = ISO_DATE_PATTERN.exec(value);
  if (!match) {
    return undefined;
  }

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new RangeError(`Invalid calendar date: ${value}`);
  }

  return date;
}

type FormattableDate = Date | ISODate | number;

function parseFormattableDate(value: FormattableDate): {
  date: Date;
  isDateOnly: boolean;
} {
  const dateOnly = typeof value === "string" ? parseDateOnly(value) : undefined;
  const date = dateOnly ?? (value instanceof Date ? new Date(value) : new Date(value));

  if (Number.isNaN(date.getTime())) {
    throw new RangeError(`Invalid date or time: ${String(value)}`);
  }

  return { date, isDateOnly: dateOnly !== undefined };
}

function timeZoneFor(
  isDateOnly: boolean,
  requestedTimeZone: string | undefined,
): string | undefined {
  return isDateOnly ? "UTC" : requestedTimeZone;
}

export function formatDate(
  value: FormattableDate,
  options: DateTimeFormatOptions = {},
): string {
  const { date, isDateOnly } = parseFormattableDate(value);

  return new Intl.DateTimeFormat(localeFrom(options), {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: timeZoneFor(isDateOnly, options.timeZone),
  }).format(date);
}

export function formatTime(
  value: FormattableDate,
  options: DateTimeFormatOptions = {},
): string {
  const { date, isDateOnly } = parseFormattableDate(value);

  return new Intl.DateTimeFormat(localeFrom(options), {
    hour: "numeric",
    minute: "2-digit",
    timeZone: timeZoneFor(isDateOnly, options.timeZone),
  }).format(date);
}

export function formatDateTime(
  value: FormattableDate,
  options: DateTimeFormatOptions = {},
): string {
  const { date, isDateOnly } = parseFormattableDate(value);

  return new Intl.DateTimeFormat(localeFrom(options), {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: timeZoneFor(isDateOnly, options.timeZone),
  }).format(date);
}

export function formatExactTime(
  value: FormattableDate,
  options: DateTimeFormatOptions = {},
): string {
  const { date, isDateOnly } = parseFormattableDate(value);

  return new Intl.DateTimeFormat(localeFrom(options), {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
    timeZone: timeZoneFor(isDateOnly, options.timeZone),
  }).format(date);
}

export interface PercentageFormatOptions extends LocaleOptions {
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

export function formatPercentage(
  ratio: number,
  options: PercentageFormatOptions = {},
): string {
  if (!Number.isFinite(ratio)) {
    throw new RangeError("Percentage ratio must be finite");
  }

  return new Intl.NumberFormat(localeFrom(options), {
    style: "percent",
    minimumFractionDigits: options.minimumFractionDigits,
    maximumFractionDigits: options.maximumFractionDigits ?? 1,
  }).format(ratio);
}
