'use client';

import { forwardRef, HTMLAttributes } from 'react';
import styled, { css, keyframes } from 'styled-components';

type ProgressVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';
type ProgressSize = 'sm' | 'md' | 'lg';

interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  /** Current progress value (0-100) */
  value: number;
  /** Maximum value (default: 100) */
  max?: number;
  /** Visual variant */
  variant?: ProgressVariant;
  /** Size of the progress bar */
  size?: ProgressSize;
  /** Show percentage label */
  showLabel?: boolean;
  /** Custom label text */
  label?: string;
  /** Animated fill effect */
  animated?: boolean;
  /** Striped pattern */
  striped?: boolean;
  /** Indeterminate loading state */
  indeterminate?: boolean;
  /** Accessible label for screen readers */
  'aria-label'?: string;
}

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const stripeAnimation = keyframes`
  0% { background-position: 0 0; }
  100% { background-position: 40px 0; }
`;

const indeterminateAnimation = keyframes`
  0% { left: -35%; width: 35%; }
  50% { width: 45%; }
  100% { left: 100%; width: 35%; }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
`;

const sizeStyles = {
  sm: css`
    height: 6px;
    border-radius: ${({ theme }) => theme.borderRadius.full};
  `,
  md: css`
    height: 10px;
    border-radius: ${({ theme }) => theme.borderRadius.full};
  `,
  lg: css`
    height: 16px;
    border-radius: ${({ theme }) => theme.borderRadius.lg};
  `,
};

const variantColors = {
  default: (theme: any) => ({
    gradient: theme.gradients.primary,
    glow: theme.colors.primary,
  }),
  success: (theme: any) => ({
    gradient: theme.gradients.success,
    glow: theme.colors.success,
  }),
  warning: (theme: any) => ({
    gradient: theme.gradients.warning,
    glow: theme.colors.warning,
  }),
  danger: (theme: any) => ({
    gradient: theme.gradients.danger,
    glow: theme.colors.error,
  }),
  info: (theme: any) => ({
    gradient: theme.gradients.info,
    glow: theme.colors.info,
  }),
};

const ProgressContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  width: 100%;
`;

const ProgressLabelRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ProgressLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text};
`;

const ProgressValue = styled.span<{ $variant: ProgressVariant }>`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ $variant, theme }) => {
    const colors = {
      default: theme.colors.primary,
      success: theme.colors.success,
      warning: theme.colors.warning,
      danger: theme.colors.error,
      info: theme.colors.info,
    };
    return colors[$variant];
  }};
`;

const ProgressTrack = styled.div<{
  $size: ProgressSize;
  $variant: ProgressVariant;
}>`
  position: relative;
  width: 100%;
  background: ${({ theme }) => theme.colors.surfaceHover};
  border: 1px solid ${({ theme }) => theme.colors.border};
  overflow: hidden;
  ${({ $size }) => sizeStyles[$size]}

  /* Inner shadow for depth */
  box-shadow: ${({ theme }) => theme.shadows.inset};

  /* Subtle glow when near completion */
  transition: box-shadow 0.3s ease;
`;

const ProgressFill = styled.div<{
  $value: number;
  $variant: ProgressVariant;
  $animated: boolean;
  $striped: boolean;
  $indeterminate: boolean;
  $size: ProgressSize;
}>`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: ${({ $value, $indeterminate }) => ($indeterminate ? '35%' : `${$value}%`)};
  background: ${({ theme, $variant }) => variantColors[$variant](theme).gradient};
  border-radius: inherit;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  /* Shimmer overlay for animated state */
  ${({ $animated, $indeterminate }) =>
    $animated &&
    !$indeterminate &&
    css`
      &::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          90deg,
          transparent 0%,
          rgba(255, 255, 255, 0.3) 50%,
          transparent 100%
        );
        background-size: 200% 100%;
        animation: ${shimmer} 2s ease-in-out infinite;
      }
    `}

  /* Striped pattern */
  ${({ $striped }) =>
    $striped &&
    css`
      background-image: linear-gradient(
        45deg,
        rgba(255, 255, 255, 0.15) 25%,
        transparent 25%,
        transparent 50%,
        rgba(255, 255, 255, 0.15) 50%,
        rgba(255, 255, 255, 0.15) 75%,
        transparent 75%,
        transparent
      );
      background-size: 40px 40px;
      animation: ${stripeAnimation} 1s linear infinite;
    `}

  /* Indeterminate animation */
  ${({ $indeterminate }) =>
    $indeterminate &&
    css`
      animation: ${indeterminateAnimation} 1.5s ease-in-out infinite;
    `}

  /* Glow effect for high values */
  ${({ $value, $variant, theme }) =>
    $value >= 90 &&
    css`
      box-shadow: 0 0 12px ${variantColors[$variant](theme).glow}60;
    `}

  /* Completion pulse effect */
  ${({ $value }) =>
    $value >= 100 &&
    css`
      animation: ${pulse} 1.5s ease-in-out infinite;
    `}

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    transition: width 0.1s ease;
    animation: none !important;

    &::after {
      animation: none !important;
    }
  }
`;

