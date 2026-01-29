'use client';

import { ReactNode } from 'react';
import styled, { keyframes } from 'styled-components';
import { LucideIcon, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
}

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: ${({ theme }) => theme.spacing['2xl']};
  min-height: 300px;
  animation: ${fadeIn} 0.5s ease forwards;
`;

const IconContainer = styled.div`
  position: relative;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  animation: ${float} 3s ease-in-out infinite;
`;

const IconWrapper = styled.div`
  width: 100px;
  height: 100px;
  border-radius: ${({ theme }) => theme.borderRadius['2xl']};
  background: ${({ theme }) => theme.gradients.hero};
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow:
    0 8px 32px rgba(99, 102, 241, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);

  svg {
    color: ${({ theme }) => theme.colors.primary};
    opacity: 0.8;
  }

  /* Decorative rings */
  &::before,
  &::after {
    content: '';
    position: absolute;
    border-radius: inherit;
    border: 2px dashed ${({ theme }) => theme.colors.primary}20;
  }

  &::before {
    inset: -12px;
    animation: ${pulse} 2s ease-in-out infinite;
  }

  &::after {
    inset: -24px;
    animation: ${pulse} 2s ease-in-out infinite 0.5s;
  }
`;

const DecorativeDotsLeft = styled.div`
  position: absolute;
  left: -40px;
  top: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.primary};
    opacity: 0.2;

    &:nth-child(1) { opacity: 0.4; }
    &:nth-child(2) { opacity: 0.3; width: 6px; height: 6px; }
    &:nth-child(3) { opacity: 0.2; width: 4px; height: 4px; }
  }
`;

const DecorativeDotsRight = styled.div`
  position: absolute;
  right: -40px;
  bottom: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.secondary};
    opacity: 0.2;

    &:nth-child(1) { opacity: 0.2; width: 4px; height: 4px; }
    &:nth-child(2) { opacity: 0.3; width: 6px; height: 6px; }
    &:nth-child(3) { opacity: 0.4; }
  }
`;

const Title = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  letter-spacing: -0.01em;
`;

const Description = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.textMuted};
  max-width: 360px;
  line-height: 1.6;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const ActionWrapper = styled.div`
  margin-top: ${({ theme }) => theme.spacing.md};
`;

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  children,
}: EmptyStateProps) {
  return (
    <Container>
      <IconContainer>
        <DecorativeDotsLeft>
          <span />
          <span />
          <span />
        </DecorativeDotsLeft>
        <IconWrapper>
          <Icon size={48} strokeWidth={1.5} />
        </IconWrapper>
        <DecorativeDotsRight>
          <span />
          <span />
          <span />
        </DecorativeDotsRight>
      </IconContainer>

      <Title>{title}</Title>
      {description && <Description>{description}</Description>}

      {actionLabel && onAction && (
        <ActionWrapper>
          <Button onClick={onAction} size="lg">
            {actionLabel}
          </Button>
        </ActionWrapper>
      )}

      {children}
    </Container>
  );
}
