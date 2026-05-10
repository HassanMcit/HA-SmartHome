// API utility functions
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('ha_token');
}

export function setToken(token: string): void {
  localStorage.setItem('ha_token', token);
}

export function removeToken(): void {
  localStorage.removeItem('ha_token');
  localStorage.removeItem('ha_user');
}

export function getUser() {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('ha_user');
  return user ? JSON.parse(user) : null;
}

export function setUser(user: object): void {
  localStorage.setItem('ha_user', JSON.stringify(user));
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'حدث خطأ في الطلب');
  }

  return data;
}

// Auth APIs
export const authApi = {
  login: (email: string, password: string) =>
    request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  registerRequest: (name: string, email: string, password: string) =>
    request<{ message: string }>('/auth/register-request', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  me: () => request<User>('/auth/me'),

  updateProfile: (data: { name?: string; avatar?: string }) =>
    request<User>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ message: string }>('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
};

// Transactions APIs
export const transactionsApi = {
  getAll: (params?: { type?: string; category?: string; month?: number; year?: number; limit?: number }) => {
    const query = params ? '?' + new URLSearchParams(
      Object.entries(params)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)])
    ).toString() : '';
    return request<Transaction[]>(`/transactions${query}`);
  },

  getStats: (month?: number, year?: number) => {
    const query = month && year ? `?month=${month}&year=${year}` : '';
    return request<TransactionStats>(`/transactions/stats${query}`);
  },

  create: (data: CreateTransactionData) =>
    request<Transaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<CreateTransactionData>) =>
    request<Transaction>(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<{ message: string }>(`/transactions/${id}`, { method: 'DELETE' }),
};

