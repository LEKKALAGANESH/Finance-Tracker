"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import styled from "styled-components";

import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardFooter, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Loader } from "@/components/ui/Loader";
import { Select } from "@/components/ui/Select";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { PAYMENT_METHODS } from "@/lib/constants";
import { getSupabaseClient } from "@/lib/supabase/client";
import { ExpenseFormData, expenseSchema } from "@/lib/validations";

// ============================================================================
// TypeScript Interfaces
// ============================================================================

/**
 * Category entity from the database
 */
interface Category {
  id: string;
  user_id: string | null;
  name: string;
  icon: string;
  color: string;
  type: 'expense' | 'income';
  is_default: boolean;
  created_at?: string;
}

/**
 * Expense entity from the database
 */
interface Expense {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  description: string;
  date: string;
  payment_method: string;
  receipt_url?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Props for styled FormField component
 */
interface FormFieldProps {
  $fullWidth?: boolean;
}

/**
 * Props for styled CategoryOption component
 */
interface CategoryOptionProps {
  $isSelected: boolean;
  $color: string;
}

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
  font-size: ${({ theme }) => theme.typography.fontSize["2xl"]};
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
  ${({ $fullWidth }) => $fullWidth && "grid-column: 1 / -1;"}
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
  border: 2px solid
    ${({ $isSelected, $color }) => ($isSelected ? $color : "transparent")};
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

export default function EditExpensePage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !params.id) return;

      const supabase = getSupabaseClient();

      // Fetch categories
      const { data: categoriesData } = await supabase
        .from("categories")
        .select("*")
        .or(`user_id.eq.${user.id},and(user_id.is.null,is_default.eq.true)`)
        .eq("type", "expense")
        .order("name");
      setCategories(categoriesData || []);

      // Fetch expense
      const { data: expense, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("id", params.id)
        .eq("user_id", user.id)
        .single();

      if (error || !expense) {
        toast.error("Expense not found");
        router.push("/expenses");
        return;
      }

      // Set form values
      reset({
        category_id: expense.category_id,
        amount: expense.amount,
        description: expense.description,
        date: expense.date,
        payment_method: expense.payment_method,
      });
      setSelectedCategory(expense.category_id);
      setIsLoading(false);
    };

    fetchData();
  }, [user, params.id, reset, router, toast]);

  const onSubmit = async (data: ExpenseFormData) => {
    if (!user || !params.id) return;

    setIsSaving(true);
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from("expenses")
      .update({
        category_id: data.category_id,
        amount: data.amount,
        description: data.description,
        date: data.date,
        payment_method: data.payment_method,
      })
      .eq("id", params.id)
      .eq("user_id", user.id);

    if (error) {
      toast.error("Failed to update expense");
      setIsSaving(false);
      return;
    }

    toast.success("Expense updated successfully!");
    router.push("/expenses");
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setValue("category_id", categoryId);
  };

  if (isLoading) {
    return <Loader fullScreen text="Loading expense..." />;
  }

  return (
    <>
      <PageHeader>
        <BackLink href="/expenses">
          <ArrowLeft size={20} />
        </BackLink>
        <Title>Edit Expense</Title>
      </PageHeader>

      <Card>
        <CardHeader
          title="Expense Details"
          subtitle="Update the details of your expense"
        />
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardBody>
            <FormGrid>
              <FormField $fullWidth>
                <Label>Category</Label>
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
                </CategoryGrid>
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
                  {...register("amount", { valueAsNumber: true })}
                />
              </FormField>

              <FormField>
                <Input
                  label="Date"
                  type="date"
                  error={errors.date?.message}
                  fullWidth
                  {...register("date")}
                />
              </FormField>

              <FormField $fullWidth>
                <Input
                  label="Description"
                  placeholder="What did you spend on?"
                  error={errors.description?.message}
                  fullWidth
                  {...register("description")}
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
                  {...register("payment_method")}
                />
              </FormField>
            </FormGrid>
          </CardBody>
          <CardFooter>
            <Button variant="ghost" type="button" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSaving}>
              Save Changes
            </Button>
          </CardFooter>
        </form>
      </Card>
    </>
  );
}
