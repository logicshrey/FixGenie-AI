import { redirect } from 'next/navigation';
import { hash } from 'bcryptjs';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db/client';
import { CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { SubmitButton } from '@/components/forms/submit-button';
import { Wrench, User, Mail, Lock } from 'lucide-react';
import Link from 'next/link';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

async function handleRegister(formData: FormData) {
  'use server';
  const raw = {
    name: String(formData.get('name') ?? '').trim(),
    email: String(formData.get('email') ?? '').trim().toLowerCase(),
    password: String(formData.get('password') ?? '').trim(),
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) return;
  const { name, email, password } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    redirect('/register?error=email_exists');
  }

  const hashed = await hash(password, 10);
  await db.user.create({
    data: {
      name,
      email,
      password: hashed,
      role: 'USER',
    },
  });

  redirect('/login');
}

export default async function RegisterPage({
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
        <div className="absolute -top-40 -left-20 h-[500px] w-[500px] rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute -bottom-40 -right-20 h-[500px] w-[500px] rounded-full bg-emerald-500/15 blur-[120px]" />
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
            <h1 className="text-2xl font-black tracking-tight">Create your account</h1>
            <p className="mt-1 text-sm text-muted-foreground">Start resolving maintenance issues smarter</p>
          </div>
        </div>

        {/* Card */}
        <div className="relative overflow-hidden rounded-[1.75rem] border border-border/60 bg-card/80 p-8 shadow-card-lg backdrop-blur-2xl">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />

          {searchParams.error === 'email_exists' && (
            <div className="mb-5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
              This email is already registered.{' '}
              <Link href="/login" className="font-semibold underline underline-offset-4">Sign in instead →</Link>
            </div>
          )}

          <form action={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium text-foreground/80" htmlFor="name">
                <User className="h-3.5 w-3.5 text-muted-foreground" /> Full name
              </label>
              <Input
                id="name" name="name" required autoComplete="name"
                placeholder="Jane Smith"
                className="h-11 rounded-xl border-border bg-muted/50 placeholder:text-muted-foreground/50 focus:border-primary/60 focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium text-foreground/80" htmlFor="email">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" /> Email address
              </label>
              <Input
                id="email" name="email" type="email" required autoComplete="email"
                placeholder="you@example.com"
                className="h-11 rounded-xl border-border bg-muted/50 placeholder:text-muted-foreground/50 focus:border-primary/60 focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium text-foreground/80" htmlFor="password">
                <Lock className="h-3.5 w-3.5 text-muted-foreground" /> Password
              </label>
              <Input
                id="password" name="password" type="password" required autoComplete="new-password"
                placeholder="At least 6 characters"
                className="h-11 rounded-xl border-border bg-muted/50 placeholder:text-muted-foreground/50 focus:border-primary/60 focus:ring-primary/20 transition-all"
              />
            </div>
            <SubmitButton
              type="submit"
              pendingLabel="Creating account..."
              className="mt-2 h-12 w-full rounded-xl bg-violet-600 text-base font-semibold text-white shadow-glow hover:bg-violet-500 hover:-translate-y-0.5 transition-all"
            >
              Create account
            </SubmitButton>
          </form>

          <div className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-violet-400 hover:text-violet-300 underline-offset-4 hover:underline transition-colors">
              Sign in
            </Link>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-slate-600">
          By creating an account you agree to the FixGenie{' '}
          <span className="text-slate-500">Terms of Service</span>
        </p>
      </div>
    </div>
  );
}
