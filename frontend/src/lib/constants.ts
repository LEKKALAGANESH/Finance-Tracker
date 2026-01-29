// App constants
export const APP_NAME = 'FinanceTracker';
export const APP_DESCRIPTION = 'Track your expenses, manage budgets, and achieve financial goals';

// Currency options
export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
] as const;

// Default categories
export const DEFAULT_CATEGORIES = [
  { name: 'Food & Dining', icon: '🍔', color: '#f97316', type: 'expense' },
  { name: 'Transportation', icon: '🚗', color: '#3b82f6', type: 'expense' },
  { name: 'Shopping', icon: '🛍️', color: '#ec4899', type: 'expense' },
  { name: 'Entertainment', icon: '🎬', color: '#8b5cf6', type: 'expense' },
  { name: 'Bills & Utilities', icon: '📱', color: '#ef4444', type: 'expense' },
  { name: 'Health', icon: '💊', color: '#10b981', type: 'expense' },
  { name: 'Education', icon: '📚', color: '#06b6d4', type: 'expense' },
  { name: 'Groceries', icon: '🛒', color: '#84cc16', type: 'expense' },
  { name: 'Travel', icon: '✈️', color: '#f59e0b', type: 'expense' },
  { name: 'Other', icon: '📦', color: '#6b7280', type: 'expense' },
  { name: 'Salary', icon: '💰', color: '#10b981', type: 'income' },
  { name: 'Freelance', icon: '💼', color: '#3b82f6', type: 'income' },
  { name: 'Investments', icon: '📈', color: '#8b5cf6', type: 'income' },
  { name: 'Other Income', icon: '💵', color: '#6b7280', type: 'income' },
] as const;

// Payment methods
export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash', icon: '💵' },
  { value: 'credit_card', label: 'Credit Card', icon: '💳' },
  { value: 'debit_card', label: 'Debit Card', icon: '💳' },
  { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' },
  { value: 'upi', label: 'UPI', icon: '📱' },
  { value: 'wallet', label: 'Digital Wallet', icon: '📲' },
] as const;

// Budget periods
export const BUDGET_PERIODS = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
] as const;

// Goal icons
export const GOAL_ICONS = [
  '🏠', '🚗', '✈️', '💻', '📱', '🎓', '💍', '🏥',
  '🎯', '💰', '🎁', '🏋️', '📚', '🎨', '🎸', '🌴',
] as const;

// Chart colors
export const CHART_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#f59e0b',
  '#10b981', '#3b82f6', '#06b6d4', '#84cc16', '#ef4444',
] as const;

// Date formats
export const DATE_FORMATS = {
  display: 'MMM d, yyyy',
  input: 'yyyy-MM-dd',
  monthYear: 'MMMM yyyy',
  short: 'MMM d',
} as const;

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;
