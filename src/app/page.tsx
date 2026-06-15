'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'authenticated') {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [status, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#091b29] gap-6">
      <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg shadow-indigo-500/20 pulse-glow border border-white/10 shrink-0">
        <img src="/favicon.png?v=2" alt="Logo" className="w-full h-full object-cover" />
      </div>
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
        <p className="text-slate-400 text-sm font-bold">جاري التحميل...</p>
      </div>
    </div>
  );
}

