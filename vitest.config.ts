import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 15000, // 15 seconds allowance for network/database calls
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});