import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db/client';

const bodySchema = z.object({
  message: z.string().min(1).max(1000),
});

interface Params {
  params: { id: string };
}

export async function POST(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const ticket = await db.ticket.findUnique({ where: { id: params.id } });
  if (!ticket) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const json = await req.json();
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const update = await db.ticketUpdate.create({
    data: {
      ticketId: ticket.id,
      updatedById: session.user.id as string,
      message: parsed.data.message,
    },
  });

  return NextResponse.json(update, { status: 201 });
}

