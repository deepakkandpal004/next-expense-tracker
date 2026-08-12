import { formatCurrency } from "@/lib/formatters/locale";
import { appPeriodHref } from "@/lib/domain/reporting-period";
import type { ReportingPeriod } from "@/lib/domain/types";

export function recordsHref(categoryId: string, period: ReportingPeriod): string {
  const base = appPeriodHref("records", period) ?? "/records";
  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}category=${encodeURIComponent(categoryId)}`;
}

export function money(minorValue: number, currency: string): string {
  return formatCurrency({ minorValue, currency });
}