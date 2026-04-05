import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminShell } from '@/components/app-shell/admin-shell';

interface Params {
  params: { id: string };
}

async function assignTicket(ticketId: string, technicianId: string) {
  'use server';
  await db.ticket.update({
    where: { id: ticketId },
    data: { assignedToId: technicianId, status: 'ASSIGNED' },
  });
}

export default async function AdminTicketDetailPage({ params }: Params) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') return null;

  const [ticket, technicians] = await Promise.all([
    db.ticket.findUnique({ where: { id: params.id } }),
    db.user.findMany({ where: { role: 'TECHNICIAN' } }),
  ]);

  if (!ticket) notFound();

  return (
    <AdminShell active="tickets">
      <main className="mx-auto max-w-6xl px-4 py-2">
        <Card>
          <CardHeader>
            <CardTitle>
              Admin · Ticket #{ticket.ticketId} – {ticket.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>{ticket.description}</p>
            <p className="text-xs text-muted-foreground">
              Category: {ticket.category} · Priority: {ticket.priority} · Status:{' '}
              {ticket.status}
            </p>
            <form
              action={async (formData) => {
                'use server';
                const techId = String(formData.get('technicianId') ?? '');
                if (!techId) return;
                await assignTicket(ticket.id, techId);
              }}
              className="mt-4 flex flex-wrap items-center gap-2"
            >
              <select
                name="technicianId"
                defaultValue={ticket.assignedToId ?? ''}
                className="h-9 rounded-md border border-input bg-background px-2 text-xs"
              >
                <option value="">Unassigned</option>
                {technicians.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name ?? t.email}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground"
              >
                Assign
              </button>
            </form>
          </CardContent>
        </Card>
      </main>
    </AdminShell>
  );
}

