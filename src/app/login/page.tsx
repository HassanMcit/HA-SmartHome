'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Eye, EyeOff, LogIn, Home, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { 
      toast.error('يرجى إدخال البريد الإلكتروني وكلمة المرور'); 
      return; 
    }
    setLoading(true);
    try {
      await login(email, password);
      toast.success('تم تسجيل الدخول بنجاح 🎉');
      router.push('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'حدث خطأ في تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#0f0f23] relative overflow-hidden selection:bg-sky-500/30">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[20%] w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] rounded-full bg-sky-600/10 blur-[80px] sm:blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[20%] w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] rounded-full bg-purple-600/10 blur-[80px] sm:blur-[120px] pointer-events-none animate-pulse delay-700" />

      <div className="w-full max-w-[440px] relative z-10 animate-fade-in">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-sky-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-sky-500/20 pulse-glow">
            <Home className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black gradient-text tracking-tight">
            مدبّر
          </h1>
          <p className="text-slate-400 text-sm sm:text-base mt-2 font-medium">إدارة المنزل الذكية</p>
        </div>

        {/* Card */}
        <div className="glass-card p-6 sm:p-10 border-white/5">
          <h2 className="text-xl sm:text-2xl font-bold text-white text-center mb-8">
            تسجيل الدخول
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <Label className="text-slate-300 text-sm font-semibold pr-1">البريد الإلكتروني</Label>
              <Input
                type="email"
                placeholder="example@home.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="h-12 bg-[#242444] border-[#2d2d5e] text-slate-200 placeholder:text-slate-500 focus:border-sky-500 focus:ring-sky-500/20 rounded-xl text-left"
                dir="ltr"
                disabled={loading}
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <Label className="text-slate-300 text-sm font-semibold">كلمة المرور</Label>
                <Link href="/forgot-password" size="sm" className="text-xs text-slate-500 hover:text-sky-400 transition-colors">
                  نسيت كلمة المرور؟
                </Link>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="h-12 bg-[#242444] border-[#2d2d5e] text-slate-200 placeholder:text-slate-500 focus:border-sky-500 focus:ring-sky-500/20 rounded-xl pl-12 text-left"
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

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 sm:h-14 text-base sm:text-lg font-bold rounded-xl text-white bg-gradient-to-r from-sky-600 to-purple-600 hover:from-sky-500 hover:to-purple-500 shadow-lg shadow-sky-500/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري الدخول...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <LogIn className="w-5 h-5" />
                  تسجيل الدخول
                </div>
              )}
            </Button>
          </form>

          {/* Footer Link */}
          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-slate-400 text-sm">
              ليس لديك حساب؟{' '}
              <Link href="/register" className="text-sky-400 font-bold hover:text-sky-300 transition-colors underline-offset-4 hover:underline">
                طلب تسجيل
              </Link>
            </p>
          </div>
        </div>

        {/* Demo Accounts Hint */}
        <div className="mt-6 p-4 rounded-2xl bg-sky-500/5 border border-sky-500/10 text-center animate-fade-in [animation-delay:200ms]">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">حسابات تجريبية</p>
          <div className="grid grid-cols-1 gap-1 text-[11px] sm:text-xs text-slate-500 leading-relaxed">
            <p><span className="text-slate-400 font-semibold">مدير:</span> admin@home.com / admin123</p>
            <p><span className="text-slate-400 font-semibold">مراتي:</span> wife@home.com / wife123</p>
            <p><span className="text-slate-400 font-semibold">ابني:</span> son@home.com / son123</p>
          </div>
        </div>
      </div>
    </div>
  );
}

