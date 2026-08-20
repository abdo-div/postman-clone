import { z } from 'zod';

const authSchema = z.object({
  type: z.enum(['bearer', 'basic', 'apiKey', 'none']).default('none'),
  config: z.record(z.string(), z.string()).optional().default({}),
});

export const createCollectionSchema = z.object({
  body: z.object({
    name: z.string({ message: 'Collection name is required' }).min(1).trim(),
    description: z.string().optional().default(''),
    parentId: z.string().nullable().optional().default(null),
    variables: z.record(z.string(), z.string()).optional().default({}),
    headers: z.record(z.string(), z.string()).optional().default({}),
    auth: authSchema.optional(),
  }),
});

export const updateCollectionSchema = z.object({
  params: z.object({
    id: z.string({ message: 'Collection ID is required' }),
  }),
  body: createCollectionSchema.shape.body.partial(),
});

export const collectionIdParamSchema = z.object({
  params: z.object({
    id: z.string({ message: 'Collection ID is required' }),
  }),
});

export type CreateCollectionInput = z.infer<typeof createCollectionSchema>['body'];
export type UpdateCollectionInput = z.infer<typeof updateCollectionSchema>['body'];