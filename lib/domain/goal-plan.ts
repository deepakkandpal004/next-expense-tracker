import type { ISODateTime } from "./types";

/**
 * Deterministic "goal plan" engine.
 *
 * Turns a savings goal plus deadline into an optimizer: it computes the
 * monthly contribution required to finish on time, the monthly gap versus what
 * the user already puts in, and which app-computed "funding levers" (category
 * reductions from the money-leak scan + cancelable recurring plans) cover that
 * gap. Every figure derives from the user's own data and resolves to a real
 * screen (DESIGN.md rule 1). No AI in this file — the narrator is an optional
 * layer that reads these numbers later.
 */

export const GOAL_PLAN_MAX_CANDIDATES = 5;

const AVG_MONTH_DAYS = 30.4375; // 365.25 / 12
const DAY_MS = 86_400_000;

export type GoalPlanLeverKind = "category-cut" | "subscription-cancel";

export interface ContributionCandidate {
  id: string;
  kind: GoalPlanLeverKind;
  label: string;
  /** Monthly-equivalent amount this lever frees, minor units. */
  amountMinor: number;
  /** Short human explanation shown under the label. */
  detail?: string;
  /** Deep-link to the source (records filtered by category, or /recurring). */
  href: string;
}

export type GoalPlanStatus =
  | "completed"
  | "no-deadline"
  | "on-track"
  | "off-track"
  | "overdue";

export interface GoalPlanPace {
  /** Whole months until the deadline; null when no deadline. */
  monthsRemaining: number | null;
  /** Monthly amount needed to finish by the deadline; null when no deadline. */
  requiredMonthlyMinor: number | null;
  /** requiredMonthlyMinor - monthlyContribution; null when no deadline. */
  contributionGapMinor: number | null;
}

export interface GoalPlanInput {
  goalId: string;
  goalName: string;
  currency: string;
  /** Target amount in minor units. */
  targetMinor: number;
  /** Saved-so-far amount in minor units. */
  currentMinor: number;
  /** Planned monthly contribution in minor units. */
  monthlyContributionMinor: number;
  /** ISO deadline string (e.g. "2026-12-15"), or null. */
  deadline: string | null;
  /** Possible funding levers from the money-leak scan + recurring plans. */
  candidates?: readonly ContributionCandidate[];
  /** Anchor used for "today" so the math is testable. Defaults to now. */
  asOf?: Date;
}

export interface GoalPlan {
  goalId: string;
  goalName: string;
  currency: string;
  status: GoalPlanStatus;
  targetMinor: number;
  currentMinor: number;
  monthlyContributionMinor: number;
  deadline: ISODateTime | null;
  monthsRemaining: number | null;
  requiredMonthlyMinor: number | null;
  contributionGapMinor: number | null;
  /** Every funding lever found, sorted by size, capped. */
  candidates: readonly ContributionCandidate[];
  /** The smallest greedy subset of `candidates` that reaches the gap. */
  selected: readonly ContributionCandidate[];
  /** Sum of all shown candidate levers in minor units. */
  totalCandidateMinor: number;
  /** Sum of the selected levers in minor units. */
  totalSelectedMinor: number;
  /** Monthly gap left after selected levers; 0 when fully covered. */
  gapRemainingMinor: number;
  isGapCovered: boolean;
}

/** Pure deadline-pace math used by the engine and lightweight UI chips. */
export function computeGoalPace(
  goal: {
    targetMinor: number;
    currentMinor: number;
    monthlyContributionMinor: number;
    deadline: string | null;
  },
  asOf: Date = new Date(),
): GoalPlanPace {
  const remaining = goal.targetMinor - goal.currentMinor;
  if (!goal.deadline || remaining <= 0) {
    return {
      monthsRemaining: goal.deadline ? monthsUntil(goal.deadline, asOf) : null,
      requiredMonthlyMinor: null,
      contributionGapMinor: null,
    };
  }

  const months = monthsUntil(goal.deadline, asOf);
  if (months <= 0) {
    return {
      monthsRemaining: 0,
      requiredMonthlyMinor: remaining,
      contributionGapMinor: Math.max(0, remaining - goal.monthlyContributionMinor),
    };
  }

  const requiredMonthly = Math.ceil(remaining / months);
  const gap = Math.max(0, requiredMonthly - goal.monthlyContributionMinor);
  return { monthsRemaining: months, requiredMonthlyMinor: requiredMonthly, contributionGapMinor: gap };
}

