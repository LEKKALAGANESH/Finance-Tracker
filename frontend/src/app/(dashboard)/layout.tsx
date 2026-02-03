'use client';

import { useState, useCallback } from 'react';
import styled from 'styled-components';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { BottomNavBar, BottomNavSpacer } from '@/components/ui/BottomNavBar';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { OnboardingFlow } from '@/components/onboarding';
import { NavigationProvider } from '@/context/NavigationContext';
import { PageTransitionLoader } from '@/components/ui/PageTransitionLoader';

const LayoutContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
  position: relative;

  /* Subtle noise texture for depth (optional, can be removed if performance is a concern) */
  &::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    opacity: 0.015;
    pointer-events: none;
    z-index: 0;
  }
`;

const MainContent = styled.main<{ $sidebarCollapsed: boolean }>`
  margin-left: ${({ $sidebarCollapsed }) => ($sidebarCollapsed ? '76px' : '260px')};
  min-height: 100vh;
  transition: margin-left 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;

  @media (max-width: 1023px) {
    margin-left: 0;
  }
`;

const ContentWrapper = styled.div`
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.lg};
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  flex: 1;

  @media (max-width: 1024px) {
    padding: ${({ theme }) => theme.spacing.lg};
  }

  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing.md};
  }

  @media (max-width: 480px) {
    padding: ${({ theme }) => theme.spacing.sm};
  }
`;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleMobileNavClose = useCallback(() => {
    setMobileNavOpen(false);
  }, []);

  return (
    <NavigationProvider>
      <LayoutContainer>
        <PageTransitionLoader />
        <Sidebar
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <MobileNav isOpen={mobileNavOpen} onClose={handleMobileNavClose} />
        <MainContent $sidebarCollapsed={sidebarCollapsed}>
          <Header onMenuClick={() => setMobileNavOpen(true)} />
          <ContentWrapper>
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </ContentWrapper>
          <BottomNavSpacer />
        </MainContent>
        <BottomNavBar />
        <OnboardingFlow />
      </LayoutContainer>
    </NavigationProvider>
  );
}
