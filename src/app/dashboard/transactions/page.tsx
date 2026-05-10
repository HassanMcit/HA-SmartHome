'use client';

import { useEffect, useState } from 'react';
import { transactionsApi, Transaction, formatCurrency, getCategoryInfo, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/lib/api';
import { ArrowDownRight, ArrowUpRight, Plus, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; transactionId: string; description: string }>({
    isOpen: false,
    transactionId: '',
    description: '',
  });

  const fetchTransactions = async () => {
    try {
      const data = await transactionsApi.getAll();
      setTransactions(data);
    } catch { toast.error('حدث خطأ في تحميل المعاملات'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTransactions(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category) { toast.error('المبلغ والفئة مطلوبان'); return; }
    setSubmitting(true);
    try {
      await transactionsApi.create({ type, amount: parseFloat(amount), category, description, date });
      toast.success('تم إضافة المعاملة بنجاح');
      setOpen(false); setAmount(''); setDescription(''); setCategory('');
      setDate(new Date().toISOString().split('T')[0]);
      fetchTransactions();
    } catch { toast.error('حدث خطأ أثناء الإضافة'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!deleteDialog.transactionId) return;
    try { 
      await transactionsApi.delete(deleteDialog.transactionId); 
      toast.success('تم حذف المعاملة بنجاح'); 
      setDeleteDialog({ isOpen: false, transactionId: '', description: '' });
      fetchTransactions(); 
    }
    catch { toast.error('حدث خطأ أثناء الحذف'); }
  };

  const cats = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: 4 }}>المعاملات المالية</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>سجل بجميع إيراداتك ومصروفاتك</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={
            <Button style={{ background: '#6366f1', border: 'none', borderRadius: 10, padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Cairo, sans-serif', cursor: 'pointer' }}>
              <Plus style={{ width: 16, height: 16 }} /> إضافة معاملة
            </Button>
          } />
          <DialogContent className="sm:max-w-[425px] bg-[#1a1a35] border-slate-700 text-white">
            <DialogHeader><DialogTitle className="text-right">إضافة معاملة جديدة</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="flex gap-1 p-1 bg-[#0f0f23] rounded-lg">
                {(['expense', 'income'] as const).map(t => (
                  <button key={t} type="button" onClick={() => { setType(t); setCategory(''); }}
                    className={`flex-1 py-2 rounded-md font-semibold text-sm transition-all ${type === t ? (t === 'expense' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white') : 'bg-transparent text-slate-400'}`}>
                    {t === 'expense' ? 'مصروف' : 'إيراد'}
                  </button>
                ))}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] text-slate-300 font-medium">المبلغ</label>
                <input type="number" step="0.01" required value={amount} onChange={e => setAmount(e.target.value)} dir="ltr"
                  className="bg-[#242444] border border-[#2d2d5e] rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-indigo-500 transition-colors" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] text-slate-300 font-medium">الفئة</label>
                <Select value={category} onValueChange={(val) => setCategory(val || '')}>
                  <SelectTrigger className="bg-[#242444] border-slate-700 text-right" dir="rtl"><SelectValue placeholder="اختر الفئة" /></SelectTrigger>
                  <SelectContent className="bg-[#242444] border-slate-700 text-white" dir="rtl">
                    {cats.map(c => <SelectItem key={c.value} value={c.value}>{c.icon} {c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] text-slate-300 font-medium">الوصف (اختياري)</label>
                <input type="text" value={description} onChange={e => setDescription(e.target.value)}
                  className="bg-[#242444] border border-[#2d2d5e] rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-indigo-500 transition-colors text-right" />
              </div>
              <div className="flex flex-col gap-1.5 mb-2">
                <label className="text-[13px] text-slate-300 font-medium">التاريخ</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} dir="ltr"
                  className="bg-[#242444] border border-[#2d2d5e] rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-indigo-500 transition-colors" />
              </div>
              <button type="submit" disabled={submitting || !amount || !category}
                className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-lg py-3 text-[15px] font-semibold transition-colors mt-2">
                {submitting ? 'جاري الحفظ...' : 'حفظ المعاملة'}
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>جاري التحميل...</div>
        ) : transactions.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>لا توجد معاملات بعد</div>
        ) : transactions.map((tx) => {
          const cat = getCategoryInfo(tx.category, tx.type);
          return (
            <div key={tx.id} className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0,
                  background: tx.type === 'income' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)' }}>
                  {cat.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: 15, marginBottom: 4 }}>{tx.description || cat.label}</div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 99, background: '#242444', color: '#94a3b8', border: '1px solid #2d2d5e' }}>{cat.label}</span>
                    <span style={{ fontSize: 12, color: '#64748b' }}>•</span>
                    <span style={{ fontSize: 12, color: '#64748b' }}>{new Date(tx.date).toLocaleDateString('ar-EG')}</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                <div style={{ fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', gap: 4, color: tx.type === 'income' ? '#10b981' : '#ef4444' }}>
                  {tx.type === 'income' ? <ArrowUpRight style={{ width: 18, height: 18 }} /> : <ArrowDownRight style={{ width: 18, height: 18 }} />}
                  {formatCurrency(tx.amount)}
                </div>
                <button onClick={() => setDeleteDialog({ isOpen: true, transactionId: tx.id, description: tx.description || cat.label })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 0 }}>
                  <Trash2 style={{ width: 15, height: 15 }} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteDialog.isOpen} onOpenChange={(isOpen) => setDeleteDialog(prev => ({ ...prev, isOpen }))}>
        <DialogContent className="bg-[#1a1a35] border-slate-700 text-white p-0 overflow-hidden sm:max-w-[400px]">
          <div className="p-6 text-right">
            <DialogHeader>
              <DialogTitle className="text-[20px] font-bold text-white flex items-center justify-end gap-2">
                <Trash2 className="w-5 h-5 text-red-500" />
                حذف المعاملة
              </DialogTitle>
            </DialogHeader>
            <p className="text-slate-400 text-[14px] mt-4 leading-relaxed">
              هل أنت متأكد من حذف معاملة <span className="text-white font-bold">"{deleteDialog.description}"</span>؟ لا يمكن التراجع عن هذا الإجراء.
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
              onClick={() => setDeleteDialog({ isOpen: false, transactionId: '', description: '' })}
            >
              إلغاء
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
