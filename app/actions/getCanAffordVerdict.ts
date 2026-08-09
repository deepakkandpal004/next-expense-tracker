'use server';

import { getAuthUser } from '@/lib/auth';
import { generateCanAffordVerdict } from '@/lib/ai';
import {
  buildCanAffordProviderPayload,
  getCanAffordDisclosure,
} from '@/lib/domain/ai';
import type { CanAffordBreakdown } from '@/lib/domain/can-i-afford';
import type { ActionResult } from '@/lib/domain/types';

export interface CanAffordVerdictResult {
  verdict: string | null;
  purpose: string;
  fields: readonly string[];
}

/**
 * User-triggered AI narration of the already-computed affordability impact.
 * The provider receives only the disclosed summary (see lib/domain/ai.ts) and
 * its output is presented as a secondary, non-authoritative layer that never
 * changes the numbers shown by the deterministic action.
 */
export async function getCanAffordVerdict(
  breakdown: CanAffordBreakdown,
): Promise<ActionResult<CanAffordVerdictResult, never>> {
  const user = await getAuthUser();
  if (!user) {
    return { status: 'error', message: 'Sign in to continue.', retryable: false };
  }

  const disclosure = getCanAffordDisclosure();

  try {
    const payload = buildCanAffordProviderPayload(breakdown);
    const text = await generateCanAffordVerdict(payload);
    if (!text) {
      return {
        status: 'success',
        data: {
          verdict: '',
          purpose: disclosure.purpose,
          fields: disclosure.fields,
        },
        message: 'Affordability was calculated; AI narration is unavailable.',
      };
    }
    return {
      status: 'success',
      data: { verdict: text, purpose: disclosure.purpose, fields: disclosure.fields },
      message: 'Verdict generated.',
    };
  } catch (error) {
    console.error('Can I afford verdict failed', error);
    return {
      status: 'error',
      message: 'Could not generate a verdict.',
      retryable: true,
    };
  }
}