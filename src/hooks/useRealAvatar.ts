'use client';

import { useState, useEffect } from 'react';

const AVATAR_KEY_PREFIX = 'user_avatar_';

/**
 * Get avatar from localStorage for a given user ID
 */
export function getStoredAvatar(userId: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(`${AVATAR_KEY_PREFIX}${userId}`);
  } catch {
    return null;
  }
}

/**
 * Save avatar to localStorage for a given user ID
 */
export function storeAvatar(userId: string, avatar: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${AVATAR_KEY_PREFIX}${userId}`, avatar);
  } catch {
    // localStorage might be full or unavailable
  }
}

/**
 * Remove avatar from localStorage for a given user ID
 */
export function clearStoredAvatar(userId: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(`${AVATAR_KEY_PREFIX}${userId}`);
  } catch {
    // ignore
  }
}

/**
 * useRealAvatar – resolves the actual avatar for a user.
 *
 * Strategy (in order of priority):
 * 1. If localStorage has a saved avatar for this user → use it immediately (fastest)
 * 2. If the session JWT has a direct avatar value (not RESET:) → use it
 * 3. Otherwise → show nothing (initials fallback)
 *
 * This approach works on mobile because it avoids JWT cookie size limits
 * and does not rely on async API calls that may fail before the session loads.
 *
 * @param userId        The user's ID (to namespace the localStorage key)
 * @param sessionAvatar The avatar value from useAuth() / useSession()
 * @returns             The resolved avatar string, or undefined if none
 */
export function useRealAvatar(userId: string | undefined, sessionAvatar: string | null | undefined): string | undefined {
  const [resolvedAvatar, setResolvedAvatar] = useState<string | undefined>(() => {
    // On first render, try localStorage immediately (synchronous, works on mobile)
    if (!userId) return undefined;
    const stored = getStoredAvatar(userId);
    if (stored) return stored;
    // Fall back to session avatar if not a sentinel
    if (sessionAvatar && !sessionAvatar.startsWith('RESET:')) return sessionAvatar;
    return undefined;
  });

  useEffect(() => {
    if (!userId) return;

    // Check localStorage first (always up to date after a save)
    const stored = getStoredAvatar(userId);
    if (stored) {
      setResolvedAvatar(stored);
      return;
    }

    // Fall back to session avatar
    if (sessionAvatar && !sessionAvatar.startsWith('RESET:')) {
      setResolvedAvatar(sessionAvatar);
      // Also cache it in localStorage for next time
      storeAvatar(userId, sessionAvatar);
    } else {
      setResolvedAvatar(undefined);
    }
  }, [userId, sessionAvatar]);

  return resolvedAvatar;
}
