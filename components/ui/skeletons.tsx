"use client";

import { cn } from "@/lib/ui/cn";

interface ShimmerProps {
  className?: string;
}

function Shimmer({ className }: ShimmerProps) {
  return (
    <div
      className={cn(
        "animate-shimmer rounded-lg bg-surface-subtle motion-reduce:animate-none motion-reduce:bg-surface-subtle",
        className,
      )}
    />
  );
}

/* ─── Dashboard Skeleton ─── */

export function DashboardSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading dashboard" role="status">
      <span className="sr-only">Loading dashboard...</span>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Shimmer className="h-8 w-48 rounded-xl" />
          <Shimmer className="h-4 w-32" />
        </div>
        <Shimmer className="h-9 w-24 rounded-lg" />
      </div>

      {/* Hero KPI Card */}
      <div className="rounded-2xl border border-border/50 bg-surface p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-3">
              <Shimmer className="h-5 w-20 rounded-full" />
              <Shimmer className="h-4 w-16" />
            </div>
            <Shimmer className="h-10 w-40 rounded-xl" />
            <div className="flex gap-6">
              <div className="space-y-1">
                <Shimmer className="h-3 w-12" />
                <Shimmer className="h-5 w-24 rounded-lg" />
              </div>
              <div className="space-y-1">
                <Shimmer className="h-3 w-12" />
                <Shimmer className="h-5 w-24 rounded-lg" />
              </div>
              <div className="space-y-1">
                <Shimmer className="h-3 w-12" />
                <Shimmer className="h-5 w-20 rounded-lg" />
              </div>
            </div>
          </div>
          {/* Sparkline placeholder */}
          <div className="hidden sm:block w-32 h-16">
            <Shimmer className="h-full w-full rounded-xl" />
          </div>
        </div>
      </div>

      {/* Quick Actions Row */}
      <div className="grid grid-cols-2 gap-3">
        <Shimmer className="h-12 rounded-xl" />
        <Shimmer className="h-12 rounded-xl" />
      </div>

      {/* AI Coach Card */}
      <div className="rounded-2xl border border-border/50 bg-surface p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <Shimmer className="h-9 w-9 rounded-xl" />
            <div className="space-y-1.5">
              <Shimmer className="h-3 w-28" />
              <Shimmer className="h-2.5 w-36" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Shimmer className="h-10 w-10 rounded-full" />
            <Shimmer className="h-3 w-14" />
          </div>
        </div>
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <Shimmer className="h-5 w-5 rounded-lg" />
            <Shimmer className="h-5 w-48" />
          </div>
          <Shimmer className="h-4 w-full" />
          <Shimmer className="h-4 w-3/4" />
        </div>
        {/* Monthly stats row */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg bg-white/5 px-2.5 py-2">
              <Shimmer className="h-6 w-6 rounded-md" />
              <div className="space-y-1">
                <Shimmer className="h-2 w-10" />
                <Shimmer className="h-3 w-14" />
              </div>
            </div>
          ))}
        </div>
        {/* Recommendations */}
        <div className="space-y-1.5">
          <Shimmer className="h-2.5 w-28" />
          {[1, 2, 3].map((i) => (
            <Shimmer key={i} className="h-8 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid gap-5 lg:grid-cols-12">
        <div className="lg:col-span-7 rounded-2xl border border-border/50 bg-surface p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-1.5">
              <Shimmer className="h-4 w-32" />
              <Shimmer className="h-3 w-24" />
            </div>
            <div className="flex gap-2">
              <Shimmer className="h-7 w-16 rounded-lg" />
              <Shimmer className="h-7 w-16 rounded-lg" />
            </div>
          </div>
          <div className="h-48">
            <Shimmer className="h-full w-full rounded-xl" />
          </div>
        </div>
        <div className="lg:col-span-5 space-y-5">
          {/* Budget Card */}
          <div className="rounded-2xl border border-border/50 bg-surface p-5">
            <div className="flex items-center justify-between mb-3">
              <Shimmer className="h-4 w-24" />
              <Shimmer className="h-6 w-16 rounded-full" />
            </div>
            <Shimmer className="h-3 w-full rounded-full mb-2" />
            <div className="flex justify-between">
              <Shimmer className="h-3 w-20" />
              <Shimmer className="h-3 w-16" />
            </div>
          </div>
          {/* Category Breakdown */}
          <div className="rounded-2xl border border-border/50 bg-surface p-5">
            <Shimmer className="h-4 w-32 mb-4" />
            <div className="space-y-2.5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Shimmer className="h-3 w-3 rounded-full shrink-0" />
                  <Shimmer className="h-3 flex-1" />
                  <Shimmer className="h-3 w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="rounded-2xl border border-border/50 bg-surface p-5">
        <div className="flex items-center justify-between mb-4">
          <Shimmer className="h-4 w-36" />
          <Shimmer className="h-8 w-24 rounded-lg" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border border-border/30 p-3">
              <Shimmer className="h-10 w-10 rounded-xl shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Shimmer className="h-3.5 w-3/4" />
                <Shimmer className="h-3 w-1/2" />
              </div>
              <Shimmer className="h-4 w-16 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── AI Insights Skeleton ─── */

export function AiInsightsSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading AI insights" role="status">
      <span className="sr-only">Loading AI insights...</span>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Shimmer className="h-8 w-56 rounded-xl" />
          <Shimmer className="h-4 w-64" />
        </div>
        <Shimmer className="h-9 w-28 rounded-lg" />
      </div>

      {/* Greeting Banner */}
      <div className="rounded-xl border border-border/50 bg-surface p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <Shimmer className="h-5 w-48" />
            <Shimmer className="h-3 w-56" />
          </div>
          <Shimmer className="h-10 w-10 rounded-xl shrink-0" />
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-border/50 bg-surface p-4 min-h-[110px] flex flex-col justify-between">
            <div className="flex items-start gap-2.5">
              <Shimmer className="h-8 w-8 rounded-lg shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Shimmer className="h-2.5 w-20" />
                <Shimmer className="h-5 w-24 rounded-lg" />
              </div>
            </div>
            <div className="mt-2 space-y-1">
              <Shimmer className="h-4 w-16 rounded-full" />
              <Shimmer className="h-2.5 w-20" />
            </div>
          </div>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left column */}
        <div className="lg:col-span-7 space-y-4">
          {/* Top Insights Section */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shimmer className="h-5 w-5 rounded-md" />
              <Shimmer className="h-4 w-28" />
            </div>
            <Shimmer className="h-3 w-48 mb-3" />
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl border border-border/50 bg-surface p-4">
                  <div className="flex items-start gap-3 mb-2">
                    <Shimmer className="h-8 w-8 rounded-lg shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Shimmer className="h-2 w-20" />
                      <Shimmer className="h-4 w-full" />
                    </div>
                  </div>
                  <div className="space-y-1.5 pl-11">
                    <Shimmer className="h-3 w-full" />
                    <Shimmer className="h-3 w-3/4" />
                  </div>
                  <div className="mt-2 pl-11">
                    <Shimmer className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Analysis Summary */}
          <div>
            <Shimmer className="h-4 w-32 mb-1" />
            <Shimmer className="h-3 w-44 mb-2.5" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-2.5 rounded-xl bg-white/5 px-3 py-2.5">
                  <Shimmer className="h-7 w-7 rounded-lg shrink-0" />
                  <div className="space-y-1">
                    <Shimmer className="h-4 w-8" />
                    <Shimmer className="h-2.5 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <div className="rounded-xl border border-border/50 bg-surface p-4 flex flex-col items-center gap-2">
            <Shimmer className="h-10 w-48 rounded-xl" />
            <Shimmer className="h-3 w-64" />
          </div>
        </div>

        {/* Right column - Sidebar */}
        <div className="lg:col-span-5 space-y-4">
          {/* Confidence Panel */}
          <div className="rounded-xl border border-border/50 bg-surface p-4">
            <div className="flex items-center justify-between mb-3">
              <Shimmer className="h-4 w-24" />
              <Shimmer className="h-4 w-4 rounded-full" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <Shimmer className="h-20 w-20 rounded-full" />
              <div className="text-center space-y-1">
                <Shimmer className="h-3.5 w-28 mx-auto" />
                <Shimmer className="h-2.5 w-36 mx-auto" />
              </div>
            </div>
          </div>

          {/* Data Sources */}
          <div className="rounded-xl border border-border/50 bg-surface p-4">
            <Shimmer className="h-4 w-36 mb-2.5" />
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between py-0.5">
                  <div className="flex items-center gap-2">
                    <Shimmer className="h-3.5 w-3.5 rounded-full" />
                    <Shimmer className="h-3 w-24" />
                  </div>
                  <Shimmer className="h-3.5 w-3.5 rounded-full" />
                </div>
              ))}
            </div>
            <Shimmer className="h-3 w-32 mt-2.5" />
          </div>

          {/* Recent Activity */}
          <div className="rounded-xl border border-border/50 bg-surface p-4">
            <Shimmer className="h-4 w-28 mb-2.5" />
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <Shimmer className="h-6 w-6 rounded-md shrink-0" />
                  <div className="flex-1 space-y-1">
                    <Shimmer className="h-3 w-32" />
                    <Shimmer className="h-2.5 w-20" />
                  </div>
                </div>
              ))}
            </div>
            <Shimmer className="h-3 w-24 mt-2.5" />
          </div>

          {/* Quick Actions */}
          <div className="rounded-xl border border-border/50 bg-surface p-4">
            <Shimmer className="h-4 w-24 mb-2.5" />
            <div className="grid grid-cols-2 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col items-center gap-1 rounded-lg border border-border/30 bg-white/5 p-2.5">
                  <Shimmer className="h-7 w-7 rounded-lg" />
                  <Shimmer className="h-2.5 w-14" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Insights Page Skeleton ─── */

