import type { Metadata } from 'next';
import { AboutPageContent } from '@/components/patterns/public-pages';

export const metadata: Metadata = { title: 'About | Expense AI', description: 'Learn about Expense AI and its approach to recorded financial information.' };

export default function AboutPage() {
  return <AboutPageContent />;
}
