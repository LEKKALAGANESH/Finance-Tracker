'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';
import {
  AuthErrorInfo,
  getAuthErrorInfo,
  getUserFriendlyErrorMessage,
  isProviderConfigError,
} from '@/lib/auth-errors';

const GOOGLE_AUTH_STORAGE_KEY = 'finance_tracker_google_auth_available';

export interface AuthResult {
  error: AuthError | null;
  errorInfo: AuthErrorInfo | null;
  friendlyMessage: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signInWithGoogle: () => Promise<AuthResult>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResult>;
  isGoogleAuthAvailable: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Helper to create an AuthResult from an error
 */
function createAuthResult(error: AuthError | null): AuthResult {
  if (!error) {
    return { error: null, errorInfo: null, friendlyMessage: null };
  }
  return {
    error,
    errorInfo: getAuthErrorInfo(error),
    friendlyMessage: getUserFriendlyErrorMessage(error),
  };
}

/**
 * Check if Google auth was previously detected as unavailable
 */
function getStoredGoogleAuthAvailability(): boolean {
  if (typeof window === 'undefined') return true;
  const stored = localStorage.getItem(GOOGLE_AUTH_STORAGE_KEY);
  return stored !== 'false';
}

/**
 * Store Google auth availability state
 */
function setStoredGoogleAuthAvailability(available: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(GOOGLE_AUTH_STORAGE_KEY, String(available));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGoogleAuthAvailable, setIsGoogleAuthAvailable] = useState(() => getStoredGoogleAuthAvailability());
  const supabase = getSupabaseClient();
  const router = useRouter();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const signUp = async (email: string, password: string, fullName: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    return createAuthResult(error);
  };

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (!error) {
      router.push('/dashboard');
    }
    return createAuthResult(error);
  };

  const signInWithGoogle = async (): Promise<AuthResult> => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    // If we get a provider not enabled error, mark Google auth as unavailable and persist it
    if (error && isProviderConfigError(error)) {
      setIsGoogleAuthAvailable(false);
      setStoredGoogleAuthAvailability(false);
    }

    return createAuthResult(error);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const resetPassword = async (email: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return createAuthResult(error);
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signUp, signIn, signInWithGoogle, signOut, resetPassword, isGoogleAuthAvailable }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
