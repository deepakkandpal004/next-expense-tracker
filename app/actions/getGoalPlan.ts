'use server';

import { getAuthUser } from '@/lib/auth';
import { getGoalPlan } from '@/lib/data/goal-plan';
import type { GoalPlan } from '@/lib/domain/goal-plan';
import type { ActionResult } from '@/lib/domain/types';

/**
 * Deterministic goal-plan optimizer for a single savings goal. The math and the
 * funding levers are app-computed (never AI); a narration layer can be added on
 * top by the user later (DESIGN rule 3).
 */
export async function getGoalPlanAction(
  goalId: string,
): Promise<ActionResult<GoalPlan, never>> {
  const user = await getAuthUser();
  if (!user) {
    return { status: 'error', message: 'Sign in to continue.', retryable: false };
  }

  try {
    const result = await getGoalPlan(user.id, user.currency, goalId);
    if (result.status === 'not-found') {
      return { status: 'error', message: 'Goal not found.', retryable: false };
    }
    return { status: 'success', data: result.plan, message: 'Goal plan ready.' };
  } catch (error) {
    console.error('Goal plan failed', error);
    return { status: 'error', message: 'Could not build the goal plan.', retryable: true };
  }
}