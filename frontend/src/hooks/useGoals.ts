import { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import type { Goal } from '@/types/goal';

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return 'An unknown error occurred';
}

interface GoalWithProgress extends Goal {
  percentage: number;
  isCompleted: boolean;
  daysRemaining: number | null;
}

interface UseGoalsOptions {
  status?: 'active' | 'completed' | 'cancelled' | 'all';
  autoFetch?: boolean;
}

interface UseGoalsReturn {
  goals: GoalWithProgress[];
  isLoading: boolean;
  error: string | null;
  fetchGoals: () => Promise<void>;
  createGoal: (data: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  updateGoal: (id: string, data: Partial<Goal>) => Promise<boolean>;
  deleteGoal: (id: string) => Promise<boolean>;
  addContribution: (id: string, amount: number) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function useGoals(options: UseGoalsOptions = {}): UseGoalsReturn {
  const { status = 'active', autoFetch = true } = options;
  const { user } = useAuth();
  const toast = useToast();
  const [goals, setGoals] = useState<GoalWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateDaysRemaining = (deadline: string | null): number | null => {
    if (!deadline) return null;
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const fetchGoals = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseClient();
      let query = supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (status !== 'all') {
        query = query.eq('status', status);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      const goalsWithProgress = (data || []).map((goal: Goal) => {
        const percentage =
          goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
        return {
          ...goal,
          percentage: Math.min(percentage, 100),
          isCompleted: goal.status === 'completed' || percentage >= 100,
          daysRemaining: calculateDaysRemaining(goal.deadline),
        };
      });

      setGoals(goalsWithProgress);
    } catch (err: unknown) {
      setError(getErrorMessage(err) || 'Failed to fetch goals');
    } finally {
      setIsLoading(false);
    }
  }, [user, status]);

  const createGoal = useCallback(
    async (data: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
      if (!user) return false;

      try {
        const supabase = getSupabaseClient();
        const { error: insertError } = await supabase.from('goals').insert({
          ...data,
          user_id: user.id,
          current_amount: data.current_amount || 0,
          status: data.status || 'active',
        });

        if (insertError) throw insertError;

        toast.success('Goal created successfully!');
        await fetchGoals();
        return true;
      } catch (err: unknown) {
        toast.error(getErrorMessage(err) || 'Failed to create goal');
        return false;
      }
    },
    [user, toast, fetchGoals]
  );

  const updateGoal = useCallback(
    async (id: string, data: Partial<Goal>): Promise<boolean> => {
      if (!user) return false;

      try {
        const supabase = getSupabaseClient();
        const { error: updateError } = await supabase
          .from('goals')
          .update(data)
          .eq('id', id)
          .eq('user_id', user.id);

        if (updateError) throw updateError;

        toast.success('Goal updated successfully!');
        await fetchGoals();
        return true;
      } catch (err: unknown) {
        toast.error(getErrorMessage(err) || 'Failed to update goal');
        return false;
      }
    },
    [user, toast, fetchGoals]
  );

  const deleteGoal = useCallback(
    async (id: string): Promise<boolean> => {
      if (!user) return false;

      try {
        const supabase = getSupabaseClient();
        const { error: deleteError } = await supabase
          .from('goals')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (deleteError) throw deleteError;

        toast.success('Goal deleted successfully!');
        await fetchGoals();
        return true;
      } catch (err: unknown) {
        toast.error(getErrorMessage(err) || 'Failed to delete goal');
        return false;
      }
    },
    [user, toast, fetchGoals]
  );

  const addContribution = useCallback(
    async (id: string, amount: number): Promise<boolean> => {
      if (!user) return false;

      try {
        const supabase = getSupabaseClient();

        // Get current goal
        const { data: goal, error: fetchError } = await supabase
          .from('goals')
          .select('current_amount, target_amount')
          .eq('id', id)
          .eq('user_id', user.id)
          .single();

        if (fetchError) throw fetchError;

        const newAmount = (goal?.current_amount || 0) + amount;
        const isCompleted = newAmount >= (goal?.target_amount || 0);

        const { error: updateError } = await supabase
          .from('goals')
          .update({
            current_amount: newAmount,
            status: isCompleted ? 'completed' : 'active',
          })
          .eq('id', id)
          .eq('user_id', user.id);

        if (updateError) throw updateError;

        if (isCompleted) {
          toast.success('Congratulations! Goal completed!');
        } else {
          toast.success('Contribution added successfully!');
        }

        await fetchGoals();
        return true;
      } catch (err: unknown) {
        toast.error(getErrorMessage(err) || 'Failed to add contribution');
        return false;
      }
    },
    [user, toast, fetchGoals]
  );

  useEffect(() => {
    if (autoFetch && user) {
      fetchGoals();
    }
  }, [autoFetch, user, fetchGoals]);

  return {
    goals,
    isLoading,
    error,
    fetchGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    addContribution,
    refetch: fetchGoals,
  };
}

export default useGoals;
