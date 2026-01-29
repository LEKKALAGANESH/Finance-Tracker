'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { lightTheme, darkTheme } from '@/styles/theme';

type ThemeMode = 'light' | 'dark';

export interface ThemeContextType {
  theme: ThemeMode;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Get initial theme synchronously to avoid flash
function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light';

  const savedTheme = localStorage.getItem('theme') as ThemeMode | null;
  if (savedTheme) return savedTheme;

  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(getInitialTheme);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  const themeObject = useMemo(
    () => (theme === 'light' ? lightTheme : darkTheme),
    [theme]
  );

  const contextValue = useMemo(
    () => ({ theme, isDark: theme === 'dark', toggleTheme, setTheme }),
    [theme]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <StyledThemeProvider theme={themeObject}>
        {children}
      </StyledThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
