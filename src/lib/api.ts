const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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

// ─── Core fetch wrapper ──────────────────────────────────────────────────────
async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  let data: any;
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    const error = new Error(data?.message || `HTTP ${res.status}`) as any;
    error.status = res.status;
    throw error;
  }

  return data as T;
}

// ─── Types ───────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: 'bank' | 'cash' | 'wallet';
  iban?: string;
  accountNum?: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
  alias?: string;
  subType?: 'current' | 'deposit';
  depositAmount?: number;
  interestRate?: number;
  interestDay?: number;
  lastInterestPaid?: string;
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
  accountId?: string;
  account?: {
    id: string;
    name: string;
    type: 'bank' | 'cash' | 'wallet';
  };
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

export interface Reminder {
  id: string;
  userId: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  reminderAt?: string;
  emailSent: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
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
  return new Intl.NumberFormat('ar-EG-u-nu-latn', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

// ─── Categories ──────────────────────────────────────────────────────────────
export const EXPENSE_CATEGORIES = [
  { value: 'installments', label: 'اقساط', icon: '⏳' },
  { value: 'allowance', label: 'مصروفي', icon: '👤' },
  { value: 'services', label: 'خدمات', icon: '🛠️' },
  { value: 'debts', label: 'ديون', icon: '💸' },
  { value: 'bank_fees', label: 'مصاريف بنك', icon: '🏦' },
  { value: 'insurance', label: 'تامين', icon: '🛡️' },
  { value: 'haircut', label: 'حلاقة', icon: '💈' },
  { value: 'travel', label: 'سفر', icon: '✈️' },
  { value: 'landline_bill', label: 'فاتورة ارضي', icon: '☎️' },
  { value: 'gas_cylinder', label: 'انبوبة', icon: '🛢️' },
  { value: 'nestle_water', label: 'ماية نسلة', icon: '💧' },
  { value: 'money_pool', label: 'جميعة', icon: '🤝' },
  { value: 'house_wife_allowance', label: 'مصروف البيت و الزوجه', icon: '🏠' },
  { value: 'general_bills', label: 'فواتير عامه', icon: '📄' },
  { value: 'doorman', label: 'بواب العماره', icon: '🔑' },
  { value: 'internet_bill', label: 'فاتورة الانترنت', icon: '🌐' },
  { value: 'apartment_services', label: 'خدمات شقة', icon: '🧹' },
  { value: 'child_expenses', label: 'مصروف طفل', icon: '👶' },
  { value: 'emergency', label: 'طوارئ', icon: '🚨' },
  { value: 'subscriptions', label: 'اشتراكات', icon: '📱' },
  { value: 'phone_recharge', label: 'شحن هاتف', icon: '📲' },
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
  { value: 'outings', label: 'خروجات', icon: '🍿' },
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
  login: (email: string, password: string) =>
    request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  me: () => request<User>('/auth/me'),

  registerRequest: (name: string, email: string, password: string) =>
    request('/auth/register-request', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  updateProfile: (payload: { name?: string; avatar?: string }) =>
    request<User>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  changePassword: (currentPassword: string, newPassword: string) =>
    request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  forgotPassword: (email: string) =>
    request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (email: string, code: string, newPassword: string) =>
    request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, code, newPassword }),
    }),
};

