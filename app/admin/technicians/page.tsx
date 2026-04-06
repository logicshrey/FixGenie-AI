import { redirect } from 'next/navigation';
import { hash } from 'bcryptjs';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { SubmitButton } from '@/components/forms/submit-button';
import { AdminShell } from '@/components/app-shell/admin-shell';
import { revalidatePath } from 'next/cache';

async function createTechnician(formData: FormData) {
  'use server';
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') return redirect('/login');

  const name = String(formData.get('name') ?? '');
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');
  if (!email || !password) redirect('/admin/technicians?error=validation');

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) redirect('/admin/technicians?error=email_exists');

  const hashed = await hash(password, 10);
  await db.user.create({
    data: {
      name,
      email,
      password: hashed,
      role: 'TECHNICIAN',
    },
  });
  revalidatePath('/admin/technicians');
  redirect('/admin/technicians?created=1');
}

export default async function AdminTechniciansPage({
  searchParams,
}: {
  searchParams: { error?: string; created?: string };
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') return null;

  const technicians = await db.user.findMany({
    where: { role: 'TECHNICIAN' },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <AdminShell active="technicians">
      <main className="mx-auto max-w-6xl px-4 py-2">
        <h1 className="mb-4 text-2xl font-semibold">Technicians</h1>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Create technician</CardTitle>
            </CardHeader>
            <CardContent>
              {searchParams.error === 'validation' && (
                <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
                  Email and password are required.
                </div>
              )}
              {searchParams.error === 'email_exists' && (
                <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
                  That technician email already exists.
                </div>
              )}
              {searchParams.created && (
                <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
                  Technician created successfully.
                </div>
              )}
              <form action={createTechnician} className="space-y-3 text-sm">
                <div>
                  <label className="mb-1 block text-xs font-medium">Name</label>
                  <Input name="name" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium">Email</label>
                  <Input name="email" type="email" required />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium">Password</label>
                  <Input name="password" type="password" required />
                </div>
                <SubmitButton type="submit" size="sm" pendingLabel="Creating technician...">
                  Create technician
                </SubmitButton>
              </form>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Existing technicians</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <ul className="divide-y">
                {technicians.map((t) => (
                  <li key={t.id} className="py-2">
                    <p className="font-medium">{t.name ?? t.email}</p>
                    <p className="text-xs text-muted-foreground">{t.email}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </AdminShell>
  );
}

