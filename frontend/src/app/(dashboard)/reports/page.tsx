"use client";

import {
  Activity,
  BarChart3,
  Download,
  PieChart as PieChartIcon,
  Sparkles,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import styled, { keyframes, useTheme } from "styled-components";

import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Loader } from "@/components/ui/Loader";
import { Select } from "@/components/ui/Select";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useToast } from "@/context/ToastContext";
import { getSupabaseClient } from "@/lib/supabase/client";

// Import recharts components
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// ============================================================================
// TypeScript Interfaces
// ============================================================================

interface CategoryDataItem {
  name: string;
  value: number;
  color: string;
  icon: string;
  percentage?: number;
}

interface DailyDataItem {
  day: string;
  spent: number;
  saved: number;
}

interface MonthlyTrendItem {
  month: string;
  spent: number;
  saved: number;
}

interface CategoryInfo {
  id: string;
  name: string;
  icon: string;
  color: string;
}

// ============================================================================
// Animations
// ============================================================================

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

const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const gradientMove = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-4px) rotate(2deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
`;

const glowPulse = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.3); }
  50% { box-shadow: 0 0 40px rgba(99, 102, 241, 0.5); }
`;

// ============================================================================
// Styled Components
// ============================================================================

const PageContainer = styled.div`
  animation: ${fadeInUp} 0.5s ease;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const PageTitleSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const PageTitle = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize["3xl"]};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.text} 0%,
    ${({ theme }) => theme.colors.primary} 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;

  @media (max-width: 480px) {
    font-size: ${({ theme }) => theme.typography.fontSize["2xl"]};
  }
`;

const PageSubtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textMuted};
`;

const FilterBar = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: center;
  flex-wrap: wrap;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.glass.background};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  box-shadow: ${({ theme }) => theme.shadows.md};

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.sm};

    > * {
      width: 100%;
    }
  }
`;

// ============================================================================
// Stats Cards Grid
// ============================================================================

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const StatCardWrapper = styled.div<{ $color: string; $delay: number }>`
  background: ${({ theme }) => theme.glass.background};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.xl};
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  animation: ${fadeInUp} 0.5s ease forwards;
  animation-delay: ${({ $delay }) => $delay}ms;
  opacity: 0;

  /* Top gradient border */
  &::before {
    content: "";
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
  }

  /* Glow effect */
  &::after {
    content: "";
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(
      circle at center,
      ${({ $color }) => $color}10 0%,
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
      0 8px 32px ${({ $color }) => $color}25;
    border-color: ${({ $color }) => $color}40;

    &::after {
      opacity: 1;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: 1;
    &:hover {
      transform: none;
    }
    &::before {
      animation: none;
    }
  }
`;

const StatContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
  z-index: 1;
`;

const StatInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const StatLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.1em;
`;

const StatValue = styled.span`
  font-size: 2rem;
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text};
  letter-spacing: -0.03em;
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
`;

const StatSubtext = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textMuted};
`;

const StatIconWrapper = styled.div<{ $color: string }>`
  width: 56px;
  height: 56px;
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
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  box-shadow: 0 4px 16px ${({ $color }) => $color}20;
  flex-shrink: 0;

  &::after {
    content: "";
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
    transition: all 0.3s ease;
  }

  ${StatCardWrapper}:hover & {
    transform: scale(1.1) rotate(5deg);

    &::after {
      opacity: 1;
    }

    svg {
      color: white;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    ${StatCardWrapper}:hover & {
      transform: scale(1.05);
    }
  }
`;

// ============================================================================
// Charts Section
// ============================================================================

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled(Card)<{ $accentColor?: string }>`
  animation: ${fadeInUp} 0.5s ease forwards;
  animation-delay: 300ms;
  opacity: 0;
  overflow: hidden;
  position: relative;
  background: ${({ theme }) =>
    `linear-gradient(135deg, ${theme.colors.surface} 0%, ${theme.colors.surfaceHover}40 100%)`};
  border: 1px solid ${({ theme }) => theme.colors.border};
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);

  /* Premium gradient overlay */
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 120px;
    background: ${({ theme, $accentColor }) =>
      `linear-gradient(180deg, ${$accentColor || theme.colors.primary}08 0%, transparent 100%)`};
    pointer-events: none;
    z-index: 0;
  }

  /* Inner glow line at top */
  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 20%;
    right: 20%;
    height: 1px;
    background: ${({ theme, $accentColor }) =>
      `linear-gradient(90deg, transparent, ${$accentColor || theme.colors.primary}40, transparent)`};
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow:
      ${({ theme }) => theme.shadows.xl},
      0 8px 32px ${({ theme }) => theme.colors.primary}15;
    border-color: ${({ theme }) => theme.colors.primary}30;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: 1;
    &:hover {
      transform: none;
    }
  }
