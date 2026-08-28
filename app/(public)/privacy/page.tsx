import type { Metadata } from 'next';
import { PrivacyPageContent } from '@/src/common/ui/patterns/public-pages/privacy-page';

export const metadata: Metadata = { title: 'Privacy | Expense Tracker AI', description: 'Privacy information for Expense Tracker AI.' };

export default function PrivacyPage() {
  return <PrivacyPageContent />;
}
