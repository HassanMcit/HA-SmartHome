'use client';

import { useEffect, useState } from 'react';
import { savingsApi, Saving, formatCurrency } from '@/lib/api';
import { Plus, Trash2, PiggyBank, Target } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function SavingsPage() {
  const [savings, setSavings] = useState<Saving[]>([]);
  const [loading, setLoading] = useState(true);
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
    catch { toast.error('حدث خطأ في تحميل الأهداف'); }
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
    } catch { toast.error('حدث خطأ'); }
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
    } catch { toast.error('حدث خطأ'); }
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
    catch { toast.error('حدث خطأ أثناء الحذف'); }
  };

  const inputStyle = { background: '#242444', border: '1px solid #2d2d5e', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14, fontFamily: 'Cairo, sans-serif', outline: 'none', width: '100%', boxSizing: 'border-box' as const };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: 4 }}>أهداف الادخار</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>خطط لمستقبلك وحقق أهدافك المالية</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={
            <Button style={{ background: '#10b981', border: 'none', borderRadius: 10, padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Cairo, sans-serif', cursor: 'pointer' }}>
              <Plus style={{ width: 16, height: 16 }} /> هدف جديد
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
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>جاري التحميل...</div>
      ) : savings.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>لا توجد أهداف ادخار حالياً</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
          {savings.map((saving) => {
            const pct = Math.min(100, Math.round((saving.currentAmount / saving.targetAmount) * 100));
            const done = pct >= 100;
            return (
              <div key={saving.id} className="glass-card" style={{ padding: '1.5rem', position: 'relative' }}>
                {done && (
                  <div style={{ position: 'absolute', top: 12, left: 12, fontSize: 11, fontWeight: 700, background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '3px 10px', borderRadius: 99 }}>
                    مكتمل 🎉
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 46, height: 46, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      background: `linear-gradient(135deg, ${saving.color}, #1a1a35)`
                    }}>
                      {done ? <Target style={{ width: 22, height: 22, color: '#fff' }} /> : <PiggyBank style={{ width: 22, height: 22, color: '#fff' }} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: '#e2e8f0', marginBottom: 2 }}>{saving.name}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>الهدف: {formatCurrency(saving.targetAmount)}</div>
                    </div>
                  </div>
                  <button onClick={() => setDeleteDialog({ isOpen: true, savingId: saving.id, savingName: saving.name })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 0, flexShrink: 0 }}>
                    <Trash2 style={{ width: 15, height: 15 }} />
                  </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                  <span style={{ color: '#94a3b8' }}>تم جمع: <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{formatCurrency(saving.currentAmount)}</span></span>
                  <span style={{ fontWeight: 700, fontSize: 15, color: saving.color }}>{pct}%</span>
                </div>
                <div style={{ width: '100%', height: 12, background: '#1e1e3f', borderRadius: 99, overflow: 'hidden', border: '1px solid #2d2d5e', padding: 2 }}>
                  <div style={{ height: '100%', width: `${pct}%`, borderRadius: 99, background: saving.color, transition: 'width 1s ease' }} />
                </div>
                {!done && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                    <button onClick={() => { setSelectedId(saving.id); setDepositOpen(true); }}
                      style={{ background: 'transparent', border: '1px solid #2d2d5e', borderRadius: 8, padding: '6px 14px', color: '#94a3b8', fontSize: 13, fontFamily: 'Cairo, sans-serif', cursor: 'pointer' }}>
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
