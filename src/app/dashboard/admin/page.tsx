'use client';

import { useEffect, useState } from 'react';
import { adminApi, RegistrationRequest, AdminStats, formatCurrency, User } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ShieldCheck, Check, X, Users, Activity, Trash2, UserCog, Key } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [resetCodes, setResetCodes] = useState<any[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  
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
    try {
      await adminApi.approveRequest(id);
      toast.success('تمت الموافقة على الطلب بنجاح');
      fetchData();
    } catch {
      toast.error('حدث خطأ');
    }
  };

  const handleReject = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'رفض الطلب',
      description: 'هل أنت متأكد من رفض هذا الطلب؟',
      actionText: 'رفض',
      actionColor: 'bg-red-500 hover:bg-red-600',
      onConfirm: async () => {
        try {
          await adminApi.rejectRequest(id);
          toast.success('تم رفض الطلب');
          fetchData();
        } catch {
          toast.error('حدث خطأ');
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
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <ShieldCheck className="w-16 h-16 text-red-500 mb-4 opacity-50" />
        <h2 className="text-xl font-bold text-white mb-2">غير مصرح</h2>
        <p className="text-slate-400">هذه الصفحة مخصصة لمدير النظام فقط</p>
      </div>
    );
  }

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const pastRequests = requests.filter(r => r.status !== 'pending');

  return (
    <div className="flex flex-col gap-[24px] pb-[80px] md:pb-0">
      {/* Header */}
      <div>
        <h2 className="text-[24px] font-bold text-white flex items-center gap-[8px] mb-[4px]">
          <ShieldCheck className="w-[24px] h-[24px] text-indigo-400" />
          لوحة الإدارة
        </h2>
        <p className="text-slate-400 text-[14px]">إدارة المستخدمين وطلبات التسجيل</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[20px]">
        <div className="bg-[#1a1a35] border border-[#2d2d5e] rounded-[12px] p-[20px] text-center">
          <Users className="w-[24px] h-[24px] mx-auto mb-[8px] text-indigo-400" />
          <p className="text-[24px] font-bold text-white">{stats?.totalUsers}</p>
          <p className="text-[12px] text-slate-400 mt-[4px]">إجمالي المستخدمين</p>
        </div>
        <div className="bg-[#1a1a35] border border-[#2d2d5e] rounded-[12px] p-[20px] text-center">
          <Activity className="w-[24px] h-[24px] mx-auto mb-[8px] text-amber-400" />
          <p className="text-[24px] font-bold text-white">{stats?.pendingRequests}</p>
          <p className="text-[12px] text-slate-400 mt-[4px]">طلبات معلقة</p>
        </div>
        <div className="bg-[#1a1a35] border border-[#2d2d5e] rounded-[12px] p-[20px] text-center">
          <div className="text-emerald-400 font-bold mb-[8px] text-[18px]">+</div>
          <p className="text-[18px] font-bold text-emerald-400 truncate">{formatCurrency(stats?.totalIncome || 0)}</p>
          <p className="text-[12px] text-slate-400 mt-[4px]">دخل العائلة</p>
        </div>
        <div className="bg-[#1a1a35] border border-[#2d2d5e] rounded-[12px] p-[20px] text-center">
          <div className="text-red-400 font-bold mb-[8px] text-[18px]">-</div>
          <p className="text-[18px] font-bold text-red-400 truncate">{formatCurrency(stats?.totalExpenses || 0)}</p>
          <p className="text-[12px] text-slate-400 mt-[4px]">مصروفات العائلة</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-[24px]">
        {/* Users Management */}
        <div className="bg-[#1a1a35] border border-[#2d2d5e] rounded-[12px] overflow-hidden">
          <div className="p-[16px] border-b border-[#2d2d5e] bg-[#242444]/50 flex items-center gap-[8px]">
            <UserCog className="w-[20px] h-[20px] text-indigo-400" />
            <h3 className="font-bold text-white text-[18px]">المستخدمين الحاليين</h3>
          </div>
          <div className="p-[16px] flex flex-col gap-[12px]">
            {users.length === 0 ? (
              <div className="text-center py-[24px] text-slate-500 text-[14px]">لا يوجد مستخدمين</div>
            ) : (
              users.map(u => (
                <div key={u.id} className="flex justify-between items-center p-[12px] bg-[#242444] border border-[#2d2d5e] rounded-[8px]">
                  <div>
                    <h4 className="font-bold text-white text-[14px] flex items-center gap-[8px]">
                      {u.name}
                      {u.role === 'admin' && (
                        <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-[8px] py-[2px] rounded-full">مدير</span>
                      )}
                    </h4>
                    <p className="text-[12px] text-slate-400 mt-[2px]">{u.email}</p>
                  </div>
                  {u.id !== user?.id && (
                    <div className="flex gap-[4px]">
                      <button 
                        onClick={() => handleToggleRole(u.id, u.name, u.role)}
                        className={`px-[8px] py-[4px] rounded-[6px] text-[11px] font-semibold transition-colors ${
                          u.role === 'admin' 
                            ? 'bg-[#2d2d5e] text-slate-300 hover:bg-[#3d3d7e] hover:text-white' 
                            : 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white'
                        }`}
                      >
                        {u.role === 'admin' ? 'عزله من الإدارة' : 'ترقية لمدير'}
                      </button>
                      {u.role !== 'admin' && (
                        <button 
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          className="p-[6px] text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-[6px] transition-colors"
                          title="حذف المستخدم"
                        >
                          <Trash2 className="w-[14px] h-[14px]" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Requests */}
        <div className="bg-[#1a1a35] border border-[#2d2d5e] rounded-[12px] overflow-hidden">
          <div className="p-[16px] border-b border-[#2d2d5e] bg-[#242444]/50 flex items-center gap-[8px]">
            <Users className="w-[20px] h-[20px] text-amber-400" />
            <h3 className="font-bold text-white text-[18px]">طلبات التسجيل المعلقة</h3>
          </div>
          <div className="p-[16px] flex flex-col gap-[12px]">
            {pendingRequests.length === 0 ? (
              <div className="text-center py-[24px] text-slate-500 text-[14px]">لا توجد طلبات معلقة</div>
            ) : (
              pendingRequests.map(req => (
                <div key={req.id} className="p-[12px] bg-[#242444] border border-[#2d2d5e] rounded-[8px] flex flex-col gap-[12px]">
                  <div>
                    <h4 className="font-bold text-white text-[14px]">{req.name}</h4>
                    <p className="text-[12px] text-slate-400">{req.email}</p>
                    <p className="text-[11px] text-slate-500 mt-[4px]">{new Date(req.createdAt).toLocaleDateString('ar-EG')}</p>
                  </div>
                  <div className="flex gap-[8px]">
                    <button 
                      onClick={() => handleApprove(req.id)}
                      className="flex-1 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white py-[6px] rounded-[6px] text-[12px] font-semibold flex items-center justify-center gap-[4px] transition-colors"
                    >
                      <Check className="w-[14px] h-[14px]" />
                      قبول
                    </button>
                    <button 
                      onClick={() => handleReject(req.id)}
                      className="flex-1 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white py-[6px] rounded-[6px] text-[12px] font-semibold flex items-center justify-center gap-[4px] transition-colors"
                    >
                      <X className="w-[14px] h-[14px]" />
                      رفض
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Active Reset Codes */}
      {resetCodes.length > 0 && (
        <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-[12px] overflow-hidden mt-[24px]">
          <div className="p-[16px] border-b border-indigo-500/30 bg-indigo-500/20 flex items-center gap-[8px]">
            <Key className="w-[20px] h-[20px] text-indigo-400" />
            <h3 className="font-bold text-white text-[18px]">أكواد استعادة كلمة المرور النشطة</h3>
          </div>
          <div className="p-[16px] grid sm:grid-cols-2 md:grid-cols-3 gap-[16px]">
            {resetCodes.map(rc => (
              <div key={rc.id} className="p-[16px] bg-[#1a1a35] border border-indigo-500/20 rounded-[8px] flex flex-col gap-[8px]">
                <div>
                  <h4 className="font-bold text-white text-[14px]">{rc.name}</h4>
                  <p className="text-[12px] text-slate-400">{rc.email}</p>
                </div>
                <div className="flex items-center justify-between mt-[4px]">
                  <div className="text-[20px] font-mono font-bold text-indigo-400 tracking-wider bg-indigo-500/10 px-[12px] py-[4px] rounded-[6px]">
                    {rc.code}
                  </div>
                  <div className="text-[11px] text-slate-500 text-left">
                    تنتهي {new Date(rc.expiresAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past Requests */}
      <div className="bg-[#1a1a35] border border-[#2d2d5e] rounded-[12px] overflow-hidden mt-[24px]">
        <div className="p-[16px] border-b border-[#2d2d5e] bg-[#242444]/50">
          <h3 className="font-bold text-white text-[18px]">سجل الطلبات السابقة</h3>
        </div>
        <div className="p-[16px]">
          {pastRequests.length === 0 ? (
            <div className="text-center py-[24px] text-slate-500 text-[14px]">لا يوجد سجل</div>
          ) : (
            <div className="flex flex-col gap-[8px]">
              {pastRequests.slice(0, 5).map(req => (
                <div key={req.id} className="flex justify-between items-center p-[12px] bg-[#242444] rounded-[8px]">
                  <div>
                    <span className="text-white text-[14px] font-medium">{req.name}</span>
                    <span className="text-slate-400 text-[12px] mr-[8px]">({req.email})</span>
                  </div>
                  <span className={`text-[11px] px-[10px] py-[4px] rounded-full font-semibold ${
                    req.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {req.status === 'approved' ? 'مقبول' : 'مرفوض'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Professional Confirmation Modal */}
      <Dialog open={confirmDialog.isOpen} onOpenChange={(isOpen) => setConfirmDialog(prev => ({ ...prev, isOpen }))}>
        <DialogContent className="bg-[#1a1a35] border-[#2d2d5e] text-white p-0 overflow-hidden sm:max-w-[400px]" showCloseButton={false}>
          <div className="p-6">
            <DialogHeader className="mb-4 text-right">
              <DialogTitle className="text-[20px] font-bold text-white flex items-center gap-2">
                {confirmDialog.actionColor.includes('red') ? <Trash2 className="w-5 h-5 text-red-500" /> : <ShieldCheck className="w-5 h-5 text-indigo-400" />}
                {confirmDialog.title}
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-[14px] mt-2 leading-relaxed">
                {confirmDialog.description}
              </DialogDescription>
            </DialogHeader>
          </div>
          <DialogFooter className="bg-[#242444]/50 border-t border-[#2d2d5e] p-4 flex gap-3 sm:justify-start flex-row-reverse">
            <Button 
              className={`flex-1 font-semibold ${confirmDialog.actionColor} text-white border-0`} 
              onClick={() => {
                confirmDialog.onConfirm();
                setConfirmDialog(prev => ({ ...prev, isOpen: false }));
              }}
            >
              {confirmDialog.actionText}
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 border-[#2d2d5e] bg-transparent text-slate-300 hover:text-white hover:bg-[#2d2d5e]" 
              onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
            >
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
