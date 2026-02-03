"use client";

import {
  Calendar,
  CheckCircle,
  Clock,
  Edit,
  PiggyBank,
  Plus,
  Target,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import styled, { css, keyframes } from "styled-components";

import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Loader } from "@/components/ui/Loader";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useToast } from "@/context/ToastContext";
import { GOAL_ICONS } from "@/lib/constants";
import { getSupabaseClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";

// ============================================================================
// TypeScript Interfaces
// ============================================================================

/**
 * Goal status types
 */
type GoalStatus = "active" | "completed" | "paused";

/**
 * Goal entity from the database
 */
interface Goal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  icon: string;
  color: string;
  status: GoalStatus;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Goal form data for creating/editing goals
 */
interface GoalFormData {
  name: string;
  target_amount: string;
  deadline: string;
  icon: string;
  color: string;
}

/**
 * Contribution form data for adding to goals
 */
interface ContributionFormData {
  amount: string;
  note: string;
}

/**
 * Props for styled ProgressFill component
 */
interface ProgressFillProps {
  $progress: number;
  $color: string;
}

/**
 * Props for styled GoalIcon component
 */
interface GoalIconProps {
  $color: string;
}

/**
 * Props for styled ColorOption component
 */
interface ColorOptionProps {
  $color: string;
  $isSelected: boolean;
}

/**
 * Props for styled IconOption component
 */
interface IconOptionProps {
  $isSelected: boolean;
}

// Animation keyframes
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

const staggeredAnimation = (index: number) => css`
  opacity: 0;
  animation: ${fadeInUp} 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: ${index * 0.08}s;
`;

// Page wrapper with background effects
const PageWrapper = styled.div`
  position: relative;
  min-height: 100%;

  &::before {
    content: "";
    position: fixed;
    top: -15%;
    right: -8%;
    width: 500px;
    height: 500px;
    background: radial-gradient(
      circle,
      ${({ theme }) => theme.colors.success}08 0%,
      transparent 70%
    );
    pointer-events: none;
    z-index: 0;
  }

  &::after {
    content: "";
    position: fixed;
    bottom: -10%;
    left: -5%;
    width: 400px;
    height: 400px;
    background: radial-gradient(
      circle,
      ${({ theme }) => theme.colors.primary}06 0%,
      transparent 70%
    );
    pointer-events: none;
    z-index: 0;
  }
`;

const PageContent = styled.div`
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

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;

    button {
      width: 100%;
    }
  }
`;

const PageTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  h1 {
    font-size: ${({ theme }) => theme.typography.fontSize["2xl"]};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.text};

    @media (max-width: 480px) {
      font-size: ${({ theme }) => theme.typography.fontSize.xl};
    }
  }
`;

const PageTitleIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.success} 0%,
    ${({ theme }) => theme.colors.primary} 100%
  );
  color: white;
  flex-shrink: 0;
`;

const GoalsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 380px) {
    grid-template-columns: 1fr;
  }
`;

const GoalCard = styled(Card)<{
  $isCompleted: boolean;
  $index?: number;
  $color?: string;
}>`
  position: relative;
  opacity: 0;
  animation: ${fadeInUp} 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: ${({ $index }) => 0.1 + ($index || 0) * 0.1}s;
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  background: ${({ theme }) => theme.glass.background};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  overflow: visible;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${({ $color }) => $color || "#6366f1"};
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  ${({ $isCompleted }) =>
    $isCompleted &&
    css`
      &::after {
        content: "";
        position: absolute;
        inset: 0;
        background: ${({ theme }) => theme.colors.success}08;
        pointer-events: none;
        border-radius: inherit;
      }

      &::before {
        opacity: 1;
        background: linear-gradient(
          90deg,
          ${({ theme }) => theme.colors.success},
          #34d399
        );
      }
    `}

  &:hover {
    transform: translateY(-6px);
    box-shadow: ${({ theme }) => theme.shadows.xl};

    &::before {
      opacity: 1;
    }
  }
`;

const CompletedBadge = styled.div`
  position: absolute;
  top: ${({ theme }) => theme.spacing.md};
  right: ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: ${({ theme }) => theme.colors.successLight};
  color: ${({ theme }) => theme.colors.success};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const GoalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const GoalInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const GoalIcon = styled.div<{ $color: string }>`
  width: 56px;
  height: 56px;
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  background: linear-gradient(
    135deg,
    ${({ $color }) => `${$color}20`} 0%,
    ${({ $color }) => `${$color}10`} 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  box-shadow: 0 4px 12px ${({ $color }) => `${$color}15`};
  transition: all 0.3s ease;

  ${GoalCard}:hover & {
    transform: scale(1.1) rotate(5deg);
  }
`;

