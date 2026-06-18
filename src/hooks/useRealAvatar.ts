'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * useRealAvatar – resolves the actual avatar for a user.
 *
 * The JWT session stores at most a small avatar URL.
 * When the avatar is a large base64 image, it is stored as 'RESET:' in the
 * JWT to prevent cookie overflow. This hook detects that sentinel value and
 * fetches the real avatar from the backend /auth/me endpoint instead,
 * using the accessToken directly from the session (works on mobile too).
 *
 * @param sessionAvatar  The avatar value coming from useAuth() / useSession()
 * @returns              The resolved avatar string (base64 or URL), or undefined if none
 */
export function useRealAvatar(sessionAvatar: string | null | undefined): string | undefined {
  const { data: session, status } = useSession();
  const [resolvedAvatar, setResolvedAvatar] = useState<string | undefined>(
    sessionAvatar && !sessionAvatar.startsWith('RESET:') ? sessionAvatar : undefined
  );

  useEffect(() => {
    // If the session has a real (non-sentinel) avatar value, use it directly
    if (sessionAvatar && !sessionAvatar.startsWith('RESET:')) {
      setResolvedAvatar(sessionAvatar);
      return;
    }

    // Wait until the session is fully loaded before making the API call
    if (status === 'loading') return;

    // Get the access token directly from the session (reliable on mobile)
    const accessToken = (session?.user as any)?.accessToken;
    if (!accessToken) {
      setResolvedAvatar(undefined);
      return;
    }

    // Fetch the real avatar from the backend using the session token
    let cancelled = false;
    fetch(`${API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })
      .then((res) => res.ok ? res.json() : null)
      .then((freshUser) => {
        if (!cancelled) {
          if (freshUser?.avatar && !freshUser.avatar.startsWith('RESET:')) {
            setResolvedAvatar(freshUser.avatar);
          } else {
            setResolvedAvatar(undefined);
          }
        }
      })
      .catch(() => {
        if (!cancelled) setResolvedAvatar(undefined);
      });

    return () => { cancelled = true; };
  }, [sessionAvatar, status, session]);

  return resolvedAvatar;
}