/** Whole months from a given date until the deadline; 0 when already missed. */
function monthsUntil(deadline: string, asOf: Date): number {
  const target = new Date(`${deadline}T00:00:00.000Z`);
  const hoursToDeadline = target.getTime() - asOf.getTime();
  if (hoursToDeadline <= 0) return 0;
  return Math.ceil(hoursToDeadline / (AVG_MONTH_DAYS * DAY_MS));
}

export function computeGoalPlan(input: GoalPlanInput): GoalPlan {
  const targetMinor = Math.round(input.targetMinor);
  const currentMinor = Math.round(input.currentMinor);
  const contribution = Math.round(input.monthlyContributionMinor);

  // Completed goals stop planning; everything downstream assumes work remains.
  if (targetMinor > 0 && currentMinor >= targetMinor) {
    return emptyPlan(input, "completed", contribution, null, null);
  }

  // Without a deadline we cannot derive a required pace.
  if (!input.deadline) {
    return emptyPlan(input, "no-deadline", contribution, null, null);
  }

  const pace = computeGoalPace(
    { targetMinor, currentMinor, monthlyContributionMinor: contribution, deadline: input.deadline },
    input.asOf ?? new Date(),
  );

  // Missed deadline: report the lump-sum shortfall instead of pretending nothing changed.
  if (pace.monthsRemaining === 0) {
    return emptyPlan(input, "overdue", contribution, pace.requiredMonthlyMinor, pace.contributionGapMinor);
  }

  // Already contributing at least the required monthly amount.
  if (pace.monthsRemaining !== null && (pace.contributionGapMinor ?? 0) <= 0) {
    return emptyPlan(input, "on-track", contribution, pace.requiredMonthlyMinor, 0);
  }

  return buildOffTrackPlan(input, pace, contribution);
}

/** Completed / no-deadline / overdue / on-track results have no levers to offer. */
function emptyPlan(
  input: GoalPlanInput,
  status: GoalPlanStatus,
  contribution: number,
  requiredMonthlyMinor: number | null,
  contributionGapMinor: number | null,
): GoalPlan {
  return {
    goalId: input.goalId,
    goalName: input.goalName,
    currency: input.currency,
    status,
    targetMinor: Math.round(input.targetMinor),
    currentMinor: Math.round(input.currentMinor),
    monthlyContributionMinor: contribution,
    deadline: input.deadline ?? null,
    monthsRemaining: null,
    requiredMonthlyMinor,
    contributionGapMinor,
    candidates: [],
    selected: [],
    totalCandidateMinor: 0,
    totalSelectedMinor: 0,
    gapRemainingMinor: contributionGapMinor ?? 0,
    isGapCovered: (contributionGapMinor ?? 0) <= 0,
  };
}

function buildOffTrackPlan(
  input: GoalPlanInput,
  pace: GoalPlanPace,
  contribution: number,
): GoalPlan {
  const gap = pace.contributionGapMinor ?? Math.max(0, pace.requiredMonthlyMinor! - contribution);
  const ordered = [...(input.candidates ?? [])].sort((a, b) => b.amountMinor - a.amountMinor);
  const candidates = ordered.slice(0, GOAL_PLAN_MAX_CANDIDATES);
  const totalCandidateMinor = candidates.reduce((sum, cand) => sum + cand.amountMinor, 0);

  // Greedy selection: add levers from largest to smallest until the gap is covered.
  const selected: ContributionCandidate[] = [];
  let running = 0;
  for (const cand of candidates) {
    if (running >= gap) break;
    selected.push(cand);
    running += cand.amountMinor;
  }

  const totalSelectedMinor = selected.reduce((sum, cand) => sum + cand.amountMinor, 0);

  return {
    goalId: input.goalId,
    goalName: input.goalName,
    currency: input.currency,
    status: "off-track",
    targetMinor: Math.round(input.targetMinor),
    currentMinor: Math.round(input.currentMinor),
    monthlyContributionMinor: contribution,
    deadline: input.deadline ?? null,
    monthsRemaining: pace.monthsRemaining,
    requiredMonthlyMinor: pace.requiredMonthlyMinor,
    contributionGapMinor: gap,
    candidates,
    selected,
    totalCandidateMinor,
    totalSelectedMinor,
    gapRemainingMinor: Math.max(0, gap - totalSelectedMinor),
    isGapCovered: totalSelectedMinor >= gap,
  };
}