const InlineLabel = styled.span<{ $size: ProgressSize }>`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: ${({ $size }) => ($size === 'lg' ? '0.75rem' : '0.625rem')};
  font-weight: 600;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  opacity: ${({ $size }) => ($size === 'lg' ? 1 : 0)};
  transition: opacity 0.2s ease;
`;

export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      value,
      max = 100,
      variant = 'default',
      size = 'md',
      showLabel = false,
      label,
      animated = false,
      striped = false,
      indeterminate = false,
      'aria-label': ariaLabel,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    const displayValue = Math.round(percentage);

    return (
      <ProgressContainer ref={ref} {...props}>
        {(showLabel || label) && (
          <ProgressLabelRow>
            <ProgressLabel>{label || 'Progress'}</ProgressLabel>
            <ProgressValue $variant={variant}>
              {indeterminate ? 'Loading...' : `${displayValue}%`}
            </ProgressValue>
          </ProgressLabelRow>
        )}
        <ProgressTrack
          $size={size}
          $variant={variant}
          role="progressbar"
          aria-valuenow={indeterminate ? undefined : value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={ariaLabel || label || 'Progress'}
          aria-busy={indeterminate}
        >
          <ProgressFill
            $value={percentage}
            $variant={variant}
            $animated={animated}
            $striped={striped}
            $indeterminate={indeterminate}
            $size={size}
          />
          {size === 'lg' && !indeterminate && (
            <InlineLabel $size={size}>{displayValue}%</InlineLabel>
          )}
        </ProgressTrack>
      </ProgressContainer>
    );
  }
);

ProgressBar.displayName = 'ProgressBar';

// Circular progress variant
interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: ProgressVariant;
  showValue?: boolean;
  label?: string;
}

const CircularContainer = styled.div<{ $size: number }>`
  position: relative;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const CircularSvg = styled.svg`
  transform: rotate(-90deg);
  width: 100%;
  height: 100%;
`;

const CircularTrack = styled.circle`
  fill: none;
  stroke: ${({ theme }) => theme.colors.surfaceHover};
  stroke-width: inherit;
`;

const CircularFillPath = styled.circle<{ $variant: ProgressVariant }>`
  fill: none;
  stroke: ${({ $variant, theme }) => variantColors[$variant](theme).glow};
  stroke-linecap: round;
  transition: stroke-dashoffset 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 0 4px ${({ $variant, theme }) => variantColors[$variant](theme).glow}40);

  @media (prefers-reduced-motion: reduce) {
    transition: stroke-dashoffset 0.1s ease;
  }
`;

const CircularValue = styled.div<{ $variant: ProgressVariant; $size: number }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: ${({ $size }) => Math.max($size / 4, 12)}px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ $variant, theme }) => variantColors[$variant](theme).glow};
`;

const CircularLabel = styled.span<{ $size: number }>`
  position: absolute;
  bottom: -${({ $size }) => Math.max($size / 5, 16)}px;
  left: 50%;
  transform: translateX(-50%);
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  white-space: nowrap;
`;

export function CircularProgress({
  value,
  max = 100,
  size = 80,
  strokeWidth = 8,
  variant = 'default',
  showValue = true,
  label,
}: CircularProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <CircularContainer
      $size={size}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label || 'Progress'}
    >
      <CircularSvg style={{ strokeWidth }}>
        <CircularTrack cx={size / 2} cy={size / 2} r={radius} />
        <CircularFillPath
          $variant={variant}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </CircularSvg>
      {showValue && (
        <CircularValue $variant={variant} $size={size}>
          {Math.round(percentage)}%
        </CircularValue>
      )}
      {label && <CircularLabel $size={size}>{label}</CircularLabel>}
    </CircularContainer>
  );
}
