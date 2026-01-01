import { z } from 'zod';

export const authSchema = z.object({
    email: z
        .string()
        .min(1, "Email is required")
        .email("Invalid email address"),
    password: z
        .string()
        .min(6, "Password must be at least 6 characters"),
    fullName: z
        .string()
        .min(2, "Full name must be at least 2 characters")
        .optional()
        .or(z.literal('')),
});

export type AuthFormData = z.infer<typeof authSchema>;