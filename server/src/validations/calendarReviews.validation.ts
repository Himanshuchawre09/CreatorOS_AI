import { z } from 'zod';

export const createCalendarPostSchema = z
  .object({
    collaborationId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid collaboration ID')
      .optional(),
    title: z
      .string()
      .min(1, 'Title cannot be empty')
      .max(150, 'Title cannot exceed 150 characters')
      .trim(),
    description: z
      .string()
      .max(500, 'Description cannot exceed 500 characters')
      .trim()
      .optional(),
    platform: z.enum(
      ['youtube', 'instagram', 'tiktok', 'twitch', 'blog', 'other'],
      {
        errorMap: () => ({ message: 'Invalid platform selected' }),
      }
    ),
    scheduledDate: z.coerce.date(),
    status: z
      .enum(['draft', 'scheduled', 'published', 'archived'])
      .default('scheduled'),
  })
  .strict();

export const updateCalendarPostSchema = z
  .object({
    title: z
      .string()
      .min(1, 'Title cannot be empty')
      .max(150, 'Title cannot exceed 150 characters')
      .trim()
      .optional(),
    description: z
      .string()
      .max(500, 'Description cannot exceed 500 characters')
      .trim()
      .optional(),
    platform: z
      .enum(['youtube', 'instagram', 'tiktok', 'twitch', 'blog', 'other'])
      .optional(),
    scheduledDate: z.coerce.date().optional(),
    status: z
      .enum(['draft', 'scheduled', 'published', 'archived'])
      .optional(),
  })
  .strict();

export const calendarQuerySchema = z
  .object({
    month: z.coerce.number().int().min(1).max(12).optional(),
    year: z.coerce.number().int().min(2020).max(2100).optional(),
    platform: z
      .string()
      .max(50)
      .optional()
      .refine((val) => val === undefined || typeof val === 'string', {
        message: 'platform must be a plain string',
      }),
    status: z
      .string()
      .max(50)
      .optional()
      .refine((val) => val === undefined || typeof val === 'string', {
        message: 'status must be a plain string',
      }),
  })
  .strict();

export const upsertAnalyticsSchema = z
  .object({
    collaborationId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid collaboration ID'),
    views: z.coerce.number().min(0, 'Views must be non-negative'),
    reach: z.coerce.number().min(0, 'Reach must be non-negative'),
    clicks: z.coerce.number().min(0, 'Clicks must be non-negative'),
    engagement: z.coerce.number().min(0, 'Engagement must be non-negative'),
    notes: z
      .string()
      .max(500, 'Notes cannot exceed 500 characters')
      .trim()
      .optional(),
  })
  .strict();

export const createReviewSchema = z
  .object({
    collaborationId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid collaboration ID'),
    rating: z.coerce
      .number()
      .int('Rating must be an integer')
      .min(1, 'Rating must be at least 1')
      .max(5, 'Rating cannot exceed 5'),
    comment: z
      .string()
      .min(3, 'Comment must be at least 3 characters')
      .max(1000, 'Comment cannot exceed 1000 characters')
      .trim(),
  })
  .strict();
