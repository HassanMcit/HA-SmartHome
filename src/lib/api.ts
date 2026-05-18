import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ─── Token / User helpers ────────────────────────────────────────────────────
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

export const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

export const removeToken = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const u = localStorage.getItem('user');
  return u ? JSON.parse(u) : null;
};

export const setUser = (user: User): void => {
  localStorage.setItem('user', JSON.stringify(user));
};

// ─── Axios instance ──────────────────────────────────────────────────────────
const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.message ||
      err.message ||
      'حدث خطأ في الاتصال بالخادم';
    return Promise.reject(new Error(message));
  }
);

// ─── Types ───────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: string;
  createdAt: string;
}

export interface TransactionStats {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  categoryBreakdown: Record<string, number>;
}

export interface Budget {
  id: string;
  userId: string;
  category: string;
  amount: number;
  spent: number;
  remaining: number;
  month: number;
  year: number;
}

export interface Saving {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  color: string;
  createdAt: string;
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
}

export interface AIAnalysis {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactionCount: number;
  monthName: string;
  aiAnalysis: string;
  noApiKey?: boolean;
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

// ─── Helpers ─────────────────────────────────────────────────────────────────
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

// ─── Categories ──────────────────────────────────────────────────────────────
export const EXPENSE_CATEGORIES = [
  { value: 'food', label: 'طعام وشراب', icon: '🍔' },
  { value: 'housing', label: 'سكن وإيجار', icon: '🏠' },
  { value: 'transport', label: 'مواصلات', icon: '🚗' },
  { value: 'utilities', label: 'فواتير ومرافق', icon: '💡' },
  { value: 'health', label: 'صحة وطب', icon: '🏥' },
  { value: 'education', label: 'تعليم', icon: '📚' },
  { value: 'entertainment', label: 'ترفيه', icon: '🎬' },
  { value: 'shopping', label: 'تسوق وملابس', icon: '🛍️' },
  { value: 'savings', label: 'مدخرات', icon: '🐷' },
  { value: 'investment', label: 'استثمار', icon: '📈' },
  { value: 'charity', label: 'تبرعات وصدقات', icon: '🤲' },
  { value: 'family', label: 'أسرة وأطفال', icon: '👨‍👩‍👧' },
  { value: 'personal', label: 'مصروف شخصي', icon: '👤' },
  { value: 'subscriptions', label: 'اشتراكات', icon: '📱' },
  { value: 'other', label: 'أخرى', icon: '💸' },
];

export const INCOME_CATEGORIES = [
  { value: 'salary', label: 'راتب', icon: '💼' },
  { value: 'freelance', label: 'عمل حر', icon: '💻' },
  { value: 'investment', label: 'استثمار', icon: '📈' },
  { value: 'rental', label: 'إيجار', icon: '🏘️' },
  { value: 'bonus', label: 'مكافأة', icon: '🎁' },
  { value: 'gift', label: 'هدية', icon: '🎀' },
  { value: 'other', label: 'أخرى', icon: '💰' },
];

export const getCategoryInfo = (
  value: string,
  type: 'income' | 'expense'
): { label: string; icon: string } => {
  const list = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  return list.find((c) => c.value === value) || { label: value, icon: '💰' };
};

// ─── Auth API ────────────────────────────────────────────────────────────────
export const authApi = {
  login: async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    return data as { token: string; user: User };
  },
  me: async () => {
    const { data } = await api.get('/auth/me');
    return data as User;
  },
  registerRequest: async (name: string, email: string, password: string) => {
    const { data } = await api.post('/auth/register-request', { name, email, password });
    return data;
  },
  updateProfile: async (payload: { name?: string; avatar?: string }) => {
    const { data } = await api.put('/auth/profile', payload);
    return data as User;
  },
  changePassword: async (currentPassword: string, newPassword: string) => {
    const { data } = await api.put('/auth/change-password', { currentPassword, newPassword });
    return data;
  },
  forgotPassword: async (email: string) => {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
  },
  resetPassword: async (email: string, code: string, newPassword: string) => {
    const { data } = await api.post('/auth/reset-password', { email, code, newPassword });
    return data;
  },
};

