"use client";

import { AlertTriangle, ArrowRight, Gauge } from "lucide-react";
import { formatCurrency } from "@/lib/formatters/locale";
import { appPeriodHref } from "@/lib/domain/reporting-period";
import type { SmartPacingAlert, SmartPacingReport } from "@/lib/domain/smart-alerts";
import type { ReportingPeriod } from "@/lib/domain/types";

export interface SmartAlertCardProps {
  report: SmartPacingReport;
  currency: string;
  period: ReportingPeriod;
}

function recordsHref(categoryId: string, period: ReportingPeriod): string {
  const base = appPeriodHref("records", period) ?? "/records";
  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}category=${encodeURIComponent(categoryId)}`;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] text-foreground-secondary">{label}</span>
      <span className="text-sm font-semibold tabular-nums text-foreground">{value}</span>
    </div>
  );
}

function money(minorValue: number, currency: string): string {
  return formatCurrency({ minorValue, currency });
}

function SmartAlertRow({
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

export function SmartAlertCard({ report, currency, period }: SmartAlertCardProps) {
  if (report.status !== "available" || report.alerts.length === 0) return null;

  return (
    <section
      aria-labelledby="smart-alert-title"
      className="relative overflow-hidden glass-vessel"
    >
      <div className="relative flex flex-wrap items-center justify-between gap-3 px-5 pt-5 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-warning/10 text-warning">
            <Gauge size={15} aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-foreground" id="smart-alert-title">
              Pacing alerts
            </h2>
            <p className="mt-0.5 text-xs text-foreground-secondary">
              Where you&apos;re spending faster than your own usual pace
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/10 px-3 py-1 text-[11px] font-semibold text-warning">
          <AlertTriangle size={12} aria-hidden="true" />
          {report.alerts.length} alert{report.alerts.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="relative space-y-2 px-5 pb-5">
        {report.alerts.map((alert) => (
          <SmartAlertRow
            alert={alert}
            currency={currency}
            key={alert.categoryId}
            period={period}
          />
        ))}
      </div>
    </section>
  );
}