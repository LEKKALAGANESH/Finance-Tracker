"use client";

import { useCurrency } from "@/context/CurrencyContext";
import { ArrowRight, PieChart as PieChartIcon, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Sector,
  Tooltip,
  TooltipProps,
} from "recharts";
import styled, { css, keyframes } from "styled-components";

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
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
`;

const gradientMove = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const Container = styled.div`
  background: ${({ theme }) => theme.glass.background};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.xl};
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);

  /* Animated gradient accent at top */
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(
      90deg,
      ${({ theme }) => theme.colors.secondary}00 0%,
      ${({ theme }) => theme.colors.secondary} 30%,
      ${({ theme }) => theme.colors.primary} 70%,
      ${({ theme }) => theme.colors.primary}00 100%
    );
    background-size: 200% 100%;
    animation: ${gradientMove} 4s ease infinite;
  }

  /* Background glow */
  &::after {
    content: "";
    position: absolute;
    bottom: -100px;
    left: -100px;
    width: 300px;
    height: 300px;
    background: radial-gradient(
      circle,
      ${({ theme }) => theme.colors.secondary}10 0%,
      transparent 70%
    );
    pointer-events: none;
  }

  &:hover {
    box-shadow:
      ${({ theme }) => theme.shadows.xl},
      0 8px 32px ${({ theme }) => theme.colors.secondary}15;
    transform: translateY(-4px);
    border-color: ${({ theme }) => theme.colors.secondary}30;
  }

  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing.lg};
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  position: relative;
  z-index: 1;
`;

const TitleSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const IconBadge = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.secondary}20 0%,
    ${({ theme }) => theme.colors.secondary}10 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.secondary};
  box-shadow: 0 4px 12px ${({ theme }) => theme.colors.secondary}15;
`;

const Title = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text};
`;

const ViewAllLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  transition: all 0.2s ease;

  svg {
    transition: transform 0.2s ease;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.primaryLight};
    svg {
      transform: translateX(3px);
    }
  }
`;

const ChartContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xl};
  position: relative;
  z-index: 1;

  @media (max-width: 640px) {
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.lg};
  }
`;

const ChartWrapper = styled.div`
  width: 220px;
  height: 220px;
  position: relative;
  animation: ${scaleIn} 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  flex-shrink: 0;

  .recharts-pie-sector {
    transition: all 0.3s ease !important;
    cursor: pointer;
  }

  @media (max-width: 640px) {
    width: 200px;
    height: 200px;
  }
`;

const CenterStats = styled.div<{ $isHidden?: boolean }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
  opacity: ${({ $isHidden }) => ($isHidden ? "0 !important" : 1)};
  visibility: ${({ $isHidden }) => ($isHidden ? "hidden" : "visible")};
  transition: opacity 0.15s ease, visibility 0.15s ease;
  animation: ${({ $isHidden }) =>
    $isHidden ? "none" : css`${fadeIn} 0.6s ease 0.3s forwards`};
`;

const CenterLabel = styled.span`
  display: block;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 4px;
`;

const CenterValue = styled.span`
  display: block;
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text};
  font-feature-settings: "tnum";
`;

const LegendContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  max-height: 220px;
  overflow-y: auto;

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.surfaceHover};
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 4px;
  }

  @media (max-width: 640px) {
    width: 100%;
    max-height: none;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }
`;

const LegendItem = styled.div<{ $color: string; $isActive?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme, $isActive }) =>
    $isActive ? theme.colors.surfaceHover : "transparent"};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
    border-color: ${({ $color }) => $color}30;
    transform: translateX(4px);
  }

  ${({ $isActive, $color }) =>
    $isActive &&
    `
    border-color: ${$color}40;
    box-shadow: 0 2px 8px ${$color}20;
  `}

  @media (max-width: 640px) {
    padding: ${({ theme }) => theme.spacing.xs}
      ${({ theme }) => theme.spacing.sm};
    &:hover {
      transform: none;
    }
  }
`;

const LegendDot = styled.div<{ $color: string }>`
  width: 12px;
  height: 12px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background: ${({ $color }) => $color};
  box-shadow: 0 2px 6px ${({ $color }) => $color}50;
  flex-shrink: 0;
`;

const LegendInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const LegendName = styled.span`
  display: block;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const LegendValue = styled.span`
  display: block;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textMuted};
  font-feature-settings: "tnum";
`;

const LegendPercent = styled.span<{ $color: string }>`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ $color }) => $color};
  padding: 2px 8px;
  background: ${({ $color }) => $color}15;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  flex-shrink: 0;
