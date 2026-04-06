import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db/client';
import { revalidateTicketWorkflow } from '@/lib/tickets/revalidate';

const bodySchema = z.object({
  status: z.enum(['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']),
  message: z.string().min(1).max(1000).optional(),
});

interface Params {
  params: { id: string };
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const ticket = await db.ticket.findUnique({ where: { id: params.id } });
  if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const role = session.user.role as 'USER' | 'ADMIN' | 'TECHNICIAN';
  const userId = session.user.id as string;

  if (role === 'USER' && ticket.createdById !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (role === 'TECHNICIAN' && ticket.assignedToId !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const json = await req.json();
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const { status, message } = parsed.data;

  // Lifecycle rules:
  // OPEN -> ASSIGNED (admin)
  // ASSIGNED -> IN_PROGRESS (technician/admin)
  // IN_PROGRESS -> RESOLVED (technician/admin)
  // RESOLVED -> CLOSED (user/admin)
  if (role !== 'ADMIN') {
    const current = ticket.status;
    const next = status;

    const allowedByRole =
      role === 'TECHNICIAN'
        ? (current === 'ASSIGNED' && next === 'IN_PROGRESS') ||
          (current === 'IN_PROGRESS' && next === 'RESOLVED')
        : role === 'USER'
          ? current === 'RESOLVED' && next === 'CLOSED'
          : false;

    if (!allowedByRole) {
      return NextResponse.json(
        { error: `Invalid status transition: ${current} -> ${next}` },
        { status: 400 },
      );
    }
  }

  const updated = await db.ticket.update({
    where: { id: params.id },
    data: { status },
  });

  await db.ticketUpdate.create({
    data: {
      ticketId: ticket.id,
      updatedById: userId,
      statusChangedTo: status,
      message: message ?? `Status changed to ${status}`,
    },
  });

  revalidateTicketWorkflow(ticket.id);

  return NextResponse.json(updated, { status: 200 });
}

