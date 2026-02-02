'use client';

import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'danger-outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  children: ReactNode;
}

const sizeStyles = {
  sm: css`
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    border-radius: ${({ theme }) => theme.borderRadius.md};
  `,
  md: css`
    padding: 0.625rem 1.25rem;
    font-size: 0.9375rem;
    border-radius: ${({ theme }) => theme.borderRadius.lg};
  `,
  lg: css`
    padding: 0.875rem 2rem;
    font-size: 1.0625rem;
    border-radius: ${({ theme }) => theme.borderRadius.lg};
  `,
};

const variantStyles = {
  primary: css`
    background: ${({ theme }) => theme.gradients.primary};
    color: ${({ theme }) => theme.colors.textInverse};
    border: none;
    box-shadow: ${({ theme }) => theme.shadows.primary};

    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.gradients.primaryHover};
      box-shadow: ${({ theme }) => theme.shadows.primaryLg};
      transform: translateY(-2px);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: ${({ theme }) => theme.shadows.sm};
    }
  `,
  secondary: css`
    background: ${({ theme }) => theme.gradients.secondary};
    color: ${({ theme }) => theme.colors.textInverse};
    border: none;
    box-shadow: 0 4px 14px 0 rgba(139, 92, 246, 0.35);

    &:hover:not(:disabled) {
      box-shadow: 0 8px 24px 0 rgba(139, 92, 246, 0.45);
      transform: translateY(-2px);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
    }
  `,
  outline: css`
    background: ${({ theme }) => theme.glass.background};
    backdrop-filter: ${({ theme }) => theme.glass.blur};
    color: ${({ theme }) => theme.colors.primary};
    border: 1.5px solid ${({ theme }) => theme.colors.primary};
    box-shadow: ${({ theme }) => theme.shadows.sm};

    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.primaryLight};
      border-color: ${({ theme }) => theme.colors.primaryHover};
      box-shadow: ${({ theme }) => theme.shadows.md};
      transform: translateY(-1px);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
    }
  `,
  ghost: css`
    background: transparent;
    color: ${({ theme }) => theme.colors.text};
    border: 1.5px solid transparent;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: ${({ theme }) => theme.colors.surfaceHover};
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    &:hover:not(:disabled) {
      &::before {
        opacity: 1;
      }
    }

    &:active:not(:disabled) {
      &::before {
        opacity: 0.8;
      }
    }
  `,
  danger: css`
    background: ${({ theme }) => theme.gradients.danger};
    color: ${({ theme }) => theme.colors.textInverse};
    border: none;
    box-shadow: ${({ theme }) => theme.shadows.error};
    position: relative;

    /* Pulsing attention indicator for destructive actions */
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: rgba(255, 255, 255, 0);
      transition: background 0.2s ease;
    }

    &:hover:not(:disabled) {
      box-shadow: 0 8px 24px 0 rgba(239, 68, 68, 0.5);
      transform: translateY(-2px);

      &::before {
        background: rgba(255, 255, 255, 0.1);
      }
    }

    &:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: 0 2px 8px 0 rgba(239, 68, 68, 0.4);
    }

    /* Enhanced focus for accessibility - high contrast ring */
    &:focus-visible {
      outline: none;
      box-shadow:
        0 0 0 2px ${({ theme }) => theme.colors.surface},
        0 0 0 4px ${({ theme }) => theme.colors.error},
        ${({ theme }) => theme.shadows.error};
    }
  `,
  'danger-outline': css`
    background: transparent;
    color: ${({ theme }) => theme.colors.error};
    border: 1.5px solid ${({ theme }) => theme.colors.error};
    position: relative;
    overflow: hidden;

    /* Subtle background on hover */
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: ${({ theme }) => theme.colors.errorLight};
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    &:hover:not(:disabled) {
      border-color: ${({ theme }) => theme.colors.error};
      transform: translateY(-1px);
      box-shadow: 0 4px 12px 0 rgba(239, 68, 68, 0.2);

      &::before {
        opacity: 0.5;
      }
    }

    &:active:not(:disabled) {
      transform: translateY(0);

      &::before {
        opacity: 0.7;
      }
    }

    &:focus-visible {
      outline: none;
      box-shadow:
        0 0 0 2px ${({ theme }) => theme.colors.surface},
        0 0 0 4px ${({ theme }) => theme.colors.error};
    }
  `,
};

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const StyledButton = styled.button<{
  $variant: ButtonVariant;
  $size: ButtonSize;
  $fullWidth: boolean;
  $isLoading: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  letter-spacing: 0.01em;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  white-space: nowrap;
  position: relative;
  overflow: hidden;
  isolation: isolate;

  ${({ $size }) => sizeStyles[$size]}
  ${({ $variant }) => variantStyles[$variant]}
  ${({ $fullWidth }) => $fullWidth && css`width: 100%;`}

  /* Shimmer effect on hover for primary/secondary variants */
  ${({ $variant, $isLoading }) =>
    ($variant === 'primary' || $variant === 'secondary') &&
    !$isLoading &&
    css`
      &::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          90deg,
          transparent 0%,
          rgba(255, 255, 255, 0.2) 50%,
          transparent 100%
        );
        background-size: 200% 100%;
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      &:hover::after {
        opacity: 1;
        animation: ${shimmer} 1.5s infinite;
      }
    `}

  /* Loading state shimmer */
  ${({ $isLoading }) =>
    $isLoading &&
    css`
      &::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          90deg,
          transparent 0%,
          rgba(255, 255, 255, 0.15) 50%,
          transparent 100%
        );
        background-size: 200% 100%;
        animation: ${shimmer} 1.5s infinite;
      }
    `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
    filter: grayscale(0.3);
  }

  /* Default focus-visible for non-danger variants */
  &:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 2px ${({ theme }) => theme.colors.surface},
      0 0 0 4px ${({ theme }) => theme.colors.primary},
      ${({ theme }) => theme.shadows.primary};
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    transition: none;

    &::before,
    &::after {
      animation: none !important;
    }
  }

  /* High contrast mode support */
  @media (forced-colors: active) {
    border: 2px solid currentColor;

    &:focus-visible {
      outline: 3px solid Highlight;
      outline-offset: 2px;
    }
  }

  /* Icon hover animation */
  svg {
    transition: transform 0.2s ease;
    flex-shrink: 0;
  }

  &:hover:not(:disabled) svg {
    transform: scale(1.1);
  }

  /* Touch device optimization */
  @media (hover: none) and (pointer: coarse) {
    &:hover:not(:disabled) {
      transform: none;
    }

    &:active:not(:disabled) {
      transform: scale(0.98);
    }
  }
`;

const LoadingSpinner = styled(Loader2)`
  animation: ${spin} 0.8s linear infinite;
`;

const ButtonContent = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  z-index: 1;
`;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
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
        $fullWidth={fullWidth}
        $isLoading={isLoading}
        disabled={disabled || isLoading}
        {...props}
      >
        <ButtonContent>
          {isLoading ? (
            <LoadingSpinner size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
          ) : (
            leftIcon
          )}
          {children}
          {!isLoading && rightIcon}
        </ButtonContent>
      </StyledButton>
    );
  }
);

Button.displayName = 'Button';
