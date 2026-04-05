import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db/client';

interface Params {
  params: { id: string };
}

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const ticket = await db.ticket.findUnique({
    where: { id: params.id },
    include: {
      createdBy: { select: { name: true, email: true } },
      assignedTo: { select: { name: true, email: true } },
      updates: {
        orderBy: { createdAt: 'asc' },
        include: { updatedBy: { select: { name: true, email: true } } },
      },
    },
  });

  if (!ticket) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const role = session.user.role as 'USER' | 'ADMIN' | 'TECHNICIAN';
  if (
    role === 'USER' &&
    ticket.createdById !== (session.user.id as string)
  ) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (
    role === 'TECHNICIAN' &&
    ticket.assignedToId !== (session.user.id as string)
  ) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json(ticket, { status: 200 });
}

