'use client';

import styled, { keyframes } from 'styled-components';
import { Wallet, PieChart, Target, Sparkles, TrendingUp, Shield } from 'lucide-react';

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Container = styled.div`
  text-align: center;
`;

const HeroSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const IconGrid = styled.div`
  display: flex;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const FloatingIcon = styled.div<{ $delay: number; $color: string }>`
  width: 56px;
  height: 56px;
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  background: ${({ $color }) => $color}15;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${float} 3s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay}s;

  svg {
    color: ${({ $color }) => $color};
    width: 28px;
    height: 28px;
  }
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  letter-spacing: -0.02em;

  span {
    background: ${({ theme }) => theme.gradients.primary};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  color: ${({ theme }) => theme.colors.textSecondary};
  max-width: 400px;
  margin: 0 auto;
  line-height: 1.6;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.xl};

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const FeatureCard = styled.div<{ $delay: number }>`
  background: ${({ theme }) => theme.colors.surfaceHover}50;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.md};
  text-align: left;
  animation: ${fadeInUp} 0.5s ease forwards;
  animation-delay: ${({ $delay }) => $delay}s;
  opacity: 0;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary}40;
    transform: translateY(-2px);
  }
`;

const FeatureIcon = styled.div<{ $color: string }>`
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ $color }) => $color}15;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing.sm};

  svg {
    color: ${({ $color }) => $color};
    width: 18px;
    height: 18px;
  }
`;

const FeatureTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 4px;
`;

const FeatureDescription = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0;
  line-height: 1.5;
`;

const features = [
  {
    icon: Wallet,
    title: 'Track Expenses',
    description: 'Log and categorize all your spending effortlessly',
    color: '#6366f1',
  },
  {
    icon: PieChart,
    title: 'Smart Budgets',
    description: 'Set budgets and get alerts before overspending',
    color: '#10b981',
  },
  {
    icon: Target,
    title: 'Savings Goals',
    description: 'Save for what matters with visual progress tracking',
    color: '#f59e0b',
  },
  {
    icon: Sparkles,
    title: 'AI Insights',
    description: 'Get personalized tips powered by AI',
    color: '#8b5cf6',
  },
];

export function WelcomeStep() {
  return (
    <Container>
      <HeroSection>
        <IconGrid>
          <FloatingIcon $delay={0} $color="#6366f1">
            <TrendingUp />
          </FloatingIcon>
          <FloatingIcon $delay={0.2} $color="#10b981">
            <Wallet />
          </FloatingIcon>
          <FloatingIcon $delay={0.4} $color="#f59e0b">
            <Shield />
          </FloatingIcon>
        </IconGrid>

        <Title>
          Welcome to <span>Finance Tracker</span>
        </Title>
        <Subtitle>
          Take control of your finances with smart tracking, budgeting, and AI-powered insights.
        </Subtitle>
      </HeroSection>

      <FeaturesGrid>
        {features.map((feature, index) => (
          <FeatureCard key={feature.title} $delay={0.1 * (index + 1)}>
            <FeatureIcon $color={feature.color}>
              <feature.icon />
            </FeatureIcon>
            <FeatureTitle>{feature.title}</FeatureTitle>
            <FeatureDescription>{feature.description}</FeatureDescription>
          </FeatureCard>
        ))}
      </FeaturesGrid>
    </Container>
  );
}
