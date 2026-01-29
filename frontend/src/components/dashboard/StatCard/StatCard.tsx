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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: ${fadeInUp} 0.5s ease forwards;

  /* Gradient accent at top */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, ${({ $color }) => $color}, ${({ $color }) => $color}80);
    opacity: 0.8;
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
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadows.lg}, 0 4px 20px ${({ $color }) => $color}20;
    border-color: ${({ $color }) => $color}30;
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
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textMuted};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const Value = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text};
  letter-spacing: -0.02em;
  font-feature-settings: 'tnum';
  display: inline-block;
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
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme, $isPositive }) =>
    $isPositive ? theme.colors.success : theme.colors.error};
  margin-top: ${({ theme }) => theme.spacing.sm};
  padding: 4px 10px;
  background: ${({ theme, $isPositive }) =>
    $isPositive ? theme.colors.successLight : theme.colors.errorLight};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  width: fit-content;

  svg {
    transition: transform 0.2s ease;
  }

  &:hover svg {
    transform: ${({ $isPositive }) => ($isPositive ? 'translateY(-2px)' : 'translateY(2px)')};
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
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px ${({ $color }) => $color}15;

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
