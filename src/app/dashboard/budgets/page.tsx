'use client';

import { useEffect, useState } from 'react';
import { budgetsApi, adminApi, Budget, User, formatCurrency, EXPENSE_CATEGORIES } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Target, Trash2, Users, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function BudgetsPage() {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>(currentUser?.id || '');
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  
  // Form state
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [targetUserId, setTargetUserId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; budgetId: string; categoryName: string }>({
    isOpen: false,
    budgetId: '',
    categoryName: '',
  });

  const fetchUsers = async () => {
    try {
      if (isAdmin) {
        const data = await adminApi.getUsers();
        setUsers(data || []);
      } else if (currentUser) {
        setUsers([currentUser]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      // If selectedUserId is 'all', we pass undefined to get all family budgets
      const apiUserId = (selectedUserId === 'all' || !selectedUserId) ? undefined : selectedUserId;
      const now = new Date();
      const m = now.getMonth() + 1;
      const y = now.getFullYear();
      const data = await budgetsApi.getAll(apiUserId, m, y);
      setBudgets(data || []);
    } catch (error: any) {
      console.error('Fetch error:', error);
      const msg = error.message || 'حدث خطأ في تحميل الميزانية';
      toast.error(msg);
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
      fetchBudgets();
    }
  }, [selectedUserId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !category || !targetUserId) {
      toast.error('يرجى اختيار المستخدم والفئة والمبلغ');
      return;
    }
    
    const selectedUser = users.find(u => u.id === targetUserId);
    console.log(`[Budget Form] Attempting to save for: ${selectedUser?.name} (ID: ${targetUserId})`);

    setSubmitting(true);
    try {
      await budgetsApi.create({ 
        category, 
        amount: parseFloat(amount),
        targetUserId: targetUserId
      } as any); // Casting as any to allow sending extra fields if needed
      
      toast.success(`تم حفظ ميزانية ${selectedUser?.name || ''} بنجاح`);
      setOpen(false);
      setAmount('');
      setCategory('');
      fetchBudgets();
    } catch (error: any) {
      toast.error(error.message || 'حدث خطأ أثناء حفظ الميزانية');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.budgetId) return;
    try {
      await budgetsApi.delete(deleteDialog.budgetId);
      toast.success('تم حذف الميزانية بنجاح');
      setDeleteDialog({ isOpen: false, budgetId: '', categoryName: '' });
      fetchBudgets();
    } catch {
      toast.error('حدث خطأ أثناء الحذف');
    }
  };

  if (!currentUser) return null;

  return (
    <div className="flex flex-col gap-8 pb-12 animate-fade-in">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-1 flex items-center gap-3">
              <Target className="w-8 h-8 text-indigo-400" />
              الميزانية الشهرية
            </h2>
            <p className="text-slate-400 text-sm sm:text-base font-medium">
              {isAdmin ? 'إدارة الخطط المالية لأفراد العائلة' : 'راقب إنفاقك وحافظ على ميزانيتك'}
            </p>
          </div>

          {isAdmin && (
            <Button 
              onClick={() => { 
                setOpen(true); 
                // Default target to selected user unless it's 'all'
                setTargetUserId(selectedUserId === 'all' ? '' : selectedUserId);
              }}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-6 h-12 sm:h-11 font-bold shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
            >
              <Plus className="w-5 h-5 ml-2" />
              إضافة ميزانية
            </Button>
          )}
        </div>

        {isAdmin && (
          <div className="w-full sm:w-[300px]">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 block mr-1">تصفية حسب المستخدم</label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger className="w-full bg-white/5 border-white/10 text-white rounded-xl h-12 shadow-inner">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-400" />
                  <SelectValue placeholder="اختر المستخدم" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a35] border-white/10 text-white rounded-xl">
                <SelectItem value="all" className="font-bold text-indigo-400">كل العائلة</SelectItem>
                {users.map(u => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name} {u.id === currentUser.id ? '(أنت)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-[#1a1a35] border-white/10 text-white rounded-[32px] p-8 outline-none sm:max-w-[440px]">
          <DialogHeader className="text-right">
            <DialogTitle className="text-2xl font-black mb-6">إضافة ميزانية جديدة</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 text-right">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-1">المستخدم المستهدف</label>
              <Select value={targetUserId} onValueChange={setTargetUserId} disabled={!isAdmin}>
                <SelectTrigger className="bg-white/5 border-white/10 text-right h-12 rounded-xl" dir="rtl">
                  <SelectValue placeholder="اختر المستخدم" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a35] border-white/10 text-white rounded-xl" dir="rtl">
                  {users.map(u => (
                    <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 text-right">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-1">الفئة</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-white/5 border-white/10 text-right h-12 rounded-xl" dir="rtl">
                  <SelectValue placeholder="اختر الفئة" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a35] border-white/10 text-white rounded-xl max-h-[300px]" dir="rtl">
                  {EXPENSE_CATEGORIES.map(c => (
                    <SelectItem key={c.value} value={c.value}>
                      <span className="flex items-center gap-2">
                        <span>{c.icon}</span>
                        <span>{c.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 text-right">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-1">المبلغ الأقصى</label>
              <div className="relative">
                <input 
                  type="number" 
                  step="0.01" 
                  required 
                  value={amount} 
                  onChange={e => setAmount(e.target.value)} 
                  className="w-full bg-white/5 border border-white/10 rounded-xl h-12 px-4 text-white font-bold focus:border-indigo-500/50 outline-none transition-all text-center"
                  placeholder="0.00"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">ج.م</span>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={submitting || !amount || !category || !targetUserId}
              className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-lg shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'حفظ الميزانية'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">جاري تحميل الميزانية</p>
        </div>
      ) : budgets.length === 0 ? (
        <div className="glass-card py-24 flex flex-col items-center justify-center text-center px-6">
          <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6">
            <Target className="w-10 h-10 text-slate-600" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">لا توجد ميزانيات محددة</h3>
          <p className="text-slate-500 max-w-xs mx-auto">ابدأ بتحديد ميزانياتك الشهرية لمراقبة مصروفاتك بشكل فعال.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {budgets.map((budget) => {
            const percent = Math.min((budget.spent / budget.amount) * 100, 100);
            const isNearLimit = percent > 80;
            const isOverLimit = percent >= 100;

            return (
              <div key={budget.id} className="glass-card p-6 flex flex-col gap-6 group hover:border-white/10 transition-all">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl shadow-inner">
                      {EXPENSE_CATEGORIES.find(c => c.value === budget.category)?.icon || '💰'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-white truncate max-w-[120px]">{EXPENSE_CATEGORIES.find(c => c.value === budget.category)?.label || budget.category}</h4>
                        {isAdmin && (
                          <span className="text-[10px] px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-full font-bold">
                            {budget.userName}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">ميزانية شهرية</p>
                    </div>
                  </div>
                  {isAdmin && (
                    <button 
                      onClick={() => setDeleteDialog({ isOpen: true, budgetId: budget.id, categoryName: budget.category })}
                      className="p-2 rounded-lg bg-white/5 text-slate-500 hover:bg-red-500/10 hover:text-red-500 transition-all active:scale-90"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">المصروف</span>
                      <span className={cn(
                        "text-xl font-black tabular-nums",
                        isOverLimit ? "text-red-500" : isNearLimit ? "text-orange-500" : "text-white"
                      )}>
                        {formatCurrency(budget.spent)}
                      </span>
                    </div>
                    <div className="text-right flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">الهدف</span>
                      <span className="text-sm font-bold text-slate-300">{formatCurrency(budget.amount)}</span>
                    </div>
                  </div>

                  <div className="w-full h-3 bg-black/20 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-1000 ease-out",
                        isOverLimit ? "bg-red-500" : isNearLimit ? "bg-orange-500" : "bg-indigo-500"
                      )}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-500">{Math.round(percent)}% تم استهلاكه</span>
                    <span className={cn(
                      "text-[10px] font-black uppercase px-2 py-0.5 rounded-md",
                      isOverLimit ? "bg-red-500/10 text-red-500" : "bg-white/5 text-slate-400"
                    )}>
                      {isOverLimit ? 'تجاوزت الحد' : `متبقي: ${formatCurrency(budget.remaining)}`}
                    </span>
                  </div>
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
              <DialogTitle className="text-2xl font-black text-white">حذف الميزانية</DialogTitle>
            </DialogHeader>
            <p className="text-slate-400 text-base font-medium mt-4 leading-relaxed">
              هل أنت متأكد من حذف ميزانية <span className="text-white font-bold">"{EXPENSE_CATEGORIES.find(c => c.value === deleteDialog.categoryName)?.label || deleteDialog.categoryName}"</span>؟ لا يمكن التراجع عن هذا الإجراء.
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
                onClick={() => setDeleteDialog({ isOpen: false, budgetId: '', categoryName: '' })}
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
