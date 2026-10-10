export const SERVER_VERSION = '0.1.0';

export function getHealthStatus() {
  return {
    status: 'ok',
    version: SERVER_VERSION,
    uptime: process.uptime(),
    timestamp: Date.now(),
  };
}
