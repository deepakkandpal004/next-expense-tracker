export function TransactionSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-2xl border border-border/50 bg-surface p-4"
        >
          <div className="h-10 w-10 animate-shimmer rounded-xl bg-surface-subtle" />
          <div className="flex-1 space-y-2.5">
            <div className="h-3.5 w-3/4 animate-shimmer rounded-lg bg-surface-subtle" />
            <div className="h-3 w-1/2 animate-shimmer rounded-lg bg-surface-subtle" />
          </div>
          <div className="h-3.5 w-20 animate-shimmer rounded-lg bg-surface-subtle" />
        </div>
      ))}
    </div>
  );
}

export function TransactionTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/50 bg-surface">
      <div className="border-b border-border/50 bg-surface-subtle/50 px-4 py-3">
        <div className="flex items-center gap-4">
          <div className="h-3.5 w-24 animate-shimmer rounded-lg bg-surface-subtle" />
          <div className="h-3.5 w-16 animate-shimmer rounded-lg bg-surface-subtle" />
          <div className="h-3.5 w-20 animate-shimmer rounded-lg bg-surface-subtle" />
          <div className="ml-auto h-3.5 w-16 animate-shimmer rounded-lg bg-surface-subtle" />
        </div>
      </div>
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 border-b border-border/50 px-4 py-3 last:border-0"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <div className="h-10 w-10 animate-shimmer rounded-xl bg-surface-subtle" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-2/3 animate-shimmer rounded-lg bg-surface-subtle" />
            <div className="h-3 w-1/3 animate-shimmer rounded-lg bg-surface-subtle" />
          </div>
          <div className="hidden h-6 w-20 animate-shimmer rounded-full bg-surface-subtle sm:block" />
          <div className="hidden h-3.5 w-16 animate-shimmer rounded-lg bg-surface-subtle sm:block" />
          <div className="h-3.5 w-20 animate-shimmer rounded-lg bg-surface-subtle" />
        </div>
      ))}
    </div>
  );
}