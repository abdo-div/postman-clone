import { describe, it, expect } from 'vitest';
import { RunnerService } from '../src/modules/runner/runner.service.js';

describe('Sandboxed Node VM Runner Service Suite', () => {
  const runner = new RunnerService();

  it('should evaluate assertions and mutate active environment variables', async () => {
    const script = `
      pm.test("Status code is 200", function () {
        pm.expect(response.status).to.equal(200);
      });

      pm.environment.set("token", "jwt_secret_123");
    `;

    const mockResponse = {
      status: 200,
      statusText: 'OK',
      headers: { 'content-type': 'application/json' },
      data: { success: true },
    };

    const output = await runner.runScript({
      script,
      response: mockResponse,
      environmentVariables: { initialKey: 'initVal' },
      timeoutMs: 2000,
    });

    // Check assertions
    expect(output.results).toHaveLength(1);
    expect(output.results[0].name).toBe('Status code is 200');
    expect(output.results[0].passed).toBe(true);

    // Check variable mutation
    expect(output.environmentVariables.token).toBe('jwt_secret_123');
    expect(output.environmentVariables.initialKey).toBe('initVal');
  });

  it('should record failed test assertions gracefully without throwing runtime error', async () => {
    const script = `
      pm.test("Status code is 201", function () {
        pm.expect(response.status).to.equal(201);
      });
    `;

    const mockResponse = {
      status: 500,
      statusText: 'Internal Error',
      headers: {},
      data: {},
    };

    const output = await runner.runScript({
      script,
      response: mockResponse,
      environmentVariables: {},
      timeoutMs: 2000,
    });

    expect(output.results).toHaveLength(1);
    expect(output.results[0].passed).toBe(false);
    expect(output.results[0].error).toBeDefined();
  });
});