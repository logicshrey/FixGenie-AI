import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db/client';
import { analyzeTicketNlp } from '@/lib/ai/client';
import { findPotentialDuplicateTicket } from '@/services/tickets';
import { fileToDataUrl } from '@/lib/tickets/image';
import { revalidateTicketWorkflow } from '@/lib/tickets/revalidate';
import { UserShell } from '@/components/app-shell/user-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { SubmitButton } from '@/components/forms/submit-button';
import { TicketImageInput } from '@/components/tickets/ticket-image-input';
import { VoiceInputButton } from '@/components/voice-input-button';

async function createTicket(formData: FormData) {
  'use server';
  const session = await auth();
  if (!session?.user) redirect('/login');

  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const location = String(formData.get('location') ?? '').trim();
  const reportedImpact = String(formData.get('reportedImpact') ?? '').trim();
  const urgencyReason = String(formData.get('urgencyReason') ?? '').trim();
  const escalationFlag = formData.get('escalationFlag') === 'on';
  const image = formData.get('image');

  if (title.length < 3 || description.length < 10 || location.length < 2) {
    redirect('/tickets/new?error=validation');
  }

  const imageFile = image instanceof File ? image : null;
  const imageDataUrl = imageFile ? await fileToDataUrl(imageFile) : null;
  let ticketId = '';
  let duplicateTicketId: number | null = null;

  try {
    const nlp = await analyzeTicketNlp({
      title,
      description,
      location,
      imageName: imageFile?.name ?? null,
      imageDataUrl,
    });

    const ticket = await db.ticket.create({
      data: {
        title,
        description,
        imageDataUrl,
        location,
        category: nlp.category,
        priority: nlp.priority,
        reportedImpact: reportedImpact || null,
        urgencyReason: urgencyReason || null,
        escalationFlag,
        status: 'OPEN',
        aiSummary: nlp.summary,
        aiKeywords: nlp.keywords,
        aiFixSteps: nlp.fixSteps,
        aiImageFault: nlp.imageFaultAssessment.trim() || null,
        technicianType: nlp.technicianType,
        predictedResolutionTime: nlp.predictedResolutionHours,
        createdById: session.user.id as string,
      },
    });

    const duplicate = await findPotentialDuplicateTicket({
      description,
      category: nlp.category,
      excludeTicketId: ticket.id,
    });

    ticketId = ticket.id;
    duplicateTicketId = duplicate?.ticketId ?? null;
  } catch (error) {
    console.error('createTicket action error', error);
    redirect('/tickets/new?error=create_failed');
  }

  revalidateTicketWorkflow(ticketId);

  if (duplicateTicketId) {
    redirect(`/tickets/${ticketId}?duplicate=${duplicateTicketId}&created=1`);
  }

  redirect(`/tickets/${ticketId}?created=1`);
}

export default async function NewTicketPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return (
    <UserShell active="tickets">
      <main className="mx-auto max-w-3xl px-4 py-2">
        <div className="mb-4">
          <a className="text-sm text-primary underline-offset-2 hover:underline" href="/tickets">
            ← Back to tickets
          </a>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Create maintenance ticket</CardTitle>
          </CardHeader>
          <CardContent>
            {searchParams.error === 'validation' && (
              <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
                Please fill in a valid title, location, and description before submitting.
              </div>
            )}
            {searchParams.error === 'create_failed' && (
              <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                Ticket creation failed. Please try again in a moment.
              </div>
            )}
            <form action={createTicket} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="title">
                  Ticket title
                </label>
                <Input
                  id="title"
                  name="title"
                  required
                  minLength={3}
                  maxLength={120}
                  placeholder="e.g. AC leaking water in conference room"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="location">
                  Location (building / floor / room)
                </label>
                <Input id="location" name="location" required minLength={2} maxLength={255} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="description">
                  Issue description
                </label>
                <div className="flex items-start gap-2">
                  <textarea
                    id="description"
                    name="description"
                    required
                    minLength={10}
                    maxLength={2000}
                    className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                  <VoiceInputButton targetId="description" />
                </div>
                <VoiceHint />
              </div>
              <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                <div className="mb-3">
                  <h2 className="text-sm font-semibold">Optional escalation details</h2>
                  <p className="text-xs text-muted-foreground">
                    Add this only when the issue blocks work, affects many people, or may cause damage.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-background/70 px-3 py-3">
                    <input
                      id="escalationFlag"
                      name="escalationFlag"
                      type="checkbox"
                      className="mt-1 h-4 w-4 rounded border-input"
                    />
                    <div>
                      <label className="text-sm font-medium" htmlFor="escalationFlag">
                        Mark as urgent / high impact
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Use this for safety issues, service outages, or incidents affecting many users.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="reportedImpact">
                      Impact summary
                    </label>
                    <Input
                      id="reportedImpact"
                      name="reportedImpact"
                      maxLength={160}
                      placeholder="e.g. Entire classroom block cannot access Wi-Fi"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="urgencyReason">
                      Why is this urgent?
                    </label>
                    <textarea
                      id="urgencyReason"
                      name="urgencyReason"
                      maxLength={300}
                      className="min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      placeholder="e.g. Water is spreading near electrical equipment and classes start in 20 minutes."
                    />
                  </div>
                </div>
              </div>
              <TicketImageInput />
              <p className="text-xs text-muted-foreground">
                Optional photo: Gemini analyzes the image to describe visible damage or equipment and
                helps triage together with your text.
              </p>
              <SubmitButton type="submit" pendingLabel="Creating ticket...">
                Submit ticket
              </SubmitButton>
            </form>
          </CardContent>
        </Card>
      </main>
    </UserShell>
  );
}

function VoiceHint() {
  return (
    <p className="text-xs text-muted-foreground">
      Use the microphone button in supported browsers to dictate your issue description.
    </p>
  );
}

