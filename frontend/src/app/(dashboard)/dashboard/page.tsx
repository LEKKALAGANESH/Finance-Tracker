"use client";

import dynamic from "next/dynamic";
import { Calendar, Plus, Target, TrendingDown, TrendingUp, Wallet, PiggyBank, Receipt, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo, useCallback } from "react";
import styled, { keyframes, css } from "styled-components";

// ============================================================================
// TypeScript Interfaces
// ============================================================================

interface DashboardStats {
  totalSpent: number;
  totalSaved: number;
  monthlyBudget: number;
  savingsGoal: number;
  transactions: number;
  trend: number;
}

interface TransactionCategory {
  name: string;
  icon: string;
  color: string;
}

interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: 'expense' | 'savings';
  category: TransactionCategory;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

interface ExpenseWithCategory {
  id: string;
  description: string;
  amount: number;
  date: string;
  category_id: string;
  category?: { name: string; icon: string; color: string };
}

interface ContributionWithGoal {
  id: string;
  amount: number;
  date: string;
  note: string;
  goal?: { id: string; name: string; icon: string; color: string };
}

interface MonthOption {
  value: string;
  label: string;
}

interface BudgetProgressSegmentProps {
  $width: number;
  $color: string;
  $delay?: number;
}

interface LegendColorProps {
  $color: string;
}

import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { SkeletonDashboard } from "@/components/ui/Skeleton";
import { FloatingActionButton } from "@/components/ui/FloatingActionButton";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
import { usePageLoading } from "@/context/NavigationContext";
import { getCurrencyIcon } from "@/components/ui/CurrencyIcon";
import { getSupabaseClient } from "@/lib/supabase/client";

// Dynamic import for chart component to reduce initial bundle size
const SpendingChart = dynamic(
  () => import("@/components/dashboard/SpendingChart").then((mod) => mod.SpendingChart),
  { ssr: false }
);

// Animation keyframes
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
`;

const gradientShift = keyframes`
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
`;

// Staggered animation helper
const staggeredAnimation = (index: number) => css`
  opacity: 0;
  animation: ${fadeInUp} 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: ${index * 0.1}s;
`;

// Page wrapper with subtle background pattern
const DashboardWrapper = styled.div`
  position: relative;
  min-height: 100%;

  /* Subtle gradient orbs for visual depth */
  &::before {
    content: '';
    position: fixed;
    top: -20%;
    right: -10%;
    width: 600px;
    height: 600px;
    background: radial-gradient(
      circle,
      ${({ theme }) => theme.colors.primary}08 0%,
      transparent 70%
    );
    pointer-events: none;
    z-index: 0;

    @media (max-width: 768px) {
      width: 400px;
      height: 400px;
      top: -10%;
      right: -20%;
    }
  }

  &::after {
    content: '';
    position: fixed;
    bottom: -10%;
    left: -5%;
    width: 500px;
    height: 500px;
    background: radial-gradient(
      circle,
      ${({ theme }) => theme.colors.secondary}06 0%,
      transparent 70%
    );
    pointer-events: none;
    z-index: 0;

    @media (max-width: 768px) {
      width: 300px;
      height: 300px;
    }
  }
`;

const DashboardContent = styled.div`
  position: relative;
  z-index: 1;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
  ${staggeredAnimation(0)}

  /* Tablet */
  @media (max-width: 1023px) {
    margin-bottom: ${({ theme }) => theme.spacing["2xl"]};
    gap: ${({ theme }) => theme.spacing.lg};
  }

  /* Mobile */
  @media (max-width: 767px) {
    margin-bottom: ${({ theme }) => theme.spacing.xl};
    gap: ${({ theme }) => theme.spacing.md};
  }

  /* Small Mobile */
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
    margin-bottom: ${({ theme }) => theme.spacing.lg};
    gap: ${({ theme }) => theme.spacing.md};
  }
