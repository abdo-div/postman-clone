import { describe, it, expect } from 'vitest';
import { ExecutorService } from '../src/modules/executor/executor.service.js';
import { validateTargetUrl } from '../src/utils/ssrf-guard.js';

describe('SSRF Guard & Executor Engine Suite', () => {
  const executor = new ExecutorService();

  describe('SSRF Guard Security Unit Tests', () => {
    it('should throw error when attempting to access localhost', async () => {
      await expect(validateTargetUrl('http://localhost:3000/api')).rejects.toThrow();
    });

    it('should throw error when target URL resolves to IPv4 loopback (127.0.0.1)', async () => {
      await expect(validateTargetUrl('http://127.0.0.1/admin')).rejects.toThrow();
    });

    it('should throw error on AWS/Cloud metadata IP (169.254.169.254)', async () => {
      await expect(validateTargetUrl('http://169.254.169.254/latest/meta-data/')).rejects.toThrow();
    });

    it('should allow valid public HTTP/HTTPS endpoints', async () => {
      await expect(validateTargetUrl('https://httpbin.org/get')).resolves.not.toThrow();
    });
  });

  describe('Executor Engine Integration Tests', () => {
    it('should resolve mustache variables and fire HTTP GET request successfully', async () => {
      const result = await executor.execute({
        url: 'https://httpbin.org/get?param={{testKey}}',
        method: 'GET',
        headers: { 'X-Custom-Header': '{{headerVal}}' },
        environmentVariables: {
          testKey: 'helloWorld',
          headerVal: 'activeSession',
        },
        timeoutMs: 10000,
      });

      expect(result.status).toBe(200);
      expect(result.metrics.durationMs).toBeGreaterThan(0);
      expect(result.metrics.sizeBytes).toBeGreaterThan(0);
    });

   it('should enforce execution timeout when target host hangs', async () => {
  await expect(
    executor.execute({
      url: 'https://httpbin.org/delay/5',
      method: 'GET',
      headers: {},
      environmentVariables: {},
      timeoutMs: 1000,
    })
  ).rejects.toThrow(/timed out/i);
});
  });
});