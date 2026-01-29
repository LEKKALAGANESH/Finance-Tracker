'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';

import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { getSupabaseClient } from '@/lib/supabase/client';
import { expenseSchema, ExpenseFormData, CategoryFormData } from '@/lib/validations';
import { PAYMENT_METHODS } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card';
import { CategoryModal } from '@/components/categories/CategoryModal';

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const BackLink = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  transition: all 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text};
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const FormField = styled.div<{ $fullWidth?: boolean }>`
  ${({ $fullWidth }) => $fullWidth && 'grid-column: 1 / -1;'}
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

const CategoryOption = styled.button<{ $isSelected: boolean; $color: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 2px solid ${({ $isSelected, $color }) => ($isSelected ? $color : 'transparent')};
  background: ${({ theme, $isSelected }) =>
    $isSelected ? theme.colors.surfaceHover : theme.colors.surface};
  transition: all 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
  }

  span:first-child {
    font-size: 1.5rem;
  }

  span:last-child {
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    color: ${({ theme }) => theme.colors.textSecondary};
    text-align: center;
  }
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text};
  display: block;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const ErrorText = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.error};
  margin-top: ${({ theme }) => theme.spacing.xs};
  display: block;
`;

const CategoryEmptyState = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px dashed ${({ theme }) => theme.colors.border};
`;

const AddCategoryButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 2px dashed ${({ theme }) => theme.colors.border};
  background: transparent;
  transition: all 0.2s ease;
  min-height: 80px;
  cursor: pointer;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.primaryLight};

    svg, span {
      color: ${({ theme }) => theme.colors.primary};
    }
  }

  svg {
    color: ${({ theme }) => theme.colors.textMuted};
    transition: color 0.2s ease;
  }

  span {
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    color: ${({ theme }) => theme.colors.textMuted};
    transition: color 0.2s ease;
  }
`;

const LabelRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const ManageLink = styled.button`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.primary};
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;

  &:hover {
    text-decoration: underline;
  }
`;

const CategoryLoadingState = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

const CategorySkeleton = styled.div`
  height: 80px;
  background: ${({ theme }) => theme.colors.surfaceHover};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  animation: pulse 1.5s ease-in-out infinite;

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

export default function AddExpensePage() {
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      payment_method: 'cash',
    },
  });

  const fetchCategories = async () => {
    if (!user) return;
    setCategoriesLoading(true);
    const supabase = getSupabaseClient();
    const { data } = await supabase
      .from('categories')
      .select('*')
      .or(`user_id.eq.${user.id},and(user_id.is.null,is_default.eq.true)`)
      .eq('type', 'expense')
      .order('name');
    setCategories(data || []);
    setCategoriesLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, [user]);

  const handleCreateCategory = async (data: CategoryFormData) => {
    if (!user) return;

    const supabase = getSupabaseClient();
    const { data: newCategory, error } = await supabase
      .from('categories')
      .insert({
        user_id: user.id,
        name: data.name,
        icon: data.icon,
        color: data.color,
        type: data.type,
        is_default: false,
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to create category');
      throw error;
    }

    toast.success('Category created!');
    await fetchCategories();

    // Auto-select the newly created category
    if (newCategory) {
      setSelectedCategory(newCategory.id);
      setValue('category_id', newCategory.id);
    }
  };

  const onSubmit = async (data: ExpenseFormData) => {
    if (!user) return;

    setIsLoading(true);
    const supabase = getSupabaseClient();

    const { error } = await supabase.from('expenses').insert({
      user_id: user.id,
      category_id: data.category_id,
      amount: data.amount,
      description: data.description,
      date: data.date,
      payment_method: data.payment_method,
    });

    if (error) {
      toast.error('Failed to add expense');
      setIsLoading(false);
      return;
    }

    toast.success('Expense added successfully!');
    router.push('/expenses');
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setValue('category_id', categoryId);
  };

  return (
    <>
      <PageHeader>
        <BackLink href="/expenses">
          <ArrowLeft size={20} />
        </BackLink>
        <Title>Add Expense</Title>
      </PageHeader>

      <Card>
        <CardHeader title="Expense Details" subtitle="Enter the details of your expense" />
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardBody>
            <FormGrid>
              <FormField $fullWidth>
                <LabelRow>
                  <Label>Category</Label>
                  <ManageLink
                    type="button"
                    onClick={() => router.push('/settings?tab=categories')}
                  >
                    Manage Categories
                  </ManageLink>
                </LabelRow>
                {categoriesLoading ? (
                  <CategoryLoadingState>
                    {[...Array(6)].map((_, i) => (
                      <CategorySkeleton key={i} />
                    ))}
                  </CategoryLoadingState>
                ) : (
                  <CategoryGrid>
                    {categories.map((category) => (
                      <CategoryOption
                        key={category.id}
                        type="button"
                        $isSelected={selectedCategory === category.id}
                        $color={category.color}
                        onClick={() => handleCategorySelect(category.id)}
                      >
                        <span>{category.icon}</span>
                        <span>{category.name}</span>
                      </CategoryOption>
                    ))}
                    <AddCategoryButton
                      type="button"
                      onClick={() => setIsCategoryModalOpen(true)}
                    >
                      <Plus size={24} />
                      <span>Add New</span>
                    </AddCategoryButton>
                  </CategoryGrid>
                )}
                {errors.category_id && (
                  <ErrorText>{errors.category_id.message}</ErrorText>
                )}
              </FormField>

              <FormField>
                <Input
                  label="Amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  error={errors.amount?.message}
                  fullWidth
                  {...register('amount', { valueAsNumber: true })}
                />
              </FormField>

              <FormField>
                <Input
                  label="Date"
                  type="date"
                  error={errors.date?.message}
                  fullWidth
                  {...register('date')}
                />
              </FormField>

              <FormField $fullWidth>
                <Input
                  label="Description"
                  placeholder="What did you spend on?"
                  error={errors.description?.message}
                  fullWidth
                  {...register('description')}
                />
              </FormField>

              <FormField>
                <Select
                  label="Payment Method"
                  options={PAYMENT_METHODS.map((m) => ({
                    value: m.value,
                    label: `${m.icon} ${m.label}`,
                  }))}
                  error={errors.payment_method?.message}
                  fullWidth
                  {...register('payment_method')}
                />
              </FormField>
            </FormGrid>
          </CardBody>
          <CardFooter>
            <Button variant="ghost" type="button" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              Add Expense
            </Button>
          </CardFooter>
        </form>
      </Card>

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSave={handleCreateCategory}
        type="expense"
      />
    </>
  );
}