const GoalDetails = styled.div`
  flex: 1;
  min-width: 0;

  h3 {
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: 6px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const DueDateBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: ${({ theme }) => theme.colors.surfaceHover};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};

  svg {
    opacity: 0.7;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 10px;
  flex-shrink: 0;
`;

const ActionButtonWrapper = styled.div`
  position: relative;
`;

const ActionTooltip = styled.span`
  position: absolute;
  bottom: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%) translateY(4px);
  padding: 8px 14px;
  background: ${({ theme }) => theme.colors.text};
  color: ${({ theme }) => theme.colors.background};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
  z-index: 100;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  pointer-events: none;

  &::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 6px solid transparent;
    border-top-color: ${({ theme }) => theme.colors.text};
  }
`;

const EditButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: none;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  box-shadow:
    0 4px 14px rgba(99, 102, 241, 0.4),
    0 2px 6px rgba(99, 102, 241, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);

  svg {
    width: 18px;
    height: 18px;
    transition: all 0.3s ease;
    position: relative;
    z-index: 1;
    stroke-width: 2.5;
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.35),
      transparent
    );
    transition: left 0.5s ease;
  }

  &::after {
    content: "";
    position: absolute;
    inset: 2px;
    border-radius: ${({ theme }) => theme.borderRadius.md};
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.2) 0%,
      transparent 50%
    );
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-3px) scale(1.05);
    box-shadow:
      0 8px 25px rgba(99, 102, 241, 0.5),
      0 4px 12px rgba(99, 102, 241, 0.35),
      0 0 0 3px rgba(99, 102, 241, 0.15);
    background: linear-gradient(135deg, #818cf8 0%, #a78bfa 100%);

    &::before {
      left: 100%;
    }
    svg {
      transform: rotate(-12deg) scale(1.1);
    }
    + ${ActionTooltip} {
      opacity: 1;
      visibility: visible;
      transform: translateX(-50%) translateY(0);
    }
  }

  &:active {
    transform: translateY(-1px) scale(1.02);
  }
  &:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 3px ${({ theme }) => theme.colors.background},
      0 0 0 5px #6366f1;
  }
`;

const DeleteButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: none;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  box-shadow:
    0 4px 14px rgba(239, 68, 68, 0.4),
    0 2px 6px rgba(239, 68, 68, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);

  svg {
    width: 18px;
    height: 18px;
    transition: all 0.3s ease;
    position: relative;
    z-index: 1;
    stroke-width: 2.5;
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.35),
      transparent
    );
    transition: left 0.5s ease;
  }

  &::after {
    content: "";
    position: absolute;
    inset: 2px;
    border-radius: ${({ theme }) => theme.borderRadius.md};
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.2) 0%,
      transparent 50%
    );
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-3px) scale(1.05);
    box-shadow:
      0 8px 25px rgba(239, 68, 68, 0.5),
      0 4px 12px rgba(239, 68, 68, 0.35),
      0 0 0 3px rgba(239, 68, 68, 0.15);
    background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);

    &::before {
      left: 100%;
    }
    svg {
      transform: rotate(8deg) scale(1.15);
    }
    + ${ActionTooltip} {
      opacity: 1;
      visibility: visible;
      transform: translateX(-50%) translateY(0);
    }
  }

  &:active {
    transform: translateY(-1px) scale(1.02);
  }
  &:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 3px ${({ theme }) => theme.colors.background},
      0 0 0 5px #ef4444;
  }
`;

const AmountSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const CurrentAmount = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize["2xl"]};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text};
`;

const TargetAmount = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ProgressBar = styled.div`
  height: 12px;
  background: ${({ theme }) => theme.colors.surfaceHover};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  overflow: hidden;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const ProgressFill = styled.div<{ $percentage: number; $color: string }>`
  height: 100%;
  width: ${({ $percentage }) => Math.min($percentage, 100)}%;
  background: ${({ $color }) =>
    `linear-gradient(90deg, ${$color}, ${$color}dd)`};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.4),
      transparent
    );
    animation: shimmer 2s infinite;
  }

  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
`;

const ContributeButton = styled(Button)`
  width: 100%;
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const EmptyState = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: ${({ theme }) => theme.spacing["2xl"]};
  background: ${({ theme }) => theme.colors.surface};
  border: 2px dashed ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  color: ${({ theme }) => theme.colors.textSecondary};

  h3 {
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    color: ${({ theme }) => theme.colors.text};
    margin-top: ${({ theme }) => theme.spacing.md};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }

  p {
    margin-bottom: ${({ theme }) => theme.spacing.lg};
    max-width: 400px;
    margin-left: auto;
    margin-right: auto;
  }
`;

