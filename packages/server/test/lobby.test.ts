import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import WebSocket from 'ws';
import { Client as ColyseusClient } from '@colyseus/sdk';
import { createServerApp, type ServerAppInstance } from '../src/app.js';

// Polyfill WebSocket for @colyseus/sdk in Node test environment
(globalThis as unknown as { WebSocket: typeof WebSocket }).WebSocket = WebSocket;

describe('Colyseus Lobby and Room Management', () => {
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

  it('allows host to create room with 5-character code and join', async () => {
    const colyseusClient = new ColyseusClient(clientUrl);
    const room = await colyseusClient.create('game', {
      playerName: 'Alisher Host',
      maxPlayers: 4,
    });

    expect(room.roomId).toBeDefined();

    const initData = await new Promise<any>((resolve) => {
      room.onMessage('init', (data) => resolve(data));
    });

    expect(initData.playerId).toBeDefined();
    expect(initData.roomCode).toHaveLength(5);
    expect(initData.reconnectToken).toBeDefined();

    await room.leave();
  });

  it('supports token selection, ready toggle, kick player, and starting game', async () => {
    const client1 = new ColyseusClient(clientUrl);
    const client2 = new ColyseusClient(clientUrl);
    const client3 = new ColyseusClient(clientUrl);

    // Host creates room
    const hostRoom = await client1.create('game', { playerName: 'Host' });
    const hostInit = await new Promise<any>((res) => hostRoom.onMessage('init', res));
    expect(hostInit.roomCode).toBeDefined();

    // Player 2 joins
    const p2Room = await client2.joinById(hostRoom.roomId, { playerName: 'Player 2' });

    // Player 3 joins
    const p3Room = await client3.joinById(hostRoom.roomId, { playerName: 'Player 3' });

    // Wait for lobby updates
    let _latestLobby: any;
    hostRoom.onMessage('lobby_update', (data) => {
      _latestLobby = data;
    });

    // P2 chooses token 'choynak'
    p2Room.send('setToken', { token: 'choynak', color: '#10B981' });

    // P2 toggles ready
    p2Room.send('ready', {});

    // P3 was joined by accident, host kicks P3
    const p3KickedPromise = new Promise<number>((resolve) => {
      p3Room.onLeave((code) => resolve(code));
    });

    const p3Id = await new Promise<any>((res) => p3Room.onMessage('init', res)).then(
      (d) => d.playerId,
    );
    hostRoom.send('kickPlayer', { playerId: p3Id });

    const p3LeaveCode = await p3KickedPromise;
    expect(p3LeaveCode).toBe(4001);

    // Wait 100ms for state to settle
    await new Promise((r) => setTimeout(r, 100));

    // Host starts game
    const gameStartedPromise = new Promise<void>((resolve) => {
      hostRoom.onMessage('game_started', () => resolve());
    });
    const hostStatePromise = new Promise<any>((resolve) => {
      hostRoom.onMessage('state', (res) => resolve(res));
    });

    hostRoom.send('startGame', {});
    await gameStartedPromise;
    const hostState = await hostStatePromise;

    expect(hostState.phase).toBe('ROLL');
    expect(hostState.players).toHaveLength(2);
    expect(hostState.players[0].name).toBe('Host');
    expect(hostState.players[1].name).toBe('Player 2');

    await hostRoom.leave();
    await p2Room.leave();
  });
});
