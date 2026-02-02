'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { Sparkles, Send, RefreshCw, Lightbulb, TrendingUp, AlertCircle, MessageSquare } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useToast } from '@/context/ToastContext';
import { getSupabaseClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Loader } from '@/components/ui/Loader';

// ============================================================================
// TypeScript Interfaces
// ============================================================================

/**
 * Chat message role types
 */
type ChatRole = 'user' | 'assistant';

/**
 * Chat message in the AI conversation
 */
interface ChatMessage {
  role: ChatRole;
  content: string;
  timestamp?: Date;
}

/**
 * Expense data from the database
 */
interface ExpenseData {
  amount: number;
  category_id: string;
  date: string;
  description: string;
  category?: {
    name: string;
    icon?: string;
    color?: string;
  };
}

/**
 * Goal data from the database
 */
interface GoalData {
  name: string;
  target_amount: number;
  current_amount: number;
  status: 'active' | 'completed' | 'paused';
  deadline?: string;
}

/**
 * Budget data from the database
 */
interface BudgetData {
  amount: number;
  category_id: string;
  period: string;
  spent?: number;
}

/**
 * Monthly spending trend data
 */
interface MonthlyTrend {
  month: string;
  amount: number;
}

/**
 * Aggregated financial data for insights generation
 */
interface FinancialData {
  expenses: ExpenseData[];
  goals: GoalData[];
  budgets?: BudgetData[];
  totalSpent: number;
  totalBudget: number;
  categorySpending: Record<string, number>;
  sortedCategories: [string, number][];
  monthlyTrend: MonthlyTrend[];
}

/**
 * Insights page state
 */
interface InsightsState {
  isLoading: boolean;
  isGenerating: boolean;
  tips: string[];
  warnings: string[];
  chatMessages: ChatMessage[];
  currentQuestion: string;
  financialData: FinancialData | null;
}

/**
 * Props for styled ChatBubble component
 */
interface ChatBubbleProps {
  $isUser: boolean;
}

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};

  h1 {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.sm};
    font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.text};

    svg {
      color: ${({ theme }) => theme.colors.primary};
    }
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const InsightsColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const InsightCard = styled(Card)<{ $type?: 'tip' | 'warning' | 'insight' }>`
  border-left: 4px solid
    ${({ theme, $type }) =>
      $type === 'warning'
        ? theme.colors.warning
        : $type === 'tip'
        ? theme.colors.success
        : theme.colors.primary};
`;

const InsightHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};

  svg {
    color: ${({ theme }) => theme.colors.primary};
  }

  h3 {
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const InsightContent = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.6;
`;

const TipsList = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const TipItem = styled.li`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surfaceHover};
  border-radius: ${({ theme }) => theme.borderRadius.md};

  svg {
    color: ${({ theme }) => theme.colors.success};
    flex-shrink: 0;
    margin-top: 2px;
  }

  p {
    color: ${({ theme }) => theme.colors.text};
    line-height: 1.5;
  }
`;

const ChatCard = styled(Card)`
  display: flex;
  flex-direction: column;
  height: 600px;

  @media (max-width: 1024px) {
    height: 500px;
  }
`;

const ChatHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  svg {
    color: ${({ theme }) => theme.colors.primary};
  }

  h3 {
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const ChatMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Message = styled.div<{ $isUser: boolean }>`
  max-width: 85%;
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  align-self: ${({ $isUser }) => ($isUser ? 'flex-end' : 'flex-start')};
  background: ${({ theme, $isUser }) => ($isUser ? theme.colors.primary : theme.colors.surfaceHover)};
  color: ${({ theme, $isUser }) => ($isUser ? '#fff' : theme.colors.text)};
  line-height: 1.5;
  white-space: pre-wrap;
`;

const ChatInputContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const ChatInput = styled.input`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.fontSize.base};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const SendButton = styled(Button)`
  padding: ${({ theme }) => theme.spacing.md};
`;

const LoadingDots = styled.div`
  display: flex;
  gap: 4px;
  padding: ${({ theme }) => theme.spacing.md};

  span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.textSecondary};
    animation: bounce 1.4s infinite ease-in-out both;

    &:nth-child(1) {
      animation-delay: -0.32s;
    }
    &:nth-child(2) {
      animation-delay: -0.16s;
    }
  }

  @keyframes bounce {
    0%,
    80%,
    100% {
      transform: scale(0);
    }
    40% {
      transform: scale(1);
    }
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: ${({ theme }) => theme.spacing['2xl']};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const EmptyStateIcon = styled.div`
  width: 72px;
  height: 72px;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => `linear-gradient(135deg, ${theme.colors.primary}15, ${theme.colors.secondary}15)`};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.primary};
