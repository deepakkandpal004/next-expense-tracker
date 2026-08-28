import { RouteNotFoundBoundary } from '@/src/common/ui/feedback/RouteBoundaries';

export default function SignedInNotFound() {
  return <RouteNotFoundBoundary destination={{ href: '/dashboard', label: 'View dashboard' }} />;
}
