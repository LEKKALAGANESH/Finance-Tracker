import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import StyledComponentsRegistry from '@/lib/registry';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/context/ToastContext';
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
    capable: true,
    statusBarStyle: 'default',
    title: 'FinanceTracker',
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
            <ThemeProvider>
              <ToastProvider>
                {children}
              </ToastProvider>
            </ThemeProvider>
          </AuthProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
