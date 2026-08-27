import { ExecuteRequestInput, ExecutionResponse } from "./executor.dto.js";
import { VariableParser } from "../../utils/variable-parser.util.js";
import { BadRequestError } from "../../errors/app-error.js";
import { validateTargetUrl } from "../../utils/ssrf-guard.js";

export class ExecutorService {
  public async execute(input: ExecuteRequestInput): Promise<ExecutionResponse> {
    try {
      // 1. Safely retrieve variables and headers with fallback defaults
      const envVars = input.environmentVariables || {};
      const rawHeaders = input.headers || {};

      // 2. Resolve mustache variables
      const resolvedUrl = VariableParser.parse(input.url, envVars);

      // 3. Validate target URL against SSRF rules (blocks localhost/internal IPs)
      await validateTargetUrl(resolvedUrl);

      const resolvedHeaders: Record<string, string> = {};
      for (const [key, value] of Object.entries(rawHeaders)) {
        if (typeof value === "string") {
          resolvedHeaders[VariableParser.parse(key, envVars)] =
            VariableParser.parse(value, envVars);
        }
      }

      // 4. Setup AbortSignal for strict timeout handling
      const timeoutMs = input.timeoutMs || 10000;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);

      const startTime = performance.now();

      // 5. Prepare request payload
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

      // 6. Dispatch native fetch request
      const response = await fetch(resolvedUrl, fetchOptions);
      const endTime = performance.now();

      // 7. Extract response metadata and body text
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
          `Request execution timed out after ${input.timeoutMs || 10000}ms`
        );
      }

      // Catches ENOTFOUND, ECONNREFUSED, SSRF guard exceptions, and bad domain names
      throw new BadRequestError(
        `Execution failed: ${error.message || "Unable to reach target host"}`
      );
    }
  }
}