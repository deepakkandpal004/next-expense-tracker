import { cn } from "@/src/common/ui/cn";
import { formatMinor } from "./utils";

export function BreakdownLines({
  lines,
  safeToSpendMinor,
  currency,
  isDeficit,
}: {
  lines: readonly { key: string; label: string; amountMinor: number; subtracts: boolean }[];
  safeToSpendMinor: number;
  currency: string;
  isDeficit: boolean;
}) {
  return (
    <div className="mt-6 space-y-2">
      {lines
        .filter((line) => line.key !== "safe-to-spend")
        .map((line) => (
          <div key={line.key} className="flex items-center justify-between gap-2 text-sm">
            <span className="text-on-surface-variant/70">{line.label}</span>
            <span
              className={cn(
                "font-medium tabular-nums",
                line.subtracts ? "text-kpi-expense" : "text-on-surface",
              )}
            >
              {line.subtracts ? "−" : ""}
              {formatMinor(line.amountMinor, currency)}
            </span>
          </div>
        ))}

      <div className="mt-3 border-t border-white/10 pt-3" />

      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-bold text-on-surface">Safe to spend</span>
        <span className="text-xl font-bold tabular-nums tracking-tight text-on-surface">
          {isDeficit
            ? "—"
            : formatMinor(safeToSpendMinor, currency)}
        </span>
      </div>
    </div>
  );
}
