import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function PostLoginPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const role = session.user.role as 'USER' | 'ADMIN' | 'TECHNICIAN' | undefined;

  if (role === 'ADMIN') {
    redirect('/admin');
  }

  if (role === 'TECHNICIAN') {
    redirect('/technician');
  }

  redirect('/dashboard');
}

