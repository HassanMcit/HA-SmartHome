'use client';

import { useEffect, useState } from 'react';
import { budgetsApi, budgetResets, adminApi, Budget, User, formatCurrency, EXPENSE_CATEGORIES } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Plus, Target, Trash2, Users, Loader2, Pencil, Eraser } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function BudgetsPage() {
  const { user: currentUser } = useAuth();
  const { lang } = useLanguage();
  const isAdmin = currentUser?.role === 'admin';

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>(currentUser?.id || '');
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  // Add form state
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [targetUserId, setTargetUserId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  // Edit dialog state
  const [editDialog, setEditDialog] = useState<{ isOpen: boolean; budget: Budget | null }>({
    isOpen: false,
    budget: null,
  });
  const [editAmount, setEditAmount] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Delete dialog state
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; budgetId: string; categoryName: string }>({
    isOpen: false,
    budgetId: '',
    categoryName: '',
  });

  // Clear all dialog state
  const [clearAllOpen, setClearAllOpen] = useState(false);
  const [clearAllSubmitting, setClearAllSubmitting] = useState(false);

  const fetchUsers = async () => {
    if (!isAdmin) return;
    try {
      const data = await adminApi.getUsers();
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const apiUserId = (selectedUserId === 'all' || !selectedUserId) ? undefined : selectedUserId;
      const now = new Date();
      const m = now.getMonth() + 1;
      const y = now.getFullYear();
      const data = await budgetsApi.getAll(apiUserId, m, y);
      setBudgets(data || []);
    } catch (error: any) {
      console.error('Fetch error:', error);
      const msg = error.message || (lang === 'ar' ? 'حدث خطأ في تحميل الميزانية' : 'Error loading budget');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      if (isAdmin) fetchUsers();
      setSelectedUserId(currentUser.id);
    }
  }, [currentUser, isAdmin]);

  useEffect(() => {
    if (selectedUserId) {
      fetchBudgets();
    }
  }, [selectedUserId]);

  // ── Add new budget ──────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category) {
      toast.error(lang === 'ar' ? 'يرجى اختيار الفئة والمبلغ' : 'Please select category and amount');
      return;
    }
    const selectedUser = users.find(u => u.id === targetUserId);
    setSubmitting(true);
    try {
      const created = await budgetsApi.create({
        category,
        amount: parseFloat(amount),
        targetUserId: targetUserId,
      } as any);

      // 💡 تسجيل تاريخ إنشاء الميزانية لمنع المصروفات القديمة في هذه الفئة
      const nowStr = new Date().toISOString();
      if (created && (created as any).id) {
        budgetResets.set((created as any).id, nowStr);
      }
      budgetResets.setCategory(category, nowStr);

      toast.success(
        lang === 'ar'
          ? `تم حفظ ميزانية ${selectedUser?.name || ''} بنجاح`
          : `Budget for ${selectedUser?.name || ''} saved successfully`
      );
      setOpen(false);
      setAmount('');
      setCategory('');
      fetchBudgets();
    } catch (error: any) {
      toast.error(error.message || (lang === 'ar' ? 'حدث خطأ أثناء حفظ الميزانية' : 'Error saving budget'));
    } finally {
      setSubmitting(false);
    }
  };

  // ── Edit budget amount ──────────────────────────────────────────────────────
  const handleOpenEdit = (budget: Budget) => {
    setEditDialog({ isOpen: true, budget });
    setEditAmount(String(budget.amount));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDialog.budget || !editAmount) return;
    const parsed = parseFloat(editAmount);
    if (isNaN(parsed) || parsed <= 0) {
      toast.error(lang === 'ar' ? 'أدخل مبلغاً صحيحاً أكبر من الصفر' : 'Enter a valid amount greater than zero');
      return;
    }
    setEditSubmitting(true);
    try {
      await budgetsApi.update(editDialog.budget.id, parsed);
      toast.success(lang === 'ar' ? 'تم تعديل الميزانية بنجاح ✅' : 'Budget updated successfully ✅');
      setEditDialog({ isOpen: false, budget: null });
      fetchBudgets();
    } catch (error: any) {
      toast.error(error.message || (lang === 'ar' ? 'حدث خطأ أثناء التعديل' : 'Error updating budget'));
    } finally {
      setEditSubmitting(false);
    }
  };

  // ── Reset budget (new amount + zero spending from now) ─────────────────────
  const handleReset = async () => {
    if (!editDialog.budget || !editAmount) return;
    const parsed = parseFloat(editAmount);
    if (isNaN(parsed) || parsed <= 0) {
      toast.error(lang === 'ar' ? 'أدخل مبلغاً صحيحاً أكبر من الصفر' : 'Enter a valid amount');
      return;
    }
    setEditSubmitting(true);
    try {
      await budgetsApi.update(editDialog.budget.id, parsed);
      const nowStr = new Date().toISOString();
      budgetResets.set(editDialog.budget.id, nowStr);
      budgetResets.setCategory(editDialog.budget.category, nowStr);
      toast.success(lang === 'ar' ? 'تم تصفير المصروف وتحديث المبلغ ✅' : 'Budget reset successfully ✅');
      setEditDialog({ isOpen: false, budget: null });
      fetchBudgets();
    } catch (error: any) {
      toast.error(error.message || (lang === 'ar' ? 'حدث خطأ أثناء التصفير' : 'Error resetting budget'));
    } finally {
      setEditSubmitting(false);
    }
  };

  // ── Delete budget ───────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteDialog.budgetId) return;
    const idToDelete = deleteDialog.budgetId;
    const categoryToDelete = deleteDialog.categoryName;
    try {
      await budgetsApi.delete(idToDelete);

      // ✅ تحقق من قاعدة البيانات إن السجل اتحذف فعلاً
      const now = new Date();
      const afterDelete = await budgetsApi.getAll(
        selectedUserId === 'all' ? undefined : selectedUserId,
        now.getMonth() + 1,
        now.getFullYear()
      );
      const stillExists = afterDelete.some(
        (b) => b.id === idToDelete || b.category === categoryToDelete
      );

      if (stillExists) {
        toast.error(
          lang === 'ar'
            ? '⚠️ الحذف لم يكتمل في قاعدة البيانات — حاول مرة أخرى'
            : '⚠️ Delete did not complete in database — please try again'
        );
        fetchBudgets();
        return;
      }

      toast.success(lang === 'ar' ? 'تم حذف الميزانية بنجاح ✅' : 'Budget deleted successfully ✅');
      setDeleteDialog({ isOpen: false, budgetId: '', categoryName: '' });
      setBudgets(afterDelete);
    } catch (error: any) {
      console.error('[Budget Delete] Error:', error);
      toast.error(
        error.message ||
          (lang === 'ar'
            ? '❌ تعذّر الاتصال بالسيرفر — تأكد من الاتصال وحاول مرة أخرى'
            : '❌ Could not reach server — check connection and try again')
      );
      fetchBudgets();
    }
  };

  // ── Clear all budgets ─────────────────────────────────────────────────────
  const handleClearAll = async () => {
    setClearAllSubmitting(true);
    try {
      const uid = selectedUserId === 'all' ? undefined : selectedUserId;
      await budgetsApi.deleteAll(uid);
      toast.success(lang === 'ar' ? 'تم تفريغ جميع الميزانيات ✅' : 'All budgets cleared ✅');
      setClearAllOpen(false);
      setBudgets([]);
    } catch (error: any) {
      toast.error(error.message || (lang === 'ar' ? 'حدث خطأ أثناء التفريغ' : 'Error clearing budgets'));
    } finally {
      setClearAllSubmitting(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="flex flex-col gap-8 pb-12 animate-fade-in">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h2
              className="text-2xl sm:text-3xl font-black mb-1 flex items-center gap-3"
              style={{ color: 'var(--foreground)' }}
            >
              <Target className="w-8 h-8 text-indigo-400" />
              {lang === 'ar' ? 'الميزانية الشهرية' : 'Monthly Budget'}
            </h2>
            <p
              className="text-sm sm:text-base font-medium"
              style={{ color: 'var(--muted-foreground)' }}
            >
              {isAdmin
                ? (lang === 'ar' ? 'إدارة الخطط المالية لأفراد العائلة' : 'Manage financial plans for family members')
                : (lang === 'ar' ? 'راقب إنفاقك وحافظ على ميزانيتك' : 'Monitor your spending and maintain your budget')}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {budgets.length > 0 && (
              <Button
                onClick={() => setClearAllOpen(true)}
                variant="outline"
                className="w-full sm:w-auto border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 rounded-xl px-5 h-12 sm:h-11 font-bold active:scale-95 transition-all"
                style={{ background: 'transparent' }}
              >
                <Eraser className="w-4 h-4 ml-2" />
                {lang === 'ar' ? 'تفريغ الميزانية' : 'Clear All'}
              </Button>
            )}
            <Button
              onClick={() => {
                setTargetUserId(currentUser?.id || '');
                setOpen(true);
              }}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-6 h-12 sm:h-11 font-bold shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
            >
              <Plus className="w-5 h-5 ml-2" />
              {lang === 'ar' ? 'إضافة ميزانية' : 'Add Budget'}
            </Button>
          </div>
        </div>

        {isAdmin && (
          <div className="w-full sm:w-[300px]">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 block mr-1">
              {lang === 'ar' ? 'تصفية حسب المستخدم' : 'Filter by user'}
            </label>
            <Select value={selectedUserId} onValueChange={(val) => setSelectedUserId(val || '')}>
              <SelectTrigger
                className="w-full bg-white/5 border-white/10 rounded-xl h-12 shadow-inner"
                style={{ color: 'var(--foreground)' }}
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-400" />
                  <SelectValue placeholder={lang === 'ar' ? 'اختر المستخدم' : 'Select user'} />
                </div>
              </SelectTrigger>
                <SelectContent
                  className="border-white/10 rounded-xl"
                  style={{ background: 'var(--card)', color: 'var(--card-foreground)' }}
                >
                  <SelectItem value="all" className="font-bold text-indigo-400 focus:bg-white/10 rounded-lg">
                    {lang === 'ar' ? 'كل العائلة' : 'Entire Family'}
                  </SelectItem>
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

      {/* ── Add Budget Dialog ─────────────────────────────────────────────────── */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="border-white/10 rounded-[32px] p-8 outline-none sm:max-w-[440px]"
          style={{ background: 'var(--card)', color: 'var(--card-foreground)' }}
        >
          <DialogHeader className="text-right">
            <DialogTitle className="text-2xl font-black mb-6">
              {lang === 'ar' ? 'إضافة ميزانية جديدة' : 'Add New Budget'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            {isAdmin && (
              <div className="space-y-2 text-right">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-1">
                  {lang === 'ar' ? 'المستخدم المستهدف' : 'Target User'}
                </label>
                <Select value={targetUserId} onValueChange={(val) => setTargetUserId(val || '')}>
                  <SelectTrigger
                    className="w-full bg-white/5 border-white/10 text-right h-12 rounded-xl px-4"
                    style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    dir="rtl"
                  >
                    <SelectValue placeholder={lang === 'ar' ? 'اختر المستخدم' : 'Select user'} />
                  </SelectTrigger>
                  <SelectContent
                    className="border-white/10 rounded-xl"
                    style={{ background: 'var(--card)', color: 'var(--card-foreground)' }}
                    dir="rtl"
                  >
                    {users.map(u => (
                      <SelectItem key={u.id} value={u.id} className="focus:bg-white/10 rounded-lg">
                        {u.name} {u.id === currentUser?.id ? (lang === 'ar' ? '(أنت)' : '(You)') : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2 text-right">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-1">
                {lang === 'ar' ? 'الفئة' : 'Category'}
              </label>
              <Select value={category} onValueChange={(val) => setCategory(val || '')}>
                <SelectTrigger
                  className="w-full bg-white/5 border-white/10 text-right h-12 rounded-xl px-4"
                  style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  dir="rtl"
                >
                  <SelectValue placeholder={lang === 'ar' ? 'اختر الفئة' : 'Select category'} />
                </SelectTrigger>
                <SelectContent
                  className="border-white/10 rounded-[20px] max-h-[400px] py-2 pr-2 pl-6 custom-scrollbar"
                  style={{ background: 'var(--card)', color: 'var(--card-foreground)' }}
                  dir="rtl"
                >
                  {EXPENSE_CATEGORIES.map(c => {
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

            <div className="space-y-2 text-right">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-1">
                {lang === 'ar' ? 'المبلغ الأقصى' : 'Maximum Amount'}
              </label>
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
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">
                  {lang === 'ar' ? 'ج.م' : 'EGP'}
                </span>
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting || !amount || !category}
              className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-lg shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {submitting
                ? <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                : (lang === 'ar' ? 'حفظ الميزانية' : 'Save Budget')}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Edit Budget Dialog ────────────────────────────────────────────────── */}
      <Dialog open={editDialog.isOpen} onOpenChange={(v) => setEditDialog(prev => ({ ...prev, isOpen: v }))}>
        <DialogContent
          className="border-white/10 rounded-[32px] p-8 outline-none sm:max-w-[440px]"
          style={{ background: 'var(--card)', color: 'var(--card-foreground)' }}
        >
          <DialogHeader className="text-right">
            <DialogTitle className="text-2xl font-black mb-2">
              {lang === 'ar' ? 'تعديل الميزانية' : 'Edit Budget'}
            </DialogTitle>
            {editDialog.budget && (
              <p className="text-slate-400 text-sm font-semibold">
                {EXPENSE_CATEGORIES.find(c => c.value === editDialog.budget!.category)?.icon}{' '}
                {EXPENSE_CATEGORIES.find(c => c.value === editDialog.budget!.category)?.label || editDialog.budget.category}
              </p>
            )}
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-6 mt-4">
            <div className="space-y-2 text-right">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-1">
                {lang === 'ar' ? 'المبلغ الجديد' : 'New Amount'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  autoFocus
                  value={editAmount}
                  onChange={e => setEditAmount(e.target.value)}
                  className="w-full bg-white/5 border border-indigo-500/40 rounded-xl h-14 px-4 text-white font-black text-xl focus:border-indigo-500 outline-none transition-all text-center"
                  placeholder="0.00"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">
                  {lang === 'ar' ? 'ج.م' : 'EGP'}
                </span>
              </div>
              {editDialog.budget && (
                <p className="text-xs text-slate-500 text-right mr-1">
                  {lang === 'ar' ? 'المبلغ الحالي:' : 'Current amount:'}{' '}
                  <span className="text-indigo-400 font-bold">{formatCurrency(editDialog.budget.amount)}</span>
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3">
              {/* Save amount only (no reset) */}
              <Button
                type="submit"
                disabled={editSubmitting || !editAmount}
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-sm shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {editSubmitting
                  ? <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  : (lang === 'ar' ? '💾 تعديل المبلغ فقط' : '💾 Update Amount Only')}
              </Button>

              {/* Reset spending + new amount */}
              <Button
                type="button"
                disabled={editSubmitting || !editAmount}
                onClick={handleReset}
                className="w-full h-12 bg-orange-500 hover:bg-orange-400 text-white rounded-2xl font-black text-sm shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {editSubmitting
                  ? <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  : (lang === 'ar' ? '🔄 تصفير المصروف + مبلغ جديد' : '🔄 Reset Spending + New Amount')}
              </Button>

              <p className="text-[10px] text-slate-500 text-center leading-relaxed">
                {lang === 'ar'
                  ? '🔄 التصفير يجعل المصروف يبدأ من الصفر من الآن، مع تحديث الهدف'
                  : '🔄 Reset zeroes out past spending from now, with a new target amount'}
              </p>

              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialog({ isOpen: false, budget: null })}
                className="w-full h-11 font-bold rounded-2xl transition-all"
                style={{ borderColor: 'var(--border)', background: 'transparent', color: 'var(--foreground)' }}
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Main Content ─────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
            {lang === 'ar' ? 'جاري تحميل الميزانية' : 'Loading budgets'}
          </p>
        </div>
      ) : budgets.length === 0 ? (
        <div className="glass-card py-24 flex flex-col items-center justify-center text-center px-6">
          <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6">
            <Target className="w-10 h-10 text-slate-600" />
          </div>
          <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
            {lang === 'ar' ? 'لا توجد ميزانيات محددة' : 'No budgets set'}
          </h3>
          <p className="text-slate-500 max-w-xs mx-auto">
            {lang === 'ar'
              ? 'ابدأ بتحديد ميزانياتك الشهرية لمراقبة مصروفاتك بشكل فعال.'
              : 'Start by setting your monthly budgets to effectively monitor your expenses.'}
          </p>
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
                        <h4
                          className="font-bold break-words whitespace-normal"
                          style={{ color: 'var(--foreground)' }}
                        >
                          {EXPENSE_CATEGORIES.find(c => c.value === budget.category)?.label || budget.category}
                        </h4>
                      </div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                        {lang === 'ar' ? 'ميزانية شهرية' : 'Monthly Budget'}
                      </p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(budget)}
                      className="p-2 rounded-lg bg-white/5 text-slate-500 hover:bg-indigo-500/10 hover:text-indigo-400 transition-all active:scale-90"
                      title={lang === 'ar' ? 'تعديل المبلغ' : 'Edit amount'}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteDialog({ isOpen: true, budgetId: budget.id, categoryName: budget.category })}
                      className="p-2 rounded-lg bg-white/5 text-slate-500 hover:bg-red-500/10 hover:text-red-500 transition-all active:scale-90"
                      title={lang === 'ar' ? 'حذف' : 'Delete'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">
                        {lang === 'ar' ? 'المصروف' : 'Spent'}
                      </span>
                      <span className={cn(
                        "text-xl font-black tabular-nums",
                        isOverLimit ? "text-red-500" : isNearLimit ? "text-orange-500" : "text-white"
                      )}>
                        {formatCurrency(budget.spent)}
                      </span>
                    </div>
                    <div className="text-right flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">
                        {lang === 'ar' ? 'الهدف' : 'Target'}
                      </span>
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
                    <span className="text-[10px] font-black text-slate-500">
                      {Math.round(percent)}% {lang === 'ar' ? 'تم استهلاكه' : 'consumed'}
                    </span>
                    <span className={cn(
                      "text-[10px] font-black uppercase px-2 py-0.5 rounded-md",
                      isOverLimit ? "bg-red-500/10 text-red-500" : "bg-white/5 text-slate-400"
                    )}>
                      {isOverLimit
                        ? (lang === 'ar' ? 'تجاوزت الحد' : 'Limit Exceeded')
                        : `${lang === 'ar' ? 'متبقي:' : 'Remaining:'} ${formatCurrency(budget.remaining)}`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Delete Confirmation Dialog ────────────────────────────────────────── */}
      <Dialog open={deleteDialog.isOpen} onOpenChange={(isOpen) => setDeleteDialog(prev => ({ ...prev, isOpen }))}>
        <DialogContent
          className="border-white/10 p-8 overflow-hidden sm:max-w-[440px] rounded-[32px] outline-none"
          style={{ background: 'var(--card)', color: 'var(--card-foreground)' }}
        >
          <div className="text-right">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 mb-6">
              <Trash2 className="w-7 h-7" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-black" style={{ color: 'var(--foreground)' }}>
                {lang === 'ar' ? 'حذف الميزانية' : 'Delete Budget'}
              </DialogTitle>
            </DialogHeader>
            <p className="text-slate-400 text-base font-medium mt-4 leading-relaxed">
              {lang === 'ar' ? 'هل أنت متأكد من حذف ميزانية' : 'Are you sure you want to delete the budget for'}{' '}
              <span className="font-bold" style={{ color: 'var(--foreground)' }}>
                &quot;{EXPENSE_CATEGORIES.find(c => c.value === deleteDialog.categoryName)?.label || deleteDialog.categoryName}&quot;
              </span>
              {lang === 'ar' ? '؟ لا يمكن التراجع عن هذا الإجراء.' : '? This action cannot be undone.'}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row-reverse gap-3">
              <Button
                className="flex-1 h-14 bg-red-500 hover:bg-red-600 text-white font-black rounded-2xl shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all"
                onClick={handleDelete}
              >
                {lang === 'ar' ? 'حذف نهائي' : 'Delete Permanently'}
              </Button>
              <Button
                variant="outline"
                className="flex-1 h-14 font-bold rounded-2xl transition-all"
                style={{ borderColor: 'var(--border)', background: 'transparent', color: 'var(--foreground)' }}
                onClick={() => setDeleteDialog({ isOpen: false, budgetId: '', categoryName: '' })}
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Clear All Confirmation Dialog ─────────────────────────────────────── */}
      <Dialog open={clearAllOpen} onOpenChange={setClearAllOpen}>
        <DialogContent
          className="border-white/10 p-8 overflow-hidden sm:max-w-[440px] rounded-[32px] outline-none"
          style={{ background: 'var(--card)', color: 'var(--card-foreground)' }}
        >
          <div className="text-right">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 mb-6">
              <Eraser className="w-7 h-7" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-black" style={{ color: 'var(--foreground)' }}>
                {lang === 'ar' ? 'تفريغ الميزانية' : 'Clear All Budgets'}
              </DialogTitle>
            </DialogHeader>
            <p className="text-slate-400 text-base font-medium mt-4 leading-relaxed">
              {lang === 'ar'
                ? `سيتم حذف جميع الميزانيات (${budgets.length}) نهائياً. لا يمكن التراجع عن هذا الإجراء.`
                : `All ${budgets.length} budgets will be permanently deleted. This cannot be undone.`}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row-reverse gap-3">
              <Button
                className="flex-1 h-14 bg-red-500 hover:bg-red-600 text-white font-black rounded-2xl shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
                onClick={handleClearAll}
                disabled={clearAllSubmitting}
              >
                {clearAllSubmitting
                  ? <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  : (lang === 'ar' ? '🗑️ تفريغ كل الميزانيات' : '🗑️ Clear All Budgets')}
              </Button>
              <Button
                variant="outline"
                className="flex-1 h-14 font-bold rounded-2xl transition-all"
                style={{ borderColor: 'var(--border)', background: 'transparent', color: 'var(--foreground)' }}
                onClick={() => setClearAllOpen(false)}
                disabled={clearAllSubmitting}
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
