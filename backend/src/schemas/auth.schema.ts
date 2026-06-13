import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters long')
    .max(20, 'Username must be at most 20 characters long')
    .trim(),
  email: z.string()
    .email('Invalid email address')
    .trim()
    .toLowerCase(),
  password: z.string()
    .min(6, 'Password must be at least 6 characters long'),
});

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Username or Email is required').trim(),
  password: z.string().min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
