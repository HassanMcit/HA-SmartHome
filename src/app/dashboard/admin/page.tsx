'use client';

import { useEffect, useState } from 'react';
import { adminApi, RegistrationRequest, AdminStats, formatCurrency, User } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ShieldCheck, Check, X, Users, Activity, Trash2, UserCog, Key, Loader2, ArrowUpRight, ArrowDownRight, ChevronLeft, Mail, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

function AdminPage(): React.ReactNode {
  const { user, loading: authLoading } = useAuth();
  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [resetCodes, setResetCodes] = useState<any[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [forgotPasswordId, setForgotPasswordId] = useState<string | null>(null);
  
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionText: string;
    actionColor: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    actionText: '',
    actionColor: 'bg-red-500 hover:bg-red-600',
    onConfirm: () => {},
  });

  const fetchData = async () => {
    try {
      const [reqData, statsData, usersData, resetData] = await Promise.all([
        adminApi.getRequests(),
        adminApi.getStats(),
        adminApi.getUsers(),
        adminApi.getResetCodes(),
      ]);
      setRequests(reqData);
      setStats(statsData);
      setUsers(usersData);
      setResetCodes(resetData);
    } catch (error) {
      toast.error('حدث خطأ في تحميل بيانات الإدارة');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchData();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const handleApprove = async (id: string) => {
    if (processingId) return;
    setProcessingId(id);
    
    try {
      await adminApi.approveRequest(id);
      toast.success('تمت الموافقة على الطلب بنجاح وإرسال بريد ترحيبي');
      
      // Refresh all data to update users list and requests
      await fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء قبول الطلب');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'رفض الطلب',
      description: 'هل أنت متأكد من رفض هذا الطلب؟ سيتم حذف بيانات الطلب ولن يتمكن المستخدم من الدخول.',
      actionText: 'تأكيد الرفض',
      actionColor: 'bg-red-500 hover:bg-red-600',
      onConfirm: async () => {
        setProcessingId(id);
        try {
          await adminApi.rejectRequest(id);
          toast.success('تم رفض الطلب بنجاح');
          await fetchData();
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'حدث خطأ أثناء رفض الطلب');
        } finally {
          setProcessingId(null);
        }
      }
    });
  };

  const handleDeleteUser = (id: string, name: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'حذف مستخدم',
      description: `هل أنت متأكد من حذف المستخدم "${name}" بشكل نهائي؟ لا يمكن التراجع عن هذا الإجراء.`,
      actionText: 'حذف نهائي',
      actionColor: 'bg-red-500 hover:bg-red-600',
      onConfirm: async () => {
        try {
          await adminApi.deleteUser(id);
          toast.success('تم حذف المستخدم بنجاح');
          fetchData();
        } catch (error) {
          toast.error(error instanceof Error ? error.message : 'حدث خطأ أثناء الحذف');
        }
      }
    });
  };

  const handleResendWelcome = async (id: string, name: string) => {
    if (resendingId) return;
    setResendingId(id);
    try {
      await adminApi.resendWelcomeEmail(id);
      toast.success(`تم إعادة إرسال بريد التفعيل والدليل إلى ${name} بنجاح`);
    } catch (error: any) {
      toast.error(error.message || 'فشل إعادة إرسال البريد');
    } finally {
      setResendingId(null);
    }
  };

  const handleForgotPassword = async (id: string, email: string, name: string) => {
    if (forgotPasswordId) return;
    setForgotPasswordId(id);
    try {
      await adminApi.sendForgotPassword(email);
      // Refresh reset codes so admin can see the new code immediately
      const freshCodes = await adminApi.getResetCodes();
      setResetCodes(freshCodes);
      toast.success(`تم إرسال كود استعادة كلمة المرور إلى ${name} - شوف الكود أدناه ⬇️`, {
        duration: 5000,
      });
    } catch (error: any) {
      toast.error(error.message || 'حدث خطأ في إرسال كود الاستعادة');
    } finally {
      setForgotPasswordId(null);
    }
  };

  const handleToggleRole = (id: string, name: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'member' : 'admin';
    const actionText = currentRole === 'admin' ? 'إلغاء الصلاحيات' : 'ترقية لمدير';
    const description = currentRole === 'admin' 
      ? `هل أنت متأكد من إلغاء صلاحيات الإدارة للمستخدم "${name}"؟` 
      : `هل أنت متأكد من ترقية المستخدم "${name}" ليصبح مديراً بصلاحيات كاملة؟`;
      
    setConfirmDialog({
      isOpen: true,
      title: actionText,
      description,
      actionText: actionText,
      actionColor: currentRole === 'admin' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-indigo-500 hover:bg-indigo-600',
      onConfirm: async () => {
        try {
          await adminApi.updateUser(id, { role: newRole });
          toast.success('تم تحديث الصلاحيات بنجاح');
          fetchData();
        } catch (error) {
          toast.error(error instanceof Error ? error.message : 'حدث خطأ أثناء التحديث');
        }
      }
    });
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center glass-card p-10">
        <ShieldCheck className="w-16 h-16 text-red-500 mb-4 opacity-50" />
        <h2 className="text-xl font-bold text-white mb-2">غير مصرح</h2>
        <p className="text-slate-400">هذه الصفحة مخصصة لمدير النظام فقط</p>
      </div>
    );
  }

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const pastRequests = requests.filter(r => r.status !== 'pending');

  return (
    <div className="flex flex-col gap-8 pb-12 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3 mb-1">
          <ShieldCheck className="w-8 h-8 text-indigo-400" />
          لوحة الإدارة
        </h2>
        <p className="text-slate-400 text-sm sm:text-base font-medium">إدارة المستخدمين وطلبات التسجيل</p>
      </div>

      {/* Stats - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card p-6 flex flex-col items-center text-center group hover:border-indigo-500/30 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
            <Users className="w-6 h-6" />
          </div>
          <p className="text-3xl font-black text-white leading-none">{stats?.totalUsers}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-3">إجمالي المستخدمين</p>
        </div>
        
        <div className="glass-card p-6 flex flex-col items-center text-center group hover:border-amber-500/30 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
            <Activity className="w-6 h-6" />
          </div>
          <p className="text-3xl font-black text-white leading-none">{stats?.pendingRequests}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-3">طلبات معلقة</p>
        </div>

        <div className="glass-card p-6 flex flex-col items-center text-center group hover:border-emerald-500/30 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
            <ArrowUpRight className="w-6 h-6" />
          </div>
          <p className="text-xl font-black text-emerald-500 truncate w-full">{formatCurrency(stats?.totalIncome || 0)}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-3">دخل العائلة</p>
        </div>

        <div className="glass-card p-6 flex flex-col items-center text-center group hover:border-red-500/30 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-400 mb-4 group-hover:scale-110 transition-transform">
            <ArrowDownRight className="w-6 h-6" />
          </div>
          <p className="text-xl font-black text-red-500 truncate w-full">{formatCurrency(stats?.totalExpenses || 0)}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-3">مصروفات العائلة</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Users Management */}
        <div className="glass-card overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-white/5 bg-white/5 flex items-center gap-3">
            <UserCog className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-white">المستخدمين الحاليين</h3>
          </div>
          <div className="p-6">
            {users.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm font-medium">لا يوجد مستخدمين</div>
            ) : (
              <div className="space-y-4">
                {users.map(u => (
                  <div key={u.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/10">
                        {u.avatar && !u.avatar.startsWith('RESET:') ? (
                          <img src={u.avatar} className="w-full h-full rounded-full object-cover" alt="" />
                        ) : u.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-sm">{u.name}</h4>
                          {u.role === 'admin' && (
                            <span className="text-[9px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-md border border-indigo-500/20">مدير</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-medium">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pr-1 sm:pr-0">
                      <Button 
                        variant="secondary"
                        size="icon"
                        onClick={() => handleResendWelcome(u.id, u.name)}
                        disabled={resendingId !== null}
                        className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white border-0"
                        title="إعادة إرسال دليل الترحيب"
                      >
                        {resendingId === u.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Mail className="w-4 h-4" />
                        )}
                      </Button>

                      {/* Forgot Password Button */}
                      <Button 
                        variant="secondary"
                        size="icon"
                        onClick={() => handleForgotPassword(u.id, u.email, u.name)}
                        disabled={forgotPasswordId !== null}
                        className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-white border-0"
                        title="إرسال كود استعادة كلمة المرور"
                      >
                        {forgotPasswordId === u.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <KeyRound className="w-4 h-4" />
                        )}
                      </Button>

                      {u.id !== user?.id && (
                        <>
                          <Button 
                            variant="secondary"
                            size="sm"
                            onClick={() => handleToggleRole(u.id, u.name, u.role)}
                            className={cn(
                              "h-8 text-[11px] font-bold px-4 rounded-lg flex-1 sm:flex-none",
                              u.role === 'admin' ? "bg-slate-800 text-slate-400 hover:bg-slate-700" : "bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white"
                            )}
                          >
                            {u.role === 'admin' ? 'عزله' : 'ترقية'}
                          </Button>
                          {u.role !== 'admin' && (
                            <Button 
                              variant="destructive"
                              size="icon"
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              className="h-8 w-8 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pending Requests */}
        <div className="glass-card overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-white/5 bg-white/5 flex items-center gap-3">
            <Users className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white">طلبات التسجيل المعلقة</h3>
          </div>
          <div className="p-6">
            {pendingRequests.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm font-medium">لا توجد طلبات معلقة</div>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map(req => (
                  <div key={req.id} className="p-5 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-4 animate-fade-in">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                        {req.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{req.name}</h4>
                        <p className="text-xs text-slate-500 font-medium">{req.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button 
                        onClick={() => handleApprove(req.id)}
                        disabled={processingId !== null}
                        className="flex-1 h-10 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white font-bold text-xs rounded-xl transition-all border-0"
                      >
                        {processingId === req.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="w-4 h-4 ml-1.5" />
                            قبول
                          </>
                        )}
                      </Button>
                      <Button 
                        onClick={() => handleReject(req.id)}
                        disabled={processingId !== null}
                        className="flex-1 h-10 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white font-bold text-xs rounded-xl transition-all border-0"
                      >
                        <X className="w-4 h-4 ml-1.5" />
                        رفض
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Reset Codes */}
      {resetCodes.length > 0 && (
        <div className="glass-card overflow-hidden border-indigo-500/20">
          <div className="px-6 py-5 border-b border-indigo-500/20 bg-indigo-500/5 flex items-center gap-3">
            <Key className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-white">أكواد استعادة كلمة المرور النشطة</h3>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {resetCodes.map(rc => (
              <div key={rc.id} className="p-5 bg-white/5 border border-indigo-500/10 rounded-2xl flex flex-col gap-4">
                <div>
                  <h4 className="font-bold text-white text-sm">{rc.name}</h4>
                  <p className="text-xs text-slate-500 font-medium">{rc.email}</p>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <div className="text-2xl font-black text-indigo-400 tabular-nums tracking-[0.2em] bg-indigo-500/10 px-4 py-2 rounded-xl border border-indigo-500/10 shadow-inner">
                    {rc.code}
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 text-left leading-tight">
                    ينتهي <br />
                    <span className="text-slate-400 font-black">{new Date(rc.expiresAt).toLocaleTimeString('ar-EG-u-nu-latn', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past Requests */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-5 border-b border-white/5 bg-white/5">
          <h3 className="font-bold text-white">سجل الطلبات السابقة</h3>
        </div>
        <div className="p-6">
          {pastRequests.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm font-medium">لا يوجد سجل</div>
          ) : (
            <div className="space-y-3">
              {pastRequests.slice(0, 5).map(req => (
                <div key={req.id} className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/5 group hover:border-white/10 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                    <span className="text-white text-sm font-bold">{req.name}</span>
                    <span className="text-slate-500 text-xs font-medium tracking-tight">({req.email})</span>
                  </div>
                  <div className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5",
                    req.status === 'approved' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                  )}>
                    {req.status === 'approved' ? (
                      <><Check className="w-3 h-3" /> مقبول</>
                    ) : (
                      <><X className="w-3 h-3" /> مرفوض</>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Professional Confirmation Modal */}
      <Dialog open={confirmDialog.isOpen} onOpenChange={(isOpen) => setConfirmDialog(prev => ({ ...prev, isOpen }))}>
        <DialogContent className="bg-[#1a1a35] border-white/10 text-white p-0 overflow-hidden sm:max-w-[440px] rounded-[32px] outline-none" showCloseButton={false}>
          <div className="p-8">
            <DialogHeader className="text-right">
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center mb-6",
                confirmDialog.actionColor.includes('red') ? "bg-red-500/10 text-red-500" : "bg-indigo-500/10 text-indigo-400"
              )}>
                {confirmDialog.actionColor.includes('red') ? <Trash2 className="w-7 h-7" /> : <ShieldCheck className="w-7 h-7" />}
              </div>
              <DialogTitle className="text-2xl font-black text-white mb-2">
                {confirmDialog.title}
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-base font-medium leading-relaxed">
                {confirmDialog.description}
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="bg-white/5 border-t border-white/5 p-6 flex flex-col sm:flex-row-reverse gap-3">
            <Button 
              className={cn(
                "flex-1 h-14 font-black rounded-2xl text-white border-0 shadow-lg transition-all active:scale-[0.98]",
                confirmDialog.actionColor
              )} 
              onClick={() => {
                confirmDialog.onConfirm();
                setConfirmDialog(prev => ({ ...prev, isOpen: false }));
              }}
            >
              {confirmDialog.actionText}
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 h-14 border-white/5 bg-transparent text-slate-300 font-bold rounded-2xl hover:bg-white/5 hover:text-white transition-all" 
              onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
            >
              إلغاء
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminPage;
