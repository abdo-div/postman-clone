import { z } from "zod";

export const executeRequestSchema = z.object({
  body: z.object({
    url: z.string({ message: "URL is required" }).min(1, "URL cannot be empty"),
    method: z.enum(
      ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"],
      {
        message: "HTTP method is required",
      },
    ),
    headers: z.record(z.string(), z.string()).optional().default({}),
    body: z.unknown().optional().default(null),
    environmentVariables: z
      .record(z.string(), z.string())
      .optional()
      .default({}),
    timeoutMs: z.number().int().positive().optional().default(10000),
  }),
});

export type ExecuteRequestInput = z.infer<typeof executeRequestSchema>["body"];

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
