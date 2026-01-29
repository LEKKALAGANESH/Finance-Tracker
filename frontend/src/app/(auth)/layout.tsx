"use client";

import styled from "styled-components";

const AuthLayout = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.primaryLight} 0%,
    ${({ theme }) => theme.colors.background} 50%,
    ${({ theme }) => theme.colors.surface} 100%
  );
  padding: ${({ theme }) => theme.spacing.md};

  @media (max-width: 480px) {
    padding: ${({ theme }) => theme.spacing.sm};
    align-items: flex-start;
    padding-top: ${({ theme }) => theme.spacing.xl};
  }
`;

const AuthContainer = styled.div`
  width: 100%;
  max-width: 420px;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  box-shadow: ${({ theme }) => theme.shadows.xl};
  padding: ${({ theme }) => theme.spacing.xl};

  @media (max-width: 480px) {
    padding: ${({ theme }) => theme.spacing.lg};
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
`;

const Logo = styled.h1`
  text-align: center;
  font-size: ${({ theme }) => theme.typography.fontSize["2xl"]};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AuthLayout>
      <AuthContainer>
        <Logo>FinanceTracker</Logo>
        {children}
      </AuthContainer>
    </AuthLayout>
  );
}
