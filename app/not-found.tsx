import { RouteNotFoundBoundary } from '@/components/feedback/RouteBoundaries';

export default function NotFound() {
  return <RouteNotFoundBoundary destination={{ href: '/', label: 'Return home' }} />;
}
