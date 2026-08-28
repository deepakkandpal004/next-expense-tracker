"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { ViewportMount } from "@/src/common/ui";
import { cn } from "@/src/common/ui/cn";
import { formatCurrency } from "@/src/common/formatters/locale";
import { CategoryRow } from "./category-row";
import { EmptyState } from "./empty-state";
import type { CategoryBreakdownPanelProps } from "./types";

export { type CategoryBreakdownPanelProps } from "./types";

const CategoryChartCanvas = dynamic(
  () => import("./chart-canvas").then((mod) => mod.CategoryChartCanvas),
  { ssr: false },
);

export function CategoryBreakdownPanel({
  breakdown,
  totalSpendingMinor,
  currency,
  period,
}: CategoryBreakdownPanelProps) {
  const [viewAll, setViewAll] = useState(false);

  const visibleRows = viewAll ? breakdown : breakdown.slice(0, 5);
  const hasMore = breakdown.length > 5;
  const totalFormatted = formatCurrency({ minorValue: totalSpendingMinor, currency });


  return (
    <section
      aria-labelledby="category-breakdown-title"
      className="relative overflow-hidden glass-vessel"
    >
      <div className="relative px-5 pt-4 pb-3">
        <h2 className="text-sm font-semibold text-foreground" id="category-breakdown-title">
          Spending by Category
        </h2>
        <p className="mt-0.5 text-xs text-foreground-secondary">{period}</p>
      </div>

      {breakdown.length > 0 ? (
        <div className="relative px-5 pb-4">
          <div className="relative mx-auto" style={{ height: 200, width: 200 }}>
            <ViewportMount className="absolute inset-0" fallback={<div className="h-full animate-pulse rounded-full bg-surface-subtle/60" />}>
              <CategoryChartCanvas breakdown={breakdown} currency={currency} />
            </ViewportMount>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
            >
              <p className="text-lg font-bold text-foreground tabular-nums leading-none">{totalFormatted}</p>
              <p className="text-[10px] text-foreground-secondary mt-1">Total spent</p>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState />
      )}

      <div className={cn("px-3 pb-3", !breakdown.length && "hidden")}>
        <div className="space-y-0.5">
          {visibleRows.map((row, index) => (
            <CategoryRow
              currency={currency}
              index={index}
              key={row.categoryId}
              row={row}
            />
          ))}
        </div>
        {hasMore ? (
          <button
            className="mt-2 w-full rounded-lg py-2 text-center text-xs font-medium text-foreground-secondary transition-colors duration-150 hover:bg-surface-subtle/50 hover:text-foreground"
            onClick={() => setViewAll((prev) => !prev)}
            type="button"
          >
            {viewAll ? "Show less" : `Show all ${breakdown.length} categories`}
          </button>
        ) : null}
      </div>
    </section>
  );
}
