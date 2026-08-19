import { performance } from "node:perf_hooks";
import { ExecuteRequestInput, ExecutionResponse } from "./executor.dto.js";
import { VariableParser } from "../../utils/variable-parser.util.js";
import { BadRequestError } from "../../errors/app-error.js";

/**
 * Service orchestrating external HTTP request execution,
 * latency measurement, and environment variable parsing.
 */
export class ExecutorService {
  /**
   * Executes a remote HTTP request based on validated user input.
   *
   * @param input - Validated ExecuteRequestInput payload
   * @returns Promise resolving to the normalized ExecutionResponse
   */
  static async execute(input: ExecuteRequestInput): Promise<ExecutionResponse> {
    // 1. Resolve dynamic mustache variables in URL and headers
    const resolvedUrl: string = VariableParser.parse(
      input.url,
      input.environmentVariables,
    );
    const resolvedHeaders: Record<string, string> = VariableParser.parseHeaders(
      input.headers,
      input.environmentVariables,
    );

    // 2. Set up AbortSignal to enforce request timeout limits
    const controller: AbortController = new AbortController();
    const timeoutId: NodeJS.Timeout = setTimeout((): void => {
      controller.abort();
    }, input.timeoutMs);

    // 3. Start high-resolution timer
    const startTime: number = performance.now();

    try {
      // Format request body (JSON stringify if object, keep raw if string/null)
      const formattedBody: string | null =
        typeof input.body === "object" && input.body !== null
          ? JSON.stringify(input.body)
          : (input.body as string | null);

      // 4. Dispatch native fetch network call
      const response: Response = await fetch(resolvedUrl, {
        method: input.method,
        headers: resolvedHeaders,
        body: ["GET", "HEAD"].includes(input.method) ? null : formattedBody,
        signal: controller.signal,
      });

      // 5. Stop timer and calculate total execution duration
      const endTime: number = performance.now();
      const durationMs: number = Math.round(endTime - startTime);

      // Read raw text response body
      const responseText: string = await response.text();

      // Convert Fetch Headers instance into a standard key-value record
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value: string, key: string): void => {
        responseHeaders[key] = value;
      });

      // 6. Return structured execution results
      return {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        data: responseText,
        metrics: {
          durationMs,
          sizeBytes: Buffer.byteLength(responseText, "utf8"),
        },
      };
    } catch (error: unknown) {
      // Catch timeout abort signal and transform into an operational AppError
      if (error instanceof Error && error.name === "AbortError") {
        throw new BadRequestError(
          `Request execution timed out after ${input.timeoutMs}ms`,
        );
      }
      throw error;
    } finally {
      // Always clear timeout to prevent timer memory leaks
      clearTimeout(timeoutId);
    }
  }
}
