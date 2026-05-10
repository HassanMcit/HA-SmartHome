'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f0f23' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg, #6366f1, #818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <span style={{ fontSize: 24 }}>🏠</span>
          </div>
          <div style={{ width: 24, height: 24, border: '3px solid rgba(129,140,248,0.3)', borderTopColor: '#818cf8', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0f0f23', direction: 'rtl' }}>

      {/* Sidebar - sticky on desktop, hidden on mobile */}
      <div
        className="hidden md:block"
        style={{ width: 256, flexShrink: 0 }}
      >
        <div style={{ position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
          <Sidebar />
        </div>
      </div>

      {/* Main content area */}
      <main style={{ flex: 1, minWidth: 0, overflowX: 'hidden', direction: 'rtl' }}>
        
        {/* Mobile Header */}
        <div 
          className="md:hidden" 
          style={{ 
            padding: '16px 20px', 
            borderBottom: '1px solid #2d2d5e', 
            background: '#1a1a35', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 40
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>مدبّر</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{user.name.split(' ')[0]}</div>
            </div>
            <a href="/dashboard/settings" style={{ textDecoration: 'none' }}>
              <div style={{ 
                width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #ec4899)', 
                overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                color: '#fff', fontWeight: 700, fontSize: 16 
              }}>
                {user?.avatar && !user.avatar.startsWith('RESET:') ? (
                  <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  user.name.charAt(0)
                )}
              </div>
            </a>
          </div>
        </div>

        <div style={{ padding: '2rem 1.5rem', maxWidth: '100%', boxSizing: 'border-box' }} className="md:p-[2rem_2.5rem]">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  );
}
