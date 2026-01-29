'use client';

import { useState, useCallback } from 'react';
import styled from 'styled-components';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';

const LayoutContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
`;

const MainContent = styled.main<{ $sidebarCollapsed: boolean }>`
  margin-left: ${({ $sidebarCollapsed }) => ($sidebarCollapsed ? '70px' : '260px')};
  min-height: 100vh;
  transition: margin-left 0.2s ease;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

const ContentWrapper = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  flex: 1;

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
    <LayoutContainer>
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <MobileNav isOpen={mobileNavOpen} onClose={handleMobileNavClose} />
      <MainContent $sidebarCollapsed={sidebarCollapsed}>
        <Header onMenuClick={() => setMobileNavOpen(true)} />
        <ContentWrapper>{children}</ContentWrapper>
      </MainContent>
    </LayoutContainer>
  );
}