`;

const EmptyStateTitle = styled.h4`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const EmptyStateSubtitle = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const SuggestionChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  justify-content: center;
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const SuggestionChip = styled.button`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surfaceHover};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryLight};
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
  }
`;


export default function InsightsPage() {
  const { user } = useAuth();
  const { formatCurrency } = useCurrency();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [summary, setSummary] = useState('');
  const [tips, setTips] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);

  const generateInsights = useCallback(async () => {
    if (!user) return;

    setIsGenerating(true);
    const supabase = getSupabaseClient();

    // Fetch recent expenses for analysis
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    // Get last 6 months for trend analysis
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString().split('T')[0];

    const [expensesResult, allExpensesResult, budgetsResult, goalsResult] = await Promise.all([
      supabase
        .from('expenses')
        .select('*, category:categories(name)')
        .eq('user_id', user.id)
        .gte('date', startOfMonth)
        .lte('date', endOfMonth),
      supabase
        .from('expenses')
        .select('*, category:categories(name)')
        .eq('user_id', user.id)
        .gte('date', sixMonthsAgo)
        .order('date', { ascending: true }),
      supabase.from('budgets').select('*, category:categories(name)').eq('user_id', user.id),
      supabase.from('goals').select('*').eq('user_id', user.id),
    ]);

    const expenses = expensesResult.data || [];
    const allExpenses = allExpensesResult.data || [];
    const budgets = budgetsResult.data || [];
    const goals = goalsResult.data || [];

    // Define types for this context
    type BudgetData = { amount: number; category_id: string; category?: { name: string } };

    // Calculate insights locally
    const totalSpent = expenses.reduce((sum: number, e: ExpenseData) => sum + e.amount, 0);
    const totalBudget = budgets.reduce((sum: number, b: BudgetData) => sum + b.amount, 0);

    // Category breakdown
    const categorySpending: Record<string, number> = {};
    expenses.forEach((e: ExpenseData) => {
      const catName = e.category?.name || 'Other';
      categorySpending[catName] = (categorySpending[catName] || 0) + e.amount;
    });

    const sortedCategories = Object.entries(categorySpending).sort((a, b) => b[1] - a[1]) as [string, number][];
    const topCategory = sortedCategories[0];

    // Calculate monthly trend
    const monthlyTrend: { month: string; amount: number }[] = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0];
      const monthExpenses = allExpenses.filter(
        (e: ExpenseData) => e.date >= monthStart && e.date <= monthEnd
      );
      const monthTotal = monthExpenses.reduce((sum: number, e: ExpenseData) => sum + e.amount, 0);
      monthlyTrend.push({
        month: monthNames[d.getMonth()],
        amount: monthTotal,
      });
    }

    // Store financial data for chat
    setFinancialData({
      expenses,
      goals,
      totalSpent,
      totalBudget,
      categorySpending,
      sortedCategories,
      monthlyTrend,
    });

    // Generate summary
    let summaryText = `This month, you've spent ${formatCurrency(totalSpent)}`;
    if (totalBudget > 0) {
      const budgetPercentage = ((totalSpent / totalBudget) * 100).toFixed(0);
      summaryText += `, which is ${budgetPercentage}% of your total budget of ${formatCurrency(totalBudget)}`;
    }
    if (topCategory) {
      summaryText += `. Your highest spending category is ${topCategory[0]} at ${formatCurrency(topCategory[1])}`;
    }
    summaryText += '.';
    setSummary(summaryText);

    // Generate tips
    const generatedTips: string[] = [];
    if (topCategory && topCategory[1] > totalSpent * 0.4) {
      generatedTips.push(
        `Consider reviewing your ${topCategory[0]} expenses - they account for over 40% of your spending.`
      );
    }
    if (totalBudget > 0 && totalSpent > totalBudget * 0.8) {
      generatedTips.push(
        `You're approaching your budget limit. Try to limit non-essential purchases for the rest of the month.`
      );
    }
    generatedTips.push(`Track your daily expenses to identify patterns and areas for improvement.`);
    generatedTips.push(`Set up category-specific budgets to better manage spending in different areas.`);
    if (sortedCategories.length > 3) {
      generatedTips.push(
        `You have ${sortedCategories.length} spending categories this month. Consider consolidating some for easier tracking.`
      );
    }
    setTips(generatedTips);

    // Generate warnings
    const generatedWarnings: string[] = [];
    if (totalBudget > 0 && totalSpent > totalBudget) {
      generatedWarnings.push(
        `You've exceeded your monthly budget by ${formatCurrency(totalSpent - totalBudget)}. Review your spending to get back on track.`
      );
    }
    budgets.forEach((budget: BudgetData) => {
      const categoryExpenses = expenses
        .filter((e: ExpenseData) => e.category_id === budget.category_id)
        .reduce((sum: number, e: ExpenseData) => sum + e.amount, 0);
      if (categoryExpenses > budget.amount) {
        const catName = budget.category?.name || 'Overall';
        generatedWarnings.push(
          `${catName} budget exceeded by ${formatCurrency(categoryExpenses - budget.amount)}.`
        );
      }
    });
    setWarnings(generatedWarnings);

    setIsLoading(false);
    setIsGenerating(false);
  }, [user, formatCurrency]);

  useEffect(() => {
    generateInsights();
  }, [generateInsights]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const generateAIResponse = (question: string): string => {
    if (!financialData) {
      return "I don't have enough data yet. Please add some expenses first and refresh the insights.";
    }

    const { totalSpent, totalBudget, sortedCategories, categorySpending, monthlyTrend, goals, expenses } = financialData;
    const questionLower = question.toLowerCase();

    // Calculate common values
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysPassed = now.getDate();
    const daysRemaining = daysInMonth - daysPassed;

    // Spending advice / Recommendations / How much to spend
    if (questionLower.includes('how much') && (questionLower.includes('spend') || questionLower.includes('good') || questionLower.includes('best') || questionLower.includes('should') || questionLower.includes('recommend'))) {
      if (totalBudget === 0) {
        return `You haven't set up a budget yet, so I can't give specific recommendations.\n\nHowever, a common guideline is the 50/30/20 rule:\n- 50% on needs (rent, utilities, groceries)\n- 30% on wants (entertainment, dining out)\n- 20% on savings\n\nGo to the Budgets page to set up your monthly budget!`;
      }

      const remaining = totalBudget - totalSpent;
      const dailyRemaining = daysRemaining > 0 ? remaining / daysRemaining : 0;
      const percentage = (totalSpent / totalBudget) * 100;

      let response = `Budget Spending Recommendations:\n\n`;
      response += `Your Budget: ${formatCurrency(totalBudget)}\n`;
      response += `Already Spent: ${formatCurrency(totalSpent)} (${percentage.toFixed(1)}%)\n`;
      response += `Remaining: ${formatCurrency(Math.max(0, remaining))}\n\n`;

      if (remaining > 0) {
        response += `Recommended Daily Spending:\n`;
        response += `For the remaining ${daysRemaining} days, try to spend no more than ${formatCurrency(dailyRemaining)} per day.\n\n`;

        // Category-wise recommendations
        if (sortedCategories.length > 0) {
          response += `Smart Spending Tips:\n`;
          const topCategory = sortedCategories[0];
          if (topCategory[1] > totalBudget * 0.3) {
            response += `- ${topCategory[0]} is ${((topCategory[1] / totalBudget) * 100).toFixed(0)}% of your budget. Consider reducing it.\n`;
          }
          response += `- Prioritize essential expenses (bills, groceries)\n`;
          response += `- Limit discretionary spending (dining, entertainment)\n`;
          response += `- Try to save at least ${formatCurrency(remaining * 0.1)} for emergencies`;
        }
      } else {
        response += `You've exceeded your budget by ${formatCurrency(Math.abs(remaining))}.\n\n`;
        response += `Recommendations:\n`;
        response += `- Avoid non-essential purchases for the rest of the month\n`;
        response += `- Review your ${sortedCategories[0]?.[0] || 'top'} spending for potential cuts\n`;
        response += `- Consider adjusting your budget for next month`;
      }

      return response;
    }

    // Daily spending limit
    if (questionLower.includes('daily') || questionLower.includes('per day') || questionLower.includes('each day')) {
      if (totalBudget === 0) {
        const avgDaily = daysPassed > 0 ? totalSpent / daysPassed : 0;
        return `Without a budget set, here's your current spending:\n\n` +
          `Daily Average: ${formatCurrency(avgDaily)}\n` +
          `Days Passed: ${daysPassed} of ${daysInMonth}\n\n` +
          `Set up a budget to get personalized daily spending limits!`;
      }

      const idealDaily = totalBudget / daysInMonth;
      const actualDaily = daysPassed > 0 ? totalSpent / daysPassed : 0;
      const remaining = totalBudget - totalSpent;
      const recommendedDaily = daysRemaining > 0 ? remaining / daysRemaining : 0;

      let response = `Daily Spending Analysis:\n\n`;
      response += `Ideal Daily Limit: ${formatCurrency(idealDaily)}\n`;
      response += `Your Actual Average: ${formatCurrency(actualDaily)}\n\n`;

      if (actualDaily > idealDaily) {
        response += `You're spending ${formatCurrency(actualDaily - idealDaily)} more per day than ideal.\n\n`;
        response += `To stay on budget, limit spending to ${formatCurrency(Math.max(0, recommendedDaily))} for the remaining ${daysRemaining} days.`;
      } else {
        response += `Great! You're ${formatCurrency(idealDaily - actualDaily)} under your daily target.\n\n`;
        response += `You can safely spend up to ${formatCurrency(recommendedDaily)} per day for the rest of the month.`;
      }

      return response;
    }

    // Biggest expenses / Top spending
    if (questionLower.includes('biggest expense') || questionLower.includes('top spending') || questionLower.includes('most money') || questionLower.includes('where do i spend')) {
      if (sortedCategories.length === 0) {
        return "You haven't recorded any expenses yet this month. Start tracking to see your spending patterns!";
      }

      let response = `Here are your biggest spending categories this month:\n\n`;
      const topCategories = sortedCategories.slice(0, 5);
      topCategories.forEach(([category, amount], index) => {
        const percentage = totalSpent > 0 ? ((amount / totalSpent) * 100).toFixed(1) : 0;
        response += `${index + 1}. ${category}: ${formatCurrency(amount)} (${percentage}%)\n`;
      });
      response += `\nTotal spent this month: ${formatCurrency(totalSpent)}`;

      if (topCategories.length > 0 && topCategories[0][1] > totalSpent * 0.3) {
        response += `\n\nTip: ${topCategories[0][0]} accounts for ${((topCategories[0][1] / totalSpent) * 100).toFixed(0)}% of your spending. Consider setting a budget limit for this category.`;
      }
      return response;
    }

    // Save money / Reduce spending
    if (questionLower.includes('save') || questionLower.includes('reduce') || questionLower.includes('cut')) {
      if (sortedCategories.length === 0) {
        return "Start by tracking your expenses! Once you have data, I can give you personalized saving tips.";
      }

      let response = `Based on your spending of ${formatCurrency(totalSpent)} this month, here's how you can save:\n\n`;

      // Find categories to cut
      const topCategory = sortedCategories[0];
      if (topCategory) {
        const savingTarget = topCategory[1] * 0.2;
        response += `1. Reduce ${topCategory[0]} by 20% = Save ${formatCurrency(savingTarget)}/month\n`;
      }
      if (sortedCategories.length > 1) {
        const secondCategory = sortedCategories[1];
        const savingTarget = secondCategory[1] * 0.15;
        response += `2. Cut ${secondCategory[0]} by 15% = Save ${formatCurrency(savingTarget)}/month\n`;
      }

      // Check for discretionary spending
      const discretionary = ['Entertainment', 'Shopping', 'Food & Dining', 'Travel'];
      const discretionarySpending = sortedCategories
        .filter(([cat]) => discretionary.some(d => cat.toLowerCase().includes(d.toLowerCase())))
        .reduce((sum, [, amt]) => sum + amt, 0);

      if (discretionarySpending > 0) {
        response += `\nYour discretionary spending (dining, entertainment, shopping): ${formatCurrency(discretionarySpending)}`;
        response += `\nCutting this by 25% could save you ${formatCurrency(discretionarySpending * 0.25)}/month!`;
      }

      return response;
    }

    // Budget status - but skip if asking for advice (handled above)
    if ((questionLower.includes('budget') || questionLower.includes('on track') || questionLower.includes('how am i doing')) &&
        !questionLower.includes('how much') && !questionLower.includes('should') && !questionLower.includes('recommend') && !questionLower.includes('best') && !questionLower.includes('good to')) {
      if (totalBudget === 0) {
        return `You've spent ${formatCurrency(totalSpent)} this month, but you haven't set up any budgets yet.\n\nI recommend setting up monthly budgets to track your spending goals. Go to the Budgets page to get started!`;
      }

      const percentage = (totalSpent / totalBudget) * 100;
      const remaining = totalBudget - totalSpent;
      const dailyRemaining = daysRemaining > 0 ? remaining / daysRemaining : 0;

      let response = `Budget Status:\n\n`;
      response += `Spent: ${formatCurrency(totalSpent)} of ${formatCurrency(totalBudget)} (${percentage.toFixed(1)}%)\n`;

      if (remaining > 0) {
        response += `Remaining: ${formatCurrency(remaining)}\n`;
        response += `Days Left: ${daysRemaining}\n`;
        response += `Safe Daily Spend: ${formatCurrency(dailyRemaining)}\n\n`;

        if (percentage < 50) {
          response += `Excellent! You're well under budget with ${daysRemaining} days left. You have flexibility for planned expenses.`;
        } else if (percentage < 80) {
          response += `Good progress! Stay mindful of larger purchases to finish the month strong.`;
        } else {
          response += `Warning: You're at ${percentage.toFixed(0)}% of your budget. Stick to essentials for the remaining days.`;
        }
      } else {
        response += `Over budget by: ${formatCurrency(Math.abs(remaining))}\n\n`;
        response += `Action needed:\n`;
        response += `1. Pause non-essential spending\n`;
        response += `2. Review ${sortedCategories[0]?.[0] || 'your top'} expenses\n`;
        response += `3. Consider adjusting next month's budget`;
      }

      return response;
    }

    // Goals progress
    if (questionLower.includes('goal') || questionLower.includes('saving') || questionLower.includes('target')) {
      if (goals.length === 0) {
        return "You haven't set any savings goals yet. Go to the Goals page to create your first goal and start tracking your progress!";
      }

      let response = `Your Savings Goals:\n\n`;
      goals.forEach((goal: GoalData) => {
        const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
        const remaining = goal.target_amount - goal.current_amount;
        response += `${goal.name}:\n`;
        response += `  Progress: ${formatCurrency(goal.current_amount)} / ${formatCurrency(goal.target_amount)} (${progress.toFixed(1)}%)\n`;
        if (goal.status === 'completed') {
          response += `  Status: Completed!\n`;
        } else {
          response += `  Remaining: ${formatCurrency(remaining)}\n`;
        }
        response += `\n`;
      });

      const activeGoals = goals.filter((g: GoalData) => g.status === 'active');
      const totalRemaining = activeGoals.reduce((sum: number, g: GoalData) => sum + (g.target_amount - g.current_amount), 0);
      if (totalRemaining > 0) {
        response += `Total needed for all active goals: ${formatCurrency(totalRemaining)}`;
      }

      return response;
    }

    // Monthly trend / Spending over time
    if (questionLower.includes('trend') || questionLower.includes('month') || questionLower.includes('history') || questionLower.includes('over time')) {
      if (monthlyTrend.length === 0) {
        return "Not enough historical data yet. Keep tracking for a few months to see trends!";
      }

      let response = `Your Spending Trend (Last 6 Months):\n\n`;
      monthlyTrend.forEach(({ month, amount }) => {
        response += `${month}: ${formatCurrency(amount)}\n`;
      });

      const amounts = monthlyTrend.map(m => m.amount).filter(a => a > 0);
      if (amounts.length >= 2) {
        const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
        const current = monthlyTrend[monthlyTrend.length - 1].amount;
        response += `\nMonthly average: ${formatCurrency(avg)}`;

        if (current > avg * 1.1) {
          response += `\nThis month is ${((current / avg - 1) * 100).toFixed(0)}% above your average.`;
        } else if (current < avg * 0.9) {
          response += `\nGreat! This month is ${((1 - current / avg) * 100).toFixed(0)}% below your average.`;
        } else {
          response += `\nYou're spending close to your monthly average.`;
        }
      }

      return response;
    }

    // Summary / Overview
    if (questionLower.includes('summary') || questionLower.includes('overview') || questionLower.includes('tell me about')) {
      let response = `Financial Summary for This Month:\n\n`;
      response += `Total Spent: ${formatCurrency(totalSpent)}\n`;
      if (totalBudget > 0) {
        response += `Budget: ${formatCurrency(totalBudget)} (${((totalSpent / totalBudget) * 100).toFixed(1)}% used)\n`;
      }
      response += `Transactions: ${expenses.length}\n`;
      response += `Categories: ${sortedCategories.length}\n\n`;

      if (sortedCategories.length > 0) {
        response += `Top Category: ${sortedCategories[0][0]} (${formatCurrency(sortedCategories[0][1])})\n`;
      }

      const activeGoals = goals.filter((g: GoalData) => g.status === 'active');
      if (activeGoals.length > 0) {
        response += `Active Goals: ${activeGoals.length}\n`;
      }

      return response;
    }

    // Help / What can you do
    if (questionLower.includes('help') || questionLower.includes('what can you') || questionLower.includes('what do you')) {
      return `I'm your financial assistant! Here's what I can help with:\n\n` +
        `Spending Analysis:\n` +
        `- "What are my biggest expenses?"\n` +
        `- "Show me my spending trend"\n\n` +
        `Budget Help:\n` +
        `- "How much should I spend daily?"\n` +
        `- "Am I on track with my budget?"\n` +
        `- "How much can I safely spend?"\n\n` +
        `Savings:\n` +
        `- "How can I save more money?"\n` +
        `- "How are my goals progressing?"\n\n` +
        `Overview:\n` +
        `- "Give me a summary"\n` +
        `- "How am I doing this month?"`;
    }

    // Afford / Can I buy
    if (questionLower.includes('afford') || questionLower.includes('can i buy') || questionLower.includes('can i spend')) {
      const remaining = totalBudget - totalSpent;
      const dailyRemaining = daysRemaining > 0 ? remaining / daysRemaining : 0;

      if (totalBudget === 0) {
        return `Without a budget set, it's hard to say what you can afford.\n\n` +
          `You've spent ${formatCurrency(totalSpent)} this month so far.\n\n` +
          `Tip: Set up a monthly budget to help make these decisions easier!`;
      }

      if (remaining <= 0) {
        return `You've already exceeded your budget by ${formatCurrency(Math.abs(remaining))}.\n\n` +
          `I recommend avoiding additional non-essential purchases until next month.`;
      }

      return `Based on your budget:\n\n` +
        `Available: ${formatCurrency(remaining)}\n` +
        `Days Remaining: ${daysRemaining}\n` +
        `Daily Allowance: ${formatCurrency(dailyRemaining)}\n\n` +
        `You can afford purchases up to ${formatCurrency(remaining * 0.3)} without significantly impacting your daily budget.\n\n` +
        `For larger purchases, consider:\n` +
        `- Is it essential or can it wait?\n` +
        `- Will it affect your savings goals?\n` +
        `- Can you reduce other expenses to compensate?`;
    }

    // Default response - try to understand intent and provide helpful response
    // Check if it's a question about spending/money
    if (questionLower.includes('spend') || questionLower.includes('money') || questionLower.includes('much')) {
      const remaining = totalBudget > 0 ? totalBudget - totalSpent : 0;
      const dailyRemaining = daysRemaining > 0 && remaining > 0 ? remaining / daysRemaining : 0;

      let response = `Based on your question, here's what I can tell you:\n\n`;
      response += `This Month's Overview:\n`;
      response += `- Spent: ${formatCurrency(totalSpent)}\n`;
      if (totalBudget > 0) {
        response += `- Budget: ${formatCurrency(totalBudget)}\n`;
        response += `- Remaining: ${formatCurrency(Math.max(0, remaining))}\n`;
        response += `- Safe daily spend: ${formatCurrency(dailyRemaining)}\n`;
      }
      if (sortedCategories.length > 0) {
        response += `- Top category: ${sortedCategories[0][0]} (${formatCurrency(sortedCategories[0][1])})\n`;
      }
      response += `\nWant more specific advice? Try asking:\n`;
      response += `- "How much should I spend daily?"\n`;
      response += `- "How can I save money?"`;
      return response;
    }

    // Generic default response
    return `I'm here to help with your finances! Here's a quick overview:\n\n` +
      `This month: ${formatCurrency(totalSpent)} spent` +
      (totalBudget > 0 ? ` of ${formatCurrency(totalBudget)} budget` : '') + `\n` +
      (sortedCategories.length > 0 ? `Top category: ${sortedCategories[0][0]} (${formatCurrency(sortedCategories[0][1])})\n` : '') +
      `\nTry asking me:\n` +
      `- "How much can I spend daily?"\n` +
      `- "What are my biggest expenses?"\n` +
      `- "How can I save more money?"\n` +
      `- "Am I on track with my budget?"`;
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isSending) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setChatMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsSending(true);

    // Generate response based on actual data
    setTimeout(() => {
      const response = generateAIResponse(userMessage);
      setChatMessages((prev) => [...prev, { role: 'assistant', content: response }]);
      setIsSending(false);
    }, 800);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isLoading) {
    return <Loader fullScreen text="Generating insights..." />;
  }

  return (
    <>
      <PageHeader>
        <h1>
          <Sparkles size={28} />
          AI Insights
        </h1>
        <Button leftIcon={<RefreshCw size={18} />} onClick={generateInsights} isLoading={isGenerating}>
          Refresh Insights
        </Button>
      </PageHeader>

      <ContentGrid>
        <InsightsColumn>
          <InsightCard $type="insight">
            <CardBody>
              <InsightHeader>
                <TrendingUp size={24} />
                <h3>Spending Summary</h3>
              </InsightHeader>
              <InsightContent>{summary}</InsightContent>
            </CardBody>
          </InsightCard>

          {warnings.length > 0 && (
            <InsightCard $type="warning">
              <CardBody>
                <InsightHeader>
                  <AlertCircle size={24} style={{ color: '#f59e0b' }} />
                  <h3>Alerts</h3>
                </InsightHeader>
                <TipsList>
                  {warnings.map((warning, index) => (
                    <TipItem key={index}>
                      <AlertCircle size={18} style={{ color: '#f59e0b' }} />
                      <p>{warning}</p>
                    </TipItem>
                  ))}
                </TipsList>
              </CardBody>
            </InsightCard>
          )}

          <InsightCard $type="tip">
            <CardBody>
              <InsightHeader>
                <Lightbulb size={24} style={{ color: '#10b981' }} />
                <h3>Personalized Tips</h3>
              </InsightHeader>
              <TipsList>
                {tips.map((tip, index) => (
                  <TipItem key={index}>
                    <Lightbulb size={18} />
                    <p>{tip}</p>
                  </TipItem>
                ))}
              </TipsList>
            </CardBody>
          </InsightCard>
        </InsightsColumn>

        <ChatCard>
          <ChatHeader>
            <MessageSquare size={20} />
            <h3>Ask AI</h3>
          </ChatHeader>

          <ChatMessages>
            {chatMessages.length === 0 ? (
              <EmptyState>
                <EmptyStateIcon>
                  <MessageSquare size={32} />
                </EmptyStateIcon>
                <EmptyStateTitle>Your Financial Assistant</EmptyStateTitle>
                <EmptyStateSubtitle>Ask me anything about your finances!</EmptyStateSubtitle>
                <SuggestionChips>
                  <SuggestionChip onClick={() => setChatInput('How much should I spend daily?')}>
                    Daily limit?
                  </SuggestionChip>
                  <SuggestionChip onClick={() => setChatInput('What are my biggest expenses?')}>
                    Top expenses
                  </SuggestionChip>
                  <SuggestionChip onClick={() => setChatInput('How can I save more money?')}>
                    Saving tips
                  </SuggestionChip>
                  <SuggestionChip onClick={() => setChatInput('Am I on track with my budget?')}>
                    Budget check
                  </SuggestionChip>
                </SuggestionChips>
              </EmptyState>
            ) : (
              chatMessages.map((msg, index) => (
                <Message key={index} $isUser={msg.role === 'user'}>
                  {msg.content}
                </Message>
              ))
            )}
            {isSending && (
              <Message $isUser={false}>
                <LoadingDots>
                  <span />
                  <span />
                  <span />
                </LoadingDots>
              </Message>
            )}
            <div ref={chatEndRef} />
          </ChatMessages>

          <ChatInputContainer>
            <ChatInput
              placeholder="Ask about your finances..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isSending}
            />
            <SendButton onClick={handleSendMessage} disabled={isSending || !chatInput.trim()}>
              <Send size={18} />
            </SendButton>
          </ChatInputContainer>
        </ChatCard>
      </ContentGrid>
    </>
  );
}
