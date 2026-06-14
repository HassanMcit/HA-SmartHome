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
  Pencil,
  Calendar, 
  Clock, 
  Copy, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Info,
  Search,
  SlidersHorizontal,
  Loader2,
  X
} from 'lucide-react';
import BankLogo, { getTranslatedBankName } from '@/components/BankLogo';
import BankSelector from '@/components/BankSelector';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const EGYPTIAN_DENOMINATIONS = ['200', '100', '50', '20', '10', '5', '1', '0.5'];

const getBanknoteStyle = (denom: string) => {
  switch (denom) {
    case '200':
      return {
        bg: 'bg-gradient-to-br from-[#cfc797] via-[#b2a568] to-[#8d8040] border-[#ebd68f]/50 shadow-[inset_0_1px_3px_rgba(255,255,255,0.4),0_4px_8px_rgba(0,0,0,0.4)]',
        text: 'text-[#473e16] font-black',
        labelText: 'text-[#473e16]/60 font-black',
        sign: '٢٠٠',
        arabicText: 'مائتا جنيه',
        watermark: 'bg-[#473e16]/5 border-[#473e16]/10',
        metallic: 'bg-gradient-to-b from-[#ffd700] via-[#d4af37] to-[#ffd700] shadow-[0_0_8px_rgba(255,215,0,0.6)]',
        glow: 'shadow-[0_0_15px_rgba(223,215,167,0.25)]',
      };
    case '100':
      return {
        bg: 'bg-gradient-to-br from-[#cab2ea] via-[#a886d4] to-[#7f5bb2] border-[#dac5f7]/50 shadow-[inset_0_1px_3px_rgba(255,255,255,0.4),0_4px_8px_rgba(0,0,0,0.4)]',
        text: 'text-[#361e59] font-black',
        labelText: 'text-[#361e59]/60 font-black',
        sign: '١٠٠',
        arabicText: 'مائة جنيه',
        watermark: 'bg-[#361e59]/5 border-[#361e59]/10',
        metallic: 'bg-gradient-to-b from-[#c0c0c0] via-[#e6e6e6] to-[#c0c0c0] shadow-[0_0_8px_rgba(192,192,192,0.6)]',
        glow: 'shadow-[0_0_15px_rgba(202,178,234,0.25)]',
      };
    case '50':
      return {
        bg: 'bg-gradient-to-br from-[#d29b7a] via-[#ba7b56] to-[#915030] border-[#fcaea0]/50 shadow-[inset_0_1px_3px_rgba(255,255,255,0.4),0_4px_8px_rgba(0,0,0,0.4)]',
        text: 'text-[#54160c] font-black',
        labelText: 'text-[#54160c]/60 font-black',
        sign: '٥٠',
        arabicText: 'خمسون جنيهاً',
        watermark: 'bg-[#54160c]/5 border-[#54160c]/10',
        metallic: 'bg-gradient-to-b from-[#b87333] via-[#e09a56] to-[#b87333] shadow-[0_0_8px_rgba(184,115,51,0.6)]',
        glow: 'shadow-[0_0_15px_rgba(242,170,155,0.25)]',
      };
    case '20':
      return {
        bg: 'bg-gradient-to-br from-[#aaece5] via-[#7ccfbf] to-[#48a192] border-[#a0f5df]/50 shadow-[inset_0_1px_3px_rgba(255,255,255,0.4),0_4px_8px_rgba(0,0,0,0.4)]',
        text: 'text-[#0a3d31] font-black',
        labelText: 'text-[#0a3d31]/60 font-black',
        sign: '٢٠',
        arabicText: 'عشرين جنيهاً',
        watermark: 'bg-[#0a3d31]/5 border-[#0a3d31]/10',
        metallic: 'bg-gradient-to-b from-[#a3e635] via-[#84cc16] to-[#a3e635] shadow-[0_0_8px_rgba(163,230,53,0.6)]',
        glow: 'shadow-[0_0_15px_rgba(141,230,207,0.25)]',
      };
    case '10':
      return {
        bg: 'bg-gradient-to-br from-[#e8ce97] via-[#cca36a] to-[#9c7540] border-[#fbe5bd]/50 shadow-[inset_0_1px_3px_rgba(255,255,255,0.4),0_4px_8px_rgba(0,0,0,0.4)]',
        text: 'text-[#422e11] font-black',
        labelText: 'text-[#422e11]/60 font-black',
        sign: '١٠',
        arabicText: 'عشرة جنيهات',
        watermark: 'bg-[#422e11]/5 border-[#422e11]/10',
        metallic: 'bg-gradient-to-b from-[#ffd700] via-[#d4af37] to-[#ffd700] shadow-[0_0_8px_rgba(255,215,0,0.6)]',
        glow: 'shadow-[0_0_15px_rgba(236,208,155,0.25)]',
      };
    case '5':
      return {
        bg: 'bg-gradient-to-br from-[#9be5d8] via-[#70ccbe] to-[#469e90] border-[#aeeefb]/50 shadow-[inset_0_1px_3px_rgba(255,255,255,0.4),0_4px_8px_rgba(0,0,0,0.4)]',
        text: 'text-[#0e3b42] font-black',
        labelText: 'text-[#0e3b42]/60 font-black',
        sign: '٥',
        arabicText: 'خمسة جنيهات',
        watermark: 'bg-[#0e3b42]/5 border-[#0e3b42]/10',
        metallic: 'bg-gradient-to-b from-[#c0c0c0] via-[#e6e6e6] to-[#c0c0c0] shadow-[0_0_8px_rgba(192,192,192,0.6)]',
        glow: 'shadow-[0_0_15px_rgba(139,213,227,0.25)]',
      };
    case '1':
      return {
        bg: 'bg-gradient-to-br from-[#e0caaa] via-[#c2aa88] to-[#99805e] border-[#ebd9c2]/50 shadow-[inset_0_1px_3px_rgba(255,255,255,0.4),0_4px_8px_rgba(0,0,0,0.4)]',
        text: 'text-[#3b2d1c] font-black',
        labelText: 'text-[#3b2d1c]/60 font-black',
        sign: '١',
        arabicText: 'جنيه واحد',
        watermark: 'bg-[#3b2d1c]/5 border-[#3b2d1c]/10',
        metallic: 'bg-gradient-to-b from-[#b87333] via-[#a0522d] to-[#b87333] shadow-[0_0_4px_rgba(184,115,51,0.4)]',
        glow: 'shadow-[0_0_15px_rgba(224,202,170,0.25)]',
      };
    case '0.5':
      return {
        bg: 'bg-gradient-to-br from-[#bdd9a5] via-[#a0bd88] to-[#799464] border-[#d8ebb8]/50 shadow-[inset_0_1px_3px_rgba(255,255,255,0.4),0_4px_8px_rgba(0,0,0,0.4)]',
        text: 'text-[#2a381e] font-black',
        labelText: 'text-[#2a381e]/60 font-black',
        sign: '٠.٥',
        arabicText: 'نصف جنيه',
        watermark: 'bg-[#2a381e]/5 border-[#2a381e]/10',
        metallic: 'bg-gradient-to-b from-[#c0c0c0] via-[#dcdcdc] to-[#c0c0c0] shadow-[0_0_4px_rgba(192,192,192,0.4)]',
        glow: 'shadow-[0_0_15px_rgba(189,217,165,0.25)]',
      };
    default:
      return {
        bg: 'bg-emerald-500/15 border-emerald-500/20',
        text: 'text-emerald-400 font-bold',
        labelText: 'text-emerald-400/60 font-bold',
        sign: denom,
        arabicText: denom,
        watermark: 'bg-white/5 border-white/10',
        metallic: '',
        glow: '',
      };
  }
};

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

  // Edit Account Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
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
    setEditBalance(String(total));
  };

  useEffect(() => {
    if (account) {
      setEditName(account.name);
      setEditAlias(account.alias || '');
      setEditAccountNum(account.accountNum || '');
      setEditIban(account.iban || '');
      setEditBalance(String(account.balance));
      setEditSubType((account.subType as 'current' | 'deposit') || 'current');
      setEditDepositAmount(account.depositAmount !== null && account.depositAmount !== undefined ? String(account.depositAmount) : '');
      setEditInterestRate(account.interestRate !== null && account.interestRate !== undefined ? String(account.interestRate) : '');
      setEditInterestDay(account.interestDay !== null && account.interestDay !== undefined ? String(account.interestDay) : '');
      setEditDenominations((account.denominations as Record<string, number>) || {});
    }
  }, [account]);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return;
    if (account.type !== 'cash' && !editName) {
      toast.error(lang === 'ar' ? 'يرجى تحديد اسم الحساب المالي' : 'Please specify account name');
      return;
    }

    setEditSubmitting(true);
    try {
      const payload: any = {
        name: account.type === 'cash' ? 'كاش' : editName,
        balance: parseFloat(editBalance) || 0,
        alias: editAlias || null,
      };

      if (account.type === 'bank') {
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
      } else if (account.type === 'wallet') {
        payload.accountNum = editAccountNum || null;
      } else if (account.type === 'cash') {
        payload.denominations = editDenominations;
      }

      await accountsApi.update(account.id, payload);
      toast.success(lang === 'ar' ? 'تم تعديل الحساب بنجاح! 💳' : 'Account updated successfully! 💳');
      setEditDialogOpen(false);
      fetchAccountData(); // Reload the data
    } catch (err: any) {
      toast.error(err.message || (lang === 'ar' ? 'حدث خطأ أثناء تعديل الحساب' : 'Error updating account'));
    } finally {
      setEditSubmitting(false);
    }
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <button 
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold bg-white/5 px-4 py-2.5 rounded-xl border border-white/5 w-full sm:w-auto justify-center sm:justify-start active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 rotate-180" />
          {lang === 'ar' ? 'العودة للرئيسية' : 'Back to Dashboard'}
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            onClick={() => setEditDialogOpen(true)}
            className="flex items-center justify-center gap-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all text-xs sm:text-sm font-bold px-3 sm:px-4 py-2.5 rounded-xl border border-indigo-500/10 active:scale-95 flex-1 sm:flex-none"
          >
            <Pencil className="w-4 h-4 shrink-0" />
            <span>{lang === 'ar' ? 'تعديل الحساب' : 'Edit Account'}</span>
          </button>
          <button 
            onClick={() => setDeleteDialogOpen(true)}
            className="flex items-center justify-center gap-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all text-xs sm:text-sm font-bold px-3 sm:px-4 py-2.5 rounded-xl border border-red-500/10 active:scale-95 flex-1 sm:flex-none"
          >
            <Trash2 className="w-4 h-4 shrink-0" />
            <span>{lang === 'ar' ? 'حذف الحساب' : 'Delete Account'}</span>
          </button>
        </div>
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
          <div className="flex flex-col gap-3 bg-black/20 p-4 rounded-2xl border border-white/5 w-full md:w-auto overflow-x-auto" dir="rtl">
            {account.accountNum && (
              <div className="flex flex-col gap-1 text-right">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  {isWallet ? (lang === 'ar' ? 'رقم الهاتف:' : 'Phone No:') : (lang === 'ar' ? 'رقم الحساب:' : 'Account No:')}
                </span>
                <div className="flex items-center justify-between gap-2 w-full" dir="ltr">
                  <span className="font-mono text-xs font-bold text-slate-300 break-all select-all">{account.accountNum}</span>
                  <button 
                    onClick={(e) => handleCopy(account.accountNum!, isWallet ? 'رقم الهاتف' : 'رقم الحساب', e)}
                    className="p-1 rounded text-slate-500 hover:text-white transition-colors shrink-0"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
            {isBank && account.iban && (
              <div className="flex flex-col gap-1 border-t border-white/5 pt-2 text-right">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  IBAN:
                </span>
                <div className="flex items-center justify-between gap-2 w-full" dir="ltr">
                  <span className="font-mono text-xs font-bold text-slate-300 break-all select-all">{account.iban}</span>
                  <button 
                    onClick={(e) => handleCopy(account.iban!, 'IBAN', e)}
                    className="p-1 rounded text-slate-500 hover:text-white transition-colors shrink-0"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
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

      {/* Cash Denominations Breakdown Panel */}
      {account.type === 'cash' && (
        <div className="glass-card p-6 flex flex-col gap-4">
          <h3 className="text-sm font-black text-indigo-400 flex items-center gap-2 border-b border-white/5 pb-3">
            <DollarSign className="w-4 h-4" />
            {lang === 'ar' ? 'توزيع الفئات النقدية (الكاش)' : 'Cash Denominations Breakdown'}
          </h3>
          {(!account.denominations || Object.keys(account.denominations).length === 0 || Object.values(account.denominations).every(v => v === 0)) ? (
            <div className="text-center py-6 text-slate-500 text-xs font-bold">
              {lang === 'ar' 
                ? 'لا يوجد توزيع للفئات النقدية حالياً. يمكنك تعديل الحساب لتسجيل عدد الفئات وتحديث الرصيد تلقائياً.' 
                : 'No cash breakdown registered yet. You can edit the account to log the denominations.'}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {EGYPTIAN_DENOMINATIONS.map(denom => {
                const count = ((account.denominations as Record<string, number>) || {})[denom] || 0;
                const value = parseFloat(denom) * count;
                return (
                  <div key={denom} className="bg-black/10 dark:bg-black/30 p-3 rounded-2xl border border-white/5 flex flex-col items-center justify-between gap-3 shadow-inner hover:border-indigo-500/10 transition-colors">
                    {/* Realistic Banknote Card */}
                    {(() => {
                      const style = getBanknoteStyle(denom);
                      return (
                        <div className={cn(
                          "shrink-0 w-28 h-16 rounded-xl border relative overflow-hidden flex flex-col justify-between p-2 shadow-md shadow-black/45 transition-all hover:scale-105 select-none",
                          style.bg,
                          style.glow
                        )}>
                          {/* Fine banknote background texture */}
                          <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:4px_4px]" />

                          {/* Geometric watermark pattern */}
                          <div className="absolute right-1 bottom-1 w-8 h-8 opacity-[0.07] pointer-events-none">
                            <svg viewBox="0 0 24 24" className="w-full h-full fill-current">
                              <path d="M12 2L14.8 7.6L21 8.5L16.5 12.9L17.6 19L12 16.1L6.4 19L7.5 12.9L3 8.5L9.2 7.6L12 2Z" />
                            </svg>
                          </div>

                          {/* Mosque and Minaret Silhouette Watermark */}
                          <div className="absolute left-6 bottom-0.5 w-12 h-10 opacity-[0.08] pointer-events-none">
                            <svg viewBox="0 0 100 80" className="w-full h-full fill-current">
                              <path d="M 50,70 C 50,45 60,35 70,35 C 80,35 90,45 90,70 Z" />
                              <path d="M 30,70 L 34,70 L 34,20 L 32,15 L 30,20 Z" />
                              <path d="M 30,35 L 34,35" />
                              <path d="M 30,50 L 34,50" />
                            </svg>
                          </div>

                          {/* Metallic security thread */}
                          {style.metallic && (
                            <div className={cn("absolute top-0 bottom-0 left-[25%] w-0.5 z-10", style.metallic)} />
                          )}

                          {/* Top Row: Arabic calligraphic style bank label + Denomination */}
                          <div className="flex justify-between items-start w-full leading-none z-20">
                            <span className="text-[7px] font-bold tracking-tight opacity-75" style={{ color: 'rgba(0,0,0,0.6)' }}>
                              البنك المركزي المصري
                            </span>
                            <span className={cn("text-xs font-black tracking-tight", style.text)}>
                              {denom}
                            </span>
                          </div>

                          {/* Middle Row: Large Arabic numeral watermark */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10">
                            <span className={cn("text-[20px] font-black opacity-[0.12]", style.text)}>
                              {style.sign}
                            </span>
                          </div>

                          {/* Bottom Row: EGP + Arabic denomination label */}
                          <div className="flex justify-between items-end w-full leading-none z-20">
                            <span className="text-[7px] font-extrabold tracking-tighter uppercase opacity-60" style={{ color: 'rgba(0,0,0,0.6)' }}>
                              EGP
                            </span>
                            <span className={cn("text-[8px] font-black", style.text)}>
                              {style.arabicText}
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                    <div className="text-center flex flex-col gap-0.5">
                      <span className="text-xs font-black text-slate-800 dark:text-white">{count} <span className="text-[9px] font-normal text-slate-500">{lang === 'ar' ? 'ورقات' : 'notes'}</span></span>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{formatCurrency(value)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

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
                className="bills-input w-full sm:w-64 h-11 rounded-xl pr-10 pl-4 text-xs font-semibold transition-all text-right"
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
                  className="flex justify-between items-center p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-white/10 transition-all group gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-lg transition-transform group-hover:scale-105 shrink-0',
                        isIncome ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                      )}
                    >
                      {cat.icon}
                    </div>
                    <div className="text-right min-w-0 flex-1">
                      <p className="text-sm sm:text-base font-bold text-slate-200 mb-0.5 truncate">
                        {tx.description || cat.label}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1 shrink-0">
                          <Calendar className="w-3.5 h-3.5" />
                          {txDate.toLocaleDateString('ar-EG-u-nu-latn')}
                        </span>
                        <span className="flex items-center gap-1 shrink-0">
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
        <DialogContent className="p-8 sm:max-w-[400px] rounded-[32px] outline-none" style={{ background: 'var(--card)', color: 'var(--card-foreground)', borderColor: 'var(--border)' }} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          <div className="text-right">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 mb-6">
              <Trash2 className="w-7 h-7" />
            </div>
            <DialogHeader className="text-right">
              <DialogTitle className="text-2xl font-black" style={{ color: 'var(--foreground)' }}>
                {lang === 'ar' ? 'حذف الحساب المالي' : 'Delete Financial Account'}
              </DialogTitle>
            </DialogHeader>
            <p className="text-base font-medium mt-4 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
              {lang === 'ar' ? (
                <>
                  هل أنت متأكد من حذف حساب <span className="font-bold" style={{ color: 'var(--foreground)' }}>"{translatedName}"</span>؟ لا يمكن التراجع عن هذا الإجراء وسيتم حذف الحساب وكافة المعاملات المرتبطة به بالكامل من السجلات المالية.
                </>
              ) : (
                <>
                  Are you sure you want to delete the account <span className="font-bold" style={{ color: 'var(--foreground)' }}>"{translatedName}"</span>? This action cannot be undone. All transactions associated with this account will be permanently deleted.
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
                className="flex-1 h-14 font-bold rounded-2xl transition-all"
                style={{ borderColor: 'var(--border)', background: 'transparent', color: 'var(--foreground)' }}
                onClick={() => setDeleteDialogOpen(false)}
                disabled={deleting}
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Account Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="rounded-[24px] sm:rounded-[32px] p-5 sm:p-8 outline-none max-w-[460px] max-h-[90vh] overflow-y-auto custom-scrollbar" style={{ background: 'var(--card)', color: 'var(--card-foreground)', borderColor: 'var(--border)' }} dir="rtl">
          <DialogHeader className="text-right">
            <DialogTitle className="text-2xl font-black mb-4" style={{ color: 'var(--foreground)' }}>
              {lang === 'ar' ? 'تعديل الحساب المالي' : 'Edit Financial Account'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-6">
            {account.type === 'bank' && (
              <>
                <div className="space-y-2 text-right">
                  <Label className="text-xs font-bold text-slate-400">{lang === 'ar' ? 'اختر البنك' : 'Select Bank'}</Label>
                  <BankSelector
                    selectedName={editName}
                    onSelect={setEditName}
                    type="bank"
                  />
                </div>

                <div className="space-y-2 text-right">
                  <Label className="text-xs font-bold text-slate-400">{lang === 'ar' ? 'اسم الحساب المخصص (اختياري)' : 'Account Alias (Optional)'}</Label>
                  <Input
                    placeholder={lang === 'ar' ? 'مثال: حساب التوفير، مرتب...' : 'e.g. Savings account...'}
                    value={editAlias}
                    onChange={e => setEditAlias(e.target.value)}
                    className="h-11" style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  />
                </div>

                <div className="space-y-2 text-right">
                  <Label className="text-xs font-bold text-slate-400">{lang === 'ar' ? 'نوع الحساب البنكي' : 'Bank Account Type'}</Label>
                  <div className="flex gap-2 p-1 bg-black/10 rounded-xl border border-white/5">
                    <button
                      key="current"
                      type="button"
                      onClick={() => setEditSubType('current')}
                      className={cn(
                        'flex-1 py-2 rounded-lg font-bold text-[11px] transition-all',
                        editSubType === 'current'
                          ? 'bg-indigo-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      )}
                    >
                      {lang === 'ar' ? 'حساب جاري / توفير عادي' : 'Current / Savings Account'}
                    </button>
                    <button
                      key="deposit"
                      type="button"
                      onClick={() => setEditSubType('deposit')}
                      className={cn(
                        'flex-1 py-2 rounded-lg font-bold text-[11px] transition-all',
                        editSubType === 'deposit'
                          ? 'bg-indigo-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      )}
                    >
                      {lang === 'ar' ? 'وديعة / شهادة ادخار' : 'Certificate of Deposit (وديعة)'}
                    </button>
                  </div>
                </div>

                {editSubType === 'deposit' && (
                  <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/10 space-y-4 animate-fade-in">
                    <div className="space-y-2 text-right">
                      <Label className="text-xs font-bold text-indigo-300">{lang === 'ar' ? 'مبلغ الوديعة الأساسي (ج.م)' : 'Deposit Principal Amount (EGP)'}</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={editDepositAmount}
                        onChange={e => setEditDepositAmount(e.target.value)}
                        className="h-11" style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2 text-right">
                        <Label className="text-xs font-bold text-indigo-300">{lang === 'ar' ? 'نسبة الفائدة السنوية (%)' : 'Annual Interest Rate (%)'}</Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g. 18.5"
                          value={editInterestRate}
                          onChange={e => setEditInterestRate(e.target.value)}
                          className="h-11 text-center" style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                        />
                      </div>
                      <div className="space-y-2 text-right">
                        <Label className="text-xs font-bold text-indigo-300">{lang === 'ar' ? 'يوم صرف الفائدة شهرياً' : 'Payout Day of Month'}</Label>
                        <Input
                          type="number"
                          min="1"
                          max="31"
                          placeholder="e.g. 25"
                          value={editInterestDay}
                          onChange={e => setEditInterestDay(e.target.value)}
                          className="h-11 text-center" style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
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
                      value={editAccountNum}
                      onChange={e => setEditAccountNum(e.target.value)}
                      className="h-11" style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    />
                  </div>
                  <div className="space-y-2 text-right">
                    <Label className="text-xs font-bold text-slate-400">{lang === 'ar' ? 'الرصيد' : 'Balance'}</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={editBalance}
                      onChange={e => setEditBalance(e.target.value)}
                      className="h-11 text-center" style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    />
                  </div>
                </div>

                <div className="space-y-2 text-right">
                  <Label className="text-xs font-bold text-slate-400">{lang === 'ar' ? 'رقم الحساب الدولي (IBAN)' : 'IBAN'}</Label>
                  <Input
                     placeholder="EG00 0000 0000 0000 0000 0000 0"
                     value={editIban}
                     onChange={e => setEditIban(e.target.value)}
                     className="h-11 text-left uppercase"
                     style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                     dir="ltr"
                  />
                </div>
              </>
            )}

            {account.type === 'wallet' && (
              <>
                <div className="space-y-2 text-right">
                  <Label className="text-xs font-bold text-slate-400">{lang === 'ar' ? 'اختر المحفظة الإلكترونية' : 'Select Mobile Wallet'}</Label>
                  <BankSelector
                    selectedName={editName}
                    onSelect={setEditName}
                    type="wallet"
                  />
                </div>

                <div className="space-y-2 text-right">
                  <Label className="text-xs font-bold text-slate-400">{lang === 'ar' ? 'اسم المحفظة المخصص (اختياري)' : 'Wallet Alias (Optional)'}</Label>
                  <Input
                    placeholder={lang === 'ar' ? 'مثال: محفظتي الأساسية، الكاش...' : 'e.g. My primary wallet...'}
                    value={editAlias}
                    onChange={e => setEditAlias(e.target.value)}
                    className="h-11" style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 text-right">
                    <Label className="text-xs font-bold text-slate-400">{lang === 'ar' ? 'رقم الهاتف للمحفظة' : 'Wallet Phone No'}</Label>
                    <Input
                      placeholder="01xxxxxxxxx"
                      value={editAccountNum}
                      onChange={e => setEditAccountNum(e.target.value)}
                      className="h-11" style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    />
                  </div>
                  <div className="space-y-2 text-right">
                    <Label className="text-xs font-bold text-slate-400">{lang === 'ar' ? 'الرصيد' : 'Balance'}</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={editBalance}
                      onChange={e => setEditBalance(e.target.value)}
                      className="h-11 text-center" style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    />
                  </div>
                </div>
              </>
            )}

            {account.type === 'cash' && (
              <>
                <div className="space-y-2 text-right">
                  <Label className="text-xs font-bold text-slate-400">{lang === 'ar' ? 'اسم الحساب المخصص' : 'Account Alias'}</Label>
                  <Input
                    placeholder={lang === 'ar' ? 'كاش' : 'Cash'}
                    value={editAlias}
                    onChange={e => setEditAlias(e.target.value)}
                    className="h-11" style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  />
                </div>

                <div className="space-y-2 text-right">
                  <Label className="text-xs font-bold text-slate-400">{lang === 'ar' ? 'الرصيد النقدي الحالي' : 'Current Cash Balance'}</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={editBalance}
                    onChange={e => setEditBalance(e.target.value)}
                    className="h-11 font-bold" style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  />
                </div>

                <div className="space-y-3 border border-white/5 bg-transparent p-4 rounded-2xl">
                  <Label className="text-xs font-bold text-slate-400 block mb-2">{lang === 'ar' ? 'توزيع الفئات النقدية' : 'Cash Denominations'}</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {EGYPTIAN_DENOMINATIONS.map(denom => (
                      <div key={denom} className="flex items-center justify-between gap-3 bg-white/5 px-4 py-3 rounded-xl border border-white/5">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {/* Mini Banknote Card */}
                          {(() => {
                            const style = getBanknoteStyle(denom);
                            return (
                              <div className={cn(
                                "shrink-0 w-16 h-10 rounded-md border relative overflow-hidden flex flex-col justify-between p-1 transition-all duration-300",
                                style.bg,
                                style.glow
                              )}>
                                {/* Metallic security thread */}
                                {style.metallic && (
                                  <div className={cn("absolute top-0 bottom-0 left-[25%] w-0.5 z-10", style.metallic)} />
                                )}
                                
                                {/* Watermark circular window */}
                                <div className={cn("absolute right-2 top-1.5 w-4 h-4 rounded-full border flex items-center justify-center opacity-40", style.watermark)}>
                                  <span className="text-[4px] font-black select-none pointer-events-none opacity-20">CBE</span>
                                </div>

                                {/* Background large value watermark */}
                                <div className="absolute left-1 bottom-0.5 text-[14px] font-black opacity-[0.08] leading-none pointer-events-none select-none">
                                  {style.sign}
                                </div>

                                {/* Top row: currency + denomination */}
                                <div className="flex justify-between items-center w-full leading-none z-20">
                                  <span className="text-[5px] font-black uppercase tracking-tighter" style={{ color: 'rgba(0,0,0,0.45)' }}>EGP</span>
                                  <span className={cn("text-[9px] font-black leading-none", style.text)}>{denom}</span>
                                </div>
                                <div className="flex justify-between items-end w-full leading-none">
                                  <span className={cn("text-[8px] font-black leading-none", style.text)}>{style.sign}</span>
                                  <span className="text-[5px] font-bold opacity-35 leading-none">{lang === 'ar' ? 'المركزي' : 'CBE'}</span>
                                </div>
                              </div>
                            );
                          })()}
                          <span className="text-xs font-semibold text-slate-300 truncate">
                            {lang === 'ar' 
                              ? (denom === '0.5' ? 'نصف جنيه' : `${denom} جنيه`) 
                              : `${denom} EGP`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] text-slate-500 font-bold">{lang === 'ar' ? 'عدد' : 'qty'}</span>
                          <Input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={editDenominations[denom] || ''}
                            onChange={e => handleDenominationChange(denom, e.target.value)}
                            className="h-9 w-20 text-center text-sm font-bold"
                            style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-3 pt-4 border-t border-white/5">
              <Button
                type="submit"
                disabled={editSubmitting}
                className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg active:scale-95 transition-all text-sm"
              >
                {editSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (lang === 'ar' ? 'حفظ التعديلات' : 'Save Changes')}
              </Button>
              <Button
                type="button"
                onClick={() => setEditDialogOpen(false)}
                disabled={editSubmitting}
                variant="outline"
                className="flex-1 h-12 rounded-xl text-sm"
                style={{ borderColor: 'var(--border)', background: 'transparent', color: 'var(--foreground)' }}
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
