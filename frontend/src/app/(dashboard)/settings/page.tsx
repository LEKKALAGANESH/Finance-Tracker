"use client";

import {
  Download,
  Edit2,
  Lock,
  Moon,
  Plus,
  Sun,
  Tag,
  Trash2,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";

import { CategoryModal } from "@/components/categories/CategoryModal";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { useAuth } from "@/context/AuthContext";
import { usePageLoading } from "@/context/NavigationContext";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { getSupabaseClient } from "@/lib/supabase/client";
import { CategoryFormData } from "@/lib/validations";
import { Category } from "@/types/expense";

// ============================================================================
// TypeScript Interfaces
// ============================================================================

/**
 * Category type filter
 */
type CategoryTabType = "expense" | "income";

/**
 * User profile data
 */
interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  currency?: string;
  timezone?: string;
  created_at?: string;
}

/**
 * Profile form data for updates
 */
interface ProfileFormData {
  full_name: string;
  email: string;
}

/**
 * Password change form data
 */
interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Notification settings
 */
interface NotificationSettings {
  emailNotifications: boolean;
  budgetAlerts: boolean;
  goalReminders: boolean;
  weeklyReport: boolean;
}

/**
 * Category expense count mapping
 */
type CategoryExpenseCounts = Record<string, number>;

/**
 * Settings page state
 */
interface SettingsState {
  isLoading: boolean;
  categoriesLoading: boolean;
  isSaving: boolean;
  categories: Category[];
  categoryTab: CategoryTabType;
  categoryModalOpen: boolean;
  editingCategory: Category | null;
  deleteModalOpen: boolean;
  categoryToDelete: Category | null;
  categoryExpenseCounts: CategoryExpenseCounts;
}

/**
 * Props for styled CategoryColor component
 */
interface CategoryColorProps {
  $color: string;
}

const PageHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  h1 {
    font-size: ${({ theme }) => theme.typography.fontSize["2xl"]};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.text};

    /* Tablet */
    @media (max-width: 1023px) {
      font-size: 1.875rem;
    }

    /* Mobile */
    @media (max-width: 767px) {
      font-size: ${({ theme }) => theme.typography.fontSize.xl};
    }

    /* Small Mobile */
    @media (max-width: 480px) {
      font-size: ${({ theme }) => theme.typography.fontSize.lg};
    }
  }

  p {
    color: ${({ theme }) => theme.colors.textSecondary};
    margin-top: ${({ theme }) => theme.spacing.sm};

    /* Mobile */
    @media (max-width: 767px) {
      font-size: ${({ theme }) => theme.typography.fontSize.sm};
    }
  }

  /* Tablet */
  @media (max-width: 1023px) {
    margin-bottom: ${({ theme }) => theme.spacing["2xl"]};
  }

  /* Mobile */
  @media (max-width: 767px) {
    margin-bottom: ${({ theme }) => theme.spacing.xl};
  }

  /* Small Mobile */
  @media (max-width: 480px) {
    margin-bottom: ${({ theme }) => theme.spacing.lg};
  }
`;

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.xl};

  /* Tablet */
  @media (max-width: 1023px) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.lg};
  }

  /* Mobile */
  @media (max-width: 767px) {
    gap: ${({ theme }) => theme.spacing.md};
  }
`;

const FullWidthSection = styled.div`
  grid-column: 1 / -1;
`;

const SettingsCard = styled(Card)`
  height: fit-content;
`;

const SettingSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const SettingRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

const SettingInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};

  svg {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const SettingText = styled.div`
  h4 {
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: 2px;
  }

  p {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const ThemeToggle = styled.button<{ $isDark: boolean }>`
  position: relative;
  width: 56px;
  height: 28px;
  border-radius: 14px;
  background: ${({ $isDark, theme }) =>
    $isDark ? theme.colors.primary : theme.colors.border};
  transition: background 0.2s ease;
  cursor: pointer;

  &::after {
    content: "";
    position: absolute;
    top: 2px;
    left: ${({ $isDark }) => ($isDark ? "30px" : "2px")};
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: white;
    transition: left 0.2s ease;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const FormActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const DangerZone = styled(Card)`
  grid-column: 1 / -1;
  border-color: ${({ theme }) => theme.colors.error};
`;

const DangerHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.error};
  margin-bottom: ${({ theme }) => theme.spacing.md};

  h3 {
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  }
`;

const DangerText = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  line-height: 1.6;
`;

const ModalContent = styled.div`
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

const CategoriesCard = styled(Card)`
  grid-column: 1 / -1;
`;

const CategoryTabs = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.surfaceHover};
  padding: 4px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  width: fit-content;
`;

const CategoryTab = styled.button<{ $isActive: boolean }>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  background: ${({ theme, $isActive }) =>
    $isActive ? theme.colors.surface : "transparent"};
  color: ${({ theme, $isActive }) =>
    $isActive ? theme.colors.text : theme.colors.textMuted};
  box-shadow: ${({ theme, $isActive }) =>
    $isActive ? theme.shadows.sm : "none"};
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`;

const CategoryList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
`;

const CategoryItem = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ $color }) => $color};
    box-shadow: 0 2px 8px ${({ $color }) => $color}20;
  }
`;

const CategoryItemInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const CategoryIcon = styled.div<{ $color: string }>`
  width: 44px;
  height: 44px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ $color }) => $color}20;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
`;

const CategoryDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const CategoryName = styled.span`
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text};
`;

const CategoryMeta = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textMuted};
`;

const CategoryActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const IconButton = styled.button<{ $danger?: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme, $danger }) =>
    $danger ? theme.colors.error : theme.colors.textMuted};
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    background: ${({ theme, $danger }) =>
      $danger ? theme.colors.errorLight : theme.colors.surfaceHover};
    color: ${({ theme, $danger }) =>
      $danger ? theme.colors.error : theme.colors.text};
  }
`;

const EmptyCategoryState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing["2xl"]};
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  border: 2px dashed ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  grid-column: 1 / -1;

  svg {
    margin-bottom: ${({ theme }) => theme.spacing.md};
    color: ${({ theme }) => theme.colors.textMuted};
  }

  p {
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }
`;

const AddCategoryCard = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.lg};
  background: transparent;
  border: 2px dashed ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  min-height: 100px;
  cursor: pointer;
  transition: all 0.2s ease;

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
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    color: ${({ theme }) => theme.colors.textMuted};
    transition: color 0.2s ease;
  }
