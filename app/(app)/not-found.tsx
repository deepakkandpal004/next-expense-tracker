import { RouteNotFoundBoundary } from '@/components/feedback/RouteBoundaries';

export default function SignedInNotFound() {
  return <RouteNotFoundBoundary destination={{ href: '/dashboard', label: 'View dashboard' }} />;
}
