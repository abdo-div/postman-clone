import vm from "node:vm";
import { RunTestInput, RunnerResponse, TestResult } from "./runner.dto.js";
import { BadRequestError } from "../../errors/app-error.js";

function createExpectation(actual: any) {
  const checkEqual = (expected: any) => {
    if (actual !== expected) {
      throw new Error(`Expected ${JSON.stringify(actual)} to equal ${JSON.stringify(expected)}`);
    }
  };

  const checkDeepEqual = (expected: any) => {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(`Expected ${JSON.stringify(actual)} to equal ${JSON.stringify(expected)}`);
    }
  };

  const toObject: any = {
    equal: checkEqual,
    eql: checkDeepEqual,
    equals: checkEqual,
    be: {
      equal: checkEqual,
      eql: checkDeepEqual,
      equals: checkEqual,
      a: (type: string) => {
        if (typeof actual !== type) {
          throw new Error(`Expected ${JSON.stringify(actual)} to be of type ${type}`);
        }
      },
      an: (type: string) => {
        if (typeof actual !== type) {
          throw new Error(`Expected ${JSON.stringify(actual)} to be of type ${type}`);
        }
      },
      get true() {
        if (actual !== true) throw new Error(`Expected ${JSON.stringify(actual)} to be true`);
        return true;
      },
      get false() {
        if (actual !== false) throw new Error(`Expected ${JSON.stringify(actual)} to be false`);
        return true;
      },
      get null() {
        if (actual !== null) throw new Error(`Expected ${JSON.stringify(actual)} to be null`);
        return true;
      },
      get undefined() {
        if (actual !== undefined) throw new Error(`Expected ${JSON.stringify(actual)} to be undefined`);
        return true;
      },
      get ok() {
        if (!actual) throw new Error(`Expected ${JSON.stringify(actual)} to be truthy`);
        return true;
      },
    },
    have: {
      status: (expectedStatus: number) => {
        if (actual !== expectedStatus && actual?.status !== expectedStatus) {
          throw new Error(`Expected status ${expectedStatus}, but got ${actual?.status ?? actual}`);
        }
      },
      property: (propName: string, propVal?: any) => {
        if (actual == null || !(propName in actual)) {
          throw new Error(`Expected object to have property '${propName}'`);
        }
        if (propVal !== undefined && actual[propName] !== propVal) {
          throw new Error(`Expected property '${propName}' to equal ${JSON.stringify(propVal)}`);
        }
      },
      length: (len: number) => {
        if (actual?.length !== len) {
          throw new Error(`Expected length ${len}, but got ${actual?.length}`);
        }
      },
      lengthOf: (len: number) => {
        if (actual?.length !== len) {
          throw new Error(`Expected length ${len}, but got ${actual?.length}`);
        }
      },
    },
    include: (val: any) => {
      if (typeof actual === "string" || Array.isArray(actual)) {
        if (!actual.includes(val)) {
          throw new Error(`Expected ${JSON.stringify(actual)} to include ${JSON.stringify(val)}`);
        }
      } else {
        throw new Error(`Cannot check inclusion on ${typeof actual}`);
      }
    },
    contain: (val: any) => {
      if (typeof actual === "string" || Array.isArray(actual)) {
        if (!actual.includes(val)) {
          throw new Error(`Expected ${JSON.stringify(actual)} to contain ${JSON.stringify(val)}`);
        }
      } else {
        throw new Error(`Cannot check inclusion on ${typeof actual}`);
      }
    },
  };

  return {
    toBe: checkEqual,
    toEqual: checkDeepEqual,
    toBeTruthy: () => {
      if (!actual) throw new Error(`Expected ${JSON.stringify(actual)} to be truthy`);
    },
    toBeFalsy: () => {
      if (actual) throw new Error(`Expected ${JSON.stringify(actual)} to be falsy`);
    },
    to: toObject,
  };
}

export class RunnerService {
  public async runScript(input: RunTestInput): Promise<RunnerResponse> {
    const testResults: TestResult[] = [];
    const envVars = { ...(input.environmentVariables || {}) };

    const parsedData = (() => {
      if (typeof input.response.data === "string") {
        try {
          return JSON.parse(input.response.data);
        } catch {
          return input.response.data;
        }
      }
      return input.response.data;
    })();

    const rawBodyString =
      typeof input.response.data === "string"
        ? input.response.data
        : JSON.stringify(input.response.data);

    const responseObj = {
      status: input.response.status,
      code: input.response.status,
      statusText: input.response.statusText,
      headers: input.response.headers || {},
      data: parsedData,
      json: () => parsedData,
      text: () => rawBodyString,
      to: {
        have: {
          status: (expectedStatus: number) => {
            if (input.response.status !== expectedStatus) {
              throw new Error(
                `Expected response status ${expectedStatus} but received ${input.response.status}`,
              );
            }
          },
        },
      },
    };

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
      expect: (actual: any) => createExpectation(actual),
      response: responseObj,
      environment: {
        get: (key: string) => envVars[key],
        set: (key: string, value: any) => {
          envVars[key] = String(value);
        },
        has: (key: string) => Object.prototype.hasOwnProperty.call(envVars, key),
        unset: (key: string) => {
          delete envVars[key];
        },
      },
      variables: {
        get: (key: string) => envVars[key],
        set: (key: string, value: any) => {
          envVars[key] = String(value);
        },
      },
    };

    // Create secure context (isolate from process/global Node APIs)
    const sandbox = {
      pm,
      response: responseObj,
      responseBody: rawBodyString,
      responseCode: {
        code: input.response.status,
        name: input.response.statusText,
      },
      console: {
        log: () => {},
        warn: () => {},
        error: () => {},
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