`;

const WelcomeText = styled.div`
  h1 {
    font-size: ${({ theme }) => theme.typography.fontSize["2xl"]};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.text};
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.sm};

    /* Gradient text effect for the greeting */
    span.gradient {
      background: linear-gradient(
        135deg,
        ${({ theme }) => theme.colors.primary} 0%,
        ${({ theme }) => theme.colors.secondary} 100%
      );
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    /* Tablet */
    @media (max-width: 1023px) {
      font-size: 1.875rem;
      gap: ${({ theme }) => theme.spacing.md};
    }

    /* Mobile */
    @media (max-width: 767px) {
      font-size: ${({ theme }) => theme.typography.fontSize.xl};
      gap: ${({ theme }) => theme.spacing.sm};
    }

    /* Small Mobile */
    @media (max-width: 480px) {
      font-size: ${({ theme }) => theme.typography.fontSize.lg};
      gap: ${({ theme }) => theme.spacing.xs};
    }
  }

  p {
    color: ${({ theme }) => theme.colors.textSecondary};
    margin-top: ${({ theme }) => theme.spacing.xs};
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.xs};

    /* Tablet */
    @media (max-width: 1023px) {
      font-size: ${({ theme }) => theme.typography.fontSize.base};
      margin-top: ${({ theme }) => theme.spacing.sm};
    }

    /* Mobile */
    @media (max-width: 767px) {
      font-size: ${({ theme }) => theme.typography.fontSize.sm};
    }

    /* Small Mobile */
    @media (max-width: 480px) {
      font-size: ${({ theme }) => theme.typography.fontSize.xs};
    }
  }
`;

const WelcomeIcon = styled.span`
  display: inline-flex;
  animation: ${float} 3s ease-in-out infinite;
  font-size: 1.75rem;

  /* Tablet */
  @media (max-width: 1023px) {
    font-size: 1.625rem;
  }

  /* Mobile */
  @media (max-width: 767px) {
    font-size: 1.375rem;
  }

  /* Small Mobile */
  @media (max-width: 480px) {
    font-size: 1.125rem;
  }
`;

const FilterBar = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  flex-wrap: wrap;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.glass.background};
  backdrop-filter: ${({ theme }) => theme.glass.blur};
  -webkit-backdrop-filter: ${({ theme }) => theme.glass.blur};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  ${staggeredAnimation(1)}

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.md};
    border-color: ${({ theme }) => theme.colors.borderDark};
  }

  /* Tablet */
  @media (max-width: 1023px) {
    padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.xl};
    gap: ${({ theme }) => theme.spacing.md};
    margin-bottom: ${({ theme }) => theme.spacing["2xl"]};
  }

  /* Mobile */
  @media (max-width: 767px) {
    padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
    gap: ${({ theme }) => theme.spacing.sm};
    margin-bottom: ${({ theme }) => theme.spacing.xl};
    flex-direction: column;
    align-items: stretch;
  }

  /* Small Mobile */
  @media (max-width: 480px) {
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
    margin-bottom: ${({ theme }) => theme.spacing.lg};
    border-radius: ${({ theme }) => theme.borderRadius.lg};
  }
`;

const FilterLabel = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.surfaceHover};
  border-radius: ${({ theme }) => theme.borderRadius.md};

  svg {
    color: ${({ theme }) => theme.colors.primary};
  }

  @media (max-width: 640px) {
    margin-bottom: ${({ theme }) => theme.spacing.xs};
    justify-content: center;
  }
