import type { HTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/ui/cn";
import { enforceActionLabel, enforceSentenceCase } from "@/lib/ui/primitive-registry";

const alertVariants = cva("rounded-2xl border p-4", {
  variants: {
    tone: {
      info: "border-info-border bg-info-surface text-info-foreground",
      success: "border-success-border bg-success-surface text-success-foreground",
      warning: "border-warning-border bg-warning-surface text-warning-foreground",
      danger: "border-danger-border bg-danger-surface text-danger-foreground",
    },
  },
  defaultVariants: { tone: "info" },
});

export interface AlertProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {
  title: string;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  actionRequired?: boolean;
}

export function Alert({ title, description, icon, action, actionRequired = false, tone, className, ...props }: AlertProps) {
  enforceSentenceCase(title, "Alert title");
  const assertive = actionRequired || tone === "danger";
  return (
    <div className={cn(alertVariants({ tone }), className)} role={assertive ? "alert" : "status"} {...props}>
      <div className="flex min-w-0 gap-3">
        {icon ? <span aria-hidden="true" className="shrink-0">{icon}</span> : null}
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{title}</p>
          {description ? <div className="mt-1 text-interface-sm">{description}</div> : null}
          {action ? <div className="mt-3">{action}</div> : null}
        </div>
      </div>
    </div>
  );
}

export interface StatusRegionProps extends HTMLAttributes<HTMLDivElement> {
  message?: string;
  politeness?: "polite" | "assertive";
  visible?: boolean;
  busy?: boolean;
}

export function StatusRegion({ message, politeness = "polite", visible = false, busy = false, className, ...props }: StatusRegionProps) {
  if (message) enforceSentenceCase(message, "Status message");
  return (
    <div
      aria-atomic="true"
      aria-busy={busy || undefined}
      aria-live={politeness}
      className={cn(!visible && "sr-only", visible && "text-interface-sm text-foreground-secondary", className)}
      role={politeness === "assertive" ? "alert" : "status"}
      {...props}
    >
      {message}
    </div>
  );
}

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  minimumHeight?: string;
  lines?: number;
}

export function Skeleton({ label, minimumHeight = "8rem", lines = 3, className, style, ...props }: SkeletonProps) {
  enforceSentenceCase(label, "Skeleton label");
  return (
    <div
      aria-busy="true"
      aria-label={label}
      aria-live="polite"
      className={cn(
        "w-full overflow-hidden rounded-2xl border border-border/30 bg-surface p-5",
        className,
      )}
      data-feedback-state="loading"
      role="status"
      style={{ minHeight: minimumHeight, ...style }}
      {...props}
    >
      <span className="sr-only">{label}</span>
      <div aria-hidden="true" className="space-y-3">
        {/* Header shimmer */}
        <div className="flex items-center gap-3">
          <span className="block h-8 w-8 shrink-0 rounded-lg bg-surface-subtle animate-shimmer" />
          <div className="flex-1 space-y-2">
            <span className="block h-3.5 w-1/3 rounded-lg bg-surface-subtle animate-shimmer" />
            <span className="block h-3 w-1/4 rounded-lg bg-surface-subtle/60 animate-shimmer" />
          </div>
        </div>
        {/* Content lines */}
        {Array.from({ length: Math.max(1, lines) }, (_, index) => (
          <span
            className={cn(
              "block h-3 rounded-lg bg-surface-subtle animate-shimmer motion-reduce:animate-none",
              index === 0 && "w-full",
              index === 1 && "w-5/6",
              index === 2 && "w-4/6",
              index > 2 && "w-3/5",
            )}
            key={index}
            style={{ animationDelay: `${index * 80}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

interface StatePanelProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description: ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
}

export interface EmptyStateProps extends StatePanelProps {
  scope?: string;
}

export function EmptyState({ title, description, action, icon, scope, className, ...props }: EmptyStateProps) {
  enforceSentenceCase(title, "Empty state title");
  return (
    <div className={cn("rounded-2xl border border-dashed border-border-strong bg-surface p-8 text-center", className)} {...props}>
      {icon ? <div aria-hidden="true" className="mb-4 flex justify-center text-foreground-secondary">{icon}</div> : null}
      <h3 className="text-interface-md font-semibold text-foreground">{title}</h3>
      <div className="mx-auto mt-2 max-w-prose text-interface-sm text-foreground-secondary">{description}</div>
      {scope ? <p className="mt-2 text-interface-xs text-foreground-secondary">{scope}</p> : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

export interface ErrorStateProps extends StatePanelProps {
  retryLabel?: string;
}

export function ErrorState({ title, description, action, icon, retryLabel, className, ...props }: ErrorStateProps) {
  enforceSentenceCase(title, "Error state title");
  if (retryLabel) enforceActionLabel(retryLabel, "Retry label");
  return (
    <div className={cn("rounded-2xl border border-danger-border bg-danger-surface p-6 text-danger-foreground", className)} role="alert" {...props}>
      <div className="flex min-w-0 gap-3">
        {icon ? <span aria-hidden="true" className="shrink-0">{icon}</span> : null}
        <div className="min-w-0">
          <h3 className="font-semibold">{title}</h3>
          <div className="mt-1 text-interface-sm">{description}</div>
          {action ? <div className="mt-4">{action}</div> : null}
        </div>
      </div>
    </div>
  );
}
