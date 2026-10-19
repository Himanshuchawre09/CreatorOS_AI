import { z } from 'zod';

export const createInvoiceSchema = z
  .object({
    collaborationId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid collaboration ID'),
    amount: z.coerce.number().positive('Amount must be greater than 0'),
    currency: z
      .string()
      .length(3, 'Currency must be a 3-letter code (e.g., USD)')
      .transform((val) => val.toUpperCase())
      .default('USD'),
    description: z
      .string()
      .min(3, 'Description must be at least 3 characters')
      .max(500, 'Description cannot exceed 500 characters')
      .trim(),
    dueDate: z.coerce.date(),
    notes: z
      .string()
      .max(1000, 'Notes cannot exceed 1000 characters')
      .trim()
      .optional(),
  })
  .strict();

export const updateInvoiceStatusSchema = z
  .object({
    status: z.enum(['sent', 'paid', 'cancelled'], {
      errorMap: () => ({ message: 'Status must be sent, paid, or cancelled' }),
    }),
  })
  .strict();

export const invoiceQuerySchema = z
  .object({
    status: z
      .enum(['all', 'draft', 'sent', 'paid', 'overdue', 'cancelled'])
      .optional()
      .refine((val) => val === undefined || typeof val === 'string', {
        message: 'status must be a plain string',
      }),
    collaborationId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid collaboration ID')
      .optional()
      .refine((val) => val === undefined || typeof val === 'string', {
        message: 'collaborationId must be a plain string',
      }),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(20),
  })
  .strict();
