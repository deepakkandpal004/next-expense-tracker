import { Skeleton } from '@/src/common/ui/skeleton';

export default function CategoriesLoading() {
  return (
    <section aria-label="Loading categories" className="space-y-4 py-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-9 w-24" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    </section>
  );
}
