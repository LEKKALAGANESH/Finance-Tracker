'use client';

import { useEffect, useState, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { LucideIcon, TrendingUp, TrendingDown, Sparkles } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
  subtitle?: string;
}

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

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-4px) rotate(2deg); }
`;

const gradientMove = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const glowPulse = keyframes`
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.8; }
`;

const Card = styled.div<{ $color: string }>`
  background: ${({ theme }) => theme.glass.background};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.xl};
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  cursor: pointer;

  /* Animated gradient border on hover */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(
      90deg,
      ${({ $color }) => $color}00 0%,
      ${({ $color }) => $color} 50%,
      ${({ $color }) => $color}00 100%
    );
    background-size: 200% 100%;
    animation: ${gradientMove} 3s ease infinite;
    opacity: 0.8;
  }

  /* Glow effect background */
  &::after {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(
      circle at center,
      ${({ $color }) => $color}15 0%,
      transparent 50%
    );
    pointer-events: none;
    transition: all 0.5s ease;
    opacity: 0;
  }

  &:hover {
    transform: translateY(-6px) scale(1.02);
    box-shadow:
      ${({ theme }) => theme.shadows.xl},
      0 8px 32px ${({ $color }) => $color}30,
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    border-color: ${({ $color }) => $color}50;

    &::after {
      opacity: 1;
    }
  }

  &:active {
    transform: translateY(-3px) scale(1.01);
  }

  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing.lg};
  }

  @media (max-width: 480px) {
    padding: ${({ theme }) => theme.spacing.md};
    flex-direction: row-reverse;
    gap: ${({ theme }) => theme.spacing.sm};
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
    &:hover { transform: none; }
    &::before { animation: none; }
  }
`;

const ShimmerOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 50%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.03) 50%,
      transparent 100%
    );
    transform: translateX(-100%);
  }

  ${Card}:hover &::after {
    animation: ${shimmer} 0.8s ease forwards;
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  position: relative;
  z-index: 1;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const Title = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textMuted};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  text-transform: uppercase;
  letter-spacing: 0.1em;

  @media (max-width: 480px) {
    font-size: 0.65rem;
  }
`;

