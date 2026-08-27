import { z } from 'zod';

export const richVariableSchema = z.object({
  id: z.string().optional(),
  key: z.string().optional().default(''),
  initialValue: z.string().optional().default(''),
  currentValue: z.string().optional().default(''),
  secret: z.boolean().optional().default(false),
  description: z.string().optional().default(''),
});

// Variables may arrive as rich objects (full fidelity) or as a simple
// key -> value map (legacy clients). The service normalizes both.
export const variablesSchema = z.union([
  z.array(richVariableSchema),
  z.record(z.string(), z.string()),
]);

export const createEnvironmentSchema = z.object({
  body: z.object({
    name: z.string({ message: 'Environment name is required' }).min(1).trim(),
    isGlobal: z.boolean().optional().default(false),
    variables: variablesSchema.optional(),
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