// ─── Transactions API ────────────────────────────────────────────────────────
export const transactionsApi = {
  getAll: async (params?: { limit?: number; userId?: string; month?: number; year?: number }) => {
    const { data } = await api.get('/transactions', { params });
    return data as Transaction[];
  },
  getStats: async (params?: { month?: number; year?: number; userId?: string }) => {
    const { data } = await api.get('/transactions/stats', { params });
    return data as TransactionStats;
  },
  create: async (payload: {
    type: 'income' | 'expense';
    amount: number;
    category: string;
    description?: string;
    date: string;
    targetUserId?: string;
  }) => {
    const { data } = await api.post('/transactions', payload);
    return data as Transaction;
  },
  delete: async (id: string) => {
    const { data } = await api.delete(`/transactions/${id}`);
    return data;
  },
};

// ─── Budgets API ─────────────────────────────────────────────────────────────
export const budgetsApi = {
  getAll: async (userId?: string, month?: number, year?: number) => {
    const { data } = await api.get('/budgets', { params: { userId, month, year } });
    return data as Budget[];
  },
  create: async (payload: { category: string; amount: number; targetUserId?: string }) => {
    const { data } = await api.post('/budgets', payload);
    return data as Budget;
  },
  delete: async (id: string) => {
    const { data } = await api.delete(`/budgets/${id}`);
    return data;
  },
};

// ─── Savings API ─────────────────────────────────────────────────────────────
export const savingsApi = {
  getAll: async () => {
    const { data } = await api.get('/savings');
    return data as Saving[];
  },
  create: async (payload: { name: string; targetAmount: number; color?: string }) => {
    const { data } = await api.post('/savings', payload);
    return data as Saving;
  },
  deposit: async (id: string, amount: number) => {
    const { data } = await api.post(`/savings/${id}/deposit`, { amount });
    return data;
  },
  delete: async (id: string) => {
    const { data } = await api.delete(`/savings/${id}`);
    return data;
  },
};

// ─── Bills API ───────────────────────────────────────────────────────────────
export const billsApi = {
  getAll: async (isPaid?: boolean) => {
    const params = isPaid !== undefined ? { isPaid: String(isPaid) } : {};
    const { data } = await api.get('/bills', { params });
    return data as Bill[];
  },
  create: async (payload: {
    name: string;
    amount: number;
    dueDate: string;
    isRecurring?: boolean;
    category?: string;
  }) => {
    const { data } = await api.post('/bills', payload);
    return data as Bill;
  },
  toggle: async (id: string) => {
    const { data } = await api.put(`/bills/${id}/toggle`);
    return data as Bill;
  },
  update: async (id: string, payload: Partial<{ name: string; amount: number; dueDate: string; isRecurring: boolean; category: string }>) => {
    const { data } = await api.put(`/bills/${id}`, payload);
    return data as Bill;
  },
  delete: async (id: string) => {
    const { data } = await api.delete(`/bills/${id}`);
    return data;
  },
};

// ─── AI API ──────────────────────────────────────────────────────────────────
export const aiApi = {
  getAnalysis: async () => {
    const { data } = await api.get('/ai/analysis');
    return data as AIAnalysis;
  },
};

// ─── Admin API ───────────────────────────────────────────────────────────────
export const adminApi = {
  getRequests: async () => {
    const { data } = await api.get('/admin/requests');
    return data as RegistrationRequest[];
  },
  getStats: async () => {
    const { data } = await api.get('/admin/stats');
    return data as AdminStats;
  },
  getUsers: async () => {
    const { data } = await api.get('/admin/users');
    return data as User[];
  },
  getResetCodes: async () => {
    const { data } = await api.get('/admin/reset-codes');
    return data as any[];
  },
  approveRequest: async (id: string) => {
    const { data } = await api.post(`/admin/requests/${id}/approve`);
    return data;
  },
  rejectRequest: async (id: string) => {
    const { data } = await api.post(`/admin/requests/${id}/reject`);
    return data;
  },
  updateUser: async (id: string, payload: { role?: string }) => {
    const { data } = await api.put(`/admin/users/${id}`, payload);
    return data;
  },
  deleteUser: async (id: string) => {
    const { data } = await api.delete(`/admin/users/${id}`);
    return data;
  },
};
