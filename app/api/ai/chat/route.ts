import { NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const bodySchema = z.object({
  message: z.string().min(1).max(1500),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1).max(1500),
      }),
    )
    .max(8)
    .optional(),
});

export async function POST(req: Request) {
  const [{ auth }, { db }, { chatWithFixBot }] = await Promise.all([
    import('@/lib/auth'),
    import('@/lib/db/client'),
    import('@/lib/ai/client'),
  ]);

  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const ip = req.headers.get('x-forwarded-for') ?? 'global';
    if (!rateLimit(`ai-chat:${ip}`).allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const recent = await db.ticket.findMany({
      where: { status: 'RESOLVED' },
      orderBy: { updatedAt: 'desc' },
      take: 10,
      select: {
        ticketId: true,
        title: true,
        description: true,
        aiSummary: true,
        aiFixSteps: true,
        category: true,
      },
    });

    const contextTickets = recent
      .map(
        (t) =>
          `#${t.ticketId} [${t.category}] ${t.title}\nSummary: ${t.aiSummary}\nFix: ${t.aiFixSteps.join(
            '; ',
          )}`,
      )
      .join('\n\n');

    const answer = await chatWithFixBot({
      message: parsed.data.message,
      contextTickets,
      history: parsed.data.history ?? [],
    });

    return NextResponse.json({ answer }, { status: 200 });
  } catch (error) {
    console.error('fixbot chat error', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 },
    );
  }
}

