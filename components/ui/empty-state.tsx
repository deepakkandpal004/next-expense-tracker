import * as React from "react";
import { Plus } from "lucide-react";
import { GlassCard } from "./glass-card";
import { Button } from "./actions";
import { cn } from "@/lib/utils";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <GlassCard
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-12 min-h-[220px]",
        className
      )}
      {...props}
    >
      {icon && (
        <div className="w-12 h-12 rounded-full bg-[rgba(0,220,229,0.12)] border border-[rgba(0,220,229,0.2)] flex items-center justify-center text-[#00DCE5] mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-base sm:text-lg font-semibold text-[#F5F7FA] mb-1">
        {title}
      </h3>
      <p className="text-sm text-[#9AA3AF] max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button
          label={actionLabel}
          icon={<Plus className="w-4 h-4" />}
          onClick={onAction}
          type="button"
          className="bg-[#00DCE5] text-[#0A0B0D] hover:bg-[#00DCE5]/90 font-semibold px-5 rounded-lg"
        />
      )}
    </GlassCard>
  );
}
