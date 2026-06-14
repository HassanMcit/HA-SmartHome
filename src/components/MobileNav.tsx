'use client';

import { useState } from 'react';
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
  ShieldCheck,
  Menu,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Settings as SettingsIcon,
  Bell,
  Sun,
  Moon,
  Languages,
  Receipt,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function MobileNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, lang, toggleLang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const isRtl = lang === 'ar';

  const mainItems = [
    { href: '/dashboard', icon: LayoutDashboard, labelKey: 'nav_home' as const },
    { href: '/dashboard/transactions', icon: ArrowLeftRight, labelKey: 'nav_transactions' as const },
    { href: '/dashboard/ai', icon: Sparkles, labelKey: 'nav_ai' as const },
    { href: '/dashboard/budgets', icon: Target, labelKey: 'nav_budgets' as const },
  ];

  const moreItems: { href: string; icon: any; labelKey: any }[] = [
    { href: '/dashboard/savings', icon: PiggyBank, labelKey: 'nav_savings' },
    { href: '/dashboard/bills', icon: FileText, labelKey: 'nav_bills' },
    { href: '/dashboard/reminders', icon: Bell, labelKey: 'nav_reminders' },
    { href: '/dashboard/split', icon: Receipt, labelKey: 'nav_split' },
    { href: '/dashboard/advisor', icon: BrainCircuit, labelKey: 'nav_advisor' },
    { href: '/dashboard/settings', icon: SettingsIcon, labelKey: 'nav_settings' },
  ];

  if (user?.role === 'admin') {
    moreItems.push({ href: '/dashboard/admin', icon: ShieldCheck, labelKey: 'nav_admin' });
  }

  const ChevronIcon = isRtl ? ChevronLeft : ChevronRight;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="mx-4 mb-4 bg-[#162035]/90 backdrop-blur-xl border border-white/5 rounded-2xl shadow-2xl shadow-black/50 p-2 flex items-center justify-around">
        {mainItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-xl transition-all relative flex-1 min-w-0",
                active ? "text-indigo-400" : "text-slate-500 hover:text-slate-300"
              )}
            >
              {active && (
                <div className="absolute inset-0 bg-indigo-500/10 blur-md rounded-xl" />
              )}
              <item.icon className={cn("w-5 h-5 relative z-10", active && "scale-110")} />
              <span className="text-[10px] font-bold relative z-10">{t(item.labelKey)}</span>
            </Link>
          );
        })}

        {/* More Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger className="flex flex-col items-center gap-1 p-2 rounded-xl text-slate-500 hover:text-slate-300 flex-1 min-w-0 focus:outline-none">
            <Menu className="w-5 h-5" />
            <span className="text-[10px] font-bold">{t('nav_more')}</span>
          </SheetTrigger>
          <SheetContent side="bottom" className="bg-[#162035] border-white/5 rounded-t-[32px] p-0 outline-none max-h-[85dvh] overflow-hidden flex flex-col">
            {/* Handle bar + header */}
            <div className="px-6 pt-5 pb-4 flex-shrink-0">
              <div className="w-12 h-1.5 bg-slate-800 rounded-full mx-auto mb-5" />
              <SheetHeader className="p-0">
                <SheetTitle className={cn("text-slate-400 text-sm font-bold uppercase tracking-wider", isRtl ? "text-right" : "text-left")}>
                  {t('nav_more_menu')}
                </SheetTitle>
              </SheetHeader>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 pb-8 space-y-1">
              {moreItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-2xl transition-all",
                      active ? "bg-indigo-500/10 text-indigo-400" : "hover:bg-white/5 text-slate-300"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        active ? "bg-indigo-500/20 text-indigo-400" : "bg-slate-800/50 text-slate-500"
                      )}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <span className="font-bold">{t(item.labelKey)}</span>
                    </div>
                    <ChevronIcon className="w-5 h-5 text-slate-600" />
                  </Link>
                );
              })}

              <div className="pt-3 mt-3 border-t border-white/5">
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                    <LogOut className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-lg">{t('nav_logout')}</span>
                </button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}

