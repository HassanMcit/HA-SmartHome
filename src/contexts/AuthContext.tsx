'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, getToken, setToken, removeToken, setUser, getUser, User } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();
      const cachedUser = getUser();

      if (token && cachedUser) {
        setUserState(cachedUser);
        // Verify token is still valid
        try {
          const freshUser = await authApi.me();
          setUserState(freshUser);
          setUser(freshUser);
        } catch (error: any) {
          // Only clear the session if the error is explicitly a 401 Unauthorized
          if (error?.status === 401) {
            removeToken();
            setUserState(null);
          } else {
            console.warn('Transient network/server error during auth validation. Keeping cached session.', error);
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const { token, user: userData } = await authApi.login(email, password);
    setToken(token);
    setUser(userData);
    setUserState(userData);
  };

  const logout = () => {
    removeToken();
    setUserState(null);
    window.location.href = '/login';
  };

  const updateUser = (updatedUser: User) => {
    setUserState(updatedUser);
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
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
