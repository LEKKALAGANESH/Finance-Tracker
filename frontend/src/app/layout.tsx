import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import StyledComponentsRegistry from '@/lib/registry';
import { AuthProvider } from '@/context/AuthContext';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/context/ToastContext';
import { OnboardingProvider } from '@/context/OnboardingContext';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  themeColor: '#6366f1',
};

export const metadata: Metadata = {
  title: 'FinanceTracker - Manage Your Money Wisely',
  description: 'Track your expenses, manage budgets, and achieve your financial goals with AI-powered insights.',
  keywords: ['finance', 'budget', 'expense tracker', 'savings', 'money management'],
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/icon.svg',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    statusBarStyle: 'default',
    title: 'FinanceTracker',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <StyledComponentsRegistry>
          <AuthProvider>
            <CurrencyProvider>
              <ThemeProvider>
                <ToastProvider>
                  <OnboardingProvider>
                    {children}
                  </OnboardingProvider>
                </ToastProvider>
              </ThemeProvider>
            </CurrencyProvider>
          </AuthProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
