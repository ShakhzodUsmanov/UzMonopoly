import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 60000,
    pool: 'threads',
    env: {
      PM2_DISABLED: '1',
      DISABLE_PM2: '1',
      NODE_ENV: 'test',
    },
  },
});
