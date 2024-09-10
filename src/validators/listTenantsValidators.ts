import { z } from 'zod';

import { validateData } from './validateData';

// Define the schema for validating query parameters
const listTenantSchema = z.object({
    q: z
        .string()
        .optional()
        .transform((value) => (value ? value.trim() : '')), // Sanitize and trim
    currentPage: z
        .string()
        .optional()
        .transform((value) => {
            const parsedValue = Number(value);
            return Number.isNaN(parsedValue) ? 1 : parsedValue; // Default to 1 if NaN
        }),
    perPage: z
        .string()
        .optional()
        .transform((value) => {
            const parsedValue = Number(value);
            return Number.isNaN(parsedValue) ? 6 : parsedValue; // Default to 6 if NaN
        }),
});

export const listTenantValidator = validateData(listTenantSchema, 'query');
