'use client';

import { useEffect, useState } from 'react';
import { transactionsApi, adminApi, accountsApi, Account, Transaction, User, formatCurrency, getCategoryInfo, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowDownRight, ArrowUpRight, Plus, Trash2, Users, Loader2, Activity, Calendar, Tag, AlertCircle, Pencil, ArrowLeftRight } from 'lucide-react';
import BankLogo, { getTranslatedBankName } from '@/components/BankLogo';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function TransactionsPage() {
  const { user: currentUser } = useAuth();
  const { lang } = useLanguage();
  const isAdmin = currentUser?.role === 'admin';

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>(currentUser?.id || '');
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  
  // Form state
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [accountId, setAccountId] = useState<string>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [targetUserId, setTargetUserId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  
  // Transfer form state
  const [transferOpen, setTransferOpen] = useState(false);
  const [fromAccountId, setFromAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferDesc, setTransferDesc] = useState('');
  const [transferDate, setTransferDate] = useState(new Date().toISOString().split('T')[0]);
  const [transferSubmitting, setTransferSubmitting] = useState(false);
  
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; transactionId: string; description: string }>({
    isOpen: false,
    transactionId: '',
    description: '',
  });

  // Edit states
  const [editOpen, setEditOpen] = useState(false);
  const [editingTxId, setEditingTxId] = useState<string | null>(null);
  const [editType, setEditType] = useState<'income' | 'expense'>('expense');
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editAccountId, setEditAccountId] = useState<string>('');
  const [editDate, setEditDate] = useState('');
  const [editTargetUserId, setEditTargetUserId] = useState<string>('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  const handleOpenEdit = (tx: Transaction) => {
    setEditingTxId(tx.id);
    setEditType(tx.type);
    setEditAmount(String(tx.amount));
    setEditCategory(tx.category);
    setEditDescription(tx.description || '');
    setEditDate(new Date(tx.date).toISOString().split('T')[0]);
    setEditTargetUserId(tx.userId);
    setEditAccountId(tx.accountId || '');
    setEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTxId || !editAmount || !editCategory) {
      toast.error('المبلغ والفئة مطلوبان');
      return;
    }
    setEditSubmitting(true);
    try {
      await transactionsApi.update(editingTxId, {
        type: editType,
        amount: parseFloat(editAmount),
        category: editCategory,
        description: editDescription,
        date: editDate,
        targetUserId: editTargetUserId,
        accountId: editAccountId && editAccountId !== 'none' ? editAccountId : undefined,
      });
      toast.success('تم تحديث المعاملة بنجاح');
      setEditOpen(false);
      fetchTransactions();
    } catch (error: any) {
      toast.error(error.message || 'حدث خطأ أثناء التعديل');
    } finally {
      setEditSubmitting(false);
    }
  };

  const fetchUsers = async () => {
    if (!isAdmin) return;
    try {
      const data = await adminApi.getUsers();
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const apiUserId = (selectedUserId === 'all' || !selectedUserId) ? undefined : selectedUserId;
      const data = await transactionsApi.getAll({ userId: apiUserId });
      setTransactions(data || []);
    } catch {
      toast.error('حدث خطأ في تحميل المعاملات');
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const data = await accountsApi.getAll();
      const sortedAccs = (data || []).sort((a: any, b: any) => {
        const typeOrder = { cash: 1, bank: 2, wallet: 3 };
        const orderA = typeOrder[a.type as keyof typeof typeOrder] || 99;
        const orderB = typeOrder[b.type as keyof typeof typeOrder] || 99;
        if (orderA !== orderB) return orderA - orderB;
        return (a.name || '').localeCompare(b.name || '', 'ar');
      });
      setAccounts(sortedAccs);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchUsers();
      fetchAccounts();
      setSelectedUserId(currentUser.id);
    }
  }, [currentUser, isAdmin]);

  useEffect(() => {
    if (selectedUserId) {
      fetchTransactions();
    }
  }, [selectedUserId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !category) {
      toast.error('المبلغ والفئة مطلوبان');
      return;
    }
    
    const selectedUser = users.find(u => u.id === targetUserId);
    console.log(`[Transaction Form] Attempting to save for: ${selectedUser?.name} (ID: ${targetUserId})`);

    setSubmitting(true);
    try {
      await transactionsApi.create({ 
        type, 
        amount: parseFloat(amount), 
        category, 
        description, 
        date,
        targetUserId: targetUserId,
        accountId: accountId && accountId !== 'none' ? accountId : undefined,
      });
      
      toast.success(`تم إضافة معاملة ${selectedUser?.name || ''} بنجاح`);
      setOpen(false);
      setAmount('');
      setDescription('');
      setCategory('');
      setAccountId('');
      setDate(new Date().toISOString().split('T')[0]);
      fetchTransactions();
      fetchAccounts();
    } catch (error: any) {
      toast.error(error.message || 'حدث خطأ أثناء الإضافة');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromAccountId || !toAccountId || !transferAmount) {
      toast.error(lang === 'ar' ? 'يرجى تحديد الحسابات والمبلغ' : 'Please select accounts and amount');
      return;
    }
    if (fromAccountId === toAccountId) {
      toast.error(lang === 'ar' ? 'لا يمكن التحويل لنفس الحساب المالي' : 'Cannot transfer to the same account');
      return;
    }
    setTransferSubmitting(true);
    try {
      await transactionsApi.transfer({
        fromAccountId,
        toAccountId,
        amount: parseFloat(transferAmount),
        description: transferDesc,
        date: transferDate
      });
      toast.success(lang === 'ar' ? 'تمت عملية التحويل المالي بنجاح! 💸' : 'Transfer completed successfully! 💸');
      setTransferOpen(false);
      setFromAccountId('');
      setToAccountId('');
      setTransferAmount('');
      setTransferDesc('');
      setTransferDate(new Date().toISOString().split('T')[0]);
      fetchTransactions();
      fetchAccounts();
    } catch (error: any) {
      toast.error(error.message || (lang === 'ar' ? 'حدث خطأ أثناء إجراء التحويل' : 'Error performing transfer'));
    } finally {
      setTransferSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.transactionId) return;
    try {
      await transactionsApi.delete(deleteDialog.transactionId);
      toast.success('تم حذف المعاملة بنجاح');
      setDeleteDialog({ isOpen: false, transactionId: '', description: '' });
      fetchTransactions();
    } catch {
      toast.error('حدث خطأ أثناء الحذف');
    }
  };

  if (!currentUser) return null;

  const cats = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="flex flex-col gap-8 pb-12 animate-fade-in" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="text-right">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-1 flex items-center gap-3">
              <Activity className="w-8 h-8 text-indigo-400" />
              {lang === 'ar' ? 'المعاملات المالية' : 'Financial Transactions'}
            </h2>
            <p className="text-slate-400 text-sm sm:text-base font-medium">{lang === 'ar' ? 'سجل وراقب كافة تحركاتك المالية' : 'Record and monitor all your financial activities'}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* Transfer Dialog */}
            <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-black rounded-xl px-6 h-12 sm:h-11 font-bold shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                >
                  <ArrowLeftRight className="w-5 h-5 ml-2" />
                  {lang === 'ar' ? 'تحويل مالي' : 'Transfer'}
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-[24px] sm:rounded-[32px] p-0 outline-none sm:max-w-[480px] max-h-[90vh] flex flex-col overflow-hidden" style={{ background: 'var(--card)', color: 'var(--card-foreground)', borderColor: 'var(--border)' }}>
                <DialogHeader className="text-right p-5 sm:p-8 pb-0">
                  <DialogTitle className="text-2xl font-black mb-2" style={{ color: 'var(--foreground)' }}>{lang === 'ar' ? 'تحويل مالي بين الحسابات' : 'Transfer Between Accounts'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleTransferSubmit} className="space-y-6 overflow-y-auto custom-scrollbar px-5 sm:px-8 pb-5 sm:pb-8 pt-2">
                  <div className="space-y-2 text-right">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-1">{lang === 'ar' ? 'من الحساب' : 'From Account'}</label>
                    <Select value={fromAccountId} onValueChange={setFromAccountId}>
                      <SelectTrigger className="w-full bg-white/5 border-white/10 text-right h-12 rounded-xl px-4" dir="rtl" style={{ color: 'var(--foreground)' }}>
                        <SelectValue placeholder={lang === 'ar' ? 'اختر الحساب المصدر' : 'Select source account'} />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border" style={{ background: 'var(--card)', color: 'var(--card-foreground)', borderColor: 'var(--border)' }} dir="rtl">
                        {accounts.map(acc => (
                          <SelectItem key={acc.id} value={acc.id} className="focus:bg-white/10 rounded-lg">
                            <div className="flex items-center gap-2">
                              <BankLogo name={acc.name} size="sm" className="w-4 h-4 rounded border-0" />
                              <span>
                                {getTranslatedBankName(acc.name, lang)} ({acc.alias || (acc.type === 'cash' ? (lang === 'ar' ? 'كاش' : 'Cash') : acc.type === 'wallet' ? (lang === 'ar' ? 'محفظة' : 'Wallet') : (lang === 'ar' ? 'بنك' : 'Bank'))}){acc.accountNum ? ` - ${acc.accountNum}` : ''} - {formatCurrency(acc.balance)}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 text-right">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-1">{lang === 'ar' ? 'إلى الحساب' : 'To Account'}</label>
                    <Select value={toAccountId} onValueChange={setToAccountId}>
                      <SelectTrigger className="w-full bg-white/5 border-white/10 text-right h-12 rounded-xl px-4" dir="rtl" style={{ color: 'var(--foreground)' }}>
                        <SelectValue placeholder={lang === 'ar' ? 'اختر الحساب المستهدف' : 'Select target account'} />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border" style={{ background: 'var(--card)', color: 'var(--card-foreground)', borderColor: 'var(--border)' }} dir="rtl">
                        {accounts.map(acc => (
                          <SelectItem key={acc.id} value={acc.id} className="focus:bg-white/10 rounded-lg">
                            <div className="flex items-center gap-2">
                              <BankLogo name={acc.name} size="sm" className="w-4 h-4 rounded border-0" />
                              <span>
                                {getTranslatedBankName(acc.name, lang)} ({acc.alias || (acc.type === 'cash' ? (lang === 'ar' ? 'كاش' : 'Cash') : acc.type === 'wallet' ? (lang === 'ar' ? 'محفظة' : 'Wallet') : (lang === 'ar' ? 'بنك' : 'Bank'))}){acc.accountNum ? ` - ${acc.accountNum}` : ''} - {formatCurrency(acc.balance)}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2 text-right">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-1">{lang === 'ar' ? 'المبلغ' : 'Amount'}</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          step="0.01" 
                          required 
                          value={transferAmount} 
                          onChange={e => setTransferAmount(e.target.value)} 
                          className="w-full bg-white/5 border border-white/10 rounded-xl h-12 px-4 text-white font-bold focus:border-indigo-500/50 outline-none transition-all text-center"
                          placeholder="0.00"
                          dir="ltr"
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">ج.م</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-right">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-1">{lang === 'ar' ? 'التاريخ' : 'Date'}</label>
                      <div className="relative group cursor-pointer" onClick={(e) => {
                        const input = e.currentTarget.querySelector('input');
                        if (input) input.showPicker?.();
                      }}>
                        <input 
                          type="date" 
                          value={transferDate} 
                          onChange={e => setTransferDate(e.target.value)} 
                          className="w-full bg-white/5 border border-white/10 rounded-xl h-12 px-4 text-white font-medium focus:border-indigo-500/50 outline-none transition-all cursor-pointer"
                          dir="ltr"
                        />
                        <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-right">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-1">{lang === 'ar' ? 'الوصف / ملاحظات' : 'Description / Notes'}</label>
                    <input 
                      type="text" 
                      value={transferDesc} 
                      onChange={e => setTransferDesc(e.target.value)} 
                      className="w-full bg-white/5 border border-white/10 rounded-xl h-12 px-4 text-white font-medium focus:border-indigo-500/50 outline-none transition-all text-right"
                      placeholder={lang === 'ar' ? 'مثال: تحويل مصروف، سداد حصة...' : 'e.g. Allowance, split pay...'}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={transferSubmitting || !fromAccountId || !toAccountId || !transferAmount}
                    className="w-full h-14 bg-amber-500 hover:bg-amber-600 text-black rounded-2xl font-black text-lg shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all disabled:opacity-50 mt-4"
                  >
                    {transferSubmitting ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : (lang === 'ar' ? 'إجراء التحويل المالي' : 'Execute Transfer')}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            {/* Standard Transaction Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => {
                    setTargetUserId(currentUser?.id || '');
                    setOpen(true);
                  }}
                  className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-6 h-12 sm:h-11 font-bold shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
                >
                  <Plus className="w-5 h-5 ml-2" />
                  إضافة معاملة
                </Button>
              </DialogTrigger>
            <DialogContent className="rounded-[24px] sm:rounded-[32px] p-0 outline-none sm:max-w-[480px] max-h-[90vh] flex flex-col overflow-hidden" style={{ background: 'var(--card)', color: 'var(--card-foreground)', borderColor: 'var(--border)' }}>
              <DialogHeader className="text-right p-5 sm:p-8 pb-0">
                <DialogTitle className="text-2xl font-black mb-2" style={{ color: 'var(--foreground)' }}>{lang === 'ar' ? 'إضافة معاملة جديدة' : 'Add New Transaction'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto custom-scrollbar px-5 sm:px-8 pb-5 sm:pb-8 pt-2">
                {isAdmin && (
                  <div className="space-y-2 text-right">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-1">{lang === 'ar' ? 'المستخدم المستهدف' : 'Target User'}</label>
                    <Select value={targetUserId} onValueChange={setTargetUserId}>
                      <SelectTrigger className="w-full bg-white/5 border-white/10 text-right h-12 rounded-xl px-4" dir="rtl" style={{ color: 'var(--foreground)' }}>
                        <SelectValue placeholder={lang === 'ar' ? 'اختر المستخدم' : 'Select User'} />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border" style={{ background: 'var(--card)', color: 'var(--card-foreground)', borderColor: 'var(--border)' }} dir="rtl">
                        {users.map(u => (
                          <SelectItem key={u.id} value={u.id} className="focus:bg-white/10 rounded-lg">
                            {u.name} {u.id === currentUser?.id ? (lang === 'ar' ? '(أنت)' : '(You)') : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="flex gap-2 p-1.5 bg-black/20 rounded-2xl border border-white/5">
                  {(['expense', 'income'] as const).map(t => (
                    <button 
                      key={t} 
                      type="button" 
                      onClick={() => { setType(t); setCategory(''); }}
                      className={cn(
                        "flex-1 py-3 rounded-xl font-black text-sm transition-all",
                        type === t 
                          ? (t === 'expense' ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20") 
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      )}
                    >
                      {lang === 'ar' ? (t === 'expense' ? 'مصروف' : 'إيراد') : (t === 'expense' ? 'Expense' : 'Income')}
                    </button>
                  ))}
                </div>



                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2 text-right">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-1">{lang === 'ar' ? 'المبلغ' : 'Amount'}</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        step="0.01" 
                        required 
                        value={amount} 
                        onChange={e => setAmount(e.target.value)} 
                        className="w-full bg-white/5 border border-white/10 rounded-xl h-12 px-4 text-white font-bold focus:border-indigo-500/50 outline-none transition-all text-center"
                        placeholder="0.00"
                        dir="ltr"
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">{lang === 'ar' ? 'ج.م' : 'EGP'}</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-right">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-1">{lang === 'ar' ? 'الفئة' : 'Category'}</label>
                    <Select value={category} onValueChange={(val) => setCategory(val || '')}>
                      <SelectTrigger className="w-full bg-white/5 border-white/10 text-right h-12 rounded-xl px-4" dir="rtl" style={{ color: 'var(--foreground)' }}>
                        <SelectValue placeholder={lang === 'ar' ? 'اختر الفئة' : 'Select Category'} />
                      </SelectTrigger>
                      <SelectContent className="rounded-[20px] max-h-[400px] py-2 pr-2 pl-6 custom-scrollbar border" style={{ background: 'var(--card)', color: 'var(--card-foreground)', borderColor: 'var(--border)' }} dir="rtl">
                        {cats.map(c => {
                          const Item = SelectItem as any;
                          const translatedLabel = getCategoryInfo(c.value, type, lang).label;
                          return (
                            <Item key={c.value} value={c.value} textValue={translatedLabel} className="focus:bg-white/10 rounded-xl cursor-pointer py-3 pr-12 pl-4">
                              <div className="flex items-center gap-3 w-full">
                                <span className="text-xl shrink-0">{c.icon}</span>
                                <span className="font-bold text-sm whitespace-nowrap">{translatedLabel}</span>
                              </div>
                            </Item>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2 text-right">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-1">{lang === 'ar' ? 'الحساب المالي (بنك / كاش)' : 'Financial Account (Bank / Cash)'}</label>
                  <Select value={accountId} onValueChange={setAccountId}>
                    <SelectTrigger className="w-full bg-white/5 border-white/10 text-right h-12 rounded-xl px-4" dir="rtl" style={{ color: 'var(--foreground)' }}>
                      <SelectValue placeholder={lang === 'ar' ? 'اختر الحساب المالي (اختياري)' : 'Select Financial Account (Optional)'} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border" style={{ background: 'var(--card)', color: 'var(--card-foreground)', borderColor: 'var(--border)' }} dir="rtl">
                      <SelectItem value="none" className="focus:bg-white/10 rounded-lg text-slate-400">
                        {lang === 'ar' ? 'بدون ربط (سجل عام)' : 'No account link (General Log)'}
                      </SelectItem>
                      {accounts.map(acc => (
                        <SelectItem key={acc.id} value={acc.id} className="focus:bg-white/10 rounded-lg">
                          <div className="flex items-center gap-2">
                            <BankLogo name={acc.name} size="sm" className="w-4 h-4 rounded border-0" />
                            <span>
                              {getTranslatedBankName(acc.name, lang)} ({acc.alias || (acc.type === 'cash' ? (lang === 'ar' ? 'كاش' : 'Cash') : acc.type === 'wallet' ? (lang === 'ar' ? 'محفظة' : 'Wallet') : (lang === 'ar' ? 'بنك' : 'Bank'))}){acc.accountNum ? ` - ${acc.accountNum}` : ''} - {formatCurrency(acc.balance)}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 text-right">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-1">{lang === 'ar' ? 'الوصف — ماذا فعلت؟' : 'Description — What did you do?'}</label>
                  <input 
                    type="text" 
                    value={description} 
                    onChange={e => setDescription(e.target.value)} 
                    className="w-full bg-white/5 border border-white/10 rounded-xl h-12 px-4 text-white font-medium focus:border-indigo-500/50 outline-none transition-all text-right"
                    placeholder={lang === 'ar' ? 'مثال: فطور كافيه، بنزين عربية، دفعت إيجار، اشتريت...' : 'e.g. Cafe breakfast, car gas, paid rent, bought...'}
                  />
                  <p className="text-[10px] text-slate-500 mr-1">{lang === 'ar' ? '💡 اكتب بالتفصيل إيه اللي عملته — المبلغ راح على إيه؟' : '💡 Write in detail what you did — what was the amount spent on?'}</p>
                </div>

                <div className="space-y-2 text-right">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-1">{lang === 'ar' ? 'التاريخ' : 'Date'}</label>
                  <div className="relative group cursor-pointer" onClick={(e) => {
                    const input = e.currentTarget.querySelector('input');
                    if (input) input.showPicker?.();
                  }}>
                    <input 
                      type="date" 
                      value={date} 
                      onChange={e => setDate(e.target.value)} 
                      className="w-full bg-white/5 border border-white/10 rounded-xl h-12 px-4 text-white font-medium focus:border-indigo-500/50 outline-none transition-all cursor-pointer"
                      dir="ltr"
                    />
                    <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors pointer-events-none" />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={submitting || !amount || !category}
                  className={cn(
                    "w-full h-14 text-white rounded-2xl font-black text-lg shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 mt-4",
                    type === 'expense' ? "bg-red-500 hover:bg-red-600 shadow-red-500/20" : "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20"
                  )}
                >
                  {submitting ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : (lang === 'ar' ? 'حفظ المعاملة' : 'Save Transaction')}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

        {isAdmin && (
          <div className="w-full sm:w-[300px] text-right">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 block mr-1">{lang === 'ar' ? 'تصفية حسب المستخدم' : 'Filter by User'}</label>
            <Select value={selectedUserId} onValueChange={(val) => setSelectedUserId(val || '')}>
              <SelectTrigger className="w-full bg-white/5 border-white/10 rounded-xl h-12 shadow-inner" style={{ color: 'var(--foreground)' }}>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-400" />
                  <SelectValue placeholder={lang === 'ar' ? 'الكل' : 'All'} />
                </div>
              </SelectTrigger>
                <SelectContent className="rounded-xl border" style={{ background: 'var(--card)', color: 'var(--card-foreground)', borderColor: 'var(--border)' }}>
                  <SelectItem value="all" className="font-bold text-indigo-400 focus:bg-white/10 rounded-lg">{lang === 'ar' ? 'كل العائلة' : 'All Family'}</SelectItem>
                  {users.map(u => (
                    <SelectItem key={u.id} value={u.id} className="focus:bg-white/10 rounded-lg">
                      {u.name} {u.id === currentUser?.id ? (lang === 'ar' ? '(أنت)' : '(You)') : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Transactions List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">{lang === 'ar' ? 'جاري تحميل المعاملات' : 'Loading Transactions'}</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="glass-card py-24 flex flex-col items-center justify-center text-center px-6">
          <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6">
            <AlertCircle className="w-10 h-10 text-slate-600" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{lang === 'ar' ? 'لا توجد معاملات مسجلة' : 'No Transactions Recorded'}</h3>
          <p className="text-slate-500 max-w-xs mx-auto">{lang === 'ar' ? 'ابدأ بتسجيل أولى معاملاتك المالية لتتبع دخلك ومصروفاتك.' : 'Start recording your first financial transactions to track your income and expenses.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {transactions.map((tx) => {
            const cat = getCategoryInfo(tx.category, tx.type, lang);
            const isIncome = tx.type === 'income';
            
            return (
              <div key={tx.id} className="glass-card p-4 sm:p-5 flex items-start sm:items-center justify-between gap-3 group hover:border-white/10 transition-all active:scale-[0.99]">
                <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className={cn(
                    "w-11 h-11 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-xl sm:text-2xl shadow-inner transition-transform group-hover:scale-110 shrink-0 mt-0.5 sm:mt-0",
                    isIncome ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                  )}>
                    {cat.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    {/* Title row */}
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <h4 className="font-bold text-white text-sm sm:text-base leading-snug break-words whitespace-normal">
                        {tx.description || cat.label}
                      </h4>
                      {isAdmin && (
                        <span className="text-[9px] px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-full font-bold whitespace-nowrap border border-indigo-500/20">
                          👤 {users.find(u => u.id === tx.userId)?.name || (lang === 'ar' ? 'مستخدم' : 'User')}
                        </span>
                      )}
                    </div>

                    {/* Meta row: category + date + account */}
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-[10px] sm:text-[11px] font-semibold text-slate-500">
                      <span className="flex items-center gap-1 bg-white/[0.04] px-2 py-0.5 rounded-md">
                        <Tag className="w-2.5 h-2.5 shrink-0" />
                        {cat.label}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5 shrink-0" />
                        {new Date(tx.date).toLocaleDateString(lang === 'ar' ? 'ar-EG-u-nu-latn' : 'en-US', { day: 'numeric', month: 'short', year: '2-digit' })}
                      </span>
                      {tx.account ? (
                        <span className="flex items-center gap-1 bg-white/5 border border-white/5 px-2 py-0.5 rounded-full text-slate-400 font-semibold">
                          <BankLogo name={tx.account.name} size="sm" className="w-3 h-3 rounded border-0 shrink-0" />
                          {getTranslatedBankName(tx.account.name, lang)}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-slate-600 text-[9px] italic">
                          {lang === 'ar' ? 'سجل عام' : 'General Log'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side: amount + actions */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className={cn(
                    "text-sm sm:text-xl font-black tabular-nums flex items-center gap-0.5 sm:gap-1",
                    isIncome ? "text-emerald-500" : "text-red-500"
                  )}>
                    {isIncome ? <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" /> : <ArrowDownRight className="w-4 h-4 sm:w-5 sm:h-5" />}
                    <span className="text-sm sm:text-base">{formatCurrency(tx.amount)}</span>
                  </div>
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => handleOpenEdit(tx)}
                      className="p-1.5 sm:p-2 rounded-lg bg-white/5 text-slate-500 hover:bg-indigo-500/10 hover:text-indigo-400 transition-all active:scale-90"
                      title={lang === 'ar' ? 'تعديل' : 'Edit'}
                    >
                      <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                    <button 
                      onClick={() => setDeleteDialog({ isOpen: true, transactionId: tx.id, description: tx.description || cat.label })}
                      className="p-1.5 sm:p-2 rounded-lg bg-white/5 text-slate-500 hover:bg-red-500/10 hover:text-red-500 transition-all active:scale-90"
                      title={lang === 'ar' ? 'حذف' : 'Delete'}
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation */}
      <Dialog open={deleteDialog.isOpen} onOpenChange={(isOpen) => setDeleteDialog(prev => ({ ...prev, isOpen }))}>
        <DialogContent className="p-5 sm:p-8 overflow-hidden sm:max-w-[440px] rounded-[24px] sm:rounded-[32px] outline-none" style={{ background: 'var(--card)', color: 'var(--card-foreground)', borderColor: 'var(--border)' }}>
          <div className="text-right">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 mb-6">
              <Trash2 className="w-7 h-7" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-black">{lang === 'ar' ? 'حذف المعاملة' : 'Delete Transaction'}</DialogTitle>
            </DialogHeader>
            <p className="text-base font-medium mt-4 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
              {lang === 'ar' 
                ? `هل أنت متأكد من حذف معاملة "${deleteDialog.description}"؟ لا يمكن التراجع عن هذا الإجراء.` 
                : `Are you sure you want to delete the transaction "${deleteDialog.description}"? This action cannot be undone.`}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row-reverse gap-3">
              <Button 
                className="flex-1 h-14 bg-red-500 hover:bg-red-600 text-white font-black rounded-2xl shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all" 
                onClick={handleDelete}
              >
                {lang === 'ar' ? 'حذف نهائي' : 'Delete'}
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 h-14 font-bold rounded-2xl transition-all" 
                style={{ borderColor: 'var(--border)', background: 'transparent', color: 'var(--foreground)' }}
                onClick={() => setDeleteDialog({ isOpen: false, transactionId: '', description: '' })}
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Transaction Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="rounded-[24px] sm:rounded-[32px] p-5 sm:p-8 outline-none sm:max-w-[480px] max-h-[90vh] overflow-y-auto custom-scrollbar" style={{ background: 'var(--card)', color: 'var(--card-foreground)', borderColor: 'var(--border)' }}>
          <DialogHeader className="text-right">
            <DialogTitle className="text-2xl font-black mb-6" style={{ color: 'var(--foreground)' }}>تعديل المعاملة</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-6">
            {isAdmin && (
              <div className="space-y-2 text-right">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-1">المستخدم المستهدف</label>
                <Select value={editTargetUserId} onValueChange={setEditTargetUserId}>
                  <SelectTrigger className="w-full bg-white/5 border-white/10 text-right h-12 rounded-xl px-4" dir="rtl" style={{ color: 'var(--foreground)' }}>
                    <SelectValue placeholder="اختر المستخدم" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border" style={{ background: 'var(--card)', color: 'var(--card-foreground)', borderColor: 'var(--border)' }} dir="rtl">
                    {users.map(u => (
                      <SelectItem key={u.id} value={u.id} className="focus:bg-white/10 rounded-lg">
                        {u.name} {u.id === currentUser?.id ? '(أنت)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex gap-2 p-1.5 bg-black/20 rounded-2xl border border-white/5">
              {(['expense', 'income'] as const).map(t => (
                <button 
                  key={t} 
                  type="button" 
                  onClick={() => { setEditType(t); setEditCategory(''); }}
                  className={cn(
                    "flex-1 py-3 rounded-xl font-black text-sm transition-all",
                    editType === t 
                      ? (t === 'expense' ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20") 
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  {t === 'expense' ? 'مصروف' : 'إيراد'}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 text-right">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-1">{lang === 'ar' ? 'المبلغ' : 'Amount'}</label>
                <div className="relative">
                  <input 
                    type="number" 
                    step="0.01" 
                    required 
                    value={editAmount} 
                    onChange={e => setEditAmount(e.target.value)} 
                    className="w-full bg-white/5 border border-white/10 rounded-xl h-12 px-4 text-white font-bold focus:border-indigo-500/50 outline-none transition-all text-center"
                    placeholder="0.00"
                    dir="ltr"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">{lang === 'ar' ? 'ج.م' : 'EGP'}</span>
                </div>
              </div>

              <div className="space-y-2 text-right">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-1">{lang === 'ar' ? 'الفئة' : 'Category'}</label>
                <Select value={editCategory} onValueChange={(val) => setEditCategory(val || '')}>
                  <SelectTrigger className="w-full bg-white/5 border-white/10 text-right h-12 rounded-xl px-4" dir="rtl" style={{ color: 'var(--foreground)' }}>
                    <SelectValue placeholder={lang === 'ar' ? 'اختر الفئة' : 'Select Category'} />
                  </SelectTrigger>
                  <SelectContent className="rounded-[20px] max-h-[400px] py-2 pr-2 pl-6 custom-scrollbar border" style={{ background: 'var(--card)', color: 'var(--card-foreground)', borderColor: 'var(--border)' }} dir="rtl">
                    {(editType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(c => {
                      const Item = SelectItem as any;
                      const translatedLabel = getCategoryInfo(c.value, editType, lang).label;
                      return (
                        <Item key={c.value} value={c.value} textValue={translatedLabel} className="focus:bg-white/10 rounded-xl cursor-pointer py-3 pr-12 pl-4">
                          <div className="flex items-center gap-3 w-full">
                            <span className="text-xl shrink-0">{c.icon}</span>
                            <span className="font-bold text-sm whitespace-nowrap">{translatedLabel}</span>
                          </div>
                        </Item>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2 text-right">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-1">الحساب المالي (بنك / كاش)</label>
              <Select value={editAccountId} onValueChange={setEditAccountId}>
                <SelectTrigger className="w-full bg-white/5 border-white/10 text-right h-12 rounded-xl px-4" dir="rtl" style={{ color: 'var(--foreground)' }}>
                  <SelectValue placeholder="اختر الحساب المالي (اختياري)" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border" style={{ background: 'var(--card)', color: 'var(--card-foreground)', borderColor: 'var(--border)' }} dir="rtl">
                  <SelectItem value="none" className="focus:bg-white/10 rounded-lg text-slate-400">
                    {lang === 'ar' ? 'بدون ربط (سجل عام)' : 'No account link (General Log)'}
                  </SelectItem>
                  {accounts.map(acc => (
                    <SelectItem key={acc.id} value={acc.id} className="focus:bg-white/10 rounded-lg">
                      <div className="flex items-center gap-2">
                        <BankLogo name={acc.name} size="sm" className="w-4 h-4 rounded border-0" />
                        <span>
                          {getTranslatedBankName(acc.name, lang)} ({acc.alias || (acc.type === 'cash' ? (lang === 'ar' ? 'كاش' : 'Cash') : acc.type === 'wallet' ? (lang === 'ar' ? 'محفظة' : 'Wallet') : (lang === 'ar' ? 'بنك' : 'Bank'))}){acc.accountNum ? ` - ${acc.accountNum}` : ''} - {formatCurrency(acc.balance)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 text-right">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-1">الوصف — ماذا فعلت؟</label>
              <input 
                type="text" 
                value={editDescription} 
                onChange={e => setEditDescription(e.target.value)} 
                className="w-full bg-white/5 border border-white/10 rounded-xl h-12 px-4 text-white font-medium focus:border-indigo-500/50 outline-none transition-all text-right"
                placeholder="مثال: فطور كافيه، بنزين عربية، دفعت إيجار، اشتريت..."
              />
              <p className="text-[10px] text-slate-500 mr-1">💡 اكتب بالتفصيل إيه اللي عملته — المبلغ راح على إيه؟</p>
            </div>

            <div className="space-y-2 text-right">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-1">التاريخ</label>
              <div className="relative group cursor-pointer" onClick={(e) => {
                const input = e.currentTarget.querySelector('input');
                if (input) input.showPicker?.();
              }}>
                <input 
                  type="date" 
                  value={editDate} 
                  onChange={e => setEditDate(e.target.value)} 
                  className="w-full bg-white/5 border border-white/10 rounded-xl h-12 px-4 text-white font-medium focus:border-indigo-500/50 outline-none transition-all cursor-pointer"
                  dir="ltr"
                />
                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors pointer-events-none" />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={editSubmitting || !editAmount || !editCategory}
              className={cn(
                "w-full h-14 text-white rounded-2xl font-black text-lg shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 mt-4",
                editType === 'expense' ? "bg-red-500 hover:bg-red-600 shadow-red-500/20" : "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20"
              )}
            >
              {editSubmitting ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'حفظ التعديلات'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
