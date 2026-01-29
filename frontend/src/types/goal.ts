export type GoalStatus = 'active' | 'completed' | 'cancelled';

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  icon: string;
  color: string;
  status: GoalStatus;
  created_at: string;
  updated_at: string;
}

export interface GoalFormData {
  name: string;
  target_amount: number;
  deadline: string;
  icon: string;
  color: string;
}

export interface GoalContribution {
  id: string;
  goal_id: string;
  amount: number;
  note?: string;
  created_at: string;
}
