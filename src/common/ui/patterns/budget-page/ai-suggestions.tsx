"use client";

import { motion } from "motion/react";
import { Lightbulb } from "lucide-react";
import { cn } from "@/src/common/ui/cn";
import { MOTION_DURATION, MOTION_EASE } from "@/src/common/ui/motion";
import type { AISuggestion } from "./types";

export function AISuggestions({
  suggestions,
}: {
  suggestions: AISuggestion[];
}) {
  if (suggestions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: MOTION_DURATION.standard, ease: MOTION_EASE.emphasized, delay: 0.25 }}
      className="rounded-2xl border border-border/60 bg-surface p-5 shadow-premium-sm"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
          <Lightbulb size={16} className="text-accent" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">AI Suggestions</h3>
      </div>

      <div className="space-y-3">
        {suggestions.map((suggestion, index) => {
          const Icon = suggestion.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: MOTION_DURATION.standard, delay: index * 0.08 }}
              className="flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-surface-subtle"
            >
              <div className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                suggestion.type === "warning"
                  ? "bg-warning-surface"
                  : suggestion.type === "insight"
                    ? "bg-info-surface"
                    : "bg-kpi-income-surface",
              )}>
                <Icon
                  size={16}
                  className={cn(
                    suggestion.type === "warning"
                      ? "text-warning"
                      : suggestion.type === "insight"
                        ? "text-info"
                        : "text-kpi-income",
                  )}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{suggestion.title}</p>
                <p className="mt-0.5 text-xs text-foreground-secondary leading-relaxed">
                  {suggestion.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
