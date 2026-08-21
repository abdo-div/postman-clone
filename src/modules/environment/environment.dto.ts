import { z } from 'zod';

export const createEnvironmentSchema = z.object({
  body: z.object({
    name: z.string({ message: 'Environment name is required' }).min(1).trim(),
    isGlobal: z.boolean().optional().default(false),
    variables: z.record(z.string(), z.string()).optional().default({}),
  }),
});

export const updateEnvironmentSchema = z.object({
  params: z.object({
    id: z.string({ message: 'Environment ID is required' }),
  }),
  body: createEnvironmentSchema.shape.body.partial(),
});

export const environmentIdParamSchema = z.object({
  params: z.object({
    id: z.string({ message: 'Environment ID is required' }),
  }),
});

export type CreateEnvironmentInput = z.infer<typeof createEnvironmentSchema>['body'];
export type UpdateEnvironmentInput = z.infer<typeof updateEnvironmentSchema>['body'];