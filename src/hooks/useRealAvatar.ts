'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * useRealAvatar
 *
 * Always fetches the avatar from the database via /auth/me API.
 * No localStorage. No caching. Always fresh from DB.
 *
 * Steps:
 * 1. Wait for session to load
 * 2. Get accessToken from session
 * 3. Fetch /auth/me → get avatar from DB
 */
export function useRealAvatar(
  userId: string | undefined,
  _sessionAvatar?: string | null
): string | undefined {
  const { data: session, status } = useSession();
  const [avatar, setAvatar] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!userId || status === 'loading') return;

    const accessToken = (session?.user as any)?.accessToken;
    if (!accessToken) return;

    let cancelled = false;

    fetch(`${API_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
      cache: 'no-store',
    })
      .then(r => r.ok ? r.json() : null)
      .then(user => {
        if (!cancelled && user?.avatar) {
          setAvatar(user.avatar);
        }
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [userId, status, session]);

  return avatar;
}

// Kept for backward compatibility with settings page (no-ops now)
export function storeAvatar(_userId: string, _avatar: string): void {}
export function clearStoredAvatar(_userId: string): void {}
export function getStoredAvatar(_userId: string): string | null { return null; }
