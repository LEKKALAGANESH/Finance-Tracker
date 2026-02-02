import { useState, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useCurrency } from '@/context/CurrencyContext';

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return 'An unknown error occurred';
}

interface Insight {
  summary: string;
  tips: string[];
  warnings: string[];
  categoryBreakdown: {
    name: string;
    amount: number;
    percentage: number;
    color: string;
  }[];
  stats: {
    totalSpent: number;
    avgPerDay: number;
    transactionCount: number;
    topCategory: string;
  };
}

interface UseInsightsReturn {
  insights: Insight | null;
  isLoading: boolean;
  error: string | null;
  generateInsights: () => Promise<void>;
  askQuestion: (question: string) => Promise<string>;
}

export function useInsights(): UseInsightsReturn {
  const { user } = useAuth();
  const { formatCurrency } = useCurrency();
  const [insights, setInsights] = useState<Insight | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateInsights = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseClient();

      // Get current month's data
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split('T')[0];
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        .toISOString()
        .split('T')[0];
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const daysPassed = now.getDate();

      // Fetch expenses
      const { data: expenses } = await supabase
        .from('expenses')
        .select('*, category:categories(name, color)')
        .eq('user_id', user.id)
        .gte('date', startOfMonth)
        .lte('date', endOfMonth);

      // Fetch budgets
      const { data: budgets } = await supabase
        .from('budgets')
        .select('*, category:categories(name)')
        .eq('user_id', user.id);

      // Define types
      type ExpenseData = { amount: number; category_id: string; category?: { name: string; color: string } };
      type BudgetData = { amount: number; category_id: string; alert_threshold: number; category?: { name: string } };

      // Calculate stats
      const totalSpent = expenses?.reduce((sum: number, e: ExpenseData) => sum + e.amount, 0) || 0;
      const avgPerDay = daysPassed > 0 ? totalSpent / daysPassed : 0;
      const totalBudget = budgets?.reduce((sum: number, b: BudgetData) => sum + b.amount, 0) || 0;

      // Category breakdown
      const categoryTotals: Record<string, { amount: number; color: string }> = {};
      (expenses || []).forEach((e: ExpenseData) => {
        const catName = e.category?.name || 'Other';
        const catColor = e.category?.color || '#6b7280';
        if (!categoryTotals[catName]) {
          categoryTotals[catName] = { amount: 0, color: catColor };
        }
        categoryTotals[catName].amount += e.amount;
      });

      const categoryBreakdown = Object.entries(categoryTotals)
        .map(([name, data]) => ({
          name,
          amount: data.amount,
          percentage: totalSpent > 0 ? (data.amount / totalSpent) * 100 : 0,
          color: data.color,
        }))
        .sort((a, b) => b.amount - a.amount);

      const topCategory = categoryBreakdown[0]?.name || 'N/A';

      // Generate summary
      let summary = `This month, you've spent ${formatCurrency(totalSpent)}`;
      if (totalBudget > 0) {
        const budgetPercentage = ((totalSpent / totalBudget) * 100).toFixed(0);
        summary += `, which is ${budgetPercentage}% of your total budget of ${formatCurrency(totalBudget)}`;
      }
      if (topCategory !== 'N/A') {
        summary += `. Your highest spending category is ${topCategory} at ${formatCurrency(categoryBreakdown[0]?.amount || 0)}`;
      }
      summary += '.';

      // Generate tips
      const tips: string[] = [];
      if (categoryBreakdown[0] && categoryBreakdown[0].percentage > 40) {
        tips.push(
          `Consider reviewing your ${categoryBreakdown[0].name} expenses - they account for over 40% of your spending.`
        );
      }
      if (totalBudget > 0 && totalSpent > totalBudget * 0.8) {
        tips.push(
          `You're approaching your budget limit. Try to limit non-essential purchases for the rest of the month.`
        );
      }
      if (avgPerDay > 0) {
        const projectedSpending = avgPerDay * daysInMonth;
        if (totalBudget > 0 && projectedSpending > totalBudget) {
          tips.push(
            `At your current pace, you'll spend ${formatCurrency(projectedSpending)} by month end. Consider reducing daily spending.`
          );
        }
      }
      tips.push(`Track your daily expenses to identify patterns and areas for improvement.`);
      tips.push(`Set up category-specific budgets to better manage spending in different areas.`);

      // Generate warnings
      const warnings: string[] = [];
      if (totalBudget > 0 && totalSpent > totalBudget) {
        warnings.push(
          `You've exceeded your monthly budget by ${formatCurrency(totalSpent - totalBudget)}. Review your spending to get back on track.`
        );
      }

      // Check individual budget limits
      budgets?.forEach((budget: BudgetData) => {
        const categoryExpenses =
          expenses
            ?.filter((e: ExpenseData) => e.category_id === budget.category_id)
            .reduce((sum: number, e: ExpenseData) => sum + e.amount, 0) || 0;

        if (categoryExpenses > budget.amount) {
          const catName = budget.category?.name || 'Overall';
          warnings.push(
            `${catName} budget exceeded by ${formatCurrency(categoryExpenses - budget.amount)}.`
          );
        } else if (categoryExpenses >= budget.amount * (budget.alert_threshold / 100)) {
          const catName = budget.category?.name || 'Overall';
          warnings.push(
            `${catName} spending is at ${((categoryExpenses / budget.amount) * 100).toFixed(0)}% of budget.`
          );
        }
      });

      setInsights({
        summary,
        tips,
        warnings,
        categoryBreakdown,
        stats: {
          totalSpent,
          avgPerDay,
          transactionCount: expenses?.length || 0,
          topCategory,
        },
      });
    } catch (err: unknown) {
      setError(getErrorMessage(err) || 'Failed to generate insights');
    } finally {
      setIsLoading(false);
    }
  }, [user, formatCurrency]);

  const askQuestion = useCallback(
    async (question: string): Promise<string> => {
      // In production, this would call the backend API which uses Gemini
      // For now, return context-aware responses based on insights
      if (!insights) {
        return "I don't have enough data to answer that. Please generate insights first.";
      }

      const lowerQuestion = question.toLowerCase();

      if (lowerQuestion.includes('save') || lowerQuestion.includes('saving')) {
        return `Based on your spending of ${formatCurrency(insights.stats.totalSpent)} this month, here are some ways to save:
1. ${insights.tips[0] || 'Review your top spending categories'}
2. Set a daily spending limit of ${formatCurrency(insights.stats.avgPerDay * 0.8)}
3. Track every expense to stay aware of your spending habits`;
      }

      if (lowerQuestion.includes('spend') || lowerQuestion.includes('expense')) {
        return `Your spending summary:
- Total spent this month: ${formatCurrency(insights.stats.totalSpent)}
- Daily average: ${formatCurrency(insights.stats.avgPerDay)}
- Top category: ${insights.stats.topCategory}
- Number of transactions: ${insights.stats.transactionCount}`;
      }

      if (lowerQuestion.includes('budget')) {
        if (insights.warnings.length > 0) {
          return `Budget alerts:\n${insights.warnings.map((w) => `- ${w}`).join('\n')}`;
        }
        return `You're managing your budget well! Keep tracking your expenses to stay on target.`;
      }

      if (lowerQuestion.includes('tip') || lowerQuestion.includes('advice')) {
        return `Here are some personalized tips:\n${insights.tips.map((t) => `- ${t}`).join('\n')}`;
      }

      return `Based on your financial data: ${insights.summary}\n\nWould you like specific advice about saving, spending, or budgeting?`;
    },
    [insights, formatCurrency]
  );

  return {
    insights,
    isLoading,
    error,
    generateInsights,
    askQuestion,
  };
}

export default useInsights;
