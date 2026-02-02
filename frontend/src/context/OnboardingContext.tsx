'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';
import { useAuth } from '@/context/AuthContext';
import { getSupabaseClient } from '@/lib/supabase/client';

interface OnboardingData {
  monthlyIncome: number;
  currency: string;
  budgetTemplate: 'minimal' | 'standard' | 'detailed' | 'custom';
  selectedCategories: string[];
}

interface OnboardingContextType {
  isOnboardingComplete: boolean;
  isOnboardingOpen: boolean;
  currentStep: number;
  totalSteps: number;
  data: OnboardingData;
  isLoading: boolean;
  openOnboarding: () => void;
  closeOnboarding: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  updateData: (newData: Partial<OnboardingData>) => void;
  completeOnboarding: () => Promise<void>;
  skipOnboarding: () => Promise<void>;
}

const defaultData: OnboardingData = {
  monthlyIncome: 0,
  currency: 'USD',
  budgetTemplate: 'standard',
  selectedCategories: [],
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(true);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>(defaultData);
  const [isLoading, setIsLoading] = useState(true);
  const totalSteps = 4;

  // Check if user has completed onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Check localStorage first (fallback until migration is run)
      const localOnboardingComplete = localStorage.getItem(`onboarding_complete_${user.id}`);
      if (localOnboardingComplete === 'true') {
        setIsOnboardingComplete(true);
        setIsLoading(false);
        return;
      }

      const supabase = getSupabaseClient();

      try {
        // First try to get profile with onboarding_completed field
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('currency')
          .eq('id', user.id)
          .single();

        if (error) {
          // Profile might not exist yet - check if user is new
          console.log('Profile not found, assuming new user');
          setIsOnboardingComplete(false);
          setIsOnboardingOpen(true);
        } else if (profile) {
          if (profile.currency) {
            setData((prev) => ({ ...prev, currency: profile.currency }));
          }
          // If no local storage flag and we have a profile, show onboarding for first-time setup
          if (!localOnboardingComplete) {
            setIsOnboardingComplete(false);
            setIsOnboardingOpen(true);
          }
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        // Default to completed to avoid blocking users
        setIsOnboardingComplete(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [user]);

  const openOnboarding = useCallback(() => {
    setIsOnboardingOpen(true);
    setCurrentStep(0);
  }, []);

  const closeOnboarding = useCallback(() => {
    setIsOnboardingOpen(false);
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
  }, [totalSteps]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const goToStep = useCallback((step: number) => {
    setCurrentStep(Math.max(0, Math.min(step, totalSteps - 1)));
  }, [totalSteps]);

  const updateData = useCallback((newData: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...newData }));
  }, []);

  const completeOnboarding = useCallback(async () => {
    if (!user) return;

    const supabase = getSupabaseClient();
    setIsLoading(true);

    try {
      // Update profile with currency (onboarding_completed may not exist yet)
      await supabase
        .from('profiles')
        .update({
          currency: data.currency,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      // Create default budgets based on template
      if (data.budgetTemplate !== 'custom' && data.monthlyIncome > 0) {
        const budgets = getBudgetsFromTemplate(data.budgetTemplate, data.monthlyIncome, user.id);

        if (budgets.length > 0) {
          // Get categories first
          const { data: categories } = await supabase
            .from('categories')
            .select('id, name')
            .or(`user_id.eq.${user.id},is_default.eq.true`);

          const categoryMap = new Map(categories?.map((c: { id: string; name: string }) => [c.name, c.id]) || []);

          const budgetsWithCategoryIds = budgets
            .map((budget) => ({
              ...budget,
              category_id: categoryMap.get(budget.category_name) || null,
            }))
            .filter((b) => b.category_id)
            .map(({ category_name, ...rest }) => rest);

          if (budgetsWithCategoryIds.length > 0) {
            await supabase.from('budgets').insert(budgetsWithCategoryIds);
          }
        }
      }

      // Store in localStorage as fallback
      localStorage.setItem(`onboarding_complete_${user.id}`, 'true');

      setIsOnboardingComplete(true);
      setIsOnboardingOpen(false);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      // Still mark as complete locally even if DB update fails
      localStorage.setItem(`onboarding_complete_${user.id}`, 'true');
      setIsOnboardingComplete(true);
      setIsOnboardingOpen(false);
    } finally {
      setIsLoading(false);
    }
  }, [user, data]);

  const skipOnboarding = useCallback(async () => {
    if (!user) return;

    // Store in localStorage as fallback
    localStorage.setItem(`onboarding_complete_${user.id}`, 'true');

    setIsOnboardingComplete(true);
    setIsOnboardingOpen(false);
  }, [user]);

  return (
    <OnboardingContext.Provider
      value={{
        isOnboardingComplete,
        isOnboardingOpen,
        currentStep,
        totalSteps,
        data,
        isLoading,
        openOnboarding,
        closeOnboarding,
        nextStep,
        prevStep,
        goToStep,
        updateData,
        completeOnboarding,
        skipOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}

// Helper function to generate budgets from template
function getBudgetsFromTemplate(
  template: 'minimal' | 'standard' | 'detailed',
  monthlyIncome: number,
  userId: string
) {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

  const templates = {
    minimal: [
      { category_name: 'Food & Dining', percentage: 0.3 },
      { category_name: 'Transportation', percentage: 0.15 },
      { category_name: 'Bills & Utilities', percentage: 0.25 },
    ],
    standard: [
      { category_name: 'Food & Dining', percentage: 0.25 },
      { category_name: 'Transportation', percentage: 0.1 },
      { category_name: 'Bills & Utilities', percentage: 0.2 },
      { category_name: 'Shopping', percentage: 0.1 },
      { category_name: 'Entertainment', percentage: 0.1 },
      { category_name: 'Health', percentage: 0.05 },
    ],
    detailed: [
      { category_name: 'Food & Dining', percentage: 0.2 },
      { category_name: 'Transportation', percentage: 0.1 },
      { category_name: 'Bills & Utilities', percentage: 0.15 },
      { category_name: 'Shopping', percentage: 0.1 },
      { category_name: 'Entertainment', percentage: 0.08 },
      { category_name: 'Health', percentage: 0.05 },
      { category_name: 'Education', percentage: 0.05 },
      { category_name: 'Travel', percentage: 0.07 },
    ],
  };

  return templates[template].map((item) => ({
    user_id: userId,
    category_name: item.category_name,
    amount: Math.round(monthlyIncome * item.percentage),
    period: 'monthly' as const,
    start_date: startDate,
    alert_threshold: 80,
  }));
}
