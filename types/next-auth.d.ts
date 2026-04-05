import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'USER' | 'ADMIN' | 'TECHNICIAN';
      name?: string | null;
      email?: string | null;
    };
  }
}

