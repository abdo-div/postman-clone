import { apiClient } from "./apiClient";

export interface ExecuteRequestPayload {
  url: string;
  method: string;
  headers?: Record<string, string>;
  body?: string | Record<string, unknown>;
  environmentVariables?: Record<string, string>;
  timeoutMs?: number;
}

export interface ExecutionResponseData {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: string | Record<string, unknown>;
  metrics: {
    durationMs: number;
    sizeBytes: number;
  };
}

export interface TestAssertionResult {
  id?: string;
  name: string;
  passed: boolean;
  error?: string;
  durationMs?: number;
}

export interface TestRunnerResponse {
  results: TestAssertionResult[];
  environmentVariables: Record<string, string>;
  executionTimeMs: number;
}

/**
 * Replace {{variableName}} templates with values from environmentVariables
 */
export function interpolateVariables(
  text: string,
  variables: Record<string, string> = {},
): string {
  if (!text) return text;
  return text.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    const trimmed = key.trim();
    if (variables[trimmed] !== undefined) {
      return variables[trimmed];
    }
    // Predefined dynamic variables like Postman
    if (trimmed === "$guid" || trimmed === "$uuid") {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    }
    if (trimmed === "$timestamp") {
      return Math.floor(Date.now() / 1000).toString();
    }
    if (trimmed === "$randomInt") {
      return Math.floor(Math.random() * 1000).toString();
    }
    return match;
  });
}

/**
 * Client-side fallback executor in case the backend executor is unreachable
 */
