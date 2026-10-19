import { z } from 'zod';

export const createRequestSchema = z
  .object({
    campaignId: z.string().trim().min(1, 'Campaign ID is required'),
    recipientId: z.string().trim().min(1, 'Recipient ID is required'),
    pitch: z.string().trim().max(1000, 'Pitch cannot exceed 1000 characters').optional().default(''),
    proposedRate: z.coerce.number().min(0, 'Proposed rate must be 0 or more').optional(),
    currency: z.string().trim().max(10).default('USD'),
  })
  .strict();

export const respondRequestSchema = z
  .object({
    action: z.enum(['accept', 'reject'], {
      errorMap: () => ({ message: 'Action must be "accept" or "reject"' }),
    }),
  })
  .strict();

export const requestQuerySchema = z
  .object({
    type: z
      .any()
      .superRefine((val, ctx) => {
        if (val === undefined) return;
        if (typeof val !== 'string') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Type parameter must be a string',
          });
          return;
        }
        if (!['inbox', 'outbox', 'all'].includes(val)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Type must be one of: inbox, outbox, all',
          });
        }
      })
      .transform((val) => (typeof val === 'string' ? (val as 'inbox' | 'outbox' | 'all') : 'all')),
    status: z
      .any()
      .superRefine((val, ctx) => {
        if (val === undefined) return;
        if (typeof val !== 'string') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Status parameter must be a string',
          });
          return;
        }
        if (!['pending', 'accepted', 'rejected', 'withdrawn', 'all'].includes(val)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Invalid status parameter',
          });
        }
      })
      .transform((val) => (typeof val === 'string' ? val : 'all')),
    page: z
      .any()
      .superRefine((val, ctx) => {
        if (val === undefined) return;
        if (typeof val === 'object' && val !== null) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Page parameter must be a primitive number',
          });
          return;
        }
        const num = Number(val);
        if (isNaN(num) || num < 1) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Page must be a positive integer',
          });
        }
      })
      .transform((val) => (val !== undefined ? Math.max(1, parseInt(String(val), 10) || 1) : 1)),
    limit: z
      .any()
      .superRefine((val, ctx) => {
        if (val === undefined) return;
        if (typeof val === 'object' && val !== null) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Limit parameter must be a primitive number',
          });
          return;
        }
        const num = Number(val);
        if (isNaN(num) || num < 1 || num > 24) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Limit must be between 1 and 24',
          });
        }
      })
      .transform((val) => (val !== undefined ? Math.min(24, Math.max(1, parseInt(String(val), 10) || 12)) : 12)),
  })
  .strict();
