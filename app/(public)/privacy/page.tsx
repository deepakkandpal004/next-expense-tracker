import type { Metadata } from 'next';
import { PrivacyPageContent } from '@/components/patterns/public-pages';

export const metadata: Metadata = { title: 'Privacy | Expense AI', description: 'Privacy information for Expense AI.' };

export default function PrivacyPage() {
  return <PrivacyPageContent />;
}