// Budgets APIs
export const budgetsApi = {
  getAll: (userId?: string) => {
    const query = userId ? `?userId=${userId}` : '';
    return request<Budget[]>(`/budgets${query}`);
  },

  create: (data: CreateBudgetData) =>
    request<Budget>('/budgets', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<{ message: string }>(`/budgets/${id}`, { method: 'DELETE' }),
};

// Savings APIs
export const savingsApi = {
  getAll: () => request<Saving[]>('/savings'),

  create: (data: CreateSavingData) =>
    request<Saving>('/savings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<CreateSavingData>) =>
    request<Saving>(`/savings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deposit: (id: string, amount: number) =>
    request<Saving>(`/savings/${id}/deposit`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    }),

  delete: (id: string) =>
    request<{ message: string }>(`/savings/${id}`, { method: 'DELETE' }),
};

// Bills APIs
export const billsApi = {
  getAll: (isPaid?: boolean) => {
    const query = isPaid !== undefined ? `?isPaid=${isPaid}` : '';
    return request<Bill[]>(`/bills${query}`);
  },

  create: (data: CreateBillData) =>
    request<Bill>('/bills', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  toggle: (id: string) =>
    request<Bill>(`/bills/${id}/toggle`, { method: 'PUT' }),

  update: (id: string, data: Partial<CreateBillData>) =>
    request<Bill>(`/bills/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<{ message: string }>(`/bills/${id}`, { method: 'DELETE' }),
};

// Admin APIs
export const adminApi = {
  getRequests: () => request<RegistrationRequest[]>('/admin/requests'),
  approveRequest: (id: string) =>
    request<{ message: string }>(`/admin/requests/${id}/approve`, { method: 'POST' }),
  rejectRequest: (id: string) =>
    request<{ message: string }>(`/admin/requests/${id}/reject`, { method: 'POST' }),
  getUsers: () => request<User[]>('/admin/users'),
  createUser: (data: { name: string; email: string; password: string; role?: string }) =>
    request<User>('/admin/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id: string, data: { name?: string; role?: string }) =>
    request<User>(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUser: (id: string) =>
    request<{ message: string }>(`/admin/users/${id}`, { method: 'DELETE' }),
  getStats: () => request<AdminStats>('/admin/stats'),
  getResetCodes: () => request<ResetCode[]>('/admin/reset-codes'),
};

// AI APIs
export const aiApi = {
  getAnalysis: (month?: number, year?: number) => {
    const query = month && year ? `?month=${month}&year=${year}` : '';
    return request<AIAnalysis>(`/ai/analysis${query}`);
  },
  getTip: () => request<{ tip: string }>('/ai/tip'),
};

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  avatar?: string;
  createdAt: string;
}

export interface ResetCode {
  id: string;
  name: string;
  email: string;
  code: string;
  expiresAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description?: string;
  date: string;
  createdAt: string;
}

export interface CreateTransactionData {
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description?: string;
  date?: string;
  targetUserId?: string;
}

export interface TransactionStats {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  categoryBreakdown: Record<string, number>;
  dailyData: Record<string, { income: number; expenses: number }>;
  transactionCount: number;
}

export interface Budget {
  id: string;
  userId: string;
  userName?: string;
  category: string;
  amount: number;
  spent: number;
  remaining: number;
}

export interface CreateBudgetData {
  category: string;
  amount: number;
  targetUserId?: string;
}

export interface Saving {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  color: string;
  createdAt: string;
}

export interface CreateSavingData {
  name: string;
  targetAmount: number;
  currentAmount?: number;
  deadline?: string;
  color?: string;
}

export interface Bill {
  id: string;
  userId: string;
  name: string;
  amount: number;
  dueDate: string;
  isPaid: boolean;
  isRecurring: boolean;
  category: string;
  createdAt: string;
}

export interface CreateBillData {
  name: string;
  amount: number;
  dueDate: string;
  isRecurring?: boolean;
  category?: string;
}

export interface RegistrationRequest {
  id: string;
  name: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  pendingRequests: number;
  totalIncome: number;
  totalExpenses: number;
}

export interface AIAnalysis {
  month: number;
  year: number;
  monthName: string;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  categoryBreakdown: Array<{
    category: string;
    categoryAr: string;
    amount: number;
    percentage: string;
  }>;
  transactionCount: number;
  aiAnalysis: string | null;
  noApiKey: boolean;
}

// Category constants
export const EXPENSE_CATEGORIES = [
  { value: 'food', label: 'طعام ومشروبات', icon: '🍽️', color: '#ef4444' },
  { value: 'transport', label: 'مواصلات', icon: '🚗', color: '#f97316' },
  { value: 'housing', label: 'سكن وإيجار', icon: '🏠', color: '#8b5cf6' },
  { value: 'health', label: 'صحة وطب', icon: '🏥', color: '#06b6d4' },
  { value: 'education', label: 'تعليم', icon: '📚', color: '#3b82f6' },
  { value: 'entertainment', label: 'ترفيه', icon: '🎬', color: '#ec4899' },
  { value: 'clothing', label: 'ملابس', icon: '👕', color: '#f59e0b' },
  { value: 'utilities', label: 'فواتير ومرافق', icon: '⚡', color: '#eab308' },
  { value: 'shopping', label: 'تسوق', icon: '🛍️', color: '#14b8a6' },
  { value: 'other', label: 'أخرى', icon: '📌', color: '#6b7280' },
];

export const INCOME_CATEGORIES = [
  { value: 'salary', label: 'راتب', icon: '💰', color: '#10b981' },
  { value: 'freelance', label: 'عمل حر', icon: '💻', color: '#3b82f6' },
  { value: 'investment', label: 'استثمارات', icon: '📈', color: '#8b5cf6' },
  { value: 'gift', label: 'هدايا', icon: '🎁', color: '#ec4899' },
  { value: 'other', label: 'أخرى', icon: '📌', color: '#6b7280' },
];

export const getCategoryInfo = (categoryValue: string, type: 'income' | 'expense' = 'expense') => {
  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  return categories.find(c => c.value === categoryValue) || { value: categoryValue, label: categoryValue, icon: '📌', color: '#6b7280' };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateStr: string): string => {
  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateStr));
};

export const MONTHS_AR = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];
