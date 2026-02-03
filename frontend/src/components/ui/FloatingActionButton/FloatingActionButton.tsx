'use client';

import { useState, useCallback, ReactNode } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Plus, X, LucideIcon } from 'lucide-react';

interface FABAction {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  color?: string;
}

interface FloatingActionButtonProps {
  actions?: FABAction[];
  onClick?: () => void;
  icon?: LucideIcon;
  label?: string;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  showOnMobileOnly?: boolean;
}

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.8) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
`;

const fadeOut = keyframes`
  from {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  to {
    opacity: 0;
    transform: scale(0.8) translateY(10px);
  }
`;

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(45deg);
  }
`;

const rotateBack = keyframes`
  from {
    transform: rotate(45deg);
  }
  to {
    transform: rotate(0deg);
  }
`;

const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4);
  }
  70% {
    box-shadow: 0 0 0 15px rgba(99, 102, 241, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
  }
`;

const positionStyles = {
  'bottom-right': css`
    right: 24px;
    bottom: 24px;
  `,
  'bottom-left': css`
    left: 24px;
    bottom: 24px;
  `,
  'bottom-center': css`
    left: 50%;
    bottom: 24px;
    transform: translateX(-50%);
  `,
};

const FABContainer = styled.div<{
  $position: 'bottom-right' | 'bottom-left' | 'bottom-center';
  $showOnMobileOnly: boolean;
}>`
  position: fixed;
  ${({ $position }) => positionStyles[$position]}
  z-index: 1000;
  display: flex;
  flex-direction: column-reverse;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};

  ${({ $showOnMobileOnly }) =>
    $showOnMobileOnly &&
    css`
      @media (min-width: 1024px) {
        display: none;
      }
    `}

  @media (max-width: 1023px) {
    ${({ $position }) =>
      $position === 'bottom-right'
        ? css`
            right: 16px;
            left: auto;
          `
        : $position === 'bottom-left'
          ? css`
              left: 16px;
              right: auto;
            `
          : ''}
    bottom: 88px; /* Account for bottom nav */
  }

  @media (max-width: 480px) {
    ${({ $position }) =>
      $position === 'bottom-right'
        ? css`
            right: 12px;
            left: auto;
          `
        : $position === 'bottom-left'
          ? css`
              left: 12px;
              right: auto;
            `
          : ''}
    bottom: 80px;
  }
`;

const MainButton = styled.button<{ $isOpen: boolean; $hasActions: boolean }>`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: ${({ theme }) => theme.gradients.primary};
  color: ${({ theme }) => theme.colors.textInverse};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${({ theme }) => theme.shadows.primaryLg};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  /* Pulse animation when not open */
  ${({ $isOpen }) =>
    !$isOpen &&
    css`
      animation: ${pulse} 2s infinite;
    `}

  &:hover {
    transform: scale(1.1);
    box-shadow: ${({ theme }) => theme.shadows.glowStrong};
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    width: 24px;
    height: 24px;
    transition: transform 0.3s ease;
    ${({ $isOpen, $hasActions }) =>
      $isOpen && $hasActions
        ? css`
            animation: ${rotate} 0.3s forwards;
          `
        : $hasActions
          ? css`
              animation: ${rotateBack} 0.3s forwards;
            `
          : ''}
  }

  /* Ripple effect */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover::after {
    opacity: 1;
  }
`;

const ActionsContainer = styled.div<{ $isOpen: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  pointer-events: ${({ $isOpen }) => ($isOpen ? 'auto' : 'none')};
`;

const ActionItem = styled.div<{ $isOpen: boolean; $index: number }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  opacity: 0;
  transform: scale(0.8) translateY(10px);

  ${({ $isOpen, $index }) =>
    $isOpen
      ? css`
          animation: ${fadeIn} 0.3s ease forwards;
          animation-delay: ${$index * 0.05}s;
        `
      : css`
          animation: ${fadeOut} 0.2s ease forwards;
        `}
`;

const ActionButton = styled.button<{ $color?: string }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: ${({ $color, theme }) => $color || theme.colors.surface};
  color: ${({ $color, theme }) => ($color ? theme.colors.textInverse : theme.colors.text)};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.1);
    box-shadow: ${({ theme }) => theme.shadows.xl};
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const ActionLabel = styled.span`
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  box-shadow: ${({ theme }) => theme.shadows.md};
  white-space: nowrap;
`;

const Overlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(2px);
  z-index: 999;
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  visibility: ${({ $isOpen }) => ($isOpen ? 'visible' : 'hidden')};
  transition: all 0.3s ease;
`;

const SingleButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ButtonLabel = styled.span`
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  white-space: nowrap;
  display: none;

  @media (max-width: 768px) {
    display: none;
  }
`;

export function FloatingActionButton({
  actions,
  onClick,
  icon: CustomIcon,
  label,
  position = 'bottom-right',
  showOnMobileOnly = false,
}: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleMainClick = useCallback(() => {
    if (actions && actions.length > 0) {
      setIsOpen((prev) => !prev);
    } else if (onClick) {
      onClick();
    }
  }, [actions, onClick]);

  const handleActionClick = useCallback((action: FABAction) => {
    action.onClick();
    setIsOpen(false);
  }, []);

  const handleOverlayClick = useCallback(() => {
    setIsOpen(false);
  }, []);

  const hasActions = actions && actions.length > 0;
  const Icon = CustomIcon || Plus;

  return (
    <>
      {hasActions && <Overlay $isOpen={isOpen} onClick={handleOverlayClick} />}
      <FABContainer $position={position} $showOnMobileOnly={showOnMobileOnly}>
        {hasActions && (
          <ActionsContainer $isOpen={isOpen}>
            {actions.map((action, index) => (
              <ActionItem key={index} $isOpen={isOpen} $index={index}>
                <ActionLabel>{action.label}</ActionLabel>
                <ActionButton
                  $color={action.color}
                  onClick={() => handleActionClick(action)}
                  aria-label={action.label}
                >
                  <action.icon />
                </ActionButton>
              </ActionItem>
            ))}
          </ActionsContainer>
        )}
        <SingleButtonWrapper>
          {label && !hasActions && <ButtonLabel>{label}</ButtonLabel>}
          <MainButton
            onClick={handleMainClick}
            $isOpen={isOpen}
            $hasActions={!!hasActions}
            aria-label={label || 'Add'}
            aria-expanded={hasActions ? isOpen : undefined}
          >
            {hasActions && isOpen ? <X /> : <Icon />}
          </MainButton>
        </SingleButtonWrapper>
      </FABContainer>
    </>
  );
}
