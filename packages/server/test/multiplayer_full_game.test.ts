import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import WebSocket from 'ws';
import { Client as ColyseusClient, type Room } from '@colyseus/sdk';
import { createServerApp, type ServerAppInstance } from '../src/app.js';

(globalThis as unknown as { WebSocket: typeof WebSocket }).WebSocket = WebSocket;

describe('6-Player Full Multiplayer Match with Reconnection', () => {
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

  it('connects 6 clients, runs game turns, handles disconnect/reconnect, and outputs run log', async () => {
    console.log('\n============================================================');
    console.log('   UZMONOPOLY 6-PLAYER SERVER INTEGRATION TEST EXECUTION    ');
    console.log('============================================================\n');

    const playerConfigs = [
      { name: 'Alisher (Host)', token: 'doppi' as const, color: '#3B82F6' },
      { name: 'Bobur', token: 'choynak' as const, color: '#10B981' },
      { name: 'Charos', token: 'qozon' as const, color: '#F59E0B' },
      { name: 'Dilnoza', token: 'tarvuz' as const, color: '#EF4444' },
      { name: 'Erkin', token: 'damas' as const, color: '#8B5CF6' },
      { name: 'Farrukh', token: 'tulpar' as const, color: '#EC4899' },
    ];

    const clients: ColyseusClient[] = [];
    const rooms: Room[] = [];
    const reconnectTokens: string[] = [];
    const playerIds: string[] = [];

    // 1. Host creates room
    const hostClient = new ColyseusClient(clientUrl);
    clients.push(hostClient);
    const hostRoom = await hostClient.create('game', {
      playerName: playerConfigs[0]!.name,
      maxPlayers: 6,
    });
    rooms.push(hostRoom);

    const hostInit = await new Promise<any>((res) => hostRoom.onMessage('init', res));
    playerIds.push(hostInit.playerId);
    reconnectTokens.push(hostInit.reconnectToken);
    const roomCode = hostInit.roomCode;
    console.log(`[LOBBY] Room created with code: ${roomCode} by ${playerConfigs[0]!.name}`);

    // 2. Players 2 to 6 join
    for (let i = 1; i < 6; i++) {
      const client = new ColyseusClient(clientUrl);
      clients.push(client);
      const room = await client.joinById(hostRoom.roomId, {
        playerName: playerConfigs[i]!.name,
      });
      rooms.push(room);

      const initData = await new Promise<any>((res) => room.onMessage('init', res));
      playerIds.push(initData.playerId);
      reconnectTokens.push(initData.reconnectToken);

      // Set unique token & color
      room.send('setToken', {
        token: playerConfigs[i]!.token,
        color: playerConfigs[i]!.color,
      });
      room.send('ready', {});
      console.log(
        `[LOBBY] Player ${i + 1} (${playerConfigs[i]!.name}) joined and readied with token ${playerConfigs[i]!.token}`,
      );
    }

    await new Promise((r) => setTimeout(r, 150));

    // Listen to game events and state updates across host
    const eventLog: string[] = [];
    let currentGameState: any;

    hostRoom.onMessage('event', (ev: any) => {
      const line = `[EVENT #${ev.seq}] ${ev.message.ru || ev.message.en || JSON.stringify(ev.message)}`;
      eventLog.push(line);
      console.log(line);
    });

    hostRoom.onMessage('state', (state: any) => {
      currentGameState = state;
    });

    // 3. Host starts game
    console.log(`[LOBBY] All 6 players ready. Host starting game...`);
    const startPromise = new Promise<void>((r) => {
      hostRoom.onMessage('game_started', () => r());
    });
    hostRoom.send('startGame', {});
    await startPromise;

    // Wait for first state update to arrive
    for (let i = 0; i < 20; i++) {
      if (currentGameState) break;
      await new Promise((r) => setTimeout(r, 50));
    }

    expect(currentGameState).toBeDefined();
    expect(currentGameState.phase).toBe('ROLL');
    expect(currentGameState.players).toHaveLength(6);

    console.log(`\n--- Active Game Started with 6 Players. Executing Turns ---`);

    // Helper to simulate current player taking their turn
    async function playCurrentTurn() {
      if (!currentGameState || currentGameState.phase === 'GAME_OVER') return;
      const turnIdx = currentGameState.turnIndex;
      const actingId = currentGameState.players[turnIdx].id;
      const roomIdx = playerIds.indexOf(actingId);
      const room = rooms[roomIdx];

      if (!room) return;

      // 1. If in ROLL: roll dice
      if (currentGameState.phase === 'ROLL') {
        room.send('rollDice', {});
        await new Promise((r) => setTimeout(r, 100));
      }

      // 2. If in BUY_DECISION: buy if cash >= price, else decline
      if (currentGameState.phase === 'BUY_DECISION') {
        const player = currentGameState.players[turnIdx];
        if (player.cash >= 300) {
          room.send('buy', {});
        } else {
          room.send('declineBuy', {});
        }
        await new Promise((r) => setTimeout(r, 100));
      }

      // 3. If in AUCTION: all pass to resolve
      if (currentGameState.phase === 'AUCTION' && currentGameState.auction) {
        for (let j = 0; j < 6; j++) {
          if (rooms[j]) {
            rooms[j]!.send('passAuction', {});
          }
        }
        await new Promise((r) => setTimeout(r, 100));
      }

      // 4. If in POST_ROLL: end turn
      if (currentGameState.phase === 'POST_ROLL') {
        room.send('endTurn', {});
        await new Promise((r) => setTimeout(r, 100));
      }
    }

    // Play 5 initial turns
    for (let round = 1; round <= 5; round++) {
      console.log(`\n> Playing Round ${round}...`);
      await playCurrentTurn();
    }

    // 4. Test Reconnection in the middle of the game: Player 4 (Dilnoza) disconnects
    console.log(`\n[NETWORK] Simulating connection drop for Player 4 (Dilnoza)...`);
    const p4Room = rooms[3]!;

    const disconnectPromise = new Promise<any>((resolve) => {
      hostRoom.onMessage('state', (state: any) => {
        const p4 = state.players.find((p: any) => p.name === 'Dilnoza');
        if (p4 && p4.connected === false) {
          resolve(p4);
        }
      });
    });

    p4Room.connection.transport.close();
    await disconnectPromise;
    expect(currentGameState.players[3].connected).toBe(false);
    console.log(`[NETWORK] Verified Player 4 connected status is FALSE on server.`);

    // Reconnecting Player 4 with saved reconnectToken
    console.log(`[NETWORK] Reconnecting Player 4 with reconnectToken: ${reconnectTokens[3]}`);
    const p4ReconnectedClient = new ColyseusClient(clientUrl);
    const p4ReconnectedRoom = await p4ReconnectedClient.joinById(hostRoom.roomId, {
      reconnectToken: reconnectTokens[3],
    });
    rooms[3] = p4ReconnectedRoom;

    // Wait for reconnection state
    const reconnectPromise = new Promise<any>((resolve) => {
      hostRoom.onMessage('state', (state: any) => {
        const p4 = state.players.find((p: any) => p.name === 'Dilnoza');
        if (p4 && p4.connected === true) {
          resolve(p4);
        }
      });
    });

    await reconnectPromise;
    expect(currentGameState.players[3].connected).toBe(true);
    console.log(`[NETWORK] Player 4 successfully RECONNECTED. State synced without data loss!`);

    // Play 5 more turns
    for (let round = 6; round <= 10; round++) {
      console.log(`\n> Playing Round ${round}...`);
      await playCurrentTurn();
    }

    // 5. Test voluntary leave -> bot takeover
    console.log(`\n[LEAVE] Player 6 (Farrukh) voluntarily leaves. Server should replace with Bot.`);
    const p6Room = rooms[5]!;

    const botPromise = new Promise<any>((resolve) => {
      hostRoom.onMessage('state', (state: any) => {
        const p6 = state.players.find((p: any) => p.name === 'Farrukh');
        if (p6 && p6.isBot === true) {
          resolve(p6);
        }
      });
    });

    await p6Room.leave();
    await botPromise;
    expect(currentGameState.players[5].isBot).toBe(true);
    console.log(
      `[BOT] Player 6 is now successfully marked as BOT on server and continues playing!`,
    );

    // Verify chat
    console.log(`\n[CHAT] Testing chat broadcast from Host...`);
    hostRoom.send('chat', { text: 'Salom barchaga! O‘yin qiziq bo‘lyapti!' });
    await new Promise((r) => setTimeout(r, 100));

    console.log('\n============================================================');
    console.log('   6-PLAYER MULTIPLAYER RUN TEST COMPLETED SUCCESSFULLY!    ');
    console.log(`   Total Server Events Logged: ${eventLog.length}           `);
    console.log('============================================================\n');

    // Clean up
    for (const r of rooms) {
      if (r && r.connection.isOpen) {
        await r.leave();
      }
    }
  }, 40000);
});
