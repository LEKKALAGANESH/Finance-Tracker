'use client';

import { useEffect, useState, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
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
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const Card = styled.div<{ $color: string }>`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);

  /* Gradient accent at top */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, ${({ $color }) => $color}, ${({ $color }) => $color}80);
    opacity: 0.9;
    transition: height 0.3s ease;
  }

  /* Subtle background gradient */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 150px;
    height: 150px;
    background: radial-gradient(circle, ${({ $color }) => $color}08 0%, transparent 70%);
    pointer-events: none;
    transition: transform 0.5s ease;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadows.lg}, 0 4px 24px ${({ $color }) => $color}25;
    border-color: ${({ $color }) => $color}40;

    &::before {
      height: 5px;
    }

    &::after {
      transform: scale(1.2);
    }
  }

  &:active {
    transform: translateY(-2px);
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing.md};
  }

  @media (max-width: 480px) {
    padding: ${({ theme }) => theme.spacing.md};
    flex-direction: row-reverse;
    gap: ${({ theme }) => theme.spacing.sm};
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    transition: none;

    &:hover {
      transform: none;
    }
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  position: relative;
  z-index: 1;
`;

const Title = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textMuted};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  text-transform: uppercase;
  letter-spacing: 0.08em;

  @media (max-width: 480px) {
    font-size: 0.7rem;
  }
`;

const Value = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text};
  letter-spacing: -0.02em;
  font-feature-settings: 'tnum';
  display: inline-block;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  }

  @media (max-width: 480px) {
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
  }
`;

const AnimatedValue = styled.span<{ $isAnimating: boolean }>`
  display: inline-block;
  transition: transform 0.3s ease;

  ${({ $isAnimating }) =>
    $isAnimating &&
    `
    animation: ${pulse} 0.3s ease;
  `}
`;

const Trend = styled.div<{ $isPositive: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme, $isPositive }) =>
    $isPositive ? theme.colors.success : theme.colors.error};
  margin-top: ${({ theme }) => theme.spacing.sm};
  padding: 4px 10px;
  background: ${({ theme, $isPositive }) =>
    $isPositive ? theme.colors.successLight : theme.colors.errorLight};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  width: fit-content;
  transition: all 0.2s ease;

  svg {
    transition: transform 0.2s ease;
    flex-shrink: 0;
  }

  &:hover {
    transform: scale(1.02);
  }

  &:hover svg {
    transform: ${({ $isPositive }) => ($isPositive ? 'translateY(-2px)' : 'translateY(2px)')};
  }

  @media (max-width: 480px) {
    font-size: 0.65rem;
    padding: 3px 8px;

    svg {
      width: 12px;
      height: 12px;
    }
  }
`;

const IconWrapper = styled.div<{ $color: string }>`
  width: 56px;
  height: 56px;
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  background: linear-gradient(135deg, ${({ $color }) => $color}20 0%, ${({ $color }) => $color}10 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ $color }) => $color};
  position: relative;
  z-index: 1;
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  box-shadow: 0 4px 12px ${({ $color }) => $color}15;
  flex-shrink: 0;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(135deg, ${({ $color }) => $color} 0%, ${({ $color }) => $color}cc 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  svg {
    position: relative;
    z-index: 1;
    transition: all 0.3s ease;
  }

  ${Card}:hover & {
    transform: scale(1.1) rotate(5deg);

    &::before {
      opacity: 1;
    }

    svg {
      color: white;
    }
  }

  @media (max-width: 768px) {
    width: 48px;
    height: 48px;

    svg {
      width: 22px;
      height: 22px;
    }
  }

  @media (max-width: 480px) {
    width: 44px;
    height: 44px;

    svg {
      width: 20px;
      height: 20px;
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    ${Card}:hover & {
      transform: none;
    }
  }
`;

// Hook for animated counter
function useAnimatedCounter(endValue: string, duration: number = 1000) {
  const [displayValue, setDisplayValue] = useState(endValue);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevValue = useRef(endValue);

  useEffect(() => {
    // Extract number from value (handles currency format like "$1,234.56")
    const extractNumber = (val: string) => {
      const match = val.replace(/[^0-9.-]/g, '');
      return parseFloat(match) || 0;
    };

    const startNum = extractNumber(prevValue.current);
    const endNum = extractNumber(endValue);

    // If values are the same or it's the initial render, don't animate
    if (startNum === endNum || prevValue.current === endValue) {
      prevValue.current = endValue;
      return;
    }

    setIsAnimating(true);
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);

      const currentNum = startNum + (endNum - startNum) * easeOut;

      // Reconstruct the formatted value
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
      <Content>
        <Title>{title}</Title>
        <Value>
          <AnimatedValue $isAnimating={isAnimating}>{displayValue}</AnimatedValue>
        </Value>
        {trend && (
          <Trend $isPositive={trend.isPositive}>
            {trend.isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{Math.abs(trend.value)}% vs last month</span>
          </Trend>
        )}
      </Content>
      <IconWrapper $color={color}>
        <Icon size={26} />
      </IconWrapper>
    </Card>
  );
}
