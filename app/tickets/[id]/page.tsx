import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db/client';
import { revalidateTicketWorkflow } from '@/lib/tickets/revalidate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SubmitButton } from '@/components/forms/submit-button';
import { UserShell } from '@/components/app-shell/user-shell';
import { TicketAttachmentPreview } from '@/components/tickets/ticket-attachment-preview';

interface Params {
  params: { id: string };
}

export default async function TicketDetailPage({
  params,
  searchParams,
}: Params & { searchParams: { duplicate?: string; created?: string; updated?: string } }) {
  const session = await auth();
  if (!session?.user) return null;

  const ticket = await db.ticket.findUnique({
    where: { id: params.id },
    include: {
      updates: {
        orderBy: { createdAt: 'asc' },
        include: { updatedBy: { select: { name: true, email: true } } },
      },
    },
  });

  if (!ticket) notFound();

  const canClose =
    ticket.status === 'RESOLVED' &&
    ticket.createdById === (session.user.id as string);
  const chatPrefill = encodeURIComponent(
    `Help me troubleshoot ticket #${ticket.ticketId}: ${ticket.title}. Location: ${ticket.location}. Details: ${ticket.description}`,
  );

  return (
    <UserShell active="tickets">
      <main className="mx-auto max-w-4xl px-4 py-2">
        <div className="mb-4 flex items-center justify-between">
          <a className="text-sm text-primary underline-offset-2 hover:underline" href="/tickets">
            ← Back to tickets
          </a>
          <Link
            href={`/chat?prefill=${chatPrefill}`}
            className="text-sm text-primary underline-offset-2 hover:underline"
          >
            Ask FixBot about this ticket
          </Link>
        </div>
        {searchParams.created && (
          <div className="mb-4 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
            Ticket created successfully. Your dashboards now reflect the new issue automatically.
          </div>
        )}
        {searchParams.updated === 'closed' && (
          <div className="mb-4 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
            Ticket closed successfully.
          </div>
        )}
        {searchParams.duplicate && (
          <div className="mb-4 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
            This looks similar to resolved Ticket #{searchParams.duplicate}. Review the AI fix steps below before scheduling.
          </div>
        )}
        <Card>
          <CardHeader>
            <CardTitle>
              Ticket #{ticket.ticketId} – {ticket.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h2 className="text-xs font-semibold uppercase text-muted-foreground">
                Overview
              </h2>
              <p className="mt-1 text-sm">{ticket.description}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Location: {ticket.location}
              </p>
            </div>
            <div className="space-y-1 text-xs">
              <Detail label="Category" value={ticket.category} />
              <Detail label="Priority" value={ticket.priority} />
              <Detail label="Status" value={ticket.status} />
              <Detail
                label="Estimated resolution"
                value={`${ticket.predictedResolutionTime}h`}
              />
            </div>
          </div>
          <div>
            <h2 className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
              AI summary
            </h2>
            <p className="text-sm">{ticket.aiSummary}</p>
            {ticket.aiFixSteps.length > 0 && (
              <ul className="mt-2 list-disc space-y-1 pl-4 text-xs">
                {ticket.aiFixSteps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            )}
          </div>
          <TicketAttachmentPreview imageDataUrl={ticket.imageDataUrl} title={ticket.title} />
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
          {canClose && (
            <form
              action={async () => {
                'use server';
                await db.ticket.update({
                  where: { id: ticket.id },
                  data: { status: 'CLOSED' },
                });
                await db.ticketUpdate.create({
                  data: {
                    ticketId: ticket.id,
                    updatedById: session.user.id as string,
                    statusChangedTo: 'CLOSED',
                    message: 'Ticket closed by user.',
                  },
                });
                revalidateTicketWorkflow(ticket.id);
                redirect(`/tickets/${ticket.id}?updated=closed`);
              }}
            >
              <SubmitButton type="submit" size="sm" pendingLabel="Closing ticket...">
                Close ticket
              </SubmitButton>
            </form>
          )}
          </CardContent>
        </Card>
      </main>
    </UserShell>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}

