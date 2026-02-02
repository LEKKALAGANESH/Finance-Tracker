'use client';

import styled, { keyframes } from 'styled-components';
import Link from 'next/link';
import { ArrowRight, TrendingUp, TrendingDown, Receipt, Clock, Plus } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';
import { formatDate } from '@/lib/utils';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  type?: 'expense' | 'savings';
  category: {
    name: string;
    icon: string;
    color: string;
  };
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(-12px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.08); }
`;

const gradientMove = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 5px currentColor; }
  50% { box-shadow: 0 0 15px currentColor; }
`;

const Container = styled.div`
  background: ${({ theme }) => theme.glass.background};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  position: relative;

  /* Animated gradient top accent */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(
      90deg,
      ${({ theme }) => theme.colors.primary}00 0%,
      ${({ theme }) => theme.colors.primary} 30%,
      ${({ theme }) => theme.colors.secondary} 70%,
      ${({ theme }) => theme.colors.secondary}00 100%
    );
    background-size: 200% 100%;
    animation: ${gradientMove} 4s ease infinite;
  }

  /* Background glow */
  &::after {
    content: '';
    position: absolute;
    top: -100px;
    right: -100px;
    width: 300px;
    height: 300px;
    background: radial-gradient(
      circle,
      ${({ theme }) => theme.colors.primary}08 0%,
      transparent 70%
    );
    pointer-events: none;
  }

  &:hover {
    box-shadow:
      ${({ theme }) => theme.shadows.xl},
      0 8px 32px ${({ theme }) => theme.colors.primary}15;
    transform: translateY(-4px);
    border-color: ${({ theme }) => theme.colors.primary}30;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.xl};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: linear-gradient(
    180deg,
    ${({ theme }) => theme.colors.surfaceHover}40 0%,
    transparent 100%
  );
  position: relative;
  z-index: 1;
`;

const TitleSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const IconBadge = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.primary}20 0%,
    ${({ theme }) => theme.colors.primary}10 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.primary};
  box-shadow: 0 4px 12px ${({ theme }) => theme.colors.primary}15;
`;

const Title = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text};
`;

const ViewAll = styled(Link)`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  transition: all 0.3s ease;
  background: ${({ theme }) => theme.colors.primaryLight}50;
  border: 1px solid transparent;

  svg {
    transition: transform 0.3s ease;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
    border-color: ${({ theme }) => theme.colors.primary};
    transform: translateX(2px);
    box-shadow: 0 4px 12px ${({ theme }) => theme.colors.primary}40;

    svg {
      transform: translateX(4px);
    }
  }
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
`;

const TransactionItem = styled.div<{ $index?: number }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.xl};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border}80;
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  cursor: pointer;
  position: relative;
  opacity: 0;
  animation: ${fadeInUp} 0.5s ease forwards;
  animation-delay: ${({ $index }) => ($index || 0) * 0.1}s;

  &:last-child {
    border-bottom: none;
  }

  /* Hover highlight bar */
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: linear-gradient(
      180deg,
      ${({ theme }) => theme.colors.primary} 0%,
      ${({ theme }) => theme.colors.secondary} 100%
    );
    transform: scaleY(0);
    transition: transform 0.3s ease;
    border-radius: 0 4px 4px 0;
  }

  /* Hover background glow */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      ${({ theme }) => theme.colors.primary}08 0%,
      transparent 50%
    );
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
    padding-left: calc(${({ theme }) => theme.spacing.xl} + 8px);

    &::before {
      transform: scaleY(1);
    }

    &::after {
      opacity: 1;
    }
  }

  &:active {
    transform: scale(0.995);
  }

  @media (max-width: 480px) {
    padding: ${({ theme }) => theme.spacing.md};
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

const CategoryIcon = styled.div<{ $color: string }>`
  width: 52px;
  height: 52px;
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  background: linear-gradient(
    135deg,
    ${({ $color }) => `${$color}25`} 0%,
    ${({ $color }) => `${$color}10`} 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
  position: relative;
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  box-shadow:
    0 4px 12px ${({ $color }) => `${$color}20`},
    inset 0 1px 0 rgba(255, 255, 255, 0.1);

  /* Glow ring on hover */
  &::before {
    content: '';
    position: absolute;
    inset: -3px;
    border-radius: inherit;
    background: linear-gradient(
      135deg,
      ${({ $color }) => `${$color}40`} 0%,
      transparent 50%,
      ${({ $color }) => `${$color}20`} 100%
    );
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: -1;
  }

  ${TransactionItem}:hover & {
    transform: scale(1.1) rotate(5deg);
    box-shadow:
      0 8px 20px ${({ $color }) => `${$color}35`},
      inset 0 1px 0 rgba(255, 255, 255, 0.2);

    &::before {
      opacity: 1;
    }
  }

  @media (max-width: 480px) {
    width: 44px;
    height: 44px;
    font-size: 1.25rem;
  }
`;

const TransactionInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const TransactionDescription = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.3s ease;

  ${TransactionItem}:hover & {
    color: ${({ theme }) => theme.colors.primary};
  }

  @media (max-width: 480px) {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
  }
`;

const TransactionMeta = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textMuted};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  @media (max-width: 480px) {
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    gap: ${({ theme }) => theme.spacing.xs};
  }
`;

const MetaBadge = styled.span<{ $color?: string }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  background: ${({ theme, $color }) => $color ? `${$color}15` : theme.colors.surfaceHover};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme, $color }) => $color || theme.colors.textMuted};

  svg {
    width: 12px;
    height: 12px;
  }
