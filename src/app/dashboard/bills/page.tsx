'use client';

import { useEffect, useState } from 'react';
import { billsApi, Bill, formatCurrency } from '@/lib/api';
import { Plus, Trash2, CheckCircle2, Circle, AlertCircle, Pencil } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function BillsPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; billId: string; billName: string }>({
    isOpen: false,
    billId: '',
    billName: '',
  });
  const [editDialog, setEditDialog] = useState<{ isOpen: boolean; bill: Bill | null }>({
    isOpen: false,
    bill: null,
  });

  const [editName, setEditName] = useState('');
  const [editAmount, setEditAmount] = useState('');

  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchBills = async () => {
    try { const data = await billsApi.getAll(); setBills(data); }
    catch { toast.error('حدث خطأ في تحميل الفواتير'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBills(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount || !dueDate) { toast.error('جميع الحقول مطلوبة'); return; }
    setSubmitting(true);
    try {
      await billsApi.create({ name, amount: parseFloat(amount), dueDate, isRecurring });
      toast.success('تم إضافة الفاتورة بنجاح');
      setOpen(false); setName(''); setAmount(''); setDueDate(''); setIsRecurring(false); fetchBills();
    } catch { toast.error('حدث خطأ'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!deleteDialog.billId) return;
    try { 
      await billsApi.delete(deleteDialog.billId); 
      toast.success('تم حذف الفاتورة بنجاح'); 
      setDeleteDialog({ isOpen: false, billId: '', billName: '' });
      fetchBills(); 
    }
    catch { toast.error('حدث خطأ أثناء الحذف'); }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDialog.bill || !editName || !editAmount) return;
    setSubmitting(true);
    try {
      await billsApi.update(editDialog.bill.id, {
        name: editName,
        amount: parseFloat(editAmount),
      });
      toast.success('تم تحديث الفاتورة بنجاح');
      setEditDialog({ isOpen: false, bill: null });
      fetchBills();
    } catch (error) {
      toast.error('حدث خطأ أثناء التحديث');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id: string) => {
    if (togglingId) return; // Prevent double click
    setTogglingId(id);
    try { await billsApi.toggle(id); fetchBills(); }
    catch { toast.error('حدث خطأ'); }
    finally { setTogglingId(null); }
  };

  const openEdit = (bill: Bill) => {
    setEditDialog({ isOpen: true, bill });
    setEditName(bill.name);
    setEditAmount(bill.amount.toString());
  };

  const inputStyle = { background: '#242444', border: '1px solid #2d2d5e', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14, fontFamily: 'Cairo, sans-serif', outline: 'none', width: '100%', boxSizing: 'border-box' as const };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: 4 }}>الفواتير والالتزامات</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>تتبع فواتيرك ولا تفوت أي موعد استحقاق</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={
            <Button style={{ background: '#f59e0b', border: 'none', borderRadius: 10, padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Cairo, sans-serif', cursor: 'pointer' }}>
              <Plus style={{ width: 16, height: 16 }} /> إضافة فاتورة
            </Button>
          } />
          <DialogContent className="sm:max-w-[425px] bg-[#1a1a35] border-slate-700 text-white">
            <DialogHeader><DialogTitle className="text-right">إضافة فاتورة جديدة</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, color: '#cbd5e1', fontWeight: 500 }}>اسم الفاتورة</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="مثال: كهرباء، إنترنت"
                  style={{ ...inputStyle, textAlign: 'right' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, color: '#cbd5e1', fontWeight: 500 }}>المبلغ</label>
                <input type="number" step="0.01" required value={amount} onChange={e => setAmount(e.target.value)} dir="ltr" style={inputStyle} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, color: '#cbd5e1', fontWeight: 500 }}>تاريخ الاستحقاق</label>
                <input type="date" required value={dueDate} onChange={e => setDueDate(e.target.value)} dir="ltr" style={inputStyle} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#242444', borderRadius: 10, border: '1px solid #2d2d5e' }}>
                <label style={{ fontSize: 14, color: '#cbd5e1', fontWeight: 500, cursor: 'pointer' }}>فاتورة متكررة شهرياً؟</label>
                <input type="checkbox" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)}
                  style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#f59e0b' }} />
              </div>
              <button type="submit" disabled={submitting || !name || !amount || !dueDate}
                style={{ background: '#f59e0b', border: 'none', borderRadius: 10, padding: '12px', color: '#fff', fontSize: 15, fontWeight: 600, fontFamily: 'Cairo, sans-serif', cursor: 'pointer', marginTop: 4, opacity: (submitting || !name || !amount || !dueDate) ? 0.6 : 1 }}>
                {submitting ? 'جاري الحفظ...' : 'حفظ الفاتورة'}
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>جاري التحميل...</div>
        ) : bills.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>لا توجد فواتير حالياً</div>
        ) : bills.map((bill) => {
          const late = !bill.isPaid && new Date(bill.dueDate) < new Date();
          const isToggling = togglingId === bill.id;
          return (
            <div key={bill.id} className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', opacity: bill.isPaid ? 0.8 : 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <button onClick={() => handleToggle(bill.id)} disabled={isToggling}
                  style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', cursor: isToggling ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s',
                    background: bill.isPaid ? 'rgba(16,185,129,0.15)' : '#242444',
                    color: bill.isPaid ? '#10b981' : '#64748b', opacity: isToggling ? 0.5 : 1 }}>
                  {isToggling ? <div className="w-5 h-5 border-2 border-t-transparent border-current rounded-full animate-spin" /> : (bill.isPaid ? <CheckCircle2 style={{ width: 20, height: 20 }} /> : <Circle style={{ width: 20, height: 20 }} />)}
                </button>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4, color: bill.isPaid ? '#10b981' : '#e2e8f0', textDecoration: bill.isPaid ? 'line-through' : 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {bill.name}
                    {bill.user && <span style={{ fontSize: 11, background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', padding: '2px 8px', borderRadius: '10px', textDecoration: 'none' }}>{bill.user.name}</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12 }}>
                    <span style={{ color: late ? '#ef4444' : '#64748b', display: 'flex', alignItems: 'center', gap: 4, fontWeight: late ? 600 : 400 }}>
                      {late && <AlertCircle style={{ width: 12, height: 12 }} />}
                      {new Date(bill.dueDate).toLocaleDateString('ar-EG')}
                    </span>
                    {bill.isRecurring && <><span style={{ color: '#475569' }}>•</span><span style={{ color: '#818cf8' }}>متكررة</span></>}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: bill.isPaid ? '#64748b' : '#fff' }}>{formatCurrency(bill.amount)}</div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => openEdit(bill)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 0 }}>
                    <Pencil style={{ width: 15, height: 15 }} />
                  </button>
                  <button onClick={() => setDeleteDialog({ isOpen: true, billId: bill.id, billName: bill.name })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 0 }}>
                    <Trash2 style={{ width: 15, height: 15 }} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Modal */}
      <Dialog open={editDialog.isOpen} onOpenChange={(isOpen) => setEditDialog(prev => ({ ...prev, isOpen }))}>
        <DialogContent className="sm:max-w-[425px] bg-[#1a1a35] border-slate-700 text-white">
          <DialogHeader><DialogTitle className="text-right">تعديل الفاتورة</DialogTitle></DialogHeader>
          <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, color: '#cbd5e1', fontWeight: 500 }}>اسم الفاتورة</label>
              <input type="text" required value={editName} onChange={e => setEditName(e.target.value)} 
                style={{ ...inputStyle, textAlign: 'right' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, color: '#cbd5e1', fontWeight: 500 }}>المبلغ</label>
              <input type="number" step="0.01" required value={editAmount} onChange={e => setEditAmount(e.target.value)} dir="ltr" style={inputStyle} />
            </div>
            <button type="submit" disabled={submitting || !editName || !editAmount}
              style={{ background: '#f59e0b', border: 'none', borderRadius: 10, padding: '12px', color: '#fff', fontSize: 15, fontWeight: 600, fontFamily: 'Cairo, sans-serif', cursor: 'pointer', marginTop: 4, opacity: (submitting || !editName || !editAmount) ? 0.6 : 1 }}>
              {submitting ? 'جاري التحديث...' : 'حفظ التعديلات'}
            </button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteDialog.isOpen} onOpenChange={(isOpen) => setDeleteDialog(prev => ({ ...prev, isOpen }))}>
        <DialogContent className="bg-[#1a1a35] border-slate-700 text-white p-0 overflow-hidden sm:max-w-[400px]">
          <div className="p-6 text-right">
            <DialogHeader>
              <DialogTitle className="text-[20px] font-bold text-white flex items-center justify-end gap-2">
                <Trash2 className="w-5 h-5 text-red-500" />
                حذف الفاتورة
              </DialogTitle>
            </DialogHeader>
            <p className="text-slate-400 text-[14px] mt-4 leading-relaxed">
              هل أنت متأكد من حذف فاتورة <span className="text-white font-bold">"{deleteDialog.billName}"</span>؟ لا يمكن التراجع عن هذا الإجراء.
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
              onClick={() => setDeleteDialog({ isOpen: false, billId: '', billName: '' })}
            >
              إلغاء
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
