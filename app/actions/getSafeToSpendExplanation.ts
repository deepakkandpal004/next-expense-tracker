'use server';

import { getAuthUser } from '@/lib/auth';
import { generateSafeToSpendExplanation } from '@/lib/ai';
import {
  buildSafeToSpendProviderPayload,
  getSafeToSpendDisclosure,
} from '@/lib/domain/ai';
import type { SafeToSpendBreakdown } from '@/lib/domain/safe-to-spend';
import type { ActionResult } from '@/lib/domain/types';

export interface SafeToSpendExplanationResult {
  explanation: string | null;
  purpose: string;
  fields: readonly string[];
}

/**
 * User-triggered AI narration of the already-computed Safe-to-Spend figure.
 * The provider receives only the disclosed summary (see lib/domain/ai.ts) and
 * its output is presented as a secondary, non-authoritative layer.
 */
export async function getSafeToSpendExplanation(
  breakdown: SafeToSpendBreakdown,
): Promise<ActionResult<SafeToSpendExplanationResult, never>> {
  const user = await getAuthUser();
  if (!user) {
    return { status: 'error', message: 'Sign in to continue.', retryable: false };
  }

  const disclosure = getSafeToSpendDisclosure();
  if (breakdown.isDeficit) {
    return {
      status: 'success',
      data: {
        explanation: '',
        purpose: disclosure.purpose,
        fields: disclosure.fields,
      },
      message: 'No explanation available for a negative Safe to spend.',
    };
  }

  try {
    const payload = buildSafeToSpendProviderPayload(breakdown);
    const text = await generateSafeToSpendExplanation(payload);
    if (!text) {
      return {
        status: 'success',
        data: {
          explanation: '',
          purpose: disclosure.purpose,
          fields: disclosure.fields,
        },
        message: 'Safe to spend was calculated; AI narration is unavailable.',
      };
    }
    return {
      status: 'success',
      data: { explanation: text, purpose: disclosure.purpose, fields: disclosure.fields },
      message: 'Explanation generated.',
    };
  } catch (error) {
    console.error('Safe to spend explanation failed', error);
    return {
      status: 'error',
      message: 'Could not generate an explanation.',
      retryable: true,
    };
  }
}