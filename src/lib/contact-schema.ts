import { z } from 'zod';

export const contactSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required').max(120),
    email: z.string().trim().email('Enter a valid email').max(200),
    message: z.string().trim().min(5, 'Please provide a brief message').max(4000).optional(),
    bottleneck: z.string().trim().min(5).max(4000).optional(),
    compliance: z.array(z.enum(['hipaa', 'soc2', 'gdpr', 'none'])).default(['none']),
    tier: z.enum(['prototype', 'production', 'enterprise']).default('production'),
    // Hidden honeypot field — real visitors never fill this in.
    company_website: z.string().max(0).optional().or(z.literal('')),
  })
  .refine((data) => Boolean(data.message || data.bottleneck), {
    message: 'Message is required',
    path: ['message'],
  });

export type ContactPayload = z.infer<typeof contactSchema>;
