'use client';

import { useState } from 'react';
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
  Menu,
  LogOut,
  ChevronLeft,
  Settings as SettingsIcon,
  Bell,
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
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const mainItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'الرئيسية' },
    { href: '/dashboard/transactions', icon: ArrowLeftRight, label: 'معاملات' },
    { href: '/dashboard/ai', icon: Sparkles, label: 'ذكاء' },
    { href: '/dashboard/budgets', icon: Target, label: 'ميزانية' },
  ];

  const moreItems = [
    { href: '/dashboard/savings', icon: PiggyBank, label: 'الادخار والتوفير' },
    { href: '/dashboard/bills', icon: FileText, label: 'الفواتير والالتزامات' },
    { href: '/dashboard/reminders', icon: Bell, label: 'ذكّرني (المهام)' },
    { href: '/dashboard/settings', icon: SettingsIcon, label: 'الإعدادات' },
  ];

  if (user?.role === 'admin') {
    moreItems.push({ href: '/dashboard/admin', icon: ShieldCheck, label: 'لوحة التحكم' });
  }

  return (
    <nav className="md:hidden fixed bottom-4 left-4 right-4 z-50">
      <div className="bg-[#1a1a35]/90 backdrop-blur-xl border border-white/5 rounded-2xl shadow-2xl shadow-black/50 p-2 flex items-center justify-around">
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
              <span className="text-[10px] font-bold relative z-10">{item.label}</span>
            </Link>
          );
        })}

        {/* More Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <button className="flex flex-col items-center gap-1 p-2 rounded-xl text-slate-500 hover:text-slate-300 flex-1 min-w-0">
              <Menu className="w-5 h-5" />
              <span className="text-[10px] font-bold">المزيد</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="bg-[#0f0f23] border-white/5 rounded-t-[32px] p-6 pb-12 outline-none">
            <SheetHeader className="mb-6">
              <div className="w-12 h-1.5 bg-slate-800 rounded-full mx-auto mb-6" />
              <SheetTitle className="text-right text-slate-400 text-sm font-bold uppercase tracking-wider pr-2">
                القائمة الإضافية
              </SheetTitle>
            </SheetHeader>
            
            <div className="space-y-2">
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
                      <span className="font-bold">{item.label}</span>
                    </div>
                    <ChevronLeft className="w-5 h-5 text-slate-600" />
                  </Link>
                );
              })}

              <div className="pt-4 mt-4 border-t border-white/5">
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
                  <span className="font-bold text-lg">تسجيل الخروج</span>
                </button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
