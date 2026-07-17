import type { Metadata } from 'next';
import { AiTransparencyPageContent } from '@/components/patterns/public-pages';

export const metadata: Metadata = { title: 'AI transparency | Expense AI', description: 'Disclosure about optional AI assistance in Expense AI.' };

export default function AiTransparencyPage() {
  return <AiTransparencyPageContent />;
}
