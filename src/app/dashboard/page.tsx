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
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import WeatherPrayerWidget from '@/components/WeatherPrayerWidget';
import BankLogo from '@/components/BankLogo';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// 24 Egyptian Banks list
const EGYPTIAN_BANKS_LIST = [
  'البنك الأهلي المصري (NBE)',
  'بنك مصر',
  'بنك القاهرة',
  'البنك العقاري المصري العربي',
  'البنك التجاري الدولي (CIB)',
  'بنك QNB',
  'البنك العربي الأفريقي الدولي (AAIB)',
  'بنك الإسكندرية',
  'مصرف أبوظبي الإسلامي (ADIB)',
  'بنك فيصل الإسلامي المصري',
  'بنك البركة مصر',
  'بنك التعمير والإسكان (HDB)',
  'البنك المصري الخليجى (EG Bank)',
  'بنك قناة السويس',
  'بنك الشركة المصرفية العربية الدولية (SAIB)',
  'المصرف المتحد',
  'بنك نكست',
  'بنك الإمارات دبي الوطني',
  'بنك أبوظبي الأول (FAB)',
  'إتش إس بي سي مصر (HSBC)',
  'التجاري وفا بنك',
  'كريدي أجريكول مصر',
  'سيتي بنك (Citibank)',
  'البنك العربي'
];

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  
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
  const [newAccType, setNewAccType] = useState<'bank' | 'cash'>('bank');
  const [newAccName, setNewAccName] = useState('');
  const [newAccIban, setNewAccIban] = useState('');
  const [newAccNo, setNewAccNo] = useState('');
  const [newAccBalance, setNewAccBalance] = useState('');
  const [addAccountSubmitting, setAddAccountSubmitting] = useState(false);

  // Detail Modal states
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [accountTransactions, setAccountTransactions] = useState<Transaction[]>([]);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

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
      setAccounts(accountsData || []);
      
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
      toast.error('يرجى تحديد اسم البنك');
      return;
    }
    
    // Check if duplicate bank
    if (onboardAccounts.some(acc => acc.name === onboardBankName)) {
      toast.error('لقد قمت بإضافة هذا البنك بالفعل');
      return;
    }

    const newAcc = {
      name: onboardBankName,
      type: 'bank',
      iban: onboardIban || null,
      accountNum: onboardAccountNum || null,
      balance: parseFloat(onboardBalance) || 0
    };

    setOnboardAccounts([...onboardAccounts, newAcc]);
    setOnboardBankName('');
    setOnboardIban('');
    setOnboardAccountNum('');
    setOnboardBalance('');
    toast.success('تمت إضافة البنك للقائمة. يمكنك إضافة المزيد أو الحفظ.');
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
    if (newAccType === 'bank' && !newAccName) {
      toast.error('يرجى تحديد اسم البنك');
      return;
    }

    const name = newAccType === 'cash' ? 'كاش' : newAccName;

    // Check if duplicate cash/bank
    if (accounts.some(acc => acc.name.toLowerCase() === name.toLowerCase())) {
      toast.error('هذا الحساب مسجل بالفعل');
      return;
    }

    setAddAccountSubmitting(true);
    try {
      await accountsApi.create({
        name,
        type: newAccType,
        iban: newAccType === 'bank' ? newAccIban : undefined,
        accountNum: newAccType === 'bank' ? newAccNo : undefined,
        balance: parseFloat(newAccBalance) || 0
      });
      toast.success('تم إضافة الحساب بنجاح! 💳');
      setShowAddAccount(false);
      setNewAccName('');
      setNewAccIban('');
      setNewAccNo('');
      setNewAccBalance('');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ أثناء إضافة الحساب');
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
            حساباتي المالية وأرصدة البنوك
          </h3>
          <Button
            onClick={() => setShowAddAccount(true)}
            className="bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-xl px-4 py-2 text-xs font-bold transition-all border border-indigo-500/10 flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            إضافة حساب
          </Button>
        </div>

        {accounts.length === 0 ? (
          <div className="glass-card p-8 flex flex-col items-center justify-center text-slate-500 text-sm">
            لا توجد حسابات مضافة. اضغط على "إضافة حساب" للبدء.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {accounts.map(acc => {
              const isVisible = visibleAccounts[acc.id] || false;
              const isBank = acc.type === 'bank';
              
              return (
                <div
                  key={acc.id}
                  onClick={() => handleOpenAccountDetails(acc)}
                  className="glass-card p-5 relative overflow-hidden group hover:border-white/20 transition-all cursor-pointer flex flex-col justify-between min-h-[160px] select-none active:scale-[0.98]"
                >
                  {/* Top Row: Brand & Type */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <BankLogo name={acc.name} size="md" />
                      <div className="text-right">
                        <h4 className="text-sm font-black text-white group-hover:text-indigo-400 transition-colors line-clamp-1">{acc.name}</h4>
                        <span className="text-[10px] font-bold text-slate-500">{isBank ? 'حساب بنكي' : 'نقد كاش'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle Row: Balance */}
                  <div className="my-3 text-right">
                    <span className="text-[10px] font-bold text-slate-500 block">الرصيد المتوفر</span>
                    <span className="text-2xl font-black text-white tabular-nums">{formatCurrency(acc.balance)}</span>
                  </div>

                  {/* Bottom Row: IBAN / Account Number Actions */}
                  {isBank && (acc.accountNum || acc.iban) ? (
                    <div className="pt-3 border-t border-white/5 flex flex-col gap-1.5 text-xs text-slate-400">
                      {acc.accountNum && (
                        <div className="flex justify-between items-center gap-2 group/action">
                          <span className="text-[10px] font-semibold text-slate-500">رقم الحساب:</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono tracking-wider text-[11px] text-slate-300">
                              {isVisible ? acc.accountNum : maskNumber(acc.accountNum, false)}
                            </span>
                            <button
                              onClick={(e) => toggleVisibility(acc.id, e)}
                              className="p-1 rounded text-slate-500 hover:text-white transition-colors"
                            >
                              {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={(e) => handleCopy(acc.accountNum, 'رقم الحساب', e)}
                              className="p-1 rounded text-slate-500 hover:text-white transition-colors"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {acc.iban && (
                        <div className="flex justify-between items-center gap-2 group/action">
                          <span className="text-[10px] font-semibold text-slate-500">IBAN:</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono tracking-wider text-[10px] text-slate-300">
                              {isVisible ? acc.iban : maskNumber(acc.iban, true)}
                            </span>
                            <button
                              onClick={(e) => handleCopy(acc.iban, 'IBAN', e)}
                              className="p-1 rounded text-slate-500 hover:text-white transition-colors"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="pt-3 border-t border-white/5 flex items-center gap-1 text-[10px] text-slate-500">
                      <span>تتبع كاش النقدية السائلة والمشتريات اليدوية</span>
                    </div>
                  )}
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
                  const cat = getCategoryInfo(tx.category, tx.type);
                  return (
                    <div
                      key={tx.id}
                      className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            'w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110',
                            tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                          )}
                        >
                          {tx.type === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm sm:text-base font-bold text-slate-100 mb-0.5 break-words whitespace-normal">
                              {tx.description || cat.label}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 font-medium">
                            <span>{new Date(tx.date).toLocaleDateString('ar-EG-u-nu-latn', { day: 'numeric', month: 'short' })}</span>
                            {tx.account && (
                              <span className="flex items-center gap-1 bg-white/5 border border-white/5 px-2 py-0.5 rounded-full text-slate-400 font-semibold text-[10px]">
                                <BankLogo name={accName => tx.account?.name || ''} name={tx.account.name} size="sm" className="w-3.5 h-3.5 rounded border-0" />
                                {tx.account.name}
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
                            {category}
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
        <DialogContent className="bg-[#1a1a35] border-white/10 text-white rounded-[32px] p-8 outline-none max-w-[500px]" dir="rtl">
          <DialogHeader className="text-right">
            <DialogTitle className="text-2xl font-black mb-2 flex items-center gap-2">
              💳 تهيئة حساباتك المالية
            </DialogTitle>
            <p className="text-xs font-semibold text-slate-400 leading-relaxed">
              أهلاً بك في مدبّر! لنقم بإضافة البنوك التي تستخدمها ورصيدك الحالي لتسهيل تتبع معاملاتك. (هذا الإعداد اختياري ويمكن تخطيه)
            </p>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Cash setup (mandatory placeholder or simple initial cash input) */}
            <div className="space-y-2 text-right">
              <Label className="text-xs font-bold text-slate-400">💵 رصيد الكاش الحالي (إن وجد)</Label>
              <Input
                type="number"
                placeholder="أدخل المبلغ النقدي المتوفر معك الآن"
                value={onboardCashBalance}
                onChange={e => setOnboardCashBalance(e.target.value)}
                className="h-12 bg-[#242444] border-[#2d2d5e] focus:border-indigo-500 focus:ring-indigo-500/20 text-white rounded-xl text-center"
              />
            </div>

            <div className="border-t border-white/5 my-4 pt-4" />

            {/* Bank account setup */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-indigo-400">🏦 إضافة حساب بنكي جديد</h4>
              
              <div className="space-y-2 text-right">
                <Label className="text-xs font-bold text-slate-400">اسم البنك</Label>
                <input
                  list="onboard-banks"
                  placeholder="ابحث أو اختر اسم البنك"
                  value={onboardBankName}
                  onChange={e => setOnboardBankName(e.target.value)}
                  className="w-full h-12 bg-[#242444] border border-[#2d2d5e] focus:border-indigo-500 focus:ring-indigo-500/20 text-white rounded-xl px-4 outline-none text-right placeholder:text-slate-500 text-sm font-semibold"
                />
                <datalist id="onboard-banks">
                  {EGYPTIAN_BANKS_LIST.map(bank => (
                    <option key={bank} value={bank} />
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 text-right">
                  <Label className="text-xs font-bold text-slate-400">رقم الحساب المحلي</Label>
                  <Input
                    placeholder="مثال: 123456"
                    value={onboardAccountNum}
                    onChange={e => setOnboardAccountNum(e.target.value)}
                    className="h-11 bg-[#242444] border-[#2d2d5e]"
                  />
                </div>
                <div className="space-y-2 text-right">
                  <Label className="text-xs font-bold text-slate-400">رصيد البنك الحالي</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={onboardBalance}
                    onChange={e => setOnboardBalance(e.target.value)}
                    className="h-11 bg-[#242444] border-[#2d2d5e] text-center"
                  />
                </div>
              </div>

              <div className="space-y-2 text-right">
                <Label className="text-xs font-bold text-slate-400">رقم الحساب الدولي (IBAN)</Label>
                <Input
                  placeholder="EG00 0000 0000 0000 0000 0000 0"
                  value={onboardIban}
                  onChange={e => setOnboardIban(e.target.value)}
                  className="h-11 bg-[#242444] border-[#2d2d5e] text-left uppercase"
                  dir="ltr"
                />
              </div>

              <Button
                type="button"
                onClick={addAccountToOnboardList}
                className="w-full h-11 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white font-bold rounded-xl border border-indigo-500/20 active:scale-95 transition-all text-xs"
              >
                + إضافة البنك الحالي للقائمة
              </Button>
            </div>

            {/* List of pending banks */}
            {onboardAccounts.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-500 block">البنوك المضافة للإعداد:</span>
                <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                  {onboardAccounts.map((acc, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-white/5 border border-white/5 rounded-xl text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <BankLogo name={acc.name} size="sm" />
                        <div className="text-right">
                          <span className="font-bold text-white block">{acc.name}</span>
                          <span className="text-[10px] text-slate-400">الرصيد الأول: {formatCurrency(acc.balance)}</span>
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
                {onboardSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'حفظ وإعداد الحسابات'}
              </Button>
              <Button
                onClick={handleOnboardingSkip}
                disabled={onboardSubmitting}
                variant="outline"
                className="flex-1 h-12 border-white/5 bg-transparent text-slate-400 hover:bg-white/5 hover:text-white rounded-xl text-sm"
              >
                تخطي (كاش فقط)
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- Add Account Dialog (for existing users) --- */}
      <Dialog open={showAddAccount} onOpenChange={setShowAddAccount}>
        <DialogContent className="bg-[#1a1a35] border-white/10 text-white rounded-[32px] p-8 outline-none max-w-[460px]" dir="rtl">
          <DialogHeader className="text-right">
            <DialogTitle className="text-2xl font-black mb-4">إضافة حساب مالي جديد</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddAccountSubmit} className="space-y-6">
            <div className="flex gap-2 p-1.5 bg-black/20 rounded-2xl border border-white/5">
              {(['bank', 'cash'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setNewAccType(t)}
                  className={cn(
                    'flex-1 py-2.5 rounded-xl font-bold text-xs transition-all',
                    newAccType === t
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  )}
                >
                  {t === 'bank' ? 'حساب بنكي' : 'نقد كاش'}
                </button>
              ))}
            </div>

            {newAccType === 'bank' ? (
              <>
                <div className="space-y-2 text-right">
                  <Label className="text-xs font-bold text-slate-400">اسم البنك</Label>
                  <input
                    list="add-banks"
                    placeholder="اختر البنك"
                    value={newAccName}
                    onChange={e => setNewAccName(e.target.value)}
                    className="w-full h-12 bg-[#242444] border border-[#2d2d5e] focus:border-indigo-500 focus:ring-indigo-500/20 text-white rounded-xl px-4 outline-none text-right placeholder:text-slate-500 text-sm font-semibold"
                  />
                  <datalist id="add-banks">
                    {EGYPTIAN_BANKS_LIST.map(bank => (
                      <option key={bank} value={bank} />
                    ))}
                  </datalist>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 text-right">
                    <Label className="text-xs font-bold text-slate-400">رقم الحساب المحلي</Label>
                    <Input
                      placeholder="رقم الحساب"
                      value={newAccNo}
                      onChange={e => setNewAccNo(e.target.value)}
                      className="h-11 bg-[#242444] border-[#2d2d5e]"
                    />
                  </div>
                  <div className="space-y-2 text-right">
                    <Label className="text-xs font-bold text-slate-400">الرصيد الأولي</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={newAccBalance}
                      onChange={e => setNewAccBalance(e.target.value)}
                      className="h-11 bg-[#242444] border-[#2d2d5e] text-center"
                    />
                  </div>
                </div>

                <div className="space-y-2 text-right">
                  <Label className="text-xs font-bold text-slate-400">رقم الحساب الدولي (IBAN)</Label>
                  <Input
                    placeholder="EG00 0000 0000 0000 0000 0000 0"
                    value={newAccIban}
                    onChange={e => setNewAccIban(e.target.value)}
                    className="h-11 bg-[#242444] border-[#2d2d5e] text-left uppercase"
                    dir="ltr"
                  />
                </div>
              </>
            ) : (
              <div className="space-y-2 text-right">
                <Label className="text-xs font-bold text-slate-400">رصيد الكاش الأولي</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={newAccBalance}
                  onChange={e => setNewAccBalance(e.target.value)}
                  className="h-12 bg-[#242444] border-[#2d2d5e] text-center"
                />
              </div>
            )}

            <Button
              type="submit"
              disabled={addAccountSubmitting}
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg active:scale-95 transition-all text-sm mt-4"
            >
              {addAccountSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'إضافة الحساب المالي'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- Detail Log Modal of transactions for selected account --- */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="bg-[#1a1a35] border-white/10 text-white rounded-[32px] p-8 outline-none max-w-[550px]" dir="rtl">
          {selectedAccount && (
            <>
              <DialogHeader className="text-right">
                <div className="flex items-center gap-3 mb-2">
                  <BankLogo name={selectedAccount.name} size="lg" />
                  <div>
                    <DialogTitle className="text-2xl font-black text-white">{selectedAccount.name}</DialogTitle>
                    <span className="text-xs font-bold text-slate-400">كشف حركات الحساب المالي والتفاصيل بالوقت</span>
                  </div>
                </div>
              </DialogHeader>

              {/* Account Quick Stats */}
              <div className="grid grid-cols-3 gap-3 my-5 p-4 bg-black/20 rounded-2xl border border-white/5">
                <div className="text-center">
                  <span className="text-[10px] font-bold text-slate-500 block">رصيد الحساب</span>
                  <span className="text-sm font-black text-white tabular-nums">{formatCurrency(selectedAccount.balance)}</span>
                </div>
                <div className="text-center border-r border-white/5">
                  <span className="text-[10px] font-bold text-slate-500 block text-emerald-500">إجمالي الإيداع</span>
                  <span className="text-sm font-black text-emerald-400 tabular-nums">+{formatCurrency(accountStats.income)}</span>
                </div>
                <div className="text-center border-r border-white/5">
                  <span className="text-[10px] font-bold text-slate-500 block text-red-500">إجمالي السحب</span>
                  <span className="text-sm font-black text-red-400 tabular-nums">-{formatCurrency(accountStats.expense)}</span>
                </div>
              </div>

              {/* Transactions List */}
              <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                <h4 className="text-xs font-bold text-slate-400 mb-2">الحركات المالية الأخيرة:</h4>
                {accountTransactions.length === 0 ? (
                  <div className="text-center py-10 text-xs text-slate-500">
                    لا توجد حركات مسجلة لهذا الحساب.
                  </div>
                ) : (
                  accountTransactions.map(tx => {
                    const cat = getCategoryInfo(tx.category, tx.type);
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
                              <span className="flex items-center gap-0.5"><Calendar className="w-3 h-3" /> {txDate.toLocaleDateString('ar-EG-u-nu-latn', { day: 'numeric', month: 'short' })}</span>
                              <span>•</span>
                              <span className="flex items-center gap-0.5">
                                <Clock className="w-3 h-3" /> 
                                {txDate.toLocaleTimeString('ar-EG-u-nu-latn', { hour: '2-digit', minute: '2-digit', hour12: true })}
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
              {selectedAccount.type === 'bank' && (selectedAccount.accountNum || selectedAccount.iban) && (
                <div className="mt-5 pt-4 border-t border-white/5 text-xs text-slate-400 flex flex-col gap-2">
                  {selectedAccount.accountNum && (
                    <div className="flex justify-between items-center bg-black/20 p-2.5 rounded-xl border border-white/5">
                      <span className="text-[10px] font-bold text-slate-500">رقم الحساب المحلي:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-[11px] text-slate-300">{selectedAccount.accountNum}</span>
                        <button
                          onClick={(e) => handleCopy(selectedAccount.accountNum, 'رقم الحساب', e)}
                          className="p-1 rounded text-slate-500 hover:text-white transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                  {selectedAccount.iban && (
                    <div className="flex justify-between items-center bg-black/20 p-2.5 rounded-xl border border-white/5">
                      <span className="text-[10px] font-bold text-slate-500">رقم الحساب الدولي (IBAN):</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-[10px] text-slate-300">{selectedAccount.iban}</span>
                        <button
                          onClick={(e) => handleCopy(selectedAccount.iban, 'IBAN', e)}
                          className="p-1 rounded text-slate-500 hover:text-white transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