async function clientSideExecute(
  payload: ExecuteRequestPayload,
): Promise<ExecutionResponseData> {
  const startTime = performance.now();
  const substitutedUrl = interpolateVariables(
    payload.url,
    payload.environmentVariables,
  );

  const substitutedHeaders: Record<string, string> = {};
  if (payload.headers) {
    for (const [k, v] of Object.entries(payload.headers)) {
      substitutedHeaders[k] = interpolateVariables(
        v,
        payload.environmentVariables,
      );
    }
  }

  let bodyData: string | undefined = undefined;
  if (
    payload.body &&
    payload.method !== "GET" &&
    payload.method !== "HEAD"
  ) {
    if (typeof payload.body === "string") {
      bodyData = interpolateVariables(
        payload.body,
        payload.environmentVariables,
      );
    } else {
      bodyData = JSON.stringify(payload.body);
    }
  }

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    payload.timeoutMs || 10000,
  );

  try {
    const res = await fetch(substitutedUrl, {
      method: payload.method,
      headers: substitutedHeaders,
      body: bodyData,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const durationMs = Math.round(performance.now() - startTime);
    const headersObj: Record<string, string> = {};
    res.headers.forEach((v, k) => {
      headersObj[k] = v;
    });

    const text = await res.text();
    let parsedData: string | Record<string, unknown> = text;
    try {
      parsedData = JSON.parse(text) as Record<string, unknown>;
    } catch {
      // plain text
    }

    return {
      status: res.status,
      statusText: res.statusText || (res.status === 200 ? "OK" : ""),
      headers: headersObj,
      data: parsedData,
      metrics: {
        durationMs,
        sizeBytes: new Blob([text]).size,
      },
    };
  } catch (error: unknown) {
    clearTimeout(timeout);
    const msg = error instanceof Error ? error.message : String(error);
    const name = error instanceof Error ? error.name : "";
    if (name === "AbortError") {
      throw new Error(`Request timed out after ${payload.timeoutMs || 10000}ms`, { cause: error });
    }
    throw new Error(
      msg || "Network error or CORS issue when calling target URL directly",
      { cause: error },
    );
  }
}

/**
 * Execute Postman sandbox test scripts locally in the browser
 */
export function executeTestScript(
  script: string,
  response: {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    data: string | Record<string, unknown>;
    responseTime?: number;
  },
  environmentVariables: Record<string, string> = {},
): TestRunnerResponse {
  const startTime = performance.now();
  const results: TestAssertionResult[] = [];
  const updatedEnv = { ...environmentVariables };

  if (!script || !script.trim()) {
    return {
      results: [],
      environmentVariables: updatedEnv,
      executionTimeMs: 0,
    };
  }

  // Build Postman-compatible pm object
  const pm = {
    environment: {
      get: (key: string) => updatedEnv[key],
      set: (key: string, val: unknown) => {
        updatedEnv[key] = String(val);
      },
      has: (key: string) => key in updatedEnv,
      unset: (key: string) => {
        delete updatedEnv[key];
      },
    },
    variables: {
      get: (key: string) => updatedEnv[key],
      set: (key: string, val: unknown) => {
        updatedEnv[key] = String(val);
      },
    },
    response: {
      code: response.status,
      status: response.status,
      statusText: response.statusText,
      responseTime: response.responseTime || 100,
      headers: response.headers,
      json: () =>
        typeof response.data === "string"
          ? JSON.parse(response.data)
          : response.data,
      text: () =>
        typeof response.data === "string"
          ? response.data
          : JSON.stringify(response.data),
      to: {
        have: {
          status: (expected: number) => {
            if (response.status !== expected) {
              throw new Error(
                `expected response code to be ${expected} but got ${response.status}`,
              );
            }
          },
        },
        be: {
          ok: () => {
            if (response.status < 200 || response.status >= 300) {
              throw new Error(`expected status to be 2xx but got ${response.status}`);
            }
          },
          clientError: () => {
            if (response.status < 400 || response.status >= 500) {
              throw new Error(`expected client error (4xx) but got ${response.status}`);
            }
          },
          serverError: () => {
            if (response.status < 500) {
              throw new Error(`expected server error (5xx) but got ${response.status}`);
            }
          },
        },
      },
    },
    test: (testName: string, specFunction: () => void) => {
      const testStart = performance.now();
      try {
        specFunction();
        results.push({
          id: String(results.length + 1),
          name: testName,
          passed: true,
          durationMs: Math.round(performance.now() - testStart),
        });
      } catch (err: unknown) {
        results.push({
          id: String(results.length + 1),
          name: testName,
          passed: false,
          error: err instanceof Error ? err.message : "Assertion failed",
          durationMs: Math.round(performance.now() - testStart),
        });
      }
    },
    expect: (target: unknown) => ({
      to: {
        be: {
          below: (limit: number) => {
            if (typeof target !== "number" || target >= limit) {
              throw new Error(`expected ${target} to be below ${limit}`);
            }
          },
          above: (limit: number) => {
            if (typeof target !== "number" || target <= limit) {
              throw new Error(`expected ${target} to be above ${limit}`);
            }
          },
          equal: (expected: unknown) => {
            if (target !== expected) {
              throw new Error(`expected ${JSON.stringify(target)} to equal ${JSON.stringify(expected)}`);
            }
          },
          a: (typeStr: string) => {
            if (typeof target !== typeStr && typeStr !== "array") {
              throw new Error(`expected ${typeof target} to be a ${typeStr}`);
            }
            if (typeStr === "array" && !Array.isArray(target)) {
              throw new Error(`expected target to be an array`);
            }
          },
        },
        have: {
          property: (prop: string) => {
            if (!target || typeof target !== "object" || !(prop in target)) {
              throw new Error(`expected target to have property '${prop}'`);
            }
          },
          lengthOf: (len: number) => {
            const tLen = Array.isArray(target) ? target.length : typeof target === "string" ? target.length : undefined;
            if (tLen === undefined || tLen !== len) {
              throw new Error(`expected length of ${len} but got ${tLen}`);
            }
          },
        },
        include: (needle: string | number) => {
          if (typeof target === "string" && !target.includes(String(needle))) {
            throw new Error(`expected '${target}' to include '${needle}'`);
          }
          if (Array.isArray(target) && !target.includes(needle)) {
            throw new Error(`expected array to include ${JSON.stringify(needle)}`);
          }
        },
      },
    }),
  };

  try {
    // Run script in isolated function scope with pm injected
    const runFn = new Function("pm", script);
    runFn(pm);
  } catch (err: unknown) {
    results.push({
      id: String(results.length + 1),
      name: "Script Syntax/Runtime Error",
      passed: false,
      error: err instanceof Error ? err.message : "Unknown error",
      durationMs: Math.round(performance.now() - startTime),
    });
  }

  return {
    results,
    environmentVariables: updatedEnv,
    executionTimeMs: Math.round(performance.now() - startTime),
  };
}

export const executorService = {
  async execute(payload: ExecuteRequestPayload): Promise<ExecutionResponseData> {
    try {
      const response = await apiClient.post<{ success: boolean; data: ExecutionResponseData }>(
        "/executor/execute",
        payload,
      );
      if (response.data?.data) {
        return response.data.data;
      }
      return response.data as unknown as ExecutionResponseData;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn("Backend executor unavailable or returned error, falling back to direct browser execution:", msg);
      return clientSideExecute(payload);
    }
  },

  async runTests(
    script: string,
    response: {
      status: number;
      statusText: string;
      headers: Record<string, string>;
      data: string | Record<string, unknown>;
      responseTime?: number;
    },
    environmentVariables: Record<string, string> = {},
  ): Promise<TestRunnerResponse> {
    try {
      const apiRes = await apiClient.post<{ success: boolean; data: TestRunnerResponse }>(
        "/runner/run",
        {
          script,
          response: {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
            data: response.data,
          },
          environmentVariables,
        },
      );
      if (apiRes.data?.data) {
        return apiRes.data.data;
      }
      return apiRes.data as unknown as TestRunnerResponse;
    } catch {
      // Run locally
      return executeTestScript(script, response, environmentVariables);
    }
  },
};
