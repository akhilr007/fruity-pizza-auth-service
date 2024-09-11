import { z } from 'zod';

import { validateData } from './validateData';

const querySchema = z.object({
    q: z.string().trim().default(''), // Ensure 'q' is a string and trim whitespace; default to an empty string
    role: z.string().trim().default(''), // Ensure 'role' is a string and trim whitespace; default to an empty string
    currentPage: z.preprocess(
        (value) => {
            // Convert to number or default to 1 if invalid
            const parsedValue = Number(value);
            return Number.isNaN(parsedValue) ? 1 : parsedValue;
        },
        z.number().int().min(1), // Validate that the value is a positive integer
    ),
    perPage: z.preprocess(
        (value) => {
            // Convert to number or default to 6 if invalid
            const parsedValue = Number(value);
            return Number.isNaN(parsedValue) ? 6 : parsedValue;
        },
        z.number().int().min(1), // Validate that the value is a positive integer
    ),
});

export const listUserValidator = validateData(querySchema, 'query');
