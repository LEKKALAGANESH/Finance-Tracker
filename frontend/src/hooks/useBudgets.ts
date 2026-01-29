import { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import type { Budget } from '@/types/budget';

interface BudgetWithSpent extends Budget {
  spent: number;
  percentage: number;
  isOver: boolean;
  isNearLimit: boolean;
}

interface UseBudgetsReturn {
  budgets: BudgetWithSpent[];
  isLoading: boolean;
  error: string | null;
  fetchBudgets: () => Promise<void>;
  createBudget: (data: Omit<Budget, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  updateBudget: (id: string, data: Partial<Budget>) => Promise<boolean>;
  deleteBudget: (id: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function useBudgets(): UseBudgetsReturn {
  const { user } = useAuth();
  const toast = useToast();
  const [budgets, setBudgets] = useState<BudgetWithSpent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBudgets = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseClient();

      // Fetch budgets with category info
      const { data: budgetsData, error: fetchError } = await supabase
        .from('budgets')
        .select('*, category:categories(id, name, icon, color)')
        .eq('user_id', user.id);

      if (fetchError) throw fetchError;

      // Calculate spent for each budget (current month)
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split('T')[0];
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        .toISOString()
        .split('T')[0];

      type BudgetRow = Budget & { category?: { id: string; name: string; icon: string; color: string } };

      const budgetsWithSpent = await Promise.all(
        (budgetsData || []).map(async (budget: BudgetRow) => {
          let query = supabase
            .from('expenses')
            .select('amount')
            .eq('user_id', user.id)
            .gte('date', startOfMonth)
            .lte('date', endOfMonth);

          if (budget.category_id) {
            query = query.eq('category_id', budget.category_id);
          }

          const { data: expenses } = await query;
          const spent = expenses?.reduce((sum: number, e: { amount: number }) => sum + e.amount, 0) || 0;
          const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

          return {
            ...budget,
            spent,
            percentage,
            isOver: percentage > 100,
            isNearLimit: percentage >= budget.alert_threshold && percentage <= 100,
          };
        })
      );

      setBudgets(budgetsWithSpent);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch budgets');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const createBudget = useCallback(
    async (data: Omit<Budget, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
      if (!user) return false;

      try {
        const supabase = getSupabaseClient();
        const { error: insertError } = await supabase.from('budgets').insert({
          ...data,
          user_id: user.id,
        });

        if (insertError) throw insertError;

        toast.success('Budget created successfully!');
        await fetchBudgets();
        return true;
      } catch (err: any) {
        toast.error(err.message || 'Failed to create budget');
        return false;
      }
    },
    [user, toast, fetchBudgets]
  );

  const updateBudget = useCallback(
    async (id: string, data: Partial<Budget>): Promise<boolean> => {
      if (!user) return false;

      try {
        const supabase = getSupabaseClient();
        const { error: updateError } = await supabase
          .from('budgets')
          .update(data)
          .eq('id', id)
          .eq('user_id', user.id);

        if (updateError) throw updateError;

        toast.success('Budget updated successfully!');
        await fetchBudgets();
        return true;
      } catch (err: any) {
        toast.error(err.message || 'Failed to update budget');
        return false;
      }
    },
    [user, toast, fetchBudgets]
  );

  const deleteBudget = useCallback(
    async (id: string): Promise<boolean> => {
      if (!user) return false;

      try {
        const supabase = getSupabaseClient();
        const { error: deleteError } = await supabase
          .from('budgets')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (deleteError) throw deleteError;

        toast.success('Budget deleted successfully!');
        await fetchBudgets();
        return true;
      } catch (err: any) {
        toast.error(err.message || 'Failed to delete budget');
        return false;
      }
    },
    [user, toast, fetchBudgets]
  );

  useEffect(() => {
    if (user) {
      fetchBudgets();
    }
  }, [user, fetchBudgets]);

  return {
    budgets,
    isLoading,
    error,
    fetchBudgets,
    createBudget,
    updateBudget,
    deleteBudget,
    refetch: fetchBudgets,
  };
}

export default useBudgets;
