import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsLoading() {
  return (
    <section aria-label="Loading settings" className="space-y-4 py-4">
      <Skeleton className="h-8 w-48" />
      <div className="space-y-4">
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
      <Skeleton className="h-9 w-24 mt-4" />
    </section>
  );
}
