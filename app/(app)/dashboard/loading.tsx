import { DashboardSkeleton } from '@/components/ui/skeletons';

export default function DashboardLoading() {
  return (
    <section aria-label="Loading dashboard" className="py-4">
      <DashboardSkeleton />
    </section>
  );
}
