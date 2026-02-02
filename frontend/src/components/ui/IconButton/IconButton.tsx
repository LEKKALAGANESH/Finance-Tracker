'use client';

import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import styled, { css, keyframes } from 'styled-components';

type IconButtonVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger';
type IconButtonSize = 'sm' | 'md' | 'lg';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  tooltip?: string;
  children: ReactNode;
}

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
`;

const wiggle = keyframes`
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-12deg); }
  75% { transform: rotate(12deg); }
`;

const sizeStyles = {
  sm: css`
    width: 32px;
    height: 32px;

    svg {
      width: 14px;
      height: 14px;
    }
  `,
  md: css`
    width: 38px;
    height: 38px;

    svg {
      width: 18px;
      height: 18px;
    }
  `,
  lg: css`
    width: 44px;
    height: 44px;

    svg {
      width: 22px;
      height: 22px;
    }
  `,
};

const variantStyles = {
  default: css`
    color: ${({ theme }) => theme.colors.textSecondary};
    background: ${({ theme }) => theme.colors.surfaceHover};
    border: 1px solid transparent;

    &:hover:not(:disabled) {
      color: ${({ theme }) => theme.colors.text};
      background: ${({ theme }) => theme.colors.surface};
      border-color: ${({ theme }) => theme.colors.border};
      box-shadow: ${({ theme }) => theme.shadows.md};
    }
  `,
  primary: css`
    color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.primaryLight};
    border: 1px solid ${({ theme }) => theme.colors.primary}20;

    &:hover:not(:disabled) {
      color: white;
      background: ${({ theme }) => theme.colors.primary};
      border-color: ${({ theme }) => theme.colors.primary};
      box-shadow: 0 4px 12px ${({ theme }) => theme.colors.primary}40;

      svg {
        animation: ${pulse} 0.4s ease;
      }
    }
  `,
  success: css`
    color: ${({ theme }) => theme.colors.success};
    background: ${({ theme }) => theme.colors.successLight};
    border: 1px solid ${({ theme }) => theme.colors.success}20;

    &:hover:not(:disabled) {
      color: white;
      background: ${({ theme }) => theme.colors.success};
      border-color: ${({ theme }) => theme.colors.success};
      box-shadow: 0 4px 12px ${({ theme }) => theme.colors.success}40;
    }
  `,
  warning: css`
    color: ${({ theme }) => theme.colors.warning};
    background: ${({ theme }) => theme.colors.warningLight};
    border: 1px solid ${({ theme }) => theme.colors.warning}20;

    &:hover:not(:disabled) {
      color: white;
      background: ${({ theme }) => theme.colors.warning};
      border-color: ${({ theme }) => theme.colors.warning};
      box-shadow: 0 4px 12px ${({ theme }) => theme.colors.warning}40;
    }
  `,
  danger: css`
    color: ${({ theme }) => theme.colors.error};
    background: ${({ theme }) => theme.colors.errorLight};
    border: 1px solid ${({ theme }) => theme.colors.error}20;

    &:hover:not(:disabled) {
      color: white;
      background: linear-gradient(135deg, ${({ theme }) => theme.colors.error} 0%, #f87171 100%);
      border-color: ${({ theme }) => theme.colors.error};
      box-shadow: 0 4px 12px ${({ theme }) => theme.colors.error}40;

      svg {
        animation: ${wiggle} 0.4s ease;
      }
    }
  `,
};

const Tooltip = styled.span`
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%) translateY(4px);
  padding: 6px 10px;
  background: ${({ theme }) => theme.colors.text};
  color: ${({ theme }) => theme.colors.background};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  z-index: 100;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  pointer-events: none;

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-top-color: ${({ theme }) => theme.colors.text};
  }
`;

const StyledButton = styled.button<{
  $variant: IconButtonVariant;
  $size: IconButtonSize;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  cursor: pointer;
  position: relative;
  transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
  flex-shrink: 0;

  ${({ $size }) => sizeStyles[$size]}
  ${({ $variant }) => variantStyles[$variant]}

  &:hover ${Tooltip} {
    opacity: 1;
    visibility: visible;
    transform: translateX(-50%) translateY(0);
  }

  &:active:not(:disabled) {
    transform: scale(0.92);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 2px ${({ theme }) => theme.colors.surface},
      0 0 0 4px ${({ theme }) => theme.colors.primary};
  }

  svg {
    transition: all 0.25s ease;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;

    svg {
      animation: none !important;
    }
  }
`;

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      variant = 'default',
      size = 'md',
      tooltip,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <StyledButton
        ref={ref}
        $variant={variant}
        $size={size}
        {...props}
      >
        {children}
        {tooltip && <Tooltip>{tooltip}</Tooltip>}
      </StyledButton>
    );
  }
);

IconButton.displayName = 'IconButton';
