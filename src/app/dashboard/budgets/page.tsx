'use client';

import { useEffect, useState } from 'react';
import { budgetsApi, Budget, formatCurrency, getCategoryInfo, EXPENSE_CATEGORIES } from '@/lib/api';
import { Plus, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; budgetId: string; categoryName: string }>({
    isOpen: false,
    budgetId: '',
    categoryName: '',
  });

  const fetchBudgets = async () => {
    try { const data = await budgetsApi.getAll(); setBudgets(data); }
    catch { toast.error('حدث خطأ في تحميل الميزانية'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBudgets(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category) { toast.error('جميع الحقول مطلوبة'); return; }
    setSubmitting(true);
    try {
      await budgetsApi.create({ category, amount: parseFloat(amount) });
      toast.success('تم إضافة الميزانية بنجاح');
      setOpen(false); setAmount(''); setCategory(''); fetchBudgets();
    } catch { toast.error('حدث خطأ أثناء الإضافة'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!deleteDialog.budgetId) return;
    try { 
      await budgetsApi.delete(deleteDialog.budgetId); 
      toast.success('تم حذف الميزانية بنجاح'); 
      setDeleteDialog({ isOpen: false, budgetId: '', categoryName: '' });
      fetchBudgets(); 
    }
    catch { toast.error('حدث خطأ أثناء الحذف'); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: 4 }}>الميزانية الشهرية</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>حدد ميزانيتك لكل فئة وراقب إنفاقك</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={
            <Button style={{ background: '#6366f1', border: 'none', borderRadius: 10, padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Cairo, sans-serif', cursor: 'pointer' }}>
              <Plus style={{ width: 16, height: 16 }} /> إضافة ميزانية
            </Button>
          } />
          <DialogContent className="sm:max-w-[425px] bg-[#1a1a35] border-slate-700 text-white">
            <DialogHeader><DialogTitle className="text-right">إضافة ميزانية جديدة</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: '16px' }}>
                <label style={{ fontSize: 13, color: '#cbd5e1', fontWeight: 500 }}>الفئة</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="bg-[#242444] border-slate-700 text-right" dir="rtl"><SelectValue placeholder="اختر الفئة" /></SelectTrigger>
                  <SelectContent className="bg-[#242444] border-slate-700 text-white" dir="rtl">
                    {EXPENSE_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.icon} {c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: '24px' }}>
                <label style={{ fontSize: 13, color: '#cbd5e1', fontWeight: 500 }}>المبلغ الأقصى</label>
                <input type="number" step="0.01" required value={amount} onChange={e => setAmount(e.target.value)} dir="ltr"
                  style={{ background: '#242444', border: '1px solid #2d2d5e', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14, fontFamily: 'Cairo, sans-serif', outline: 'none' }} />
              </div>
              <button type="submit" disabled={submitting || !amount || !category}
                style={{ width: '100%', background: '#6366f1', border: 'none', borderRadius: 10, padding: '12px', color: '#fff', fontSize: 15, fontWeight: 600, fontFamily: 'Cairo, sans-serif', cursor: 'pointer', opacity: (submitting || !amount || !category) ? 0.6 : 1 }}>
                {submitting ? 'جاري الحفظ...' : 'حفظ الميزانية'}
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>جاري التحميل...</div>
      ) : budgets.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>لا توجد ميزانيات لهذا الشهر</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
          {budgets.map((budget) => {
            const cat = getCategoryInfo(budget.category, 'expense');
            const pct = Math.min(100, Math.round((budget.spent / budget.amount) * 100));
            const over = budget.spent > budget.amount;
            const barColor = over ? '#ef4444' : pct > 85 ? '#f59e0b' : '#6366f1';
            return (
              <div key={budget.id} className="glass-card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 10, background: '#242444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{cat.icon}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: '#e2e8f0', marginBottom: 2 }}>{cat.label}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>الحد: {formatCurrency(budget.amount)}</div>
                    </div>
                  </div>
                  <button onClick={() => setDeleteDialog({ isOpen: true, budgetId: budget.id, categoryName: cat.label })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 0, flexShrink: 0 }}>
                    <Trash2 style={{ width: 15, height: 15 }} />
                  </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                  <span style={{ color: '#94a3b8' }}>صُرف: <span style={{ color: over ? '#ef4444' : '#e2e8f0', fontWeight: 600 }}>{formatCurrency(budget.spent)}</span></span>
                  <span style={{ color: '#94a3b8' }}>متبقي: <span style={{ color: over ? '#ef4444' : '#10b981', fontWeight: 600 }}>{formatCurrency(budget.remaining)}</span></span>
                </div>
                <div style={{ width: '100%', height: 10, background: '#1e1e3f', borderRadius: 99, overflow: 'hidden', border: '1px solid #2d2d5e' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 99, transition: 'width 0.5s ease' }} />
                </div>
                <div style={{ fontSize: 12, marginTop: 6, color: over ? '#ef4444' : '#64748b', textAlign: 'left' }}>
                  {pct}%{over ? ' (تجاوز الميزانية!)' : ''}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteDialog.isOpen} onOpenChange={(isOpen) => setDeleteDialog(prev => ({ ...prev, isOpen }))}>
        <DialogContent className="bg-[#1a1a35] border-slate-700 text-white p-0 overflow-hidden sm:max-w-[400px]">
          <div className="p-6 text-right">
            <DialogHeader>
              <DialogTitle className="text-[20px] font-bold text-white flex items-center justify-end gap-2">
                <Trash2 className="w-5 h-5 text-red-500" />
                حذف الميزانية
              </DialogTitle>
            </DialogHeader>
            <p className="text-slate-400 text-[14px] mt-4 leading-relaxed">
              هل أنت متأكد من حذف ميزانية فئة <span className="text-white font-bold">"{deleteDialog.categoryName}"</span>؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
          </div>
          <div className="bg-[#242444]/50 border-t border-slate-700 p-4 flex gap-3 flex-row-reverse">
            <Button 
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2" 
              onClick={handleDelete}
            >
              حذف نهائي
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 border-slate-700 bg-transparent text-slate-300 hover:text-white hover:bg-slate-700 py-2" 
              onClick={() => setDeleteDialog({ isOpen: false, budgetId: '', categoryName: '' })}
            >
              إلغاء
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
