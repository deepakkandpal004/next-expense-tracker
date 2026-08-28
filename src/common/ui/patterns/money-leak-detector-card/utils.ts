import { appPeriodHref } from "@/src/common/domain/reporting-period";
import type { ReportingPeriod } from "@/src/common/domain/types";

export function leakHref(categoryId: string, period: ReportingPeriod): string {
  const base = appPeriodHref("records", period) ?? "/records";
  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}category=${encodeURIComponent(categoryId)}`;
}