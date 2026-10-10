import { describe, it, expect } from 'vitest';
import { getHealthStatus, SERVER_VERSION } from '../src/index.js';

describe('Server health check', () => {
  it('returns ok status and version', () => {
    const health = getHealthStatus();
    expect(health.status).toBe('ok');
    expect(health.version).toBe(SERVER_VERSION);
    expect(health.timestamp).toBeGreaterThan(0);
  });
});
