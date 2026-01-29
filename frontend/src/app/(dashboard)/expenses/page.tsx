'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { Plus, Search, Trash2, Edit, ChevronLeft, ChevronRight } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { getSupabaseClient } from '@/lib/supabase/client';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Loader } from '@/components/ui/Loader';
import { Modal } from '@/components/ui/Modal';

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};

  h1 {
    font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.text};

    @media (max-width: 480px) {
      font-size: ${({ theme }) => theme.typography.fontSize.xl};
    }
  }

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

const FiltersBar = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
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

const Table = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 150px 120px 100px 100px;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.surfaceHover};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};

  @media (max-width: 768px) {
    display: none;
  }
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 150px 120px 100px 100px;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  align-items: center;
  transition: background 0.15s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
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
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ $color }) => `${$color}15`};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
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

const Amount = styled.span`
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.error};

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
  padding: ${({ theme }) => theme.spacing.xs};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  transition: all 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
    color: ${({ theme }) => theme.colors.text};
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

  p {
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

export default function ExpensesPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const limit = 10;

  useEffect(() => {
    fetchExpenses();
    fetchCategories();
  }, [user, page, categoryFilter]);

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

  const fetchExpenses = async () => {
    if (!user) return;

    setIsLoading(true);
    const supabase = getSupabaseClient();

    let query = supabase
      .from('expenses')
      .select('*, category:categories(id, name, icon, color)', { count: 'exact' })
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (categoryFilter) {
      query = query.eq('category_id', categoryFilter);
    }

    if (searchTerm) {
      query = query.ilike('description', `%${searchTerm}%`);
    }

    const { data, count } = await query.range(
      (page - 1) * limit,
      page * limit - 1
    );

    setExpenses(data || []);
    setTotalPages(Math.ceil((count || 0) / limit));
    setIsLoading(false);
  };

  const handleSearch = () => {
    setPage(1);
    fetchExpenses();
  };

  const handleDelete = async () => {
    if (!expenseToDelete) return;

    setIsDeleting(true);
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseToDelete);

    if (error) {
      toast.error('Failed to delete expense');
    } else {
      toast.success('Expense deleted successfully');
      fetchExpenses();
    }

    setIsDeleting(false);
    setDeleteModalOpen(false);
    setExpenseToDelete(null);
  };

  const openDeleteModal = (id: string) => {
    setExpenseToDelete(id);
    setDeleteModalOpen(true);
  };

  if (isLoading && expenses.length === 0) {
    return <Loader fullScreen text="Loading expenses..." />;
  }

  return (
    <>
      <PageHeader>
        <h1>Expenses</h1>
        <Link href="/expenses/add">
          <Button leftIcon={<Plus size={18} />}>Add Expense</Button>
        </Link>
      </PageHeader>

      <FiltersBar>
        <Input
          placeholder="Search expenses..."
          leftIcon={<Search size={18} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
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
      </FiltersBar>

      <Table>
        <TableHeader>
          <span>Description</span>
          <span>Category</span>
          <span>Date</span>
          <span>Amount</span>
          <span>Actions</span>
        </TableHeader>

        {expenses.length === 0 ? (
          <EmptyState>
            <p>No expenses found. Start tracking your spending!</p>
            <Link href="/expenses/add">
              <Button leftIcon={<Plus size={18} />}>Add Your First Expense</Button>
            </Link>
          </EmptyState>
        ) : (
          expenses.map((expense) => (
            <TableRow key={expense.id}>
              <ExpenseInfo>
                <CategoryIcon $color={expense.category?.color || '#6b7280'}>
                  {expense.category?.icon || '📦'}
                </CategoryIcon>
                <ExpenseDetails>
                  <p>{expense.description}</p>
                  <p>{expense.category?.name || 'Other'} • {expense.payment_method}</p>
                </ExpenseDetails>
              </ExpenseInfo>
              <MobileHidden>{expense.category?.name || 'Other'}</MobileHidden>
              <MobileHidden>{formatDate(expense.date)}</MobileHidden>
              <Amount>-{formatCurrency(expense.amount)}</Amount>
              <DesktopActions>
                <Link href={`/expenses/${expense.id}`}>
                  <IconButton title="Edit">
                    <Edit size={18} />
                  </IconButton>
                </Link>
                <IconButton
                  className="danger"
                  title="Delete"
                  onClick={() => openDeleteModal(expense.id)}
                >
                  <Trash2 size={18} />
                </IconButton>
              </DesktopActions>
              <MobileRowFooter>
                <MobileDate>{formatDate(expense.date)}</MobileDate>
                <Actions>
                  <Link href={`/expenses/${expense.id}`}>
                    <IconButton title="Edit">
                      <Edit size={18} />
                    </IconButton>
                  </Link>
                  <IconButton
                    className="danger"
                    title="Delete"
                    onClick={() => openDeleteModal(expense.id)}
                  >
                    <Trash2 size={18} />
                  </IconButton>
                </Actions>
              </MobileRowFooter>
            </TableRow>
          ))
        )}

        {expenses.length > 0 && (
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
              >
                <ChevronLeft size={16} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
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
        title="Delete Expense"
        size="sm"
      >
        <ModalContent>
          <p>Are you sure you want to delete this expense? This action cannot be undone.</p>
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
    </>
  );
}
