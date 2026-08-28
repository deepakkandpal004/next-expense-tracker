import type { Metadata } from 'next';
import { AboutPageContent } from '@/src/common/ui/patterns/public-pages/about-page';

export const metadata: Metadata = { title: 'About | Expense Tracker AI', description: 'Learn about Expense Tracker AI and its approach to recorded financial information.' };

export default function AboutPage() {
  return <AboutPageContent />;
}
