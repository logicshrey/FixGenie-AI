import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TicketAttachmentPreview } from '@/components/tickets/ticket-attachment-preview';

interface Params {
  params: { id: string };
}

async function updateStatus(ticketId: string, status: string, message: string) {
  'use server';
  const session = await auth();
  if (!session?.user || session.user.role !== 'TECHNICIAN') return redirect('/login');
  const ticket = await db.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket || ticket.assignedToId !== session.user.id) return;

  const current = ticket.status;
  const next = status;
  const allowed =
    (current === 'ASSIGNED' && next === 'IN_PROGRESS') ||
    (current === 'IN_PROGRESS' && next === 'RESOLVED');
  if (!allowed) return;

  await db.ticket.update({
    where: { id: ticketId },
    data: { status: status as any },
  });
  await db.ticketUpdate.create({
    data: {
      ticketId,
      updatedById: session.user.id as string,
      statusChangedTo: status as any,
      message: message || `Status changed to ${status}`,
    },
  });
}

async function addNote(ticketId: string, note: string) {
  'use server';
  const session = await auth();
  if (!session?.user || session.user.role !== 'TECHNICIAN') return redirect('/login');
  const ticket = await db.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket || ticket.assignedToId !== session.user.id) return;

  await db.ticketUpdate.create({
    data: {
      ticketId,
      updatedById: session.user.id as string,
      message: note,
    },
  });
}

export default async function TechnicianTicketDetailPage({ params }: Params) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'TECHNICIAN') return null;

  const ticket = await db.ticket.findUnique({
    where: { id: params.id },
    include: {
      updates: {
        orderBy: { createdAt: 'asc' },
        include: { updatedBy: { select: { name: true, email: true } } },
      },
    },
  });

  if (!ticket || ticket.assignedToId !== session.user.id) notFound();

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>
            Technician · Ticket #{ticket.ticketId} – {ticket.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p>{ticket.description}</p>
          <p className="text-xs text-muted-foreground">
            Category: {ticket.category} · Priority: {ticket.priority} · Status:{' '}
            {ticket.status}
          </p>
          <TicketAttachmentPreview imageDataUrl={ticket.imageDataUrl} title={ticket.title} />
          <div className="flex flex-wrap gap-2">
            {['IN_PROGRESS', 'RESOLVED'].map((s) => (
              <form
                key={s}
                action={async (formData) => {
                  'use server';
                  const note = String(formData.get('message') ?? '');
                  await updateStatus(ticket.id, s, note);
                }}
              >
                <input type="hidden" name="message" value="" />
                <Button type="submit" size="sm" variant="outline">
                  Mark {s.replace('_', ' ').toLowerCase()}
                </Button>
              </form>
            ))}
          </div>
          <div>
            <h2 className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
              Add note
            </h2>
            <form
              action={async (formData) => {
                'use server';
                const note = String(formData.get('note') ?? '');
                if (!note) return;
                await addNote(ticket.id, note);
              }}
              className="space-y-2"
            >
              <textarea
                name="note"
                className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
              />
              <Button type="submit" size="sm">
                Add note
              </Button>
            </form>
          </div>
          <div>
            <h2 className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
              Timeline
            </h2>
            <ul className="space-y-2 text-xs">
              {ticket.updates.map((u) => (
                <li key={u.id} className="rounded-md bg-muted px-3 py-2">
                  <p>{u.message}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {u.updatedBy.name ?? u.updatedBy.email} ·{' '}
                    {u.createdAt.toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

