export interface Milestone {
  id: string;
  label: string;
  amount: number;
  completed: boolean;
  completedAt?: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  gradient: string;
  targetAmount: number;
  currentAmount: number;
  monthlyContribution: number;
  startDate: string;
  deadline: string | null;
  milestones: Milestone[];
  category: "travel" | "vehicle" | "safety" | "property" | "education" | "other";
}

export interface GoalStats {
  totalSaved: number;
  totalTarget: number;
  monthlyRate: number;
  averageProgress: number;
  goalsOnTrack: number;
  goalsCompleted: number;
}

export interface DbGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  monthlyContribution: number;
  category: string;
  deadline: string | null;
  createdAt: string;
}
