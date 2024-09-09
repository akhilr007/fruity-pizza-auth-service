import { z } from 'zod';

export const tenantSchema = z
    .object({
        name: z.string().trim().min(1, 'Tenant name is required'),
        address: z.string().trim().min(1, 'Tenant address is required'),
    })
    .strict();
