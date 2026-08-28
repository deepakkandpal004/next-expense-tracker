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
} from "@/src/common/domain/goal-plan";
