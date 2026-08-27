import { ArrowRight, Calendar, TrendingDown } from "lucide-react";
import { CurrencyText } from "@/components/ui";
import type { ContributionCandidate } from "@/lib/domain/goal-plan";

export function LeverRow({ lever, currency }: { lever: ContributionCandidate; currency: string }) {
  return (
    <a
      aria-label={`Open ${lever.label}`}
      className="group flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-3.5 py-3 transition-colors duration-150 hover:border-primary/30 hover:bg-primary/[0.04]"
      href={lever.href}
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.04]">
        {lever.kind === "subscription-cancel" ? (
          <Calendar size={14} className="text-warning" aria-hidden="true" />
        ) : (
          <TrendingDown size={14} className="text-success" aria-hidden="true" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{lever.label}</p>
        {lever.detail && (
          <p className="mt-0.5 truncate text-xs text-foreground-secondary">{lever.detail}</p>
        )}
      </div>
      <div className="shrink-0 text-right">
        <p className="text-sm font-semibold tabular-nums text-success">
          +<CurrencyText currency={currency} minorValue={lever.amountMinor} />
        </p>
        <p className="mt-0.5 flex items-center justify-end gap-1 text-[11px] text-foreground-secondary/70">
          <ArrowRight className="size-3 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
          View
        </p>
      </div>
    </a>
  );
}
