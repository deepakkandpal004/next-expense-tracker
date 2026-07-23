import * as React from "react";
import { AlertTriangle, AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AlertBannerProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  variant?: "warning" | "danger" | "info" | "success";
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
  className?: string;
}

export function AlertBanner({
  title,
  description,
  variant = "warning",
  action,
  onDismiss,
  className,
  ...props
}: AlertBannerProps) {
  const variantStyles = {
    warning: "border-[rgba(245,166,35,0.3)] bg-[rgba(245,166,35,0.08)] text-[#F5F7FA]",
    danger: "border-[rgba(240,68,56,0.3)] bg-[rgba(240,68,56,0.08)] text-[#F5F7FA]",
    info: "border-[rgba(0,220,229,0.3)] bg-[rgba(0,220,229,0.08)] text-[#F5F7FA]",
    success: "border-[rgba(34,197,94,0.3)] bg-[rgba(34,197,94,0.08)] text-[#F5F7FA]",
  };

  const iconColors = {
    warning: "text-[#F5A623]",
    danger: "text-[#F04438]",
    info: "text-[#00DCE5]",
    success: "text-[#22C55E]",
  };

  const IconComponent = {
    warning: AlertTriangle,
    danger: AlertCircle,
    info: Info,
    success: CheckCircle2,
  }[variant];

  return (
    <div
      className={cn(
        "flex items-start gap-3.5 p-4 rounded-xl border backdrop-blur-md transition-all",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      <IconComponent className={cn("w-5 h-5 shrink-0 mt-0.5", iconColors[variant])} />
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold leading-snug">{title}</h4>
        {description && (
          <p className="text-xs text-[#9AA3AF] mt-1 leading-relaxed">{description}</p>
        )}
        {action && (
          <button
            onClick={action.onClick}
            type="button"
            className="mt-2 text-xs font-semibold text-[#00DCE5] underline underline-offset-4 hover:opacity-80 transition-opacity"
          >
            {action.label}
          </button>
        )}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          type="button"
          className="text-[#9AA3AF] hover:text-[#F5F7FA] p-1 transition-colors"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
