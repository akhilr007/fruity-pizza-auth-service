import { z } from 'zod';

export const userRegistrationSchema = z.object({
    firstName: z.string().min(1, { message: 'First name cannot be empty' }),
    lastName: z.string().min(1, { message: 'Last name cannot be empty' }),
    email: z.string().email({ message: 'Invalid email address' }),
    password: z
        .string()
        .min(6, { message: 'Password must be at least 6 characters long' }),
});
