import { z } from 'zod';

export const SignupSchema = z.object({
    email: z.string()
        .trim() // --- FIX: Automatically remove whitespace
        .email(),

    password: z.string()
        .min(6),

    fullName: z.string()
        .trim() // --- FIX: Clean up name input
        .min(2),
});

export const SocialAuthSchema = z.object({
    idToken: z.string(),
    fullName: z.string().optional(),
});