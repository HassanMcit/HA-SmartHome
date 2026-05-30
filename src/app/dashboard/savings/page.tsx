'use client';

import { useEffect, useState } from 'react';
import { savingsApi, Saving, formatCurrency } from '@/lib/api';
import { Plus, Trash2, PiggyBank, Target } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function SavingsPage() {
  const { theme } = useTheme();
  const { lang } = useLanguage();
  const [savings, setSavings] = useState<Saving[]>([]);
  const [loading, setLoading] = useState(true);

  const getGoalColor = (hex: string) => {
    if (theme !== 'light') return hex;
    const color = hex.replace('#', '');
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    if (yiq > 170) {
      const darken = (val: number) => Math.max(0, Math.floor(val * 0.65));
      const newR = darken(r).toString(16).padStart(2, '0');
      const newG = darken(g).toString(16).padStart(2, '0');
      const newB = darken(b).toString(16).padStart(2, '0');
      return `#${newR}${newG}${newB}`;
    }
    return hex;
  };
  const [open, setOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [color, setColor] = useState('#10b981');
  const [depositAmount, setDepositAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; savingId: string; savingName: string }>({
    isOpen: false,
    savingId: '',
    savingName: '',
  });

  const fetchSavings = async () => {
    try { const data = await savingsApi.getAll(); setSavings(data); }
    catch (err: any) { toast.error(err?.message || (lang === 'ar' ? 'حدث خطأ في تحميل الأهداف' : 'Error loading goals')); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSavings(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetAmount) {
      toast.error(lang === 'ar' ? 'الاسم والمبلغ المستهدف مطلوبان' : 'Name and target amount are required');
      return;
    }
    setSubmitting(true);
    try {
      await savingsApi.create({ name, targetAmount: parseFloat(targetAmount), color });
      toast.success(lang === 'ar' ? 'تم إضافة الهدف بنجاح' : 'Goal added successfully');
      setOpen(false); setName(''); setTargetAmount(''); setColor('#10b981'); fetchSavings();
    } catch (err: any) { toast.error(err?.message || (lang === 'ar' ? 'حدث خطأ' : 'An error occurred')); }
    finally { setSubmitting(false); }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !depositAmount) return;
    setSubmitting(true);
    try {
      await savingsApi.deposit(selectedId, parseFloat(depositAmount));
      toast.success(lang === 'ar' ? 'تم إضافة المبلغ بنجاح' : 'Amount added successfully');
      setDepositOpen(false); setDepositAmount(''); setSelectedId(null); fetchSavings();
    } catch (err: any) { toast.error(err?.message || (lang === 'ar' ? 'حدث خطأ' : 'An error occurred')); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!deleteDialog.savingId) return;
    try {
      await savingsApi.delete(deleteDialog.savingId);
      toast.success(lang === 'ar' ? 'تم حذف الهدف بنجاح' : 'Goal deleted successfully');
      setDeleteDialog({ isOpen: false, savingId: '', savingName: '' });
      fetchSavings();
    }
    catch (err: any) { toast.error(err?.message || (lang === 'ar' ? 'حدث خطأ أثناء الحذف' : 'Error while deleting')); }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black mb-1" style={{ color: 'var(--foreground)' }}>
            {lang === 'ar' ? 'أهداف الادخار' : 'Savings Goals'}
          </h2>
          <p className="text-sm sm:text-base font-medium" style={{ color: 'var(--muted-foreground)' }}>
            {lang === 'ar' ? 'خطط لمستقبلك وحقق أهدافك المالية' : 'Plan your future and achieve your financial goals'}
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={
            <Button className="w-full sm:w-auto bg-[#10b981] hover:bg-[#10b981]/90 text-white rounded-xl px-6 h-12 sm:h-11 font-bold shadow-lg shadow-[#10b981]/10 active:scale-95 transition-all flex items-center justify-center gap-2">
              <Plus className="w-5 h-5 ml-1" /> {lang === 'ar' ? 'هدف جديد' : 'New Goal'}
            </Button>
          } />
          <DialogContent className="sm:max-w-[425px] border-slate-700" style={{ background: 'var(--card)', color: 'var(--card-foreground)' }}>
            <DialogHeader>
              <DialogTitle className="text-right">
                {lang === 'ar' ? 'إضافة هدف ادخار جديد' : 'Add New Savings Goal'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} style={{ marginTop: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: '16px' }}>
                <label style={{ fontSize: 13, color: 'var(--muted-foreground)', fontWeight: 500 }}>
                  {lang === 'ar' ? 'اسم الهدف' : 'Goal Name'}
                </label>
                <input
                  type="text" required value={name} onChange={e => setName(e.target.value)}
                  placeholder={lang === 'ar' ? 'مثال: سيارة جديدة' : 'Example: New Car'}
                  className="bills-input" style={{ textAlign: 'right' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: '16px' }}>
                <label style={{ fontSize: 13, color: 'var(--muted-foreground)', fontWeight: 500 }}>
                  {lang === 'ar' ? 'المبلغ المستهدف' : 'Target Amount'}
                </label>
                <input type="number" step="0.01" required value={targetAmount} onChange={e => setTargetAmount(e.target.value)} dir="ltr" className="bills-input" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: '24px' }}>
                <label style={{ fontSize: 13, color: 'var(--muted-foreground)', fontWeight: 500 }}>
                  {lang === 'ar' ? 'اللون' : 'Color'}
                </label>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <input type="color" value={color} onChange={e => setColor(e.target.value)}
                    style={{ width: 48, height: 48, padding: 4, background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer' }} />
                  <span style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>
                    {lang === 'ar' ? 'اختر لوناً مميزاً للهدف' : 'Choose a unique color for the goal'}
                  </span>
                </div>
              </div>
              <button type="submit" disabled={submitting || !name || !targetAmount}
                style={{ width: '100%', background: '#10b981', border: 'none', borderRadius: 10, padding: '12px', color: '#fff', fontSize: 15, fontWeight: 600, fontFamily: 'Cairo, sans-serif', cursor: 'pointer', opacity: (submitting || !name || !targetAmount) ? 0.6 : 1 }}>
                {submitting
                  ? (lang === 'ar' ? 'جاري الحفظ...' : 'Saving...')
                  : (lang === 'ar' ? 'حفظ الهدف' : 'Save Goal')}
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Deposit Dialog */}
      <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
        <DialogContent className="sm:max-w-[425px] border-slate-700" style={{ background: 'var(--card)', color: 'var(--card-foreground)' }}>
          <DialogHeader>
            <DialogTitle className="text-right">
              {lang === 'ar' ? 'إضافة مبلغ للهدف' : 'Add Amount to Goal'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleDeposit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, color: 'var(--muted-foreground)', fontWeight: 500 }}>
                {lang === 'ar' ? 'المبلغ' : 'Amount'}
              </label>
              <input type="number" step="0.01" required value={depositAmount} onChange={e => setDepositAmount(e.target.value)} dir="ltr" className="bills-input" />
            </div>
            <button type="submit" disabled={submitting || !depositAmount}
              style={{ background: '#10b981', border: 'none', borderRadius: 10, padding: '12px', color: '#fff', fontSize: 15, fontWeight: 600, fontFamily: 'Cairo, sans-serif', cursor: 'pointer', opacity: (submitting || !depositAmount) ? 0.6 : 1 }}>
              {submitting
                ? (lang === 'ar' ? 'جاري الإضافة...' : 'Adding...')
                : (lang === 'ar' ? 'إضافة المبلغ' : 'Add Amount')}
            </button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-12 font-bold" style={{ color: 'var(--muted-foreground)' }}>
          {lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}
        </div>
      ) : savings.length === 0 ? (
        <div className="glass-card text-center py-24 font-bold" style={{ color: 'var(--muted-foreground)' }}>
          {lang === 'ar' ? 'لا توجد أهداف ادخار حالياً' : 'No savings goals yet'}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {savings.map((saving) => {
            const pct = Math.min(100, Math.round((saving.currentAmount / saving.targetAmount) * 100));
            const done = pct >= 100;
            return (
              <div key={saving.id} className="glass-card p-6 relative flex flex-col justify-between min-h-[200px]">
                {done && (
                  <div className="absolute top-4 left-4 text-[10px] font-black bg-emerald-500/10 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-xl border border-emerald-500/20 dark:border-emerald-500/20">
                    {lang === 'ar' ? 'مكتمل 🎉' : 'Complete 🎉'}
                  </div>
                )}
                <div>
                  <div className="flex justify-between items-start mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors" style={{
                        backgroundColor: `${getGoalColor(saving.color)}15`,
                        color: getGoalColor(saving.color)
                      }}>
                        {done ? <Target className="w-5 h-5" /> : <PiggyBank className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="font-bold text-sm mb-0.5 break-words whitespace-normal" style={{ color: 'var(--foreground)' }}>{saving.name}</div>
                        <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                          {lang === 'ar' ? 'الهدف:' : 'Target:'} {formatCurrency(saving.targetAmount)}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setDeleteDialog({ isOpen: true, savingId: saving.id, savingName: saving.name })}
                      className="p-2 rounded-lg bg-white/5 text-slate-500 hover:bg-red-500/10 hover:text-red-500 transition-all active:scale-90 shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex justify-between items-center mb-2 text-xs">
                    <span style={{ color: 'var(--muted-foreground)' }}>
                      {lang === 'ar' ? 'تم جمع:' : 'Collected:'}{' '}
                      <span className="font-bold" style={{ color: 'var(--foreground)' }}>{formatCurrency(saving.currentAmount)}</span>
                    </span>
                    <span className="font-black text-sm" style={{ color: getGoalColor(saving.color) }}>{pct}%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 dark:bg-[#1e1e3f] rounded-full overflow-hidden border border-slate-200 dark:border-[#2d2d5e] p-0.5">
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, backgroundColor: getGoalColor(saving.color) }} />
                  </div>
                </div>
                {!done && (
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={() => { setSelectedId(saving.id); setDepositOpen(true); }}
                      className="border border-slate-200 dark:border-[#2d2d5e] hover:border-slate-400 dark:hover:border-slate-500 rounded-lg px-3.5 py-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 text-xs transition-colors cursor-pointer"
                    >
                      + {lang === 'ar' ? 'إضافة مبلغ' : 'Add Amount'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteDialog.isOpen} onOpenChange={(isOpen) => setDeleteDialog(prev => ({ ...prev, isOpen }))}>
        <DialogContent className="border p-0 overflow-hidden sm:max-w-[400px]" style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--card-foreground)' }}>
          <div className="p-6 text-right">
            <DialogHeader>
              <DialogTitle className="text-[20px] font-bold flex items-center justify-end gap-2">
                <Trash2 className="w-5 h-5 text-red-500" />
                {lang === 'ar' ? 'حذف الهدف' : 'Delete Goal'}
              </DialogTitle>
            </DialogHeader>
            <p className="text-[14px] mt-4 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
              {lang === 'ar'
                ? <>هل أنت متأكد من حذف هدف <span className="font-bold" style={{ color: 'var(--foreground)' }}>"{deleteDialog.savingName}"</span>؟ لا يمكن التراجع عن هذا الإجراء.</>
                : <>Are you sure you want to delete the goal <span className="font-bold" style={{ color: 'var(--foreground)' }}>"{deleteDialog.savingName}"</span>? This action cannot be undone.</>
              }
            </p>
          </div>
          <div className="border-t p-4 flex gap-3 flex-row-reverse" style={{ background: 'var(--secondary)', borderColor: 'var(--border)' }}>
            <Button
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2"
              onClick={handleDelete}
            >
              {lang === 'ar' ? 'حذف نهائي' : 'Delete Permanently'}
            </Button>
            <Button
              variant="outline"
              className="flex-1 font-bold py-2"
              style={{ borderColor: 'var(--border)', background: 'transparent', color: 'var(--foreground)' }}
              onClick={() => setDeleteDialog({ isOpen: false, savingId: '', savingName: '' })}
            >
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
