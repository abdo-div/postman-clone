import vm from "node:vm";
import { RunTestInput, RunnerResponse, TestResult } from "./runner.dto.js";
import { BadRequestError } from "../../errors/app-error.js";

export class RunnerService {
  public async runScript(input: RunTestInput): Promise<RunnerResponse> {
    const testResults: TestResult[] = [];
    const envVars = { ...(input.environmentVariables || {}) };

    // Define the postman-like assertion sandbox
    const pm = {
      test: (name: string, fn: () => void) => {
        try {
          fn();
          testResults.push({ name, passed: true });
        } catch (err: any) {
          testResults.push({ name, passed: false, error: err.message });
        }
      },
      expect: (actual: any) => ({
        toBe: (expected: any) => {
          if (actual !== expected) {
            throw new Error(
              `Expected ${JSON.stringify(actual)} to be ${JSON.stringify(expected)}`,
            );
          }
        },
        toEqual: (expected: any) => {
          if (JSON.stringify(actual) !== JSON.stringify(expected)) {
            throw new Error(
              `Expected ${JSON.stringify(actual)} to equal ${JSON.stringify(expected)}`,
            );
          }
        },
        toBeTruthy: () => {
          if (!actual) {
            throw new Error(`Expected ${JSON.stringify(actual)} to be truthy`);
          }
        },
      }),
      response: {
        status: input.response.status,
        statusText: input.response.statusText,
        headers: input.response.headers,
        json: () => {
          if (typeof input.response.data === "string") {
            return JSON.parse(input.response.data);
          }
          return input.response.data;
        },
      },
      environment: {
        get: (key: string) => envVars[key],
        set: (key: string, value: string) => {
          envVars[key] = String(value);
        },
      },
    };

    // Create secure context (isolate from process/global Node APIs)
    const sandbox = {
      pm,
      console: {
        log: () => {}, // silences console output inside sandbox
      },
    };

    const context = vm.createContext(sandbox);
    const startTime = performance.now();

    try {
      const script = new vm.Script(input.script);
      script.runInContext(context, { timeout: input.timeoutMs || 3000 });
      const endTime = performance.now();

      return {
        results: testResults,
        environmentVariables: envVars,
        executionTimeMs: Math.round(endTime - startTime),
      };
    } catch (error: any) {
      throw new BadRequestError(`Script execution failed: ${error.message}`);
    }
  }
}
