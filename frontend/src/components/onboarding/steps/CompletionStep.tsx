'use client';

import styled, { keyframes } from 'styled-components';
import { CheckCircle2, Rocket, ArrowRight } from 'lucide-react';
import { useOnboarding } from '@/context/OnboardingContext';
import { useCurrency } from '@/context/CurrencyContext';

const confetti = keyframes`
  0% { transform: translateY(0) rotate(0deg); opacity: 1; }
  100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
`;

const bounce = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
`;

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Container = styled.div`
  text-align: center;
  position: relative;
  overflow: hidden;
`;

const ConfettiContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
`;

const ConfettiPiece = styled.div<{ $delay: number; $left: number; $color: string }>`
  position: absolute;
  width: 10px;
  height: 10px;
  background: ${({ $color }) => $color};
  top: -20px;
  left: ${({ $left }) => $left}%;
  animation: ${confetti} 3s ease-out forwards;
  animation-delay: ${({ $delay }) => $delay}s;
  border-radius: 2px;
`;

const SuccessIcon = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.successLight};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${({ theme }) => theme.spacing.xl};
  animation: ${bounce} 1s ease infinite;
  box-shadow: 0 8px 32px rgba(16, 185, 129, 0.3);

  svg {
    color: ${({ theme }) => theme.colors.success};
    width: 50px;
    height: 50px;
  }
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  animation: ${fadeInUp} 0.5s ease forwards;
  animation-delay: 0.2s;
  opacity: 0;
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  color: ${({ theme }) => theme.colors.textSecondary};
  max-width: 400px;
  margin: 0 auto ${({ theme }) => theme.spacing.xl};
  line-height: 1.6;
  animation: ${fadeInUp} 0.5s ease forwards;
  animation-delay: 0.3s;
  opacity: 0;
`;

const SummaryCard = styled.div`
  background: ${({ theme }) => theme.colors.surfaceHover}50;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.lg};
  max-width: 400px;
  margin: 0 auto ${({ theme }) => theme.spacing.xl};
  animation: ${fadeInUp} 0.5s ease forwards;
  animation-delay: 0.4s;
  opacity: 0;
`;

const SummaryTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};
`;

const SummaryItem = styled.div`
  text-align: left;
`;

const SummaryLabel = styled.span`
  display: block;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textMuted};
  margin-bottom: 4px;
`;

const SummaryValue = styled.span`
  display: block;
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
`;

const NextSteps = styled.div`
  animation: ${fadeInUp} 0.5s ease forwards;
  animation-delay: 0.5s;
  opacity: 0;
`;

const NextStepsTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};

  svg {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const StepsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
  max-width: 350px;
  margin: 0 auto;
`;

const StepItem = styled.li`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm} 0;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};

  svg {
    color: ${({ theme }) => theme.colors.primary};
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
`;

const confettiColors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

export function CompletionStep() {
  const { data } = useOnboarding();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: data.currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTemplateName = () => {
    switch (data.budgetTemplate) {
      case 'minimal':
        return 'Minimal';
      case 'standard':
        return 'Standard';
      case 'detailed':
        return 'Detailed';
      case 'custom':
        return 'Custom';
      default:
        return 'Standard';
    }
  };

  return (
    <Container>
      <ConfettiContainer>
        {Array.from({ length: 20 }).map((_, i) => (
          <ConfettiPiece
            key={i}
            $delay={Math.random() * 0.5}
            $left={Math.random() * 100}
            $color={confettiColors[i % confettiColors.length]}
          />
        ))}
      </ConfettiContainer>

      <SuccessIcon>
        <CheckCircle2 />
      </SuccessIcon>

      <Title>You&apos;re all set!</Title>
      <Subtitle>
        Your finance tracker is ready. Start adding expenses and watch your
        financial insights grow.
      </Subtitle>

      {(data.monthlyIncome > 0 || data.budgetTemplate !== 'custom') && (
        <SummaryCard>
          <SummaryTitle>Your Setup Summary</SummaryTitle>
          <SummaryGrid>
            {data.monthlyIncome > 0 && (
              <SummaryItem>
                <SummaryLabel>Monthly Income</SummaryLabel>
                <SummaryValue>{formatCurrency(data.monthlyIncome)}</SummaryValue>
              </SummaryItem>
            )}
            <SummaryItem>
              <SummaryLabel>Budget Template</SummaryLabel>
              <SummaryValue>{getTemplateName()}</SummaryValue>
            </SummaryItem>
            <SummaryItem>
              <SummaryLabel>Currency</SummaryLabel>
              <SummaryValue>{data.currency}</SummaryValue>
            </SummaryItem>
          </SummaryGrid>
        </SummaryCard>
      )}

      <NextSteps>
        <NextStepsTitle>
          <Rocket size={20} />
          What&apos;s next?
        </NextStepsTitle>
        <StepsList>
          <StepItem>
            <ArrowRight />
            Add your first expense to start tracking
          </StepItem>
          <StepItem>
            <ArrowRight />
            Set up a savings goal for something you want
          </StepItem>
          <StepItem>
            <ArrowRight />
            Check out AI insights after a few transactions
          </StepItem>
          <StepItem>
            <ArrowRight />
            Customize your categories in settings
          </StepItem>
        </StepsList>
      </NextSteps>
    </Container>
  );
}
