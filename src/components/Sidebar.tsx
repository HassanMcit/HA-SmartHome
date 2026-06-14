'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PiggyBank,
  Target,
  FileText,
  Sparkles,
  BrainCircuit,
  Settings,
  LogOut,
  Home,
  ShieldCheck,
  Bell,
  Sun,
  Moon,
  Languages,
  Receipt,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, lang, toggleLang } = useLanguage();

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, labelKey: 'nav_home' as const },
    { href: '/dashboard/transactions', icon: ArrowLeftRight, labelKey: 'nav_transactions' as const },
    { href: '/dashboard/budgets', icon: Target, labelKey: 'nav_budgets' as const },
    { href: '/dashboard/savings', icon: PiggyBank, labelKey: 'nav_savings' as const },
    { href: '/dashboard/bills', icon: FileText, labelKey: 'nav_bills' as const },
    { href: '/dashboard/reminders', icon: Bell, labelKey: 'nav_reminders' as const },
    { href: '/dashboard/split', icon: Receipt, labelKey: 'nav_split' as const },
    { href: '/dashboard/ai', icon: Sparkles, labelKey: 'nav_ai' as const },
    { href: '/dashboard/advisor', icon: BrainCircuit, labelKey: 'nav_advisor' as const },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <div className="w-64 h-full flex flex-col bg-[#070a13] border-l border-white/5 direction-rtl overflow-y-auto custom-scrollbar">
      {/* Logo & Toggles */}
      <div className="px-6 py-6 border-b border-white/5 flex-shrink-0 flex items-center justify-between gap-2">
        <Link href="/dashboard" className="flex items-center gap-3 active:scale-95 transition-transform group">
          <div className={cn(
            "w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg transition-all group-hover:scale-110",
            theme === 'dark'
              ? "bg-[#7650FF] border-2 border-white text-white shadow-purple-500/20"
              : "bg-white border-2 border-[#7650FF] text-[#7650FF] shadow-indigo-500/10"
          )}>
            <Home className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black text-white leading-none tracking-tight">{t('app_name')}</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{t('app_subtitle')}</span>
          </div>
        </Link>

        {/* Quick Actions (Theme & Language) */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="theme-toggle-btn w-9 h-9 rounded-xl flex items-center justify-center border border-white/10 hover:bg-white/10 transition-all"
            title={theme === 'dark' ? t('theme_light') : t('theme_dark')}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-[#7650FF]" />
            )}
          </button>

          {/* Language Toggle */}
          <button
            onClick={toggleLang}
            className="theme-toggle-btn w-9 h-9 rounded-xl flex items-center justify-center border border-white/10 hover:bg-white/10 transition-all text-slate-400 hover:text-emerald-400"
            title={t('lang_switch_to_en')}
          >
            <Languages className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 pt-6 pb-2">
        <div className="p-4 rounded-[20px] bg-white/5 border border-white/5 shadow-inner">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border border-white/10">
              <AvatarImage src={user?.avatar && !user.avatar.startsWith('RESET:') ? user.avatar : undefined} />
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-pink-500 text-white font-black">
                {user?.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{user?.name}</p>
              <p className="text-[10px] font-medium text-slate-500 truncate mt-0.5">{user?.email}</p>
            </div>
          </div>
          {user?.role === 'admin' && (
            <div className="mt-3 py-1 px-3 bg-indigo-500/10 rounded-lg border border-indigo-500/20 text-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">{t('app_tagline')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        <p className="px-4 mb-2 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">{t('nav_main')}</p>
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all group relative",
                active 
                  ? "bg-indigo-500/10 text-indigo-400" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              )}
            >
              {active && <div className="absolute right-0 top-2 bottom-2 w-1 bg-indigo-500 rounded-l-full shadow-[0_0_8px_rgba(99,102,241,0.5)]" />}
              <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", active && "text-indigo-400")} />
              <span>{t(item.labelKey)}</span>
            </Link>
          );
        })}

        {user?.role === 'admin' && (
          <div className="pt-6">
            <p className="px-4 mb-2 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">{t('nav_management')}</p>
            <Link
              href="/dashboard/admin"
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all group relative",
                isActive('/dashboard/admin')
                  ? "bg-amber-500/10 text-amber-500" 
                  : "text-slate-400 hover:text-amber-500 hover:bg-amber-500/5"
              )}
            >
              {isActive('/dashboard/admin') && <div className="absolute right-0 top-2 bottom-2 w-1 bg-amber-500 rounded-l-full shadow-[0_0_8px_rgba(245,158,11,0.5)]" />}
              <ShieldCheck className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span>{t('nav_admin')}</span>
            </Link>
          </div>
        )}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-white/5 bg-black/10">
        <Link
          href="/dashboard/settings"
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all group mb-1",
            isActive('/dashboard/settings') 
              ? "bg-white/10 text-white" 
              : "text-slate-400 hover:text-white hover:bg-white/5"
          )}
        >
          <Settings className="w-5 h-5 transition-transform group-hover:rotate-45" />
          <span>{t('nav_settings')}</span>
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all group active:scale-95"
        >
          <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          <span>{t('nav_logout')}</span>
        </button>
      </div>
    </div>
  );
}
