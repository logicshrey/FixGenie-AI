import { describe, expect, it } from 'vitest';
import { ticketNlpSchema } from '@/lib/ai/schemas';

describe('ticket creation schema', () => {
  it('enforces required fields', () => {
    const sample = {
      category: 'wifi',
      priority: 'MEDIUM',
      summary: 'WiFi is slow',
      keywords: ['wifi', 'slow'],
      fixSteps: ['Restart router'],
      technicianType: 'network',
      predictedResolutionHours: 6,
    };
    const parsed = ticketNlpSchema.parse(sample);
    expect(parsed.summary).toContain('WiFi');
  });
});