// ─── Transactions API ────────────────────────────────────────────────────────
export const transactionsApi = {
  getAll: (params?: { limit?: number; userId?: string; month?: number; year?: number }) => {
    const q = params ? '?' + new URLSearchParams(
      Object.fromEntries(
        Object.entries(params)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)])
      )
    ) : '';
    return request<Transaction[]>(`/transactions${q}`);
  },

  getStats: (params?: { month?: number; year?: number; userId?: string }) => {
    const q = params ? '?' + new URLSearchParams(
      Object.fromEntries(
        Object.entries(params)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)])
      )
    ) : '';
    return request<TransactionStats>(`/transactions/stats${q}`);
  },

  create: (payload: {
    type: 'income' | 'expense';
    amount: number;
    category: string;
    description?: string;
    date: string;
    targetUserId?: string;
    accountId?: string;
  }) =>
    request<Transaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  update: (
    id: string,
    payload: {
      type?: 'income' | 'expense';
      amount?: number;
      category?: string;
      description?: string;
      date?: string;
      targetUserId?: string;
      accountId?: string;
    }
  ) =>
    request<Transaction>(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  delete: (id: string) =>
    request(`/transactions/${id}`, { method: 'DELETE' }),

  transfer: (payload: {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    description?: string;
    date: string;
  }) =>
    request<{ fromTx: Transaction; toTx: Transaction }>('/transactions/transfer', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

// ─── Budgets API ─────────────────────────────────────────────────────────────
export const budgetsApi = {
  getAll: (userId?: string, month?: number, year?: number) => {
    const params: Record<string, string> = {};
    if (userId) params.userId = userId;
    if (month !== undefined) params.month = String(month);
    if (year !== undefined) params.year = String(year);
    const q = Object.keys(params).length ? '?' + new URLSearchParams(params) : '';
    return request<Budget[]>(`/budgets${q}`);
  },

  create: (payload: { category: string; amount: number; targetUserId?: string }) =>
    request<Budget>('/budgets', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  delete: (id: string) =>
    request(`/budgets/${id}`, { method: 'DELETE' }),
};

// ─── Savings API ─────────────────────────────────────────────────────────────
export const savingsApi = {
  getAll: () => request<Saving[]>('/savings'),

  create: (payload: { name: string; targetAmount: number; color?: string }) =>
    request<Saving>('/savings', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  deposit: (id: string, amount: number) =>
    request(`/savings/${id}/deposit`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    }),

  delete: (id: string) =>
    request(`/savings/${id}`, { method: 'DELETE' }),
};

// ─── Bills API ───────────────────────────────────────────────────────────────
export const billsApi = {
  getAll: (isPaid?: boolean, userId?: string) => {
    const params: Record<string, string> = {};
    if (isPaid !== undefined) params.isPaid = String(isPaid);
    if (userId) params.userId = userId;
    const q = Object.keys(params).length ? '?' + new URLSearchParams(params) : '';
    return request<Bill[]>(`/bills${q}`);
  },

  create: (payload: {
    name: string;
    amount: number;
    dueDate: string;
    isRecurring?: boolean;
    category?: string;
  }) =>
    request<Bill>('/bills', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  toggle: (id: string, accountId?: string) =>
    request<Bill>(`/bills/${id}/toggle`, {
      method: 'PUT',
      body: accountId ? JSON.stringify({ accountId }) : undefined,
    }),

  update: (
    id: string,
    payload: Partial<{
      name: string;
      amount: number;
      dueDate: string;
      isRecurring: boolean;
      category: string;
    }>
  ) =>
    request<Bill>(`/bills/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  delete: (id: string) =>
    request(`/bills/${id}`, { method: 'DELETE' }),
};

// ─── Reminders API ───────────────────────────────────────────────────────────
export const remindersApi = {
  getAll: (isCompleted?: boolean) => {
    const q = isCompleted !== undefined ? `?isCompleted=${isCompleted}` : '';
    return request<Reminder[]>(`/reminders${q}`);
  },

  create: (payload: { title: string; description?: string; reminderAt?: string; priority?: string }) =>
    request<Reminder>('/reminders', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  toggle: (id: string) =>
    request<Reminder>(`/reminders/${id}/toggle`, { method: 'PUT' }),

  update: (id: string, payload: Partial<{ title: string; description: string | null; reminderAt: string | null; priority: string; isCompleted: boolean }>) =>
    request<Reminder>(`/reminders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  delete: (id: string) =>
    request(`/reminders/${id}`, { method: 'DELETE' }),
};

// ─── AI API ──────────────────────────────────────────────────────────────────
export const aiApi = {
  getAnalysis: () => request<AIAnalysis>('/ai/analysis'),
};

// ─── Accounts API ────────────────────────────────────────────────────────────
export const accountsApi = {
  getAll: () => request<Account[]>('/accounts'),
  getById: (id: string) => request<Account>(`/accounts/${id}`),
  create: (payload: {
    name: string;
    type: 'bank' | 'cash' | 'wallet';
    iban?: string;
    accountNum?: string;
    balance?: number;
    alias?: string;
    subType?: 'current' | 'deposit';
    depositAmount?: number;
    interestRate?: number;
    interestDay?: number;
  }) =>
    request<Account>('/accounts', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  onboard: (accounts: Array<{
    name: string;
    type: 'bank' | 'cash' | 'wallet';
    iban?: string;
    accountNum?: string;
    balance?: number;
    alias?: string;
    subType?: 'current' | 'deposit';
    depositAmount?: number;
    interestRate?: number;
    interestDay?: number;
  }>) =>
    request<Account[]>('/accounts/onboard', {
      method: 'POST',
      body: JSON.stringify({ accounts }),
    }),
  update: (
    id: string,
    payload: Partial<{
      name: string;
      iban: string | null;
      accountNum: string | null;
      balance: number;
      alias: string | null;
      subType: 'current' | 'deposit' | null;
      depositAmount: number | null;
      interestRate: number | null;
      interestDay: number | null;
    }>
  ) =>
    request<Account>(`/accounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  delete: (id: string) =>
    request(`/accounts/${id}`, { method: 'DELETE' }),
};

// ─── Admin API ───────────────────────────────────────────────────────────────
export const adminApi = {
  getRequests: () => request<RegistrationRequest[]>('/admin/requests'),

  getStats: () => request<AdminStats>('/admin/stats'),

  getUsers: () => request<User[]>('/admin/users'),

  getResetCodes: () => request<any[]>('/admin/reset-codes'),

  approveRequest: (id: string) =>
    request<{ message: string; emailSent: boolean }>(`/admin/requests/${id}/approve`, { method: 'POST' }),

  rejectRequest: (id: string) =>
    request(`/admin/requests/${id}/reject`, { method: 'POST' }),

  updateUser: (id: string, payload: { role?: string }) =>
    request(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deleteUser: (id: string) =>
    request(`/admin/users/${id}`, { method: 'DELETE' }),

  resendWelcomeEmail: (id: string) =>
    request(`/admin/users/${id}/resend-welcome`, { method: 'POST' }),

  sendEidEmail: () =>
    request<{ message: string; successCount: number; failCount: number; total: number }>(
      '/admin/send-eid-email',
      { method: 'POST' }
    ),

  sendForgotPassword: (email: string) =>
    request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
};
