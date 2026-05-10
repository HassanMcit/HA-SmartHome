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
  ShieldCheck,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'الرئيسية' },
  { href: '/dashboard/transactions', icon: ArrowLeftRight, label: 'معاملات' },
  { href: '/dashboard/budgets', icon: Target, label: 'ميزانية' },
  { href: '/dashboard/savings', icon: PiggyBank, label: 'ادخار' },
  { href: '/dashboard/bills', icon: FileText, label: 'فواتير' },
  { href: '/dashboard/ai', icon: Sparkles, label: 'ذكاء' },
];

export default function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const items = user?.role === 'admin'
    ? [...navItems, { href: '/dashboard/admin', icon: ShieldCheck, label: 'مدير' }]
    : navItems;

  return (
    <nav
      className="md:hidden"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: '#1a1a35',
        borderTop: '1px solid #2d2d5e',
        direction: 'rtl',
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '8px 4px 12px',
      }}>
        {items.slice(0, 6).map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                padding: '6px 10px',
                borderRadius: 10,
                textDecoration: 'none',
                color: active ? '#818cf8' : '#64748b',
                minWidth: 0,
                flex: 1,
                transition: 'color 0.15s ease',
              }}
            >
              <div style={{ position: 'relative' }}>
                {active && (
                  <div style={{
                    position: 'absolute', inset: -4, borderRadius: 8,
                    background: 'rgba(99,102,241,0.2)', filter: 'blur(4px)',
                  }} />
                )}
                <item.icon style={{ width: 20, height: 20, position: 'relative', zIndex: 1 }} />
              </div>
              <span style={{ fontSize: 10, fontWeight: active ? 600 : 500, textAlign: 'center' }}>
                {item.label}
              </span>
              {active && (
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#6366f1' }} />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
