'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

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
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0d1a00' }}>
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)' }}>
          <span className="text-2xl">🏠</span>
        </div>
        <p className="text-slate-400">جاري التحميل...</p>
      </div>
    </div>
  );
}
