import { Server, LobbyRoom, matchMaker } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import express, { type Express } from 'express';
import cors from 'cors';
import http from 'node:http';
import { GameRoom } from './rooms/GameRoom.js';

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
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      version: '0.1.0',
      uptime: process.uptime(),
      timestamp: Date.now(),
    });
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
