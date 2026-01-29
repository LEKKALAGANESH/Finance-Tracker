import { ApiResponse, ApiError } from '@/types/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface RequestOptions extends RequestInit {
  token?: string;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      message: 'An unexpected error occurred',
    }));
    throw error;
  }
  return response.json();
}

export async function apiGet<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;

  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...fetchOptions.headers,
    },
    ...fetchOptions,
  });

  return handleResponse<T>(response);
}

export async function apiPost<T, D = unknown>(
  endpoint: string,
  data: D,
  options: RequestOptions = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;

  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...fetchOptions.headers,
    },
    body: JSON.stringify(data),
    ...fetchOptions,
  });

  return handleResponse<T>(response);
}

export async function apiPut<T, D = unknown>(
  endpoint: string,
  data: D,
  options: RequestOptions = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;

  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...fetchOptions.headers,
    },
    body: JSON.stringify(data),
    ...fetchOptions,
  });

  return handleResponse<T>(response);
}

export async function apiDelete<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;

  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...fetchOptions.headers,
    },
    ...fetchOptions,
  });

  return handleResponse<T>(response);
}

// API endpoints
export const api = {
  // Expenses
  expenses: {
    list: (params?: string) => apiGet(`/api/v1/expenses${params ? `?${params}` : ''}`),
    get: (id: string) => apiGet(`/api/v1/expenses/${id}`),
    create: (data: unknown, token: string) => apiPost('/api/v1/expenses', data, { token }),
    update: (id: string, data: unknown, token: string) => apiPut(`/api/v1/expenses/${id}`, data, { token }),
    delete: (id: string, token: string) => apiDelete(`/api/v1/expenses/${id}`, { token }),
  },

  // Budgets
  budgets: {
    list: () => apiGet('/api/v1/budgets'),
    create: (data: unknown, token: string) => apiPost('/api/v1/budgets', data, { token }),
    update: (id: string, data: unknown, token: string) => apiPut(`/api/v1/budgets/${id}`, data, { token }),
    delete: (id: string, token: string) => apiDelete(`/api/v1/budgets/${id}`, { token }),
    status: () => apiGet('/api/v1/budgets/status'),
  },

  // Goals
  goals: {
    list: () => apiGet('/api/v1/goals'),
    create: (data: unknown, token: string) => apiPost('/api/v1/goals', data, { token }),
    update: (id: string, data: unknown, token: string) => apiPut(`/api/v1/goals/${id}`, data, { token }),
    delete: (id: string, token: string) => apiDelete(`/api/v1/goals/${id}`, { token }),
    contribute: (id: string, data: unknown, token: string) => apiPost(`/api/v1/goals/${id}/contribute`, data, { token }),
  },

  // Insights
  insights: {
    summary: (token: string) => apiGet('/api/v1/insights/summary', { token }),
    tips: (token: string) => apiGet('/api/v1/insights/tips', { token }),
    chat: (message: string, token: string) => apiPost('/api/v1/insights/chat', { message }, { token }),
    predictions: (token: string) => apiGet('/api/v1/insights/predictions', { token }),
  },

  // Reports
  reports: {
    monthly: (params: string, token: string) => apiGet(`/api/v1/reports/monthly?${params}`, { token }),
    category: (params: string, token: string) => apiGet(`/api/v1/reports/category?${params}`, { token }),
    export: (params: string, token: string) => apiGet(`/api/v1/reports/export?${params}`, { token }),
  },

  // Categories
  categories: {
    list: () => apiGet('/api/v1/categories'),
    create: (data: unknown, token: string) => apiPost('/api/v1/categories', data, { token }),
    update: (id: string, data: unknown, token: string) => apiPut(`/api/v1/categories/${id}`, data, { token }),
    delete: (id: string, token: string) => apiDelete(`/api/v1/categories/${id}`, { token }),
  },
};