`;

const FilterSelect = styled.div`
  min-width: 140px;

  @media (max-width: 640px) {
    width: 100%;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  /* Staggered animation for stat cards */
  & > *:nth-child(1) { ${staggeredAnimation(2)} }
  & > *:nth-child(2) { ${staggeredAnimation(3)} }
  & > *:nth-child(3) { ${staggeredAnimation(4)} }
  & > *:nth-child(4) { ${staggeredAnimation(5)} }

  /* Tablet */
  @media (max-width: 1023px) {
    grid-template-columns: repeat(2, 1fr);
    gap: ${({ theme }) => theme.spacing.lg};
    margin-bottom: ${({ theme }) => theme.spacing["2xl"]};
  }

  /* Mobile */
  @media (max-width: 767px) {
    grid-template-columns: repeat(2, 1fr);
    gap: ${({ theme }) => theme.spacing.md};
    margin-bottom: ${({ theme }) => theme.spacing.xl};
  }

  /* Small Mobile */
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.sm};
    margin-bottom: ${({ theme }) => theme.spacing.lg};
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.xl};

  /* Staggered animation for content sections */
  & > *:nth-child(1) { ${staggeredAnimation(8)} }
  & > *:nth-child(2) { ${staggeredAnimation(9)} }

  /* Tablet */
  @media (max-width: 1023px) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.xl};
  }

  /* Mobile */
  @media (max-width: 767px) {
    gap: ${({ theme }) => theme.spacing.lg};
  }

  /* Small Mobile */
  @media (max-width: 480px) {
    gap: ${({ theme }) => theme.spacing.md};
  }
`;

const gradientShiftBudget = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const BudgetOverviewCard = styled.div`
  background: ${({ theme }) => theme.glass.background};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing["2xl"]};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  ${staggeredAnimation(6)}

  /* Animated gradient top accent */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(
      90deg,
      ${({ theme }) => theme.colors.primary}00 0%,
      ${({ theme }) => theme.colors.primary} 20%,
      ${({ theme }) => theme.colors.secondary} 50%,
      ${({ theme }) => theme.colors.success} 80%,
      ${({ theme }) => theme.colors.success}00 100%
    );
    background-size: 200% 100%;
    animation: ${gradientShiftBudget} 4s ease infinite;
  }

  /* Multiple glow orbs for depth */
  &::after {
    content: '';
    position: absolute;
    top: -50px;
    right: -50px;
    width: 250px;
    height: 250px;
    background: radial-gradient(
      circle,
      ${({ theme }) => theme.colors.primary}10 0%,
      transparent 60%
    );
    pointer-events: none;
    transition: all 0.5s ease;
  }

  &:hover {
    box-shadow:
      ${({ theme }) => theme.shadows.xl},
      0 8px 32px ${({ theme }) => theme.colors.primary}15;
    transform: translateY(-4px);
    border-color: ${({ theme }) => theme.colors.primary}30;

    &::after {
      transform: scale(1.2);
    }
  }

  /* Tablet */
  @media (max-width: 1023px) {
    padding: ${({ theme }) => theme.spacing["2xl"]};
    margin-bottom: ${({ theme }) => theme.spacing["2xl"]};
  }

  /* Mobile */
  @media (max-width: 767px) {
    padding: ${({ theme }) => theme.spacing.xl};
    margin-bottom: ${({ theme }) => theme.spacing.xl};
  }

  /* Small Mobile */
  @media (max-width: 480px) {
    padding: ${({ theme }) => theme.spacing.lg};
    margin-bottom: ${({ theme }) => theme.spacing.lg};
    border-radius: ${({ theme }) => theme.borderRadius.lg};
  }
`;

const BudgetIconBadge = styled.div`
  width: 44px;
  height: 44px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.primary}25 0%,
    ${({ theme }) => theme.colors.primary}10 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.primary};
  box-shadow: 0 4px 12px ${({ theme }) => theme.colors.primary}20;
  transition: all 0.3s ease;

  ${BudgetOverviewCard}:hover & {
    transform: scale(1.1) rotate(5deg);
    box-shadow: 0 6px 16px ${({ theme }) => theme.colors.primary}30;
  }
`;

const BudgetHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  position: relative;
  z-index: 1;
`;

const BudgetTitleSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};

  h3 {
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.text};
    margin: 0;
  }

  p {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.textMuted};
    margin: 0;
  }
