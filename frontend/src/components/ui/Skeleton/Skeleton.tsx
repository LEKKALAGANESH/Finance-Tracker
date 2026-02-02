'use client';

import styled, { keyframes, css } from 'styled-components';

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  variant?: 'rectangular' | 'circular' | 'text';
  animation?: 'shimmer' | 'pulse';
}

const shimmerAnimation = css`
  animation: ${shimmer} 1.5s ease-in-out infinite;
`;

const pulseAnimation = css`
  animation: ${pulse} 2s ease-in-out infinite;
`;

const SkeletonBase = styled.div<{
  $width: string;
  $height: string;
  $borderRadius: string;
  $animation: 'shimmer' | 'pulse';
}>`
  width: ${({ $width }) => $width};
  height: ${({ $height }) => $height};
  border-radius: ${({ $borderRadius }) => $borderRadius};

  ${({ $animation, theme }) =>
    $animation === 'shimmer'
      ? css`
          background: linear-gradient(
            90deg,
            ${theme.colors.surfaceHover} 0%,
            ${theme.colors.border} 50%,
            ${theme.colors.surfaceHover} 100%
          );
          background-size: 200% 100%;
          ${shimmerAnimation}
        `
      : css`
          background: ${theme.colors.surfaceHover};
          ${pulseAnimation}
        `}
`;

export function Skeleton({
  width = '100%',
  height = '20px',
  borderRadius,
  variant = 'rectangular',
  animation = 'shimmer',
}: SkeletonProps) {
  const getRadius = () => {
    if (borderRadius) return borderRadius;
    switch (variant) {
      case 'circular':
        return '50%';
      case 'text':
        return '4px';
      default:
        return '8px';
    }
  };

  return (
    <SkeletonBase
      $width={variant === 'circular' ? height : width}
      $height={height}
      $borderRadius={getRadius()}
      $animation={animation}
    />
  );
}

// Skeleton Card Component
const SkeletonCardWrapper = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

export function SkeletonCard() {
  return (
    <SkeletonCardWrapper>
      <Skeleton height="24px" width="60%" />
      <Skeleton height="40px" width="80%" />
      <Skeleton height="16px" width="40%" />
    </SkeletonCardWrapper>
  );
}

// Skeleton Stat Card Component
const SkeletonStatCardWrapper = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const SkeletonStatContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export function SkeletonStatCard() {
  return (
    <SkeletonStatCardWrapper>
      <Skeleton variant="circular" height="48px" />
      <SkeletonStatContent>
        <Skeleton height="14px" width="60%" />
        <Skeleton height="28px" width="80%" />
        <Skeleton height="12px" width="40%" />
      </SkeletonStatContent>
    </SkeletonStatCardWrapper>
  );
}

// Skeleton List Component
const SkeletonListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const SkeletonListItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const SkeletonListContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const SkeletonListRight = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: ${({ theme }) => theme.spacing.xs};
`;

interface SkeletonListProps {
  count?: number;
}

export function SkeletonList({ count = 5 }: SkeletonListProps) {
  return (
    <SkeletonListWrapper>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonListItem key={index}>
          <Skeleton variant="circular" height="40px" />
          <SkeletonListContent>
            <Skeleton height="16px" width="70%" />
            <Skeleton height="12px" width="40%" />
          </SkeletonListContent>
          <SkeletonListRight>
            <Skeleton height="16px" width="60px" />
            <Skeleton height="12px" width="40px" />
          </SkeletonListRight>
        </SkeletonListItem>
      ))}
    </SkeletonListWrapper>
  );
}

// Skeleton Chart Component
const SkeletonChartWrapper = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const SkeletonChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const SkeletonChartBody = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 200px;
  gap: ${({ theme }) => theme.spacing.md};
  padding-top: ${({ theme }) => theme.spacing.md};
`;

export function SkeletonChart() {
  const barHeights = [60, 80, 45, 90, 70, 55, 85];

  return (
    <SkeletonChartWrapper>
      <SkeletonChartHeader>
        <Skeleton height="20px" width="150px" />
        <Skeleton height="32px" width="100px" borderRadius="8px" />
      </SkeletonChartHeader>
      <SkeletonChartBody>
        {barHeights.map((height, index) => (
          <Skeleton
            key={index}
            height={`${height}%`}
            width="30px"
            borderRadius="4px 4px 0 0"
          />
        ))}
      </SkeletonChartBody>
    </SkeletonChartWrapper>
  );
}

// Skeleton Dashboard Component (combines multiple skeletons)
const SkeletonDashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const SkeletonContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const SkeletonTransactionsWrapper = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const SkeletonHeader = styled.div`
  margin-bottom: 24px;
`;

const SkeletonHeaderSubtitle = styled.div`
  margin-top: 8px;
`;

const SkeletonListHeader = styled.div`
  margin-bottom: 16px;
`;

export function SkeletonDashboard() {
  return (
    <>
      <SkeletonHeader>
        <Skeleton height="32px" width="250px" />
        <SkeletonHeaderSubtitle>
          <Skeleton height="16px" width="300px" />
        </SkeletonHeaderSubtitle>
      </SkeletonHeader>
      <SkeletonDashboardGrid>
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
      </SkeletonDashboardGrid>
      <SkeletonContentGrid>
        <SkeletonChart />
        <SkeletonTransactionsWrapper>
          <SkeletonListHeader>
            <Skeleton height="20px" width="180px" />
          </SkeletonListHeader>
          <SkeletonList count={5} />
        </SkeletonTransactionsWrapper>
      </SkeletonContentGrid>
    </>
  );
}

// Skeleton Table Component
const SkeletonTableWrapper = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  overflow: hidden;
`;

const SkeletonTableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.surfaceHover};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const SkeletonTableRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

interface SkeletonTableProps {
  rows?: number;
}

export function SkeletonTable({ rows = 5 }: SkeletonTableProps) {
  return (
    <SkeletonTableWrapper>
      <SkeletonTableHeader>
        <Skeleton height="14px" width="60%" />
        <Skeleton height="14px" width="50%" />
        <Skeleton height="14px" width="70%" />
        <Skeleton height="14px" width="40%" />
      </SkeletonTableHeader>
      {Array.from({ length: rows }).map((_, index) => (
        <SkeletonTableRow key={index}>
          <Skeleton height="16px" width="80%" />
          <Skeleton height="16px" width="60%" />
          <Skeleton height="16px" width="50%" />
          <Skeleton height="16px" width="70%" />
        </SkeletonTableRow>
      ))}
    </SkeletonTableWrapper>
  );
}
