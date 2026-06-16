'use client';

import { useEffect, useState } from 'react';
import {
  transactionsApi,
  billsApi,
  accountsApi,
  Account,
  Transaction,
  Bill,
  formatCurrency,
  getCategoryInfo
} from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  ArrowDownRight,
  ArrowUpRight,
  Wallet,
  Activity,
  CreditCard,
  Loader2,
  AlertCircle,
  ChevronLeft,
  Copy,
  Eye,
  EyeOff,
  Plus,
  X,
  Check,
  Calendar,
  Clock,
  Trash2,
  Pencil
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import WeatherPrayerWidget from '@/components/WeatherPrayerWidget';
import BankLogo, { BANK_WALLET_CATALOG, getTranslatedBankName } from '@/components/BankLogo';
import BankSelector from '@/components/BankSelector';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';



const EGYPTIAN_DENOMINATIONS = [
  { value: '200', ar: '٢٠٠ ج.م', en: '200 EGP' },
  { value: '100', ar: '١٠٠ ج.م', en: '100 EGP' },
  { value: '50', ar: '٥٠ ج.م', en: '50 EGP' },
  { value: '20', ar: '٢٠ ج.م', en: '20 EGP' },
  { value: '10', ar: '١٠ ج.م', en: '10 EGP' },
  { value: '5', ar: '٥ ج.م', en: '5 EGP' },
  { value: '1', ar: '١ ج.م', en: '1 EGP' },
  { value: '0.5', ar: '٠.٥ ج.م', en: '0.5 EGP' },
];



