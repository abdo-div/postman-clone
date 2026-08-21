import { z } from 'zod';

export const historyIdParamSchema = z.object({
  params: z.object({
    id: z.string({ message: 'History ID is required' }),
  }),
});

export const requestIdParamSchema = z.object({
  params: z.object({
    requestId: z.string({ message: 'Request ID is required' }),
  }),
});

// Zod will automatically convert string query params to numbers
export const historyPaginationQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
  }),
});