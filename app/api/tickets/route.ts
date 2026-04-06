import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db/client';
import { analyzeTicketNlp } from '@/lib/ai/client';
import { revalidateTicketWorkflow } from '@/lib/tickets/revalidate';
import { findPotentialDuplicateTicket } from '@/services/tickets';

const createTicketSchema = z.object({
  title: z.string().min(3).max(120).optional(),
  description: z.string().min(10).max(2000),
  imageDataUrl: z.string().max(3_000_000).optional(),
  location: z.string().min(2).max(255),
  reportedImpact: z.string().max(160).optional(),
  urgencyReason: z.string().max(300).optional(),
  escalationFlag: z.boolean().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const json = await req.json();
    const parsed = createTicketSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
    const {
      title,
      description,
      imageDataUrl,
      location,
      reportedImpact,
      urgencyReason,
      escalationFlag,
    } = parsed.data;

    const nlp = await analyzeTicketNlp({ title, description, location });

    const ticket = await db.ticket.create({
      data: {
        title: title?.trim() || nlp.summary.slice(0, 120),
        description,
        imageDataUrl,
        location,
        category: nlp.category,
        priority: nlp.priority,
        reportedImpact: reportedImpact?.trim() || null,
        urgencyReason: urgencyReason?.trim() || null,
        escalationFlag: escalationFlag ?? false,
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
      excludeTicketId: ticket.id,
    });

    revalidateTicketWorkflow(ticket.id);

    return NextResponse.json({ ticket, duplicate }, { status: 201 });
  } catch (error) {
    console.error('create ticket error', error);
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const role = session.user.role as 'USER' | 'ADMIN' | 'TECHNICIAN';

  const where =
    role === 'ADMIN'
      ? {}
      : role === 'TECHNICIAN'
        ? { assignedToId: session.user.id as string }
        : { createdById: session.user.id as string };

  const tickets = await db.ticket.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      createdBy: { select: { name: true, email: true } },
      assignedTo: { select: { name: true, email: true } },
    },
  });

  return NextResponse.json(tickets, { status: 200 });
}

