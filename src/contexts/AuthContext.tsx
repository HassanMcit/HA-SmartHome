'use client';

/**
 * AuthContext – compatibility shim on top of next-auth/react.
 *
 * All existing components that call useAuth() continue to work unchanged.
 * The session is now managed by Auth.js (next-auth) via secure HTTP-only cookies.
 */

import { createContext, useContext, ReactNode, useCallback } from 'react';
import { useSession, signOut as nextAuthSignOut } from 'next-auth/react';
import { authApi, User } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status, update } = useSession();

  const loading = status === 'loading';

  // Build a User object from the session
  const user: User | null = session?.user
    ? {
        id: (session.user as any).id ?? '',
        name: session.user.name ?? '',
        email: session.user.email ?? '',
        role: (session.user as any).role ?? 'member',
        avatar: (session.user as any).avatar,
      }
    : null;

  const logout = useCallback(() => {
    nextAuthSignOut({ callbackUrl: '/login' });
  }, []);

  // After updating profile on the backend, refresh the session token
  const updateUser = useCallback(
    async (updatedUser: User) => {
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
