"use client";

import { motion } from "motion/react";
import { Droplets, Sparkles, Timer } from "lucide-react";
import { formatCurrency } from "@/lib/formatters/locale";
import { LeakRow } from "./leak-row";
import type { MoneyLeakDetectorCardProps } from "./types";

export { type MoneyLeakDetectorCardProps } from "./types";

export function MoneyLeakDetectorCard({
  report,
  currency,
  period,
}: MoneyLeakDetectorCardProps) {
  const monthlySavingsMinor = report.totalMonthlySavingsMinor;

  return (
    <section
      aria-labelledby="money-leak-title"
      className="relative overflow-hidden glass-vessel"
    >
      <div className="relative flex flex-wrap items-center justify-between gap-3 px-5 pt-5 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Droplets size={15} aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-foreground" id="money-leak-title">
              Money leak detector
            </h2>
            <p className="mt-0.5 text-xs text-foreground-secondary">
              Spend above what you normally do — found in your last{" "}
              {Math.max(1, report.monthsAnalyzed)} months
            </p>
          </div>
        </div>
        {report.hasLeaks && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-surface px-3 py-1 text-[11px] font-semibold text-warning">
            <Timer size={12} aria-hidden="true" />
            {report.leaks.length} leak{report.leaks.length === 1 ? "" : "s"} found
          </span>
        )}
      </div>

      {report.status === "insufficient-data" && (
        <div className="relative px-5 pb-5">
          <p className="text-sm text-foreground-secondary">
            Track a few more months of expenses and the leak scan will kick in. It
            compares each category against your own average, so it can only report
            once it has a baseline.
          </p>
        </div>
      )}

      {report.status === "available" && !report.hasLeaks && (
        <div className="relative px-5 pb-5">
          <p className="flex items-center gap-2 text-sm text-foreground-secondary">
            <Sparkles className="size-4 text-primary" aria-hidden="true" />
            No leaks detected — your discretionary spending is in line with your
            usual months.
          </p>
        </div>
      )}

      {report.hasLeaks && (
        <>
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative px-5 pb-4"
          >
            <p className="text-xs text-foreground-secondary">
              You could save, per month
            </p>
            <p className="mt-0.5 text-3xl font-bold tracking-tight tabular-nums text-foreground">
              {formatCurrency({ minorValue: monthlySavingsMinor, currency })}
            </p>
          </motion.div>

          <div className="relative space-y-2 px-5 pb-4">
            {report.leaks.map((leak) => (
              <LeakRow key={leak.categoryId} leak={leak} currency={currency} period={period} />
            ))}
          </div>

          <div className="relative border-t border-white/[0.06] px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="flex items-center gap-1.5 text-xs text-foreground-secondary">
                <Timer size={13} aria-hidden="true" />
                Potential annual savings
              </p>
              <p className="text-lg font-bold tabular-nums text-success">
                {formatCurrency({ minorValue: report.totalAnnualSavingsMinor, currency })}
              </p>
            </div>
          </div>
        </>
      )}
    </section>
  );
}