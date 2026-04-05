import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';
import { db } from '@/lib/db/client';
import { compare } from 'bcryptjs';
import { z } from 'zod';

export const authConfig = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: 'jwt' as const,
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const schema = z.object({
          email: z.string().email(),
          password: z.string().min(6),
        });
        const parsed = schema.safeParse(credentials);
        if (!parsed.success) return null;
        const email = parsed.data.email.trim().toLowerCase();
        const password = parsed.data.password;
        const user = await db.user.findUnique({ where: { email } });
        if (!user || !user.password) return null;
        const valid = await compare(password, user.password);
        if (!valid) return null;
        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.sub;
        session.user.role = token.role;
      }
      return session;
    },
  },
};

