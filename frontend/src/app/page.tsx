'use client';

import styled from 'styled-components';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Logo = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
`;

const Nav = styled.nav`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Hero = styled.section`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: ${({ theme }) => theme.spacing['2xl']};
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.primaryLight} 0%,
    ${({ theme }) => theme.colors.background} 100%
  );
`;

const HeroTitle = styled.h2`
  font-size: 3rem;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text};

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  color: ${({ theme }) => theme.colors.textSecondary};
  max-width: 600px;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Features = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing['2xl']};
  max-width: 1200px;
  margin: 0 auto;
`;

const FeatureCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  text-align: center;
  transition: transform ${({ theme }) => theme.transitions.normal},
    box-shadow ${({ theme }) => theme.transitions.normal};

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
`;

const FeatureIcon = styled.div`
  font-size: 3rem;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const FeatureTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const FeatureDescription = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const Footer = styled.footer`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.surface};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export default function HomePage() {
  const { user, isLoading } = useAuth();

  return (
    <Container>
      <Header>
        <Logo>FinanceTracker</Logo>
        <Nav>
          {!isLoading && (
            <>
              {user ? (
                <Link href="/dashboard">
                  <Button>Go to Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost">Login</Button>
                  </Link>
                  <Link href="/register">
                    <Button>Get Started</Button>
                  </Link>
                </>
              )}
            </>
          )}
        </Nav>
      </Header>

      <Hero>
        <HeroTitle>Take Control of Your Finances</HeroTitle>
        <HeroSubtitle>
          Track expenses, set budgets, achieve goals, and get AI-powered insights
          to make smarter financial decisions.
        </HeroSubtitle>
        <Link href={user ? '/dashboard' : '/register'}>
          <Button size="lg">
            {user ? 'Go to Dashboard' : 'Start Free Today'}
          </Button>
        </Link>
      </Hero>

      <Features>
        <FeatureCard>
          <FeatureIcon>📊</FeatureIcon>
          <FeatureTitle>Expense Tracking</FeatureTitle>
          <FeatureDescription>
            Log and categorize your expenses easily. See where your money goes
            with detailed breakdowns.
          </FeatureDescription>
        </FeatureCard>

        <FeatureCard>
          <FeatureIcon>💰</FeatureIcon>
          <FeatureTitle>Budget Management</FeatureTitle>
          <FeatureDescription>
            Set budgets for different categories and get alerts when you're
            approaching your limits.
          </FeatureDescription>
        </FeatureCard>

        <FeatureCard>
          <FeatureIcon>🎯</FeatureIcon>
          <FeatureTitle>Savings Goals</FeatureTitle>
          <FeatureDescription>
            Create savings goals and track your progress. Celebrate when you
            reach your targets.
          </FeatureDescription>
        </FeatureCard>

        <FeatureCard>
          <FeatureIcon>🤖</FeatureIcon>
          <FeatureTitle>AI Insights</FeatureTitle>
          <FeatureDescription>
            Get personalized tips and spending analysis powered by AI to help
            you save more.
          </FeatureDescription>
        </FeatureCard>

        <FeatureCard>
          <FeatureIcon>📈</FeatureIcon>
          <FeatureTitle>Reports & Analytics</FeatureTitle>
          <FeatureDescription>
            Visualize your spending patterns with charts and export reports in
            various formats.
          </FeatureDescription>
        </FeatureCard>

        <FeatureCard>
          <FeatureIcon>🔒</FeatureIcon>
          <FeatureTitle>Secure & Private</FeatureTitle>
          <FeatureDescription>
            Your financial data is encrypted and secure. We never share your
            information.
          </FeatureDescription>
        </FeatureCard>
      </Features>

      <Footer>
        <p>&copy; 2024 FinanceTracker. All rights reserved.</p>
      </Footer>
    </Container>
  );
}
