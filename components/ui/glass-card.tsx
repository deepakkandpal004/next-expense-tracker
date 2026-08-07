import * as React from "react";
import { cn } from "@/lib/utils";

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
  variant?: "default" | "nested" | "accent";
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "glass-card p-5 transition-all duration-200",
          variant === "nested" && "bg-[var(--bg-surface-2)] border-[var(--border-subtle)]",
          variant === "accent" && "border-[rgba(54,173,163,0.25)] bg-[rgba(54,173,163,0.04)]",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
GlassCard.displayName = "GlassCard";
