'use client';

import styled from 'styled-components';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

interface SpendingChartProps {
  data: CategoryData[];
  title?: string;
}

const Container = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const Title = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const ChartWrapper = styled.div`
  height: 300px;
`;

const EmptyState = styled.div`
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const CustomTooltipContainer = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  box-shadow: ${({ theme }) => theme.shadows.md};
`;

const TooltipLabel = styled.p`
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text};
`;

const TooltipValue = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <CustomTooltipContainer>
        <TooltipLabel>{data.name}</TooltipLabel>
        <TooltipValue>{formatCurrency(data.value)}</TooltipValue>
      </CustomTooltipContainer>
    );
  }
  return null;
};

export function SpendingChart({ data, title = 'Spending by Category' }: SpendingChartProps) {
  const hasData = data && data.length > 0 && data.some(d => d.value > 0);

  return (
    <Container>
      <Title>{title}</Title>
      <ChartWrapper>
        {!hasData ? (
          <EmptyState>No spending data to display</EmptyState>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => (
                  <span style={{ color: 'inherit', fontSize: '0.875rem' }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </ChartWrapper>
    </Container>
  );
}