`;

const AmountWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
`;

const Amount = styled.span<{ $isPositive?: boolean }>`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme, $isPositive }) => $isPositive ? theme.colors.success : theme.colors.error};
  font-feature-settings: 'tnum';
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;

  ${TransactionItem}:hover & {
    transform: scale(1.05);
    text-shadow: 0 2px 8px ${({ theme, $isPositive }) =>
      $isPositive ? theme.colors.success : theme.colors.error}40;
  }

  @media (max-width: 480px) {
    font-size: ${({ theme }) => theme.typography.fontSize.base};
  }
`;

const AmountIcon = styled.span<{ $isPositive?: boolean }>`
  display: inline-flex;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: ${({ theme, $isPositive }) =>
    $isPositive
      ? `linear-gradient(135deg, ${theme.colors.successLight} 0%, ${theme.colors.success}20 100%)`
      : `linear-gradient(135deg, ${theme.colors.errorLight} 0%, ${theme.colors.error}20 100%)`};
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px ${({ theme, $isPositive }) =>
    $isPositive ? theme.colors.success : theme.colors.error}30;
  transition: all 0.3s ease;

  svg {
    width: 12px;
    height: 12px;
  }

  ${TransactionItem}:hover & {
    transform: scale(1.1);
    box-shadow: 0 4px 12px ${({ theme, $isPositive }) =>
      $isPositive ? theme.colors.success : theme.colors.error}40;
  }

  @media (max-width: 480px) {
    width: 18px;
    height: 18px;

    svg {
      width: 10px;
      height: 10px;
    }
  }
`;

const EmptyState = styled.div`
  padding: ${({ theme }) => theme.spacing["2xl"]};
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};
  animation: ${fadeInUp} 0.5s ease forwards;

  svg {
    width: 64px;
    height: 64px;
    color: ${({ theme }) => theme.colors.textMuted};
    opacity: 0.4;
  }

  p {
    max-width: 280px;
    line-height: 1.7;
    font-size: ${({ theme }) => theme.typography.fontSize.base};
  }
`;

const AddButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.primary} 0%,
    ${({ theme }) => theme.colors.secondary} 100%
  );
  color: white;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px ${({ theme }) => theme.colors.primary}40;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px ${({ theme }) => theme.colors.primary}50;
  }

  &:active {
    transform: translateY(-1px);
  }
`;

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const { formatCurrency } = useCurrency();

  return (
    <Container>
      <Header>
        <TitleSection>
          <IconBadge>
            <Receipt size={20} />
          </IconBadge>
          <Title>Recent Transactions</Title>
        </TitleSection>
        <ViewAll href="/expenses">
          View All <ArrowRight size={16} />
        </ViewAll>
      </Header>
      <List>
        {transactions.length === 0 ? (
          <EmptyState>
            <Receipt />
            <p>No transactions yet. Start tracking your expenses to see them here!</p>
            <AddButton href="/expenses/add">
              <Plus size={18} />
              Add Your First Expense
            </AddButton>
          </EmptyState>
        ) : (
          transactions.map((transaction, index) => {
            const isPositive = transaction.amount > 0;
            const displayAmount = Math.abs(transaction.amount);
            return (
              <TransactionItem key={transaction.id} $index={index}>
                <CategoryIcon $color={transaction.category.color}>
                  {transaction.category.icon}
                </CategoryIcon>
                <TransactionInfo>
                  <TransactionDescription>{transaction.description}</TransactionDescription>
                  <TransactionMeta>
                    <MetaBadge $color={transaction.category.color}>
                      {transaction.category.name}
                    </MetaBadge>
                    <MetaBadge>
                      <Clock size={12} />
                      {formatDate(transaction.date, 'relative')}
                    </MetaBadge>
                  </TransactionMeta>
                </TransactionInfo>
                <AmountWrapper>
                  <Amount $isPositive={isPositive}>
                    <AmountIcon $isPositive={isPositive}>
                      {isPositive ? <TrendingUp /> : <TrendingDown />}
                    </AmountIcon>
                    {isPositive ? '+' : '-'}{formatCurrency(displayAmount)}
                  </Amount>
                </AmountWrapper>
              </TransactionItem>
            );
          })
        )}
      </List>
    </Container>
  );
}
