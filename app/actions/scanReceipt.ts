'use server';

import { getAuthUser } from '@/lib/auth';
import { executeAiProviderRequest } from '@/lib/ai';
import type { ActionResult } from '@/lib/domain/types';

export interface ScannedReceipt {
  items: Array<{
    description: string;
    amount: number;
    category: string;
  }>;
  total: number;
  merchant: string;
  date: string;
  category: string;
}

export async function scanReceipt(
  formData: FormData,
): Promise<ActionResult<{ receipt: ScannedReceipt }, never>> {
  const user = await getAuthUser();
  if (!user) return { status: 'error', message: 'Sign in to continue.', retryable: false };

  const file = formData.get('receipt');
  if (!(file instanceof File)) {
    return { status: 'error', message: 'Please upload a receipt image.', retryable: false };
  }

  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    return { status: 'error', message: 'Please upload an image (JPEG, PNG, WebP, or GIF).', retryable: false };
  }

  if (file.size > 10 * 1024 * 1024) {
    return { status: 'error', message: 'Image must be under 10MB.', retryable: false };
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const dataUri = `data:${file.type};base64,${base64}`;

    const content = await executeAiProviderRequest(async (signal) => {
      const { default: OpenAI } = await import('openai');
      const openai = new OpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY || 'provider-not-configured',
        dangerouslyAllowBrowser: false,
      });
      const response = await openai.chat.completions.create({
        model: 'openai/gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You analyze receipt images and return structured JSON. Respond ONLY with valid JSON in this exact format:
{
  "merchant": "Store name",
  "date": "YYYY-MM-DD",
  "total": 0.00,
  "category": "Food|Transportation|Shopping|Entertainment|Bills|Healthcare|Other",
  "items": [
    { "description": "item name", "amount": 0.00, "category": "Food|Transportation|Shopping|Entertainment|Bills|Healthcare|Other" }
  ]
}

Choose the single best category for the overall purchase. For individual items, pick the most appropriate category. If uncertain, use "Other".`,
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Extract the transaction details from this receipt image.' },
              { type: 'image_url', image_url: { url: dataUri, detail: 'high' } },
            ],
          },
        ],
        temperature: 0.1,
        max_tokens: 1000,
      }, { signal });
      return response.choices[0]?.message?.content ?? null;
    });

    if (!content) {
      return { status: 'error', message: 'AI could not analyze the receipt. Please try again.', retryable: true };
    }

    const cleaned = content.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '').trim();
    const parsed: ScannedReceipt = JSON.parse(cleaned);

    if (!parsed.merchant || !parsed.total || isNaN(parsed.total)) {
      return { status: 'error', message: 'Could not read the receipt clearly. Try a clearer image.', retryable: false };
    }

    return {
      status: 'success',
      data: { receipt: parsed },
      message: `Receipt scanned: ${parsed.merchant} — ${parsed.total.toFixed(2)}`,
    };
  } catch (error) {
    console.error('Receipt scan failed', error);
    return { status: 'error', message: 'Could not process the receipt image.', retryable: true };
  }
}
