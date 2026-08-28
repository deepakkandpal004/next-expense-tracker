import { DashboardSkeleton } from '@/src/common/ui/skeletons';

export default function DashboardLoading() {
  return (
    <section aria-label="Loading dashboard" className="py-4">
      <DashboardSkeleton />
    </section>
  );
}
