import { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import type { Expense } from '@/types/expense';

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return 'An unknown error occurred';
}

interface UseExpensesOptions {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  limit?: number;
  autoFetch?: boolean;
}

interface UseExpensesReturn {
  expenses: Expense[];
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  fetchExpenses: () => Promise<void>;
  createExpense: (data: Omit<Expense, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  updateExpense: (id: string, data: Partial<Expense>) => Promise<boolean>;
  deleteExpense: (id: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function useExpenses(options: UseExpensesOptions = {}): UseExpensesReturn {
  const { startDate, endDate, categoryId, limit, autoFetch = true } = options;
  const { user } = useAuth();
  const toast = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchExpenses = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseClient();
      let query = supabase
        .from('expenses')
        .select('*, category:categories(id, name, icon, color)', { count: 'exact' })
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (startDate) {
        query = query.gte('date', startDate);
      }
      if (endDate) {
        query = query.lte('date', endDate);
      }
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }
      if (limit) {
        query = query.limit(limit);
      }

      const { data, error: fetchError, count } = await query;

      if (fetchError) throw fetchError;

      setExpenses(data || []);
      setTotalCount(count || 0);
    } catch (err: unknown) {
      setError(getErrorMessage(err) || 'Failed to fetch expenses');
    } finally {
      setIsLoading(false);
    }
  }, [user, startDate, endDate, categoryId, limit]);

  const createExpense = useCallback(
    async (data: Omit<Expense, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
      if (!user) return false;

      try {
        const supabase = getSupabaseClient();
        const { error: insertError } = await supabase.from('expenses').insert({
          ...data,
          user_id: user.id,
        });

        if (insertError) throw insertError;

        toast.success('Expense added successfully!');
        await fetchExpenses();
        return true;
      } catch (err: unknown) {
        toast.error(getErrorMessage(err) || 'Failed to create expense');
        return false;
      }
    },
    [user, toast, fetchExpenses]
  );

  const updateExpense = useCallback(
    async (id: string, data: Partial<Expense>): Promise<boolean> => {
      if (!user) return false;

      try {
        const supabase = getSupabaseClient();
        const { error: updateError } = await supabase
          .from('expenses')
          .update(data)
          .eq('id', id)
          .eq('user_id', user.id);

        if (updateError) throw updateError;

        toast.success('Expense updated successfully!');
        await fetchExpenses();
        return true;
      } catch (err: unknown) {
        toast.error(getErrorMessage(err) || 'Failed to update expense');
        return false;
      }
    },
    [user, toast, fetchExpenses]
  );

  const deleteExpense = useCallback(
    async (id: string): Promise<boolean> => {
      if (!user) return false;

      try {
        const supabase = getSupabaseClient();
        const { error: deleteError } = await supabase
          .from('expenses')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (deleteError) throw deleteError;

        toast.success('Expense deleted successfully!');
        await fetchExpenses();
        return true;
      } catch (err: unknown) {
        toast.error(getErrorMessage(err) || 'Failed to delete expense');
        return false;
      }
    },
    [user, toast, fetchExpenses]
  );

  useEffect(() => {
    if (autoFetch && user) {
      fetchExpenses();
    }
  }, [autoFetch, user, fetchExpenses]);

  return {
    expenses,
    isLoading,
    error,
    totalCount,
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    refetch: fetchExpenses,
  };
}

export default useExpenses;
