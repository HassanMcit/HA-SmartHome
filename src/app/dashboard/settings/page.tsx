'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { authApi } from '@/lib/api';
import { useRealAvatar, storeAvatar } from '@/hooks/useRealAvatar';
import { ShieldCheck, User as UserIcon, Settings, KeyRound, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { lang } = useLanguage();
  const [name, setName] = useState(user?.name || '');
  // localAvatar holds newly picked image (base64 preview), empty = no change
  const [localAvatar, setLocalAvatar] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  // Fetch real avatar from DB (handles RESET: sentinel from JWT)
  const realAvatar = useRealAvatar(user?.id, user?.avatar);

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
            if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
          } else {
            if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
          setLocalAvatar(compressedBase64);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error(lang === 'ar' ? 'الاسم مطلوب' : 'Name is required');
      return;
    }
    setProfileLoading(true);
    try {
      // Send localAvatar (newly picked) if set, else don't change the avatar
      const payload: { name: string; avatar?: string } = { name };
      if (localAvatar) payload.avatar = localAvatar;
      const updatedUser = await authApi.updateProfile(payload);
      // Save avatar to localStorage so it shows immediately on all devices
      if (localAvatar && user?.id) {
        storeAvatar(user.id, localAvatar);
      }
      // Update the session with the new user data so it reflects immediately
      await updateUser(updatedUser);
      toast.success(lang === 'ar' ? 'تم تحديث الملف الشخصي بنجاح' : 'Profile updated successfully');
      setTimeout(() => { window.location.reload(); }, 700);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : (lang === 'ar' ? 'حدث خطأ أثناء التحديث' : 'Error updating profile'));
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error(lang === 'ar' ? 'كلمات المرور الجديدة غير متطابقة' : 'New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error(lang === 'ar' ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
      return;
    }
    setPasswordLoading(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      toast.success(lang === 'ar' ? 'تم تغيير كلمة المرور بنجاح' : 'Password changed successfully');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : (lang === 'ar' ? 'كلمة المرور الحالية غير صحيحة' : 'Current password is incorrect'));
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-[24px] pb-[80px] md:pb-0">
      {/* Header */}
      <div>
        <h2 className="text-[24px] font-bold flex items-center gap-[8px] mb-[4px]" style={{ color: 'var(--foreground)' }}>
          <Settings className="w-[24px] h-[24px] text-indigo-400" />
          {lang === 'ar' ? 'الإعدادات' : 'Settings'}
        </h2>
        <p className="text-[14px]" style={{ color: 'var(--muted-foreground)' }}>
          {lang === 'ar' ? 'تعديل الملف الشخصي وتغيير كلمة المرور' : 'Edit your profile and change your password'}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-[24px]">
        {/* Profile Settings */}
        <div className="border rounded-[12px] overflow-hidden" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="p-[16px] border-b flex items-center gap-[8px]" style={{ borderColor: 'var(--border)', background: 'var(--secondary)' }}>
            <UserIcon className="w-[20px] h-[20px] text-indigo-400" />
            <h3 className="font-bold text-[18px]" style={{ color: 'var(--foreground)' }}>
              {lang === 'ar' ? 'الملف الشخصي' : 'Profile'}
            </h3>
          </div>
          <div className="p-[20px]">
            <form onSubmit={handleUpdateProfile} className="flex flex-col gap-[16px]">
              <div className="flex flex-col items-center gap-[12px] mb-[8px]">
                <label className="relative group cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  <div className="w-[80px] h-[80px] rounded-full overflow-hidden border-2 flex items-center justify-center relative" style={{ background: 'var(--secondary)', borderColor: 'var(--border)' }}>
                    {localAvatar ? (
                      <img src={localAvatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : realAvatar ? (
                      <img src={realAvatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[28px] font-bold text-indigo-400">{name ? name.charAt(0) : user?.name?.charAt(0)}</span>
                    )}
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-[11px] font-semibold">{lang === 'ar' ? 'تغيير' : 'Change'}</span>
                    </div>
                  </div>
                </label>
                <p className="text-[12px]" style={{ color: 'var(--muted-foreground)' }}>
                  {lang === 'ar' ? 'صورة الحساب (اختياري)' : 'Account photo (optional)'}
                </p>
              </div>

              <div className="flex flex-col gap-[8px]">
                <label className="text-[13px] font-medium" style={{ color: 'var(--foreground)' }}>
                  {lang === 'ar' ? 'الاسم' : 'Full Name'}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="bills-input"
                  style={{ textAlign: lang === 'ar' ? 'right' : 'left' }}
                />
              </div>
              <div className="flex flex-col gap-[8px]">
                <label className="text-[13px] font-medium" style={{ color: 'var(--muted-foreground)' }}>
                  {lang === 'ar' ? 'البريد الإلكتروني (للقراءة فقط)' : 'Email (read-only)'}
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  dir="ltr"
                  className="bills-input opacity-60 cursor-not-allowed"
                />
              </div>
              <button
                type="submit"
                disabled={profileLoading || !name.trim()}
                className="mt-[8px] w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-[8px] py-[12px] text-[15px] font-semibold flex items-center justify-center gap-[8px] transition-colors"
              >
                <Save className="w-[18px] h-[18px]" />
                {profileLoading
                  ? (lang === 'ar' ? 'جاري الحفظ...' : 'Saving...')
                  : (lang === 'ar' ? 'حفظ التعديلات' : 'Save Changes')}
              </button>
            </form>
          </div>
        </div>

        {/* Security Settings */}
        <div className="border rounded-[12px] overflow-hidden" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="p-[16px] border-b flex items-center gap-[8px]" style={{ borderColor: 'var(--border)', background: 'var(--secondary)' }}>
            <KeyRound className="w-[20px] h-[20px] text-amber-400" />
            <h3 className="font-bold text-[18px]" style={{ color: 'var(--foreground)' }}>
              {lang === 'ar' ? 'الأمان وكلمة المرور' : 'Security & Password'}
            </h3>
          </div>
          <div className="p-[20px]">
            <form onSubmit={handleChangePassword} className="flex flex-col gap-[16px]">
              <div className="flex flex-col gap-[8px]">
                <label className="text-[13px] font-medium" style={{ color: 'var(--foreground)' }}>
                  {lang === 'ar' ? 'كلمة المرور الحالية' : 'Current Password'}
                </label>
                <input
                  type="password" required value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  dir="ltr" className="bills-input"
                />
              </div>
              <div className="flex flex-col gap-[8px]">
                <label className="text-[13px] font-medium" style={{ color: 'var(--foreground)' }}>
                  {lang === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}
                </label>
                <input
                  type="password" required value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  dir="ltr" className="bills-input"
                />
              </div>
              <div className="flex flex-col gap-[8px]">
                <label className="text-[13px] font-medium" style={{ color: 'var(--foreground)' }}>
                  {lang === 'ar' ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}
                </label>
                <input
                  type="password" required value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  dir="ltr" className="bills-input"
                />
              </div>
              <button
                type="submit"
                disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}
                className="mt-[8px] w-full bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-white disabled:opacity-50 rounded-[8px] py-[12px] text-[15px] font-semibold flex items-center justify-center gap-[8px] transition-colors"
              >
                <ShieldCheck className="w-[18px] h-[18px]" />
                {passwordLoading
                  ? (lang === 'ar' ? 'جاري التحديث...' : 'Updating...')
                  : (lang === 'ar' ? 'تحديث كلمة المرور' : 'Update Password')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