`;

const BudgetProgressContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
  position: relative;
  z-index: 1;
`;

const progressFill = keyframes`
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
`;

const BudgetProgressBar = styled.div`
  height: 32px;
  background: linear-gradient(
    180deg,
    ${({ theme }) => theme.colors.surfaceHover} 0%,
    ${({ theme }) => theme.colors.surface} 100%
  );
  border-radius: ${({ theme }) => theme.borderRadius.full};
  overflow: hidden;
  display: flex;
  position: relative;
  box-shadow:
    ${({ theme }) => theme.shadows.inset},
    0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid ${({ theme }) => theme.colors.border};

  /* Subtle inner glow */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
    pointer-events: none;
  }

  /* Tablet */
  @media (max-width: 1023px) {
    height: 36px;
  }

  /* Mobile */
  @media (max-width: 767px) {
    height: 28px;
  }

  /* Small Mobile */
  @media (max-width: 480px) {
    height: 24px;
  }
`;

const BudgetProgressSegment = styled.div<{ $width: number; $color: string; $delay?: number }>`
  height: 100%;
  width: ${({ $width }) => Math.min(Math.max($width, 0), 100)}%;
  background: linear-gradient(
    90deg,
    ${({ $color }) => $color} 0%,
    ${({ $color }) => $color}dd 100%
  );
  transform-origin: left;
  animation: ${progressFill} 1s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: ${({ $delay }) => $delay || 0}s;
  position: relative;

  /* Shimmer effect on hover */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.2) 50%,
      transparent 100%
    );
    transform: translateX(-100%);
    transition: transform 0.6s ease;
  }

  &:hover::after {
    transform: translateX(100%);
  }
`;

const RemainingProgressSegment = styled.div<{ $width: number; $delay?: number }>`
  height: 100%;
  width: ${({ $width }) => Math.min(Math.max($width, 0), 100)}%;
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.primary}30 0%,
    ${({ theme }) => theme.colors.secondary}25 100%
  );
  transform-origin: left;
  animation: ${progressFill} 1s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: ${({ $delay }) => $delay || 0}s;
  position: relative;

  /* Shimmer effect on hover */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.15) 50%,
      transparent 100%
    );
    transform: translateX(-100%);
    transition: transform 0.6s ease;
  }

  &:hover::after {
    transform: translateX(100%);
  }
`;

const RemainingColor = styled.div`
  width: 16px;
  height: 16px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.primary}40 0%,
    ${({ theme }) => theme.colors.secondary}30 100%
  );
  box-shadow: 0 3px 8px ${({ theme }) => theme.colors.primary}30;
  flex-shrink: 0;
`;

const BudgetLegend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.lg};
  margin-top: ${({ theme }) => theme.spacing.xl};
  position: relative;
  z-index: 1;

  /* Tablet */
  @media (max-width: 1023px) {
    gap: ${({ theme }) => theme.spacing.lg};
    margin-top: ${({ theme }) => theme.spacing.xl};
  }

  /* Mobile */
  @media (max-width: 767px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: ${({ theme }) => theme.spacing.md};
    margin-top: ${({ theme }) => theme.spacing.lg};
  }

  /* Small Mobile */
  @media (max-width: 480px) {
    grid-template-columns: 1fr 1fr;
    gap: ${({ theme }) => theme.spacing.sm};
    margin-top: ${({ theme }) => theme.spacing.md};
  }
