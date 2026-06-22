'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const AVATAR_KEY_PREFIX = 'user_avatar_';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export function getStoredAvatar(userId: string): string | null {
  if (typeof window === 'undefined') return null;
  try { return localStorage.getItem(`${AVATAR_KEY_PREFIX}${userId}`); } catch { return null; }
}

export function storeAvatar(userId: string, avatar: string): void {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(`${AVATAR_KEY_PREFIX}${userId}`, avatar); } catch {}
}

export function clearStoredAvatar(userId: string): void {
  if (typeof window === 'undefined') return;
  try { localStorage.removeItem(`${AVATAR_KEY_PREFIX}${userId}`); } catch {}
}

/**
 * useRealAvatar
 *
 * Priority:
 * 1. localStorage cache (instant, works offline)
 * 2. Fetch from /auth/me API using session token (works on all devices)
 * 3. sessionAvatar from JWT if not RESET: sentinel
 */
export function useRealAvatar(
  userId: string | undefined,
  sessionAvatar: string | null | undefined
): string | undefined {
  const { data: session, status } = useSession();

  const [resolvedAvatar, setResolvedAvatar] = useState<string | undefined>(() => {
    if (!userId) return undefined;
    const stored = getStoredAvatar(userId);
    if (stored) return stored;
    if (sessionAvatar && !sessionAvatar.startsWith('RESET:')) return sessionAvatar;
    return undefined;
  });

  useEffect(() => {
    if (!userId) return;

    // 1. Check localStorage first (fastest, works offline too)
    const stored = getStoredAvatar(userId);
    if (stored) {
      setResolvedAvatar(stored);
      return;
    }

    // 2. If session JWT has a direct avatar (small enough to fit), use it
    if (sessionAvatar && !sessionAvatar.startsWith('RESET:')) {
      setResolvedAvatar(sessionAvatar);
      storeAvatar(userId, sessionAvatar);
      return;
    }

    // 3. Fetch from API (handles case where avatar is base64 stored in DB
    //    but too large for JWT cookie — stored as 'RESET:' sentinel)
    if (status === 'loading') return;

    const accessToken = (session?.user as any)?.accessToken;
    if (!accessToken) return;

    let cancelled = false;
    fetch(`${API_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
      cache: 'no-store',
    })
      .then(r => r.ok ? r.json() : null)
      .then(freshUser => {
        if (cancelled) return;
        const avatar = freshUser?.avatar;
        if (avatar && !avatar.startsWith('RESET:')) {
          setResolvedAvatar(avatar);
          storeAvatar(userId, avatar); // cache for next visit on this device
        }
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [userId, sessionAvatar, status, session]);

  return resolvedAvatar;
}
