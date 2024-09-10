import { z } from 'zod';

import { Roles } from '../constants';

export const userRegistrationSchema = z
    .object({
        firstName: z
            .string()
            .trim()
            .min(1, { message: 'First name cannot be empty' }),
        lastName: z
            .string()
            .trim()
            .min(1, { message: 'Last name cannot be empty' }),
        email: z
            .string()
            .trim()
            .email({ message: 'Invalid email address' })
            .transform((email) => email.toLowerCase()),
        password: z
            .string()
            .trim()
            .min(8, { message: 'Password must be at least 8 characters long' }),
        role: z.nativeEnum(Roles, { message: 'Invalid Roles' }),
    })
    .strict();

export const userLoginSchema = z
    .object({
        email: z
            .string()
            .trim()
            .email({ message: 'Invalid email address' })
            .transform((email) => email.toLowerCase()),
        password: z.string().trim(),
    })
    .strict();
