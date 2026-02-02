"use client";

import { AlertTriangle, Edit, Plus, Trash2, Wallet } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import styled, { css, keyframes } from "styled-components";

import { CategoryModal } from "@/components/categories/CategoryModal";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Loader } from "@/components/ui/Loader";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useToast } from "@/context/ToastContext";
import { BUDGET_PERIODS } from "@/lib/constants";
import { getSupabaseClient } from "@/lib/supabase/client";
import { CategoryFormData } from "@/lib/validations";

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
      ${({ theme }) => theme.colors.primary}08 0%,
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
      ${({ theme }) => theme.colors.secondary}06 0%,
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
  background: ${({ theme }) => theme.gradients.primary};
  color: white;
  flex-shrink: 0;
`;

const BudgetGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 380px) {
    grid-template-columns: 1fr;
  }
`;

const BudgetCard = styled(Card)<{ $index?: number }>`
  position: relative;
  opacity: 0;
  animation: ${fadeInUp} 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: ${({ $index }) => 0.3 + ($index || 0) * 0.1}s;
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);

  &:hover {
    transform: translateY(-4px);
  }
`;

const BudgetHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const BudgetInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const CategoryIcon = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: linear-gradient(
    135deg,
    ${({ $color }) => `${$color}20`} 0%,
    ${({ $color }) => `${$color}10`} 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  box-shadow: 0 2px 8px ${({ $color }) => `${$color}15`};
  transition: all 0.3s ease;

  ${BudgetCard}:hover & {
    transform: scale(1.1) rotate(5deg);
  }
`;

const BudgetDetails = styled.div`
  h3 {
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    color: ${({ theme }) => theme.colors.text};
  }

  p {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.textSecondary};
    text-transform: capitalize;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const IconButton = styled.button`
  padding: ${({ theme }) => theme.spacing.xs};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  transition: all 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
    color: ${({ theme }) => theme.colors.text};
  }

  &.danger:hover {
    background: ${({ theme }) => theme.colors.errorLight};
    color: ${({ theme }) => theme.colors.error};
  }
`;

const ProgressSection = styled.div`
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const ProgressLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ProgressAmount = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text};
`;

const ProgressBar = styled.div`
  height: 8px;
  background: ${({ theme }) => theme.colors.surfaceHover};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $percentage: number; $isOver: boolean }>`
  height: 100%;
  width: ${({ $percentage }) => Math.min($percentage, 100)}%;
  background: ${({ theme, $isOver, $percentage }) =>
    $isOver
      ? `linear-gradient(90deg, ${theme.colors.error}, #f87171)`
      : $percentage >= 80
        ? `linear-gradient(90deg, ${theme.colors.warning}, #fbbf24)`
        : `linear-gradient(90deg, ${theme.colors.success}, #34d399)`};
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
      rgba(255, 255, 255, 0.3),
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

const AlertBanner = styled.div<{ $variant?: "warning" | "error" }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme, $variant }) =>
    $variant === "error" ? theme.colors.errorLight : theme.colors.warningLight};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-top: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme, $variant }) =>
    $variant === "error" ? theme.colors.error : theme.colors.warning};
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
  margin: 0 auto ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => `${theme.colors.primary}15`};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
`;

const RemainingBudget = styled.div<{ $isOver: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme, $isOver }) =>
    $isOver ? `${theme.colors.error}10` : `${theme.colors.success}10`};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};

  span:first-child {
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  span:last-child {
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    color: ${({ theme, $isOver }) =>
      $isOver ? theme.colors.error : theme.colors.success};
  }
`;

const CategorySelectLoading = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
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

const CategorySelectorLabel = styled.label`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text};
  display: block;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  gap: ${({ theme }) => theme.spacing.sm};
  max-height: 200px;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing.xs};
  margin: -${({ theme }) => theme.spacing.xs};

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 4px;
  }
`;

