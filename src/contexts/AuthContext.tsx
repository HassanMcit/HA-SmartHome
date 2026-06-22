'use client';

/**
 * AuthContext – compatibility shim on top of next-auth/react.
 *
 * All existing components that call useAuth() continue to work unchanged.
 * The session is now managed by Auth.js (next-auth) via secure HTTP-only cookies.
 *
 * Avatar strategy:
 * - JWT cannot store large base64 images (cookie size limit) → stored as 'RESET:'
 * - AuthContext fetches the real avatar from /auth/me API once per session
 * - All components get the resolved avatar via user.avatar from useAuth()
 */

import { createContext, useContext, ReactNode, useCallback, useState, useEffect } from 'react';
import { useSession, signOut as nextAuthSignOut } from 'next-auth/react';
import { authApi, User } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status, update } = useSession();
  const [resolvedAvatar, setResolvedAvatar] = useState<string | null | undefined>(undefined);

  const loading = status === 'loading';

  const accessToken = (session?.user as any)?.accessToken as string | undefined;
  const userId = (session?.user as any)?.id as string | undefined;
  const sessionAvatar = (session?.user as any)?.avatar as string | undefined;

  // Fetch real avatar from DB when JWT has RESET: sentinel (large base64)
  useEffect(() => {
    if (status === 'loading') return;
    if (!accessToken || !userId) { setResolvedAvatar(null); return; }

    // If the JWT already has a direct avatar (small enough), use it
    if (sessionAvatar && !sessionAvatar.startsWith('RESET:')) {
      setResolvedAvatar(sessionAvatar);
      return;
    }

    // Fetch from DB via API
    let cancelled = false;
    fetch(`${API_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
      cache: 'no-store',
    })
      .then(r => r.ok ? r.json() : null)
      .then(freshUser => {
        if (!cancelled) {
          setResolvedAvatar(freshUser?.avatar ?? null);
        }
      })
      .catch(() => { if (!cancelled) setResolvedAvatar(null); });

    return () => { cancelled = true; };
  }, [userId, accessToken, sessionAvatar, status]);

  // Build a User object from the session + resolved avatar
  const user: User | null = session?.user
    ? {
        id: userId ?? '',
        name: session.user.name ?? '',
        email: session.user.email ?? '',
        role: (session.user as any).role ?? 'member',
        // Use resolved avatar (fetched from DB) or fall back to session avatar
        avatar: resolvedAvatar !== undefined ? resolvedAvatar : sessionAvatar,
      }
    : null;

  const logout = useCallback(() => {
    nextAuthSignOut({ callbackUrl: '/login' });
  }, []);

  // After updating profile on the backend, refresh session + re-fetch avatar
  const updateUser = useCallback(
    async (updatedUser: User) => {
      // Optimistically update resolved avatar if provided
      if (updatedUser.avatar) {
        setResolvedAvatar(updatedUser.avatar);
      }
      // Trigger a session re-fetch so useSession() returns fresh data
      await update({ user: updatedUser });
    },
    [update]
  );

  return (
    <AuthContext.Provider value={{ user, loading, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
