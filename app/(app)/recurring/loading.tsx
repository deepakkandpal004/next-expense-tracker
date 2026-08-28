import { Skeleton } from '@/src/common/ui/skeleton';

export default function RecurringLoading() {
  return (
    <section aria-label="Loading recurring transactions" className="space-y-4 py-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-9 w-24" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    </section>
  );
}
