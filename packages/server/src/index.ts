import { createServerApp } from './app.js';
import { SERVER_PORT } from './config.js';

export const SERVER_VERSION = '0.1.0';

import { MAX_ROOMS } from './config.js';

export function getHealthStatus() {
  const mem = process.memoryUsage();
  return {
    status: 'ok',
    version: SERVER_VERSION,
    uptime: Math.round(process.uptime() * 10) / 10,
    maxRooms: MAX_ROOMS,
    memory: {
      rssMb: Math.round(mem.rss / 1024 / 1024),
      heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
      heapTotalMb: Math.round(mem.heapTotal / 1024 / 1024),
    },
    timestamp: Date.now(),
  };
}

export * from './app.js';
export * from './rooms/GameRoom.js';
export * from './utils/roomCode.js';

// Auto-start if directly executed
if (process.env['NODE_ENV'] !== 'test' && !process.env['VITEST']) {
  const { gameServer } = createServerApp();
  gameServer.listen(SERVER_PORT).then(() => {
    console.log(`[UzMonopoly Server] Running on http://localhost:${SERVER_PORT}`);
  });
}
