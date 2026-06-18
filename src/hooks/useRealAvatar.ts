'use client';

import { useState, useEffect } from 'react';
import { authApi } from '@/lib/api';

/**
 * useRealAvatar – resolves the actual avatar for a user.
 *
 * The JWT session stores at most a small avatar URL.
 * When the avatar is a large base64 image, it is stored as 'RESET:' in the
 * JWT to prevent cookie overflow. This hook detects that sentinel value and
 * fetches the real avatar from the backend /auth/me endpoint instead.
 *
 * @param sessionAvatar  The avatar value coming from useAuth() / useSession()
 * @returns              The resolved avatar string (base64 or URL), or undefined if none
 */
export function useRealAvatar(sessionAvatar: string | null | undefined): string | undefined {
  const [resolvedAvatar, setResolvedAvatar] = useState<string | undefined>(
    sessionAvatar && !sessionAvatar.startsWith('RESET:') ? sessionAvatar : undefined
  );

  useEffect(() => {
    // If the session has a real avatar value, use it directly
    if (sessionAvatar && !sessionAvatar.startsWith('RESET:')) {
      setResolvedAvatar(sessionAvatar);
      return;
    }

    // If the session has no avatar or has RESET: sentinel, fetch from API
    let cancelled = false;
    authApi.me().then((freshUser) => {
      if (!cancelled && freshUser?.avatar && !freshUser.avatar.startsWith('RESET:')) {
        setResolvedAvatar(freshUser.avatar);
      } else if (!cancelled) {
        setResolvedAvatar(undefined);
      }
    }).catch(() => {
      if (!cancelled) setResolvedAvatar(undefined);
    });

    return () => { cancelled = true; };
  }, [sessionAvatar]);

  return resolvedAvatar;
}