`;

const ChartContainer = styled.div`
  height: 320px;
  padding: ${({ theme }) => theme.spacing.md};

  @media (max-width: 480px) {
    height: 280px;
    padding: ${({ theme }) => theme.spacing.sm};
  }

  /* Pie chart label text color */
  .recharts-pie-label-text {
    fill: ${({ theme }) => theme.colors.text} !important;
    font-weight: 600;
  }

  /* Legend text styling */
  .recharts-legend-item-text {
    color: ${({ theme }) => theme.colors.text} !important;
    font-weight: 600 !important;
  }

  /* Grid lines */
  .recharts-cartesian-grid-horizontal line,
  .recharts-cartesian-grid-vertical line {
    stroke: ${({ theme }) => theme.colors.border};
    opacity: 0.4;
  }

  /* Axis tick text */
  .recharts-cartesian-axis-tick-value {
    fill: ${({ theme }) => theme.colors.textMuted};
    font-weight: 500;
  }

  /* Active dot glow effect */
  .recharts-active-dot {
    filter: drop-shadow(0 0 8px currentColor);
  }
`;

const FullWidthChartCard = styled(ChartCard)`
  grid-column: 1 / -1;
`;

const DailyChartCard = styled(Card)`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  animation: ${fadeInUp} 0.5s ease forwards;
  animation-delay: 400ms;
  opacity: 0;
  overflow: hidden;
  position: relative;
  background: ${({ theme }) =>
    `linear-gradient(135deg, ${theme.colors.surface} 0%, ${theme.colors.surfaceHover}40 100%)`};
  border: 1px solid ${({ theme }) => theme.colors.border};
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);

  /* Premium gradient overlay - orange/amber accent for daily activity */
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 120px;
    background: linear-gradient(
      180deg,
      rgba(245, 158, 11, 0.06) 0%,
      transparent 100%
    );
    pointer-events: none;
    z-index: 0;
  }

  /* Inner glow line at top */
  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 15%;
    right: 15%;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(245, 158, 11, 0.4),
      transparent
    );
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow:
      ${({ theme }) => theme.shadows.xl},
      0 8px 32px rgba(245, 158, 11, 0.12);
    border-color: rgba(245, 158, 11, 0.3);
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: 1;
    &:hover {
      transform: none;
    }
  }
`;

// ============================================================================
// Category Breakdown Table
// ============================================================================

const TableCard = styled(Card)`
  animation: ${fadeInUp} 0.5s ease forwards;
  animation-delay: 500ms;
  opacity: 0;
  overflow: hidden;
  position: relative;
  background: ${({ theme }) =>
    `linear-gradient(145deg, ${theme.colors.surface} 0%, ${theme.colors.surfaceHover}30 100%)`};
  border: 1px solid ${({ theme }) => theme.colors.border};
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);

  /* Premium gradient overlay - purple accent for breakdown */
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 100px;
    background: linear-gradient(
      180deg,
      rgba(139, 92, 246, 0.05) 0%,
      transparent 100%
    );
    pointer-events: none;
    z-index: 0;
  }

  /* Inner glow line at top */
  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 10%;
    right: 10%;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(139, 92, 246, 0.35),
      transparent
    );
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow:
      ${({ theme }) => theme.shadows.xl},
      0 8px 32px rgba(139, 92, 246, 0.1);
    border-color: rgba(139, 92, 246, 0.25);
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: 1;
    &:hover {
      transform: none;
    }
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.surfaceHover};
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 3px;
  }
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
`;

const TableHead = styled.thead`
  background: ${({ theme }) => theme.colors.surfaceHover}50;
