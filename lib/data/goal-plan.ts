import { db } from "../db";
import { computeGoalPlan, type ContributionCandidate, type GoalPlan } from "../domain/goal-plan";
import { appPeriodHref, normalizeReportingPeriod } from "../domain/reporting-period";
import type { ReportingPeriod } from "../domain/types";
import { getMoneyLeakReport } from "./money-leaks";

/**
 * Assembler for the goal-plan optimizer.
 *
 * Loads the saved goal plus two app-computed funding pools — the money-leak
 * scan (category reductions) and unused recurring expense plans (cancelable
 * subscriptions) — then feeds them to the pure engine. Only this module talks
 * to the database; the engine stays deterministic and testable.
 */

export const GOAL_PLAN_UNUSED_PLAN_WINDOW_DAYS = 90;

/** Monthly-equivalent multiple per frequency (money saved per month when canceled). */
const MONTHLY_FACTOR: Record<string, number> = {
  daily: 30,
  weekly: 30 / 7,
  monthly: 1,
  yearly: 1 / 12,
};

function cadenceFactor(frequency: string, interval: number): number {
  const base = MONTHLY_FACTOR[frequency] ?? 1;
  return base / Math.max(1, interval);
}

function makeCategoryCandidates(
  goalId: string,
  report: { leaks: readonly { categoryId: string; label: string; potentialSavingsMinor: number }[] },
  period: ReportingPeriod,
): ContributionCandidate[] {
  const base = appPeriodHref("records", period) ?? "/records";
  const separator = base.includes("?") ? "&" : "?";
  return report.leaks.map((leak) => ({
    id: `${goalId}:cat:${leak.categoryId}`,
    kind: "category-cut" as const,
    label: `Reduce ${leak.label}`,
    detail: "Spending above your usual this month",
    amountMinor: leak.potentialSavingsMinor,
    href: `${base}${separator}category=${encodeURIComponent(leak.categoryId)}`,
  }));
}

function planCandidate(
  goalId: string,
  plan: { id: string; text: string; amount: number; frequency: string; interval: number },
): ContributionCandidate {
  return {
    id: `${goalId}:plan:${plan.id}`,
    kind: "subscription-cancel" as const,
    label: `Cancel ${plan.text}`,
    detail: "Recurring plan with no recent usage",
    amountMinor: Math.round(plan.amount * 100 * cadenceFactor(plan.frequency, plan.interval)),
    href: "/recurring",
  };
}

export async function getGoalPlan(
  userId: string,
  currency: string,
  goalId: string,
): Promise<{ status: "not-found" } | { status: "ok"; plan: GoalPlan }> {
  const goal = await db.goal.findFirst({ where: { id: goalId, userId } });
  if (!goal) return { status: "not-found" };

  const now = new Date();
  const normalized = normalizeReportingPeriod({ kind: "current-month" }, now);
  if (!normalized.valid) throw new Error("current-month period failed to resolve.");
  const period = normalized.period;
  const report = await getMoneyLeakReport(userId, period);

  // Active expense plans that haven't recorded a transaction in the recent
  // window are treated as cancelable "unused" subscriptions.
  const planIds = await db.recurringRecord.findMany({
    where: { userId, active: true, type: "expense" },
  });

  const recentById = new Set<string>();
  if (planIds.length > 0) {
    const cutoff = new Date(now.getTime() - GOAL_PLAN_UNUSED_PLAN_WINDOW_DAYS * 86_400_000);
    const recentTransactions = await db.record.findMany({
      where: { userId, recurringId: { in: planIds.map((p) => p.id) }, date: { gte: cutoff } },
      select: { recurringId: true },
    });
    for (const txn of recentTransactions) recentById.add(txn.recurringId ?? "");
  }
  const unusedPlans = planIds.filter((p) => !recentById.has(p.id));

  const candidates: ContributionCandidate[] = [
    ...makeCategoryCandidates(goal.id, report, period),
    ...unusedPlans.map((p) => planCandidate(goal.id, p)),
  ];

  const plan = computeGoalPlan({
    goalId: goal.id,
    goalName: goal.name,
    currency,
    targetMinor: Math.round(goal.targetAmount * 100),
    currentMinor: Math.round(goal.currentAmount * 100),
    monthlyContributionMinor: Math.round(goal.monthlyContribution * 100),
    deadline: goal.deadline ? goal.deadline.toISOString().slice(0, 10) : null,
    candidates,
  });

  return { status: "ok", plan };
}