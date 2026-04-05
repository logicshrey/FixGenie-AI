import { redirect } from 'next/navigation';
import { auth, signIn } from '@/lib/auth';
import { CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Wrench, Lock, Mail } from 'lucide-react';
import Link from 'next/link';

async function handleLogin(formData: FormData) {
  'use server';
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '').trim();

  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo: '/post-login',
    });
  } catch (error) {
    const type = (error as any)?.type;
    if (type === 'CredentialsSignin') {
      redirect('/login?error=invalid_credentials');
    }
    redirect('/login?error=auth_error');
  }
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const session = await auth();
  if (session) redirect('/dashboard');

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-12 text-foreground overflow-hidden">

      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-20 h-[500px] w-[500px] rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute -bottom-40 -left-20 h-[500px] w-[500px] rounded-full bg-cyan-500/15 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.025] dark:block hidden"
          style={{ backgroundImage: 'radial-gradient(circle,#fff 1px,transparent 1px)', backgroundSize: '28px 28px' }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Link href="/" className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600 shadow-glow hover:bg-violet-500 transition-all">
            <Wrench className="h-6 w-6 text-white" />
          </Link>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Welcome back</h1>
            <p className="mt-1 text-sm text-slate-400">Sign in to your FixGenie account</p>
          </div>
        </div>

        {/* Card */}
        <div className="relative overflow-hidden rounded-[1.75rem] border border-border/60 bg-card/80 p-8 shadow-card-lg backdrop-blur-2xl">
          {/* Inner gradient highlight */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />

          {searchParams.error && (
            <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {searchParams.error === 'invalid_credentials'
                ? 'Invalid email or password. Please try again.'
                : 'Authentication failed. Please try again.'}
            </div>
          )}

          <form action={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium text-slate-300" htmlFor="email">
                <Mail className="h-3.5 w-3.5 text-slate-400" /> Email address
              </label>
              <Input
                id="email" name="email" type="email" required autoComplete="email"
                placeholder="you@example.com"
                className="h-11 rounded-xl border-border bg-muted/50 placeholder:text-muted-foreground/50 focus:border-primary/60 focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium text-slate-300" htmlFor="password">
                <Lock className="h-3.5 w-3.5 text-slate-400" /> Password
              </label>
              <Input
                id="password" name="password" type="password" required autoComplete="current-password"
                placeholder="••••••••"
                className="h-11 rounded-xl border-border bg-muted/50 placeholder:text-muted-foreground/50 focus:border-primary/60 focus:ring-primary/20 transition-all"
              />
            </div>
            <Button
              type="submit"
              className="mt-2 h-12 w-full rounded-xl text-base font-semibold shadow-glow hover:-translate-y-0.5 transition-all"
            >
              Sign in
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don&rsquo;t have an account?{' '}
            <Link href="/register" className="font-semibold text-primary hover:opacity-80 underline-offset-4 hover:underline transition-colors">
              Create one free
            </Link>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground/50">
          By signing in you agree to the FixGenie{' '}
          <span className="text-muted-foreground/70">Terms of Service</span>
        </p>
      </div>
    </div>
  );
}
