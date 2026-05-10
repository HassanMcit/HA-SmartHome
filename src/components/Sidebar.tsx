'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PiggyBank,
  Target,
  FileText,
  Sparkles,
  Settings,
  LogOut,
  Home,
  ShieldCheck,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'الرئيسية' },
  { href: '/dashboard/transactions', icon: ArrowLeftRight, label: 'المعاملات' },
  { href: '/dashboard/budgets', icon: Target, label: 'الميزانية' },
  { href: '/dashboard/savings', icon: PiggyBank, label: 'الادخار' },
  { href: '/dashboard/bills', icon: FileText, label: 'الفواتير' },
  { href: '/dashboard/ai', icon: Sparkles, label: 'تحليل ذكي' },
];

const adminItems = [
  { href: '/dashboard/admin', icon: ShieldCheck, label: 'لوحة المدير' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <div style={{
      width: 256,
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#1a1a35',
      borderLeft: '1px solid #2d2d5e',
      direction: 'rtl',
      overflowY: 'auto',
    }}>

      {/* Logo */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #2d2d5e', flexShrink: 0 }}>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12, flexShrink: 0,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Home style={{ width: 20, height: 20, color: '#fff' }} />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>مدبّر</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>إدارة المنزل</div>
          </div>
        </Link>
      </div>

      {/* User info */}
      <div style={{ padding: '16px 16px 8px' }}>
        <div style={{ padding: '12px', borderRadius: 12, background: '#242444' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #6366f1, #ec4899)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: 18, overflow: 'hidden'
            }}>
              {user?.avatar && !user.avatar.startsWith('RESET:') ? (
                <img src={user.avatar} alt="User Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                user?.name?.charAt(0)
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name}
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2 }}>
                {user?.email}
              </div>
            </div>
            {user?.role === 'admin' && (
              <div style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: 'rgba(99,102,241,0.2)', color: '#818cf8', flexShrink: 0, fontWeight: 600 }}>
                مدير
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ fontSize: 11, color: '#475569', fontWeight: 600, padding: '8px 12px 4px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          القائمة
        </div>

        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '11px 14px',
                borderRadius: 10,
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 500,
                color: active ? '#818cf8' : '#94a3b8',
                background: active ? 'rgba(99,102,241,0.12)' : 'transparent',
                borderRight: active ? '3px solid #6366f1' : '3px solid transparent',
                transition: 'all 0.15s ease',
                marginBottom: 2,
              }}
            >
              <item.icon style={{ width: 18, height: 18, flexShrink: 0 }} />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {user?.role === 'admin' && (
          <>
            <div style={{ fontSize: 11, color: '#475569', fontWeight: 600, padding: '16px 12px 4px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              الإدارة
            </div>
            {adminItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '11px 14px',
                    borderRadius: 10,
                    textDecoration: 'none',
                    fontSize: 14,
                    fontWeight: 500,
                    color: active ? '#fbbf24' : '#94a3b8',
                    background: active ? 'rgba(245,158,11,0.12)' : 'transparent',
                    borderRight: active ? '3px solid #f59e0b' : '3px solid transparent',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <item.icon style={{ width: 18, height: 18, flexShrink: 0 }} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* Bottom Actions */}
      <div style={{ padding: '8px 12px 16px', borderTop: '1px solid #2d2d5e', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Link
          href="/dashboard/settings"
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '11px 14px', borderRadius: 10, textDecoration: 'none',
            fontSize: 14, fontWeight: 500, color: '#94a3b8',
            transition: 'all 0.15s ease',
          }}
        >
          <Settings style={{ width: 18, height: 18 }} />
          <span>الإعدادات</span>
        </Link>
        <button
          onClick={logout}
          style={{
            display: 'flex', alignItems: 'center', gap: 12, width: '100%',
            padding: '11px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
            fontSize: 14, fontWeight: 500, color: '#ef4444',
            background: 'transparent', transition: 'all 0.15s ease',
            fontFamily: 'Cairo, sans-serif',
          }}
        >
          <LogOut style={{ width: 18, height: 18 }} />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );
}
