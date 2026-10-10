import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    testTimeout: 60000,
    pool: 'threads',
    env: {
      PM2_DISABLED: '1',
      DISABLE_PM2: '1',
      NODE_ENV: 'test',
    },
    projects: [
      'packages/shared',
      'packages/engine',
      'packages/server',
      'packages/client',
    ],
  },
});
