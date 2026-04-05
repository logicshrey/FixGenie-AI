import Link from 'next/link';
import { auth, signOut } from '@/lib/auth';
import { db } from '@/lib/db/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TechnicianShell } from '@/components/app-shell/technician-shell';

export default async function TechnicianDashboardPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'TECHNICIAN') return null;

  const tickets = await db.ticket.findMany({
    where: { assignedToId: session.user.id as string },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <TechnicianShell active="dashboard">
      <main className="mx-auto max-w-5xl px-4 py-2">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold">Assigned tickets</h1>
          <p className="text-sm text-muted-foreground">
            Work tickets assigned by admins. Update status and add notes on each ticket.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tickets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {tickets.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No assigned tickets right now.
              </p>
            )}
            <ul className="divide-y">
              {tickets.map((t) => (
                <li key={t.id} className="flex items-center justify-between py-2">
                  <div>
                    <Link
                      href={`/technician/tickets/${t.id}`}
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
    </TechnicianShell>
  );
}

