import { Skeleton } from '@/src/common/ui/skeleton';

export default function ReportsLoading() {
  return (
    <section aria-label="Loading reports" className="space-y-4 py-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 w-full rounded-xl" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    </section>
  );
}
