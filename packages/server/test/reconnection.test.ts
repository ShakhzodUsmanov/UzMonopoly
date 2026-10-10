import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import WebSocket from 'ws';
import { Client as ColyseusClient } from '@colyseus/sdk';
import { createServerApp, type ServerAppInstance } from '../src/app.js';

(globalThis as unknown as { WebSocket: typeof WebSocket }).WebSocket = WebSocket;

describe('Server Reconnection and Bot Takeover', () => {
  let serverInstance: ServerAppInstance;
  let serverPort: number;
  let clientUrl: string;

  beforeAll(async () => {
    serverInstance = createServerApp();
    await serverInstance.gameServer.listen(0);
    const addr = serverInstance.httpServer.address();
    if (typeof addr === 'object' && addr !== null) {
      serverPort = addr.port;
      clientUrl = `http://localhost:${serverPort}`;
    }
  });

  afterAll(async () => {
    await serverInstance.gameServer.gracefullyShutdown(false);
  });

  it('allows player to reconnect to active game using reconnectToken', async () => {
    const client1 = new ColyseusClient(clientUrl);
    const client2 = new ColyseusClient(clientUrl);

    const room1 = await client1.create('game', { playerName: 'Alice' });
    const p1Init = await new Promise<any>((res) => room1.onMessage('init', res));

    const room2 = await client2.joinById(room1.roomId, { playerName: 'Bob' });
    const p2Init = await new Promise<any>((res) => room2.onMessage('init', res));

    room2.send('ready', {});
    await new Promise((r) => setTimeout(r, 100));

    // Register state promise before starting
    const startPromise = new Promise<void>((r) => room1.onMessage('state', () => r()));
    room1.send('startGame', {});
    await startPromise;

    // Bob disconnects with network drop simulation
    const disconnectStatePromise = new Promise<any>((resolve) => {
      room1.onMessage('state', (state) => {
        const bob = state.players.find((p: any) => p.name === 'Bob');
        if (bob && bob.connected === false) {
          resolve(bob);
        }
      });
    });

    await room2.connection.close();
    const bobDisconnected = await disconnectStatePromise;
    expect(bobDisconnected.connected).toBe(false);

    // Bob reconnects using new client session with saved reconnectToken
    const client2Reconnect = new ColyseusClient(clientUrl);
    const reconnectedRoom = await client2Reconnect.joinById(room1.roomId, {
      reconnectToken: p2Init.reconnectToken,
    });

    expect(reconnectedRoom.roomId).toBe(room1.roomId);

    // Verify Bob is now connected again
    const stateAfterReconnect = await new Promise<any>((res) => reconnectedRoom.onMessage('state', res));
    const bobReconnected = stateAfterReconnect.players.find((p: any) => p.name === 'Bob');
    expect(bobReconnected.connected).toBe(true);

    await room1.leave();
    await reconnectedRoom.leave();
  });

  it('replaces player with bot immediately when player leaves voluntarily', async () => {
    const client1 = new ColyseusClient(clientUrl);
    const client2 = new ColyseusClient(clientUrl);

    const room1 = await client1.create('game', { playerName: 'Charlie' });
    const room2 = await client2.joinById(room1.roomId, { playerName: 'Dave' });

    room2.send('ready', {});
    await new Promise((r) => setTimeout(r, 100));

    const startPromise = new Promise<void>((r) => room1.onMessage('state', () => r()));
    room1.send('startGame', {});
    await startPromise;

    // Dave voluntarily leaves
    const botStatePromise = new Promise<any>((resolve) => {
      room1.onMessage('state', (state) => {
        const dave = state.players.find((p: any) => p.name === 'Dave');
        if (dave && dave.isBot === true) {
          resolve(dave);
        }
      });
    });

    await room2.leave();
    const daveBot = await botStatePromise;
    expect(daveBot.isBot).toBe(true);

    await room1.leave();
  });
});
