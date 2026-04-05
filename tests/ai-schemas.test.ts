import { describe, expect, it } from 'vitest';
import { ticketNlpSchema } from '@/lib/ai/schemas';

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
});

