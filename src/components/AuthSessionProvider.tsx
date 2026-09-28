'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import type { Session } from 'next-auth';
import { useEffect } from 'react';

/** Syncs the accessToken from the Auth.js session to window.__authToken
 *  so that the existing api.ts request() helper can read it synchronously. */
function TokenSync() {
  const { data: session } = useSession();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = (session?.user as any)?.accessToken ?? null;
      (window as any).__authToken = token;
      if (token) {
        localStorage.setItem('accessToken', token);
      }
    }
  }, [session]);

  return null;
}

export default function AuthSessionProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session?: Session | null;
}) {
  return (
    <SessionProvider session={session}>
      <TokenSync />
      {children}
    </SessionProvider>
  );
}