const EmptyStateIcon = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto;
  background: ${({ theme }) =>
    `linear-gradient(135deg, ${theme.colors.primary}20, ${theme.colors.secondary}20)`};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.primary};
`;

const ProgressSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const ProgressStats = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const ProgressLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  display: flex;
  align-items: center;
  gap: 6px;

  svg {
    opacity: 0.7;
  }
`;

const ProgressPercentage = styled.span<{ $color: string }>`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ $color }) => $color};
`;

const StatusRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const DaysRemaining = styled.div<{ $urgent?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: ${({ theme, $urgent }) =>
    $urgent ? theme.colors.warningLight : theme.colors.infoLight};
  color: ${({ theme, $urgent }) =>
    $urgent ? theme.colors.warning : theme.colors.info};
  border: 1px solid
    ${({ theme, $urgent }) =>
      $urgent ? `${theme.colors.warning}30` : `${theme.colors.info}30`};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
`;

const RemainingAmount = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: ${({ theme }) => theme.colors.primaryLight};
  color: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  border: 1px solid ${({ theme }) => theme.colors.primary}20;
`;

const ModalForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const ModalActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const ModalDescription = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 1rem;
`;

const IconGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: ${({ theme }) => theme.spacing.sm};

  @media (max-width: 480px) {
    grid-template-columns: repeat(6, 1fr);
  }

  @media (max-width: 380px) {
    grid-template-columns: repeat(5, 1fr);
  }
`;

const IconOption = styled.button<{ $isSelected: boolean }>`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 2px solid
    ${({ $isSelected, theme }) =>
      $isSelected ? theme.colors.primary : "transparent"};
  background: ${({ $isSelected, theme }) =>
    $isSelected ? theme.colors.primaryLight : theme.colors.surfaceHover};
  transition: all 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
  }
`;

const ColorGrid = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;
`;

const ColorOption = styled.button<{ $color: string; $isSelected: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background: ${({ $color }) => $color};
  border: 3px solid
    ${({ $isSelected, theme }) =>
      $isSelected ? theme.colors.text : "transparent"};
  transition: transform 0.15s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text};
  display: block;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const COLORS: string[] = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#10b981",
  "#06b6d4",
];

export default function GoalsPage() {
  const { user } = useAuth();
  const { formatCurrency } = useCurrency();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [contributeModalOpen, setContributeModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [contributionAmount, setContributionAmount] = useState("");

  // Default deadline to 1 year from now
  const getDefaultDeadline = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return date.toISOString().split("T")[0];
  };

  const [formData, setFormData] = useState({
    name: "",
    target_amount: "",
    deadline: getDefaultDeadline(),
    icon: "🎯",
    color: "#6366f1",
  });

  const fetchGoals = useCallback(async () => {
    if (!user) return;

    const supabase = getSupabaseClient();
    const { data } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setGoals(data || []);
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const openModal = (goal?: Goal) => {
    if (goal) {
      setEditingGoal(goal);
      setFormData({
        name: goal.name,
        target_amount: goal.target_amount.toString(),
        deadline: goal.deadline,
        icon: goal.icon,
        color: goal.color,
      });
    } else {
      setEditingGoal(null);
      setFormData({
        name: "",
        target_amount: "",
        deadline: getDefaultDeadline(),
        icon: "🎯",
        color: "#6366f1",
      });
    }
    setModalOpen(true);
  };

  const openContributeModal = (goal: Goal) => {
    setSelectedGoal(goal);
    setContributionAmount("");
    setContributeModalOpen(true);
  };

  const handleSave = async () => {
    if (!user) {
      toast.error("You must be logged in to create a goal");
      return;
    }

    if (!formData.name.trim()) {
      toast.error("Please enter a goal name");
      return;
    }

    if (!formData.target_amount || parseFloat(formData.target_amount) <= 0) {
      toast.error("Please enter a valid target amount");
      return;
    }

    if (!formData.deadline) {
      toast.error("Please select a target date");
      return;
    }

    setIsSaving(true);
    const supabase = getSupabaseClient();

    const goalData = {
      user_id: user.id,
      name: formData.name.trim(),
      target_amount: parseFloat(formData.target_amount),
      deadline: formData.deadline,
      icon: formData.icon,
      color: formData.color,
    };

    if (editingGoal) {
      const { error } = await supabase
        .from("goals")
        .update(goalData)
        .eq("id", editingGoal.id);

      if (error) {
        console.error("Error updating goal:", error);
        toast.error(`Failed to update goal: ${error.message}`);
      } else {
        toast.success("Goal updated successfully");
        setModalOpen(false);
        fetchGoals();
      }
    } else {
      const { error } = await supabase.from("goals").insert({
        ...goalData,
        current_amount: 0,
        status: "active",
      });

      if (error) {
        console.error("Error creating goal:", error);
        toast.error(`Failed to create goal: ${error.message}`);
      } else {
        toast.success("Goal created successfully");
        setModalOpen(false);
        fetchGoals();
      }
    }

    setIsSaving(false);
  };

  const handleContribute = async () => {
    if (!selectedGoal || !contributionAmount || !user) return;

    const amount = parseFloat(contributionAmount);
    if (amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsSaving(true);
    const supabase = getSupabaseClient();

    const newAmount = selectedGoal.current_amount + amount;
    const isCompleted = newAmount >= selectedGoal.target_amount;

    // Insert contribution record first
    const { error: contributionError } = await supabase
      .from("goal_contributions")
      .insert({
        user_id: user.id,
        goal_id: selectedGoal.id,
        amount: amount,
        note: `Contribution to ${selectedGoal.name}`,
        date: new Date().toISOString().split("T")[0],
      });

    if (contributionError) {
      console.error("Error adding contribution:", contributionError);
      toast.error(`Failed to add contribution: ${contributionError.message}`);
      setIsSaving(false);
      return;
    }

    // Update goal's current amount
    const { error: updateError } = await supabase
      .from("goals")
      .update({
        current_amount: newAmount,
        status: isCompleted ? "completed" : "active",
      })
      .eq("id", selectedGoal.id);

    if (updateError) {
      console.error("Error updating goal:", updateError);
      toast.error(`Failed to update goal: ${updateError.message}`);
    } else {
      if (isCompleted) {
        toast.success("Congratulations! Goal completed! 🎉");
      } else {
        toast.success("Contribution added successfully");
      }
      setContributeModalOpen(false);
      fetchGoals();
    }

    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from("goals").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete goal");
    } else {
      toast.success("Goal deleted successfully");
      fetchGoals();
    }
  };

  if (isLoading) {
    return <Loader fullScreen text="Loading goals..." />;
  }

  return (
    <PageWrapper>
      <PageContent>
        <PageHeader>
          <PageTitle>
            <PageTitleIcon>
              <Target size={20} />
            </PageTitleIcon>
            <h1>Savings Goals</h1>
          </PageTitle>
          <Button leftIcon={<Plus size={18} />} onClick={() => openModal()}>
            Create Goal
          </Button>
        </PageHeader>

        <GoalsGrid>
          {goals.length === 0 ? (
            <EmptyState>
              <EmptyStateIcon>
                <Target size={40} strokeWidth={1.5} />
              </EmptyStateIcon>
              <h3>Start Your Savings Journey</h3>
              <p>
                Set your first savings goal and track your progress towards
                financial freedom.
              </p>
              <Button leftIcon={<Plus size={18} />} onClick={() => openModal()}>
                Create Your First Goal
              </Button>
            </EmptyState>
          ) : (
            goals.map((goal, index) => {
              const percentage =
                (goal.current_amount / goal.target_amount) * 100;
              const isCompleted = goal.status === "completed";
              const remaining = goal.target_amount - goal.current_amount;
              const daysUntilDeadline = Math.ceil(
                (new Date(goal.deadline).getTime() - new Date().getTime()) /
                  (1000 * 60 * 60 * 24),
              );
              const isUrgent = daysUntilDeadline <= 30 && daysUntilDeadline > 0;

              return (
                <GoalCard
                  key={goal.id}
                  $isCompleted={isCompleted}
                  $index={index}
                  $color={goal.color}
                >
                  {isCompleted && (
                    <CompletedBadge>
                      <CheckCircle size={12} /> Completed
                    </CompletedBadge>
                  )}
                  <CardBody>
                    <GoalHeader>
                      <GoalInfo>
                        <GoalIcon $color={goal.color}>{goal.icon}</GoalIcon>
                        <GoalDetails>
                          <h3>{goal.name}</h3>
                          <DueDateBadge>
                            <Calendar size={12} />
                            {formatDate(goal.deadline)}
                          </DueDateBadge>
                        </GoalDetails>
                      </GoalInfo>
                      <Actions>
                        <ActionButtonWrapper>
                          <EditButton
                            onClick={() => openModal(goal)}
                            aria-label="Edit goal"
                          >
                            <Edit />
                          </EditButton>
                          <ActionTooltip>Edit Goal</ActionTooltip>
                        </ActionButtonWrapper>
                        <ActionButtonWrapper>
                          <DeleteButton
                            onClick={() => handleDelete(goal.id)}
                            aria-label="Delete goal"
                          >
                            <Trash2 />
                          </DeleteButton>
                          <ActionTooltip>Delete Goal</ActionTooltip>
                        </ActionButtonWrapper>
                      </Actions>
                    </GoalHeader>

                    <AmountSection>
                      <CurrentAmount>
                        {formatCurrency(goal.current_amount)}
                      </CurrentAmount>
                      <TargetAmount>
                        of {formatCurrency(goal.target_amount)}
                      </TargetAmount>
                    </AmountSection>

                    <ProgressSection>
                      <ProgressStats>
                        <ProgressLabel>
                          <TrendingUp size={14} />
                          Progress
                        </ProgressLabel>
                        <ProgressPercentage $color={goal.color}>
                          {percentage.toFixed(0)}%
                        </ProgressPercentage>
                      </ProgressStats>
                      <ProgressBar>
                        <ProgressFill
                          $percentage={percentage}
                          $color={goal.color}
                        />
                      </ProgressBar>
                    </ProgressSection>

                    <StatusRow>
                      {!isCompleted && remaining > 0 && (
                        <RemainingAmount>
                          {formatCurrency(remaining)} left
                        </RemainingAmount>
                      )}

                      {!isCompleted && daysUntilDeadline > 0 && (
                        <DaysRemaining $urgent={isUrgent}>
                          <Clock size={12} />
                          {daysUntilDeadline} days left
                        </DaysRemaining>
                      )}

                      {!isCompleted && daysUntilDeadline <= 0 && (
                        <DaysRemaining $urgent>
                          <Clock size={12} />
                          Overdue
                        </DaysRemaining>
                      )}
                    </StatusRow>

                    {!isCompleted && (
                      <ContributeButton
                        variant="outline"
                        leftIcon={<PiggyBank size={18} />}
                        onClick={() => openContributeModal(goal)}
                      >
                        Add Contribution
                      </ContributeButton>
                    )}
                  </CardBody>
                </GoalCard>
              );
            })
          )}
        </GoalsGrid>

        {/* Create/Edit Goal Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingGoal ? "Edit Goal" : "Create Goal"}
        >
          <ModalForm>
            <Input
              label="Goal Name"
              placeholder="e.g., Emergency Fund"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              fullWidth
            />
            <Input
              label="Target Amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.target_amount}
              onChange={(e) =>
                setFormData({ ...formData, target_amount: e.target.value })
              }
              fullWidth
            />
            <Input
              label="Target Date"
              type="date"
              value={formData.deadline}
              onChange={(e) =>
                setFormData({ ...formData, deadline: e.target.value })
              }
              fullWidth
            />
            <div>
              <Label>Icon</Label>
              <IconGrid>
                {GOAL_ICONS.map((icon) => (
                  <IconOption
                    key={icon}
                    $isSelected={formData.icon === icon}
                    onClick={() => setFormData({ ...formData, icon })}
                  >
                    {icon}
                  </IconOption>
                ))}
              </IconGrid>
            </div>
            <div>
              <Label>Color</Label>
              <ColorGrid>
                {COLORS.map((color) => (
                  <ColorOption
                    key={color}
                    $color={color}
                    $isSelected={formData.color === color}
                    onClick={() => setFormData({ ...formData, color })}
                  />
                ))}
              </ColorGrid>
            </div>
            <ModalActions>
              <Button variant="ghost" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} isLoading={isSaving}>
                {editingGoal ? "Save Changes" : "Create Goal"}
              </Button>
            </ModalActions>
          </ModalForm>
        </Modal>

        {/* Contribute Modal */}
        <Modal
          isOpen={contributeModalOpen}
          onClose={() => setContributeModalOpen(false)}
          title="Add Contribution"
          size="sm"
        >
          <ModalForm>
            <ModalDescription>
              How much do you want to add to &quot;{selectedGoal?.name}&quot;?
            </ModalDescription>
            <Input
              label="Amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={contributionAmount}
              onChange={(e) => setContributionAmount(e.target.value)}
              fullWidth
            />
            <ModalActions>
              <Button
                variant="ghost"
                onClick={() => setContributeModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleContribute} isLoading={isSaving}>
                Add Contribution
              </Button>
            </ModalActions>
          </ModalForm>
        </Modal>
      </PageContent>
    </PageWrapper>
  );
}