const CategoryOption = styled.button<{ $isSelected: boolean; $color: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 2px solid
    ${({ $isSelected, $color }) => ($isSelected ? $color : "transparent")};
  background: ${({ theme, $isSelected }) =>
    $isSelected ? theme.colors.surfaceHover : theme.colors.surface};
  transition: all 0.15s ease;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
    transform: translateY(-2px);
  }

  span:first-child {
    font-size: 1.25rem;
  }

  span:last-child {
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    color: ${({ theme }) => theme.colors.textSecondary};
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }
`;

const OverallBudgetOption = styled(CategoryOption)`
  background: ${({ theme, $isSelected }) =>
    $isSelected ? `${theme.colors.primary}15` : theme.colors.surface};
  border-color: ${({ theme, $isSelected }) =>
    $isSelected ? theme.colors.primary : "transparent"};

  svg {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const AddCategoryButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 2px dashed ${({ theme }) => theme.colors.border};
  background: transparent;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.primaryLight};

    svg,
    span {
      color: ${({ theme }) => theme.colors.primary};
    }
  }

  svg {
    color: ${({ theme }) => theme.colors.textMuted};
    transition: color 0.2s ease;
  }

  span {
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    color: ${({ theme }) => theme.colors.textMuted};
    transition: color 0.2s ease;
  }
`;

// Budget Overview Styles
const BudgetOverviewCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const OverviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};

  h3 {
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    color: ${({ theme }) => theme.colors.text};
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

const OverviewStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 480px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const OverviewStat = styled.div<{ $color?: string }>`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surfaceHover};
  border-radius: ${({ theme }) => theme.borderRadius.md};

  span:first-child {
    display: block;
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.textSecondary};
    margin-bottom: 4px;
  }

  span:last-child {
    display: block;
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ $color, theme }) => $color || theme.colors.text};
  }
`;

const OverviewProgressBar = styled.div`
  height: 24px;
  background: ${({ theme }) => theme.colors.surfaceHover};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  overflow: hidden;
  display: flex;
  position: relative;
`;

const OverviewProgressSegment = styled.div<{ $width: number; $color: string }>`
  height: 100%;
  width: ${({ $width }) => Math.min(Math.max($width, 0), 100)}%;
  background: ${({ $color }) => $color};
  transition: width 0.5s ease;
`;

const OverviewLegend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.lg};
  margin-top: ${({ theme }) => theme.spacing.md};
  justify-content: center;

  @media (max-width: 640px) {
    gap: ${({ theme }) => theme.spacing.md};
  }
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const LegendColor = styled.div<{ $color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 3px;
  background: ${({ $color }) => $color};
`;

const LegendText = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

// ============================================================================
// TypeScript Interfaces
// ============================================================================

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: "expense" | "income";
  user_id: string | null;
  is_default: boolean;
}

interface BudgetCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface Budget {
  id: string;
  category_id: string | null;
  amount: number;
  period: string;
  alert_threshold: number;
  category?: BudgetCategory;
  spent?: number;
}

interface BudgetFormData {
  category_id: string;
  amount: string;
  period: string;
  alert_threshold: string;
}

