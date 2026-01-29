export interface Expense {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  description: string;
  date: string;
  payment_method: string;
  receipt_url?: string;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  type: 'expense' | 'income';
  is_default: boolean;
  created_at: string;
}

export interface ExpenseFormData {
  category_id: string;
  amount: number;
  description: string;
  date: string;
  payment_method: string;
}

export interface ExpenseFilters {
  startDate?: string;
  endDate?: string;
  category_id?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
}
