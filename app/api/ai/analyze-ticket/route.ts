import { NextResponse } from 'next/server';
import { z } from 'zod';
import { analyzeTicketNlp } from '@/lib/ai/client';
import { ticketNlpSchema } from '@/lib/ai/schemas';
import { rateLimit } from '@/lib/rate-limit';

const bodySchema = z.object({
  description: z.string().min(10).max(2000),
  location: z.string().min(2).max(255),
});

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') ?? 'global';
    if (!rateLimit(`ai-analyze:${ip}`).allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const nlp = await analyzeTicketNlp(parsed.data);
    const validated = ticketNlpSchema.parse(nlp);

    return NextResponse.json(validated, { status: 200 });
  } catch (error) {
    console.error('analyze-ticket error', error);
    return NextResponse.json(
      { error: 'Failed to analyze ticket' },
      { status: 500 },
    );
  }
}

