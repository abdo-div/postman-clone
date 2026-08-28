import { ExecuteRequestInput, ExecutionResponse } from "./executor.dto.js";
import { VariableParser } from "../../utils/variable-parser.util.js";
import { AppError, BadRequestError } from "../../errors/app-error.js";
import { validateTargetUrl } from "../../utils/ssrf-guard.js";

/** Pulls the actual underlying failure out of a wrapped FetchError. */
function unwrapError(error: any): { code: string; message: string } {
  const cause = error?.cause ?? error;
  return {
    code: cause?.code ?? error?.code ?? "",
    message: cause?.message ?? error?.message ?? "",
  };
}

function extractHost(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export class ExecutorService {
  public async execute(input: ExecuteRequestInput): Promise<ExecutionResponse> {
    const resolvedUrl = VariableParser.parse(input.url, input.environmentVariables || {});
    try {
      // 1. Safely retrieve variables and headers with fallback defaults
      const envVars = input.environmentVariables || {};
      const rawHeaders = input.headers || {};

      // 2. Validate target URL against SSRF rules (blocks localhost/internal IPs)
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
      // Preserve operational errors (e.g. SSRF guard blocks with their 403 status)
      if (error instanceof AppError) {
        throw error;
      }

      if (error.name === "AbortError") {
        throw new BadRequestError(
          `The request timed out after ${input.timeoutMs || 10000}ms. The server took too long to respond.`,
          "REQUEST_TIMEOUT",
          { timeoutMs: input.timeoutMs || 10000 },
        );
      }

      const { code, message } = unwrapError(error);
      const host = extractHost(resolvedUrl);

      switch (code) {
        case "ENOTFOUND":
        case "EAI_AGAIN":
          throw new BadRequestError(
            `Could not resolve host "${host}". Check that the domain name is correct and the DNS record exists.`,
            "UPSTREAM_DNS_FAILURE",
            { host, cause: code },
          );
        case "ECONNREFUSED":
          throw new BadRequestError(
            `Connection refused at "${host}". Make sure the server is running, the port is open, and the service is reachable.`,
            "UPSTREAM_CONNECTION_REFUSED",
            { host, cause: code },
          );
        case "ECONNRESET":
        case "EPIPE":
          throw new BadRequestError(
            `The connection to "${host}" was reset before the response completed. The server may have closed the connection early.`,
            "UPSTREAM_CONNECTION_RESET",
            { host, cause: code },
          );
        case "ETIMEDOUT":
        case "ESOCKETTIMEDOUT":
          throw new BadRequestError(
            `Timed out while connecting to "${host}". The server may be slow, overloaded, or unreachable.`,
            "UPSTREAM_CONNECTION_TIMEOUT",
            { host, cause: code },
          );
        case "EHOSTUNREACH":
        case "ENETUNREACH":
          throw new BadRequestError(
            `Host "${host}" is unreachable from our servers. This is usually a firewall or routing issue.`,
            "UPSTREAM_UNREACHABLE",
            { host, cause: code },
          );
        default:
          break;
      }

      const lower = `${code} ${message}`.toLowerCase();
      if (lower.includes("certificate") || lower.includes("tls") || /cert/i.test(code) || code.includes("SELF_SIGNED") || code === "UNABLE_TO_VERIFY_LEAF_SIGNATURE" || code === "DEPTH_ZERO_SELF_SIGNED_CERT" || code === "ERR_TLS_CERT_ALTNAME_INVALID") {
        throw new BadRequestError(
          `TLS certificate verification failed for "${host}". The server's certificate may be expired, invalid, or self-signed.`,
          "UPSTREAM_TLS_ERROR",
          { host, cause: code },
        );
      }

      // Generic fallback — always include the host so the message is actionable
      const reason = message && message !== "fetch failed" ? message : "the target is not responding";
      throw new BadRequestError(
        `Could not reach "${host}" — ${reason}.`,
        "UPSTREAM_ERROR",
        { host, cause: code || undefined },
      );
    }
  }
}