import type { Metadata } from 'next';
import { AiTransparencyPageContent } from '@/src/common/ui/patterns/public-pages/ai-transparency-page';

export const metadata: Metadata = { title: 'AI transparency | Expense Tracker AI', description: 'Disclosure about optional AI assistance in Expense Tracker AI.' };

export default function AiTransparencyPage() {
  return <AiTransparencyPageContent />;
}
