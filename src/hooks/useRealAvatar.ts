'use client';

/**
 * useRealAvatar - DEPRECATED
 * Avatar is now resolved directly in AuthContext.
 * Just use user.avatar from useAuth() instead.
 *
 * This file is kept for backward compatibility only.
 * All functions are no-ops.
 */

export function useRealAvatar(
  _userId?: string,
  _sessionAvatar?: string | null
): string | undefined {
  return undefined; // AuthContext now handles this
}

export function storeAvatar(_userId: string, _avatar: string): void {}
export function clearStoredAvatar(_userId: string): void {}
export function getStoredAvatar(_userId: string): string | null { return null; }
