import { AlertTriangle, ArrowRight } from "lucide-react";
import type { SmartPacingAlert } from "@/lib/domain/smart-alerts";
import type { ReportingPeriod } from "@/lib/domain/types";
import { money, recordsHref } from "./utils";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] text-foreground-secondary">{label}</span>
      <span className="text-sm font-semibold tabular-nums text-foreground">{value}</span>
    </div>
  );
}

export function SmartAlertRow({
  alert,
  currency,
  period,
}: {
  alert: SmartPacingAlert;
  currency: string;
  period: ReportingPeriod;
}) {
  const href = recordsHref(alert.categoryId, period);

  return (
    <a
      aria-label={`Open ${alert.label} records for this period`}
      className="group block rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-colors duration-150 hover:border-white/10 hover:bg-white/[0.04]"
      href={href}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <AlertTriangle
            className="mt-0.5 shrink-0 text-warning"
            size={15}
            strokeWidth={2.2}
            aria-hidden="true"
          />
          <div>
            <p className="text-sm font-semibold text-foreground">
              You&apos;re spending faster than usual
            </p>
            <p className="mt-0.5 text-sm text-foreground">
              {money(alert.spentMinor, currency)} on {alert.label} in {alert.daysElapsed} day
              {alert.daysElapsed === 1 ? "" : "s"}.
            </p>
          </div>
        </div>
        <span className="flex shrink-0 items-center gap-1 text-[11px] font-medium text-foreground-secondary/70 transition-colors group-hover:text-primary">
          See records
          <ArrowRight
            className="size-3 transition-transform duration-150 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 border-t border-white/5 pt-3 sm:grid-cols-4">
        <Stat label="Your normal pace" value={money(alert.normalElapsedMinor, currency)} />
        <Stat label="Typical month" value={money(alert.typicalMonthlyMinor, currency)} />
        <Stat
          label="At this rate, month-end"
          value={money(alert.projectedMonthEndMinor, currency)}
        />
        <Stat
          label="Over your typical"
          value={money(alert.excessMinor, currency)}
        />
      </div>

      {alert.daysRemaining > 0 && alert.recommendedDailyCapMinor > 0 && (
        <p className="mt-3 flex items-start gap-2 rounded-lg bg-warning/10 px-3 py-2 text-xs text-warning">
          <AlertTriangle className="mt-0.5 shrink-0" size={13} aria-hidden="true" />
          <span>
            Recommended: keep {alert.label} spending below{" "}
            <span className="font-semibold tabular-nums">
              {money(alert.recommendedDailyCapMinor, currency)}
              /day
            </span>{" "}
            for the next {alert.daysRemaining} day{alert.daysRemaining === 1 ? "" : "s"} to
            stay near your {money(alert.typicalMonthlyMinor, currency)} monthly pace.
          </span>
        </p>
      )}
    </a>
  );
}