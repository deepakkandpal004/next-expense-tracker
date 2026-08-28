import { RouteNotFoundBoundary } from '@/src/common/ui/feedback/RouteBoundaries';

export default function NotFound() {
  return <RouteNotFoundBoundary destination={{ href: '/', label: 'Return home' }} />;
}
