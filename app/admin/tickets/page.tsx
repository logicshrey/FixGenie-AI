import Link from 'next/link';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminShell } from '@/components/app-shell/admin-shell';

export default async function AdminTicketsPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string; category?: string; priority?: string };
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') return null;

  const q = (searchParams.q ?? '').trim();
  const status = (searchParams.status ?? '').trim();
  const category = (searchParams.category ?? '').trim();
  const priority = (searchParams.priority ?? '').trim();

  const tickets = await db.ticket.findMany({
    where: {
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } },
              { location: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(status ? { status: status as any } : {}),
      ...(category ? { category: { contains: category, mode: 'insensitive' } } : {}),
      ...(priority ? { priority: { contains: priority, mode: 'insensitive' } } : {}),
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <AdminShell active="tickets">
      <main className="mx-auto max-w-6xl px-4 py-2">
        <h1 className="mb-4 text-2xl font-semibold">All tickets</h1>
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-2 md:grid-cols-4" action="/admin/tickets" method="get">
              <input
                name="q"
                defaultValue={q}
                placeholder="Search title/description…"
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              />
              <select
                name="status"
                defaultValue={status}
                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
              >
                <option value="">All statuses</option>
                <option value="OPEN">OPEN</option>
                <option value="ASSIGNED">ASSIGNED</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="CLOSED">CLOSED</option>
              </select>
              <input
                name="category"
                defaultValue={category}
                placeholder="Category…"
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              />
              <input
                name="priority"
                defaultValue={priority}
                placeholder="Priority…"
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              />
              <div className="md:col-span-4 flex gap-2">
                <button
                  type="submit"
                  className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground"
                >
                  Apply
                </button>
                <Link
                  href="/admin/tickets"
                  className="inline-flex h-9 items-center rounded-md border border-input bg-background px-3 text-sm"
                >
                  Reset
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tickets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {tickets.length === 0 && (
              <p className="text-sm text-muted-foreground">No tickets match your filters.</p>
            )}
            <ul className="divide-y">
              {tickets.map((t) => (
                <li key={t.id} className="flex items-center justify-between py-2">
                  <div>
                    <Link
                      href={`/admin/tickets/${t.id}`}
                      className="font-medium text-primary underline-offset-2 hover:underline"
                    >
                      #{t.ticketId} {t.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {t.category} · {t.priority} · {t.status}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </main>
    </AdminShell>
  );
}