`;

const EmptyState = styled.div`
  height: 260px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  animation: ${fadeIn} 0.4s ease forwards;
  text-align: center;

  svg {
    width: 56px;
    height: 56px;
    opacity: 0.3;
    color: ${({ theme }) => theme.colors.textMuted};
  }

  p {
    max-width: 200px;
    line-height: 1.6;
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
  }
`;

const AddButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.primaryLight};
  color: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.primary};
  }
`;

const CustomTooltipContainer = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.md};
  box-shadow: ${({ theme }) => theme.shadows.xl};
  backdrop-filter: blur(10px);
  animation: ${fadeIn} 0.15s ease;
  min-width: 140px;
`;

const TooltipHeader = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  padding-bottom: ${({ theme }) => theme.spacing.sm};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const TooltipDot = styled.div<{ $color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  box-shadow: 0 0 8px ${({ $color }) => $color}60;
`;

const TooltipLabel = styled.p`
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const TooltipRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const TooltipValueLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textMuted};
`;

const TooltipValue = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text};
`;

// Active shape for pie chart hover
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } =
    props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 4}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{
          filter: `drop-shadow(0 4px 12px ${fill}60)`,
          transition: "all 0.3s ease",
        }}
      />
    </g>
  );
};

export function SpendingChart({
  data,
  title = "Spending by Category",
}: SpendingChartProps) {
  const { formatCurrency } = useCurrency();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const hasData = data && data.length > 0 && data.some((d) => d.value > 0);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const tooltipData = payload[0].payload as CategoryData;
      const percent = ((tooltipData.value / total) * 100).toFixed(1);
      return (
        <CustomTooltipContainer>
          <TooltipHeader $color={tooltipData.color}>
            <TooltipDot $color={tooltipData.color} />
            <TooltipLabel>{tooltipData.name}</TooltipLabel>
          </TooltipHeader>
          <TooltipRow>
            <TooltipValueLabel>Amount</TooltipValueLabel>
            <TooltipValue>{formatCurrency(tooltipData.value)}</TooltipValue>
          </TooltipRow>
          <TooltipRow style={{ marginTop: "4px" }}>
            <TooltipValueLabel>Share</TooltipValueLabel>
            <TooltipValue style={{ color: tooltipData.color }}>
              {percent}%
            </TooltipValue>
          </TooltipRow>
        </CustomTooltipContainer>
      );
    }
    return null;
  };

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  return (
    <Container>
      <Header>
        <TitleSection>
          <IconBadge>
            <PieChartIcon size={20} />
          </IconBadge>
          <Title>{title}</Title>
        </TitleSection>
        {hasData && (
          <ViewAllLink href="/reports">
            Details <ArrowRight size={16} />
          </ViewAllLink>
        )}
      </Header>

      {!hasData ? (
        <EmptyState>
          <PieChartIcon />
          <p>No spending data to display yet</p>
          <AddButton href="/expenses/add">
            <TrendingUp size={16} />
            Add Expense
          </AddButton>
        </EmptyState>
      ) : (
        <ChartContainer>
          <ChartWrapper>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                  animationEasing="ease-out"
                  activeIndex={activeIndex !== null ? activeIndex : undefined}
                  activeShape={renderActiveShape}
                  onMouseEnter={onPieEnter}
                  onMouseLeave={onPieLeave}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        activeIndex !== null && activeIndex !== index
                          ? `${entry.color}90`
                          : entry.color
                      }
                      stroke="none"
                      style={{
                        filter:
                          activeIndex === index
                            ? `drop-shadow(0 4px 12px ${entry.color}60) brightness(1.1)`
                            : activeIndex !== null
                              ? "brightness(0.85) saturate(0.7)"
                              : "none",
                        transition: "all 0.3s ease",
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <CenterStats $isHidden={activeIndex !== null}>
              <CenterLabel>Total</CenterLabel>
              <CenterValue>{formatCurrency(total)}</CenterValue>
            </CenterStats>
          </ChartWrapper>

          <LegendContainer>
            {data.map((item, index) => {
              const percent = ((item.value / total) * 100).toFixed(0);
              return (
                <LegendItem
                  key={item.name}
                  $color={item.color}
                  $isActive={activeIndex === index}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  <LegendDot $color={item.color} />
                  <LegendInfo>
                    <LegendName>{item.name}</LegendName>
                    <LegendValue>{formatCurrency(item.value)}</LegendValue>
                  </LegendInfo>
                  <LegendPercent $color={item.color}>{percent}%</LegendPercent>
                </LegendItem>
              );
            })}
          </LegendContainer>
        </ChartContainer>
      )}
    </Container>
  );
}
