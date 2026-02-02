'use client';

import styled, { keyframes, css } from 'styled-components';
import Link from 'next/link';
import { ArrowRight, TrendingUp, TrendingDown, Receipt } from 'lucide-react';
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
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const Container = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  position: relative;

  /* Subtle gradient top accent */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(
      90deg,
      ${({ theme }) => theme.colors.primary} 0%,
      ${({ theme }) => theme.colors.secondary} 100%
    );
    opacity: 0.7;
  }

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.lg};
    transform: translateY(-2px);
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.glass.background};
`;

const Title = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  svg {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const ViewAll = styled(Link)`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  transition: all 0.2s ease;

  svg {
    transition: transform 0.2s ease;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.primaryLight};
    text-decoration: none;

    svg {
      transform: translateX(3px);
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
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);
  cursor: pointer;
  position: relative;
  opacity: 0;
  animation: ${fadeInUp} 0.4s ease forwards;
  animation-delay: ${({ $index }) => ($index || 0) * 0.08}s;

  &:last-child {
    border-bottom: none;
  }

  /* Hover highlight effect */
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: ${({ theme }) => theme.colors.primary};
    transform: scaleY(0);
    transition: transform 0.2s ease;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
    padding-left: calc(${({ theme }) => theme.spacing.lg} + 4px);

    &::before {
      transform: scaleY(1);
    }
  }

  &:active {
    transform: scale(0.995);
  }

  @media (max-width: 480px) {
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  }
`;

const CategoryIcon = styled.div<{ $color: string }>`
  width: 44px;
  height: 44px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: linear-gradient(
    135deg,
    ${({ $color }) => `${$color}20`} 0%,
    ${({ $color }) => `${$color}10`} 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
  position: relative;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px ${({ $color }) => `${$color}15`};

  ${TransactionItem}:hover & {
    transform: scale(1.1) rotate(5deg);
    box-shadow: 0 4px 12px ${({ $color }) => `${$color}25`};
  }

  @media (max-width: 480px) {
    width: 38px;
    height: 38px;
    font-size: 1.1rem;
  }
`;

const TransactionInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const TransactionDescription = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.2s ease;

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
  gap: ${({ theme }) => theme.spacing.xs};

  @media (max-width: 480px) {
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
  }
`;

const MetaDot = styled.span`
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.textMuted};
`;

const AmountWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
`;

const Amount = styled.span<{ $isPositive?: boolean }>`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme, $isPositive }) => $isPositive ? theme.colors.success : theme.colors.error};
  font-feature-settings: 'tnum';
  display: flex;
  align-items: center;
  gap: 4px;
  transition: transform 0.2s ease;

  ${TransactionItem}:hover & {
    transform: scale(1.05);
  }

  @media (max-width: 480px) {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
  }
`;

const AmountIcon = styled.span<{ $isPositive?: boolean }>`
  display: inline-flex;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${({ theme, $isPositive }) =>
    $isPositive ? theme.colors.successLight : theme.colors.errorLight};
  align-items: center;
  justify-content: center;

  svg {
    width: 10px;
    height: 10px;
  }
`;

const EmptyState = styled.div`
  padding: ${({ theme }) => theme.spacing["2xl"]};
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};

  svg {
    width: 48px;
    height: 48px;
    color: ${({ theme }) => theme.colors.textMuted};
    opacity: 0.5;
  }

  p {
    max-width: 280px;
    line-height: 1.6;
  }
`;

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const { formatCurrency } = useCurrency();

  return (
    <Container>
      <Header>
        <Title>
          <Receipt size={20} />
          Recent Transactions
        </Title>
        <ViewAll href="/expenses">
          View All <ArrowRight size={16} />
        </ViewAll>
      </Header>
      <List>
        {transactions.length === 0 ? (
          <EmptyState>
            <Receipt />
            <p>No transactions yet. Start tracking your expenses!</p>
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
                    {transaction.category.name}
                    <MetaDot />
                    {formatDate(transaction.date, 'relative')}
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
