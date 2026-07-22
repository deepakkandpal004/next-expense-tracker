import { GoalsPageSkeleton } from '@/components/ui/skeletons';

export default function GoalsLoading() {
  return (
    <section aria-label="Loading savings goals" className="py-4">
      <GoalsPageSkeleton />
    </section>
  );
}