export default function BudgetsPage() {
  const { user } = useAuth();
  const { formatCurrency } = useCurrency();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [totalSaved, setTotalSaved] = useState(0);

  // Form state
  const [formData, setFormData] = useState<BudgetFormData>({
    category_id: "",
    amount: "",
    period: "monthly",
    alert_threshold: "80",
  });

  const fetchData = useCallback(async () => {
    if (!user) return;

    const supabase = getSupabaseClient();
    setCategoriesLoading(true);

    // Fetch categories
    const { data: categoriesData } = await supabase
      .from("categories")
      .select("*")
      .or(`user_id.eq.${user.id},and(user_id.is.null,is_default.eq.true)`)
      .eq("type", "expense");
    setCategories(categoriesData || []);
    setCategoriesLoading(false);

    // Fetch budgets with category info
    const { data: budgetsData } = await supabase
      .from("budgets")
      .select("*, category:categories(id, name, icon, color)")
      .eq("user_id", user.id);

    // Fetch this month's savings (contributions)
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split("T")[0];
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .split("T")[0];

    const { data: contributions } = await supabase
      .from("goal_contributions")
      .select("amount")
      .eq("user_id", user.id)
      .gte("date", monthStart)
      .lte("date", monthEnd);

    const savedAmount =
      contributions?.reduce(
        (sum: number, c: { amount: number }) => sum + c.amount,
        0,
      ) || 0;
    setTotalSaved(savedAmount);

    // Calculate spent for each budget based on its period
    // Helper function to get date range based on budget period
    const getDateRange = (period: string) => {
      const today = new Date();
      let startDate: Date;
      let endDate: Date;

      switch (period) {
        case "weekly":
          // Start from Sunday of current week
          const dayOfWeek = today.getDay();
          startDate = new Date(today);
          startDate.setDate(today.getDate() - dayOfWeek);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 6);
          break;
        case "yearly":
          startDate = new Date(today.getFullYear(), 0, 1);
          endDate = new Date(today.getFullYear(), 11, 31);
          break;
        case "monthly":
        default:
          startDate = new Date(today.getFullYear(), today.getMonth(), 1);
          endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          break;
      }

      return {
        start: startDate.toISOString().split("T")[0],
        end: endDate.toISOString().split("T")[0],
      };
    };

    const budgetsWithSpent = await Promise.all(
      (budgetsData || []).map(
        async (
          budget: Budget & {
            category?: {
              id: string;
              name: string;
              icon: string;
              color: string;
            };
          },
        ) => {
          const { start, end } = getDateRange(budget.period);

          let query = supabase
            .from("expenses")
            .select("amount")
            .eq("user_id", user.id)
            .gte("date", start)
            .lte("date", end);

          if (budget.category_id) {
            query = query.eq("category_id", budget.category_id);
          }

          const { data: expenses } = await query;
          const spent =
            expenses?.reduce(
              (sum: number, e: { amount: number }) => sum + e.amount,
              0,
            ) || 0;

          return { ...budget, spent };
        },
      ),
    );

    setBudgets(budgetsWithSpent);
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchCategories = async () => {
    if (!user) return;
    setCategoriesLoading(true);
    const supabase = getSupabaseClient();
    const { data: categoriesData } = await supabase
      .from("categories")
      .select("*")
      .or(`user_id.eq.${user.id},is_default.eq.true`)
      .eq("type", "expense");
    setCategories(categoriesData || []);
    setCategoriesLoading(false);
  };

  const handleCreateCategory = async (data: CategoryFormData) => {
    if (!user) return;

    const supabase = getSupabaseClient();
    const { data: newCategory, error } = await supabase
      .from("categories")
      .insert({
        user_id: user.id,
        name: data.name,
        icon: data.icon,
        color: data.color,
        type: data.type,
        is_default: false,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to create category");
      throw error;
    }

    toast.success("Category created!");
    await fetchCategories();

    // Auto-select the newly created category
    if (newCategory) {
      setFormData({ ...formData, category_id: newCategory.id });
    }
  };

  const openModal = (budget?: Budget) => {
    if (budget) {
      setEditingBudget(budget);
      setFormData({
        category_id: budget.category_id || "",
        amount: budget.amount.toString(),
        period: budget.period,
        alert_threshold: budget.alert_threshold.toString(),
      });
    } else {
      setEditingBudget(null);
      setFormData({
        category_id: "",
        amount: "",
        period: "monthly",
        alert_threshold: "80",
      });
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!user || !formData.amount) return;

    setIsSaving(true);
    const supabase = getSupabaseClient();

    const budgetData = {
      user_id: user.id,
      category_id: formData.category_id || null,
      amount: parseFloat(formData.amount),
      period: formData.period,
      alert_threshold: parseInt(formData.alert_threshold),
      start_date: new Date().toISOString().split("T")[0],
    };

    if (editingBudget) {
      const { error } = await supabase
        .from("budgets")
        .update(budgetData)
        .eq("id", editingBudget.id);

      if (error) {
        toast.error("Failed to update budget");
      } else {
        toast.success("Budget updated successfully");
      }
    } else {
      const { error } = await supabase.from("budgets").insert(budgetData);

      if (error) {
        toast.error("Failed to create budget");
      } else {
        toast.success("Budget created successfully");
      }
    }

    setIsSaving(false);
    setModalOpen(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from("budgets").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete budget");
    } else {
      toast.success("Budget deleted successfully");
      fetchData();
    }
  };

  if (isLoading) {
    return <Loader fullScreen text="Loading budgets..." />;
  }

  return (
    <PageWrapper>
      <PageContent>
        <PageHeader>
          <PageTitle>
            <PageTitleIcon>
              <Wallet size={20} />
            </PageTitleIcon>
            <h1>Budgets</h1>
          </PageTitle>
          <Button leftIcon={<Plus size={18} />} onClick={() => openModal()}>
            Create Budget
          </Button>
        </PageHeader>

        {/* Budget Overview Summary */}
        {budgets.length > 0 &&
          (() => {
            const totalBudget = budgets
              .filter((b) => b.period === "monthly")
              .reduce((sum, b) => sum + b.amount, 0);
            const totalSpent = budgets
              .filter((b) => b.period === "monthly")
              .reduce((sum, b) => sum + (b.spent || 0), 0);
            const totalUsed = totalSpent + totalSaved;
            const remaining = Math.max(0, totalBudget - totalUsed);
            const overBudget = totalUsed > totalBudget;

            const spentPercent =
              totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
            const savedPercent =
              totalBudget > 0 ? (totalSaved / totalBudget) * 100 : 0;
            const remainingPercent =
              totalBudget > 0 ? (remaining / totalBudget) * 100 : 0;

            return (
              <BudgetOverviewCard>
                <OverviewHeader>
                  <h3>
                    <Wallet size={20} />
                    Monthly Budget Overview
                  </h3>
                </OverviewHeader>

                <OverviewStats>
                  <OverviewStat $color="#6366f1">
                    <span>Total Budget</span>
                    <span>{formatCurrency(totalBudget)}</span>
                  </OverviewStat>
                  <OverviewStat $color="#ef4444">
                    <span>Total Spent</span>
                    <span>{formatCurrency(totalSpent)}</span>
                  </OverviewStat>
                  <OverviewStat $color="#10b981">
                    <span>Total Saved</span>
                    <span>{formatCurrency(totalSaved)}</span>
                  </OverviewStat>
                  <OverviewStat $color={overBudget ? "#f59e0b" : "#6b7280"}>
                    <span>{overBudget ? "Over Budget" : "Remaining"}</span>
                    <span>
                      {overBudget
                        ? `-${formatCurrency(totalUsed - totalBudget)}`
                        : formatCurrency(remaining)}
                    </span>
                  </OverviewStat>
                </OverviewStats>

                {totalBudget > 0 && (
                  <>
                    <OverviewProgressBar>
                      <OverviewProgressSegment
                        $width={spentPercent}
                        $color="#ef4444"
                      />
                      <OverviewProgressSegment
                        $width={savedPercent}
                        $color="#10b981"
                      />
                      <OverviewProgressSegment
                        $width={remainingPercent}
                        $color="#d1d5db"
                      />
                    </OverviewProgressBar>

                    <OverviewLegend>
                      <LegendItem>
                        <LegendColor $color="#ef4444" />
                        <LegendText>
                          Spent ({spentPercent.toFixed(0)}%)
                        </LegendText>
                      </LegendItem>
                      <LegendItem>
                        <LegendColor $color="#10b981" />
                        <LegendText>
                          Saved ({savedPercent.toFixed(0)}%)
                        </LegendText>
                      </LegendItem>
                      <LegendItem>
                        <LegendColor $color="#d1d5db" />
                        <LegendText>
                          Remaining ({remainingPercent.toFixed(0)}%)
                        </LegendText>
                      </LegendItem>
                    </OverviewLegend>
                  </>
                )}
              </BudgetOverviewCard>
            );
          })()}

        <BudgetGrid>
          {budgets.length === 0 ? (
            <EmptyState>
              <EmptyStateIcon>💰</EmptyStateIcon>
              <h3>No Budgets Yet</h3>
              <p>
                Create your first budget to start tracking your spending and
                stay on top of your finances.
              </p>
              <Button leftIcon={<Plus size={18} />} onClick={() => openModal()}>
                Create Your First Budget
              </Button>
            </EmptyState>
          ) : (
            budgets.map((budget, index) => {
              const percentage =
                budget.amount > 0
                  ? ((budget.spent || 0) / budget.amount) * 100
                  : 0;
              const isOver = percentage > 100;
              const isNearLimit = percentage >= budget.alert_threshold;

              return (
                <BudgetCard key={budget.id} $index={index}>
                  <CardBody>
                    <BudgetHeader>
                      <BudgetInfo>
                        <CategoryIcon
                          $color={budget.category?.color || "#6366f1"}
                        >
                          {budget.category?.icon || "💰"}
                        </CategoryIcon>
                        <BudgetDetails>
                          <h3>{budget.category?.name || "Overall Budget"}</h3>
                          <p>{budget.period}</p>
                        </BudgetDetails>
                      </BudgetInfo>
                      <Actions>
                        <IconButton
                          onClick={() => openModal(budget)}
                          aria-label="Edit budget"
                        >
                          <Edit size={18} />
                        </IconButton>
                        <IconButton
                          className="danger"
                          onClick={() => handleDelete(budget.id)}
                          aria-label="Delete budget"
                        >
                          <Trash2 size={18} />
                        </IconButton>
                      </Actions>
                    </BudgetHeader>

                    <ProgressSection>
                      <ProgressHeader>
                        <ProgressLabel>
                          {formatCurrency(budget.spent || 0)} of{" "}
                          {formatCurrency(budget.amount)}
                        </ProgressLabel>
                        <ProgressAmount>
                          {percentage.toFixed(0)}%
                        </ProgressAmount>
                      </ProgressHeader>
                      <ProgressBar>
                        <ProgressFill
                          $percentage={percentage}
                          $isOver={isOver}
                        />
                      </ProgressBar>
                    </ProgressSection>

                    <RemainingBudget $isOver={isOver}>
                      <span>{isOver ? "Over budget:" : "Remaining:"}</span>
                      <span>
                        {isOver
                          ? formatCurrency((budget.spent || 0) - budget.amount)
                          : formatCurrency(budget.amount - (budget.spent || 0))}
                      </span>
                    </RemainingBudget>

                    {isNearLimit && !isOver && (
                      <AlertBanner>
                        <AlertTriangle size={16} />
                        Approaching budget limit ({percentage.toFixed(0)}% used)
                      </AlertBanner>
                    )}
                    {isOver && (
                      <AlertBanner $variant="error">
                        <AlertTriangle size={16} />
                        Budget exceeded by {(percentage - 100).toFixed(0)}%
                      </AlertBanner>
                    )}
                  </CardBody>
                </BudgetCard>
              );
            })
          )}
        </BudgetGrid>

        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingBudget ? "Edit Budget" : "Create Budget"}
        >
          <ModalForm>
            <div>
              <CategorySelectorLabel>Category (optional)</CategorySelectorLabel>
              {categoriesLoading ? (
                <CategorySelectLoading>
                  Loading categories...
                </CategorySelectLoading>
              ) : (
                <CategoryGrid>
                  <OverallBudgetOption
                    type="button"
                    $isSelected={formData.category_id === ""}
                    $color="#6366f1"
                    onClick={() =>
                      setFormData({ ...formData, category_id: "" })
                    }
                  >
                    <Wallet size={20} />
                    <span>All Categories</span>
                  </OverallBudgetOption>
                  {categories.map((category) => (
                    <CategoryOption
                      key={category.id}
                      type="button"
                      $isSelected={formData.category_id === category.id}
                      $color={category.color}
                      onClick={() =>
                        setFormData({ ...formData, category_id: category.id })
                      }
                    >
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                    </CategoryOption>
                  ))}
                  <AddCategoryButton
                    type="button"
                    onClick={() => setCategoryModalOpen(true)}
                  >
                    <Plus size={18} />
                    <span>Add New</span>
                  </AddCategoryButton>
                </CategoryGrid>
              )}
            </div>
            <Input
              label="Budget Amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              fullWidth
            />
            <Select
              label="Period"
              options={BUDGET_PERIODS.map((p) => ({
                value: p.value,
                label: p.label,
              }))}
              value={formData.period}
              onChange={(e) =>
                setFormData({ ...formData, period: e.target.value })
              }
              fullWidth
            />
            <Input
              label="Alert Threshold (%)"
              type="number"
              min="1"
              max="100"
              value={formData.alert_threshold}
              onChange={(e) =>
                setFormData({ ...formData, alert_threshold: e.target.value })
              }
              hint="Get notified when spending reaches this percentage"
              fullWidth
            />
            <ModalActions>
              <Button variant="ghost" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} isLoading={isSaving}>
                {editingBudget ? "Save Changes" : "Create Budget"}
              </Button>
            </ModalActions>
          </ModalForm>
        </Modal>

        <CategoryModal
          isOpen={categoryModalOpen}
          onClose={() => setCategoryModalOpen(false)}
          onSave={handleCreateCategory}
          type="expense"
        />
      </PageContent>
    </PageWrapper>
  );
}
