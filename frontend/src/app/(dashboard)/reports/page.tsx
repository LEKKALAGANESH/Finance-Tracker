'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Download } from 'lucide-react';
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { getSupabaseClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Loader } from '@/components/ui/Loader';

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};

  h1 {
    font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.text};

    @media (max-width: 480px) {
      font-size: ${({ theme }) => theme.typography.fontSize.xl};
    }
  }

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const FilterBar = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: 640px) {
    width: 100%;

    > * {
      flex: 1;
      min-width: 100px;
    }

    button {
      flex: none;
      width: 100%;
    }
  }

  @media (max-width: 480px) {
    flex-direction: column;

    > * {
      width: 100%;
    }
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 380px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};

  h3 {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.textSecondary};
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }

  p {
    font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.text};
  }

  span {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  @media (max-width: 480px) {
    padding: ${({ theme }) => theme.spacing.md};

    p {
      font-size: ${({ theme }) => theme.typography.fontSize.xl};
    }
  }
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ChartContainer = styled.div`
  height: 300px;

  @media (max-width: 480px) {
    height: 250px;
  }
`;

const FullWidthChart = styled(Card)`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const TableContainer = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: ${({ theme }) => theme.spacing.md};
    text-align: left;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }

  th {
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
  }

  td {
    color: ${({ theme }) => theme.colors.text};
  }
`;

const CategoryCell = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const CategoryIcon = styled.span<{ $color: string }>`
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ $color }) => `${$color}15`};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PercentageBar = styled.div<{ $percentage: number; $color: string }>`
  height: 8px;
  background: ${({ theme }) => theme.colors.surfaceHover};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  overflow: hidden;
  min-width: 100px;

  &::after {
    content: '';
    display: block;
    height: 100%;
    width: ${({ $percentage }) => Math.min($percentage, 100)}%;
    background: ${({ $color }) => $color};
    border-radius: ${({ theme }) => theme.borderRadius.full};
  }
`;

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

const MONTHS = [
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

export default function ReportsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const [stats, setStats] = useState({
    totalSpent: 0,
    avgPerDay: 0,
    transactions: 0,
    topCategory: '',
  });
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<any[]>([]);

  const years = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { value: year.toString(), label: year.toString() };
  });

  useEffect(() => {
    fetchReportData();
  }, [user, selectedMonth, selectedYear]);

  const fetchReportData = async () => {
    if (!user) return;

    setIsLoading(true);
    const supabase = getSupabaseClient();

    const month = parseInt(selectedMonth);
    const year = parseInt(selectedYear);
    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];
    const daysInMonth = new Date(year, month, 0).getDate();

    // Fetch expenses for selected month
    const { data: expenses } = await supabase
      .from('expenses')
      .select('*, category:categories(id, name, icon, color)')
      .eq('user_id', user.id)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    // Define expense type for this context
    type ExpenseData = {
      amount: number;
      date: string;
      category_id: string;
      category?: { id: string; name: string; icon: string; color: string };
    };

    // Calculate stats
    const totalSpent = expenses?.reduce((sum: number, e: ExpenseData) => sum + e.amount, 0) || 0;
    const avgPerDay = totalSpent / daysInMonth;

    // Category breakdown
    const categoryTotals: Record<string, { name: string; value: number; color: string; icon: string }> = {};
    (expenses || []).forEach((e: ExpenseData) => {
      const catId = e.category_id || 'other';
      const catName = e.category?.name || 'Other';
      const catColor = e.category?.color || '#6b7280';
      const catIcon = e.category?.icon || '📦';

      if (!categoryTotals[catId]) {
        categoryTotals[catId] = { name: catName, value: 0, color: catColor, icon: catIcon };
      }
      categoryTotals[catId].value += e.amount;
    });

    const sortedCategories = Object.values(categoryTotals).sort((a, b) => b.value - a.value);
    const topCategory = sortedCategories[0]?.name || 'N/A';

    setStats({
      totalSpent,
      avgPerDay,
      transactions: expenses?.length || 0,
      topCategory,
    });

    setCategoryData(sortedCategories.map((c, i) => ({ ...c, color: c.color || COLORS[i % COLORS.length] })));

    // Daily spending data
    const dailyTotals: Record<string, number> = {};
    (expenses || []).forEach((e: ExpenseData) => {
      const day = new Date(e.date).getDate().toString();
      dailyTotals[day] = (dailyTotals[day] || 0) + e.amount;
    });

    const dailyChartData = Array.from({ length: daysInMonth }, (_, i) => ({
      day: (i + 1).toString(),
      amount: dailyTotals[(i + 1).toString()] || 0,
    }));
    setDailyData(dailyChartData);

    // Monthly trend (last 6 months)
    const trendData = [];
    for (let i = 5; i >= 0; i--) {
      const trendDate = new Date(year, month - 1 - i, 1);
      const trendStart = trendDate.toISOString().split('T')[0];
      const trendEnd = new Date(trendDate.getFullYear(), trendDate.getMonth() + 1, 0)
        .toISOString()
        .split('T')[0];

      const { data: monthExpenses } = await supabase
        .from('expenses')
        .select('amount')
        .eq('user_id', user.id)
        .gte('date', trendStart)
        .lte('date', trendEnd);

      const monthTotal = monthExpenses?.reduce((sum: number, e: { amount: number }) => sum + e.amount, 0) || 0;
      trendData.push({
        month: trendDate.toLocaleString('default', { month: 'short' }),
        amount: monthTotal,
      });
    }
    setMonthlyTrend(trendData);

    setIsLoading(false);
  };

  const exportToCSV = async () => {
    if (!user) return;

    const supabase = getSupabaseClient();
    const month = parseInt(selectedMonth);
    const year = parseInt(selectedYear);
    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const { data: expenses } = await supabase
      .from('expenses')
      .select('*, category:categories(name)')
      .eq('user_id', user.id)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (!expenses || expenses.length === 0) {
      toast.error('No data to export');
      return;
    }

    type ExportExpense = {
      date: string;
      description: string;
      amount: number;
      payment_method: string;
      category?: { name: string };
    };

    const headers = ['Date', 'Category', 'Description', 'Amount', 'Payment Method'];
    const rows = expenses.map((e: ExportExpense) => [
      e.date,
      e.category?.name || 'Other',
      e.description,
      e.amount.toFixed(2),
      e.payment_method,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r: string[]) => r.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `expenses_${year}_${month.toString().padStart(2, '0')}.csv`;
    link.click();

    toast.success('Report exported successfully!');
  };

  if (isLoading) {
    return <Loader fullScreen text="Loading reports..." />;
  }

  return (
    <>
      <PageHeader>
        <h1>Reports</h1>
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

      <StatsGrid>
        <StatCard>
          <h3>Total Spent</h3>
          <p>{formatCurrency(stats.totalSpent)}</p>
          <span>
            {MONTHS.find((m) => m.value === selectedMonth)?.label} {selectedYear}
          </span>
        </StatCard>
        <StatCard>
          <h3>Daily Average</h3>
          <p>{formatCurrency(stats.avgPerDay)}</p>
          <span>Per day</span>
        </StatCard>
        <StatCard>
          <h3>Transactions</h3>
          <p>{stats.transactions}</p>
          <span>Total expenses</span>
        </StatCard>
        <StatCard>
          <h3>Top Category</h3>
          <p>{stats.topCategory}</p>
          <span>Highest spending</span>
        </StatCard>
      </StatsGrid>

      <ChartsGrid>
        <Card>
          <CardHeader title="Spending by Category" />
          <CardBody>
            <ChartContainer>
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </RechartsPie>
              </ResponsiveContainer>
            </ChartContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="6-Month Trend" />
          <CardBody>
            <ChartContainer>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" tickFormatter={(value) => `$${value}`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#6366f1"
                    strokeWidth={3}
                    dot={{ fill: '#6366f1', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardBody>
        </Card>
      </ChartsGrid>

      <FullWidthChart>
        <CardHeader title="Daily Spending" />
        <CardBody>
          <ChartContainer>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" tickFormatter={(value) => `$${value}`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardBody>
      </FullWidthChart>

      <Card>
        <CardHeader title="Category Breakdown" />
        <CardBody>
          <TableContainer>
            <Table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>% of Total</th>
                  <th>Distribution</th>
                </tr>
              </thead>
              <tbody>
                {categoryData.map((category) => {
                  const percentage = stats.totalSpent > 0 ? (category.value / stats.totalSpent) * 100 : 0;
                  return (
                    <tr key={category.name}>
                      <td>
                        <CategoryCell>
                          <CategoryIcon $color={category.color}>{category.icon}</CategoryIcon>
                          {category.name}
                        </CategoryCell>
                      </td>
                      <td>{formatCurrency(category.value)}</td>
                      <td>{percentage.toFixed(1)}%</td>
                      <td>
                        <PercentageBar $percentage={percentage} $color={category.color} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </TableContainer>
        </CardBody>
      </Card>
    </>
  );
}
