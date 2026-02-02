'use client';

import { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { X, ChevronLeft, ChevronRight, Check, Sparkles } from 'lucide-react';
import { useOnboarding } from '@/context/OnboardingContext';
import { Button } from '@/components/ui/Button';
import { WelcomeStep } from './steps/WelcomeStep';
import { IncomeStep } from './steps/IncomeStep';
import { BudgetTemplateStep } from './steps/BudgetTemplateStep';
import { CompletionStep } from './steps/CompletionStep';

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.md};
  animation: ${fadeIn} 0.3s ease;
`;

const Modal = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius['2xl']};
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: ${slideIn} 0.4s ease;
  position: relative;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Logo = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: ${({ theme }) => theme.gradients.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textInverse};
  box-shadow: ${({ theme }) => theme.shadows.primary};

  svg {
    width: 20px;
    height: 20px;
  }
`;

const HeaderTitle = styled.div`
  h2 {
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    color: ${({ theme }) => theme.colors.text};
    margin: 0;
  }

  p {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.textMuted};
    margin: 0;
  }
`;

const CloseButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  border: none;
  background: ${({ theme }) => theme.colors.surfaceHover};
  color: ${({ theme }) => theme.colors.textMuted};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.text};
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const ProgressBar = styled.div`
  height: 4px;
  background: ${({ theme }) => theme.colors.border};
`;

const ProgressFill = styled.div<{ $progress: number }>`
  height: 100%;
  width: ${({ $progress }) => $progress}%;
  background: ${({ theme }) => theme.gradients.primary};
  transition: width 0.3s ease;
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing.xl};
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.lg};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceHover}30;
`;

const StepIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const StepDot = styled.div<{ $active: boolean; $completed: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $active, $completed, theme }) =>
    $active
      ? theme.colors.primary
      : $completed
        ? theme.colors.success
        : theme.colors.border};
  transition: all 0.2s ease;
`;

const StepText = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textMuted};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const SkipLink = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.sm};
  transition: color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`;

export function OnboardingFlow() {
  const {
    isOnboardingOpen,
    currentStep,
    totalSteps,
    isLoading,
    closeOnboarding,
    nextStep,
    prevStep,
    completeOnboarding,
    skipOnboarding,
  } = useOnboarding();

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOnboardingOpen) return null;

  const progress = ((currentStep + 1) / totalSteps) * 100;
  const isLastStep = currentStep === totalSteps - 1;
  const isFirstStep = currentStep === 0;

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await completeOnboarding();
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    await skipOnboarding();
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeStep />;
      case 1:
        return <IncomeStep />;
      case 2:
        return <BudgetTemplateStep />;
      case 3:
        return <CompletionStep />;
      default:
        return <WelcomeStep />;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 0:
        return 'Welcome';
      case 1:
        return 'Your Income';
      case 2:
        return 'Budget Setup';
      case 3:
        return 'All Set!';
      default:
        return 'Setup';
    }
  };

  return (
    <Overlay onClick={(e) => e.target === e.currentTarget && handleSkip()}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <HeaderLeft>
            <Logo>
              <Sparkles />
            </Logo>
            <HeaderTitle>
              <h2>{getStepTitle()}</h2>
              <p>Step {currentStep + 1} of {totalSteps}</p>
            </HeaderTitle>
          </HeaderLeft>
          <CloseButton onClick={handleSkip} aria-label="Skip onboarding">
            <X />
          </CloseButton>
        </Header>

        <ProgressBar>
          <ProgressFill $progress={progress} />
        </ProgressBar>

        <Content>{renderStep()}</Content>

        <Footer>
          <StepIndicator>
            {Array.from({ length: totalSteps }).map((_, index) => (
              <StepDot
                key={index}
                $active={index === currentStep}
                $completed={index < currentStep}
              />
            ))}
            <StepText>
              {currentStep + 1} / {totalSteps}
            </StepText>
          </StepIndicator>

          <ButtonGroup>
            {!isFirstStep && !isLastStep && (
              <Button variant="ghost" onClick={prevStep} leftIcon={<ChevronLeft size={18} />}>
                Back
              </Button>
            )}

            {currentStep === 0 && (
              <SkipLink onClick={handleSkip}>Skip for now</SkipLink>
            )}

            {!isLastStep ? (
              <Button onClick={nextStep} rightIcon={<ChevronRight size={18} />}>
                Continue
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                isLoading={isSubmitting}
                leftIcon={<Check size={18} />}
              >
                Get Started
              </Button>
            )}
          </ButtonGroup>
        </Footer>
      </Modal>
    </Overlay>
  );
}
