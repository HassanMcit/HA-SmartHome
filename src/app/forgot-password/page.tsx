'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Home, Mail, ArrowRight, CheckCircle, KeyRound, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

type Step = 'email' | 'code' | 'done';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error('يرجى إدخال البريد الإلكتروني'); return; }
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || 'حدث خطأ في الإرسال');
        return;
      }

      toast.success('تم الإرسال! تفقد بريدك الإلكتروني للحصول على الرمز.');
      setStep('code');
    } catch (error) {
      console.error('Request code error:', error);
      toast.error('حدث خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !newPassword) { toast.error('جميع الحقول مطلوبة'); return; }
    if (newPassword.length < 6) { toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل'); return; }

    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.message); return; }
      toast.success('تم تغيير كلمة المرور بنجاح!');
      setStep('done');
    } catch {
      toast.error('حدث خطأ، حاول مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #16172e 0%, #121325 50%, #16172e 100%)' }}
    >
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none" style={{ background: '#6366f1' }} />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none" style={{ background: '#8b5cf6' }} />

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 pulse-glow"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <Home className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">مدبّر</h1>
          <p className="text-slate-400 mt-2 text-sm">إدارة المنزل الذكية</p>
        </div>

        <div className="glass-card p-8">

          {/* Step 1: Enter email */}
          {step === 'email' && (
            <>
              <div className="mb-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-7 h-7 text-indigo-400" />
                </div>
                <h2 className="text-xl font-bold text-white">نسيت كلمة المرور؟</h2>
                <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                  أدخل بريدك الإلكتروني وسنرسل رمزاً للمدير لمشاركته معك
                </p>
              </div>

              <form onSubmit={handleRequestCode} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-slate-300 text-sm font-medium">البريد الإلكتروني</Label>
                  <Input
                    type="email"
                    placeholder="example@home.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="text-right"
                    style={{ background: '#242444', border: '1px solid #2d2d5e', color: '#e2e8f0', borderRadius: '10px', height: '48px' }}
                    disabled={loading}
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full h-12 text-base font-bold rounded-xl text-white"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none' }}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      جاري الإرسال...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2"><Mail className="w-5 h-5" />إرسال الرمز</span>
                  )}
                </Button>
              </form>
            </>
          )}

          {/* Step 2: Enter code + new password */}
          {step === 'code' && (
            <>
              <div className="mb-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
                  <KeyRound className="w-7 h-7 text-amber-400" />
                </div>
                <h2 className="text-xl font-bold text-white">أدخل رمز التأكيد</h2>
                <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                  تفقد بريدك الإلكتروني للحصول على رمز التأكيد المكون من 6 أرقام
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-slate-300 text-sm font-medium">رمز التأكيد (6 أرقام)</Label>
                  <Input
                    type="text"
                    placeholder="123456"
                    value={code}
                    onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="text-center tracking-widest text-xl"
                    style={{ background: '#242444', border: '1px solid #2d2d5e', color: '#e2e8f0', borderRadius: '10px', height: '56px' }}
                    disabled={loading}
                    dir="ltr"
                    maxLength={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300 text-sm font-medium">كلمة المرور الجديدة</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="text-right pl-12"
                      style={{ background: '#242444', border: '1px solid #2d2d5e', color: '#e2e8f0', borderRadius: '10px', height: '48px' }}
                      disabled={loading}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setStep('email')}
                    className="flex-1 border-slate-700 text-slate-400 hover:text-white bg-transparent">
                    رجوع
                  </Button>
                  <Button type="submit" disabled={loading || code.length < 6 || newPassword.length < 6}
                    className="flex-1 h-12 font-bold rounded-xl text-white"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none' }}>
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        جاري التغيير...
                      </span>
                    ) : 'تغيير كلمة المرور'}
                  </Button>
                </div>
              </form>
            </>
          )}

          {/* Step 3: Done */}
          {step === 'done' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-9 h-9 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">تم بنجاح! 🎉</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول بكلمة مرورك الجديدة.
              </p>
              <Link href="/login" className="mt-6 inline-block">
                <Button className="px-8 py-2 rounded-xl text-white font-bold"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none' }}>
                  تسجيل الدخول الآن
                </Button>
              </Link>
            </div>
          )}

          {step !== 'done' && (
            <div className="mt-6 pt-6 border-t border-slate-700 text-center">
              <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium text-sm flex items-center justify-center gap-2">
                <ArrowRight className="w-4 h-4" />
                العودة لتسجيل الدخول
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
