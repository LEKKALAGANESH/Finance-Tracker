import { z } from 'zod';

// Auth validations
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// Expense validations
export const expenseSchema = z.object({
  category_id: z.string().min(1, 'Please select a category'),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().min(1, 'Please enter a description').max(200, 'Description too long'),
  date: z.string().min(1, 'Please select a date'),
  payment_method: z.string().min(1, 'Please select a payment method'),
});

// Budget validations
export const budgetSchema = z.object({
  category_id: z.string().nullable(),
  amount: z.number().positive('Amount must be positive'),
  period: z.enum(['weekly', 'monthly', 'yearly']),
  start_date: z.string().min(1, 'Please select a start date'),
  alert_threshold: z.number().min(1).max(100, 'Threshold must be between 1-100'),
});

// Goal validations
export const goalSchema = z.object({
  name: z.string().min(1, 'Please enter a goal name').max(50, 'Name too long'),
  target_amount: z.number().positive('Target amount must be positive'),
  deadline: z.string().min(1, 'Please select a deadline'),
  icon: z.string().min(1, 'Please select an icon'),
  color: z.string().min(1, 'Please select a color'),
});

// Goal contribution validation
export const contributionSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  note: z.string().max(100, 'Note too long').optional(),
});

// Category validations
export const categorySchema = z.object({
  name: z.string().min(1, 'Please enter a category name').max(30, 'Name too long'),
  icon: z.string().min(1, 'Please select an icon'),
  color: z.string().min(1, 'Please select a color'),
  type: z.enum(['expense', 'income']),
});

// Profile validations
export const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name too long'),
  currency: z.string().min(1, 'Please select a currency'),
});

// Chat message validation
export const chatMessageSchema = z.object({
  message: z.string().min(1, 'Please enter a message').max(500, 'Message too long'),
});

// Export types
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ExpenseFormData = z.infer<typeof expenseSchema>;
export type BudgetFormData = z.infer<typeof budgetSchema>;
export type GoalFormData = z.infer<typeof goalSchema>;
export type ContributionFormData = z.infer<typeof contributionSchema>;
export type CategoryFormData = z.infer<typeof categorySchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type ChatMessageFormData = z.infer<typeof chatMessageSchema>;
