'use client';

import { useState, useEffect, useMemo } from 'react';
import styled, { keyframes, css } from 'styled-components';
import Link from 'next/link';
import { Plus, Search, Trash2, Edit, ChevronLeft, ChevronRight, Calendar, Receipt, TrendingUp, TrendingDown } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useToast } from '@/context/ToastContext';
import { getSupabaseClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';

// Animation keyframes
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const staggeredAnimation = (index: number) => css`
  opacity: 0;
  animation: ${fadeInUp} 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: ${index * 0.08}s;
`;

// Page wrapper with background effects
const PageWrapper = styled.div`
  position: relative;
  min-height: 100%;

  &::before {
    content: '';
    position: fixed;
    top: -15%;
    right: -8%;
    width: 500px;
    height: 500px;
    background: radial-gradient(
      circle,
      ${({ theme }) => theme.colors.primary}08 0%,
      transparent 70%
    );
    pointer-events: none;
    z-index: 0;

    @media (max-width: 768px) {
      width: 300px;
      height: 300px;
    }
  }

  &::after {
    content: '';
    position: fixed;
    bottom: -10%;
    left: -5%;
    width: 400px;
    height: 400px;
    background: radial-gradient(
      circle,
      ${({ theme }) => theme.colors.secondary}06 0%,
      transparent 70%
    );
    pointer-events: none;
    z-index: 0;
  }
`;

const PageContent = styled.div`
  position: relative;
  z-index: 1;
`;

interface CategoryInfo {
  id?: string;
  name: string;
  icon: string;
  color: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: 'expense' | 'savings';
  payment_method: string;
  category: CategoryInfo;
}

interface ExpenseRecord {
  id: string;
  description: string;
  amount: number;
  date: string;
  payment_method: string;
  category: CategoryInfo | null;
}

interface ContributionRecord {
  id: string;
  amount: number;
  date: string;
  note: string | null;
  goal: { id: string; name: string; icon: string; color: string } | null;
}

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
  ${staggeredAnimation(0)}

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;

    a {
      width: 100%;
    }

    button {
      width: 100%;
    }
  }
`;

const PageTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  h1 {
    font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.text};

    @media (max-width: 480px) {
      font-size: ${({ theme }) => theme.typography.fontSize.xl};
    }
  }
`;

const PageTitleIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: ${({ theme }) => theme.gradients.primary};
  color: white;
  flex-shrink: 0;

  @media (max-width: 480px) {
    width: 36px;
    height: 36px;
  }
`;

const FiltersContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  ${staggeredAnimation(1)}
`;

const DateFilterBar = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  align-items: center;
  flex-wrap: wrap;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.glass.background};
  backdrop-filter: ${({ theme }) => theme.glass.blur};
  -webkit-backdrop-filter: ${({ theme }) => theme.glass.blur};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.md};
    border-color: ${({ theme }) => theme.colors.borderDark};
  }

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
    padding: ${({ theme }) => theme.spacing.md};
  }
`;

const FilterLabel = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.surfaceHover};
  border-radius: ${({ theme }) => theme.borderRadius.md};

  svg {
    color: ${({ theme }) => theme.colors.primary};
  }

  @media (max-width: 640px) {
    justify-content: center;
  }
`;

const FilterSelect = styled.div`
  min-width: 140px;

  @media (max-width: 640px) {
    width: 100%;
  }
`;

const FiltersBar = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  flex-wrap: wrap;

  > * {
    flex: 1;
    min-width: 200px;
    max-width: 300px;
  }

  @media (max-width: 480px) {
    flex-direction: column;

    > * {
      max-width: none;
      min-width: 0;
    }
  }
`;

const TotalSummary = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.glass.background};
  backdrop-filter: ${({ theme }) => theme.glass.blur};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  ${staggeredAnimation(2)}

  @media (max-width: 480px) {
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.sm};
    text-align: center;
  }
`;

const SummaryLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const SummaryValue = styled.span<{ $variant?: 'expense' | 'savings' }>`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme, $variant }) => $variant === 'savings' ? theme.colors.success : theme.colors.error};
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const SummaryIcon = styled.span<{ $variant?: 'expense' | 'savings' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${({ theme, $variant }) =>
    $variant === 'savings' ? theme.colors.successLight : theme.colors.errorLight};

  svg {
    width: 14px;
    height: 14px;
  }
`;

const Table = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  overflow: hidden;
  position: relative;
  ${staggeredAnimation(3)}

  /* Gradient accent at top */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${({ theme }) => theme.gradients.primary};
    opacity: 0.6;
  }
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 150px 120px 120px 100px;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.glass.background};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.03em;

  @media (max-width: 768px) {
    display: none;
  }
`;

const TableRow = styled.div<{ $index?: number }>`
  display: grid;
  grid-template-columns: 1fr 150px 120px 120px 100px;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  align-items: center;
  transition: all 0.2s ease;
  position: relative;
  opacity: 0;
  animation: ${fadeInUp} 0.4s ease forwards;
  animation-delay: ${({ $index }) => 0.4 + ($index || 0) * 0.05}s;

  &:last-child {
    border-bottom: none;
  }

  /* Hover highlight */
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

    &::before {
      transform: scaleY(1);
    }
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr auto;
    gap: ${({ theme }) => theme.spacing.sm};
    padding: ${({ theme }) => theme.spacing.md};
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

const ExpenseInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
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
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px ${({ $color }) => `${$color}15`};

  ${TableRow}:hover & {
    transform: scale(1.1) rotate(5deg);
    box-shadow: 0 4px 12px ${({ $color }) => `${$color}25`};
  }

  @media (max-width: 480px) {
    width: 40px;
    height: 40px;
  }
