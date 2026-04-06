import { describe, expect, it } from 'vitest';
import { ticketNlpSchema } from '@/lib/ai/schemas';
import { buildTicketAnalysisFallback } from '@/lib/ai/ticket-analysis';

describe('ticketNlpSchema', () => {
  it('validates a correct AI response', () => {
    const data = {
      category: 'plumbing',
      priority: 'HIGH',
      summary: 'Leaking pipe near kitchen sink',
      keywords: ['leak', 'pipe', 'kitchen'],
      fixSteps: ['Shut off water', 'Call plumber'],
      technicianType: 'plumber',
      predictedResolutionHours: 4,
    };
    const parsed = ticketNlpSchema.parse(data);
    expect(parsed.category).toBe('plumbing');
    expect(parsed.priority).toBe('HIGH');
  });

  it('derives a non-generic category and priority from ticket text', () => {
    const analysis = buildTicketAnalysisFallback({
      title: 'Water leaking from washroom pipe',
      description: 'There is a major leak near the sink and water is spreading across the floor.',
      location: 'Block A floor 2 washroom',
    });

    expect(analysis.category).toBe('plumbing');
    expect(analysis.priority).toBe('HIGH');
    expect(analysis.predictedResolutionHours).toBeGreaterThan(0);
  });
});

