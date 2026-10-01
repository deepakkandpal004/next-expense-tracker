"use client";

import dynamic from "next/dynamic";
import { ViewportMount } from "@/src/common/ui";
import { formatCurrency } from "@/src/common/formatters/locale";
import { StatusBadge } from "./status-badge";
import type { CashFlowForecastCardProps } from "./types";

export { type CashFlowForecastCardProps } from "./types";

const CashFlowChartCanvas = dynamic(
  () => import("./chart-canvas").then((mod) => mod.CashFlowChartCanvas),
  { ssr: false },
);

export function CashFlowForecastCard({ projection }: CashFlowForecastCardProps) {
  const isEnded = projection.state === "ended";
  const netMinor = projection.projectedIncomeMinor - projection.projectedSpendMinor;
  const netPositive = netMinor >= 0;

  return (
    <section
      aria-labelledby="cash-flow-title"
      className="relative overflow-hidden rounded-2xl border border-border bg-surface"
    >
      <div className="relative flex flex-wrap items-center justify-between gap-3 px-5 pt-5 pb-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground" id="cash-flow-title">
            Cash flow forecast
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {projection.period.label}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge state={projection.state} netPositive={netPositive} />
        </div>
      </div>

      <div className="relative px-5 pb-4">
        <p className="text-xs text-muted-foreground">Month-end balance</p>
        <p className="mt-0.5 text-3xl font-bold tracking-tight tabular-nums text-foreground">
          {formatCurrency({
            minorValue: projection.projectedMonthEndMinor,
            currency: projection.currency,
          })}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
          <span>
            Income{" "}
            <span className="font-semibold text-foreground">
              {formatCurrency({
                minorValue: projection.projectedIncomeMinor,
                currency: projection.currency,
              })}
            </span>
          </span>
          <span>
            Spending{" "}
            <span className="font-semibold text-foreground">
              {formatCurrency({
                minorValue: projection.projectedSpendMinor,
                currency: projection.currency,
              })}
            </span>
          </span>
          {!isEnded && (
            <span>
              {projection.daysRemaining} day{projection.daysRemaining === 1 ? "" : "s"} to go
            </span>
          )}
        </div>
      </div>

      <div className="relative px-5">
        <ViewportMount className="h-56 w-full sm:h-64" fallback={<div className="h-full animate-pulse rounded-lg bg-surface-subtle" />}>
          <CashFlowChartCanvas projection={projection} />
        </ViewportMount>
      </div>

      <div className="relative px-5 py-4">
        <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block h-0.5 w-4 rounded-full"
              style={{ backgroundColor: "var(--color-primary)" }}
            />
            Recorded
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block h-0.5 w-4 rounded-full border-t-2 border-dashed"
              style={{ borderColor: "var(--color-primary)" }}
            />
            Projected
          </span>
        </div>
      </div>
    </section>
  );
}
