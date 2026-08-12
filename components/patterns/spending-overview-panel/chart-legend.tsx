"use client";

import { cn } from "@/lib/ui/cn";
import type { LegendSeries } from "./types";

export function ChartLegend({
  series,
  hiddenSeries,
  onToggle,
}: {
  series: LegendSeries[];
  hiddenSeries: Set<string>;
  onToggle: (key: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {series.map((s) => {
        const hidden = hiddenSeries.has(s.key);
        return (
          <button
            key={s.key}
            type="button"
            onClick={() => onToggle(s.key)}
            className={cn(
              "flex items-center gap-1.5 text-xs font-medium transition-all duration-150",
              hidden ? "text-foreground-secondary/50" : "text-foreground-secondary hover:text-foreground",
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "inline-block h-2 w-2.5 rounded-sm transition-opacity duration-150",
                hidden && "opacity-40",
              )}
              style={{ backgroundColor: s.color }}
            />
            {s.label}
          </button>
        );
      })}
    </div>
  );
}
