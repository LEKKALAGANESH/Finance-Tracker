export type BudgetPeriod = 'weekly' | 'monthly' | 'yearly';

export interface Budget {
  id: string;
  user_id: string;
  category_id: string | null;
  amount: number;
  period: BudgetPeriod;
  start_date: string;
  alert_threshold: number;
  created_at: string;
  updated_at: string;
  category?: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
}

export interface BudgetFormData {
  category_id: string | null;
  amount: number;
  period: BudgetPeriod;
  start_date: string;
  alert_threshold: number;
}

export interface BudgetStatus {
  budget: Budget;
  spent: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
  isNearLimit: boolean;
}
