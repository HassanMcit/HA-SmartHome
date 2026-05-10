'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/lib/api';
import { ShieldCheck, User as UserIcon, Settings, KeyRound, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user, login } = useAuth(); // login from auth context is used to update the local user state if needed, or we just rely on reload
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 500;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
          setAvatar(compressedBase64);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('الاسم مطلوب');
      return;
    }
    
    setProfileLoading(true);
    try {
      const updatedUser = await authApi.updateProfile({ name, avatar: avatar.startsWith('RESET:') ? '' : avatar });
      
      // Update local storage so the change reflects immediately on reload
      if (typeof window !== 'undefined') {
        localStorage.setItem('ha_user', JSON.stringify(updatedUser));
      }

      toast.success('تم تحديث الملف الشخصي بنجاح');
      
      // Short delay to allow the toast to be seen before reload
      setTimeout(() => {
        window.location.reload();
      }, 700);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'حدث خطأ أثناء التحديث');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('كلمات المرور الجديدة غير متطابقة');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    setPasswordLoading(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      toast.success('تم تغيير كلمة المرور بنجاح');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'كلمة المرور الحالية غير صحيحة');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-[24px] pb-[80px] md:pb-0">
      {/* Header */}
      <div>
        <h2 className="text-[24px] font-bold text-white flex items-center gap-[8px] mb-[4px]">
          <Settings className="w-[24px] h-[24px] text-indigo-400" />
          الإعدادات
        </h2>
        <p className="text-slate-400 text-[14px]">تعديل الملف الشخصي وتغيير كلمة المرور</p>
      </div>

      <div className="grid md:grid-cols-2 gap-[24px]">
        {/* Profile Settings */}
        <div className="bg-[#1a1a35] border border-[#2d2d5e] rounded-[12px] overflow-hidden">
          <div className="p-[16px] border-b border-[#2d2d5e] bg-[#242444]/50 flex items-center gap-[8px]">
            <UserIcon className="w-[20px] h-[20px] text-indigo-400" />
            <h3 className="font-bold text-white text-[18px]">الملف الشخصي</h3>
          </div>
          <div className="p-[20px]">
            <form onSubmit={handleUpdateProfile} className="flex flex-col gap-[16px]">
              
              <div className="flex flex-col items-center gap-[12px] mb-[8px]">
                <label className="relative group cursor-pointer">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange}
                    className="hidden" 
                  />
                  <div className="w-[80px] h-[80px] rounded-full overflow-hidden bg-[#242444] border-2 border-[#2d2d5e] flex items-center justify-center relative">
                    {avatar && !avatar.startsWith('RESET:') ? (
                      <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[28px] font-bold text-indigo-400">{name ? name.charAt(0) : user?.name?.charAt(0)}</span>
                    )}
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-[11px] font-semibold">تغيير</span>
                    </div>
                  </div>
                </label>
                <p className="text-[12px] text-slate-500">صورة الحساب (اختياري)</p>
              </div>

              <div className="flex flex-col gap-[8px]">
                <label className="text-[13px] text-slate-300 font-medium">الاسم</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  className="bg-[#242444] border border-[#2d2d5e] rounded-[8px] px-[12px] py-[10px] text-white text-[14px] outline-none focus:border-indigo-500 transition-colors text-right" 
                />
              </div>
              <div className="flex flex-col gap-[8px]">
                <label className="text-[13px] text-slate-500 font-medium">البريد الإلكتروني (للقراءة فقط)</label>
                <input 
                  type="email" 
                  value={user?.email || ''} 
                  disabled
                  dir="ltr"
                  className="bg-[#242444]/50 border border-[#2d2d5e]/50 rounded-[8px] px-[12px] py-[10px] text-slate-400 text-[14px] outline-none cursor-not-allowed opacity-70" 
                />
              </div>
              <button 
                type="submit" 
                disabled={profileLoading || !name.trim()}
                className="mt-[8px] w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-[8px] py-[12px] text-[15px] font-semibold flex items-center justify-center gap-[8px] transition-colors"
              >
                <Save className="w-[18px] h-[18px]" />
                {profileLoading ? 'جاري الحفظ...' : 'حفظ التعديلات'}
              </button>
            </form>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-[#1a1a35] border border-[#2d2d5e] rounded-[12px] overflow-hidden">
          <div className="p-[16px] border-b border-[#2d2d5e] bg-[#242444]/50 flex items-center gap-[8px]">
            <KeyRound className="w-[20px] h-[20px] text-amber-400" />
            <h3 className="font-bold text-white text-[18px]">الأمان وكلمة المرور</h3>
          </div>
          <div className="p-[20px]">
            <form onSubmit={handleChangePassword} className="flex flex-col gap-[16px]">
              <div className="flex flex-col gap-[8px]">
                <label className="text-[13px] text-slate-300 font-medium">كلمة المرور الحالية</label>
                <input 
                  type="password" 
                  required
                  value={currentPassword} 
                  onChange={e => setCurrentPassword(e.target.value)}
                  dir="ltr"
                  className="bg-[#242444] border border-[#2d2d5e] rounded-[8px] px-[12px] py-[10px] text-white text-[14px] outline-none focus:border-indigo-500 transition-colors" 
                />
              </div>
              <div className="flex flex-col gap-[8px]">
                <label className="text-[13px] text-slate-300 font-medium">كلمة المرور الجديدة</label>
                <input 
                  type="password" 
                  required
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)}
                  dir="ltr"
                  className="bg-[#242444] border border-[#2d2d5e] rounded-[8px] px-[12px] py-[10px] text-white text-[14px] outline-none focus:border-indigo-500 transition-colors" 
                />
              </div>
              <div className="flex flex-col gap-[8px]">
                <label className="text-[13px] text-slate-300 font-medium">تأكيد كلمة المرور الجديدة</label>
                <input 
                  type="password" 
                  required
                  value={confirmPassword} 
                  onChange={e => setConfirmPassword(e.target.value)}
                  dir="ltr"
                  className="bg-[#242444] border border-[#2d2d5e] rounded-[8px] px-[12px] py-[10px] text-white text-[14px] outline-none focus:border-indigo-500 transition-colors" 
                />
              </div>
              <button 
                type="submit" 
                disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}
                className="mt-[8px] w-full bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-white disabled:opacity-50 rounded-[8px] py-[12px] text-[15px] font-semibold flex items-center justify-center gap-[8px] transition-colors"
              >
                <ShieldCheck className="w-[18px] h-[18px]" />
                {passwordLoading ? 'جاري التحديث...' : 'تحديث كلمة المرور'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
