export interface GoalPlanPanelProps {
  goal: {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    monthlyContribution: number;
    deadline: string | null;
  };
  currency: string;
}