`;

const TableHeaderCell = styled.th`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  text-align: left;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  white-space: nowrap;
`;

const TableRow = styled.tr`
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover}50;
  }

  &:not(:last-child) td {
    border-bottom: 1px solid ${({ theme }) => theme.colors.border}60;
  }
`;

const TableCell = styled.td`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  vertical-align: middle;
`;

const CategoryCell = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const CategoryIconBadge = styled.div<{ $color: string }>`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: ${({ $color }) => `${$color}15`};
  border: 1px solid ${({ $color }) => `${$color}30`};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  transition: all 0.2s ease;
  flex-shrink: 0;

  ${TableRow}:hover & {
    transform: scale(1.1);
    background: ${({ $color }) => `${$color}25`};
  }
`;

const CategoryName = styled.span`
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text};
`;

const AmountCell = styled.span`
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  font-feature-settings: "tnum";
  color: ${({ theme }) => theme.colors.text};
`;

const PercentageCell = styled.span<{ $value: number }>`
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme, $value }) =>
    $value >= 30
      ? theme.colors.error
      : $value >= 15
        ? theme.colors.warning
        : theme.colors.success};
  font-feature-settings: "tnum";
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  min-width: 120px;
  max-width: 200px;
`;

const ProgressBarTrack = styled.div`
  height: 8px;
  background: ${({ theme }) => theme.colors.surfaceHover};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  overflow: hidden;
  position: relative;
`;

const ProgressBarFill = styled.div<{ $percentage: number; $color: string }>`
  height: 100%;
  width: ${({ $percentage }) => Math.min($percentage, 100)}%;
  background: linear-gradient(
    90deg,
    ${({ $color }) => $color} 0%,
    ${({ $color }) => $color}cc 100%
  );
  border-radius: ${({ theme }) => theme.borderRadius.full};
  transition: width 0.5s ease;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.3) 50%,
      transparent 100%
    );
    animation: ${shimmer} 2s infinite;
  }
`;

// ============================================================================
// Empty State
// ============================================================================

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing["2xl"]};
  text-align: center;
  color: ${({ theme }) => theme.colors.textMuted};
  gap: ${({ theme }) => theme.spacing.md};

  svg {
    opacity: 0.5;
  }
`;

// ============================================================================
// Chart Tooltip & Legend Styled Components
// ============================================================================

const TooltipContainer = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: ${({ theme }) => theme.shadows.xl};
  min-width: 160px;
`;

const TooltipLabel = styled.p`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 700;
  font-size: 14px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  letter-spacing: -0.01em;
`;

const TooltipRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin: 8px 0;
`;

const TooltipDotWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TooltipDot = styled.div<{ $color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  box-shadow: 0 0 8px ${({ $color }) => `${$color}60`};
`;

const TooltipName = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 13px;
  font-weight: 500;
`;

const TooltipValue = styled.span`
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
  font-weight: 700;
  font-feature-settings: "tnum";
`;

const LegendContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 24px;
  padding-top: 16px;
  flex-wrap: wrap;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: ${({ theme }) => theme.colors.surfaceHover};
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const LegendDot = styled.div<{ $color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  box-shadow: 0 0 8px ${({ $color }) => `${$color}50`};
`;

const LegendText = styled.span`
  color: ${({ theme }) => theme.colors.text};
  font-size: 13px;
  font-weight: 600;
`;

const PieTooltipContainer = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 14px 18px;
  box-shadow: ${({ theme }) => theme.shadows.xl};
  min-width: 140px;
`;

const PieTooltipHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
`;

const PieTooltipDot = styled.div<{ $color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 4px;
  background: ${({ $color }) => $color};
  box-shadow: 0 0 10px ${({ $color }) => `${$color}60`};
`;

const PieTooltipTitle = styled.span`
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.01em;
`;

const PieTooltipBody = styled.div`
  padding-top: 8px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const PieTooltipRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
`;

const PieTooltipLabel = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 12px;
  font-weight: 500;
`;

const PieTooltipValue = styled.span`
  color: ${({ theme }) => theme.colors.text};
  font-size: 15px;
  font-weight: 700;
  font-feature-settings: "tnum";
`;

// ============================================================================
// Constants
// ============================================================================

const COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

const MONTHS = [
  { value: "all", label: "All Time" },
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

// ============================================================================
// Main Component
// ============================================================================

export default function ReportsPage() {
  const { user } = useAuth();
  const { currency, formatCurrency } = useCurrency();
  const toast = useToast();
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(
    (new Date().getMonth() + 1).toString(),
  );
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString(),
  );

  const [stats, setStats] = useState({
    totalSpent: 0,
    totalSaved: 0,
    avgPerDay: 0,
    transactions: 0,
    topCategory: "",
  });
  const [categoryData, setCategoryData] = useState<CategoryDataItem[]>([]);
  const [dailyData, setDailyData] = useState<DailyDataItem[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrendItem[]>([]);

  const years = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { value: year.toString(), label: year.toString() };
  });

  // Theme-aware chart colors
  const chartColors = {
    grid: theme.colors.border,
    axis: theme.colors.textMuted,
    spent: "#ef4444",
    saved: "#10b981",
    tooltipBg: theme.glass.backgroundStrong,
    tooltipBorder: theme.colors.border,
    text: theme.colors.text,
  };

  const fetchReportData = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    const supabase = getSupabaseClient();

    try {
      let startDate: string | null = null;
      let endDate: string | null = null;
      let daysInPeriod = 30;

      if (selectedMonth !== "all") {
        const month = parseInt(selectedMonth);
        const year = parseInt(selectedYear);
        startDate = new Date(year, month - 1, 1).toISOString().split("T")[0];
        endDate = new Date(year, month, 0).toISOString().split("T")[0];
        daysInPeriod = new Date(year, month, 0).getDate();
      }

      let expenseQuery = supabase
        .from("expenses")
        .select("*, category:categories(id, name, icon, color)")
        .eq("user_id", user.id)
        .order("date", { ascending: true });

      if (startDate && endDate) {
        expenseQuery = expenseQuery.gte("date", startDate).lte("date", endDate);
      }

      let contributionsQuery = supabase
        .from("goal_contributions")
        .select("*, goal:goals(id, name, icon, color)")
        .eq("user_id", user.id)
        .order("date", { ascending: true });

      if (startDate && endDate) {
        contributionsQuery = contributionsQuery
          .gte("date", startDate)
          .lte("date", endDate);
      }

      const [expensesResult, contributionsResult] = await Promise.all([
        expenseQuery,
        contributionsQuery,
      ]);

      const expenses = expensesResult.data;
      const contributions = contributionsResult.data;

      type ExpenseData = {
        amount: number;
        date: string;
        category_id: string;
        category?: { id: string; name: string; icon: string; color: string };
      };

      type ContributionData = {
        amount: number;
        date: string;
        goal?: { id: string; name: string; icon: string; color: string };
      };

      const totalSpent =
        expenses?.reduce((sum: number, e: ExpenseData) => sum + e.amount, 0) ||
        0;
      const totalSaved =
        contributions?.reduce(
          (sum: number, c: ContributionData) => sum + c.amount,
          0,
        ) || 0;

      if (selectedMonth === "all" && expenses && expenses.length > 0) {
        const firstDate = new Date(expenses[0].date);
        const today = new Date();
        daysInPeriod = Math.max(
          1,
          Math.ceil(
            (today.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24),
          ),
        );
      }

      const avgPerDay = totalSpent / daysInPeriod;

      const categoryTotals: Record<
        string,
        { name: string; value: number; color: string; icon: string }
      > = {};
      (expenses || []).forEach((e: ExpenseData) => {
        const catId = e.category_id || "other";
        const catName = e.category?.name || "Other";
        const catColor = e.category?.color || "#6b7280";
        const catIcon = e.category?.icon || "📦";

        if (!categoryTotals[catId]) {
          categoryTotals[catId] = {
            name: catName,
            value: 0,
            color: catColor,
            icon: catIcon,
          };
        }
        categoryTotals[catId].value += e.amount;
      });

      const sortedCategories = Object.values(categoryTotals).sort(
        (a, b) => b.value - a.value,
      );
      const topCategory = sortedCategories[0]?.name || "N/A";

      const totalTransactions =
        (expenses?.length || 0) + (contributions?.length || 0);

      setStats({
        totalSpent,
        totalSaved,
        avgPerDay,
        transactions: totalTransactions,
        topCategory,
      });

      setCategoryData(
        sortedCategories.map((c, i) => ({
          ...c,
          color: c.color || COLORS[i % COLORS.length],
        })),
      );

      if (selectedMonth !== "all") {
        const month = parseInt(selectedMonth);
        const year = parseInt(selectedYear);
        const daysInMonth = new Date(year, month, 0).getDate();

        const dailyTotals: Record<string, { spent: number; saved: number }> =
          {};
        (expenses || []).forEach((e: ExpenseData) => {
          const day = new Date(e.date).getDate().toString();
          if (!dailyTotals[day]) dailyTotals[day] = { spent: 0, saved: 0 };
          dailyTotals[day].spent += e.amount;
        });
        (contributions || []).forEach((c: ContributionData) => {
          const day = new Date(c.date).getDate().toString();
          if (!dailyTotals[day]) dailyTotals[day] = { spent: 0, saved: 0 };
          dailyTotals[day].saved += c.amount;
        });

        const dailyChartData = Array.from({ length: daysInMonth }, (_, i) => ({
          day: (i + 1).toString(),
          spent: dailyTotals[(i + 1).toString()]?.spent || 0,
          saved: dailyTotals[(i + 1).toString()]?.saved || 0,
        }));
        setDailyData(dailyChartData);
      } else {
        setDailyData([]);
      }

      const trendData = [];
      const baseMonth =
        selectedMonth === "all"
          ? new Date().getMonth() + 1
          : parseInt(selectedMonth);
      const baseYear = parseInt(selectedYear);

      for (let i = 5; i >= 0; i--) {
        const trendDate = new Date(baseYear, baseMonth - 1 - i, 1);
        const trendStart = trendDate.toISOString().split("T")[0];
        const trendEnd = new Date(
          trendDate.getFullYear(),
          trendDate.getMonth() + 1,
          0,
        )
          .toISOString()
          .split("T")[0];

        const [monthExpensesResult, monthContributionsResult] =
          await Promise.all([
            supabase
              .from("expenses")
              .select("amount")
              .eq("user_id", user.id)
              .gte("date", trendStart)
              .lte("date", trendEnd),
            supabase
              .from("goal_contributions")
              .select("amount")
              .eq("user_id", user.id)
              .gte("date", trendStart)
              .lte("date", trendEnd),
          ]);

        const monthSpent =
          monthExpensesResult.data?.reduce(
            (sum: number, e: { amount: number }) => sum + e.amount,
            0,
          ) || 0;
        const monthSaved =
          monthContributionsResult.data?.reduce(
            (sum: number, c: { amount: number }) => sum + c.amount,
            0,
          ) || 0;

        trendData.push({
          month: trendDate.toLocaleString("default", { month: "short" }),
          spent: monthSpent,
          saved: monthSaved,
        });
      }
      setMonthlyTrend(trendData);
    } catch (error) {
      console.error("Error fetching report data:", error);
      toast.error("Failed to load report data");
    } finally {
      setIsLoading(false);
    }
  }, [user, selectedMonth, selectedYear, toast]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const exportToCSV = async () => {
    if (!user) return;

    const supabase = getSupabaseClient();
    const month = parseInt(selectedMonth);
    const year = parseInt(selectedYear);
    const startDate = new Date(year, month - 1, 1).toISOString().split("T")[0];
    const endDate = new Date(year, month, 0).toISOString().split("T")[0];

    const { data: expenses } = await supabase
      .from("expenses")
      .select("*, category:categories(name)")
      .eq("user_id", user.id)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true });

    if (!expenses || expenses.length === 0) {
      toast.error("No data to export");
      return;
    }

    type ExportExpense = {
      date: string;
      description: string;
      amount: number;
      payment_method: string;
      category?: { name: string };
    };

    const headers = [
      "Date",
      "Category",
      "Description",
      "Amount",
      "Payment Method",
    ];
    const rows = expenses.map((e: ExportExpense) => [
      e.date,
      e.category?.name || "Other",
      e.description,
      e.amount.toFixed(2),
      e.payment_method,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((r: string[]) => r.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `expenses_${year}_${month.toString().padStart(2, "0")}.csv`;
    link.click();

    toast.success("Report exported successfully!");
  };

  // Custom tooltip component for better styling - Premium dark/light mode support
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <TooltipContainer>
          <TooltipLabel>{label}</TooltipLabel>
          {payload.map((entry: any, index: number) => (
            <TooltipRow key={index}>
              <TooltipDotWrapper>
                <TooltipDot $color={entry.color} />
                <TooltipName>{entry.name}</TooltipName>
              </TooltipDotWrapper>
              <TooltipValue>{formatCurrency(entry.value)}</TooltipValue>
            </TooltipRow>
          ))}
        </TooltipContainer>
      );
    }
    return null;
  };

  // Custom pie chart label with theme-aware colors
  const renderPieLabel = ({
    cx,
    cy,
    midAngle,
    outerRadius,
    percent,
    name,
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.35;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Note: SVG elements require inline styles as styled-components doesn't work well with SVG in SSR
    return (
      <text
        x={x}
        y={y}
        fill={theme.colors.text}
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        style={{
          fontSize: "12px",
          fontWeight: 600,
          letterSpacing: "-0.01em",
        }}
      >
        {`${name} ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Custom legend with theme-aware styling
  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <LegendContainer>
        {payload.map((entry: any, index: number) => (
          <LegendItem key={index}>
            <LegendDot $color={entry.color} />
            <LegendText>{entry.value}</LegendText>
          </LegendItem>
        ))}
      </LegendContainer>
    );
  };

  // Custom pie chart tooltip
  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <PieTooltipContainer>
          <PieTooltipHeader>
            <PieTooltipDot $color={data.payload.color} />
            <PieTooltipTitle>{data.name}</PieTooltipTitle>
          </PieTooltipHeader>
          <PieTooltipBody>
            <PieTooltipRow>
              <PieTooltipLabel>Amount</PieTooltipLabel>
              <PieTooltipValue>{formatCurrency(data.value)}</PieTooltipValue>
            </PieTooltipRow>
          </PieTooltipBody>
        </PieTooltipContainer>
      );
    }
    return null;
  };

  if (isLoading) {
    return <Loader fullScreen text="Loading reports..." />;
  }

  const periodLabel =
    selectedMonth === "all"
      ? "All Time"
      : `${MONTHS.find((m) => m.value === selectedMonth)?.label} ${selectedYear}`;

  return (
    <PageContainer>
      <PageHeader>
        <PageTitleSection>
          <PageTitle>Reports</PageTitle>
          <PageSubtitle>
            Detailed analysis of your financial activity
          </PageSubtitle>
        </PageTitleSection>
        <FilterBar>
          <Select
            options={MONTHS}
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
          <Select
            options={years}
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          />
          <Button leftIcon={<Download size={18} />} onClick={exportToCSV}>
            Export CSV
          </Button>
        </FilterBar>
      </PageHeader>

      {/* Stats Cards */}
      <StatsGrid>
        <StatCardWrapper $color="#6366f1" $delay={0}>
          <StatContent>
            <StatInfo>
              <StatLabel>Total Spent</StatLabel>
              <StatValue>{formatCurrency(stats.totalSpent)}</StatValue>
              <StatSubtext>{periodLabel}</StatSubtext>
            </StatInfo>
            <StatIconWrapper $color="#6366f1">
              <Wallet size={24} />
            </StatIconWrapper>
          </StatContent>
        </StatCardWrapper>

        <StatCardWrapper $color="#10b981" $delay={50}>
          <StatContent>
            <StatInfo>
              <StatLabel>Total Saved</StatLabel>
              <StatValue>{formatCurrency(stats.totalSaved)}</StatValue>
              <StatSubtext>Goal contributions</StatSubtext>
            </StatInfo>
            <StatIconWrapper $color="#10b981">
              <Target size={24} />
            </StatIconWrapper>
          </StatContent>
        </StatCardWrapper>

        <StatCardWrapper $color="#f59e0b" $delay={100}>
          <StatContent>
            <StatInfo>
              <StatLabel>Daily Average</StatLabel>
              <StatValue>{formatCurrency(stats.avgPerDay)}</StatValue>
              <StatSubtext>Spending per day</StatSubtext>
            </StatInfo>
            <StatIconWrapper $color="#f59e0b">
              <TrendingUp size={24} />
            </StatIconWrapper>
          </StatContent>
        </StatCardWrapper>

        <StatCardWrapper $color="#8b5cf6" $delay={150}>
          <StatContent>
            <StatInfo>
              <StatLabel>Transactions</StatLabel>
              <StatValue>{stats.transactions}</StatValue>
              <StatSubtext>Expenses + Savings</StatSubtext>
            </StatInfo>
            <StatIconWrapper $color="#8b5cf6">
              <Activity size={24} />
            </StatIconWrapper>
          </StatContent>
        </StatCardWrapper>
      </StatsGrid>

      {/* Charts Grid */}
      <ChartsGrid>
        <ChartCard $accentColor="#ec4899">
          <CardHeader
            title="Spending by Category"
            subtitle="Distribution of your expenses"
            icon={<PieChartIcon size={20} />}
          />
          <CardBody>
            <ChartContainer>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                      nameKey="name"
                      label={renderPieLabel}
                      labelLine={{
                        stroke: theme.colors.textMuted,
                        strokeWidth: 1,
                        strokeOpacity: 0.5,
                      }}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          stroke={theme.colors.surface}
                          strokeWidth={3}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState>
                  <PieChartIcon size={48} />
                  <span>No spending data for this period</span>
                </EmptyState>
              )}
            </ChartContainer>
          </CardBody>
        </ChartCard>

        <ChartCard $accentColor="#10b981">
          <CardHeader
            title="6-Month Trend"
            subtitle="Spending vs Savings over time"
            icon={<TrendingUp size={20} />}
          />
          <CardBody>
            <ChartContainer>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrend}>
                  <defs>
                    <linearGradient
                      id="spentGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient
                      id="savedGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={chartColors.grid}
                    opacity={0.5}
                  />
                  <XAxis
                    dataKey="month"
                    stroke={chartColors.axis}
                    tick={{ fill: chartColors.axis, fontSize: 12 }}
                    axisLine={{ stroke: chartColors.grid }}
                  />
                  <YAxis
                    stroke={chartColors.axis}
                    tick={{ fill: chartColors.axis, fontSize: 12 }}
                    tickFormatter={(value) => `${currency.symbol}${value}`}
                    axisLine={{ stroke: chartColors.grid }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend content={renderLegend} />
                  <Area
                    type="monotone"
                    dataKey="spent"
                    name="Spent"
                    stroke="#ef4444"
                    strokeWidth={3}
                    fill="url(#spentGradient)"
                    dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
                    activeDot={{
                      r: 8,
                      stroke: theme.colors.surface,
                      strokeWidth: 3,
                      fill: "#ef4444",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="saved"
                    name="Saved"
                    stroke="#10b981"
                    strokeWidth={3}
                    fill="url(#savedGradient)"
                    dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                    activeDot={{
                      r: 8,
                      stroke: theme.colors.surface,
                      strokeWidth: 3,
                      fill: "#10b981",
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardBody>
        </ChartCard>
      </ChartsGrid>

      {/* Daily Activity Chart */}
      {selectedMonth !== "all" && dailyData.length > 0 && (
        <DailyChartCard>
          <CardHeader
            title="Daily Activity"
            subtitle={`Day-by-day breakdown for ${periodLabel}`}
            icon={<BarChart3 size={20} />}
          />
          <CardBody>
            <ChartContainer>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData} barGap={2}>
                  <defs>
                    <linearGradient
                      id="spentBarGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#ef4444" stopOpacity={1} />
                      <stop
                        offset="100%"
                        stopColor="#ef4444"
                        stopOpacity={0.7}
                      />
                    </linearGradient>
                    <linearGradient
                      id="savedBarGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                      <stop
                        offset="100%"
                        stopColor="#10b981"
                        stopOpacity={0.7}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={chartColors.grid}
                    opacity={0.5}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="day"
                    stroke={chartColors.axis}
                    tick={{ fill: chartColors.axis, fontSize: 11 }}
                    axisLine={{ stroke: chartColors.grid }}
                    interval={window.innerWidth < 768 ? 4 : 1}
                  />
                  <YAxis
                    stroke={chartColors.axis}
                    tick={{ fill: chartColors.axis, fontSize: 12 }}
                    tickFormatter={(value) => `${currency.symbol}${value}`}
                    axisLine={{ stroke: chartColors.grid }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend content={renderLegend} />
                  <Bar
                    dataKey="spent"
                    name="Spent"
                    fill="url(#spentBarGradient)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={24}
                  />
                  <Bar
                    dataKey="saved"
                    name="Saved"
                    fill="url(#savedBarGradient)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={24}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardBody>
        </DailyChartCard>
      )}

      {/* Category Breakdown Table */}
      <TableCard>
        <CardHeader
          title="Category Breakdown"
          subtitle="Detailed spending by category"
          icon={<Sparkles size={20} />}
        />
        <CardBody>
          {categoryData.length > 0 ? (
            <TableContainer>
              <StyledTable>
                <TableHead>
                  <tr>
                    <TableHeaderCell>Category</TableHeaderCell>
                    <TableHeaderCell>Amount</TableHeaderCell>
                    <TableHeaderCell>% of Total</TableHeaderCell>
                    <TableHeaderCell>Distribution</TableHeaderCell>
                  </tr>
                </TableHead>
                <tbody>
                  {categoryData.map((category) => {
                    const percentage =
                      stats.totalSpent > 0
                        ? (category.value / stats.totalSpent) * 100
                        : 0;
                    return (
                      <TableRow key={category.name}>
                        <TableCell>
                          <CategoryCell>
                            <CategoryIconBadge $color={category.color}>
                              {category.icon}
                            </CategoryIconBadge>
                            <CategoryName>{category.name}</CategoryName>
                          </CategoryCell>
                        </TableCell>
                        <TableCell>
                          <AmountCell>
                            {formatCurrency(category.value)}
                          </AmountCell>
                        </TableCell>
                        <TableCell>
                          <PercentageCell $value={percentage}>
                            {percentage.toFixed(1)}%
                          </PercentageCell>
                        </TableCell>
                        <TableCell>
                          <ProgressBarContainer>
                            <ProgressBarTrack>
                              <ProgressBarFill
                                $percentage={percentage}
                                $color={category.color}
                              />
                            </ProgressBarTrack>
                          </ProgressBarContainer>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </tbody>
              </StyledTable>
            </TableContainer>
          ) : (
            <EmptyState>
              <BarChart3 size={48} />
              <span>No category data available for this period</span>
            </EmptyState>
          )}
        </CardBody>
      </TableCard>
    </PageContainer>
  );
}
