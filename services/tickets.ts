import { db } from '@/lib/db/client';

export async function findPotentialDuplicateTicket(input: {
  description: string;
  category: string;
  excludeTicketId?: string;
}) {
  const recent = await db.ticket.findMany({
    where: {
      status: 'RESOLVED',
      category: input.category,
      ...(input.excludeTicketId
        ? { id: { not: input.excludeTicketId } }
        : {}),
    },
    orderBy: { updatedAt: 'desc' },
    take: 15,
  });

  const normalize = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(Boolean);

  const sourceTokens = new Set(normalize(input.description));

  let bestMatch: (typeof recent)[number] | null = null;
  let bestScore = 0;

  for (const ticket of recent) {
    const tokens = new Set(normalize(ticket.description));
    const intersection = new Set(
      [...sourceTokens].filter((t) => tokens.has(t)),
    );
    const union = new Set([...sourceTokens, ...tokens]);
    const score =
      union.size === 0 ? 0 : intersection.size / union.size;
    if (score > bestScore) {
      bestScore = score;
      bestMatch = ticket;
    }
  }

  if (bestMatch && bestScore >= 0.35) {
    return {
      id: bestMatch.id,
      ticketId: bestMatch.ticketId,
      title: bestMatch.title,
      summary: bestMatch.aiSummary,
      fixSteps: bestMatch.aiFixSteps,
      similarity: bestScore,
    };
  }

  return null;
}

