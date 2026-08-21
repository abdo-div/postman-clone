import { z } from "zod";

export const executeRequestSchema = z.object({
  body: z.object({
    url: z.string({ message: 'Target URL is required' }).url('Invalid URL format'),
    method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']).default('GET'),
    headers: z.record(z.string(), z.string()).optional().default({}),
    body: z.unknown().optional(),
    environmentVariables: z.record(z.string(), z.string()).optional().default({}),
    timeoutMs: z.number().int().positive().optional().default(10000), // <--- Make optional
  }),
});

export type ExecuteRequestInput = z.infer<typeof executeRequestSchema>['body'];
export interface ExecutionResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: string;
  metrics: {
    durationMs: number;
    sizeBytes: number;
  };
}
