'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getSupabaseClient } from '@/lib/supabase/client';
import { CURRENCIES } from '@/lib/constants';

interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
}

interface CurrencyContextType {
  currency: CurrencyInfo;
  setCurrency: (code: string) => void;
  formatCurrency: (amount: number) => string;
  isLoading: boolean;
}

const defaultCurrency: CurrencyInfo = {
  code: 'USD',
  symbol: '$',
  name: 'US Dollar',
};

export const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [currency, setCurrencyState] = useState<CurrencyInfo>(defaultCurrency);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user's currency preference from profile
  useEffect(() => {
    const fetchCurrency = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      const supabase = getSupabaseClient();
      const { data } = await supabase
        .from('profiles')
        .select('currency')
        .eq('id', user.id)
        .single();

      if (data?.currency) {
        const currencyInfo = CURRENCIES.find(c => c.code === data.currency);
        if (currencyInfo) {
          setCurrencyState(currencyInfo);
        }
      }
      setIsLoading(false);
    };

    fetchCurrency();
  }, [user]);

  // Set currency and update profile
  const setCurrency = useCallback(async (code: string) => {
    const currencyInfo = CURRENCIES.find(c => c.code === code);
    if (!currencyInfo) return;

    setCurrencyState(currencyInfo);

    if (user) {
      const supabase = getSupabaseClient();
      await supabase
        .from('profiles')
        .update({ currency: code, updated_at: new Date().toISOString() })
        .eq('id', user.id);
    }
  }, [user]);

  // Format currency using user's preference
  const formatCurrency = useCallback((amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }, [currency.code]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatCurrency, isLoading }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
