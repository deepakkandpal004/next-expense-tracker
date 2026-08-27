import { formatCurrency } from "@/lib/formatters/locale";
import type { CanAffordBreakdown } from "@/lib/domain/can-i-afford";
import { cn } from "@/lib/ui/cn";

export function formatMinor(minorValue: number, currency: string): string {
  return formatCurrency({ minorValue, currency });
}

export function emergencyLabel(status: CanAffordBreakdown["emergencyStatus"]): string {
  switch (status) {
    case "on-track":
      return "Emergency buffer on track";
    case "below-target":
      return "Emergency buffer below target";
    case "no-goal":
      return "No emergency (safety) goal set up yet";
  }
}

export function ResultRow({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "negative" | "positive";
}) {
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <span className="text-on-surface-variant/70">{label}</span>
      <span
        className={cn(
          "font-medium tabular-nums",
          tone === "negative" && "text-kpi-expense",
          tone === "positive" && "text-kpi-income",
          tone === "default" && "text-on-surface",
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function priceToMinor(input: string): number | null {
  const value = Number(input.trim());
  if (!Number.isFinite(value) || value <= 0) return null;
  return Math.round(value * 100);
}
