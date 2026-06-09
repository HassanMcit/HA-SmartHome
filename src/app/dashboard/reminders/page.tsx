'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { remindersApi, Reminder } from '@/lib/api';
import { Bell, Plus, CheckCircle, Circle, Trash2, Clock, Edit2, Loader2, CalendarHeart, AlertCircle, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function RemindersPage() {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reminderAt, setReminderAt] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const fetchReminders = async () => {
    try {
      const data = await remindersApi.getAll();
      setReminders(data);
    } catch (error: any) {
      toast.error(lang === 'ar' ? 'حدث خطأ في جلب التذكيرات' : 'Error fetching reminders', { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setReminderAt('');
    setPriority('medium');
    setIsModalOpen(true);
  };

  const openEditModal = (r: Reminder) => {
    setEditingId(r.id);
    setTitle(r.title);
    setDescription(r.description || '');
    // Format the date for the datetime-local input
    if (r.reminderAt) {
      const date = new Date(r.reminderAt);
      // Need to adjust for local timezone to display correctly in input
      const offset = date.getTimezoneOffset() * 60000;
      const localDate = new Date(date.getTime() - offset);
      setReminderAt(localDate.toISOString().slice(0, 16));
    } else {
      setReminderAt('');
    }
    setPriority(r.priority);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error(lang === 'ar' ? 'عنوان التذكير مطلوب' : 'Reminder title is required');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        title,
        description: description || undefined,
        reminderAt: reminderAt ? new Date(reminderAt).toISOString() : undefined,
        priority,
      };

      if (editingId) {
        await remindersApi.update(editingId, payload);
        toast.success(lang === 'ar' ? 'تم تحديث التذكير بنجاح' : 'Reminder updated successfully');
      } else {
        await remindersApi.create(payload);
        toast.success(lang === 'ar' ? 'تمت إضافة التذكير بنجاح' : 'Reminder added successfully');
      }
      setIsModalOpen(false);
      fetchReminders();
    } catch (error: any) {
      toast.error(
        editingId
          ? (lang === 'ar' ? 'حدث خطأ في التحديث' : 'Error updating reminder')
          : (lang === 'ar' ? 'حدث خطأ في الإضافة' : 'Error adding reminder'),
        { description: error.message }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    // Optimistic UI update
    setReminders(prev => prev.map(r => r.id === id ? { ...r, isCompleted: !currentStatus } : r));
    try {
      await remindersApi.toggle(id);
      if (!currentStatus) {
        toast.success(lang === 'ar' ? 'تم إنجاز المهمة! 🎉' : 'Task completed! 🎉');
      }
      fetchReminders(); // resync
    } catch (error: any) {
      // Revert on error
      setReminders(prev => prev.map(r => r.id === id ? { ...r, isCompleted: currentStatus } : r));
      toast.error(lang === 'ar' ? 'حدث خطأ' : 'An error occurred', { description: error.message });
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await remindersApi.delete(deleteConfirmId);
      toast.success(lang === 'ar' ? 'تم الحذف بنجاح' : 'Deleted successfully');
      setDeleteConfirmId(null);
      fetchReminders();
    } catch (error: any) {
      toast.error(lang === 'ar' ? 'حدث خطأ في الحذف' : 'Error deleting reminder', { description: error.message });
    }
  };

  const priorityColors = {
    high: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    medium: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    low: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  };

  const priorityLabels = {
    high: lang === 'ar' ? 'عالية' : 'High',
    medium: lang === 'ar' ? 'متوسطة' : 'Medium',
    low: lang === 'ar' ? 'منخفضة' : 'Low',
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-slate-400 font-bold animate-pulse">
          {lang === 'ar' ? 'جاري جلب التذكيرات...' : 'Loading reminders...'}
        </p>
      </div>
    );
  }

  const pendingReminders = reminders.filter(r => !r.isCompleted);
  const completedReminders = reminders.filter(r => r.isCompleted);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-white/5 p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
          <Bell className="w-48 h-48 text-indigo-300 transform rotate-12" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-right">
            <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">
              {lang === 'ar' ? (
                <>ذكّرني <span className="text-indigo-400">والمهام</span></>
              ) : (
                <>Reminders <span className="text-indigo-400">& Tasks</span></>
              )}
            </h1>
            <p className="text-slate-300 font-medium">
              {lang === 'ar'
                ? 'نظم مهامك واحصل على تذكيرات عبر البريد الإلكتروني في الوقت المناسب.'
                : 'Organize your tasks and get timely email reminders.'}
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="w-full md:w-auto px-8 py-4 bg-indigo-500 hover:bg-indigo-600 active:scale-95 transition-all rounded-2xl flex items-center justify-center gap-3 text-white font-bold shadow-lg shadow-indigo-500/30 group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            <span>{lang === 'ar' ? 'إضافة تذكير جديد' : 'Add New Reminder'}</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Pending Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-8 rounded-full bg-indigo-500"></div>
            <h2 className="text-xl font-black text-white">
              {lang === 'ar' ? `المهام الحالية (${pendingReminders.length})` : `Current Tasks (${pendingReminders.length})`}
            </h2>
          </div>

          {pendingReminders.length === 0 ? (
            <div className="bg-white/5 border border-white/5 rounded-[2rem] p-12 flex flex-col items-center justify-center text-center backdrop-blur-sm">
              <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6">
                <CalendarHeart className="w-12 h-12 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {lang === 'ar' ? 'لا توجد مهام حالية' : 'No current tasks'}
              </h3>
              <p className="text-slate-400">
                {lang === 'ar'
                  ? 'أنت على دراية بكل شيء! أضف مهمة جديدة للبدء.'
                  : "You're all caught up! Add a new task to get started."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingReminders.map(reminder => (
                <div key={reminder.id} className="group relative bg-[#1a1a35]/80 hover:bg-[#1a1a35] border border-white/5 rounded-2xl p-5 transition-all shadow-lg hover:shadow-xl hover:border-indigo-500/30 overflow-hidden">
                  <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="flex items-start gap-4">
                    <button 
                      onClick={() => handleToggle(reminder.id, reminder.isCompleted)}
                      className="mt-1 flex-shrink-0 text-slate-500 hover:text-emerald-400 transition-colors"
                    >
                      <Circle className="w-6 h-6" />
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4 mb-1">
                        <h3 className="text-lg font-bold text-white break-words whitespace-normal">{reminder.title}</h3>
                        <div className="flex items-center gap-2">
                          <span className={cn("px-2.5 py-1 rounded-lg text-xs font-bold border", priorityColors[reminder.priority])}>
                            {priorityLabels[reminder.priority]}
                          </span>
                        </div>
                      </div>
                      
                      {reminder.description && (
                        <p className="text-slate-400 text-sm mb-3 line-clamp-2">{reminder.description}</p>
                      )}
                      
                      {reminder.reminderAt && (
                        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300 bg-indigo-500/10 w-fit px-3 py-1.5 rounded-lg">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{new Date(reminder.reminderAt).toLocaleString('ar-EG-u-nu-latn', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                          {reminder.emailSent && <CheckCircle className="w-3 h-3 text-emerald-400 ml-1" title="تم إرسال الإيميل" />}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                      <button 
                        onClick={() => openEditModal(reminder)}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-400 flex items-center justify-center transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(reminder.id)}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 flex items-center justify-center transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completed Tasks */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-8 rounded-full bg-emerald-500"></div>
            <h2 className="text-xl font-black text-white">
              {lang === 'ar' ? `المنجزة (${completedReminders.length})` : `Completed (${completedReminders.length})`}
            </h2>
          </div>

          <div className="space-y-3">
            {completedReminders.length === 0 ? (
              <div className="bg-white/5 border border-white/5 rounded-2xl p-8 text-center backdrop-blur-sm">
                <CheckCircle className="w-10 h-10 text-emerald-500/30 mx-auto mb-3" />
                <p className="text-slate-500 text-sm font-bold">
                  {lang === 'ar' ? 'لم تنجز مهام بعد' : 'No completed tasks yet'}
                </p>
              </div>
            ) : (
              completedReminders.map(reminder => (
                <div key={reminder.id} className="bg-white/5 border border-white/5 rounded-xl p-4 flex items-center justify-between group opacity-70 hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-3 min-w-0">
                    <button 
                      onClick={() => handleToggle(reminder.id, reminder.isCompleted)}
                      className="text-emerald-500 hover:text-slate-400 transition-colors"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    <span className="text-slate-400 font-medium truncate line-through">{reminder.title}</span>
                  </div>
                  <button 
                    onClick={() => handleDelete(reminder.id)}
                    className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal / Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={() => !isSubmitting && setIsModalOpen(false)}
          ></div>
          
          <div
            className="relative border border-white/10 rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            style={{ background: 'var(--card)' }}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/5">
              <h2 className="text-lg font-black text-white">
                {editingId
                  ? (lang === 'ar' ? 'تعديل التذكير' : 'Edit Reminder')
                  : (lang === 'ar' ? 'إضافة تذكير جديد' : 'Add New Reminder')}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300">
                  {lang === 'ar' ? 'عنوان التذكير' : 'Reminder Title'} <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder={lang === 'ar' ? 'مثال: دفع فاتورة الكهرباء' : 'Example: Pay electricity bill'}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  style={{ color: 'var(--foreground)' }}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300">
                  {lang === 'ar' ? 'التفاصيل (اختياري)' : 'Details (optional)'}
                </label>
                <textarea 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder={lang === 'ar' ? 'أضف بعض الملاحظات أو التفاصيل...' : 'Add some notes or details...'}
                  rows={3}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none custom-scrollbar"
                  style={{ color: 'var(--foreground)' }}
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-300">
                    {lang === 'ar' ? 'وقت التذكير (اختياري)' : 'Reminder Time (optional)'}
                  </label>
                  <input 
                    type="datetime-local"
                    value={reminderAt}
                    onChange={e => setReminderAt(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    style={{ color: 'var(--foreground)' }}
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    {lang === 'ar' ? 'سيصلك إيميل في هذا الوقت' : 'You will receive an email at this time'}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-300">
                    {lang === 'ar' ? 'الأولوية' : 'Priority'}
                  </label>
                  <select 
                    value={priority}
                    onChange={e => setPriority(e.target.value as any)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all appearance-none"
                    style={{ direction: 'rtl', color: 'var(--foreground)' }}
                  >
                    <option value="high" style={{ background: 'var(--card)', color: 'var(--foreground)' }}>{lang === 'ar' ? 'عالية 🔴' : 'High 🔴'}</option>
                    <option value="medium" style={{ background: 'var(--card)', color: 'var(--foreground)' }}>{lang === 'ar' ? 'متوسطة 🟡' : 'Medium 🟡'}</option>
                    <option value="low" style={{ background: 'var(--card)', color: 'var(--foreground)' }}>{lang === 'ar' ? 'منخفضة 🟢' : 'Low 🟢'}</option>
                  </select>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 flex items-center gap-3">
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                  <span>
                    {editingId
                      ? (lang === 'ar' ? 'حفظ التعديلات' : 'Save Changes')
                      : (lang === 'ar' ? 'إضافة التذكير' : 'Add Reminder')}
                  </span>
                </button>
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition-all"
                >
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDeleteConfirmId(null)}
          />
          <div
            className="relative border border-white/10 rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200 sm:slide-in-from-bottom-0"
            style={{ background: 'var(--card)' }}
          >
            <div className="p-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-7 h-7 text-rose-500" />
              </div>
              <h3 className="text-xl font-black text-white mb-2">
                {lang === 'ar' ? 'حذف التذكير' : 'Delete Reminder'}
              </h3>
              <p className="text-slate-400 text-sm mb-6">
                {lang === 'ar' ? 'هل أنت متأكد من حذف هذا التذكير؟ لا يمكن التراجع.' : 'Are you sure you want to delete this reminder? This cannot be undone.'}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 rounded-xl transition-all active:scale-95"
                >
                  {lang === 'ar' ? 'حذف نهائي' : 'Delete'}
                </button>
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition-all"
                >
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
