"use client";

import { DollarSign, Plus, Target, TrendingDown, Wallet } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import styled from "styled-components";

import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { SpendingChart } from "@/components/dashboard/SpendingChart";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { useAuth } from "@/context/AuthContext";
import { getSupabaseClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const WelcomeText = styled.div`
  h1 {
    font-size: ${({ theme }) => theme.typography.fontSize["2xl"]};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.text};

    @media (max-width: 480px) {
      font-size: ${({ theme }) => theme.typography.fontSize.xl};
    }
  }

  p {
    color: ${({ theme }) => theme.colors.textSecondary};
    margin-top: 4px;

    @media (max-width: 480px) {
      font-size: ${({ theme }) => theme.typography.fontSize.sm};
    }
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const QuickActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};

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

export default function DashboardPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSpent: 0,
    monthlyBudget: 0,
    savingsGoal: 0,
    transactions: 0,
    trend: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      const supabase = getSupabaseClient();

      try {
        // Get current month's start and end dates
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
          .toISOString()
          .split("T")[0];
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
          .toISOString()
          .split("T")[0];

        // Fetch expenses for current month
        const { data: expenses } = await supabase
          .from("expenses")
          .select("*, category:categories(id, name, icon, color)")
          .eq("user_id", user.id)
          .gte("date", startOfMonth)
          .lte("date", endOfMonth)
          .order("date", { ascending: false });

        // Fetch budgets
        const { data: budgets } = await supabase
          .from("budgets")
          .select("*")
          .eq("user_id", user.id)
          .eq("period", "monthly");

        // Fetch goals
        const { data: goals } = await supabase
          .from("goals")
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "active");

        // Calculate stats
        const totalSpent = expenses?.reduce((sum: number, e: { amount: number }) => sum + e.amount, 0) || 0;
        const monthlyBudget =
          budgets?.reduce((sum: number, b: { amount: number }) => sum + b.amount, 0) || 0;
        const savingsGoal =
          goals?.reduce((sum: number, g: { target_amount: number }) => sum + g.target_amount, 0) || 0;

        setStats({
          totalSpent,
          monthlyBudget,
          savingsGoal,
          transactions: expenses?.length || 0,
          trend: -12.5, // Placeholder - would calculate from previous month
        });

        // Define expense type for this context
        type ExpenseWithCategory = {
          id: string;
          description: string;
          amount: number;
          date: string;
          category_id: string;
          category?: { name: string; icon: string; color: string };
        };

        // Set recent transactions (top 5)
        setRecentTransactions(
          (expenses || []).slice(0, 5).map((e: ExpenseWithCategory) => ({
            id: e.id,
            description: e.description,
            amount: e.amount,
            date: e.date,
            category: e.category || {
              name: "Other",
              icon: "📦",
              color: "#6b7280",
            },
          })),
        );

        // Calculate category data for chart
        const categoryTotals: Record<
          string,
          { name: string; value: number; color: string }
        > = {};
        (expenses || []).forEach((e: ExpenseWithCategory) => {
          const catId = e.category_id;
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
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (isLoading) {
    return <Loader fullScreen text="Loading dashboard..." />;
  }

  const userName = user?.user_metadata?.full_name || "there";

  return (
    <>
      <PageHeader>
        <WelcomeText>
          <h1>Welcome back, {userName}!</h1>
          <p>Here&apos;s your financial overview for this month</p>
        </WelcomeText>
        <QuickActions>
          <Link href="/expenses/add">
            <Button leftIcon={<Plus size={18} />}>Add Expense</Button>
          </Link>
        </QuickActions>
      </PageHeader>

      <StatsGrid>
        <StatCard
          title="Total Spent"
          value={formatCurrency(stats.totalSpent)}
          icon={DollarSign}
          trend={{ value: Math.abs(stats.trend), isPositive: stats.trend > 0 }}
          color="#ef4444"
        />
        <StatCard
          title="Monthly Budget"
          value={formatCurrency(stats.monthlyBudget)}
          icon={Wallet}
          color="#6366f1"
        />
        <StatCard
          title="Savings Goal"
          value={formatCurrency(stats.savingsGoal)}
          icon={Target}
          color="#10b981"
        />
        <StatCard
          title="Transactions"
          value={stats.transactions.toString()}
          icon={TrendingDown}
          color="#f59e0b"
        />
      </StatsGrid>

      <ContentGrid>
        <SpendingChart data={categoryData} />
        <RecentTransactions transactions={recentTransactions} />
      </ContentGrid>
    </>
  );
}
