'use client';

import { RouteErrorBoundary } from '@/components/feedback/RouteBoundaries';

export default function SignedInError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteErrorBoundary destination={{ href: '/dashboard', label: 'View dashboard' }} reset={reset} />;
}
