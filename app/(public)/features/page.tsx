import type { Metadata } from 'next';
import { FeaturesPageContent } from '@/src/common/ui/patterns/public-pages/features-page';

export const metadata: Metadata = { title: 'Features | Expense Tracker AI', description: 'Expense Tracker AI capabilities for recording and reviewing financial information.' };

export default function FeaturesPage() {
  return <FeaturesPageContent />;
}
