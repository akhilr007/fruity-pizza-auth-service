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

const updateUserSchema = z.object({
    firstName: z.string().trim().min(1, { message: 'First name is required!' }),

    lastName: z.string().trim().min(1, { message: 'Last name is required!' }),

    role: z.string().trim().min(1, { message: 'Role is required!' }),

    email: z
        .string()
        .trim()
        .email({ message: 'Invalid email!' })
        .min(1, { message: 'Email is required!' }),

    // For tenantId, we will use .refine to handle conditional validation
    tenantId: z.number().optional(), // Initially optional
});

// Add conditional logic based on the role
const updateUserSchemaWithTenant = updateUserSchema.superRefine((data, ctx) => {
    if (data.role !== 'admin' && !data.tenantId) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['tenantId'],
            message: 'Tenant id is required!',
        });
    }
});

export default updateUserSchemaWithTenant;
