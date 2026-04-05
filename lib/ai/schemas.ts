import { z } from 'zod';

export const ticketNlpSchema = z.object({
  category: z.string(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  summary: z.string(),
  keywords: z.array(z.string()),
  fixSteps: z.array(z.string()),
  technicianType: z.string(),
  predictedResolutionHours: z.number().int().nonnegative(),
});

export type TicketNlp = z.infer<typeof ticketNlpSchema>;

export const chatSchema = z.object({
  answer: z.string(),
  suggestedSteps: z.array(z.string()).optional(),
  tone: z.enum(['friendly', 'formal', 'concise']).optional(),
});

