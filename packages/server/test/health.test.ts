import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getHealthStatus, SERVER_VERSION } from '../src/index.js';
import { createServerApp, type ServerAppInstance } from '../src/app.js';
import { MAX_ROOMS } from '../src/config.js';

describe('Server health check', () => {
  let serverInstance: ServerAppInstance;
  let serverUrl: string;

  beforeAll(async () => {
    serverInstance = createServerApp();
    await serverInstance.gameServer.listen(0);
    const addr = serverInstance.httpServer.address();
    if (typeof addr === 'object' && addr !== null) {
      serverUrl = `http://localhost:${addr.port}`;
    }
  });

  afterAll(async () => {
    await serverInstance.gameServer.gracefullyShutdown(false);
  });

  it('returns ok status, version, memory, and room limits via getHealthStatus', () => {
    const health = getHealthStatus();
    expect(health.status).toBe('ok');
    expect(health.version).toBe(SERVER_VERSION);
    expect(health.maxRooms).toBe(MAX_ROOMS);
    expect(health.memory.rssMb).toBeGreaterThan(0);
    expect(health.memory.heapTotalMb).toBeGreaterThan(0);
    expect(health.timestamp).toBeGreaterThan(0);
  });

  it('serves /health HTTP endpoint with active rooms count and memory stats', async () => {
    const res = await fetch(`${serverUrl}/health`);
    expect(res.status).toBe(200);
    const data = await res.json();

    expect(data.status).toBe('ok');
    expect(data.version).toBe(SERVER_VERSION);
    expect(data.activeRooms).toBeGreaterThanOrEqual(0);
    expect(data.maxRooms).toBe(MAX_ROOMS);
    expect(data.memory).toBeDefined();
    expect(data.memory.rssMb).toBeGreaterThan(0);
  });
});
