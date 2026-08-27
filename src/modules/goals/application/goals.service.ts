'use server';

import { getAuthUser } from "@/src/modules/auth";
import { getGoalPlan } from "@/src/modules/goals/infrastructure/goals.repository";
import { generateGoalPlanNarration } from "@/src/integrations/openai";
import { buildGoalPlanProviderPayload, getGoalPlanDisclosure } from "@/lib/domain/ai";
import type { ActionResult } from "@/lib/domain/types";
import type { GoalPlan } from "@/lib/domain/goal-plan";

export async function getGoalPlanAction(goalId: string): Promise<ActionResult<GoalPlan, never>> {
  const user = await getAuthUser();
  if (!user) return { status: "error", message: "Sign in to continue.", retryable: false };
  const result = await getGoalPlan(user.id, user.currency, goalId);
  if (result.status === "not-found") return { status: "error", message: "Goal not found.", retryable: false };
  return { status: "success", data: result.plan, message: "Goal plan ready." };
}

export async function getGoalPlanNarrationAction(goalId: string) {
  const user = await getAuthUser();
  if (!user) return { status: "error" as const, message: "Sign in to continue.", retryable: false as const };
  const result = await getGoalPlan(user.id, user.currency, goalId);
  if (result.status === "not-found") return { status: "error" as const, message: "Goal not found.", retryable: false as const };
  const disclosure = getGoalPlanDisclosure();
  const payload = buildGoalPlanProviderPayload(result.plan as never);
  const text = await generateGoalPlanNarration(payload as never);
  return { status: "success" as const, data: { narration: text, disclosure, plan: result.plan }, message: "Narration ready." };
}
