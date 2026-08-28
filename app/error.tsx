'use client';

import { RouteErrorBoundary } from '@/src/common/ui/feedback/RouteBoundaries';

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteErrorBoundary destination={{ href: '/', label: 'Return home' }} reset={reset} />;
}
