'use client';

import { useState } from 'react';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Eye, EyeOff, UserPlus, Home, CheckCircle, Loader2, ArrowRight } from 'lucide-react';

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
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#091b29]">
        <div className="w-full max-w-md text-center animate-slide-up">
          <div className="glass-card p-8 sm:p-12 border-emerald-500/10">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/50 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/10">
              <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-4">تم إرسال الطلب!</h2>
            <p className="text-slate-400 font-medium mb-2">
              تم إرسال طلب تسجيلك بنجاح 🎉
            </p>
            <p className="text-slate-500 text-sm mb-10 leading-relaxed">
              سيتم مراجعة طلبك من قبل المدير وإعلامك بالنتيجة قريباً.
            </p>
            <Link href="/login" className="block">
              <Button className="w-full h-12 sm:h-14 font-bold rounded-xl text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all">
                <ArrowRight className="w-5 h-5 ml-2" />
                العودة لتسجيل الدخول
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#091b29] relative overflow-hidden selection:bg-indigo-500/30">
      {/* Background orbs */}
      <div className="absolute top-[-5%] right-[10%] w-[250px] h-[250px] sm:w-[450px] sm:h-[450px] rounded-full bg-indigo-600/10 blur-[70px] sm:blur-[110px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-5%] left-[10%] w-[250px] h-[250px] sm:w-[450px] sm:h-[450px] rounded-full bg-purple-600/10 blur-[70px] sm:blur-[110px] pointer-events-none animate-pulse delay-1000" />

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden mx-auto mb-4 shadow-lg shadow-indigo-500/20 pulse-glow border border-white/10 shrink-0">
            <img src="/favicon.png?v=3" alt="Logo" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Status Info */}
        <div className="mb-6 p-4 rounded-2xl flex items-start gap-3 bg-amber-500/5 border border-amber-500/10 animate-fade-in [animation-delay:150ms]">
          <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-amber-500 text-sm">ℹ️</span>
          </div>
          <div>
            <p className="text-amber-500 font-bold text-xs sm:text-sm uppercase tracking-wider">طلب تسجيل جديد</p>
            <p className="text-amber-400/70 text-[11px] sm:text-xs mt-1 font-medium leading-relaxed">
              التسجيل يحتاج موافقة المدير. سيتم مراجعة طلبك وإعلامك فور قبولك.
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="glass-card p-6 sm:p-10 border-white/5">
          <h2 className="text-xl sm:text-2xl font-bold text-white text-center mb-8">طلب إنشاء حساب</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div className="space-y-2">
              <Label className="text-slate-300 text-sm font-semibold pr-1">الاسم الكامل</Label>
              <Input
                type="text"
                placeholder="أدخل اسمك الكامل"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 bg-white/5 border-white/10 text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20 rounded-xl"
                disabled={loading}
              />
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label className="text-slate-300 text-sm font-semibold pr-1">البريد الإلكتروني</Label>
              <Input
                type="email"
                placeholder="example@home.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 bg-white/5 border-white/10 text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20 rounded-xl text-left"
                dir="ltr"
                disabled={loading}
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label className="text-slate-300 text-sm font-semibold pr-1">كلمة المرور</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 bg-white/5 border-white/10 text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20 rounded-xl pl-12 text-left"
                  dir="ltr"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label className="text-slate-300 text-sm font-semibold pr-1">تأكيد كلمة المرور</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-12 bg-white/5 border-white/10 text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20 rounded-xl text-left"
                dir="ltr"
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 sm:h-14 text-base sm:text-lg font-bold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98] mt-4 disabled:opacity-70 disabled:active:scale-100"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري الإرسال...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  إرسال الطلب
                </div>
              )}
            </Button>
          </form>

          {/* Footer Link */}
          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-slate-400 text-sm">
              لديك حساب بالفعل؟{' '}
              <Link href="/login" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors underline-offset-4 hover:underline">
                تسجيل الدخول
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


