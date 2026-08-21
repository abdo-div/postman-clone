import { z } from "zod";

export const runTestSchema = z.object({
  body: z.object({
    script: z.string({ message: 'Script body is required' }),
    response: z.object({
      status: z.number(),
      statusText: z.string(),
      headers: z.record(z.string(), z.string()),
      data: z.unknown(),
    }),
    environmentVariables: z.record(z.string(), z.string()).optional().default({}),
    timeoutMs: z.number().int().positive().optional().default(3000), // Ensure .optional() is chained
  }),
});

export type RunTestInput = z.infer<typeof runTestSchema>['body'];
export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

export interface RunnerResponse {
  results: TestResult[];
  environmentVariables: Record<string, string>;
  executionTimeMs: number;
}
