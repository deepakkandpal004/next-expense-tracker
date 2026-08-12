import { ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/formatters/locale";
import type { MoneyLeak } from "@/lib/domain/money-leaks";
import type { ReportingPeriod } from "@/lib/domain/types";
import { leakHref } from "./utils";

export function LeakRow({
  leak,
  currency,
  period,
}: {
  leak: MoneyLeak;
  currency: string;
  period: ReportingPeriod;
}) {
  return (
    <a
      aria-label={`Open ${leak.label} records for this period`}
      className="group flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-3.5 py-3 transition-colors duration-150 hover:border-white/10 hover:bg-white/[0.04]"
      href={leakHref(leak.categoryId, period)}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{leak.label}</p>
        <p className="mt-0.5 text-xs text-foreground-secondary">
          {formatCurrency({ minorValue: leak.currentMonthlyMinor, currency })}/mo · typical{" "}
          {formatCurrency({ minorValue: leak.typicalMonthlyMinor, currency })}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold tabular-nums text-[#22C55E]">
          −{formatCurrency({ minorValue: leak.potentialSavingsMinor, currency })}
        </p>
        <p className="mt-0.5 flex items-center justify-end gap-1 text-[11px] text-foreground-secondary/70">
          <ArrowRight className="size-3 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
          See records
        </p>
      </div>
    </a>
  );
}