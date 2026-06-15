'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import Link from 'next/link';
import { Home, Loader2, Sun, Moon, Languages } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { t, lang, toggleLang } = useLanguage();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#091b29] gap-6">
        <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg shadow-indigo-500/20 pulse-glow border border-white/10 shrink-0">
          <img src="/favicon.png?v=2" alt="Logo" className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
          <p className="text-slate-500 text-sm font-bold tracking-widest uppercase">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-[#091b29]">
      {/* Desktop Sidebar - sticky */}
      <aside className={`hidden md:block w-64 flex-shrink-0 ${lang === 'ar' ? 'border-l' : 'border-r'} border-white/5`}>
        <div className="sticky top-0 h-screen overflow-y-auto">
          <Sidebar />
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-1 min-w-0 overflow-x-hidden flex flex-col">
        
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-40 bg-[#091b29]/85 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3 active:scale-95 transition-transform group">
            <div className="w-9 h-9 rounded-xl overflow-hidden shadow-lg border border-white/10 group-hover:scale-110 transition-transform shrink-0">
              <img src="/favicon.png?v=2" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-black gradient-text tracking-tight">{t('app_name')}</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('welcome')}</p>
              <p className="text-sm font-black text-white">{user.name.split(' ')[0]}</p>
            </div>
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="theme-toggle-btn"
              title={theme === 'dark' ? t('theme_light') : t('theme_dark')}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-[#7650FF]" />
              )}
            </button>
            {/* Language toggle */}
            <button
              onClick={toggleLang}
              className="theme-toggle-btn text-slate-400 hover:text-emerald-400"
              title={t('lang_switch_to_en')}
            >
              <Languages className="w-4 h-4" />
            </button>
            <Link href="/dashboard/settings" className="group">
              <Avatar className="w-10 h-10 border-2 border-white/5 group-hover:border-indigo-500/30 transition-all">
                <AvatarImage src={user?.avatar && !user.avatar.startsWith('RESET:') ? user.avatar : undefined} />
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-pink-500 text-white font-black">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-6 pb-28 sm:p-10 sm:pb-10 max-w-7xl mx-auto w-full box-border">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  );
}

