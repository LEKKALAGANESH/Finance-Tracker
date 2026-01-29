'use client';

import styled from 'styled-components';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: {
    name: string;
    icon: string;
    color: string;
  };
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

const Container = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Title = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
`;

const ViewAll = styled(Link)`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};

  &:hover {
    text-decoration: underline;
  }
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
`;

const TransactionItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  transition: background 0.15s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
  }
`;

const CategoryIcon = styled.div<{ $color: string }>`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ $color }) => `${$color}15`};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
`;

const TransactionInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const TransactionDescription = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TransactionMeta = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Amount = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.error};
`;

const EmptyState = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <Container>
      <Header>
        <Title>Recent Transactions</Title>
        <ViewAll href="/expenses">
          View All <ArrowRight size={16} />
        </ViewAll>
      </Header>
      <List>
        {transactions.length === 0 ? (
          <EmptyState>No transactions yet. Start tracking your expenses!</EmptyState>
        ) : (
          transactions.map((transaction) => (
            <TransactionItem key={transaction.id}>
              <CategoryIcon $color={transaction.category.color}>
                {transaction.category.icon}
              </CategoryIcon>
              <TransactionInfo>
                <TransactionDescription>{transaction.description}</TransactionDescription>
                <TransactionMeta>
                  {transaction.category.name} • {formatDate(transaction.date, 'relative')}
                </TransactionMeta>
              </TransactionInfo>
              <Amount>-{formatCurrency(transaction.amount)}</Amount>
            </TransactionItem>
          ))
        )}
      </List>
    </Container>
  );
}