`;

const ExpenseDetails = styled.div`
  min-width: 0;
  flex: 1;

  p:first-child {
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    color: ${({ theme }) => theme.colors.text};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  p:last-child {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const Amount = styled.span<{ $isPositive?: boolean }>`
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme, $isPositive }) => $isPositive ? theme.colors.success : theme.colors.error};

  @media (max-width: 480px) {
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
  }
`;

const MobileRowFooter = styled.div`
  display: none;

  @media (max-width: 480px) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding-top: ${({ theme }) => theme.spacing.sm};
    border-top: 1px dashed ${({ theme }) => theme.colors.border};
    margin-top: ${({ theme }) => theme.spacing.sm};
  }
`;

const MobileDate = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const MobileHidden = styled.span`
  @media (max-width: 768px) {
    display: none;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const DesktopActions = styled(Actions)`
  @media (max-width: 480px) {
    display: none;
  }
`;

const IconButton = styled.button`
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
    color: ${({ theme }) => theme.colors.primary};
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }

  &.danger:hover {
    background: ${({ theme }) => theme.colors.errorLight};
    color: ${({ theme }) => theme.colors.error};
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-top: 1px solid ${({ theme }) => theme.colors.border};

  @media (max-width: 480px) {
    padding: ${({ theme }) => theme.spacing.md};
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

const PageInfo = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const PageButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const EmptyState = styled.div`
  padding: ${({ theme }) => theme.spacing['2xl']};
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};

  p {
    max-width: 400px;
    line-height: 1.6;
  }
`;

const EmptyStateIcon = styled.div`
  width: 72px;
  height: 72px;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.gradients.primary};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;

  svg {
    width: 36px;
    height: 36px;
  }
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing['2xl']};

  p {
    color: ${({ theme }) => theme.colors.error};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }
`;

const ModalContent = styled.div`
  p {
    color: ${({ theme }) => theme.colors.textSecondary};
    margin-bottom: ${({ theme }) => theme.spacing.lg};
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  justify-content: flex-end;
`;

const MONTHS = [
  { value: 'all', label: 'All Time' },
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

const TRANSACTION_TYPES = [
  { value: 'all', label: 'All Transactions' },
  { value: 'expenses', label: 'Expenses Only' },
  { value: 'savings', label: 'Savings Only' },
];

export default function ExpensesPage() {
  const { user } = useAuth();
  const { formatCurrency } = useCurrency();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [transactionType, setTransactionType] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalSavings, setTotalSavings] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'expense' | 'savings' } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const limit = 10;

  // Generate year options (last 5 years)
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => ({
      value: (currentYear - i).toString(),
      label: (currentYear - i).toString(),
    }));
  }, []);

  // Get display text for the period
  const getPeriodText = () => {
    if (selectedMonth === 'all') {
      return 'All Time';
    }
    const monthName = MONTHS.find((m) => m.value === selectedMonth)?.label;
    return `${monthName} ${selectedYear}`;
  };

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
  }, [user, page, categoryFilter, selectedMonth, selectedYear, transactionType]);

  const fetchCategories = async () => {
    if (!user) return;
    const supabase = getSupabaseClient();
    const { data } = await supabase
      .from('categories')
      .select('*')
      .or(`user_id.eq.${user.id},and(user_id.is.null,is_default.eq.true)`)
      .eq('type', 'expense');
    setCategories(data || []);
  };

  const fetchTransactions = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);
    const supabase = getSupabaseClient();

    try {

    // Build date range based on selection
    let startDate: string | null = null;
    let endDate: string | null = null;

    if (selectedMonth !== 'all') {
      const month = parseInt(selectedMonth);
      const year = parseInt(selectedYear);
      startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
      endDate = new Date(year, month, 0).toISOString().split('T')[0];
    }

    let allTransactions: Transaction[] = [];
    let expensesTotal = 0;
    let savingsTotal = 0;

    // Fetch expenses if needed
    if (transactionType === 'all' || transactionType === 'expenses') {
      let expenseQuery = supabase
        .from('expenses')
        .select('*, category:categories(id, name, icon, color)')
        .eq('user_id', user.id);

      if (startDate && endDate) {
        expenseQuery = expenseQuery.gte('date', startDate).lte('date', endDate);
      }
      if (categoryFilter) {
        expenseQuery = expenseQuery.eq('category_id', categoryFilter);
      }
      if (searchTerm) {
        expenseQuery = expenseQuery.ilike('description', `%${searchTerm}%`);
      }

      const { data: expenses } = await expenseQuery;

      const formattedExpenses = (expenses || []).map((e: ExpenseRecord): Transaction => ({
        id: e.id,
        description: e.description,
        amount: -e.amount,
        date: e.date,
        type: 'expense' as const,
        payment_method: e.payment_method,
        category: e.category || { name: 'Other', icon: '📦', color: '#6b7280' },
      }));

      allTransactions = [...allTransactions, ...formattedExpenses];
      expensesTotal = expenses?.reduce((sum: number, e: ExpenseRecord) => sum + e.amount, 0) || 0;
    }

    // Fetch contributions if needed
    if (transactionType === 'all' || transactionType === 'savings') {
      let contributionsQuery = supabase
        .from('goal_contributions')
        .select('*, goal:goals(id, name, icon, color)')
        .eq('user_id', user.id);

      if (startDate && endDate) {
        contributionsQuery = contributionsQuery.gte('date', startDate).lte('date', endDate);
      }
      if (searchTerm) {
        contributionsQuery = contributionsQuery.ilike('note', `%${searchTerm}%`);
      }

      const { data: contributions } = await contributionsQuery;

      const formattedContributions = (contributions || []).map((c: ContributionRecord): Transaction => ({
        id: c.id,
        description: c.note || `Saved to ${c.goal?.name || 'Goal'}`,
        amount: c.amount,
        date: c.date,
        type: 'savings' as const,
        payment_method: 'Savings',
        category: {
          name: c.goal?.name || 'Savings',
          icon: c.goal?.icon || '🎯',
          color: c.goal?.color || '#10b981',
        },
      }));

      allTransactions = [...allTransactions, ...formattedContributions];
      savingsTotal = contributions?.reduce((sum: number, c: ContributionRecord) => sum + c.amount, 0) || 0;
    }

    // Sort by date descending
    allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Paginate
    const totalItems = allTransactions.length;
    const paginatedTransactions = allTransactions.slice((page - 1) * limit, page * limit);

    setTransactions(paginatedTransactions);
    setTotalPages(Math.ceil(totalItems / limit));
    setTotalExpenses(expensesTotal);
    setTotalSavings(savingsTotal);
    setTotalCount(totalItems);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load transactions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchTransactions();
  };

  const handleMonthChange = (value: string) => {
    setSelectedMonth(value);
    setPage(1);
  };

  const handleYearChange = (value: string) => {
    setSelectedYear(value);
    setPage(1);
  };

  const handleTypeChange = (value: string) => {
    setTransactionType(value);
    setPage(1);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    const supabase = getSupabaseClient();

    const tableName = itemToDelete.type === 'expense' ? 'expenses' : 'goal_contributions';
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', itemToDelete.id);

    if (error) {
      toast.error(`Failed to delete ${itemToDelete.type}`);
    } else {
      toast.success(`${itemToDelete.type === 'expense' ? 'Expense' : 'Contribution'} deleted successfully`);
      fetchTransactions();
    }

    setIsDeleting(false);
    setDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const openDeleteModal = (id: string, type: 'expense' | 'savings') => {
    setItemToDelete({ id, type });
    setDeleteModalOpen(true);
  };

  if (isLoading && transactions.length === 0) {
    return (
      <PageWrapper>
        <PageContent>
          <PageHeader>
            <PageTitle>
              <PageTitleIcon><Receipt size={20} /></PageTitleIcon>
              <h1>Transactions</h1>
            </PageTitle>
          </PageHeader>
          <SkeletonTable rows={8} />
        </PageContent>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <PageContent>
          <PageHeader>
            <PageTitle>
              <PageTitleIcon><Receipt size={20} /></PageTitleIcon>
              <h1>Transactions</h1>
            </PageTitle>
          </PageHeader>
          <ErrorContainer>
            <p>{error}</p>
            <Button onClick={() => fetchTransactions()}>Retry</Button>
          </ErrorContainer>
        </PageContent>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <PageContent>
      <PageHeader>
        <PageTitle>
          <PageTitleIcon><Receipt size={20} /></PageTitleIcon>
          <h1>Transactions</h1>
        </PageTitle>
        <Link href="/expenses/add">
          <Button leftIcon={<Plus size={18} />}>Add Expense</Button>
        </Link>
      </PageHeader>

      <FiltersContainer>
        <DateFilterBar>
          <FilterLabel>
            <Calendar size={16} />
            Period:
          </FilterLabel>
          <FilterSelect>
            <Select
              options={MONTHS}
              value={selectedMonth}
              onChange={(e) => handleMonthChange(e.target.value)}
            />
          </FilterSelect>
          {selectedMonth !== 'all' && (
            <FilterSelect>
              <Select
                options={yearOptions}
                value={selectedYear}
                onChange={(e) => handleYearChange(e.target.value)}
              />
            </FilterSelect>
          )}
          <FilterSelect>
            <Select
              options={TRANSACTION_TYPES}
              value={transactionType}
              onChange={(e) => handleTypeChange(e.target.value)}
            />
          </FilterSelect>
        </DateFilterBar>

        <FiltersBar>
          <Input
            placeholder="Search transactions..."
            leftIcon={<Search size={18} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          {transactionType !== 'savings' && (
            <Select
              placeholder="All Categories"
              options={[
                { value: '', label: 'All Categories' },
                ...categories.map((c) => ({ value: c.id, label: c.name })),
              ]}
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
            />
          )}
        </FiltersBar>
      </FiltersContainer>

      <TotalSummary>
        <div>
          <SummaryLabel>
            {getPeriodText()} • {totalCount} transaction{totalCount !== 1 ? 's' : ''}
          </SummaryLabel>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          {(transactionType === 'all' || transactionType === 'expenses') && (
            <div>
              <SummaryLabel>Spent: </SummaryLabel>
              <SummaryValue>
                <SummaryIcon>
                  <TrendingDown size={14} />
                </SummaryIcon>
                {formatCurrency(totalExpenses)}
              </SummaryValue>
            </div>
          )}
          {(transactionType === 'all' || transactionType === 'savings') && (
            <div>
              <SummaryLabel>Saved: </SummaryLabel>
              <SummaryValue $variant="savings">
                <SummaryIcon $variant="savings">
                  <TrendingUp size={14} />
                </SummaryIcon>
                {formatCurrency(totalSavings)}
              </SummaryValue>
            </div>
          )}
        </div>
      </TotalSummary>

      <Table>
        <TableHeader>
          <span>Description</span>
          <span>Category</span>
          <span>Date</span>
          <span>Amount</span>
          <span>Actions</span>
        </TableHeader>

        {transactions.length === 0 ? (
          <EmptyState>
            <EmptyStateIcon>
              <Receipt />
            </EmptyStateIcon>
            <p>No transactions found for {getPeriodText().toLowerCase()}.</p>
            <Link href="/expenses/add">
              <Button leftIcon={<Plus size={18} />}>Add Expense</Button>
            </Link>
          </EmptyState>
        ) : (
          transactions.map((transaction, index) => {
            const isPositive = transaction.amount > 0;
            const displayAmount = Math.abs(transaction.amount);
            return (
              <TableRow key={`${transaction.type}-${transaction.id}`} $index={index}>
                <ExpenseInfo>
                  <CategoryIcon $color={transaction.category?.color || '#6b7280'}>
                    {transaction.category?.icon || '📦'}
                  </CategoryIcon>
                  <ExpenseDetails>
                    <p>{transaction.description}</p>
                    <p>{transaction.category?.name || 'Other'} • {transaction.payment_method}</p>
                  </ExpenseDetails>
                </ExpenseInfo>
                <MobileHidden>{transaction.category?.name || 'Other'}</MobileHidden>
                <MobileHidden>{formatDate(transaction.date)}</MobileHidden>
                <Amount $isPositive={isPositive}>
                  {isPositive ? '+' : '-'}{formatCurrency(displayAmount)}
                </Amount>
                <DesktopActions>
                  {transaction.type === 'expense' && (
                    <Link href={`/expenses/${transaction.id}`}>
                      <IconButton title="Edit" aria-label="Edit transaction">
                        <Edit size={18} />
                      </IconButton>
                    </Link>
                  )}
                  <IconButton
                    className="danger"
                    title="Delete"
                    aria-label="Delete transaction"
                    onClick={() => openDeleteModal(transaction.id, transaction.type)}
                  >
                    <Trash2 size={18} />
                  </IconButton>
                </DesktopActions>
                <MobileRowFooter>
                  <MobileDate>{formatDate(transaction.date)}</MobileDate>
                  <Actions>
                    {transaction.type === 'expense' && (
                      <Link href={`/expenses/${transaction.id}`}>
                        <IconButton title="Edit" aria-label="Edit transaction">
                          <Edit size={18} />
                        </IconButton>
                      </Link>
                    )}
                    <IconButton
                      className="danger"
                      title="Delete"
                      aria-label="Delete transaction"
                      onClick={() => openDeleteModal(transaction.id, transaction.type)}
                    >
                      <Trash2 size={18} />
                    </IconButton>
                  </Actions>
                </MobileRowFooter>
              </TableRow>
            );
          })
        )}

        {transactions.length > 0 && (
          <Pagination>
            <PageInfo>
              Page {page} of {totalPages}
            </PageInfo>
            <PageButtons>
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </Button>
            </PageButtons>
          </Pagination>
        )}
      </Table>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title={`Delete ${itemToDelete?.type === 'savings' ? 'Contribution' : 'Expense'}`}
        size="sm"
      >
        <ModalContent>
          <p>Are you sure you want to delete this {itemToDelete?.type === 'savings' ? 'contribution' : 'expense'}? This action cannot be undone.</p>
          <ModalActions>
            <Button variant="ghost" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} isLoading={isDeleting}>
              Delete
            </Button>
          </ModalActions>
        </ModalContent>
      </Modal>
      </PageContent>
    </PageWrapper>
  );
}
