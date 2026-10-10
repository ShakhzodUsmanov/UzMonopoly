import { createServerApp } from './app.js';
import { SERVER_PORT } from './config.js';

export const SERVER_VERSION = '0.1.0';

export function getHealthStatus() {
  return {
    status: 'ok',
    version: SERVER_VERSION,
    uptime: process.uptime(),
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