`;

const LegendItem = styled.div<{ $color?: string }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.surfaceHover} 0%,
    ${({ theme }) => theme.colors.surface} 100%
  );
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  cursor: pointer;
  flex: 1;
  min-width: 140px;

  &:hover {
    transform: translateY(-3px);
    box-shadow:
      ${({ theme }) => theme.shadows.md},
      0 4px 16px ${({ $color }) => $color || 'rgba(0,0,0,0.1)'}30;
    border-color: ${({ $color }) => $color || 'inherit'}40;
    background: ${({ theme }) => theme.colors.surface};
  }

  /* Tablet */
  @media (max-width: 1023px) {
    padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.xl};
    min-width: 160px;
  }

  /* Mobile */
  @media (max-width: 767px) {
    padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
    min-width: auto;
    gap: ${({ theme }) => theme.spacing.sm};
  }

  /* Small Mobile */
  @media (max-width: 480px) {
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
    gap: ${({ theme }) => theme.spacing.xs};
    border-radius: ${({ theme }) => theme.borderRadius.lg};
  }
`;

const LegendColor = styled.div<{ $color: string }>`
  width: 16px;
  height: 16px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: linear-gradient(
    135deg,
    ${({ $color }) => $color} 0%,
    ${({ $color }) => $color}cc 100%
  );
  box-shadow: 0 3px 8px ${({ $color }) => $color}50;
  flex-shrink: 0;
`;

const LegendText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;

  span:first-child {
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    color: ${({ theme }) => theme.colors.textMuted};
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  }

  span:last-child {
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.text};
    font-feature-settings: 'tnum';
  }

  /* Tablet */
  @media (max-width: 1023px) {
    span:first-child {
      font-size: ${({ theme }) => theme.typography.fontSize.xs};
    }
    span:last-child {
      font-size: ${({ theme }) => theme.typography.fontSize.base};
    }
  }

  /* Mobile */
  @media (max-width: 767px) {
    gap: 2px;
    span:last-child {
      font-size: ${({ theme }) => theme.typography.fontSize.sm};
    }
  }

  /* Small Mobile */
  @media (max-width: 480px) {
    gap: 1px;
    span:first-child {
      font-size: 0.65rem;
      letter-spacing: 0.05em;
    }
    span:last-child {
      font-size: ${({ theme }) => theme.typography.fontSize.xs};
    }
  }
`;

const NoBudgetMessage = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.textSecondary};
  position: relative;
  z-index: 1;

  p {
    margin-bottom: ${({ theme }) => theme.spacing.md};
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    line-height: 1.6;
  }

  a {
    display: inline-flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.xs};
    color: ${({ theme }) => theme.colors.primary};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    text-decoration: none;
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
    background: ${({ theme }) => theme.colors.primaryLight};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    transition: all 0.2s ease;

    &:hover {
      background: ${({ theme }) => theme.colors.primary};
      color: white;
      transform: translateY(-2px);
      box-shadow: ${({ theme }) => theme.shadows.primary};
    }
  }
`;

const QuickActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};

  /* Pulse animation for the button to draw attention */
  button, a button {
    position: relative;
    overflow: hidden;

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(255, 255, 255, 0.1) 50%,
        transparent 100%
      );
      transform: translateX(-100%);
    }

    &:hover::after {
      animation: ${shimmer} 0.6s ease;
    }
  }

  @media (max-width: 480px) {
    width: 100%;

    a {
      width: 100%;
    }

    button {
      width: 100%;
    }
  }
