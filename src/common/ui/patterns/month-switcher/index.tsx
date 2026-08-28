"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import {
  reportingPeriodForISODate,
  withReportingPeriodSearchParams,
} from "@/src/common/domain/reporting-period";
import type { ResolvedPeriod } from "@/src/common/domain/types";
import { isCalendarMonth, monthLabel } from "./utils";
import type { MonthSwitcherProps } from "./types";

export { type MonthSwitcherProps } from "./types";

export function MonthSwitcher({ period }: MonthSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();

  const navigateTo = (next: ResolvedPeriod) => {
    const params = withReportingPeriodSearchParams(window.location.search, {
      kind: "custom",
      start: next.start,
      end: next.end,
    });
    if (!params) return;
    const query = params.toString();
    router.replace(`${pathname}${query ? `?${query}` : ""}`);
  };

  const shiftMonth = (delta: number): ResolvedPeriod | null => {
    const start = new Date(`${period.start}T00:00:00Z`);
    const target = new Date(
      Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + delta, 1),
    );
    return reportingPeriodForISODate(target.toISOString());
  };

  const isCurrentMonth =
    period.kind === "current-month" ||
    (isCalendarMonth(period) &&
      period.start === `${new Date().toISOString().slice(0, 7)}-01`);

  const currentMonthPeriod = reportingPeriodForISODate(new Date().toISOString());

  return (
    <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.02] p-1">
      <button
        aria-label="Previous month"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        onClick={() => {
          const next = shiftMonth(-1);
          if (next) navigateTo(next);
        }}
        type="button"
      >
        <ChevronLeft size={16} strokeWidth={2.25} />
      </button>
      <span className="min-w-[8.5rem] text-center text-sm font-medium text-white">
        {monthLabel(period)}
      </span>
      <button
        aria-label="Next month"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        disabled={isCurrentMonth}
        onClick={() => {
          const next = shiftMonth(1);
          if (next) navigateTo(next);
        }}
        type="button"
      >
        <ChevronRight size={16} strokeWidth={2.25} />
      </button>
      {!isCurrentMonth && currentMonthPeriod ? (
        <button
          className="ml-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
          onClick={() => navigateTo(currentMonthPeriod)}
          type="button"
        >
          This month
        </button>
      ) : null}
    </div>
  );
}