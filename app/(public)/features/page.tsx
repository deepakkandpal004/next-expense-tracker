import type { Metadata } from 'next';
import { FeaturesPageContent } from '@/components/patterns/public-pages';

export const metadata: Metadata = { title: 'Features | Expense Tracker AI', description: 'Expense Tracker AI capabilities for recording and reviewing financial information.' };

export default function FeaturesPage() {
  return <FeaturesPageContent />;
}
