import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data?.message || 'Invalid credentials');
          }

          const { token, user } = await res.json();

          if (!token || !user) return null;

          // Return shape that NextAuth expects; extras go into JWT
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            // custom fields
            role: user.role,
            avatar: user.avatar,
            accessToken: token,
          };
        } catch (err: any) {
          throw new Error(err?.message || 'Login failed');
        }
      },
    }),
  ],

  callbacks: {
    // Persist custom fields into the JWT cookie
    async jwt({ token, user, trigger, session: updateSession }) {
      // On initial login: populate token from user object
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        // Do not store large base64 avatars in the JWT session cookie to prevent HTTP 494 errors
        token.avatar = (user as any).avatar && (user as any).avatar.startsWith('data:')
          ? 'RESET:'
          : (user as any).avatar ?? null;
        token.accessToken = (user as any).accessToken;
      }

      // On session update (e.g., after profile edit): merge new data into token
      if (trigger === 'update' && updateSession?.user) {
        const updatedUser = updateSession.user as any;
        if (updatedUser.name) token.name = updatedUser.name;
        // Store avatar reference — base64 is NOT stored in JWT to avoid cookie size limits
        // Instead we store a flag so the UI knows to re-fetch from API
        if ('avatar' in updatedUser) {
          token.avatar = updatedUser.avatar && updatedUser.avatar.startsWith('data:')
            ? 'RESET:'
            : (updatedUser.avatar ?? null);
        }
      }

      return token;
    },

    // Expose custom fields to useSession()
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role;
        (session.user as any).avatar = token.avatar;
        (session.user as any).accessToken = token.accessToken;
      }
      return session;
    },
  },

  pages: {
    signIn: '/login',
  },

  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
});
