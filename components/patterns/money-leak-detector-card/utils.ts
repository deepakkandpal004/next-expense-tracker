import { appPeriodHref } from "@/lib/domain/reporting-period";
import type { ReportingPeriod } from "@/lib/domain/types";

export function leakHref(categoryId: string, period: ReportingPeriod): string {
  const base = appPeriodHref("records", period) ?? "/records";
  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}category=${encodeURIComponent(categoryId)}`;
}