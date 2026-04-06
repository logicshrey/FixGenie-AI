import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db/client';
import { revalidateTicketWorkflow } from '@/lib/tickets/revalidate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminShell } from '@/components/app-shell/admin-shell';
import { SubmitButton } from '@/components/forms/submit-button';
import { TicketAttachmentPreview } from '@/components/tickets/ticket-attachment-preview';
import { findPotentialDuplicateTicket } from '@/services/tickets';

interface Params {
  params: { id: string };
}

async function assignTicket(ticketId: string, technicianId: string) {
  'use server';
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  await db.ticket.update({
    where: { id: ticketId },
    data: { assignedToId: technicianId, status: 'ASSIGNED' },
  });
  await db.ticketUpdate.create({
    data: {
      ticketId,
      updatedById: session.user.id as string,
      statusChangedTo: 'ASSIGNED',
      message: 'Ticket assigned to technician.',
    },
  });
  revalidateTicketWorkflow(ticketId);
  redirect(`/admin/tickets/${ticketId}?updated=assignment`);
}

export default async function AdminTicketDetailPage({
  params,
  searchParams,
}: Params & { searchParams: { updated?: string } }) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') return null;

  const [ticket, technicians] = await Promise.all([
    db.ticket.findUnique({
      where: { id: params.id },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        updates: {
          orderBy: { createdAt: 'asc' },
          include: { updatedBy: { select: { name: true, email: true } } },
        },
      },
    }),
    db.user.findMany({ where: { role: 'TECHNICIAN' } }),
  ]);

  if (!ticket) notFound();

  const similarTicket = await findPotentialDuplicateTicket({
    description: ticket.description,
    category: ticket.category,
    excludeTicketId: ticket.id,
  });
  const chatPrefill = encodeURIComponent(
    `Help me review admin ticket #${ticket.ticketId}: ${ticket.title}. Priority: ${ticket.priority}. Status: ${ticket.status}. Description: ${ticket.description}`,
  );

  return (
    <AdminShell active="tickets">
      <main className="mx-auto max-w-6xl px-4 py-2">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">
              Admin · Ticket #{ticket.ticketId} - {ticket.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              Review AI triage, assignment, risk signals, and activity in one place.
            </p>
          </div>
          <Link
            href={`/chat?prefill=${chatPrefill}`}
            className="text-sm text-primary underline-offset-2 hover:underline"
          >
            Ask FixBot about this ticket
          </Link>
        </div>
        {searchParams.updated === 'assignment' && (
          <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
            Assignment updated successfully.
          </div>
        )}
        {searchParams.updated === 'select_technician' && (
          <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
            Please choose a technician before assigning the ticket.
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-[1.35fr_0.95fr]">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Ticket overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>{ticket.description}</p>
                <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                  <Detail label="Category" value={ticket.category} />
                  <Detail label="Priority" value={ticket.priority} />
                  <Detail label="Status" value={ticket.status} />
                  <Detail label="ETA" value={`${ticket.predictedResolutionTime}h`} />
                  <Detail label="Created by" value={ticket.createdBy.name ?? ticket.createdBy.email} />
                  <Detail
                    label="Assigned to"
                    value={ticket.assignedTo?.name ?? ticket.assignedTo?.email ?? 'Unassigned'}
                  />
                  <Detail label="Location" value={ticket.location} />
                  <Detail
                    label="Escalated"
                    value={ticket.escalationFlag ? 'Yes' : 'No'}
                  />
                </div>
                {(ticket.reportedImpact || ticket.urgencyReason) && (
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs">
                    <p className="font-medium text-foreground">Escalation context</p>
                    {ticket.reportedImpact && (
                      <p className="mt-2 text-muted-foreground">
                        Impact: <span className="text-foreground">{ticket.reportedImpact}</span>
                      </p>
                    )}
                    {ticket.urgencyReason && (
                      <p className="mt-1 text-muted-foreground">
                        Reason: <span className="text-foreground">{ticket.urgencyReason}</span>
                      </p>
                    )}
                  </div>
                )}
                <TicketAttachmentPreview imageDataUrl={ticket.imageDataUrl} title={ticket.title} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI triage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Summary
                  </p>
                  <p className="mt-1">{ticket.aiSummary}</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Suggested technician
                    </p>
                    <p className="mt-1">{ticket.technicianType ?? 'General maintenance'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Predicted resolution
                    </p>
                    <p className="mt-1">{ticket.predictedResolutionTime} hours</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Keywords
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {ticket.aiKeywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Recommended fix steps
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-4 text-sm">
                    {ticket.aiFixSteps.map((step, index) => (
                      <li key={`${step}-${index}`}>{step}</li>
                    ))}
                  </ul>
                </div>
                {ticket.aiImageFault && (
                  <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Photo AI insight (Gemini vision)
                    </p>
                    <p className="mt-2 text-sm leading-relaxed">{ticket.aiImageFault}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Activity timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {ticket.updates.length === 0 && (
                  <p className="text-muted-foreground">No updates have been posted yet.</p>
                )}
                {ticket.updates.map((update) => (
                  <div key={update.id} className="rounded-xl bg-muted/60 px-3 py-3">
                    <p>{update.message}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {update.updatedBy.name ?? update.updatedBy.email} ·{' '}
                      {update.createdAt.toLocaleString()}
                      {update.statusChangedTo ? ` · status -> ${update.statusChangedTo}` : ''}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Assignment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <form
                  action={async (formData) => {
                    'use server';
                    const techId = String(formData.get('technicianId') ?? '');
                    if (!techId) {
                      redirect(`/admin/tickets/${ticket.id}?updated=select_technician`);
                    }
                    await assignTicket(ticket.id, techId);
                  }}
                  className="flex flex-wrap items-center gap-2"
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
                  <SubmitButton
                    type="submit"
                    size="sm"
                    pendingLabel="Assigning..."
                    className="h-9 text-xs"
                  >
                    Assign
                  </SubmitButton>
                </form>
                <p className="text-xs text-muted-foreground">
                  Use the AI recommendation and current workload to route this ticket quickly.
                </p>
              </CardContent>
            </Card>

            {similarTicket && (
              <Card>
                <CardHeader>
                  <CardTitle>Similar resolved ticket</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                    <p className="font-medium">
                      #{similarTicket.ticketId} {similarTicket.title}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Similarity score: {Math.round(similarTicket.similarity * 100)}%
                    </p>
                  </div>
                  <p className="text-muted-foreground">{similarTicket.summary}</p>
                  <ul className="list-disc space-y-1 pl-4 text-xs text-muted-foreground">
                    {similarTicket.fixSteps.slice(0, 3).map((step, index) => (
                      <li key={`${step}-${index}`}>{step}</li>
                    ))}
                  </ul>
                  <Link
                    href={`/admin/tickets/${similarTicket.id}`}
                    className="text-sm text-primary underline-offset-2 hover:underline"
                  >
                    Open similar ticket
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </AdminShell>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-background/60 px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-sm text-foreground">{value}</p>
    </div>
  );
}

