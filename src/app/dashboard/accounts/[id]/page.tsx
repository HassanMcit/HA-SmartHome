'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  accountsApi, 
  transactionsApi, 
  Account, 
  Transaction, 
  formatCurrency, 
  getCategoryInfo 
} from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  ArrowLeft, 
  Trash2, 
  Calendar, 
  Clock, 
  Copy, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Info,
  Search,
  SlidersHorizontal,
  Loader2
} from 'lucide-react';
import BankLogo, { getTranslatedBankName } from '@/components/BankLogo';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function AccountDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { user } = useAuth();
  const { lang } = useLanguage();

  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState({ income: 0, expense: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  
  // Custom delete account dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchAccountData = async () => {
    try {
      setLoading(true);
      const [accData, txData] = await Promise.all([
        accountsApi.getById(id),
        transactionsApi.getAll()
      ]);

      setAccount(accData);
      
      // Filter transactions for this specific account
      const filteredTx = txData.filter(t => t.accountId === id);
      setTransactions(filteredTx);
      setFilteredTransactions(filteredTx);

      // Compute stats locally for this account
      let totalIncome = 0;
      let totalExpense = 0;
      filteredTx.forEach(t => {
        if (t.type === 'income') {
          totalIncome += t.amount;
        } else {
          totalExpense += t.amount;
        }
      });
      setStats({ income: totalIncome, expense: totalExpense });

    } catch (err: any) {
      toast.error(lang === 'ar' ? 'حدث خطأ أثناء تحميل تفاصيل الحساب' : 'Error loading account details');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && id) {
      fetchAccountData();
    }
  }, [user, id]);

  // Handle Search and Filters
  useEffect(() => {
    let result = [...transactions];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(t => {
        const catInfo = getCategoryInfo(t.category, t.type);
        return (
          (t.description && t.description.toLowerCase().includes(q)) ||
          catInfo.label.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
        );
      });
    }

    if (typeFilter !== 'all') {
      result = result.filter(t => t.type === typeFilter);
    }

    setFilteredTransactions(result);
  }, [searchQuery, typeFilter, transactions]);

  // Copy helper
  const handleCopy = (text: string, label: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    toast.success(lang === 'ar' ? `تم نسخ ${label} إلى الحافظة` : `${label} copied to clipboard`);
  };

  // Delete Account
  const handleDeleteAccount = async () => {
    if (!account) return;
    setDeleting(true);
    try {
      await accountsApi.delete(account.id);
      toast.success(lang === 'ar' ? 'تم حذف الحساب المالي بنجاح' : 'Account deleted successfully');
      setDeleteDialogOpen(false);
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message || (lang === 'ar' ? 'حدث خطأ أثناء حذف الحساب' : 'Error deleting account'));
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
          {lang === 'ar' ? 'جاري تحميل تفاصيل الحساب' : 'Loading Account Details'}
        </p>
      </div>
    );
  }

  if (!account) return null;

  const isBank = account.type === 'bank';
  const isWallet = account.type === 'wallet';
  const translatedName = getTranslatedBankName(account.name, lang);
  const typeLabel = isBank 
    ? (lang === 'ar' ? 'حساب بنكي' : 'Bank Account') 
    : isWallet 
    ? (lang === 'ar' ? 'محفظة إلكترونية' : 'Mobile Wallet') 
    : (lang === 'ar' ? 'نقد كاش' : 'Cash');

  return (
    <div className="flex flex-col gap-6 pb-20 animate-fade-in text-right" dir="rtl">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold bg-white/5 px-4 py-2 rounded-xl border border-white/5"
        >
          <ArrowLeft className="w-4 h-4 rotate-180" />
          {lang === 'ar' ? 'العودة للرئيسية' : 'Back to Dashboard'}
        </button>

        <button 
          onClick={() => setDeleteDialogOpen(true)}
          className="flex items-center gap-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all text-sm font-bold px-4 py-2 rounded-xl border border-red-500/10 active:scale-95"
        >
          <Trash2 className="w-4 h-4" />
          {lang === 'ar' ? 'حذف الحساب' : 'Delete Account'}
        </button>
      </div>

      {/* Account Card Detail Panel */}
      <div className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <BankLogo name={account.name} size="lg" className="w-16 h-16 rounded-[24px]" />
          <div className="text-right">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-2xl font-black text-white">{translatedName}</h2>
              {account.alias && (
                <span className="text-xs bg-indigo-500/25 text-indigo-300 font-extrabold px-3 py-1 rounded-lg">
                  {account.alias}
                </span>
              )}
              {account.subType === 'deposit' && (
                <span className="text-xs bg-emerald-500/20 text-emerald-400 font-extrabold px-3 py-1 rounded-lg">
                  {lang === 'ar' ? 'وديعة بنكية / شهادة' : 'CD / Deposit'}
                </span>
              )}
            </div>
            <span className="text-xs font-bold text-slate-500 mt-1 block">{typeLabel}</span>
          </div>
        </div>

        {/* Account credentials */}
        {(account.accountNum || account.iban) && (
          <div className="flex flex-col gap-2.5 bg-black/20 p-4 rounded-2xl border border-white/5 min-w-[260px]" dir="rtl">
            {account.accountNum && (
              <div className="flex justify-between items-center gap-4">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider min-w-[90px] text-right shrink-0">
                  {isWallet ? (lang === 'ar' ? 'رقم الهاتف:' : 'Phone No:') : (lang === 'ar' ? 'رقم الحساب:' : 'Account No:')}
                </span>
                <div className="flex items-center gap-2" dir="ltr">
                  <button 
                    onClick={(e) => handleCopy(account.accountNum!, isWallet ? 'رقم الهاتف' : 'رقم الحساب', e)}
                    className="p-1 rounded text-slate-500 hover:text-white transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono text-xs font-bold text-slate-300">{account.accountNum}</span>
                </div>
              </div>
            )}
            {isBank && account.iban && (
              <div className="flex justify-between items-center gap-4 border-t border-white/5 pt-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider min-w-[90px] text-right shrink-0">
                  IBAN:
                </span>
                <div className="flex items-center gap-2" dir="ltr">
                  <button 
                    onClick={(e) => handleCopy(account.iban!, 'IBAN', e)}
                    className="p-1 rounded text-slate-500 hover:text-white transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono text-xs font-bold text-slate-300">{account.iban}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Certificate of Deposit details if applicable */}
      {account.subType === 'deposit' && (
        <div className="glass-card p-6 bg-gradient-to-br from-indigo-950/20 via-slate-900/35 to-slate-900/30 border-indigo-500/10 flex flex-col gap-4">
          <h3 className="text-sm font-black text-indigo-400 flex items-center gap-2 border-b border-white/5 pb-3">
            <Info className="w-4 h-4" />
            {lang === 'ar' ? 'تفاصيل وديعة شهادة الادخار' : 'Certificate of Deposit Details'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-black/20 p-4 rounded-xl border border-white/5 text-center">
              <span className="text-[10px] font-bold text-slate-500 block mb-1">{lang === 'ar' ? 'المبلغ المودع الأساسي' : 'Deposit Principal'}</span>
              <span className="text-lg font-black text-white">{formatCurrency(account.depositAmount || 0)}</span>
            </div>
            <div className="bg-black/20 p-4 rounded-xl border border-white/5 text-center">
              <span className="text-[10px] font-bold text-slate-500 block mb-1">{lang === 'ar' ? 'الفائدة السنوية' : 'Annual Interest Rate'}</span>
              <span className="text-lg font-black text-emerald-400">{account.interestRate}%</span>
            </div>
            <div className="bg-black/20 p-4 rounded-xl border border-white/5 text-center">
              <span className="text-[10px] font-bold text-slate-500 block mb-1">{lang === 'ar' ? 'يوم الاستحقاق الشهري' : 'Monthly Payout Day'}</span>
              <span className="text-lg font-black text-amber-400">{lang === 'ar' ? `يوم ${account.interestDay} في الشهر` : `Day ${account.interestDay} monthly`}</span>
            </div>
          </div>
        </div>
      )}

      {/* Account Balance Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 block mb-1">{lang === 'ar' ? 'الرصيد الحالي' : 'Current Balance'}</span>
            <span className="text-3xl font-black text-white tabular-nums">{formatCurrency(account.balance)}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 block mb-1">{lang === 'ar' ? 'إجمالي الإيداعات' : 'Total Income'}</span>
            <span className="text-3xl font-black text-emerald-400 tabular-nums">+{formatCurrency(stats.income)}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 block mb-1">{lang === 'ar' ? 'إجمالي السحوبات' : 'Total Expenses'}</span>
            <span className="text-3xl font-black text-red-500 tabular-nums">-{formatCurrency(stats.expense)}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-400">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Statement and Transactions Panel */}
      <div className="glass-card overflow-hidden flex flex-col gap-5 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/5">
          <h3 className="font-bold text-lg text-white">
            {lang === 'ar' ? 'كشف الحركات المالية للمستند' : 'Account Statement'}
          </h3>
          
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:flex-none">
              <input
                type="text"
                placeholder={lang === 'ar' ? 'البحث في الحركات...' : 'Search statement...'}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 h-11 bg-[#242444] border border-[#2d2d5e] focus:border-indigo-500 text-white rounded-xl pr-10 pl-4 outline-none text-xs font-semibold placeholder:text-slate-500 transition-all text-right"
              />
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            </div>

            {/* Type filters */}
            <div className="flex bg-black/20 p-1 rounded-xl border border-white/5">
              {(['all', 'income', 'expense'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setTypeFilter(f)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                    typeFilter === f 
                      ? "bg-indigo-600 text-white shadow" 
                      : "text-slate-400 hover:text-white"
                  )}
                >
                  {f === 'all' 
                    ? (lang === 'ar' ? 'الكل' : 'All') 
                    : f === 'income' 
                    ? (lang === 'ar' ? 'إيداع' : 'Deposit') 
                    : (lang === 'ar' ? 'سحب' : 'Withdrawal')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Transactions list */}
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <span className="text-sm font-bold block mb-1">
              {lang === 'ar' ? 'لا توجد حركات مالية مطابقة' : 'No matching transactions'}
            </span>
            <span className="text-xs">
              {lang === 'ar' ? 'يرجى تجربة فلتر أو كلمة بحث أخرى' : 'Try searching for something else'}
            </span>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map(tx => {
              const cat = getCategoryInfo(tx.category, tx.type);
              const isIncome = tx.type === 'income';
              const txDate = new Date(tx.date);

              return (
                <div
                  key={tx.id}
                  className="flex justify-between items-center p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-white/10 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-lg transition-transform group-hover:scale-105',
                        isIncome ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                      )}
                    >
                      {cat.icon}
                    </div>
                    <div className="text-right">
                      <p className="text-sm sm:text-base font-bold text-slate-100 mb-0.5">
                        {tx.description || cat.label}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {txDate.toLocaleDateString('ar-EG-u-nu-latn')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {txDate.toLocaleTimeString('ar-EG-u-nu-latn', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={cn(
                      'font-black text-base sm:text-lg tabular-nums shrink-0',
                      isIncome ? 'text-emerald-500' : 'text-red-500'
                    )}
                  >
                    {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Custom confirm delete dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-[#1a1a35] border-slate-700 text-white p-8 sm:max-w-[400px] rounded-[32px] outline-none" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          <div className="text-right">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 mb-6">
              <Trash2 className="w-7 h-7" />
            </div>
            <DialogHeader className="text-right">
              <DialogTitle className="text-2xl font-black text-white">
                {lang === 'ar' ? 'حذف الحساب المالي' : 'Delete Financial Account'}
              </DialogTitle>
            </DialogHeader>
            <p className="text-slate-400 text-base font-medium mt-4 leading-relaxed">
              {lang === 'ar' ? (
                <>
                  هل أنت متأكد من حذف حساب <span className="text-white font-bold">"{translatedName}"</span>؟ لا يمكن التراجع عن هذا الإجراء وسيتم حذف الحساب وكافة المعاملات المرتبطة به بالكامل من السجلات المالية.
                </>
              ) : (
                <>
                  Are you sure you want to delete the account <span className="text-white font-bold">"{translatedName}"</span>? This action cannot be undone. All transactions associated with this account will be permanently deleted.
                </>
              )}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row-reverse gap-3">
              <Button 
                className="flex-1 h-14 bg-red-500 hover:bg-red-600 text-white font-black rounded-2xl active:scale-[0.98] transition-all" 
                onClick={handleDeleteAccount}
                disabled={deleting}
              >
                {deleting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (lang === 'ar' ? 'حذف نهائي' : 'Delete permanently')}
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 h-14 border-white/5 bg-transparent text-slate-300 font-bold rounded-2xl hover:bg-white/5 hover:text-white transition-all"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={deleting}
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
