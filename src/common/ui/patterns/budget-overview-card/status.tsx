import { CheckCircle2, AlertTriangle, CreditCard, Wallet } from "lucide-react";
import { cn } from "@/src/common/ui/cn";
import type { BudgetMetric } from "@/src/common/domain/types";

export function utilBar(percentage: number): "safe" | "caution" | "danger" {
  if (percentage >= 1) return "danger";
  if (percentage >= 0.8) return "caution";
  return "safe";
}

export const BAR_COLORS: Record<ReturnType<typeof utilBar>, { bar: string; bg: string }> = {
  safe: { bar: "bg-kpi-income", bg: "bg-kpi-income-surface" },
  caution: { bar: "bg-warning", bg: "bg-warning-surface" },
  danger: { bar: "bg-danger", bg: "bg-danger-surface" },
};

const STATUS_CONFIG = {
  "on-track": { icon: CheckCircle2, label: "On Track", tone: "success" as const },
  "approaching": { icon: AlertTriangle, label: "Near Limit", tone: "warning" as const },
  "exceeded": { icon: CreditCard, label: "Exceeded", tone: "danger" as const },
  "not-configured": { icon: Wallet, label: "No Budget", tone: "neutral" as const },
  "unavailable": { icon: Wallet, label: "Unavailable", tone: "neutral" as const },
} as const;

export function StatusPill({ status }: { status: BudgetMetric["status"] }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG["not-configured"];
  const Icon = config.icon;

  const toneClasses = {
    success: "bg-kpi-income-surface text-kpi-income-foreground",
    warning: "bg-warning-surface text-warning-foreground",
    danger: "bg-danger-surface text-danger-foreground",
    neutral: "bg-surface-subtle text-foreground-secondary",
  };

  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold", toneClasses[config.tone])}>
      <Icon size={10} strokeWidth={2.5} />
      {config.label}
    </span>
  );
}
