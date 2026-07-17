"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/ui/cn";
import { enforceSentenceCase } from "@/lib/ui/primitive-registry";

export interface TabItem {
  value: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
}

export type TabsVisualState = "default" | "invalid" | "success";

export interface TabsProps {
  label: string;
  items: readonly TabItem[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  loading?: boolean;
  state?: TabsVisualState;
  className?: string;
}

export function Tabs({ label, items, defaultValue, value, onValueChange, loading = false, state = "default", className }: TabsProps) {
  enforceSentenceCase(label, "Tabs label");
  items.forEach((item) => enforceSentenceCase(item.label, "Tab label"));
  const initialValue = defaultValue ?? items.find((item) => !item.disabled)?.value;
  const [internalValue, setInternalValue] = useState(initialValue);
  const currentValue = value ?? internalValue;

  const handleChange = (newValue: string) => {
    if (value === undefined) setInternalValue(newValue);
    onValueChange?.(newValue);
  };

  const primitiveState = loading ? "loading" : state;

  return (
    <div
      aria-busy={loading || undefined}
      className={cn(
        "min-w-0",
        state === "invalid" && "rounded-control ring-1 ring-danger-border",
        state === "success" && "rounded-control ring-1 ring-success-border",
        className,
      )}
      data-state={primitiveState}
    >
      <div aria-label={label} className="flex min-w-0 gap-1 overflow-x-auto border-b border-border" role="tablist">
        {items.map((item) => (
          <button
            aria-selected={currentValue === item.value}
            className="min-h-11 min-w-11 shrink-0 border-b-2 border-transparent px-4 py-2 text-interface-sm font-semibold text-foreground-secondary hover:bg-surface-subtle hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:bg-surface-subtle disabled:cursor-not-allowed disabled:opacity-60 data-[state=active]:border-primary data-[state=active]:text-primary"
            data-state={currentValue === item.value ? "active" : "inactive"}
            disabled={item.disabled || loading}
            key={item.value}
            onClick={() => handleChange(item.value)}
            role="tab"
            tabIndex={currentValue === item.value ? 0 : -1}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>
      {items.map((item) => (
        <div
          aria-labelledby={`tab-${item.value}`}
          className="pt-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
          hidden={currentValue !== item.value}
          key={item.value}
          role="tabpanel"
          tabIndex={0}
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}