export function InsightsPageSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading insights" role="status">
      <span className="sr-only">Loading insights...</span>

      {/* AI Highlights Card */}
      <div className="rounded-2xl border border-border/50 bg-surface p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-1.5">
            <Shimmer className="h-4 w-36" />
            <Shimmer className="h-3 w-52" />
          </div>
          <Shimmer className="h-8 w-8 rounded-lg" />
        </div>
        <div className="space-y-4">
          {/* Facts section */}
          <div className="rounded-2xl border border-border/50 bg-surface p-4">
            <Shimmer className="h-4 w-32 mb-3" />
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between rounded-lg px-3 py-2">
                  <Shimmer className="h-3.5 w-32" />
                  <Shimmer className="h-3.5 w-20 rounded-lg" />
                </div>
              ))}
            </div>
          </div>
          {/* Interpretations */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Shimmer className="h-4 w-40" />
              <Shimmer className="h-5 w-6 rounded-full" />
            </div>
            {[1, 2].map((i) => (
              <div key={i} className="rounded-2xl border border-border/50 bg-surface p-4">
                <div className="flex items-center justify-between mb-2">
                  <Shimmer className="h-4 w-48" />
                  <Shimmer className="h-5 w-12 rounded-full" />
                </div>
                <div className="space-y-1.5">
                  <Shimmer className="h-3.5 w-full" />
                  <Shimmer className="h-3.5 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Conversation Panel */}
      <div className="rounded-2xl border border-border/50 bg-surface p-5">
        <Shimmer className="h-4 w-40 mb-4" />
        <div className="space-y-3">
          <Shimmer className="h-20 rounded-xl" />
          <Shimmer className="h-10 w-32 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/* ─── Records Page Skeleton ─── */

export function RecordsPageSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading transactions" role="status">
      <span className="sr-only">Loading transactions...</span>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Shimmer className="h-8 w-40 rounded-xl" />
          <Shimmer className="h-4 w-28" />
        </div>
        <div className="flex gap-2">
          <Shimmer className="h-9 w-24 rounded-lg" />
          <Shimmer className="h-9 w-28 rounded-lg" />
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Shimmer className="h-9 flex-1 rounded-lg" />
        <Shimmer className="h-9 w-24 rounded-lg" />
        <Shimmer className="h-9 w-28 rounded-lg" />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border/50 bg-surface">
        <div className="border-b border-border/50 bg-surface-subtle/50 px-4 py-3">
          <div className="flex items-center gap-4">
            <Shimmer className="h-3.5 w-24" />
            <Shimmer className="h-3.5 w-16" />
            <Shimmer className="h-3.5 w-20" />
            <div className="ml-auto">
              <Shimmer className="h-3.5 w-16" />
            </div>
          </div>
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-border/50 px-4 py-3 last:border-0"
          >
            <Shimmer className="h-10 w-10 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Shimmer className="h-3.5 w-2/3" />
              <Shimmer className="h-3 w-1/3" />
            </div>
            <Shimmer className="hidden sm:block h-6 w-20 rounded-full" />
            <Shimmer className="hidden sm:block h-3.5 w-16" />
            <Shimmer className="h-3.5 w-20" />
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <Shimmer className="h-3.5 w-32" />
        <div className="flex gap-1">
          {[1, 2, 3].map((i) => (
            <Shimmer key={i} className="h-8 w-8 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Budgets Page Skeleton ─── */

export function BudgetsPageSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading budgets" role="status">
      <span className="sr-only">Loading budgets...</span>

      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Shimmer className="h-8 w-32 rounded-xl" />
          <Shimmer className="h-4 w-48" />
        </div>
        <Shimmer className="h-9 w-28 rounded-lg" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-2xl border border-border/50 bg-surface p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="space-y-1.5">
                <Shimmer className="h-4 w-28" />
                <Shimmer className="h-3 w-20" />
              </div>
              <Shimmer className="h-6 w-16 rounded-full" />
            </div>
            <Shimmer className="h-3 w-full rounded-full mb-2" />
            <div className="flex justify-between">
              <Shimmer className="h-3 w-20" />
              <Shimmer className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Goals Page Skeleton ─── */

export function GoalsPageSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading savings goals" role="status">
      <span className="sr-only">Loading savings goals...</span>

      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Shimmer className="h-8 w-40 rounded-xl" />
          <Shimmer className="h-4 w-56" />
        </div>
        <Shimmer className="h-9 w-32 rounded-lg" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-border/50 bg-surface p-4">
            <div className="flex items-center gap-2.5">
              <Shimmer className="h-8 w-8 rounded-lg shrink-0" />
              <div className="space-y-1.5">
                <Shimmer className="h-2.5 w-16" />
                <Shimmer className="h-5 w-20 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Goal cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-border/50 bg-surface p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="space-y-1.5">
                <Shimmer className="h-4 w-28" />
                <Shimmer className="h-3 w-20" />
              </div>
              <Shimmer className="h-6 w-16 rounded-full" />
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <Shimmer className="h-3 w-16" />
                <Shimmer className="h-3 w-20" />
              </div>
              <Shimmer className="h-2 w-full rounded-full" />
            </div>
            <div className="flex gap-2">
              <Shimmer className="h-8 flex-1 rounded-lg" />
              <Shimmer className="h-8 w-8 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
