import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    testTimeout: 60000,
    projects: [
      'packages/shared',
      'packages/engine',
      'packages/server',
      'packages/client',
    ],
  },
});
