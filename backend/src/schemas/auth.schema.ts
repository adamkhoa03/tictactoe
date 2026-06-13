import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string()
    .min(3)
    .max(20)
    .trim(),
  email: z.string()
    .email()
    .trim()
    .toLowerCase(),
  password: z.string()
    .min(6),
});

export const loginSchema = z.object({
  identifier: z.string().min(1).trim(),
  password: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
