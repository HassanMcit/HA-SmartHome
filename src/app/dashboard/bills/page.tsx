'use client';

import { useEffect, useState } from 'react';
import { billsApi, adminApi, accountsApi, Bill, User, Account, formatCurrency, EXPENSE_CATEGORIES, getCategoryInfo } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Trash2, CheckCircle2, Circle, AlertCircle, Pencil, Users, FileText, Loader2, Tag } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import BankLogo, { getTranslatedBankName } from '@/components/BankLogo';

export default function BillsPage() {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';

  const [bills, setBills] = useState<Bill[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>(currentUser?.id || '');
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [category, setCategory] = useState('general_bills');
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
  const [editCategory, setEditCategory] = useState('general_bills');
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [payDialog, setPayDialog] = useState<{ isOpen: boolean; billId: string; billAmount: number; billName: string }>({
    isOpen: false,
    billId: '',
    billAmount: 0,
    billName: '',
  });
  const [selectedAccountId, setSelectedAccountId] = useState<string>('none');

  const fetchUsers = async () => {
    if (!isAdmin) return;
    try {
      const data = await adminApi.getUsers();
      setUsers(data || []);
    } catch {
      console.error('Error fetching users');
    }
  };

  const fetchBills = async (filterUserId?: string) => {
    try {
      setLoading(true);
      const uid = filterUserId ?? selectedUserId;
      // If admin and "all" selected, pass no userId → backend returns everything
      const userFilter = isAdmin && (uid === 'all' || !uid) ? undefined : uid;
      const data = await billsApi.getAll(undefined, userFilter);
      setBills(data || []);
    } catch {
      toast.error('حدث خطأ في تحميل الفواتير');
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const data = await accountsApi.getAll();
      setAccounts(data || []);
    } catch {
      console.error('Error fetching accounts');
    }
  };

  useEffect(() => {
    if (currentUser) {
      if (isAdmin) {
        fetchUsers();
        setSelectedUserId(currentUser.id);
      }
      fetchBills(currentUser.id);
      fetchAccounts();
    }
  }, [currentUser, isAdmin]);

  // Re-fetch when user filter changes
  useEffect(() => {
    if (currentUser && selectedUserId) {
      fetchBills(selectedUserId);
    }
  }, [selectedUserId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount || !dueDate) { toast.error('جميع الحقول مطلوبة'); return; }
    setSubmitting(true);
    try {
      await billsApi.create({ name, amount: parseFloat(amount), dueDate, isRecurring, category });
      toast.success('تم إضافة الفاتورة بنجاح');
      setOpen(false); setName(''); setAmount(''); setDueDate(''); setIsRecurring(false); setCategory('general_bills');
      fetchBills();
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
    } catch { toast.error('حدث خطأ أثناء الحذف'); }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDialog.bill || !editName || !editAmount) return;
    setSubmitting(true);
    try {
      await billsApi.update(editDialog.bill.id, { name: editName, amount: parseFloat(editAmount), category: editCategory });
      toast.success('تم تحديث الفاتورة بنجاح');
      setEditDialog({ isOpen: false, bill: null });
      fetchBills();
    } catch { toast.error('حدث خطأ أثناء التحديث'); }
    finally { setSubmitting(false); }
  };

  const handleToggle = async (id: string, isPaid: boolean, amount: number, name: string) => {
    if (isPaid) {
      if (togglingId) return;
      setTogglingId(id);
      try {
        await billsApi.toggle(id);
        toast.success('تم إلغاء سداد الفاتورة');
        fetchBills();
        fetchAccounts();
      } catch {
        toast.error('حدث خطأ');
      } finally {
        setTogglingId(null);
      }
    } else {
      setPayDialog({
        isOpen: true,
        billId: id,
        billAmount: amount,
        billName: name
      });
      setSelectedAccountId('none');
    }
  };

  const confirmPayment = async () => {
    if (!payDialog.billId || togglingId) return;
    setTogglingId(payDialog.billId);
    try {
      await billsApi.toggle(payDialog.billId, selectedAccountId === 'none' ? undefined : selectedAccountId);
      toast.success('تم سداد الفاتورة بنجاح');
      setPayDialog({ isOpen: false, billId: '', billAmount: 0, billName: '' });
      fetchBills();
      fetchAccounts();
    } catch {
      toast.error('حدث خطأ أثناء دفع الفاتورة');
    } finally {
      setTogglingId(null);
    }
  };

  const openEdit = (bill: Bill) => {
    setEditDialog({ isOpen: true, bill });
    setEditName(bill.name);
    setEditAmount(bill.amount.toString());
    setEditCategory(bill.category || 'general_bills');
  };

  const inputStyle = {
    background: '#242444', border: '1px solid #2d2d5e', borderRadius: 8,
    padding: '10px 12px', color: '#fff', fontSize: 14,
    fontFamily: 'Cairo, sans-serif', outline: 'none', width: '100%',
    boxSizing: 'border-box' as const,
  };

  const selectedUserName = selectedUserId === 'all'
    ? 'كل الأعضاء'
    : (users.find(u => u.id === selectedUserId)?.name || 'أنا');

  return (
    <div className="flex flex-col gap-6 pb-20 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3 mb-1">
            <FileText className="w-8 h-8 text-amber-400" />
            الفواتير والالتزامات
          </h2>
          <p className="text-slate-400 text-sm font-medium">تتبع فواتيرك ولا تفوت أي موعد استحقاق</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl px-6 h-12 shadow-lg shadow-amber-500/20 active:scale-95 transition-all">
              <Plus className="w-5 h-5 ml-2" />
              إضافة فاتورة
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-[#1a1a35] border-slate-700 text-white rounded-[24px] outline-none">
            <DialogHeader><DialogTitle className="text-right text-xl font-black">إضافة فاتورة جديدة</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="flex flex-col gap-4 mt-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">اسم الفاتورة</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="مثال: كهرباء، إنترنت" style={{ ...inputStyle, textAlign: 'right' }} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">المبلغ (ج.م)</label>
                <input type="number" step="0.01" required value={amount} onChange={e => setAmount(e.target.value)} dir="ltr" style={inputStyle} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">تاريخ الاستحقاق</label>
                <input type="date" required value={dueDate} onChange={e => setDueDate(e.target.value)} dir="ltr" style={inputStyle} />
              </div>
              <div className="flex flex-col gap-1.5 text-right">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">الفئة</label>
                <Select value={category} onValueChange={(val) => setCategory(val || 'general_bills')}>
                  <SelectTrigger className="w-full bg-[#242444] border border-[#2d2d5e] text-right h-12 rounded-[8px] px-4 text-white" dir="rtl">
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a35] border-slate-700 text-white rounded-[20px] max-h-[400px] py-2 pr-2 pl-6 custom-scrollbar" dir="rtl">
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
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                <label className="text-sm font-bold text-slate-300 cursor-pointer">فاتورة متكررة شهرياً؟</label>
                <input type="checkbox" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#f59e0b' }} />
              </div>
              <button type="submit" disabled={submitting || !name || !amount || !dueDate}
                className={cn("w-full py-3 rounded-xl font-black text-black transition-all", submitting || !name || !amount || !dueDate ? "bg-amber-500/40 cursor-not-allowed" : "bg-amber-500 hover:bg-amber-400 active:scale-95")}>
                {submitting ? 'جاري الحفظ...' : 'حفظ الفاتورة'}
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Admin User Filter */}
      {isAdmin && (
        <div className="glass-card p-4">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 block">عرض فواتير</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedUserId(currentUser!.id)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                selectedUserId === currentUser?.id
                  ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                  : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
              )}
            >
              فواتيري
            </button>
            <button
              onClick={() => setSelectedUserId('all')}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                selectedUserId === 'all'
                  ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                  : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
              )}
            >
              <Users className="w-4 h-4" />
              كل الأعضاء
            </button>
            {users.filter(u => u.id !== currentUser?.id).map(u => (
              <button
                key={u.id}
                onClick={() => setSelectedUserId(u.id)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                  selectedUserId === u.id
                    ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                    : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                )}
              >
                {u.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bills List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">جاري التحميل</p>
        </div>
      ) : bills.length === 0 ? (
        <div className="glass-card py-20 flex flex-col items-center text-center px-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-amber-400/50" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">لا توجد فواتير</h3>
          <p className="text-slate-500 text-sm">{isAdmin && selectedUserId === 'all' ? 'لا توجد فواتير لأي عضو' : 'لا توجد فواتير مسجلة حالياً'}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {bills.map((bill) => {
            const late = !bill.isPaid && new Date(bill.dueDate) < new Date();
            const isToggling = togglingId === bill.id;
            // Find owner name for admin view
            const ownerName = isAdmin && selectedUserId === 'all'
              ? users.find(u => u.id === bill.userId)?.name
              : null;

            return (
              <div key={bill.id} className={cn(
                "glass-card p-4 sm:p-5 flex items-center justify-between gap-4 transition-all",
                bill.isPaid && "opacity-70"
              )}>
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <button
                    onClick={() => handleToggle(bill.id, bill.isPaid, bill.amount, bill.name)}
                    disabled={isToggling}
                    className={cn(
                      "w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                      bill.isPaid
                        ? "border-emerald-500 bg-emerald-500/15 text-emerald-500"
                        : "border-slate-600 bg-transparent text-slate-500 hover:border-amber-400 hover:text-amber-400",
                      isToggling && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {isToggling
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : bill.isPaid
                        ? <CheckCircle2 className="w-5 h-5" />
                        : <Circle className="w-5 h-5" />
                    }
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={cn("font-bold text-sm sm:text-base break-words whitespace-normal", bill.isPaid ? "text-emerald-400 line-through" : "text-white")}>
                        {bill.name}
                      </span>
                      {bill.isRecurring && <span className="text-[9px] font-black uppercase tracking-wider bg-indigo-500/15 text-indigo-400 px-2 py-0.5 rounded-md border border-indigo-500/20 shrink-0">متكررة</span>}
                      {bill.isPaid && <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/20 shrink-0">مدفوعة</span>}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                      {ownerName && <span className="text-purple-400 font-bold">👤 {ownerName}</span>}
                      <span className={cn("flex items-center gap-1", late && "text-red-400 font-bold")}>
                        {late && <AlertCircle className="w-3 h-3" />}
                        {new Date(bill.dueDate).toLocaleDateString('ar-EG-u-nu-latn')}
                        {late && ' (متأخرة)'}
                      </span>
                      <span className="flex items-center gap-1 text-slate-400 bg-white/5 px-2 py-0.5 rounded-md text-[10px]">
                        <span>{getCategoryInfo(bill.category, 'expense').icon}</span>
                        <span>{getCategoryInfo(bill.category, 'expense').label}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className={cn("font-black text-base sm:text-lg tabular-nums", bill.isPaid ? "text-slate-500" : "text-white")}>
                    {formatCurrency(bill.amount)}
                  </span>
                  <button onClick={() => openEdit(bill)} className="p-2 rounded-lg bg-white/5 text-slate-500 hover:bg-white/10 hover:text-white transition-all">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeleteDialog({ isOpen: true, billId: bill.id, billName: bill.name })} className="p-2 rounded-lg bg-white/5 text-slate-500 hover:bg-red-500/10 hover:text-red-500 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      <Dialog open={editDialog.isOpen} onOpenChange={(isOpen) => setEditDialog(prev => ({ ...prev, isOpen }))}>
        <DialogContent className="sm:max-w-[425px] bg-[#1a1a35] border-slate-700 text-white rounded-[24px] outline-none">
          <DialogHeader><DialogTitle className="text-right text-xl font-black">تعديل الفاتورة</DialogTitle></DialogHeader>
          <form onSubmit={handleUpdate} className="flex flex-col gap-4 mt-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">اسم الفاتورة</label>
              <input type="text" required value={editName} onChange={e => setEditName(e.target.value)} style={{ ...inputStyle, textAlign: 'right' }} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">المبلغ (ج.م)</label>
              <input type="number" step="0.01" required value={editAmount} onChange={e => setEditAmount(e.target.value)} dir="ltr" style={inputStyle} />
            </div>
            <div className="flex flex-col gap-1.5 text-right">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">الفئة</label>
              <Select value={editCategory} onValueChange={(val) => setEditCategory(val || 'general_bills')}>
                <SelectTrigger className="w-full bg-[#242444] border border-[#2d2d5e] text-right h-12 rounded-[8px] px-4 text-white" dir="rtl">
                  <SelectValue placeholder="اختر الفئة" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a35] border-slate-700 text-white rounded-[20px] max-h-[400px] py-2 pr-2 pl-6 custom-scrollbar" dir="rtl">
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
            <button type="submit" disabled={submitting || !editName || !editAmount}
              className={cn("w-full py-3 rounded-xl font-black text-black transition-all", submitting || !editName || !editAmount ? "bg-amber-500/40 cursor-not-allowed" : "bg-amber-500 hover:bg-amber-400 active:scale-95")}>
              {submitting ? 'جاري التحديث...' : 'حفظ التعديلات'}
            </button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={deleteDialog.isOpen} onOpenChange={(isOpen) => setDeleteDialog(prev => ({ ...prev, isOpen }))}>
        <DialogContent className="bg-[#1a1a35] border-slate-700 text-white p-8 sm:max-w-[400px] rounded-[32px] outline-none">
          <div className="text-right">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 mb-6">
              <Trash2 className="w-7 h-7" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-white">حذف الفاتورة</DialogTitle>
            </DialogHeader>
            <p className="text-slate-400 text-base font-medium mt-4 leading-relaxed">
              هل أنت متأكد من حذف فاتورة <span className="text-white font-bold">"{deleteDialog.billName}"</span>؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row-reverse gap-3">
              <Button className="flex-1 h-14 bg-red-500 hover:bg-red-600 text-white font-black rounded-2xl active:scale-[0.98] transition-all" onClick={handleDelete}>
                حذف نهائي
              </Button>
              <Button variant="outline" className="flex-1 h-14 border-white/5 bg-transparent text-slate-300 font-bold rounded-2xl hover:bg-white/5 hover:text-white transition-all"
                onClick={() => setDeleteDialog({ isOpen: false, billId: '', billName: '' })}>
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Account Selection Dialog for Bill Payment */}
      <Dialog open={payDialog.isOpen} onOpenChange={(isOpen) => setPayDialog(prev => ({ ...prev, isOpen }))}>
        <DialogContent className="bg-[#1a1a35] border-slate-700 text-white p-6 sm:max-w-[440px] rounded-[32px] outline-none text-right" dir="rtl">
          <div className="text-right">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-6">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <DialogHeader className="text-right">
              <DialogTitle className="text-2xl font-black text-white">سداد الفاتورة</DialogTitle>
            </DialogHeader>
            <p className="text-slate-400 text-sm font-medium mt-3 leading-relaxed">
              أنت على وشك تحديد فاتورة <span className="text-amber-400 font-bold">"{payDialog.billName}"</span> بقيمة <span className="text-white font-bold">{formatCurrency(payDialog.billAmount)}</span> كمدفوعة.
              <br />
              يرجى اختيار الحساب المالي الذي تم السداد منه لخصم القيمة وتسجيل معاملة مصروف:
            </p>

            <div className="mt-5 space-y-2 text-right">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-1">الحساب المالي</label>
              <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                <SelectTrigger className="w-full bg-[#242444] border border-[#2d2d5e] text-right h-12 rounded-xl px-4 text-white" dir="rtl">
                  <SelectValue placeholder="اختر حساب الخصم" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a35] border-slate-700 text-white rounded-xl max-h-[300px] custom-scrollbar" dir="rtl">
                  <SelectItem value="none" className="focus:bg-white/10 rounded-lg text-slate-400">
                    بدون ربط (سجل عام بدون خصم)
                  </SelectItem>
                  {accounts.map(acc => (
                    <SelectItem key={acc.id} value={acc.id} className="focus:bg-white/10 rounded-lg">
                      <div className="flex items-center gap-2">
                        <BankLogo name={acc.name} size="sm" className="w-4 h-4 rounded border-0" />
                        <span className="font-bold text-sm">
                          {getTranslatedBankName(acc.name, 'ar')} {acc.alias ? `(${acc.alias})` : ''} - {formatCurrency(acc.balance)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row-reverse gap-3">
              <Button 
                className="flex-1 h-14 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-2xl active:scale-[0.98] transition-all"
                onClick={confirmPayment}
                disabled={togglingId !== null}
              >
                {togglingId ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'تأكيد السداد والخصم'}
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 h-14 border-white/5 bg-transparent text-slate-300 font-bold rounded-2xl hover:bg-white/5 hover:text-white transition-all"
                onClick={() => setPayDialog({ isOpen: false, billId: '', billAmount: 0, billName: '' })}
                disabled={togglingId !== null}
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
