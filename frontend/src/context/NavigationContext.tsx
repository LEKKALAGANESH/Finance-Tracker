'use client';

import { createContext, useContext, useState, useCallback, useEffect, useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface NavigationContextType {
  isNavigating: boolean;
  isPageLoading: boolean;
  navigateTo: (href: string) => void;
  setPageLoading: (loading: boolean) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [targetPath, setTargetPath] = useState<string | null>(null);

  const navigateTo = useCallback((href: string) => {
    if (pathname === href) return;

    setIsNavigating(true);
    setIsPageLoading(true); // Assume page will load data
    setTargetPath(href);

    // Scroll to top immediately for instant feedback
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Use startTransition for smoother navigation
    startTransition(() => {
      router.push(href);
    });
  }, [pathname, router]);

  const setPageLoading = useCallback((loading: boolean) => {
    setIsPageLoading(loading);
  }, []);

  // Reset navigation state when pathname changes
  useEffect(() => {
    if (targetPath && pathname === targetPath) {
      // Navigation complete, but page might still be loading data
      setIsNavigating(false);
      setTargetPath(null);
    }
  }, [pathname, targetPath]);

  // Also track isPending from useTransition
  useEffect(() => {
    if (!isPending && isNavigating && !targetPath) {
      setIsNavigating(false);
    }
  }, [isPending, isNavigating, targetPath]);

  // Combined loading state
  const showLoading = isNavigating || isPending || isPageLoading;

  return (
    <NavigationContext.Provider value={{
      isNavigating: showLoading,
      isPageLoading,
      navigateTo,
      setPageLoading
    }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}

// Hook for pages to signal their loading state
export function usePageLoading(isLoading: boolean) {
  const { setPageLoading } = useNavigation();

  useEffect(() => {
    setPageLoading(isLoading);
  }, [isLoading, setPageLoading]);
}