`;

const MONTHS: MonthOption[] = [
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

export default function DashboardPage() {
  const { user } = useAuth();
  const { currency, formatCurrency } = useCurrency();
  const router = useRouter();
  const CurrencyIconComponent = getCurrencyIcon(currency.code);
  const [isLoading, setIsLoading] = useState(true);

  // Sync loading state with global navigation loader
  usePageLoading(isLoading);

  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [stats, setStats] = useState<DashboardStats>({
    totalSpent: 0,
    totalSaved: 0,
    monthlyBudget: 0,
    savingsGoal: 0,
    transactions: 0,
    trend: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);

  // Generate year options (last 5 years)
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => ({
      value: (currentYear - i).toString(),
      label: (currentYear - i).toString(),
    }));
  }, []);

  // Get display text for the period
  const getPeriodText = () => {
    if (selectedMonth === "all") {
      return "all time";
    }
    const monthName = MONTHS.find((m) => m.value === selectedMonth)?.label;
    return `${monthName} ${selectedYear}`;
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      setIsLoading(true);
      setError(null);
      const supabase = getSupabaseClient();

      try {
        // Build date range based on selection
        let startDate: string | null = null;
        let endDate: string | null = null;
        let prevStartDate: string | null = null;
        let prevEndDate: string | null = null;

        if (selectedMonth !== "all") {
          const month = parseInt(selectedMonth);
          const year = parseInt(selectedYear);
          startDate = new Date(year, month - 1, 1).toISOString().split("T")[0];
          endDate = new Date(year, month, 0).toISOString().split("T")[0];

          // Previous period for trend
          const prevMonth = month === 1 ? 12 : month - 1;
          const prevYear = month === 1 ? year - 1 : year;
          prevStartDate = new Date(prevYear, prevMonth - 1, 1).toISOString().split("T")[0];
          prevEndDate = new Date(prevYear, prevMonth, 0).toISOString().split("T")[0];
        }

        // Build expense query
        let expenseQuery = supabase
          .from("expenses")
          .select("*, category:categories(id, name, icon, color)")
          .eq("user_id", user.id)
          .order("date", { ascending: false });

        if (startDate && endDate) {
          expenseQuery = expenseQuery.gte("date", startDate).lte("date", endDate);
        }

        // Build contributions query
        let contributionsQuery = supabase
          .from("goal_contributions")
          .select("*, goal:goals(id, name, icon, color)")
          .eq("user_id", user.id)
          .order("date", { ascending: false });

        if (startDate && endDate) {
          contributionsQuery = contributionsQuery.gte("date", startDate).lte("date", endDate);
        }

        // Build previous period query for trend
        let prevExpenseQuery = supabase
          .from("expenses")
          .select("amount")
          .eq("user_id", user.id);

        if (prevStartDate && prevEndDate) {
          prevExpenseQuery = prevExpenseQuery.gte("date", prevStartDate).lte("date", prevEndDate);
        }

        // Fetch all data in parallel
        const [expensesResult, contributionsResult, prevExpensesResult, budgetsResult, goalsResult] = await Promise.all([
          expenseQuery,
          contributionsQuery,
          selectedMonth !== "all" ? prevExpenseQuery : Promise.resolve({ data: [] }),
          supabase
            .from("budgets")
            .select("*")
            .eq("user_id", user.id)
            .eq("period", "monthly"),
          supabase
            .from("goals")
            .select("*")
            .eq("user_id", user.id)
            .eq("status", "active"),
        ]);

        const expenses = expensesResult.data;
        const contributions = contributionsResult.data;
        const prevExpenses = prevExpensesResult.data;
        const budgets = budgetsResult.data;
        const goals = goalsResult.data;

        // Calculate stats
        const totalSpent = expenses?.reduce((sum: number, e: { amount: number }) => sum + e.amount, 0) || 0;
        const totalSaved = contributions?.reduce((sum: number, c: { amount: number }) => sum + c.amount, 0) || 0;
        const prevPeriodTotal = prevExpenses?.reduce((sum: number, e: { amount: number }) => sum + e.amount, 0) || 0;
        const monthlyBudget =
          budgets?.reduce((sum: number, b: { amount: number }) => sum + b.amount, 0) || 0;
        const savingsGoal =
          goals?.reduce((sum: number, g: { target_amount: number }) => sum + g.target_amount, 0) || 0;

        // Calculate trend percentage
        let trend = 0;
        if (selectedMonth !== "all" && prevPeriodTotal > 0) {
          trend = ((totalSpent - prevPeriodTotal) / prevPeriodTotal) * 100;
        }

        const totalTransactions = (expenses?.length || 0) + (contributions?.length || 0);

        setStats({
          totalSpent,
          totalSaved,
          monthlyBudget,
          savingsGoal,
          transactions: totalTransactions,
          trend,
        });

        // Combine expenses and contributions for recent transactions
        const expenseTransactions = (expenses || []).map((e: ExpenseWithCategory) => ({
          id: e.id,
          description: e.description,
          amount: -e.amount, // Negative for expenses
          date: e.date,
          type: "expense" as const,
          category: e.category || {
            name: "Other",
            icon: "📦",
            color: "#6b7280",
          },
        }));

        const contributionTransactions = (contributions || []).map((c: ContributionWithGoal) => ({
          id: c.id,
          description: c.note || `Saved to ${c.goal?.name || "Goal"}`,
          amount: c.amount, // Positive for savings
          date: c.date,
          type: "savings" as const,
          category: {
            name: c.goal?.name || "Savings",
            icon: c.goal?.icon || "🎯",
            color: c.goal?.color || "#10b981",
          },
        }));

        // Merge and sort by date, take top 5
        const allTransactions = [...expenseTransactions, ...contributionTransactions]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5);

        setRecentTransactions(allTransactions);

        // Calculate category data for chart
        const categoryTotals: Record<
          string,
          { name: string; value: number; color: string }
        > = {};
        (expenses || []).forEach((e: ExpenseWithCategory) => {
          const catId = e.category_id || "other";
          const catName = e.category?.name || "Other";
          const catColor = e.category?.color || "#6b7280";

          if (!categoryTotals[catId]) {
            categoryTotals[catId] = {
              name: catName,
              value: 0,
              color: catColor,
            };
          }
          categoryTotals[catId].value += e.amount;
        });

        setCategoryData(Object.values(categoryTotals));
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, selectedMonth, selectedYear]);

  if (isLoading) {
    return null;
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  const userName = user?.user_metadata?.full_name || "there";
  const firstName = userName.split(' ')[0];

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <DashboardWrapper>
      <DashboardContent>
      <PageHeader>
        <WelcomeText>
          <h1>
            <WelcomeIcon>{new Date().getHours() < 17 ? "👋" : "🌙"}</WelcomeIcon>
            {getGreeting()}, <span className="gradient">{firstName}</span>!
          </h1>
          <p>
            <Sparkles size={16} style={{ color: '#f59e0b' }} />
            Here&apos;s your financial overview for {getPeriodText()}
          </p>
        </WelcomeText>
        <QuickActions>
          <Link href="/expenses/add">
            <Button leftIcon={<Plus size={18} />}>Add Expense</Button>
          </Link>
        </QuickActions>
      </PageHeader>

      <FilterBar>
        <FilterLabel>
          <Calendar size={16} />
          View:
        </FilterLabel>
        <FilterSelect>
          <Select
            options={MONTHS}
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
        </FilterSelect>
        {selectedMonth !== "all" && (
          <FilterSelect>
            <Select
              options={yearOptions}
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            />
          </FilterSelect>
        )}
      </FilterBar>

      <StatsGrid>
        <StatCard
          title="Total Spent"
          value={formatCurrency(stats.totalSpent)}
          icon={CurrencyIconComponent}
          trend={
            selectedMonth !== "all" && stats.trend !== 0
              ? { value: Math.abs(stats.trend), isPositive: stats.trend < 0 }
              : undefined
          }
          color="#ef4444"
        />
        <StatCard
          title="Total Saved"
          value={formatCurrency(stats.totalSaved)}
          icon={PiggyBank}
          color="#10b981"
        />
        <StatCard
          title="Monthly Budget"
          value={formatCurrency(stats.monthlyBudget)}
          icon={Wallet}
          color="#6366f1"
        />
        <StatCard
          title="Transactions"
          value={stats.transactions.toString()}
          icon={Receipt}
          color="#f59e0b"
        />
      </StatsGrid>

      {/* Budget Overview - shows relationship between Budget, Spent, Saved, Remaining */}
      <BudgetOverviewCard>
        <BudgetHeader>
          <BudgetTitleSection>
            <BudgetIconBadge>
              <Wallet size={22} />
            </BudgetIconBadge>
            <div>
              <h3>Budget Overview</h3>
              <p>Track your spending against your budget</p>
            </div>
          </BudgetTitleSection>
          {stats.monthlyBudget === 0 && (
            <Link href="/budgets">
              <Button variant="outline" size="sm">Set Budget</Button>
            </Link>
          )}
        </BudgetHeader>

        {stats.monthlyBudget > 0 ? (
          <BudgetProgressContainer>
            {(() => {
              const budget = stats.monthlyBudget;
              const spent = stats.totalSpent;
              const saved = stats.totalSaved;
              const totalUsed = spent + saved;
              const remaining = Math.max(0, budget - totalUsed);
              const overBudget = totalUsed > budget;

              // Calculate percentages
              const spentPercent = (spent / budget) * 100;
              const savedPercent = (saved / budget) * 100;
              const remainingPercent = (remaining / budget) * 100;

              return (
                <>
                  <BudgetProgressBar>
                    <BudgetProgressSegment $width={spentPercent} $color="#ef4444" $delay={0.3} />
                    <BudgetProgressSegment $width={savedPercent} $color="#10b981" $delay={0.5} />
                    <RemainingProgressSegment $width={remainingPercent} $delay={0.7} />
                  </BudgetProgressBar>

                  <BudgetLegend>
                    <LegendItem $color="#6366f1">
                      <LegendColor $color="#6366f1" />
                      <LegendText>
                        <span>Budget</span>
                        <span>{formatCurrency(budget)}</span>
                      </LegendText>
                    </LegendItem>
                    <LegendItem $color="#ef4444">
                      <LegendColor $color="#ef4444" />
                      <LegendText>
                        <span>Spent</span>
                        <span>{formatCurrency(spent)} ({spentPercent.toFixed(0)}%)</span>
                      </LegendText>
                    </LegendItem>
                    <LegendItem $color="#10b981">
                      <LegendColor $color="#10b981" />
                      <LegendText>
                        <span>Saved</span>
                        <span>{formatCurrency(saved)} ({savedPercent.toFixed(0)}%)</span>
                      </LegendText>
                    </LegendItem>
                    <LegendItem $color={overBudget ? "#f59e0b" : undefined}>
                      {overBudget ? (
                        <LegendColor $color="#f59e0b" />
                      ) : (
                        <RemainingColor />
                      )}
                      <LegendText>
                        <span>{overBudget ? "Over Budget" : "Remaining"}</span>
                        <span style={{ color: overBudget ? "#f59e0b" : undefined }}>
                          {overBudget
                            ? `-${formatCurrency(totalUsed - budget)}`
                            : formatCurrency(remaining)
                          }
                        </span>
                      </LegendText>
                    </LegendItem>
                  </BudgetLegend>
                </>
              );
            })()}
          </BudgetProgressContainer>
        ) : (
          <NoBudgetMessage>
            <p>Set up a monthly budget to see how your spending and savings compare.</p>
            <Link href="/budgets">Create Budget</Link>
          </NoBudgetMessage>
        )}
      </BudgetOverviewCard>

      <ContentGrid>
        <SpendingChart data={categoryData} />
        <RecentTransactions transactions={recentTransactions} />
      </ContentGrid>

      <FloatingActionButton
        showOnMobileOnly
        actions={[
          {
            icon: Receipt,
            label: "Add Expense",
            onClick: () => router.push("/expenses/add"),
            color: "#6366f1",
          },
          {
            icon: PiggyBank,
            label: "Add to Goal",
            onClick: () => router.push("/goals"),
            color: "#10b981",
          },
        ]}
      />
      </DashboardContent>
    </DashboardWrapper>
  );
}
