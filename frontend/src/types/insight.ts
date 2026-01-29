export interface SpendingSummary {
  total_spent: number;
  total_income: number;
  net_balance: number;
  top_categories: CategorySpending[];
  comparison: {
    previous_period: number;
    change_percentage: number;
    trend: 'up' | 'down' | 'stable';
  };
}

export interface CategorySpending {
  category_id: string;
  category_name: string;
  category_color: string;
  amount: number;
  percentage: number;
  transaction_count: number;
}

export interface AIInsight {
  id: string;
  type: 'tip' | 'warning' | 'achievement' | 'prediction';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface SpendingPrediction {
  period: string;
  predicted_amount: number;
  confidence: number;
  breakdown: {
    category_id: string;
    category_name: string;
    predicted_amount: number;
  }[];
}
