'use client';

import styled, { keyframes } from 'styled-components';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  TooltipProps,
} from 'recharts';
import { useCurrency } from '@/context/CurrencyContext';
import { PieChart as PieChartIcon } from 'lucide-react';

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

interface SpendingChartProps {
  data: CategoryData[];
  title?: string;
}

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const Container = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.lg};
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
    height: 3px;
    background: linear-gradient(
      90deg,
      ${({ theme }) => theme.colors.secondary} 0%,
      ${({ theme }) => theme.colors.primary} 100%
    );
    opacity: 0.7;
  }

  /* Decorative background */
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 200px;
    height: 200px;
    background: radial-gradient(
      circle,
      ${({ theme }) => theme.colors.secondary}05 0%,
      transparent 70%
    );
    pointer-events: none;
  }

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.lg};
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing.md};
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Title = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  svg {
    color: ${({ theme }) => theme.colors.secondary};
  }
`;

const ChartWrapper = styled.div`
  height: 300px;
  animation: ${scaleIn} 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: 0.2s;
  opacity: 0;
  position: relative;
  z-index: 1;

  @media (max-width: 480px) {
    height: 260px;
  }

  /* Ensure chart cells have smooth hover transitions */
  .recharts-pie-sector {
    transition: all 0.2s ease !important;
  }
`;

const EmptyState = styled.div`
  height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  animation: ${fadeIn} 0.4s ease forwards;

  svg {
    width: 48px;
    height: 48px;
    opacity: 0.4;
    color: ${({ theme }) => theme.colors.textMuted};
  }

  p {
    text-align: center;
    max-width: 200px;
    line-height: 1.5;
  }
`;

const CustomTooltipContainer = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  backdrop-filter: ${({ theme }) => theme.glass.blur};
  animation: ${fadeIn} 0.15s ease;
`;

const TooltipLabel = styled.p`
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 2px;
`;

const TooltipValue = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

export function SpendingChart({ data, title = 'Spending by Category' }: SpendingChartProps) {
  const { formatCurrency } = useCurrency();
  const hasData = data && data.length > 0 && data.some(d => d.value > 0);

  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const tooltipData = payload[0].payload as CategoryData;
      return (
        <CustomTooltipContainer>
          <TooltipLabel>{tooltipData.name}</TooltipLabel>
          <TooltipValue>{formatCurrency(tooltipData.value)}</TooltipValue>
        </CustomTooltipContainer>
      );
    }
    return null;
  };

  return (
    <Container>
      <Header>
        <Title>
          <PieChartIcon size={20} />
          {title}
        </Title>
      </Header>
      <ChartWrapper>
        {!hasData ? (
          <EmptyState>
            <PieChartIcon />
            <p>No spending data to display yet</p>
          </EmptyState>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                animationBegin={300}
                animationDuration={800}
                animationEasing="ease-out"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    style={{
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                      cursor: 'pointer',
                    }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                wrapperStyle={{ paddingTop: '16px' }}
                formatter={(value) => (
                  <span style={{ color: 'inherit', fontSize: '0.8rem', fontWeight: 500 }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </ChartWrapper>
    </Container>
  );
}
