import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db/client';

const bodySchema = z.object({
  technicianId: z.string().cuid(),
});

interface Params {
  params: { id: string };
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const json = await req.json();
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const ticket = await db.ticket.update({
    where: { id: params.id },
    data: {
      assignedToId: parsed.data.technicianId,
      status: 'ASSIGNED',
    },
  });

  await db.ticketUpdate.create({
    data: {
      ticketId: ticket.id,
      updatedById: session.user.id as string,
      statusChangedTo: 'ASSIGNED',
      message: 'Ticket assigned to technician.',
    },
  });

  return NextResponse.json(ticket, { status: 200 });
}

