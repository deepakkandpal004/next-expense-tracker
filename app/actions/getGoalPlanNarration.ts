'use server';

import { getAuthUser } from '@/lib/auth';
import { getGoalPlan } from '@/lib/data/goal-plan';
import { generateGoalPlanNarration } from '@/lib/ai';
import {
  buildGoalPlanProviderPayload,
  getGoalPlanDisclosure,
} from '@/lib/domain/ai';
import type { ActionResult } from '@/lib/domain/types';

export interface GoalPlanNarrationResult {
  explanation: string | null;
  purpose: string;
  fields: readonly string[];
}

/**
 * User-triggered AI narration of the already-computed goal plan. The provider
 * receives only the disclosed numeric summary computed server-side from the
 * user's own goal and transaction data; raw descriptions and merchant names
 * are excluded (see lib/domain/ai.ts).
 */
export async function getGoalPlanNarration(
  goalId: string,
): Promise<ActionResult<GoalPlanNarrationResult, never>> {
  const user = await getAuthUser();
  if (!user) {
    return { status: 'error', message: 'Sign in to continue.', retryable: false };
  }

  const disclosure = getGoalPlanDisclosure();

  try {
    const result = await getGoalPlan(user.id, user.currency, goalId);
    if (result.status === 'not-found') {
      return {
        status: 'success',
        data: { explanation: '', purpose: disclosure.purpose, fields: disclosure.fields },
        message: 'Goal not found.',
      };
    }

    const payload = buildGoalPlanProviderPayload(result.plan);
    const text = await generateGoalPlanNarration(payload);
    return {
      status: 'success',
      data: {
        explanation: text,
        purpose: disclosure.purpose,
        fields: disclosure.fields,
      },
      message: text ? 'Goal plan narrated.' : 'Goal plan is ready; narration unavailable.',
    };
  } catch (error) {
    console.error('Goal plan narration failed', error);
    return {
      status: 'error',
      message: 'Could not generate the narration.',
      retryable: true,
    };
  }
}