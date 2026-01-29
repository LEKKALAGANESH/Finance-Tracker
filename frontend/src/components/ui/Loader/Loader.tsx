'use client';

import styled, { keyframes, css } from 'styled-components';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  fullScreen?: boolean;
  text?: string;
  variant?: 'spinner' | 'dots' | 'pulse';
}

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.98); }
`;

const dotPulse = keyframes`
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 5px rgba(99, 102, 241, 0.3); }
  50% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.6), 0 0 30px rgba(99, 102, 241, 0.4); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

const FullScreenWrapper = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.background};
  z-index: 9999;

  /* Subtle animated gradient background */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: ${({ theme }) => theme.gradients.hero};
    opacity: 0.5;
  }
`;

const InlineWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.lg};
  position: relative;
  z-index: 1;
`;

const sizeMap = {
  sm: { size: '28px', border: '3px' },
  md: { size: '48px', border: '4px' },
  lg: { size: '64px', border: '5px' },
};

const SpinnerOuter = styled.div<{ $size: 'sm' | 'md' | 'lg' }>`
  position: relative;
  width: ${({ $size }) => sizeMap[$size].size};
  height: ${({ $size }) => sizeMap[$size].size};
  animation: ${float} 2s ease-in-out infinite;
`;

const Spinner = styled.div<{ $size: 'sm' | 'md' | 'lg'; $color?: string }>`
  width: 100%;
  height: 100%;
  border: ${({ $size }) => sizeMap[$size].border} solid transparent;
  border-top-color: ${({ theme, $color }) => $color || theme.colors.primary};
  border-right-color: ${({ theme, $color }) => ($color || theme.colors.primary) + '60'};
  border-radius: 50%;
  animation: ${spin} 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
  box-shadow: 0 0 15px ${({ theme, $color }) => ($color || theme.colors.primary) + '30'};

  /* Inner glow effect */
  &::before {
    content: '';
    position: absolute;
    inset: 4px;
    border-radius: 50%;
    background: ${({ theme }) => theme.gradients.primary};
    opacity: 0.1;
  }
`;

const SpinnerCenter = styled.div<{ $color?: string }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 30%;
  height: 30%;
  border-radius: 50%;
  background: ${({ theme, $color }) => $color || theme.gradients.primary};
  animation: ${glow} 1.5s ease-in-out infinite;
`;

const DotsContainer = styled.div<{ $size: 'sm' | 'md' | 'lg' }>`
  display: flex;
  align-items: center;
  gap: ${({ $size }) => ($size === 'sm' ? '6px' : $size === 'md' ? '8px' : '10px')};
`;

const Dot = styled.div<{ $size: 'sm' | 'md' | 'lg'; $color?: string; $delay: number }>`
  width: ${({ $size }) => ($size === 'sm' ? '8px' : $size === 'md' ? '12px' : '16px')};
  height: ${({ $size }) => ($size === 'sm' ? '8px' : $size === 'md' ? '12px' : '16px')};
  background: ${({ theme, $color }) => $color || theme.gradients.primary};
  border-radius: 50%;
  animation: ${dotPulse} 1.4s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay}s;
  box-shadow: 0 0 10px ${({ theme, $color }) => ($color || theme.colors.primary) + '40'};
`;

const PulseCircle = styled.div<{ $size: 'sm' | 'md' | 'lg'; $color?: string }>`
  width: ${({ $size }) => sizeMap[$size].size};
  height: ${({ $size }) => sizeMap[$size].size};
  border-radius: 50%;
  background: ${({ theme, $color }) => $color || theme.gradients.primary};
  animation: ${pulse} 1.5s ease-in-out infinite;
  box-shadow: 0 0 20px ${({ theme, $color }) => ($color || theme.colors.primary) + '40'};
`;

const LoadingText = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  animation: ${pulse} 2s ease-in-out infinite;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  letter-spacing: 0.02em;
`;

export function Loader({
  size = 'md',
  color,
  fullScreen = false,
  text,
  variant = 'spinner',
}: LoaderProps) {
  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return (
          <DotsContainer $size={size}>
            <Dot $size={size} $color={color} $delay={0} />
            <Dot $size={size} $color={color} $delay={0.2} />
            <Dot $size={size} $color={color} $delay={0.4} />
          </DotsContainer>
        );
      case 'pulse':
        return <PulseCircle $size={size} $color={color} />;
      default:
        return (
          <SpinnerOuter $size={size}>
            <Spinner $size={size} $color={color} />
            <SpinnerCenter $color={color} />
          </SpinnerOuter>
        );
    }
  };

  const content = (
    <InlineWrapper>
      {renderLoader()}
      {text && <LoadingText>{text}</LoadingText>}
    </InlineWrapper>
  );

  if (fullScreen) {
    return <FullScreenWrapper>{content}</FullScreenWrapper>;
  }

  return content;
}

// Enhanced Skeleton loader for content loading states
const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

export const Skeleton = styled.div<{
  $width?: string;
  $height?: string;
  $borderRadius?: string;
  $animate?: boolean;
}>`
  width: ${({ $width }) => $width || '100%'};
  height: ${({ $height }) => $height || '20px'};
  border-radius: ${({ $borderRadius, theme }) =>
    $borderRadius || theme.borderRadius.lg};
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.surfaceHover} 0%,
    ${({ theme }) => theme.colors.border}60 50%,
    ${({ theme }) => theme.colors.surfaceHover} 100%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s ease-in-out infinite;
  position: relative;
  overflow: hidden;
`;

// Card skeleton for dashboard loading states
export const SkeletonCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

// Text skeleton with multiple lines
export const SkeletonText = styled.div<{ $lines?: number }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};

  ${({ $lines = 3 }) => css`
    & > ${Skeleton}:last-child {
      width: ${60 + Math.random() * 20}%;
    }
  `}
`;
