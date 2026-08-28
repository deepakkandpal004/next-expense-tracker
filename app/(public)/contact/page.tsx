import type { Metadata } from 'next';
import { ContactPageContent } from '@/src/common/ui/patterns/public-pages/contact-page';

export const metadata: Metadata = { title: 'Contact | Expense Tracker AI', description: 'Contact Expense Tracker AI support.' };

export default function ContactPage() {
  return <ContactPageContent />;
}
