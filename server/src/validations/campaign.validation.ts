import { z } from 'zod';

const safeQueryString = (max = 100) =>
  z
    .any()
    .superRefine((val, ctx) => {
      if (val === undefined) return;
      if (typeof val !== 'string') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Query parameter must be a string',
        });
        return;
      }
      if (val.length > max) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Query parameter cannot exceed ${max} characters`,
        });
      }
    })
    .transform((val) => (typeof val === 'string' ? val.trim() : undefined));

const safeQueryNumber = (min = 0, max?: number) =>
  z
    .any()
    .superRefine((val, ctx) => {
      if (val === undefined) return;
      if (typeof val === 'object' && val !== null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Query parameter must be a primitive number',
        });
        return;
      }
      const num = Number(val);
      if (isNaN(num)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Query parameter must be a valid number',
        });
        return;
      }
      if (num < min) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Query parameter must be at least ${min}`,
        });
      }
      if (max !== undefined && num > max) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Query parameter cannot exceed ${max}`,
        });
      }
    })
    .transform((val) => (val !== undefined ? Number(val) : undefined));

export const deliverableSchema = z
  .object({
    type: z.string().trim().min(1, 'Deliverable type is required').max(100),
    count: z.coerce.number().int().min(1, 'Count must be at least 1').default(1),
    details: z.string().trim().max(500).optional().default(''),
  })
  .strict();

export const createCampaignSchema = z
  .object({
    title: z.string().trim().min(1, 'Title is required').max(150),
    brief: z.string().trim().min(1, 'Brief is required').max(2000),
    goals: z.array(z.string().trim().max(100)).default([]),
    audience: z.string().trim().min(1, 'Target audience is required').max(500),
    deliverables: z.array(deliverableSchema).min(1, 'At least one deliverable is required'),
    budget: z.coerce.number().min(0, 'Budget must be at least 0'),
    currency: z.string().trim().max(10).default('USD'),
    deadline: z.coerce.date().refine((d) => !isNaN(d.getTime()), 'Valid deadline date is required'),
    status: z.enum(['draft', 'open']).default('draft'),
  })
  .strict();

export const updateCampaignSchema = z
  .object({
    title: z.string().trim().min(1).max(150).optional(),
    brief: z.string().trim().min(1).max(2000).optional(),
    goals: z.array(z.string().trim().max(100)).optional(),
    audience: z.string().trim().min(1).max(500).optional(),
    deliverables: z.array(deliverableSchema).min(1).optional(),
    budget: z.coerce.number().min(0).optional(),
    currency: z.string().trim().max(10).optional(),
    deadline: z.coerce.date().refine((d) => !isNaN(d.getTime())).optional(),
    status: z.enum(['draft', 'open', 'inProgress', 'completed', 'cancelled']).optional(),
  })
  .strict();

export const campaignQuerySchema = z
  .object({
    q: safeQueryString(100),
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
        if (!['draft', 'open', 'inProgress', 'completed', 'cancelled', 'all'].includes(val)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Invalid status parameter',
          });
        }
      })
      .transform((val) => (typeof val === 'string' ? val.trim() : undefined)),
    minBudget: safeQueryNumber(0),
    maxBudget: safeQueryNumber(0),
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
