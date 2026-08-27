/**
 * Goals repository — Prisma gateway.
 * Was lib/data/goal-plan.ts inline queries; now isolated.
 */
export { getGoalPlan, GOAL_PLAN_UNUSED_PLAN_WINDOW_DAYS } from "@/lib/data/goal-plan";
import { db } from "@/src/database/client";

export async function findGoalsByUser(userId: string) {
  return db.goal.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
}

export async function findGoalById(userId: string, goalId: string) {
  return db.goal.findFirst({ where: { id: goalId, userId } });
}

export async function createGoal(data: { userId: string; name: string; targetAmount: number; currentAmount?: number; monthlyContribution?: number; category?: string; deadline?: Date | null }) {
  return db.goal.create({ data });
}

export async function updateGoal(goalId: string, userId: string, data: Partial<{ name: string; targetAmount: number; currentAmount: number; monthlyContribution: number; deadline: Date | null }>) {
  return db.goal.update({ where: { id: goalId }, data: { ...data } });
}

export async function deleteGoal(goalId: string, userId: string) {
  const found = await db.goal.findFirst({ where: { id: goalId, userId } });
  if (!found) return null;
  return db.goal.delete({ where: { id: goalId } });
}
