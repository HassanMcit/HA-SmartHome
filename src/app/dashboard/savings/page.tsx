'use client';

import { useEffect, useState } from 'react';
import { savingsApi, Saving, formatCurrency } from '@/lib/api';
import { Plus, Trash2, PiggyBank, Target } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useTheme } from '@/contexts/ThemeContext';

export default function SavingsPage() {
  const { theme } = useTheme();
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
    catch (err: any) { toast.error(err?.message || 'حدث خطأ في تحميل الأهداف'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSavings(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetAmount) { toast.error('الاسم والمبلغ المستهدف مطلوبان'); return; }
    setSubmitting(true);
    try {
      await savingsApi.create({ name, targetAmount: parseFloat(targetAmount), color });
      toast.success('تم إضافة الهدف بنجاح');
      setOpen(false); setName(''); setTargetAmount(''); setColor('#10b981'); fetchSavings();
    } catch (err: any) { toast.error(err?.message || 'حدث خطأ'); }
    finally { setSubmitting(false); }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !depositAmount) return;
    setSubmitting(true);
    try {
      await savingsApi.deposit(selectedId, parseFloat(depositAmount));
      toast.success('تم إضافة المبلغ بنجاح');
      setDepositOpen(false); setDepositAmount(''); setSelectedId(null); fetchSavings();
    } catch (err: any) { toast.error(err?.message || 'حدث خطأ'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!deleteDialog.savingId) return;
    try { 
      await savingsApi.delete(deleteDialog.savingId); 
      toast.success('تم حذف الهدف بنجاح'); 
      setDeleteDialog({ isOpen: false, savingId: '', savingName: '' });
      fetchSavings(); 
    }
    catch (err: any) { toast.error(err?.message || 'حدث خطأ أثناء الحذف'); }
  };

  const inputStyle = { background: '#242444', border: '1px solid #2d2d5e', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14, fontFamily: 'Cairo, sans-serif', outline: 'none', width: '100%', boxSizing: 'border-box' as const };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-1">أهداف الادخار</h2>
          <p className="text-slate-400 text-sm sm:text-base font-medium">خطط لمستقبلك وحقق أهدافك المالية</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={
            <Button className="w-full sm:w-auto bg-[#10b981] hover:bg-[#10b981]/90 text-white rounded-xl px-6 h-12 sm:h-11 font-bold shadow-lg shadow-[#10b981]/10 active:scale-95 transition-all flex items-center justify-center gap-2">
              <Plus className="w-5 h-5 ml-1" /> هدف جديد
            </Button>
          } />
          <DialogContent className="sm:max-w-[425px] bg-[#1a1a35] border-slate-700 text-white">
            <DialogHeader><DialogTitle className="text-right">إضافة هدف ادخار جديد</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} style={{ marginTop: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: '16px' }}>
                <label style={{ fontSize: 13, color: '#cbd5e1', fontWeight: 500 }}>اسم الهدف</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="مثال: سيارة جديدة"
                  style={{ ...inputStyle, textAlign: 'right' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: '16px' }}>
                <label style={{ fontSize: 13, color: '#cbd5e1', fontWeight: 500 }}>المبلغ المستهدف</label>
                <input type="number" step="0.01" required value={targetAmount} onChange={e => setTargetAmount(e.target.value)} dir="ltr" style={inputStyle} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: '24px' }}>
                <label style={{ fontSize: 13, color: '#cbd5e1', fontWeight: 500 }}>اللون</label>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <input type="color" value={color} onChange={e => setColor(e.target.value)}
                    style={{ width: 48, height: 48, padding: 4, background: '#242444', border: '1px solid #2d2d5e', borderRadius: 8, cursor: 'pointer' }} />
                  <span style={{ fontSize: 13, color: '#94a3b8' }}>اختر لوناً مميزاً للهدف</span>
                </div>
              </div>
              <button type="submit" disabled={submitting || !name || !targetAmount}
                style={{ width: '100%', background: '#10b981', border: 'none', borderRadius: 10, padding: '12px', color: '#fff', fontSize: 15, fontWeight: 600, fontFamily: 'Cairo, sans-serif', cursor: 'pointer', opacity: (submitting || !name || !targetAmount) ? 0.6 : 1 }}>
                {submitting ? 'جاري الحفظ...' : 'حفظ الهدف'}
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Deposit Dialog */}
      <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
        <DialogContent className="sm:max-w-[425px] bg-[#1a1a35] border-slate-700 text-white">
          <DialogHeader><DialogTitle className="text-right">إضافة مبلغ للهدف</DialogTitle></DialogHeader>
          <form onSubmit={handleDeposit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, color: '#cbd5e1', fontWeight: 500 }}>المبلغ</label>
              <input type="number" step="0.01" required value={depositAmount} onChange={e => setDepositAmount(e.target.value)} dir="ltr" style={inputStyle} />
            </div>
            <button type="submit" disabled={submitting || !depositAmount}
              style={{ background: '#10b981', border: 'none', borderRadius: 10, padding: '12px', color: '#fff', fontSize: 15, fontWeight: 600, fontFamily: 'Cairo, sans-serif', cursor: 'pointer', opacity: (submitting || !depositAmount) ? 0.6 : 1 }}>
              {submitting ? 'جاري الإضافة...' : 'إضافة المبلغ'}
            </button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-500 font-bold">جاري التحميل...</div>
      ) : savings.length === 0 ? (
        <div className="glass-card text-center py-24 text-slate-500 font-bold">لا توجد أهداف ادخار حالياً</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {savings.map((saving) => {
            const pct = Math.min(100, Math.round((saving.currentAmount / saving.targetAmount) * 100));
            const done = pct >= 100;
            return (
              <div key={saving.id} className="glass-card p-6 relative flex flex-col justify-between min-h-[200px]">
                {done && (
                  <div className="absolute top-4 left-4 text-[10px] font-black bg-emerald-500/10 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-xl border border-emerald-500/20 dark:border-emerald-500/20">
                    مكتمل 🎉
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
                        <div className="font-bold text-slate-200 text-sm mb-0.5 break-words whitespace-normal">{saving.name}</div>
                        <div className="text-xs text-slate-500">الهدف: {formatCurrency(saving.targetAmount)}</div>
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
                    <span className="text-slate-400">تم جمع: <span className="text-slate-200 font-bold">{formatCurrency(saving.currentAmount)}</span></span>
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
                      + إضافة مبلغ
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
        <DialogContent className="bg-[#1a1a35] border-slate-700 text-white p-0 overflow-hidden sm:max-w-[400px]">
          <div className="p-6 text-right">
            <DialogHeader>
              <DialogTitle className="text-[20px] font-bold text-white flex items-center justify-end gap-2">
                <Trash2 className="w-5 h-5 text-red-500" />
                حذف الهدف
              </DialogTitle>
            </DialogHeader>
            <p className="text-slate-400 text-[14px] mt-4 leading-relaxed">
              هل أنت متأكد من حذف هدف <span className="text-white font-bold">"{deleteDialog.savingName}"</span>؟ لا يمكن التراجع عن هذا الإجراء.
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
              onClick={() => setDeleteDialog({ isOpen: false, savingId: '', savingName: '' })}
            >
              إلغاء
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
