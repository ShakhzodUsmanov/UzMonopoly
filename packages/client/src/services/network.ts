import { Client as ColyseusClient, type Room } from '@colyseus/sdk';
import type { GameState, GameEvent, ClientAction, TokenId } from '@uzmonopoly/shared';
import {
  createInitialGameState,
  applyAction,
  decideBotAction,
  createPRNG,
  getCurrentPlayer,
} from '@uzmonopoly/engine';

export interface LobbyInfo {
  roomCode: string;
  isPrivate: boolean;
  maxPlayers: number;
  players: {
    id: string;
    name: string;
    token: TokenId;
    color: string;
    isReady: boolean;
    isHost: boolean;
  }[];
}

export function resolveServerUrl(): string {
  if (typeof import.meta !== 'undefined' && import.meta.env?.['VITE_SERVER_URL']) {
    return import.meta.env['VITE_SERVER_URL'];
  }
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:2567';
    }
    // Production default: connect to same host with appropriate protocol
    return window.location.origin;
  }
  return 'http://localhost:2567';
}

export const SERVER_URL = resolveServerUrl();

export class NetworkService {
  private client: ColyseusClient;
  private room?: Room;
  private isSoloMode = false;
  private localGameState?: GameState;
  private localRng = createPRNG(Date.now());

  public onStateUpdate?: (state: GameState) => void;
  public onLobbyUpdate?: (lobby: LobbyInfo) => void;
  public onGameEvent?: (event: GameEvent) => void;
  public onChatMessage?: (msg: { id: string; sender: string; text: string; color: string; time: string }) => void;
  public onError?: (error: { code: string; message: string }) => void;

  constructor() {
    this.client = new ColyseusClient(SERVER_URL);
  }

  public get inGame(): boolean {
    return !!(this.localGameState || (this.room && this.room.state));
  }

  // --- 1. Online Colyseus Room Methods ---
  public async createOnlineRoom(
    playerName: string,
    maxPlayers = 4,
    isPrivate = false,
    mode: 'full' | 'short' = 'full',
  ): Promise<string> {
    this.isSoloMode = false;
    const room = await this.client.create('game', {
      playerName,
      maxPlayers,
      isPrivate,
      mode,
    });
    this.attachRoomListeners(room);
    this.room = room;
    return room.roomId;
  }

  public async joinOnlineRoom(roomCodeOrId: string, playerName: string): Promise<string> {
    this.isSoloMode = false;
    const room = await this.client.joinById(roomCodeOrId, {
      playerName,
    });
    this.attachRoomListeners(room);
    this.room = room;
    return room.roomId;
  }

  private attachRoomListeners(room: Room) {
    room.onMessage('init', (data: any) => {
      if (data.reconnectToken) {
        localStorage.setItem('uzmonopoly_reconnect_token', data.reconnectToken);
        localStorage.setItem('uzmonopoly_room_id', room.roomId);
      }
    });

    room.onMessage('lobby_update', (data: LobbyInfo) => {
      this.onLobbyUpdate?.(data);
    });

    room.onMessage('state', (state: GameState) => {
      this.onStateUpdate?.(state);
    });

    room.onMessage('event', (ev: GameEvent) => {
      this.onGameEvent?.(ev);
    });

    room.onMessage('chat', (msg: any) => {
      this.onChatMessage?.(msg);
    });

    room.onMessage('error', (err: any) => {
      this.onError?.(err);
    });
  }

  public sendAction(action: ClientAction | { type: string; [k: string]: any }) {
    if (this.isSoloMode) {
      this.handleLocalAction(action as ClientAction);
      return;
    }

    if (this.room) {
      this.room.send(action.type, action);
    }
  }

  public leave() {
    if (this.room) {
      this.room.leave();
      this.room = undefined;
    }
    this.isSoloMode = false;
    this.localGameState = undefined;
  }

  // --- 2. Offline / Solo Sandbox Mode vs 3 AI Bots ---
  public startSoloGame(
    playerName: string,
    myToken: TokenId = 'doppi',
    mode: 'full' | 'short' = 'full',
  ) {
    this.isSoloMode = true;
    const players = [
      { id: 'player-me', name: playerName, token: myToken, color: '#3B82F6', isHost: true },
      { id: 'bot-1', name: 'Bobur Bot', token: 'choynak' as TokenId, color: '#10B981', isHost: false },
      { id: 'bot-2', name: 'Charos Bot', token: 'qozon' as TokenId, color: '#F59E0B', isHost: false },
      { id: 'bot-3', name: 'Dilnoza Bot', token: 'tarvuz' as TokenId, color: '#EF4444', isHost: false },
    ];

    this.localRng = createPRNG(Date.now());
    this.localGameState = createInitialGameState(
      players,
      {
        roomCode: 'SOLO1',
        isPrivate: true,
        maxPlayers: 4,
        turnTimeoutSec: 60,
        mode,
        shortGameMinutes: 30,
      },
      this.localRng,
    );

    // Mark other players as bots
    for (let i = 1; i < this.localGameState.players.length; i++) {
      this.localGameState.players[i]!.isBot = true;
    }

    this.onStateUpdate?.(this.localGameState);
  }

  private handleLocalAction(action: ClientAction) {
    if (!this.localGameState) return;

    const actingPlayer = getCurrentPlayer(this.localGameState);
    const result = applyAction(this.localGameState, actingPlayer.id, action, this.localRng);

    if (!result.success) {
      this.onError?.({ code: result.code || 'ACTION_FAILED', message: result.error });
      return;
    }

    this.localGameState = result.state;
    this.onStateUpdate?.(this.localGameState);

    for (const ev of result.events) {
      this.onGameEvent?.(ev);
    }

    // Step AI bots automatically if it's a bot's turn
    this.checkAndStepLocalBots();
  }

  private checkAndStepLocalBots() {
    if (!this.localGameState || this.localGameState.phase === 'GAME_OVER') return;

    const current = getCurrentPlayer(this.localGameState);
    if (current.isBot) {
      setTimeout(() => {
        if (!this.localGameState || this.localGameState.phase === 'GAME_OVER') return;
        const botAction = decideBotAction(this.localGameState, current.id);
        this.handleLocalAction(botAction);
      }, 450);
    }
  }
}

export const networkService = new NetworkService();
