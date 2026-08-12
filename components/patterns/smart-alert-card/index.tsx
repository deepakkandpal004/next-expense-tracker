"use client";

import { AlertTriangle, Gauge } from "lucide-react";
import { SmartAlertRow } from "./smart-alert-row";
import type { SmartAlertCardProps } from "./types";

export { type SmartAlertCardProps } from "./types";

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