const ValueContainer = styled.div`
  display: flex;
  align-items: baseline;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const Value = styled.span`
  font-size: 2rem;
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text};
  letter-spacing: -0.03em;
  font-feature-settings: 'tnum';
  display: inline-block;
  line-height: 1.1;
  background: linear-gradient(
    180deg,
    ${({ theme }) => theme.colors.text} 0%,
    ${({ theme }) => theme.colors.textSecondary} 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media (max-width: 768px) {
    font-size: 1.75rem;
  }

  @media (max-width: 480px) {
    font-size: 1.5rem;
  }
`;

const AnimatedValue = styled.span<{ $isAnimating: boolean }>`
  display: inline-block;
  transition: transform 0.3s ease;

  ${({ $isAnimating }) =>
    $isAnimating &&
    css`
    animation: ${pulse} 0.3s ease;
  `}
`;

const Trend = styled.div<{ $isPositive: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme, $isPositive }) =>
    $isPositive ? theme.colors.success : theme.colors.error};
  margin-top: ${({ theme }) => theme.spacing.sm};
  padding: 6px 12px;
  background: ${({ theme, $isPositive }) =>
    $isPositive
      ? `linear-gradient(135deg, ${theme.colors.successLight} 0%, ${theme.colors.successLight}80 100%)`
      : `linear-gradient(135deg, ${theme.colors.errorLight} 0%, ${theme.colors.errorLight}80 100%)`};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  width: fit-content;
  transition: all 0.3s ease;
  border: 1px solid ${({ theme, $isPositive }) =>
    $isPositive ? `${theme.colors.success}20` : `${theme.colors.error}20`};

  svg {
    transition: transform 0.3s ease;
    flex-shrink: 0;
  }

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px ${({ theme, $isPositive }) =>
      $isPositive ? `${theme.colors.success}30` : `${theme.colors.error}30`};
  }

  &:hover svg {
    transform: ${({ $isPositive }) => ($isPositive ? 'translateY(-3px)' : 'translateY(3px)')};
  }

  @media (max-width: 480px) {
    font-size: 0.65rem;
    padding: 4px 10px;

    svg {
      width: 12px;
      height: 12px;
    }
  }
`;

const IconWrapper = styled.div<{ $color: string }>`
  width: 64px;
  height: 64px;
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  background: linear-gradient(
    135deg,
    ${({ $color }) => $color}25 0%,
    ${({ $color }) => $color}10 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ $color }) => $color};
  position: relative;
  z-index: 1;
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  box-shadow:
    0 4px 16px ${({ $color }) => $color}20,
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  flex-shrink: 0;

  /* Inner glow ring */
  &::before {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: inherit;
    background: linear-gradient(
      135deg,
      ${({ $color }) => $color}30 0%,
      transparent 50%,
      ${({ $color }) => $color}10 100%
    );
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: -1;
  }

  /* Solid background on hover */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(
      135deg,
      ${({ $color }) => $color} 0%,
      ${({ $color }) => $color}cc 100%
    );
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  svg {
    position: relative;
    z-index: 1;
    transition: all 0.4s ease;
    filter: drop-shadow(0 2px 4px ${({ $color }) => $color}40);
  }

  ${Card}:hover & {
    transform: scale(1.15) rotate(8deg);
    animation: ${float} 2s ease-in-out infinite;

    &::before {
      opacity: 1;
    }

    &::after {
      opacity: 1;
    }

    svg {
      color: white;
      filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
    }
  }

  @media (max-width: 768px) {
    width: 52px;
    height: 52px;

    svg {
      width: 24px;
      height: 24px;
    }
  }

  @media (max-width: 480px) {
    width: 48px;
    height: 48px;

    svg {
      width: 22px;
      height: 22px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    ${Card}:hover & {
      transform: scale(1.05);
      animation: none;
    }
  }
`;

const SparkleIcon = styled(Sparkles)<{ $color: string }>`
  position: absolute;
  top: -4px;
  right: -4px;
  width: 14px;
  height: 14px;
  color: ${({ $color }) => $color};
  opacity: 0;
  transition: opacity 0.3s ease;
  animation: ${glowPulse} 1.5s ease-in-out infinite;

  ${Card}:hover & {
    opacity: 1;
  }
`;

// Hook for animated counter
function useAnimatedCounter(endValue: string, duration: number = 1000) {
  const [displayValue, setDisplayValue] = useState(endValue);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevValue = useRef(endValue);

  useEffect(() => {
    const extractNumber = (val: string) => {
      const match = val.replace(/[^0-9.-]/g, '');
      return parseFloat(match) || 0;
    };

    const startNum = extractNumber(prevValue.current);
    const endNum = extractNumber(endValue);

    if (startNum === endNum || prevValue.current === endValue) {
      prevValue.current = endValue;
      return;
    }

    setIsAnimating(true);
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentNum = startNum + (endNum - startNum) * easeOut;

      const prefix = endValue.match(/^[^0-9.-]*/)?.[0] || '';
      const suffix = endValue.match(/[^0-9.-]*$/)?.[0] || '';
      const decimals = (endValue.match(/\.(\d+)/)?.[1]?.length) || 0;
      const formattedNum = currentNum.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });

      setDisplayValue(`${prefix}${formattedNum}${suffix}`);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
        setIsAnimating(false);
        prevValue.current = endValue;
      }
    };

    requestAnimationFrame(animate);
  }, [endValue, duration]);

  return { displayValue, isAnimating };
}

export function StatCard({ title, value, icon: Icon, trend, color = '#6366f1' }: StatCardProps) {
  const { displayValue, isAnimating } = useAnimatedCounter(value, 800);

  return (
    <Card $color={color}>
      <ShimmerOverlay />
      <Content>
        <TitleRow>
          <Title>{title}</Title>
        </TitleRow>
        <ValueContainer>
          <Value>
            <AnimatedValue $isAnimating={isAnimating}>{displayValue}</AnimatedValue>
          </Value>
        </ValueContainer>
        {trend && (
          <Trend $isPositive={trend.isPositive}>
            {trend.isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{Math.abs(trend.value).toFixed(1)}% vs last month</span>
          </Trend>
        )}
      </Content>
      <IconWrapper $color={color}>
        <SparkleIcon $color={color} />
        <Icon size={28} />
      </IconWrapper>
    </Card>
  );
}
