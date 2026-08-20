import { ExecuteRequestInput, ExecutionResponse } from "./executor.dto.js";
import { VariableParser } from "../../utils/variable-parser.util.js";
import { BadRequestError } from "../../errors/app-error.js";

export class ExecutorService {
  public async execute(input: ExecuteRequestInput): Promise<ExecutionResponse> {
    try {
      // 1. Safely retrieve variables and headers with fallback defaults
      const envVars = input.environmentVariables || {};
      const rawHeaders = input.headers || {};

      // 2. Resolve mustache variables
      const resolvedUrl = VariableParser.parse(input.url, envVars);

      const resolvedHeaders: Record<string, string> = {};
      for (const [key, value] of Object.entries(rawHeaders)) {
        if (typeof value === "string") {
          resolvedHeaders[VariableParser.parse(key, envVars)] =
            VariableParser.parse(value, envVars);
        }
      }

      // 3. Setup AbortSignal for strict timeout handling
      const timeoutMs = input.timeoutMs || 10000;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);

      const startTime = performance.now();

      // 4. Prepare request payload
      const fetchOptions: RequestInit = {
        method: input.method,
        headers: resolvedHeaders,
        signal: controller.signal,
      };

      if (
        input.body &&
        ["POST", "PUT", "PATCH"].includes(input.method.toUpperCase())
      ) {
        fetchOptions.body =
          typeof input.body === "string"
            ? input.body
            : JSON.stringify(input.body);
      }

      // 5. Dispatch native fetch request
      const response = await fetch(resolvedUrl, fetchOptions);
      const endTime = performance.now();

      // 6. Extract response metadata and body text
      const rawData = await response.text();
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      clearTimeout(timeout);

      return {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        data: rawData,
        metrics: {
          durationMs: Math.round(endTime - startTime),
          sizeBytes: Buffer.byteLength(rawData, "utf-8"),
        },
      };
    } catch (error: any) {
      if (error.name === "AbortError") {
        throw new BadRequestError(
          `Request execution timed out after ${input.timeoutMs || 10000}ms`,
        );
      }

      // Catches ENOTFOUND, ECONNREFUSED, bad domain names, and parsing bugs
      throw new BadRequestError(
        `Execution failed: ${error.message || "Unable to reach target host"}`,
      );
    }
  }
}
