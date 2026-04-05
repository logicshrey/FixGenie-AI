import Link from 'next/link';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserShell } from '@/components/app-shell/user-shell';

export default async function TicketsPage() {
  const session = await auth();
  if (!session?.user) return null;

  const tickets = await db.ticket.findMany({
    where: { createdById: session.user.id as string },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <UserShell active="tickets">
      <main className="mx-auto max-w-5xl px-4 py-2">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h1 className="text-xl font-semibold">Your tickets</h1>
          <Link href="/tickets/new">
            <Button size="sm">New ticket</Button>
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Recent tickets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {tickets.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No tickets yet. Create your first issue.
              </p>
            )}
            <ul className="divide-y text-sm">
              {tickets.map((t) => (
                <li key={t.id} className="flex items-center justify-between py-2">
                  <div>
                    <Link
                      href={`/tickets/${t.id}`}
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
    </UserShell>
  );
}

