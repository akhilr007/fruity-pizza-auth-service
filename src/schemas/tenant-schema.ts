import { z } from 'zod';

export const tenantSchema = z
    .object({
        name: z.string().trim(),
        address: z.string().trim(),
    })
    .strict();
