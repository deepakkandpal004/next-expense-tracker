import type { Metadata } from 'next';
import { ContactPageContent } from '@/components/patterns/public-pages';

export const metadata: Metadata = { title: 'Contact | Expense AI', description: 'Contact Expense AI support.' };

export default function ContactPage() {
  return <ContactPageContent />;
}
