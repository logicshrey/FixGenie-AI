import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db/client';
import { analyzeTicketNlp } from '@/lib/ai/client';
import { findPotentialDuplicateTicket } from '@/services/tickets';
import { fileToDataUrl } from '@/lib/tickets/image';
import { UserShell } from '@/components/app-shell/user-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TicketImageInput } from '@/components/tickets/ticket-image-input';
import { VoiceInputButton } from '@/components/voice-input-button';

async function createTicket(formData: FormData) {
  'use server';
  const session = await auth();
  if (!session?.user) redirect('/login');

  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const location = String(formData.get('location') ?? '').trim();
  const image = formData.get('image');

  if (title.length < 3 || description.length < 10 || location.length < 2) return;

  const imageFile = image instanceof File ? image : null;
  const imageDataUrl = imageFile ? await fileToDataUrl(imageFile) : null;

  const nlp = await analyzeTicketNlp({
    title,
    description,
    location,
    imageName: imageFile?.name ?? null,
  });

  const ticket = await db.ticket.create({
    data: {
      title,
      description,
      imageDataUrl,
      location,
      category: nlp.category,
      priority: nlp.priority,
      status: 'OPEN',
      aiSummary: nlp.summary,
      aiKeywords: nlp.keywords,
      aiFixSteps: nlp.fixSteps,
      technicianType: nlp.technicianType,
      predictedResolutionTime: nlp.predictedResolutionHours,
      createdById: session.user.id as string,
    },
  });

  const duplicate = await findPotentialDuplicateTicket({
    description,
    category: nlp.category,
  });

  if (duplicate) {
    redirect(`/tickets/${ticket.id}?duplicate=${duplicate.ticketId}`);
  }

  redirect(`/tickets/${ticket.id}`);
}

export default async function NewTicketPage() {
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
            <form action={createTicket} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="title">
                  Ticket title
                </label>
                <Input
                  id="title"
                  name="title"
                  required
                  maxLength={120}
                  placeholder="e.g. AC leaking water in conference room"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="location">
                  Location (building / floor / room)
                </label>
                <Input id="location" name="location" required />
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
                    className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                  <VoiceInputButton targetId="description" />
                </div>
                <VoiceHint />
              </div>
              <TicketImageInput />
              <Button type="submit">Submit ticket</Button>
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

