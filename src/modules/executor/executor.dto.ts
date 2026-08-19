import { z } from "zod";

export const executeRequestSchema = z.object({
  body: z.object({
    // Enforce protocol presence (http:// or https://)
    url: z
      .string()
      .url("A valid URL with protocol (http:// or https://) is required"),

    // Strict HTTP Method Enum
    method: z.enum([
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "HEAD",
      "OPTIONS",
    ]),

    // Headers must be key-value string pairs. Defaults to empty object if omitted.
    headers: z.record(z.string(), z.string()).optional().default({}),

    // Payload can be a JSON object, raw string, or null
    body: z
      .union([z.record(z.string(), z.unknown()), z.string(), z.null()])
      .optional()
      .default(null),

    // Timeout bounds (Min: 100ms, Max: 30s). Defaults to 10s.
    timeoutMs: z.number().min(100).max(30000).optional().default(10000),

    // Postman-style Environment Variables map for mustache template substitution
    environmentVariables: z
      .record(z.string(), z.string())
      .optional()
      .default({}),
  }),
});

export type ExecuteRequestInput = z.infer<typeof executeRequestSchema>["body"];

export interface ExecuteionMetrics {
  readonly durationMs: number;
  readonly sizeBytes: number;
}

export interface ExecutionResponse {
  readonly status: number;
  readonly statusText: string;
  readonly headers: Record<string, string>;
  readonly data: string;
  readonly metrics: ExecuteionMetrics;
}
