import { z } from 'zod';

export const reviewSubmissionSchema = z
  .object({
    action: z.enum(['approve', 'requestChanges']),
    comment: z.string().trim().max(2000).optional(),
  })
  .strict();

export const submissionQuerySchema = z
  .object({
    collaborationId: z
      .any()
      .optional()
      .superRefine((val, ctx) => {
        if (val !== undefined && typeof val !== 'string') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'collaborationId must be a plain string',
          });
        }
      })
      .pipe(z.string().trim().max(100).optional()),
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
          .enum(['all', 'pending', 'approved', 'changesRequested'])
          .optional()
          .default('all')
      ),
  })
  .strict();

export type ReviewSubmissionInput = z.infer<typeof reviewSubmissionSchema>;
export type SubmissionQueryInput = z.infer<typeof submissionQuerySchema>;
