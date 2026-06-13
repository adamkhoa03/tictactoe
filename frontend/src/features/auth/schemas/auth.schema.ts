import { z } from "zod";
import i18n from "@/config/i18n";
export const loginSchema = z.object({
  identifier: z.string().min(1),
  password: z.string().min(1),
});

export const registerSchema = z.object({
  username: z.string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/)
    .trim(),
  email: z.string()
    .min(1)
    .email()
    .trim()
    .toLowerCase(),
  password: z.string()
    .min(6),
  confirmPassword: z.string()
    .min(1),
}).refine((data) => data.password === data.confirmPassword, {
  message: i18n.t("validation.passwordsMustMatch"),
  path: ["confirmPassword"],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
