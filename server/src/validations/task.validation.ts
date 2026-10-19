import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createTaskSchema = z
  .object({
    collaborationId: z
      .string()
      .trim()
      .regex(objectIdRegex, 'Invalid collaboration ID'),
    title: z.string().trim().min(1, 'Task title is required').max(150),
    description: z.string().trim().max(2000).optional(),
    assigneeId: z.string().trim().regex(objectIdRegex, 'Invalid assignee ID'),
    dueDate: z
      .string()
      .datetime({ offset: true })
      .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
      .optional()
      .nullable(),
    status: z.enum(['todo', 'doing', 'review', 'done']).optional().default('todo'),
  })
  .strict();

export const updateTaskSchema = z
  .object({
    title: z.string().trim().min(1, 'Task title is required').max(150).optional(),
    description: z.string().trim().max(2000).optional(),
    assigneeId: z
      .string()
      .trim()
      .regex(objectIdRegex, 'Invalid assignee ID')
      .optional(),
    dueDate: z
      .string()
      .datetime({ offset: true })
      .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
      .optional()
      .nullable(),
    status: z.enum(['todo', 'doing', 'review', 'done']).optional(),
    order: z.number().int().optional(),
  })
  .strict();

export const taskQuerySchema = z
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
          .enum(['all', 'todo', 'doing', 'review', 'done'])
          .optional()
          .default('all')
      ),
  })
  .strict();

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskQueryInput = z.infer<typeof taskQuerySchema>;
