import { BudgetsPageSkeleton } from '@/src/common/ui/skeletons';

export default function BudgetsLoading() {
  return (
    <section aria-label="Loading budgets" className="py-4">
      <BudgetsPageSkeleton />
    </section>
  );
}
