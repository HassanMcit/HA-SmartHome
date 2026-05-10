'use client';

import { useState } from 'react';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Eye, EyeOff, UserPlus, Home, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      toast.error('يرجى ملء جميع الحقول');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('كلمتا المرور غير متطابقتين');
      return;
    }

    if (password.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    setLoading(true);
    try {
      await authApi.registerRequest(name, email, password);
      setSubmitted(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'حدث خطأ في إرسال الطلب');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4"
        style={{ background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a35 50%, #0f0f23 100%)' }}>
        <div className="w-full max-w-md text-center animate-slide-up">
          <div className="glass-card p-10">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: 'rgba(16, 185, 129, 0.2)', border: '2px solid #10b981' }}>
              <CheckCircle className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">تم إرسال الطلب!</h2>
            <p className="text-slate-400 mb-2">
              تم إرسال طلب تسجيلك بنجاح 🎉
            </p>
            <p className="text-slate-500 text-sm mb-8">
              سيتم مراجعة طلبك من قبل المدير وإعلامك بالقبول أو الرفض.
            </p>
            <Link href="/login">
              <Button className="w-full h-12 font-bold rounded-xl text-white"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                العودة لتسجيل الدخول
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a35 50%, #0f0f23 100%)' }}>

      {/* Background orbs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: '#8b5cf6' }} />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: '#6366f1' }} />

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <Home className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">مدبّر</h1>
          <p className="text-slate-400 mt-2 text-sm">إدارة المنزل الذكية</p>
        </div>

        {/* Info Banner */}
        <div className="mb-4 p-4 rounded-xl flex items-start gap-3"
          style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
          <span className="text-xl">ℹ️</span>
          <div>
            <p className="text-amber-400 font-semibold text-sm">طلب تسجيل</p>
            <p className="text-amber-300/70 text-xs mt-1">
              التسجيل يحتاج موافقة المدير. سيتم مراجعة طلبك وإعلامك بالنتيجة.
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          <h2 className="text-xl font-bold text-white mb-6 text-center">طلب إنشاء حساب</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-300 text-sm font-medium">الاسم الكامل</Label>
              <Input
                type="text"
                placeholder="أدخل اسمك الكامل"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  background: '#242444', border: '1px solid #2d2d5e',
                  color: '#e2e8f0', borderRadius: '10px', height: '48px', fontSize: '14px',
                }}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300 text-sm font-medium">البريد الإلكتروني</Label>
              <Input
                type="email"
                placeholder="example@home.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  background: '#242444', border: '1px solid #2d2d5e',
                  color: '#e2e8f0', borderRadius: '10px', height: '48px', fontSize: '14px',
                }}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300 text-sm font-medium">كلمة المرور</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12"
                  style={{
                    background: '#242444', border: '1px solid #2d2d5e',
                    color: '#e2e8f0', borderRadius: '10px', height: '48px', fontSize: '14px',
                  }}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300 text-sm font-medium">تأكيد كلمة المرور</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{
                  background: '#242444', border: '1px solid #2d2d5e',
                  color: '#e2e8f0', borderRadius: '10px', height: '48px', fontSize: '14px',
                }}
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-bold rounded-xl text-white cursor-pointer mt-2"
              style={{
                background: loading ? '#4f46e5' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                border: 'none',
              }}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جاري الإرسال...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  إرسال الطلب
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-700 text-center">
            <p className="text-slate-400 text-sm">
              لديك حساب بالفعل؟{' '}
              <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
                تسجيل الدخول
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
