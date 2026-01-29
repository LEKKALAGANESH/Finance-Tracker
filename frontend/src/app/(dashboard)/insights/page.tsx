'use client';

import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Sparkles, Send, RefreshCw, Lightbulb, TrendingUp, AlertCircle, MessageSquare } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { getSupabaseClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Loader } from '@/components/ui/Loader';

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

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function InsightsPage() {
  const { user } = useAuth();
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

  useEffect(() => {
    generateInsights();
  }, [user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const generateInsights = async () => {
    if (!user) return;

    setIsGenerating(true);
    const supabase = getSupabaseClient();

    // Fetch recent expenses for analysis
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    const { data: expenses } = await supabase
      .from('expenses')
      .select('*, category:categories(name)')
      .eq('user_id', user.id)
      .gte('date', startOfMonth)
      .lte('date', endOfMonth);

    const { data: budgets } = await supabase.from('budgets').select('*, category:categories(name)').eq('user_id', user.id);

    // Define types for this context
    type ExpenseData = { amount: number; category_id: string; category?: { name: string } };
    type BudgetData = { amount: number; category_id: string; category?: { name: string } };

    // Calculate insights locally (fallback when backend is not available)
    const totalSpent = expenses?.reduce((sum: number, e: ExpenseData) => sum + e.amount, 0) || 0;
    const totalBudget = budgets?.reduce((sum: number, b: BudgetData) => sum + b.amount, 0) || 0;

    // Category breakdown
    const categorySpending: Record<string, number> = {};
    (expenses || []).forEach((e: ExpenseData) => {
      const catName = e.category?.name || 'Other';
      categorySpending[catName] = (categorySpending[catName] || 0) + e.amount;
    });

    const sortedCategories = Object.entries(categorySpending).sort((a, b) => b[1] - a[1]);
    const topCategory = sortedCategories[0];

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
    budgets?.forEach((budget: BudgetData) => {
      const categoryExpenses =
        expenses?.filter((e: ExpenseData) => e.category_id === budget.category_id).reduce((sum: number, e: ExpenseData) => sum + e.amount, 0) || 0;
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
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isSending) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setChatMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsSending(true);

    // Simulate AI response (in production, this would call the backend API)
    setTimeout(() => {
      const responses = [
        `Based on your spending patterns, I recommend focusing on reducing discretionary expenses. Your data shows opportunities for savings in several categories.`,
        `Looking at your financial data, you're doing well with tracking expenses. Consider setting up automatic savings to reach your goals faster.`,
        `Your spending this month is ${summary.includes('budget') ? 'within budget parameters' : 'being tracked effectively'}. Keep monitoring your daily expenses for best results.`,
        `Great question! Based on your expense history, I suggest reviewing recurring subscriptions and finding areas where you can optimize spending.`,
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setChatMessages((prev) => [...prev, { role: 'assistant', content: randomResponse }]);
      setIsSending(false);
    }, 1500);
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
                  <SuggestionChip onClick={() => setChatInput('How can I save more money?')}>
                    How can I save more?
                  </SuggestionChip>
                  <SuggestionChip onClick={() => setChatInput('What are my biggest expenses?')}>
                    Biggest expenses?
                  </SuggestionChip>
                  <SuggestionChip onClick={() => setChatInput('Tips for budgeting')}>
                    Budgeting tips
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
