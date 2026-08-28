import * as React from "react";
import { Plus } from "lucide-react";
import { GlassCard } from "./glass-card";
import { Button } from "./actions";
import { cn } from "@/src/common/ui/cn";

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
        <div className="w-12 h-12 rounded-full bg-primary-muted border border-primary/20 flex items-center justify-center text-primary mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button
          label={actionLabel}
          icon={<Plus className="w-4 h-4" />}
          onClick={onAction}
          type="button"
          className="bg-primary text-foreground-inverse hover:bg-primary/90 font-semibold px-5 rounded-lg"
        />
      )}
    </GlassCard>
  );
}