`;

const CURRENCIES = [
  { value: "USD", label: "$ USD - US Dollar" },
  { value: "EUR", label: "€ EUR - Euro" },
  { value: "GBP", label: "£ GBP - British Pound" },
  { value: "INR", label: "₹ INR - Indian Rupee" },
  { value: "JPY", label: "¥ JPY - Japanese Yen" },
  { value: "CAD", label: "$ CAD - Canadian Dollar" },
  { value: "AUD", label: "$ AUD - Australian Dollar" },
];

function SettingsContent() {
  const { user, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const toast = useToast();
  const searchParams = useSearchParams();
  const categoriesRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(true);

  // Sync loading state with global navigation loader
  usePageLoading(isLoading);

  const [isSaving, setIsSaving] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Profile state
  const [profile, setProfile] = useState({
    full_name: "",
    currency: "USD",
  });

  // Password state
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoryTab, setCategoryTab] = useState<"expense" | "income">(
    "expense",
  );
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteCategoryModalOpen, setDeleteCategoryModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null,
  );
  const [categoryExpenseCounts, setCategoryExpenseCounts] = useState<
    Record<string, number>
  >({});

  const fetchProfile = useCallback(async () => {
    if (!user) return;

    const supabase = getSupabaseClient();
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data) {
      setProfile({
        full_name: data.full_name || user.user_metadata?.full_name || "",
        currency: data.currency || "USD",
      });
    } else {
      setProfile({
        full_name: user.user_metadata?.full_name || "",
        currency: "USD",
      });
    }

    setIsLoading(false);
  }, [user]);

  const fetchCategories = useCallback(async () => {
    if (!user) return;

    setCategoriesLoading(true);
    const supabase = getSupabaseClient();
    const { data } = await supabase
      .from("categories")
      .select("*")
      .or(`user_id.eq.${user.id},and(user_id.is.null,is_default.eq.true)`)
      .order("name");

    setCategories(data || []);

    // Fetch expense counts for each category
    if (data && data.length > 0) {
      const { data: expenseCounts } = await supabase
        .from("expenses")
        .select("category_id")
        .eq("user_id", user.id);

      if (expenseCounts) {
        const counts: Record<string, number> = {};
        expenseCounts.forEach((expense: { category_id: string }) => {
          counts[expense.category_id] = (counts[expense.category_id] || 0) + 1;
        });
        setCategoryExpenseCounts(counts);
      }
    }

    setCategoriesLoading(false);
  }, [user]);

  useEffect(() => {
    fetchProfile();
    fetchCategories();
  }, [fetchProfile, fetchCategories]);

  useEffect(() => {
    // Scroll to categories section if tab=categories
    if (searchParams.get("tab") === "categories" && categoriesRef.current) {
      setTimeout(() => {
        categoriesRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [searchParams, isLoading]);

  const handleSaveCategory = async (data: CategoryFormData) => {
    if (!user) return;

    const supabase = getSupabaseClient();

    if (editingCategory) {
      // Update existing category
      const { error } = await supabase
        .from("categories")
        .update({
          name: data.name,
          icon: data.icon,
          color: data.color,
          type: data.type,
        })
        .eq("id", editingCategory.id);

      if (error) {
        toast.error("Failed to update category");
        throw error;
      }
      toast.success("Category updated!");
    } else {
      // Create new category
      const { error } = await supabase.from("categories").insert({
        user_id: user.id,
        name: data.name,
        icon: data.icon,
        color: data.color,
        type: data.type,
        is_default: false,
      });

      if (error) {
        toast.error("Failed to create category");
        throw error;
      }
      toast.success("Category created!");
    }

    await fetchCategories();
    setEditingCategory(null);
  };

  const handleEditCategory = (category: Category) => {
    if (category.is_default) {
      toast.error("Default categories cannot be edited");
      return;
    }
    setEditingCategory(category);
    setCategoryModalOpen(true);
  };

  const handleDeleteCategoryClick = (category: Category) => {
    if (category.is_default) {
      toast.error("Default categories cannot be deleted");
      return;
    }
    setCategoryToDelete(category);
    setDeleteCategoryModalOpen(true);
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", categoryToDelete.id);

    if (error) {
      toast.error("Failed to delete category. It may be in use by expenses.");
    } else {
      toast.success("Category deleted!");
      await fetchCategories();
    }

    setDeleteCategoryModalOpen(false);
    setCategoryToDelete(null);
  };

  const filteredCategories = categories.filter((c) => c.type === categoryTab);
  const userCategories = filteredCategories.filter((c) => !c.is_default);
  const defaultCategories = filteredCategories.filter((c) => c.is_default);

  const handleSaveProfile = async () => {
    if (!user) return;

    setIsSaving(true);
    const supabase = getSupabaseClient();

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: profile.full_name,
      currency: profile.currency,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      toast.error("Failed to update profile");
    } else {
      toast.success("Profile updated successfully!");
    }

    setIsSaving(false);
  };

  const handleChangePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwords.new.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsSaving(true);
    const supabase = getSupabaseClient();

    const { error } = await supabase.auth.updateUser({
      password: passwords.new,
    });

    if (error) {
      toast.error("Failed to change password");
    } else {
      toast.success("Password changed successfully!");
      setPasswordModalOpen(false);
      setPasswords({ current: "", new: "", confirm: "" });
    }

    setIsSaving(false);
  };

  const handleExportData = async () => {
    if (!user) return;

    const supabase = getSupabaseClient();

    // Fetch all user data
    const [{ data: expenses }, { data: budgets }, { data: goals }] =
      await Promise.all([
        supabase.from("expenses").select("*").eq("user_id", user.id),
        supabase.from("budgets").select("*").eq("user_id", user.id),
        supabase.from("goals").select("*").eq("user_id", user.id),
      ]);

    const exportData = {
      exported_at: new Date().toISOString(),
      user_id: user.id,
      expenses: expenses || [],
      budgets: budgets || [],
      goals: goals || [],
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `finance_tracker_export_${new Date().toISOString().split("T")[0]}.json`;
    link.click();

    toast.success("Data exported successfully!");
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    setIsDeleting(true);
    const supabase = getSupabaseClient();

    // Delete user data
    await Promise.all([
      supabase.from("expenses").delete().eq("user_id", user.id),
      supabase.from("budgets").delete().eq("user_id", user.id),
      supabase.from("goals").delete().eq("user_id", user.id),
      supabase.from("profiles").delete().eq("id", user.id),
    ]);

    // Note: Deleting the auth user requires admin privileges
    // In a real app, you'd call a backend endpoint for this
    toast.success(
      "Account data deleted. Please contact support to complete account deletion.",
    );
    setIsDeleting(false);
    setDeleteModalOpen(false);
    signOut();
  };

  if (isLoading) {
    return null;
  }

  return (
    <>
      <PageHeader>
        <h1>Settings</h1>
        <p>Manage your account preferences and settings</p>
      </PageHeader>

      <SettingsGrid>
        <SettingsCard>
          <CardHeader
            title="Profile"
            subtitle="Update your personal information"
          />
          <CardBody>
            <FormGroup>
              <Input
                label="Full Name"
                value={profile.full_name}
                onChange={(e) =>
                  setProfile({ ...profile, full_name: e.target.value })
                }
                placeholder="Your name"
                fullWidth
              />
              <Input
                label="Email"
                value={user?.email || ""}
                disabled
                fullWidth
              />
              <Select
                label="Currency"
                options={CURRENCIES}
                value={profile.currency}
                onChange={(e) =>
                  setProfile({ ...profile, currency: e.target.value })
                }
                fullWidth
              />
              <FormActions>
                <Button onClick={handleSaveProfile} isLoading={isSaving}>
                  Save Changes
                </Button>
              </FormActions>
            </FormGroup>
          </CardBody>
        </SettingsCard>

        <SettingsCard>
          <CardHeader
            title="Preferences"
            subtitle="Customize your experience"
          />
          <CardBody>
            <SettingSection>
              <SettingRow>
                <SettingInfo>
                  {isDark ? <Moon size={20} /> : <Sun size={20} />}
                  <SettingText>
                    <h4>Dark Mode</h4>
                    <p>Switch between light and dark themes</p>
                  </SettingText>
                </SettingInfo>
                <ThemeToggle
                  $isDark={isDark}
                  onClick={toggleTheme}
                  aria-label="Toggle dark mode"
                />
              </SettingRow>
            </SettingSection>
          </CardBody>
        </SettingsCard>

        <SettingsCard>
          <CardHeader
            title="Security"
            subtitle="Manage your account security"
          />
          <CardBody>
            <SettingSection>
              <SettingRow>
                <SettingInfo>
                  <Lock size={20} />
                  <SettingText>
                    <h4>Password</h4>
                    <p>Change your account password</p>
                  </SettingText>
                </SettingInfo>
                <Button
                  variant="outline"
                  onClick={() => setPasswordModalOpen(true)}
                >
                  Change
                </Button>
              </SettingRow>
            </SettingSection>
          </CardBody>
        </SettingsCard>

        <SettingsCard>
          <CardHeader title="Data" subtitle="Export or manage your data" />
          <CardBody>
            <SettingSection>
              <SettingRow>
                <SettingInfo>
                  <Download size={20} />
                  <SettingText>
                    <h4>Export Data</h4>
                    <p>Download all your financial data</p>
                  </SettingText>
                </SettingInfo>
                <Button
                  variant="outline"
                  leftIcon={<Download size={16} />}
                  onClick={handleExportData}
                >
                  Export
                </Button>
              </SettingRow>
            </SettingSection>
          </CardBody>
        </SettingsCard>

        <FullWidthSection ref={categoriesRef}>
          <CategoriesCard>
            <CardHeader
              title="Categories"
              subtitle="Manage your expense and income categories"
              action={
                <Button
                  size="sm"
                  leftIcon={<Plus size={16} />}
                  onClick={() => {
                    setEditingCategory(null);
                    setCategoryModalOpen(true);
                  }}
                >
                  Add Category
                </Button>
              }
            />
            <CardBody>
              <CategoryTabs>
                <CategoryTab
                  $isActive={categoryTab === "expense"}
                  onClick={() => setCategoryTab("expense")}
                >
                  Expenses
                </CategoryTab>
                <CategoryTab
                  $isActive={categoryTab === "income"}
                  onClick={() => setCategoryTab("income")}
                >
                  Income
                </CategoryTab>
              </CategoryTabs>

              {categoriesLoading ? (
                <Loader text="Loading categories..." />
              ) : (
                <>
                  {userCategories.length > 0 && (
                    <>
                      <CategoryMeta style={{ marginBottom: "12px" }}>
                        Your Custom Categories
                      </CategoryMeta>
                      <CategoryList style={{ marginBottom: "24px" }}>
                        {userCategories.map((category) => {
                          const expenseCount =
                            categoryExpenseCounts[category.id] || 0;
                          return (
                            <CategoryItem
                              key={category.id}
                              $color={category.color}
                            >
                              <CategoryItemInfo>
                                <CategoryIcon $color={category.color}>
                                  {category.icon}
                                </CategoryIcon>
                                <CategoryDetails>
                                  <CategoryName>{category.name}</CategoryName>
                                  <CategoryMeta>
                                    {expenseCount === 0
                                      ? "No expenses"
                                      : `${expenseCount} expense${expenseCount !== 1 ? "s" : ""}`}
                                  </CategoryMeta>
                                </CategoryDetails>
                              </CategoryItemInfo>
                              <CategoryActions>
                                <IconButton
                                  onClick={() => handleEditCategory(category)}
                                >
                                  <Edit2 size={16} />
                                </IconButton>
                                <IconButton
                                  $danger
                                  onClick={() =>
                                    handleDeleteCategoryClick(category)
                                  }
                                >
                                  <Trash2 size={16} />
                                </IconButton>
                              </CategoryActions>
                            </CategoryItem>
                          );
                        })}
                        <AddCategoryCard
                          onClick={() => {
                            setEditingCategory(null);
                            setCategoryModalOpen(true);
                          }}
                        >
                          <Plus size={24} />
                          <span>
                            Add{" "}
                            {categoryTab === "expense" ? "Expense" : "Income"}{" "}
                            Category
                          </span>
                        </AddCategoryCard>
                      </CategoryList>
                    </>
                  )}

                  {userCategories.length === 0 && (
                    <EmptyCategoryState>
                      <Tag size={48} />
                      <p>No custom {categoryTab} categories yet</p>
                      <Button
                        leftIcon={<Plus size={16} />}
                        onClick={() => {
                          setEditingCategory(null);
                          setCategoryModalOpen(true);
                        }}
                      >
                        Create Your First Category
                      </Button>
                    </EmptyCategoryState>
                  )}

                  {defaultCategories.length > 0 && (
                    <>
                      <CategoryMeta
                        style={{
                          marginBottom: "12px",
                          marginTop: userCategories.length > 0 ? "0" : "24px",
                        }}
                      >
                        Default Categories
                      </CategoryMeta>
                      <CategoryList>
                        {defaultCategories.map((category) => {
                          const expenseCount =
                            categoryExpenseCounts[category.id] || 0;
                          return (
                            <CategoryItem
                              key={category.id}
                              $color={category.color}
                            >
                              <CategoryItemInfo>
                                <CategoryIcon $color={category.color}>
                                  {category.icon}
                                </CategoryIcon>
                                <CategoryDetails>
                                  <CategoryName>{category.name}</CategoryName>
                                  <CategoryMeta>
                                    Default
                                    {expenseCount > 0
                                      ? ` · ${expenseCount} expense${expenseCount !== 1 ? "s" : ""}`
                                      : ""}
                                  </CategoryMeta>
                                </CategoryDetails>
                              </CategoryItemInfo>
                            </CategoryItem>
                          );
                        })}
                      </CategoryList>
                    </>
                  )}
                </>
              )}
            </CardBody>
          </CategoriesCard>
        </FullWidthSection>

        <DangerZone>
          <CardBody>
            <DangerHeader>
              <Trash2 size={20} />
              <h3>Danger Zone</h3>
            </DangerHeader>
            <DangerText>
              Once you delete your account, there is no going back. All your
              data including expenses, budgets, and goals will be permanently
              deleted.
            </DangerText>
            <Button
              variant="danger"
              leftIcon={<Trash2 size={16} />}
              onClick={() => setDeleteModalOpen(true)}
            >
              Delete Account
            </Button>
          </CardBody>
        </DangerZone>
      </SettingsGrid>

      {/* Password Change Modal */}
      <Modal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        title="Change Password"
      >
        <ModalContent>
          <Input
            label="New Password"
            type="password"
            value={passwords.new}
            onChange={(e) =>
              setPasswords({ ...passwords, new: e.target.value })
            }
            placeholder="Enter new password"
            fullWidth
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={passwords.confirm}
            onChange={(e) =>
              setPasswords({ ...passwords, confirm: e.target.value })
            }
            placeholder="Confirm new password"
            fullWidth
          />
          <ModalActions>
            <Button variant="ghost" onClick={() => setPasswordModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangePassword} isLoading={isSaving}>
              Change Password
            </Button>
          </ModalActions>
        </ModalContent>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Account"
      >
        <ModalContent>
          <DangerText>
            Are you sure you want to delete your account? This action cannot be
            undone and all your data will be permanently lost.
          </DangerText>
          <ModalActions>
            <Button variant="ghost" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteAccount}
              isLoading={isDeleting}
            >
              Delete My Account
            </Button>
          </ModalActions>
        </ModalContent>
      </Modal>

      {/* Category Modal */}
      <CategoryModal
        isOpen={categoryModalOpen}
        onClose={() => {
          setCategoryModalOpen(false);
          setEditingCategory(null);
        }}
        onSave={handleSaveCategory}
        category={editingCategory}
        type={categoryTab}
      />

      {/* Delete Category Modal */}
      <Modal
        isOpen={deleteCategoryModalOpen}
        onClose={() => {
          setDeleteCategoryModalOpen(false);
          setCategoryToDelete(null);
        }}
        title="Delete Category"
        size="sm"
      >
        <ModalContent>
          <DangerText>
            Are you sure you want to delete &ldquo;{categoryToDelete?.name}
            &rdquo;? This action cannot be undone.
            {categoryToDelete &&
              categoryExpenseCounts[categoryToDelete.id] > 0 && (
                <>
                  <br />
                  <br />
                  <strong>Warning:</strong> This category has{" "}
                  {categoryExpenseCounts[categoryToDelete.id]} expense
                  {categoryExpenseCounts[categoryToDelete.id] !== 1
                    ? "s"
                    : ""}{" "}
                  associated with it. You&apos;ll need to reassign these
                  expenses to another category.
                </>
              )}
          </DangerText>
          <ModalActions>
            <Button
              variant="ghost"
              onClick={() => setDeleteCategoryModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteCategory}>
              Delete Category
            </Button>
          </ModalActions>
        </ModalContent>
      </Modal>
    </>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={null}>
      <SettingsContent />
    </Suspense>
  );
}
