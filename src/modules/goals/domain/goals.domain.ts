/**
 * Goals domain — pure optimizer.
 * Re-exports lib/domain/goal-plan for modular boundary.
 */
export {
  computeGoalPlan,
  type GoalPlan,
  type GoalPlanInput,
  type ContributionCandidate,
  type GoalPlanLeverKind,
} from "@/lib/domain/goal-plan";
