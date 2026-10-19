import { z } from 'zod';

const deliverableItemSchema = z
  .object({
    type: z.string().trim().min(1, 'Deliverable type is required').max(100),
    count: z.number().int().min(1, 'Count must be at least 1').default(1),
    details: z.string().trim().max(500).optional(),
  })
  .strict();

export const updateContractSchema = z
  .object({
    deliverables: z.array(deliverableItemSchema).min(1).optional(),
    budget: z.number().min(0, 'Budget must be at least 0').optional(),
    currency: z.string().trim().length(3).toUpperCase().optional(),
    deadline: z
      .string()
      .datetime({ offset: true })
      .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
      .optional(),
    notes: z.string().trim().max(2000).optional(),
  })
  .strict();

export const declineContractSchema = z
  .object({
    reason: z.string().trim().max(500).optional(),
  })
  .strict();

export const contractQuerySchema = z
  .object({
    status: z
      .any()
      .optional()
      .superRefine((val, ctx) => {
        if (val !== undefined && typeof val !== 'string') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'status must be a plain string',
          });
        }
      })
      .pipe(
        z
          .enum(['all', 'draft', 'sent', 'signed', 'declined'])
          .optional()
          .default('all')
      ),
    page: z
      .any()
      .optional()
      .superRefine((val, ctx) => {
        if (val !== undefined && typeof val !== 'string' && typeof val !== 'number') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'page must be a plain number or string',
          });
        }
      })
      .pipe(z.coerce.number().int().min(1).optional().default(1)),
    limit: z
      .any()
      .optional()
      .superRefine((val, ctx) => {
        if (val !== undefined && typeof val !== 'string' && typeof val !== 'number') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'limit must be a plain number or string',
          });
        }
      })
      .pipe(z.coerce.number().int().min(1).max(24).optional().default(12)),
  })
  .strict();

export type UpdateContractInput = z.infer<typeof updateContractSchema>;
export type DeclineContractInput = z.infer<typeof declineContractSchema>;
export type ContractQueryInput = z.infer<typeof contractQuerySchema>;
