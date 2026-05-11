'use client';

import { useEffect, useState } from 'react';
import { transactionsApi, adminApi, Transaction, User, formatCurrency, getCategoryInfo, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowDownRight, ArrowUpRight, Plus, Trash2, Users, Loader2, Activity, Calendar, Tag, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function TransactionsPage() {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>(currentUser?.id || '');
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  
  // Form state
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [targetUserId, setTargetUserId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; transactionId: string; description: string }>({
    isOpen: false,
    transactionId: '',
    description: '',
  });

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

  useEffect(() => {
    if (currentUser) {
      fetchUsers();
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
        targetUserId: targetUserId
      } as any);
      
      toast.success(`تم إضافة معاملة ${selectedUser?.name || ''} بنجاح`);
      setOpen(false);
      setAmount('');
      setDescription('');
      setCategory('');
      setDate(new Date().toISOString().split('T')[0]);
      fetchTransactions();
    } catch (error: any) {
      toast.error(error.message || 'حدث خطأ أثناء الإضافة');
    } finally {
      setSubmitting(false);
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
    <div className="flex flex-col gap-8 pb-12 animate-fade-in">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-1 flex items-center gap-3">
              <Activity className="w-8 h-8 text-indigo-400" />
              المعاملات المالية
            </h2>
            <p className="text-slate-400 text-sm sm:text-base font-medium">سجل وراقب كافة تحركاتك المالية</p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => setOpen(true)}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-6 h-12 sm:h-11 font-bold shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
              >
                <Plus className="w-5 h-5 ml-2" />
                إضافة معاملة
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#1a1a35] border-white/10 text-white rounded-[32px] p-8 outline-none sm:max-w-[480px]">
              <DialogHeader className="text-right">
                <DialogTitle className="text-2xl font-black mb-6">إضافة معاملة جديدة</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
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
                      {t === 'expense' ? 'مصروف' : 'إيراد'}
                    </button>
                  ))}
                </div>



                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2 text-right">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-1">المبلغ</label>
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
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">ج.م</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-right">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-1">الفئة</label>
                    <Select value={category} onValueChange={(val) => setCategory(val || '')}>
                      <SelectTrigger className="w-full bg-white/5 border-white/10 text-right h-12 rounded-xl px-4" dir="rtl">
                        <SelectValue placeholder="اختر الفئة" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a35] border-white/10 text-white rounded-[20px] max-h-[300px] py-2 pr-2 pl-3 custom-scrollbar" dir="rtl">
                        {cats.map(c => {
                          const Item = SelectItem as any;
                          return (
                            <Item key={c.value} value={c.value} textValue={c.label} className="focus:bg-white/10 rounded-xl cursor-pointer py-3 pr-12 pl-4">
                              <div className="flex items-center gap-3 w-full">
                                <span className="text-xl shrink-0">{c.icon}</span>
                                <span className="font-bold text-sm whitespace-nowrap">{c.label}</span>
                              </div>
                            </Item>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2 text-right">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-1">الوصف</label>
                  <input 
                    type="text" 
                    value={description} 
                    onChange={e => setDescription(e.target.value)} 
                    className="w-full bg-white/5 border border-white/10 rounded-xl h-12 px-4 text-white font-medium focus:border-indigo-500/50 outline-none transition-all text-right"
                    placeholder="مثال: شراء بقالة، راتب شهري..."
                  />
                </div>

                <div className="space-y-2 text-right">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-1">التاريخ</label>
                  <div className="relative">
                    <input 
                      type="date" 
                      value={date} 
                      onChange={e => setDate(e.target.value)} 
                      className="w-full bg-white/5 border border-white/10 rounded-xl h-12 px-4 text-white font-medium focus:border-indigo-500/50 outline-none transition-all"
                      dir="ltr"
                    />
                    <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
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
                  {submitting ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'حفظ المعاملة'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isAdmin && (
          <div className="w-full sm:w-[300px]">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 block mr-1">تصفية حسب المستخدم</label>
            <Select value={selectedUserId} onValueChange={(val) => setSelectedUserId(val || '')}>
              <SelectTrigger className="w-full bg-white/5 border-white/10 text-white rounded-xl h-12 shadow-inner">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-400" />
                  <SelectValue placeholder="الكل" />
                </div>
              </SelectTrigger>
                <SelectContent className="bg-[#1a1a35] border-white/10 text-white rounded-xl">
                  <SelectItem value="all" className="font-bold text-indigo-400 focus:bg-white/10 rounded-lg">كل العائلة</SelectItem>
                  {users.map(u => (
                    <SelectItem key={u.id} value={u.id} className="focus:bg-white/10 rounded-lg">
                      {u.name} {u.id === currentUser?.id ? '(أنت)' : ''}
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
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">جاري تحميل المعاملات</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="glass-card py-24 flex flex-col items-center justify-center text-center px-6">
          <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6">
            <AlertCircle className="w-10 h-10 text-slate-600" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">لا توجد معاملات مسجلة</h3>
          <p className="text-slate-500 max-w-xs mx-auto">ابدأ بتسجيل أولى معاملاتك المالية لتتبع دخلك ومصروفاتك.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {transactions.map((tx) => {
            const cat = getCategoryInfo(tx.category, tx.type);
            const isIncome = tx.type === 'income';
            
            return (
              <div key={tx.id} className="glass-card p-4 sm:p-5 flex items-center justify-between gap-4 group hover:border-white/10 transition-all active:scale-[0.99]">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className={cn(
                    "w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner transition-transform group-hover:scale-110 shrink-0",
                    isIncome ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                  )}>
                    {cat.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-white truncate text-sm sm:text-base">{tx.description || cat.label}</h4>
                      {isAdmin && (
                        <span className="text-[9px] px-2 py-0.5 bg-white/5 text-slate-400 rounded-full font-bold whitespace-nowrap">
                          {users.find(u => u.id === tx.userId)?.name || 'مستخدم'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[10px] sm:text-xs font-bold text-slate-500">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {cat.label}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(tx.date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className={cn(
                    "text-base sm:text-xl font-black tabular-nums flex items-center gap-1",
                    isIncome ? "text-emerald-500" : "text-red-500"
                  )}>
                    {isIncome ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                    {formatCurrency(tx.amount)}
                  </div>
                  <button 
                    onClick={() => setDeleteDialog({ isOpen: true, transactionId: tx.id, description: tx.description || cat.label })}
                    className="p-2 rounded-lg bg-white/5 text-slate-500 hover:bg-red-500/10 hover:text-red-500 transition-all active:scale-90"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation */}
      <Dialog open={deleteDialog.isOpen} onOpenChange={(isOpen) => setDeleteDialog(prev => ({ ...prev, isOpen }))}>
        <DialogContent className="bg-[#1a1a35] border-white/10 text-white p-8 overflow-hidden sm:max-w-[440px] rounded-[32px] outline-none">
          <div className="text-right">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 mb-6">
              <Trash2 className="w-7 h-7" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-white">حذف المعاملة</DialogTitle>
            </DialogHeader>
            <p className="text-slate-400 text-base font-medium mt-4 leading-relaxed">
              هل أنت متأكد من حذف معاملة <span className="text-white font-bold">"{deleteDialog.description}"</span>؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row-reverse gap-3">
              <Button 
                className="flex-1 h-14 bg-red-500 hover:bg-red-600 text-white font-black rounded-2xl shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all" 
                onClick={handleDelete}
              >
                حذف نهائي
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 h-14 border-white/5 bg-transparent text-slate-300 font-bold rounded-2xl hover:bg-white/5 hover:text-white transition-all" 
                onClick={() => setDeleteDialog({ isOpen: false, transactionId: '', description: '' })}
              >
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