export default function DashboardPage() {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const router = useRouter();
  
  // Dashboard states
  const [stats, setStats] = useState<any>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [unpaidBills, setUnpaidBills] = useState<Bill[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  // Masking & Visibility state for account numbers
  const [visibleAccounts, setVisibleAccounts] = useState<Record<string, boolean>>({});

  // Onboarding dialog states
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardAccounts, setOnboardAccounts] = useState<any[]>([]);
  const [onboardBankName, setOnboardBankName] = useState('');
  const [onboardIban, setOnboardIban] = useState('');
  const [onboardAccountNum, setOnboardAccountNum] = useState('');
  const [onboardBalance, setOnboardBalance] = useState('');
  const [onboardCashBalance, setOnboardCashBalance] = useState('');
  const [onboardSubmitting, setOnboardSubmitting] = useState(false);

  // Add Account dialog states (for existing users)
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [newAccType, setNewAccType] = useState<'bank' | 'cash' | 'wallet'>('bank');
  const [newAccName, setNewAccName] = useState('');
  const [newAccIban, setNewAccIban] = useState('');
  const [newAccNo, setNewAccNo] = useState('');
  const [newAccBalance, setNewAccBalance] = useState('');
  const [newAccAlias, setNewAccAlias] = useState('');
  const [newAccSubType, setNewAccSubType] = useState<'current' | 'deposit'>('current');
  const [newAccDepositAmount, setNewAccDepositAmount] = useState('');
  const [newAccInterestRate, setNewAccInterestRate] = useState('');
  const [newAccInterestDay, setNewAccInterestDay] = useState('');
  const [newAccDenominations, setNewAccDenominations] = useState<Record<string, number>>({});

  const handleNewDenominationChange = (denom: string, val: string) => {
    const count = Math.max(0, parseInt(val) || 0);
    const newDenoms = {
      ...newAccDenominations,
      [denom]: count
    };
    setNewAccDenominations(newDenoms);
    
    // Calculate total balance from denominations
    const total = Object.entries(newDenoms).reduce((sum, [d, c]) => {
      return sum + parseFloat(d) * c;
    }, 0);
    setNewAccBalance(total.toFixed(2));
  };
  const [addAccountSubmitting, setAddAccountSubmitting] = useState(false);

  const isWalletName = (name: string) => {
    const n = (name || '').toLowerCase();
    return n.includes('كاش') || n.includes('cash') || n.includes('wepay') || n.includes('وي باي') || n.includes('orange') || n.includes('vodafone') || n.includes('etisalat') || n.includes('اتصالات');
  };

  // Detail Modal states
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [accountTransactions, setAccountTransactions] = useState<Transaction[]>([]);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Delete Account custom dialog state
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; accountId: string; accountName: string }>({
    isOpen: false,
    accountId: '',
    accountName: '',
  });

  // Edit Account dialog state
  const [editDialog, setEditDialog] = useState<{ isOpen: boolean; account: Account | null }>({
    isOpen: false,
    account: null,
  });
  const [editName, setEditName] = useState('');
  const [editAlias, setEditAlias] = useState('');
  const [editAccountNum, setEditAccountNum] = useState('');
  const [editIban, setEditIban] = useState('');
  const [editBalance, setEditBalance] = useState('');
  const [editSubType, setEditSubType] = useState<'current' | 'deposit'>('current');
  const [editDepositAmount, setEditDepositAmount] = useState('');
  const [editInterestRate, setEditInterestRate] = useState('');
  const [editInterestDay, setEditInterestDay] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editDenominations, setEditDenominations] = useState<Record<string, number>>({});

  const handleDenominationChange = (denom: string, val: string) => {
    const count = Math.max(0, parseInt(val) || 0);
    const newDenoms = {
      ...editDenominations,
      [denom]: count
    };
    setEditDenominations(newDenoms);
    
    // Calculate total balance from denominations
    const total = Object.entries(newDenoms).reduce((sum, [d, c]) => {
      return sum + parseFloat(d) * c;
    }, 0);
    setEditBalance(total.toFixed(2));
  };

  const fetchData = async () => {
    if (!user) return;
    try {
      const now = new Date();
      const m = now.getMonth() + 1;
      const y = now.getFullYear();
      
      const [statsData, txData, billsData, accountsData] = await Promise.all([
        transactionsApi.getStats({ month: m, year: y }),
        transactionsApi.getAll({ limit: 8 }),
        billsApi.getAll(false, user.id),
        accountsApi.getAll()
      ]);

      setStats(statsData);
      setRecentTransactions(txData);
      setUnpaidBills(billsData);
      
      const sortedAccs = (accountsData || []).sort((a: any, b: any) => {
        const typeOrder = { cash: 1, bank: 2, wallet: 3 };
        const orderA = typeOrder[a.type as keyof typeof typeOrder] || 99;
        const orderB = typeOrder[b.type as keyof typeof typeOrder] || 99;
        if (orderA !== orderB) return orderA - orderB;
        return (a.name || '').localeCompare(b.name || '', 'ar');
      });
      setAccounts(sortedAccs);

      
      // Auto-trigger onboarding if user has NO accounts registered
      if (!accountsData || accountsData.length === 0) {
        setShowOnboarding(true);
      }
    } catch (err) {
      console.error(err);
      toast.error(t('data_load_error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Masking helpers
  const maskNumber = (num: string | undefined, isIban = false) => {
    if (!num) return '—';
    const cleanNum = num.replace(/\s+/g, '');
    if (cleanNum.length <= 4) return '****';
    const last4 = cleanNum.slice(-4);
    if (isIban) {
      return `EG** **** **** **** ${last4}`;
    }
    return `**** **** ${last4}`;
  };

  const toggleVisibility = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent card click / detail modal trigger
    setVisibleAccounts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (text: string | undefined, label: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent card click
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(`تم نسخ ${label} إلى الحافظة!`);
  };

  // Add account during onboarding list
  const addAccountToOnboardList = () => {
    if (!onboardBankName) {
      toast.error(lang === 'ar' ? 'يرجى تحديد اسم الحساب المالي' : 'Please specify account name');
      return;
    }
    
    // Check if duplicate bank
    if (onboardAccounts.some(acc => acc.name === onboardBankName)) {
      toast.error(lang === 'ar' ? 'لقد قمت بإضافة هذا الحساب بالفعل' : 'You have already added this account');
      return;
    }

    const isWallet = isWalletName(onboardBankName);
    const type = isWallet ? 'wallet' : 'bank';

    const newAcc = {
      name: onboardBankName,
      type,
      iban: type === 'bank' ? (onboardIban || null) : null,
      accountNum: onboardAccountNum || null,
      balance: parseFloat(onboardBalance) || 0
    };

    setOnboardAccounts([...onboardAccounts, newAcc]);
    setOnboardBankName('');
    setOnboardIban('');
    setOnboardAccountNum('');
    setOnboardBalance('');
    toast.success(lang === 'ar' ? 'تمت إضافة الحساب للقائمة. يمكنك إضافة المزيد أو الحفظ.' : 'Added to the list. You can add more or save.');
  };

  const removeAccountFromOnboardList = (index: number) => {
    setOnboardAccounts(onboardAccounts.filter((_, i) => i !== index));
  };

  // Submit onboarding
  const handleOnboardingSubmit = async () => {
    setOnboardSubmitting(true);
    try {
      const finalAccounts = [...onboardAccounts];
      // Add cash if user entered balance
      if (onboardCashBalance && parseFloat(onboardCashBalance) >= 0) {
        finalAccounts.push({
          name: 'كاش',
          type: 'cash',
          balance: parseFloat(onboardCashBalance)
        });
      }
      
      await accountsApi.onboard(finalAccounts);
      toast.success('تم تهيئة حساباتك بنجاح! 🎉');
      setShowOnboarding(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ أثناء التهيئة');
    } finally {
      setOnboardSubmitting(false);
    }
  };

  // Skip onboarding -> creates default cash 0
  const handleOnboardingSkip = async () => {
    setOnboardSubmitting(true);
    try {
      await accountsApi.onboard([]); // will auto create Cash 0
      toast.success('تم بدء استخدام التطبيق بحساب الكاش الافتراضي 💵');
      setShowOnboarding(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ أثناء التهيئة');
    } finally {
      setOnboardSubmitting(false);
    }
  };

  // Submit single Add Account
  const handleAddAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newAccType !== 'cash' && !newAccName) {
      toast.error(newAccType === 'wallet' ? (lang === 'ar' ? 'يرجى تحديد اسم المحفظة الإلكترونية' : 'Please select wallet name') : (lang === 'ar' ? 'يرجى تحديد اسم البنك' : 'Please select bank name'));
      return;
    }

    const name = newAccType === 'cash' ? 'كاش' : newAccName;

    if (newAccType === 'cash') {
      const totalCount = Object.values(newAccDenominations).reduce((sum, val) => sum + (val || 0), 0);
      const balanceVal = parseFloat(newAccBalance) || 0;
      if (balanceVal > 0 && totalCount === 0) {
        toast.error(lang === 'ar' ? '⚠️ يرجى إدخال فئات العملات وتوزيع الأعداد لرصيد الكاش أولاً' : '⚠️ Please specify the cash denominations counts for the initial balance');
        return;
      }
    }

    setAddAccountSubmitting(true);
    try {
      const payload: any = {
        name,
        type: newAccType,
        balance: parseFloat(newAccBalance) || 0,
        denominations: newAccType === 'cash' ? newAccDenominations : null,
      };

      if (newAccType === 'bank') {
        payload.accountNum = newAccNo;
        payload.iban = newAccIban;
        payload.alias = newAccAlias || undefined;
        payload.subType = newAccSubType;
        if (newAccSubType === 'deposit') {
          payload.depositAmount = parseFloat(newAccDepositAmount) || undefined;
          payload.interestRate = parseFloat(newAccInterestRate) || undefined;
          payload.interestDay = parseInt(newAccInterestDay) || undefined;
        }
      } else if (newAccType === 'wallet') {
        payload.accountNum = newAccNo;
        payload.alias = newAccAlias || undefined;
      }

      await accountsApi.create(payload);
      toast.success(lang === 'ar' ? 'تم إضافة الحساب بنجاح! 💳' : 'Account added successfully! 💳');
      setShowAddAccount(false);
      setNewAccName('');
      setNewAccIban('');
      setNewAccNo('');
      setNewAccBalance('');
      setNewAccAlias('');
      setNewAccSubType('current');
      setNewAccDepositAmount('');
      setNewAccInterestRate('');
      setNewAccInterestDay('');
      setNewAccDenominations({});
      fetchData();
    } catch (err: any) {
      toast.error(err.message || (lang === 'ar' ? 'حدث خطأ أثناء إضافة الحساب' : 'Error adding account'));
    } finally {
      setAddAccountSubmitting(false);
    }
  };

  // Open Detail View of transactions for specific account
  const handleOpenAccountDetails = async (account: Account) => {
    try {
      setSelectedAccount(account);
      // Fetch all transactions for this user, then filter locally
      const allTx = await transactionsApi.getAll();
      const filtered = allTx.filter(t => t.accountId === account.id);
      setAccountTransactions(filtered);
      setDetailModalOpen(true);
    } catch {
      toast.error('حدث خطأ أثناء تحميل تفاصيل الحساب');
    }
  };

  const handleDeleteAccount = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteDialog({ isOpen: true, accountId: id, accountName: name });
  };

  const confirmDeleteAccount = async () => {
    if (!deleteDialog.accountId) return;
    try {
      await accountsApi.delete(deleteDialog.accountId);
      toast.success(lang === 'ar' ? 'تم حذف الحساب بنجاح' : 'Account deleted successfully');
      setDeleteDialog({ isOpen: false, accountId: '', accountName: '' });
      fetchData();
    } catch (err: any) {
      toast.error(err.message || (lang === 'ar' ? 'حدث خطأ أثناء حذف الحساب' : 'Error deleting account'));
    }
  };

  const handleOpenEditAccount = (acc: Account, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditDialog({ isOpen: true, account: acc });
    setEditName(acc.name);
    setEditAlias(acc.alias || '');
    setEditAccountNum(acc.accountNum || '');
    setEditIban(acc.iban || '');
    setEditBalance(String(acc.balance));
    setEditSubType((acc.subType as 'current' | 'deposit') || 'current');
    setEditDepositAmount(acc.depositAmount != null ? String(acc.depositAmount) : '');
    setEditInterestRate(acc.interestRate != null ? String(acc.interestRate) : '');
    setEditInterestDay(acc.interestDay != null ? String(acc.interestDay) : '');
    setEditDenominations((acc.denominations as Record<string, number>) || {});
  };

  const handleEditAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const acc = editDialog.account;
    if (!acc) return;
    if (acc.type === 'cash') {
      const totalCount = Object.values(editDenominations).reduce((sum, val) => sum + (val || 0), 0);
      const balanceVal = parseFloat(editBalance) || 0;
      if (balanceVal > 0 && totalCount === 0) {
        toast.error(lang === 'ar' ? '⚠️ يرجى إدخال فئات العملات وتوزيع الأعداد لرصيد الكاش أولاً' : '⚠️ Please specify the cash denominations counts for the balance');
        return;
      }
    }

    setEditSubmitting(true);
    try {
      const payload: any = {
        name: acc.type === 'cash' ? 'كاش' : editName,
        balance: parseFloat(editBalance) || 0,
        alias: editAlias || null,
      };
      if (acc.type === 'bank') {
        payload.accountNum = editAccountNum || null;
        payload.iban = editIban || null;
        payload.subType = editSubType;
        if (editSubType === 'deposit') {
          payload.depositAmount = parseFloat(editDepositAmount) || null;
          payload.interestRate = parseFloat(editInterestRate) || null;
          payload.interestDay = parseInt(editInterestDay) || null;
        } else {
          payload.depositAmount = null;
          payload.interestRate = null;
          payload.interestDay = null;
        }
      } else if (acc.type === 'cash') {
        payload.denominations = editDenominations;
      }
      await accountsApi.update(acc.id, payload);
      toast.success(lang === 'ar' ? 'تم تعديل الحساب بنجاح! ✏️' : 'Account updated successfully! ✏️');
      setEditDialog({ isOpen: false, account: null });
      fetchData();
    } catch (err: any) {
      toast.error(err.message || (lang === 'ar' ? 'حدث خطأ أثناء تعديل الحساب' : 'Error updating account'));
    } finally {
      setEditSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  // Calculate detailed stats by selected bank/cash inside modal
  const getAccountStats = () => {
    if (!selectedAccount) return { income: 0, expense: 0 };
    let income = 0;
    let expense = 0;
    accountTransactions.forEach(t => {
      if (t.type === 'income') income += t.amount;
      else expense += t.amount;
    });
    return { income, expense };
  };

  const accountStats = getAccountStats();

  return (
    <div className="flex flex-col gap-8 pb-8 animate-fade-in">
      <WeatherPrayerWidget />

      {/* Unpaid Bills Alert */}
      {unpaidBills.length > 0 && (
        <div className="relative group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-600 opacity-90 group-hover:opacity-100 transition-opacity rounded-3xl" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
          <div className="relative p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-white">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center animate-pulse">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="text-right sm:text-left rtl:text-right">
                <h4 className="text-lg font-black">{t('bills_alert_title')}</h4>
                <p className="text-sm font-medium opacity-90">
                  {t('bills_alert_desc_1')}{' '}
                  <span className="underline decoration-2 underline-offset-4">{unpaidBills.length}</span>{' '}
                  {t('bills_alert_desc_2')} {formatCurrency(unpaidBills.reduce((acc, b) => acc + b.amount, 0))}
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/bills"
              className="px-6 py-3 bg-white text-orange-600 font-bold rounded-2xl shadow-xl hover:bg-orange-50 transition-all flex items-center gap-2 group/btn"
            >
              <span>{t('bills_pay_now')}</span>
              <ChevronLeft className="w-4 h-4 group-hover/btn:-translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-1">{t('dashboard_title')}</h2>
          <p className="text-slate-400 text-sm sm:text-base font-medium">{t('dashboard_subtitle')}</p>
        </div>
      </div>

      {/* Stats Cards - Overall balance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="glass-card p-6 relative overflow-hidden group hover:border-indigo-500/30 transition-all">
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all" />
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('total_balance')}</p>
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/5">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-white tracking-tight">{formatCurrency(stats?.balance || 0)}</p>
        </div>

        <div className="glass-card p-6 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('income_this_month')}</p>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/5">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-500 tracking-tight">{formatCurrency(stats?.totalIncome || 0)}</p>
        </div>

        <div className="glass-card p-6 relative overflow-hidden group hover:border-red-500/30 transition-all sm:col-span-2 lg:col-span-1">
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-all" />
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('expenses_this_month')}</p>
            <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-400 shadow-lg shadow-red-500/5">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-red-500 tracking-tight">{formatCurrency(stats?.totalExpenses || 0)}</p>
        </div>
      </div>

      {/* --- Accounts and Balances Section --- */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-400" />
            {lang === 'ar' ? 'حساباتي المالية وأرصدة البنوك' : 'My Financial Accounts & Bank Balances'}
          </h3>
          <Button
            onClick={() => setShowAddAccount(true)}
            className="bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-xl px-4 py-2 text-xs font-bold transition-all border border-indigo-500/10 flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            {lang === 'ar' ? 'إضافة حساب' : 'Add Account'}
          </Button>
        </div>

        {accounts.length === 0 ? (
          <div className="glass-card p-8 flex flex-col items-center justify-center text-slate-500 text-sm">
            {lang === 'ar' ? 'لا توجد حسابات مضافة. اضغط على "إضافة حساب" للبدء.' : 'No accounts added. Click "Add Account" to start.'}
          </div>
        ) : (
          <div className="divide-y divide-white/10 border border-white/5 rounded-2xl overflow-hidden bg-[#161630]/30 shadow-2xl">
            {accounts.map(acc => {
              const isVisible = visibleAccounts[acc.id] || false;
              const isBank = acc.type === 'bank';
              const isWallet = acc.type === 'wallet';
              const translatedName = getTranslatedBankName(acc.name, lang);
              const typeLabel = isBank 
                ? (lang === 'ar' ? 'حساب بنكي' : 'Bank Account') 
                : isWallet 
                ? (lang === 'ar' ? 'محفظة إلكترونية' : 'Mobile Wallet') 
                : (lang === 'ar' ? 'نقد كاش' : 'Cash');
              
              return (
                <div
                  key={acc.id}
                  onClick={() => router.push(`/dashboard/accounts/${acc.id}`)}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors cursor-pointer select-none active:bg-white/[0.04] bg-transparent"
                >
                  <div className="flex items-center gap-4">
                    <BankLogo name={acc.name} size="md" />
                    <div className="text-right">
                      <h4 className="text-sm font-black text-white group-hover:text-indigo-400 transition-colors break-words whitespace-normal leading-snug">
                        {translatedName}
                        {acc.alias && (
                          <span className={cn(
                            "text-[9px] font-bold px-2 py-0.5 rounded-md mr-1.5 inline-block",
                            isWallet ? "bg-amber-500/20 text-amber-300" : "bg-indigo-500/25 text-indigo-300"
                          )}>
                            {acc.alias}
                          </span>
                        )}
                        {acc.subType === 'deposit' && (
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-md mr-1.5 inline-block">
                            {lang === 'ar' ? 'وديعة' : 'Deposit'}
                          </span>
                        )}
                      </h4>
                      <span className="text-[9px] font-bold text-slate-500">{typeLabel}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 text-xs text-slate-400 min-w-[200px] sm:min-w-[250px]">
                    {isBank && (acc.accountNum || acc.iban) ? (
                      <>
                        {acc.accountNum && (
                          <div className="flex items-center justify-between gap-2 group/action" dir="rtl">
                            <span className="text-[9px] font-semibold text-slate-500 min-w-[70px] text-right shrink-0">
                              {lang === 'ar' ? 'رقم الحساب:' : 'Account No:'}
                            </span>
                            <div className="flex items-center gap-1.5" dir="ltr">
                              <button
                                onClick={(e) => handleCopy(acc.accountNum, 'رقم الحساب', e)}
                                className="p-1 rounded text-slate-500 hover:text-white transition-colors"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => toggleVisibility(acc.id, e)}
                                className="p-1 rounded text-slate-500 hover:text-white transition-colors"
                              >
                                {isVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                              </button>
                              <span className="font-mono tracking-wider text-[10px] text-slate-300">
                                {isVisible ? acc.accountNum : maskNumber(acc.accountNum, false)}
                              </span>
                            </div>
                          </div>
                        )}
                        {acc.iban && (
                          <div className="flex items-center justify-between gap-2 group/action" dir="rtl">
                            <span className="text-[9px] font-semibold text-slate-500 min-w-[70px] text-right shrink-0">
                              IBAN:
                            </span>
                            <div className="flex items-center gap-1.5" dir="ltr">
                              <button
                                onClick={(e) => handleCopy(acc.iban, 'IBAN', e)}
                                className="p-1 rounded text-slate-500 hover:text-white transition-colors"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                              <span className="font-mono tracking-wider text-[9px] text-slate-300">
                                {isVisible ? acc.iban : maskNumber(acc.iban, true)}
                              </span>
                            </div>
                          </div>
                        )}
                      </>
                    ) : isWallet && acc.accountNum ? (
                      <div className="flex items-center justify-between gap-2 group/action" dir="rtl">
                        <span className="text-[9px] font-semibold text-slate-500 min-w-[70px] text-right shrink-0">
                          {lang === 'ar' ? 'رقم الهاتف:' : 'Phone No:'}
                        </span>
                        <div className="flex items-center gap-1.5" dir="ltr">
                          <button
                            onClick={(e) => handleCopy(acc.accountNum, 'رقم الهاتف', e)}
                            className="p-1 rounded text-slate-500 hover:text-white transition-colors"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => toggleVisibility(acc.id, e)}
                            className="p-1 rounded text-slate-500 hover:text-white transition-colors"
                          >
                            {isVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                          <span className="font-mono tracking-wider text-[10px] text-slate-300">
                            {isVisible ? acc.accountNum : maskNumber(acc.accountNum, false)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-end text-[9px] text-slate-500">
                        <span>{lang === 'ar' ? 'نقدية سائلة ومشتريات يدوية' : 'Liquid cash & manual purchases'}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0" dir="ltr">
                    <button
                      onClick={(e) => handleOpenEditAccount(acc, e)}
                      className="p-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-600 text-indigo-400 hover:text-white transition-all active:scale-90"
                      title={lang === 'ar' ? 'تعديل الحساب' : 'Edit Account'}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteAccount(acc.id, translatedName, e)}
                      className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white transition-all active:scale-90"
                      title={lang === 'ar' ? 'حذف الحساب' : 'Delete Account'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="text-right sm:text-left" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                      <span className="text-[9px] font-bold text-slate-500 block">{lang === 'ar' ? 'الرصيد المتوفر' : 'Available Balance'}</span>
                      <span className="text-xl font-black text-white tabular-nums">{formatCurrency(acc.balance)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Panels - Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Transactions */}
        <div className="glass-card overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-white/5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Activity className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-white">{t('recent_transactions')}</h3>
          </div>
          <div className="p-6">
            {recentTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-2">
                <p className="text-sm font-medium">{t('no_recent_transactions')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentTransactions.map(tx => {
                  const cat = getCategoryInfo(tx.category, tx.type, lang);
                  return (
                    <div
                      key={tx.id}
                      className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group gap-4"
                    >
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div
                          className={cn(
                            'w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 shrink-0',
                            tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                          )}
                        >
                          {tx.type === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                        </div>
                        <div className="min-w-0 flex-1 text-right">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm sm:text-base font-bold text-slate-200 mb-0.5 truncate">
                              {tx.description || cat.label}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5 text-xs text-slate-500 font-medium">
                            <span className="shrink-0">{new Date(tx.date).toLocaleDateString('ar-EG-u-nu-latn', { day: 'numeric', month: 'short' })}</span>
                            {tx.account && (
                              <span className="flex items-center gap-1 bg-white/5 border border-white/5 px-2 py-0.5 rounded-full text-slate-400 font-semibold text-[10px] shrink-0">
                                <BankLogo name={tx.account.name} size="sm" className="w-3.5 h-3.5 rounded border-0" />
                                {getTranslatedBankName(tx.account.name, lang)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <p
                        className={cn(
                          'font-black text-sm sm:text-base tabular-nums shrink-0',
                          tx.type === 'income' ? 'text-emerald-500' : 'text-red-500'
                        )}
                      >
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="glass-card overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-white/5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400">
              <CreditCard className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-white">{t('expense_breakdown')}</h3>
          </div>
          <div className="p-6">
            {Object.keys(stats?.categoryBreakdown || {}).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-2">
                <p className="text-sm font-medium">{t('no_expense_data')}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(stats?.categoryBreakdown || {})
                  .sort(([, a]: any, [, b]: any) => b - a)
                  .slice(0, 6)
                  .map(([category, amount]: any) => {
                    const total = stats?.totalExpenses || 1;
                    const pct = Math.round((amount / total) * 100);
                    return (
                      <div key={category} className="group">
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">
                            {getCategoryInfo(category, 'expense', lang).label}
                          </span>
                          <span className="text-sm font-black text-white tabular-nums">{formatCurrency(amount)}</span>
                        </div>
                        <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 mt-1 text-left">{pct}% {t('of_total')}</p>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- Onboarding Modal Dialog --- */}
      <Dialog open={showOnboarding} onOpenChange={() => {}}>
        <DialogContent className="rounded-[24px] sm:rounded-[32px] p-5 sm:p-8 outline-none max-w-[500px] max-h-[82dvh] overflow-y-auto custom-scrollbar" style={{ background: 'var(--card)', color: 'var(--card-foreground)', borderColor: 'var(--border)' }} dir="rtl">
          <DialogHeader className="text-right">
            <DialogTitle className="text-2xl font-black mb-2 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
              {lang === 'ar' ? '💳 تهيئة حساباتك المالية' : '💳 Set Up Financial Accounts'}
            </DialogTitle>
            <p className="text-xs font-semibold leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
              {lang === 'ar' 
                ? 'أهلاً بك في مدبّر! لنقم بإضافة البنوك أو المحافظ الإلكترونية التي تستخدمها ورصيدك الحالي لتسهيل تتبع معاملاتك.' 
                : 'Welcome to Mudabber! Let\'s add the banks or mobile wallets you use and their balances to easily track transactions.'}
            </p>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Cash setup (mandatory placeholder or simple initial cash input) */}
            <div className="space-y-2 text-right">
              <Label className="text-xs font-bold text-slate-400">
                {lang === 'ar' ? '💵 رصيد الكاش الحالي (إن وجد)' : '💵 Current Cash Balance (If any)'}
              </Label>
              <Input
                type="number"
                placeholder={lang === 'ar' ? 'أدخل المبلغ النقدي المتوفر معك الآن' : 'Enter the cash amount you have now'}
                value={onboardCashBalance}
                onChange={e => setOnboardCashBalance(e.target.value)}
                className="h-12 text-center rounded-xl focus:border-indigo-500 focus:ring-indigo-500/20"
                style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              />
            </div>

            <div className="border-t border-white/5 my-4 pt-4" />

            {/* Bank account setup */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-indigo-400">
                {lang === 'ar' ? '🏦 إضافة حساب بنكي أو محفظة جديدة' : '🏦 Add New Bank or Mobile Wallet'}
              </h4>
              
              <div className="space-y-2 text-right">
                <Label className="text-xs font-bold text-slate-400">
                  {lang === 'ar' ? 'اختر البنك أو المحفظة الإلكترونية' : 'Select Bank or Mobile Wallet'}
                </Label>
                <BankSelector
                  selectedName={onboardBankName}
                  onSelect={setOnboardBankName}
                  type="all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 text-right">
                  <Label className="text-xs font-bold text-slate-400">
                    {isWalletName(onboardBankName) 
                      ? (lang === 'ar' ? 'رقم الهاتف للمحفظة' : 'Wallet Phone Number') 
                      : (lang === 'ar' ? 'رقم الحساب المحلي' : 'Local Account Number')}
                  </Label>
                  <Input
                    placeholder={isWalletName(onboardBankName) ? '01xxxxxxxxx' : (lang === 'ar' ? 'مثال: 123456' : 'Example: 123456')}
                    value={onboardAccountNum}
                    onChange={e => setOnboardAccountNum(e.target.value)}
                    className="h-11"
                    style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  />
                </div>
                <div className="space-y-2 text-right">
                  <Label className="text-xs font-bold text-slate-400">
                    {lang === 'ar' ? 'الرصيد الحالي' : 'Current Balance'}
                  </Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={onboardBalance}
                    onChange={e => setOnboardBalance(e.target.value)}
                    className="h-11 text-center"
                    style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  />
                </div>
              </div>

              {!isWalletName(onboardBankName) && (
                <div className="space-y-2 text-right">
                  <Label className="text-xs font-bold text-slate-400">
                    {lang === 'ar' ? 'رقم الحساب الدولي (IBAN)' : 'International Account Number (IBAN)'}
                  </Label>
                  <Input
                    placeholder="EG00 0000 0000 0000 0000 0000 0"
                    value={onboardIban}
                    onChange={e => setOnboardIban(e.target.value)}
                    className="h-11 text-left uppercase"
                    style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    dir="ltr"
                  />
                </div>
              )}

              <Button
                type="button"
                onClick={addAccountToOnboardList}
                className="w-full h-11 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white font-bold rounded-xl border border-indigo-500/20 active:scale-95 transition-all text-xs"
              >
                {isWalletName(onboardBankName) 
                  ? (lang === 'ar' ? '+ إضافة المحفظة الحالية للقائمة' : '+ Add Current Wallet to List') 
                  : (lang === 'ar' ? '+ إضافة البنك الحالي للقائمة' : '+ Add Current Bank to List')}
              </Button>
            </div>

            {/* List of pending banks */}
            {onboardAccounts.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-500 block">
                  {lang === 'ar' ? 'الحسابات المضافة للإعداد:' : 'Accounts added to setup:'}
                </span>
                <div className="divide-y divide-white/10 border border-white/5 rounded-xl max-h-[150px] overflow-y-auto pr-1 bg-transparent">
                  {onboardAccounts.map((acc, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 text-xs bg-transparent"
                    >
                      <div className="flex items-center gap-2">
                        <BankLogo name={acc.name} size="sm" />
                        <div className="text-right">
                          <span className="font-bold text-white block">{getTranslatedBankName(acc.name, lang)}</span>
                          <span className="text-[10px] text-slate-400">
                            {lang === 'ar' ? 'الرصيد الأول:' : 'Initial balance:'} {formatCurrency(acc.balance)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeAccountFromOnboardList(index)}
                        className="p-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex gap-3 pt-4 border-t border-white/5">
              <Button
                onClick={handleOnboardingSubmit}
                disabled={onboardSubmitting}
                className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg active:scale-95 transition-all text-sm"
              >
                {onboardSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (lang === 'ar' ? 'حفظ وإعداد الحسابات' : 'Save and Setup Accounts')}
              </Button>
              <Button
                onClick={handleOnboardingSkip}
                disabled={onboardSubmitting}
                variant="outline"
                className="flex-1 h-12 border-white/5 bg-transparent text-slate-400 hover:bg-white/5 hover:text-white rounded-xl text-sm"
              >
                {lang === 'ar' ? 'تخطي (كاش فقط)' : 'Skip (Cash only)'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- Add Account Dialog (for existing users) --- */}
      <Dialog open={showAddAccount} onOpenChange={setShowAddAccount}>
        <DialogContent className="rounded-[24px] sm:rounded-[32px] p-5 sm:p-8 outline-none max-w-[460px] max-h-[82dvh] overflow-y-auto custom-scrollbar" style={{ background: 'var(--card)', color: 'var(--card-foreground)', borderColor: 'var(--border)' }} dir="rtl">
          <DialogHeader className="text-right">
            <DialogTitle className="text-2xl font-black mb-4" style={{ color: 'var(--foreground)' }}>
              {lang === 'ar' ? 'إضافة حساب مالي جديد' : 'Add New Account'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddAccountSubmit} className="space-y-4">
            <div className="flex gap-2 p-1.5 bg-black/20 rounded-2xl border border-white/5" style={{ background: 'var(--secondary)', borderColor: 'var(--border)' }}>
              {(['bank', 'cash', 'wallet'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setNewAccType(t);
                    setNewAccName('');
                  }}
                  className={cn(
                    'flex-1 py-2.5 rounded-xl font-bold text-xs transition-all',
                    newAccType === t
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  )}
                >
                  {t === 'bank' 
                    ? (lang === 'ar' ? 'حساب بنكي' : 'Bank') 
                    : t === 'wallet' 
                    ? (lang === 'ar' ? 'محفظة' : 'Wallet') 
                    : (lang === 'ar' ? 'كاش' : 'Cash')}
                </button>
              ))}
            </div>

            {newAccType === 'bank' && (
              <>
                <div className="space-y-2 text-right">
                  <Label className="text-xs font-bold text-slate-400">{lang === 'ar' ? 'اختر البنك' : 'Select Bank'}</Label>
                  <BankSelector
                    selectedName={newAccName}
                    onSelect={setNewAccName}
                    type="bank"
                  />
                </div>

                <div className="space-y-2 text-right">
                  <Label className="text-xs font-bold text-slate-400">{lang === 'ar' ? 'اسم الحساب المخصص (اختياري - مثل: حساب المرتب)' : 'Account Alias (Optional - e.g. Salary Account)'}</Label>
                  <Input
                    placeholder={lang === 'ar' ? 'مثال: حساب التوفير، مرتب...' : 'e.g. Savings account...'}
                    value={newAccAlias}
                    onChange={e => setNewAccAlias(e.target.value)}
                    className="h-11"
                    style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  />
                </div>

                <div className="space-y-2 text-right">
                  <Label className="text-xs font-bold text-slate-400">{lang === 'ar' ? 'نوع الحساب البنكي' : 'Bank Account Type'}</Label>
                  <div className="flex gap-2 p-1 bg-black/10 rounded-xl border border-white/5">
                    <button
                      key="current"
                      type="button"
                      onClick={() => setNewAccSubType('current')}
                      className={cn(
                        'flex-1 py-2 rounded-lg font-bold text-[11px] transition-all',
                        newAccSubType === 'current'
                          ? 'bg-indigo-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      )}
                    >
                      {lang === 'ar' ? 'حساب جاري / توفير عادي' : 'Current / Savings Account'}
                    </button>
                    <button
                      key="deposit"
                      type="button"
                      onClick={() => setNewAccSubType('deposit')}
                      className={cn(
                        'flex-1 py-2 rounded-lg font-bold text-[11px] transition-all',
                        newAccSubType === 'deposit'
                          ? 'bg-indigo-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      )}
                    >
                      {lang === 'ar' ? 'وديعة / شهادة ادخار' : 'Certificate of Deposit (وديعة)'}
                    </button>
                  </div>
                </div>

                {newAccSubType === 'deposit' && (
                  <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/10 space-y-4 animate-fade-in">
                    <div className="space-y-2 text-right">
                      <Label className="text-xs font-bold text-indigo-300">{lang === 'ar' ? 'مبلغ الوديعة الأساسي (ج.م)' : 'Deposit Principal Amount (EGP)'}</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={newAccDepositAmount}
                        onChange={e => setNewAccDepositAmount(e.target.value)}
                        className="h-11"
                        style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2 text-right">
                        <Label className="text-xs font-bold text-indigo-300">{lang === 'ar' ? 'نسبة الفائدة السنوية (%)' : 'Annual Interest Rate (%)'}</Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g. 18.5"
                          value={newAccInterestRate}
                          onChange={e => setNewAccInterestRate(e.target.value)}
                          className="h-11 text-center"
                          style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                        />
                      </div>
                      <div className="space-y-2 text-right">
                        <Label className="text-xs font-bold text-indigo-300">{lang === 'ar' ? 'يوم صرف الفائدة شهرياً' : 'Payout Day of Month'}</Label>
                        <Input
                          type="number"
                          min="1"
                          max="31"
                          placeholder="e.g. 25"
                          value={newAccInterestDay}
                          onChange={e => setNewAccInterestDay(e.target.value)}
                          className="h-11 text-center"
                          style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 text-right">
                    <Label className="text-xs font-bold text-slate-400">{lang === 'ar' ? 'رقم الحساب المحلي' : 'Local Account No'}</Label>
                    <Input
                      placeholder={lang === 'ar' ? 'رقم الحساب' : 'Account number'}
                      value={newAccNo}
                      onChange={e => setNewAccNo(e.target.value)}
                      className="h-11"
                      style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    />
                  </div>
                  <div className="space-y-2 text-right">
                    <Label className="text-xs font-bold text-slate-400">{lang === 'ar' ? 'الرصيد الأولي' : 'Initial Balance'}</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={newAccBalance}
                      onChange={e => setNewAccBalance(e.target.value)}
                      className="h-11 text-center"
                      style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    />
                  </div>
                </div>

                <div className="space-y-2 text-right">
                  <Label className="text-xs font-bold text-slate-400">{lang === 'ar' ? 'رقم الحساب الدولي (IBAN)' : 'IBAN'}</Label>
                  <Input
                    placeholder="EG00 0000 0000 0000 0000 0000 0"
                    value={newAccIban}
                    onChange={e => setNewAccIban(e.target.value)}
                    className="h-11 text-left uppercase"
                    style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    dir="ltr"
                  />
                </div>
              </>
            )}

            {newAccType === 'wallet' && (
              <>
                <div className="space-y-2 text-right">
                  <Label className="text-xs font-bold text-slate-400">{lang === 'ar' ? 'اختر المحفظة الإلكترونية' : 'Select Mobile Wallet'}</Label>
                  <BankSelector
                    selectedName={newAccName}
                    onSelect={setNewAccName}
                    type="wallet"
                  />
                </div>

                <div className="space-y-2 text-right">
                  <Label className="text-xs font-bold text-slate-400">{lang === 'ar' ? 'اسم المحفظة المخصص (اختياري - مثل: محفظة الشغل)' : 'Wallet Alias (Optional - e.g. Work Wallet)'}</Label>
                  <Input
                    placeholder={lang === 'ar' ? 'مثال: محفظتي الأساسية، الكاش...' : 'e.g. My primary wallet...'}
                    value={newAccAlias}
                    onChange={e => setNewAccAlias(e.target.value)}
                    className="h-11"
                    style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 text-right">
                    <Label className="text-xs font-bold text-slate-400">{lang === 'ar' ? 'رقم الهاتف للمحفظة' : 'Wallet Phone No'}</Label>
                    <Input
                      placeholder="01xxxxxxxxx"
                      value={newAccNo}
                      onChange={e => setNewAccNo(e.target.value)}
                      className="h-11"
                      style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    />
                  </div>
                  <div className="space-y-2 text-right">
                    <Label className="text-xs font-bold text-slate-400">{lang === 'ar' ? 'الرصيد الأولي' : 'Initial Balance'}</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={newAccBalance}
                      onChange={e => setNewAccBalance(e.target.value)}
                      className="h-11 text-center"
                      style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    />
                  </div>
                </div>
              </>
            )}

            {newAccType === 'cash' && (
              <div className="space-y-4">
                <div className="space-y-2 text-right">
                  <Label className="text-xs font-bold text-slate-400">{lang === 'ar' ? 'رصيد الكاش الأولي' : 'Initial Cash Balance'}</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={newAccBalance}
                    disabled
                    className="h-12 text-center font-bold bg-white/5 opacity-80 cursor-not-allowed"
                    style={{ color: 'var(--foreground)', borderColor: 'var(--border)' }}
                  />
                  <p className="text-[10px] text-slate-500 mr-1">
                    {lang === 'ar' ? '💡 يتم احتساب الرصيد تلقائياً بناءً على توزيع الفئات النقدية أدناه.' : '💡 Balance is calculated automatically based on the cash denominations below.'}
                  </p>
                </div>

                <div className="space-y-3 border border-white/5 bg-black/10 p-4 rounded-2xl">
                  <Label className="text-xs font-bold text-slate-400 block mb-3">{lang === 'ar' ? 'توزيع الفئات النقدية (إجباري)' : 'Cash Denominations (Required)'}</Label>
                  <div className="grid grid-cols-1 gap-2 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                    {EGYPTIAN_DENOMINATIONS.map(({ value: denom, ar, en }) => (
                      <div key={denom} className="flex items-center justify-between gap-2 bg-white/5 px-3 py-2 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          {/* Mini Banknote Card */}
                          <div className="shrink-0 w-16 h-10 sm:w-20 sm:h-12 rounded-xl border border-white/10 relative overflow-hidden shadow bg-slate-900/10">
                            <img
                              src={`/banknotes/egp_${denom}.png`}
                              alt={`${denom} EGP`}
                              className="w-full h-full object-cover rounded-xl"
                            />
                          </div>
                          <span className="text-[11px] sm:text-xs font-semibold text-slate-300 truncate">{lang === 'ar' ? ar : en}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] text-slate-500 font-bold">{lang === 'ar' ? 'عدد' : 'qty'}</span>
                          <Input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={newAccDenominations[denom] || ''}
                            onChange={e => handleNewDenominationChange(denom, e.target.value)}
                            className="h-8 w-14 text-center text-xs sm:text-sm font-bold"
                            style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  {Object.values(newAccDenominations).some(v => v > 0) && (
                    <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-bold">{lang === 'ar' ? 'إجمالي من الفئات' : 'Total from denominations'}</span>
                      <span className="text-sm font-black text-emerald-400">{newAccBalance} {lang === 'ar' ? 'ج.م' : 'EGP'}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={addAccountSubmitting}
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg active:scale-95 transition-all text-sm mt-4"
            >
              {addAccountSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (lang === 'ar' ? 'إضافة الحساب المالي' : 'Add Financial Account')}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- Detail Log Modal of transactions for selected account --- */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="rounded-[24px] sm:rounded-[32px] p-5 sm:p-8 outline-none max-w-[550px] max-h-[82dvh] overflow-y-auto custom-scrollbar" style={{ background: 'var(--card)', color: 'var(--card-foreground)', borderColor: 'var(--border)' }} dir="rtl">
          {selectedAccount && (
            <>
              <DialogHeader className="text-right">
                <div className="flex items-center gap-3 mb-2">
                  <BankLogo name={selectedAccount.name} size="lg" />
                  <div>
                    <DialogTitle className="text-2xl font-black" style={{ color: 'var(--foreground)' }}>{getTranslatedBankName(selectedAccount.name, lang)}</DialogTitle>
                    <span className="text-xs font-bold text-slate-400">
                      {lang === 'ar' ? 'كشف حركات الحساب المالي والتفاصيل بالوقت' : 'Financial account statement & details with time'}
                    </span>
                  </div>
                </div>
              </DialogHeader>

              {/* Account Quick Stats */}
              <div className="grid grid-cols-3 gap-3 my-5 p-4 rounded-2xl border" style={{ background: 'var(--secondary)', borderColor: 'var(--border)' }}>
                <div className="text-center">
                  <span className="text-[10px] font-bold text-slate-500 block">{lang === 'ar' ? 'رصيد الحساب' : 'Account Balance'}</span>
                  <span className="text-sm font-black tabular-nums" style={{ color: 'var(--foreground)' }}>{formatCurrency(selectedAccount.balance)}</span>
                </div>
                <div className="text-center border-r animate-fade-in" style={{ borderRightColor: 'var(--border)' }}>
                  <span className="text-[10px] font-bold text-slate-500 block text-emerald-500">{lang === 'ar' ? 'إجمالي الإيداع' : 'Total Deposits'}</span>
                  <span className="text-sm font-black text-emerald-400 tabular-nums">+{formatCurrency(accountStats.income)}</span>
                </div>
                <div className="text-center border-r animate-fade-in" style={{ borderRightColor: 'var(--border)' }}>
                  <span className="text-[10px] font-bold text-slate-500 block text-red-500">{lang === 'ar' ? 'إجمالي السحب' : 'Total Withdrawals'}</span>
                  <span className="text-sm font-black text-red-400 tabular-nums">-{formatCurrency(accountStats.expense)}</span>
                </div>
              </div>

              {/* Transactions List */}
              <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                <h4 className="text-xs font-bold text-slate-400 mb-2">{lang === 'ar' ? 'الحركات المالية الأخيرة:' : 'Recent transactions:'}</h4>
                {accountTransactions.length === 0 ? (
                  <div className="text-center py-10 text-xs text-slate-500">
                    {lang === 'ar' ? 'لا توجد حركات مسجلة لهذا الحساب.' : 'No transactions recorded for this account.'}
                  </div>
                ) : (
                  accountTransactions.map(tx => {
                    const cat = getCategoryInfo(tx.category, tx.type, lang);
                    const isIncome = tx.type === 'income';
                    const txDate = new Date(tx.date);
                    
                    return (
                      <div
                        key={tx.id}
                        className="flex justify-between items-center p-3.5 bg-white/5 border border-white/5 rounded-xl text-xs hover:border-white/10 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'w-8 h-8 rounded-lg flex items-center justify-center text-lg',
                              isIncome ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                            )}
                          >
                            {cat.icon}
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-white block">{tx.description || cat.label}</span>
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 font-semibold">
                              <span className="flex items-center gap-0.5"><Calendar className="w-3 h-3" /> {txDate.toLocaleDateString(lang === 'ar' ? 'ar-EG-u-nu-latn' : 'en-US', { day: 'numeric', month: 'short' })}</span>
                              <span>•</span>
                              <span className="flex items-center gap-0.5">
                                <Clock className="w-3 h-3" /> 
                                {txDate.toLocaleTimeString(lang === 'ar' ? 'ar-EG-u-nu-latn' : 'en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span
                          className={cn(
                            'font-black tabular-nums',
                            isIncome ? 'text-emerald-500' : 'text-red-500'
                          )}
                        >
                          {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Account Numbers (Hidden behind eye toggle for reference inside detail view too) */}
              {(selectedAccount.type === 'bank' || selectedAccount.type === 'wallet') && (selectedAccount.accountNum || selectedAccount.iban) && (
                <div className="mt-5 pt-4 border-t text-xs text-slate-400 flex flex-col gap-2" style={{ borderTopColor: 'var(--border)' }}>
                  {selectedAccount.accountNum && (
                    <div className="flex justify-between items-center p-2.5 rounded-xl border" style={{ background: 'var(--secondary)', borderColor: 'var(--border)' }}>
                      <span className="text-[10px] font-bold text-slate-500">
                        {selectedAccount.type === 'wallet' ? (lang === 'ar' ? 'رقم الهاتف للمحفظة:' : 'Wallet Phone Number:') : (lang === 'ar' ? 'رقم الحساب المحلي:' : 'Local Account Number:')}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-[11px]" style={{ color: 'var(--foreground)' }}>{selectedAccount.accountNum}</span>
                        <button
                          onClick={(e) => handleCopy(selectedAccount.accountNum, selectedAccount.type === 'wallet' ? 'رقم الهاتف' : 'رقم الحساب', e)}
                          className="p-1 rounded text-slate-500 hover:text-indigo-400 transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                  {selectedAccount.type === 'bank' && selectedAccount.iban && (
                    <div className="flex justify-between items-center p-2.5 rounded-xl border" style={{ background: 'var(--secondary)', borderColor: 'var(--border)' }}>
                      <span className="text-[10px] font-bold text-slate-500">{lang === 'ar' ? 'رقم الحساب الدولي (IBAN):' : 'IBAN:'}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-[10px]" style={{ color: 'var(--foreground)' }}>{selectedAccount.iban}</span>
                        <button
                          onClick={(e) => handleCopy(selectedAccount.iban, 'IBAN', e)}
                          className="p-1 rounded text-slate-500 hover:text-indigo-400 transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {/* ─── Cash Denominations Breakdown ─── */}
              {selectedAccount.type === 'cash' && selectedAccount.denominations && Object.values(selectedAccount.denominations as Record<string, number>).some(v => v > 0) && (
                <div className="mt-5 pt-4 border-t" style={{ borderTopColor: 'var(--border)' }}>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 text-right">
                    {lang === 'ar' ? '💵 تفاصيل الفئات النقدية' : '💵 Cash Denominations'}
                  </p>
                  <div className="space-y-2">
                    {EGYPTIAN_DENOMINATIONS.filter(({ value: d }) => {
                      const denoms = selectedAccount.denominations as Record<string, number>;
                      return denoms[d] && denoms[d] > 0;
                    }).map(({ value: d, ar, en }) => {
                      const denoms = selectedAccount.denominations as Record<string, number>;
                      const count = denoms[d] || 0;
                      const subtotal = count * parseFloat(d);
                      const total = selectedAccount.balance || 1;
                      const pct = Math.min(100, (subtotal / total) * 100);
                      return (
                        <div key={d} className="flex items-center gap-3 p-2.5 rounded-xl border" style={{ background: 'var(--secondary)', borderColor: 'var(--border)' }}>
                          {/* Mini Banknote Card */}
                          <div className="shrink-0 w-24 h-14 rounded-xl border border-white/10 relative overflow-hidden shadow-md shadow-black/45 transition-all select-none bg-slate-900/10">
                            <img
                              src={`/banknotes/egp_${d}.png`}
                              alt={`${d} EGP`}
                              className="w-full h-full object-cover rounded-xl"
                            />
                          </div>
                          {/* Label + bar */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-bold text-slate-500">{lang === 'ar' ? ar : en}</span>
                              <span className="text-[10px] font-black text-slate-300 tabular-nums">{formatCurrency(subtotal)}</span>
                            </div>
                            <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-emerald-500/60 transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                          {/* Count badge */}
                          <div className="shrink-0 min-w-[2.5rem] text-center">
                            <span className="text-xs font-black tabular-nums" style={{ color: 'var(--foreground)' }}>×{count}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* Total */}
                  <div className="mt-3 flex items-center justify-between px-1">
                    <span className="text-[10px] font-bold text-slate-500">{lang === 'ar' ? 'إجمالي من الفئات' : 'Total from denominations'}</span>
                    <span className="text-sm font-black text-emerald-400">{formatCurrency(selectedAccount.balance)}</span>
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Edit Account Dialog ─── */}
      <Dialog open={editDialog.isOpen} onOpenChange={(open) => setEditDialog(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="rounded-[24px] sm:rounded-[32px] p-5 sm:p-8 outline-none max-w-[460px] max-h-[82dvh] overflow-y-auto custom-scrollbar" style={{ background: 'var(--card)', color: 'var(--card-foreground)', borderColor: 'var(--border)' }} dir="rtl">
          <DialogHeader className="text-right">
            <DialogTitle className="text-2xl font-black mb-4" style={{ color: 'var(--foreground)' }}>
              {lang === 'ar' ? 'تعديل الحساب المالي ✏️' : 'Edit Financial Account ✏️'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleEditAccountSubmit} className="space-y-4">
            {editDialog.account?.type === 'bank' && (
              <>
                <div className="space-y-2 text-right">
                  <Label className="text-xs font-bold text-slate-400">{lang === 'ar' ? 'اختر البنك' : 'Select Bank'}</Label>
                  <BankSelector selectedName={editName} onSelect={setEditName} type="bank" />
                </div>

                <div className="space-y-2 text-right">
                  <Label className="text-xs font-bold text-slate-400">{lang === 'ar' ? 'اسم الحساب المخصص (اختياري)' : 'Account Alias (Optional)'}</Label>
                  <Input
                    placeholder={lang === 'ar' ? 'مثال: حساب التوفير، مرتب...' : 'e.g. Savings account...'}
                    value={editAlias}
                    onChange={e => setEditAlias(e.target.value)}
                    className="h-11"
                    style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  />
                </div>

                <div className="space-y-2 text-right">
                  <Label className="text-xs font-bold text-slate-400">{lang === 'ar' ? 'نوع الحساب البنكي' : 'Bank Account Type'}</Label>
                  <div className="flex gap-2 p-1 bg-black/10 rounded-xl border border-white/5">
                    <button type="button" onClick={() => setEditSubType('current')} className={cn('flex-1 py-2 rounded-lg font-bold text-[11px] transition-all', editSubType === 'current' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white')}>
                      {lang === 'ar' ? 'حساب جاري / توفير عادي' : 'Current / Savings'}
                    </button>
                    <button type="button" onClick={() => setEditSubType('deposit')} className={cn('flex-1 py-2 rounded-lg font-bold text-[11px] transition-all', editSubType === 'deposit' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white')}>
                      {lang === 'ar' ? 'وديعة / شهادة ادخار' : 'Certificate of Deposit'}
                    </button>
                  </div>
                </div>

                {editSubType === 'deposit' && (
                  <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/10 space-y-4 animate-fade-in">
                    <div className="space-y-2 text-right">
                      <Label className="text-xs font-bold text-indigo-300">{lang === 'ar' ? 'مبلغ الوديعة الأساسي (ج.م)' : 'Deposit Principal (EGP)'}</Label>
                      <Input type="number" placeholder="0.00" value={editDepositAmount} onChange={e => setEditDepositAmount(e.target.value)} className="h-11" style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2 text-right">
                        <Label className="text-xs font-bold text-indigo-300">{lang === 'ar' ? 'نسبة الفائدة السنوية (%)' : 'Annual Interest Rate (%)'}</Label>
                        <Input type="number" step="0.01" placeholder="e.g. 18.5" value={editInterestRate} onChange={e => setEditInterestRate(e.target.value)} className="h-11 text-center" style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
                      </div>
                      <div className="space-y-2 text-right">
                        <Label className="text-xs font-bold text-indigo-300">{lang === 'ar' ? 'يوم صرف الفائدة شهرياً' : 'Payout Day'}</Label>
                        <Input type="number" min="1" max="31" placeholder="e.g. 25" value={editInterestDay} onChange={e => setEditInterestDay(e.target.value)} className="h-11 text-center" style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 text-right">
                    <Label className="text-xs font-bold text-slate-400">{lang === 'ar' ? 'رقم الحساب المحلي' : 'Local Account No'}</Label>
                    <Input placeholder={lang === 'ar' ? 'رقم الحساب' : 'Account number'} value={editAccountNum} onChange={e => setEditAccountNum(e.target.value)} className="h-11" style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
                  </div>
                  <div className="space-y-2 text-right">
                    <Label className="text-xs font-bold text-slate-400">{lang === 'ar' ? 'الرصيد' : 'Balance'}</Label>
                    <Input type="number" placeholder="0.00" value={editBalance} onChange={e => setEditBalance(e.target.value)} className="h-11 text-center" style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
                  </div>
                </div>

                <div className="space-y-2 text-right">
                  <Label className="text-xs font-bold text-slate-400">{lang === 'ar' ? 'رقم الحساب الدولي (IBAN)' : 'IBAN'}</Label>
                  <Input placeholder="EG00 0000 0000 0000 0000 0000 0" value={editIban} onChange={e => setEditIban(e.target.value)} className="h-11 text-left uppercase" dir="ltr" style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
                </div>
              </>
            )}

            {editDialog.account?.type === 'wallet' && (
              <>
                <div className="space-y-2 text-right">
                  <Label className="text-xs font-bold text-slate-400">{lang === 'ar' ? 'اختر المحفظة الإلكترونية' : 'Select Mobile Wallet'}</Label>
                  <BankSelector selectedName={editName} onSelect={setEditName} type="wallet" />
                </div>
                <div className="space-y-2 text-right">
                  <Label className="text-xs font-bold text-slate-400">{lang === 'ar' ? 'اسم المحفظة المخصص (اختياري)' : 'Wallet Alias (Optional)'}</Label>
                  <Input placeholder={lang === 'ar' ? 'مثال: محفظتي الأساسية...' : 'e.g. My primary wallet...'} value={editAlias} onChange={e => setEditAlias(e.target.value)} className="h-11" style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 text-right">
                    <Label className="text-xs font-bold text-slate-400">{lang === 'ar' ? 'رقم الهاتف للمحفظة' : 'Wallet Phone No'}</Label>
                    <Input placeholder="01xxxxxxxxx" value={editAccountNum} onChange={e => setEditAccountNum(e.target.value)} className="h-11" style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
                  </div>
                  <div className="space-y-2 text-right">
                    <Label className="text-xs font-bold text-slate-400">{lang === 'ar' ? 'الرصيد' : 'Balance'}</Label>
                    <Input type="number" placeholder="0.00" value={editBalance} onChange={e => setEditBalance(e.target.value)} className="h-11 text-center" style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
                  </div>
                </div>
              </>
            )}

            {editDialog.account?.type === 'cash' && (
              <>
                <div className="space-y-2 text-right">
                  <Label className="text-xs font-bold text-slate-400">{lang === 'ar' ? 'اسم الحساب المخصص' : 'Account Alias'}</Label>
                  <Input placeholder={lang === 'ar' ? 'كاش' : 'Cash'} value={editAlias} onChange={e => setEditAlias(e.target.value)} className="h-11" style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
                </div>
                <div className="space-y-2 text-right">
                  <Label className="text-xs font-bold text-slate-400">{lang === 'ar' ? 'الرصيد النقدي الحالي' : 'Current Cash Balance'}</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={editBalance}
                    disabled
                    className="h-11 font-bold bg-white/5 opacity-80 cursor-not-allowed"
                    style={{ color: 'var(--foreground)', borderColor: 'var(--border)' }}
                  />
                  <p className="text-[10px] text-slate-500 mr-1">
                    {lang === 'ar' ? '💡 يتم احتساب الرصيد تلقائياً بناءً على توزيع الفئات النقدية أدناه.' : '💡 Balance is calculated automatically based on the cash denominations below.'}
                  </p>
                </div>

                <div className="space-y-3 border border-white/5 bg-black/10 p-4 rounded-2xl">
                  <Label className="text-xs font-bold text-slate-400 block mb-3">{lang === 'ar' ? 'توزيع الفئات النقدية (إجباري)' : 'Cash Denominations (Required)'}</Label>
                  <div className="grid grid-cols-1 gap-2 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                    {EGYPTIAN_DENOMINATIONS.map(({ value: denom, ar, en }) => (
                      <div key={denom} className="flex items-center justify-between gap-2 bg-white/5 px-3 py-2 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          {/* Mini Banknote Card */}
                          <div className="shrink-0 w-16 h-10 sm:w-20 sm:h-12 rounded-xl border border-white/10 relative overflow-hidden shadow bg-slate-900/10">
                            <img
                              src={`/banknotes/egp_${denom}.png`}
                              alt={`${denom} EGP`}
                              className="w-full h-full object-cover rounded-xl"
                            />
                          </div>
                          <span className="text-[11px] sm:text-xs font-semibold text-slate-300 truncate">{lang === 'ar' ? ar : en}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] text-slate-500 font-bold">{lang === 'ar' ? 'عدد' : 'qty'}</span>
                          <Input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={editDenominations[denom] || ''}
                            onChange={e => handleDenominationChange(denom, e.target.value)}
                            className="h-8 w-14 text-center text-xs sm:text-sm font-bold"
                            style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  {Object.values(editDenominations).some(v => v > 0) && (
                    <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-bold">{lang === 'ar' ? 'إجمالي من الفئات' : 'Total from denominations'}</span>
                      <span className="text-sm font-black text-emerald-400">{editBalance} {lang === 'ar' ? 'ج.م' : 'EGP'}</span>
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="flex gap-3 pt-4 border-t border-white/5">
              <Button type="submit" disabled={editSubmitting} className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg active:scale-95 transition-all text-sm">
                {editSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (lang === 'ar' ? 'حفظ التعديلات' : 'Save Changes')}
              </Button>
              <Button type="button" onClick={() => setEditDialog({ isOpen: false, account: null })} disabled={editSubmitting} variant="outline" className="flex-1 h-12 border-white/5 bg-transparent text-slate-400 hover:bg-white/5 hover:text-white rounded-xl text-sm">
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Custom Delete Dialog for Bank/Wallet Account */}
      <Dialog open={deleteDialog.isOpen} onOpenChange={(isOpen) => setDeleteDialog(prev => ({ ...prev, isOpen }))}>
        <DialogContent className="p-8 sm:max-w-[400px] rounded-[32px] outline-none" style={{ background: 'var(--card)', color: 'var(--card-foreground)', borderColor: 'var(--border)' }} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          <div className={cn("text-right", lang === 'en' && "text-left")}>
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 mb-6">
              <Trash2 className="w-7 h-7" />
            </div>
            <DialogHeader className={cn("text-right", lang === 'en' && "text-left")}>
              <DialogTitle className="text-2xl font-black" style={{ color: 'var(--foreground)' }}>
                {lang === 'ar' ? 'حذف الحساب المالي' : 'Delete Financial Account'}
              </DialogTitle>
            </DialogHeader>
            <p className="text-base font-medium mt-4 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
              {lang === 'ar' ? (
                <>
                  هل أنت متأكد من حذف حساب <span className="font-bold" style={{ color: 'var(--foreground)' }}>"{deleteDialog.accountName}"</span>؟ لا يمكن التراجع عن هذا الإجراء وسيتم حذف الحساب بالكامل.
                </>
              ) : (
                <>
                  Are you sure you want to delete the account <span className="font-bold" style={{ color: 'var(--foreground)' }}>"{deleteDialog.accountName}"</span>? This action cannot be undone.
                </>
              )}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row-reverse gap-3">
              <Button 
                className="flex-1 h-14 bg-red-500 hover:bg-red-600 text-white font-black rounded-2xl active:scale-[0.98] transition-all" 
                onClick={confirmDeleteAccount}
              >
                {lang === 'ar' ? 'حذف نهائي' : 'Delete permanently'}
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 h-14 font-bold rounded-2xl transition-all"
                style={{ borderColor: 'var(--border)', background: 'transparent', color: 'var(--foreground)' }}
                onClick={() => setDeleteDialog({ isOpen: false, accountId: '', accountName: '' })}
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

