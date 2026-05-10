'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Eye, EyeOff, LogIn, Home } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('يرجى إدخال البريد الإلكتروني وكلمة المرور'); return; }
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

  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: 50,
    background: '#242444',
    border: '1px solid #2d2d5e',
    borderRadius: 10,
    padding: '0 14px',
    color: '#e2e8f0',
    fontSize: 14,
    fontFamily: 'Cairo, sans-serif',
    outline: 'none',
    textAlign: 'right',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: '#cbd5e1',
    marginBottom: 8,
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a35 50%, #0f0f23 100%)',
      direction: 'rtl',
      position: 'relative',
    }}>
      {/* Background blobs */}
      <div style={{ position: 'absolute', top: 0, left: '25%', width: 350, height: 350, borderRadius: '50%', background: '#6366f1', opacity: 0.07, filter: 'blur(60px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 0, right: '25%', width: 350, height: 350, borderRadius: '50%', background: '#8b5cf6', opacity: 0.07, filter: 'blur(60px)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 80, height: 80, borderRadius: 20,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 0 0 0 rgba(99,102,241,0.4)',
            animation: 'pulse-glow 2s infinite',
          }}>
            <Home style={{ width: 40, height: 40, color: '#fff' }} />
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, background: 'linear-gradient(135deg, #6366f1, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            مدبّر
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 6 }}>إدارة المنزل الذكية</p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(26,26,53,0.85)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: 20,
          padding: '2.5rem',
        }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', textAlign: 'center', marginBottom: 28 }}>
            تسجيل الدخول
          </h2>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>البريد الإلكتروني</label>
              <input
                type="email"
                placeholder="example@home.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={inputStyle}
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>كلمة المرور</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ ...inputStyle, paddingLeft: 46 }}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 0, display: 'flex' }}
                >
                  {showPassword ? <EyeOff style={{ width: 18, height: 18 }} /> : <Eye style={{ width: 18, height: 18 }} />}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div style={{ marginBottom: 24 }}>
              <Link href="/forgot-password" style={{ fontSize: 13, color: '#64748b', textDecoration: 'none' }}>
                نسيت كلمة المرور؟
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                height: 52,
                background: loading ? '#4f46e5' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                border: 'none',
                borderRadius: 12,
                color: '#fff',
                fontSize: 16,
                fontWeight: 700,
                fontFamily: 'Cairo, sans-serif',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                opacity: loading ? 0.85 : 1,
                transition: 'opacity 0.15s',
              }}
            >
              {loading ? (
                <>
                  <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite', display: 'inline-block' }} />
                  جاري الدخول...
                </>
              ) : (
                <>
                  <LogIn style={{ width: 20, height: 20 }} />
                  تسجيل الدخول
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid #2d2d5e', textAlign: 'center' }}>
            <p style={{ color: '#94a3b8', fontSize: 14 }}>
              ليس لديك حساب؟{' '}
              <Link href="/register" style={{ color: '#818cf8', fontWeight: 600, textDecoration: 'none' }}>
                طلب التسجيل
              </Link>
            </p>
          </div>
        </div>

        {/* Demo accounts hint */}
        <div style={{
          marginTop: 16,
          padding: '14px 20px',
          borderRadius: 14,
          background: 'rgba(99,102,241,0.08)',
          border: '1px solid rgba(99,102,241,0.2)',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 6 }}>حسابات تجريبية:</p>
          <p style={{ fontSize: 12, color: '#64748b', lineHeight: 2 }}>
            مدير: admin@home.com / admin123<br />
            مراتي: wife@home.com / wife123<br />
            ابني: son@home.com / son123
          </p>
        </div>
      </div>
    </div>
  );
}
