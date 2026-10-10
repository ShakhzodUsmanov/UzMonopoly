import { Server, LobbyRoom, matchMaker } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import express, { type Express } from 'express';
import cors from 'cors';
import http from 'node:http';
import { GameRoom } from './rooms/GameRoom.js';

import { MAX_ROOMS } from './config.js';

export interface ServerAppInstance {
  app: Express;
  httpServer: http.Server;
  gameServer: Server;
}

export function createServerApp(): ServerAppInstance {
  const app: Express = express();
  app.use(cors());
  app.use(express.json());

  // Healthcheck endpoint
  app.get('/health', async (_req, res) => {
    try {
      const rooms = await matchMaker.query({});
      const mem = process.memoryUsage();
      const activeRooms = rooms.length;
      const status = activeRooms >= MAX_ROOMS ? 'capacity_reached' : 'ok';

      res.json({
        status,
        version: '0.1.0',
        uptime: Math.round(process.uptime() * 10) / 10,
        activeRooms,
        maxRooms: MAX_ROOMS,
        memory: {
          rssMb: Math.round(mem.rss / 1024 / 1024),
          heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
          heapTotalMb: Math.round(mem.heapTotal / 1024 / 1024),
        },
        timestamp: Date.now(),
      });
    } catch (err: unknown) {
      console.error('[HealthCheck Error]', err);
      res.status(500).json({ status: 'error', error: String(err) });
    }
  });

  const httpServer = http.createServer(app);

  const gameServer = new Server({
    transport: new WebSocketTransport({
      server: httpServer,
    }),
  });

  // Define rooms
  gameServer.define('lobby', LobbyRoom);
  gameServer.define('game', GameRoom).enableRealtimeListing();

  // Public rooms API
  app.get('/api/rooms', async (_req, res) => {
    try {
      const rooms = await matchMaker.query({ isPrivate: false });
      res.json(rooms);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      res.status(500).json({ error: msg });
    }
  });

  return { app, httpServer, gameServer };
}
