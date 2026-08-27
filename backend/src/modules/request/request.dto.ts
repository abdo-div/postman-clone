import { z } from 'zod';

export const createRequestSchema = z.object({
  body: z.object({
    collectionId: z.string({ message: 'Collection ID is required' }),
    name: z.string({ message: 'Request name is required' }).min(1).trim(),
    method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']).default('GET'),
    url: z.string({ message: 'URL is required' }).trim(),
    headers: z.record(z.string(), z.string()).optional().default({}),
    queryParams: z.record(z.string(), z.string()).optional().default({}),
    body: z
      .object({
        mode: z.enum(['raw', 'json', 'form-data', 'none']).default('none'),
        rawContent: z.string().optional().default(''),
      })
      .optional()
      .default({ mode: 'none', rawContent: '' }),
    preRequestScript: z.string().optional().default(''),
    testScript: z.string().optional().default(''),
  }),
});

export const updateRequestSchema = z.object({
  params: z.object({
    id: z.string({ message: 'Request ID is required' }),
  }),
  body: createRequestSchema.shape.body.partial(),
});

export const requestIdParamSchema = z.object({
  params: z.object({
    id: z.string({ message: 'Request ID is required' }),
  }),
});

export const getRequestsByCollectionSchema = z.object({
  params: z.object({
    collectionId: z.string({ message: 'Collection ID is required' }),
  }),
});

export type CreateRequestInput = z.infer<typeof createRequestSchema>['body'];
export type UpdateRequestInput = z.infer<typeof updateRequestSchema>['body'];