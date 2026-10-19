import { z } from 'zod';

export const registerSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required'),
    email: z.string().trim().email('Please enter a valid email address').toLowerCase(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .regex(/^(?=.*[a-zA-Z])(?=.*\d)/, 'Password must contain at least one letter and one number'),
    role: z.enum(['creator', 'brand', 'freelancer', 'talentManager'], {
      errorMap: () => ({ message: 'Role must be one of: creator, brand, freelancer, talentManager' }),
    }),
    orgName: z.string().trim().optional(),
  })
  .strict();

export const loginSchema = z
  .object({
    email: z.string().trim().email('Please enter a valid email address').toLowerCase(),
    password: z.string().min(1, 'Password is required'),
  })
  .strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
