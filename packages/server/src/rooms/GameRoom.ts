import { Room, Client, matchMaker } from 'colyseus';
import crypto from 'node:crypto';
import type { GameState, Player, TokenId, RoomSettings, ClientAction } from '@uzmonopoly/shared';
import { TOKENS, PLAYER_COLORS, ClientActionSchema } from '@uzmonopoly/shared';
import {
  createInitialGameState,
  applyAction,
  decideBotAction,
  createPRNG,
  getCurrentPlayer,
} from '@uzmonopoly/engine';
import { generateRoomCode } from '../utils/roomCode.js';
import { DEFAULT_TURN_TIMEOUT, RECONNECTION_TIMEOUT, MAX_ROOMS } from '../config.js';

export interface LobbyPlayer {
  id: string;
  name: string;
  token: TokenId;
  color: string;
  isReady: boolean;
  isHost: boolean;
  reconnectToken: string;
  isBot?: boolean;
}

export interface GameRoomOptions {
  playerName: string;
  roomCode?: string;
  maxPlayers?: number;
  isPrivate?: boolean;
  turnTimeoutSec?: number;
  mode?: 'full' | 'short';
  reconnectToken?: string;
}

export class GameRoom extends Room {
  public roomCode!: string;
  public isPrivate = false;
  public maxPlayers = 6;
  public turnTimeoutSec = DEFAULT_TURN_TIMEOUT;
  public mode: 'full' | 'short' = 'full';

  public inGame = false;
  public lobbyPlayers: LobbyPlayer[] = [];
  public gameState?: GameState;

  private rng = createPRNG(Date.now());
  private turnTimer?: NodeJS.Timeout;
  private auctionTimer?: NodeJS.Timeout;
  private botMoveTimer?: NodeJS.Timeout;
  private reconnectTimers = new Map<string, NodeJS.Timeout>();
  private clientToPlayerId = new Map<string, string>();

  async onCreate(options: GameRoomOptions) {
    const existingRooms = await matchMaker.query({});
    if (existingRooms.length >= MAX_ROOMS) {
      throw new Error(`Server room capacity reached (max ${MAX_ROOMS} rooms)`);
    }

    this.roomCode = options.roomCode || generateRoomCode();
    this.isPrivate = options.isPrivate ?? false;
    this.maxPlayers = Math.max(2, Math.min(6, options.maxPlayers ?? 6));
    this.turnTimeoutSec = options.turnTimeoutSec ?? DEFAULT_TURN_TIMEOUT;
    this.mode = options.mode ?? 'full';
    this.maxClients = this.maxPlayers;

    this.setMetadata({
      roomCode: this.roomCode,
      isPrivate: this.isPrivate,
      maxPlayers: this.maxPlayers,
      inGame: false,
    });

    // Handle all messages via protocol schema validation
    this.onMessage('*', (client, type, message) => {
      this.handleClientMessage(client, String(type), message);
    });
  }

  onJoin(client: Client, options: GameRoomOptions) {
    // 1. Check if reconnecting to an active game
    if (this.inGame && this.gameState) {
      if (options.reconnectToken) {
        const matchingPlayer = this.gameState.players.find(
          (p) =>
            this.lobbyPlayers.find((lp) => lp.id === p.id)?.reconnectToken ===
            options.reconnectToken,
        );

        if (matchingPlayer) {
          // Reconnect player
          this.clientToPlayerId.set(client.sessionId, matchingPlayer.id);
          matchingPlayer.connected = true;

          // Cancel disconnect timer
          const existingTimer = this.reconnectTimers.get(matchingPlayer.id);
          if (existingTimer) {
            clearTimeout(existingTimer);
            this.reconnectTimers.delete(matchingPlayer.id);
          }

          setTimeout(() => {
            try {
              client.send('init', {
                playerId: matchingPlayer.id,
                reconnectToken: options.reconnectToken,
                roomCode: this.roomCode,
              });
              if (this.gameState) {
                client.send('state', this.gameState);
              }
            } catch {
              // client disconnected
            }
          }, 15);

          this.broadcast('state', this.gameState);
          return;
        }
      }
      throw new Error('Game is already in progress');
    }

    // 2. Joining lobby
    if (this.lobbyPlayers.length >= this.maxPlayers) {
      throw new Error('Room is full');
    }

    const playerId = client.sessionId;
    const reconnectToken = options.reconnectToken || crypto.randomUUID();
    const isHost = this.lobbyPlayers.length === 0;

    // Pick first unused token
    const usedTokens = new Set(this.lobbyPlayers.map((p) => p.token));
    const token = TOKENS.find((t) => !usedTokens.has(t.id))?.id ?? 'doppi';

    // Pick first unused color
    const usedColors = new Set(this.lobbyPlayers.map((p) => p.color));
    const color = PLAYER_COLORS.find((c) => !usedColors.has(c)) ?? '#EF4444';

    const player: LobbyPlayer = {
      id: playerId,
      name: (options.playerName || `Player ${this.lobbyPlayers.length + 1}`).slice(0, 20),
      token,
      color,
      isReady: isHost, // Host is ready by default
      isHost,
      reconnectToken,
    };

    this.lobbyPlayers.push(player);
    this.clientToPlayerId.set(client.sessionId, playerId);

    setTimeout(() => {
      try {
        client.send('init', {
          playerId,
          reconnectToken,
          roomCode: this.roomCode,
        });
        this.broadcastLobbyUpdate();
      } catch {
        // client disconnected
      }
    }, 15);
  }

  async onLeave(client: Client, code?: number) {
    const playerId = this.clientToPlayerId.get(client.sessionId);
    if (!playerId) return;

    if (!this.inGame) {
      // In lobby: remove player
      this.lobbyPlayers = this.lobbyPlayers.filter((p) => p.id !== playerId);
      if (this.lobbyPlayers.length > 0 && !this.lobbyPlayers.some((p) => p.isHost)) {
        this.lobbyPlayers[0]!.isHost = true;
        this.lobbyPlayers[0]!.isReady = true;
      }
      this.broadcastLobbyUpdate();
    } else if (this.gameState) {
      // In game: mark disconnected
      const player = this.gameState.players.find((p) => p.id === playerId);
      if (!player) return;

      player.connected = false;
      this.broadcast('state', this.gameState);

      const consented = code === 1000 || code === 4000 || code === 4001;
      if (consented) {
        // Left voluntarily: replace with bot immediately
        player.isBot = true;
        this.broadcast('state', this.gameState);
        this.checkAndTriggerBotTurn();
      } else {
        // Disconnected: allow 60 seconds to reconnect
        const timer = setTimeout(() => {
          player.isBot = true;
          this.reconnectTimers.delete(playerId);
          this.broadcast('state', this.gameState!);
          this.checkAndTriggerBotTurn();
        }, RECONNECTION_TIMEOUT * 1000);

        this.reconnectTimers.set(playerId, timer);
      }
    }
  }

  onDispose() {
    if (this.turnTimer) clearTimeout(this.turnTimer);
    if (this.auctionTimer) clearTimeout(this.auctionTimer);
    if (this.botMoveTimer) clearTimeout(this.botMoveTimer);
    for (const timer of this.reconnectTimers.values()) {
      clearTimeout(timer);
    }
    this.reconnectTimers.clear();
  }

  private broadcastLobbyUpdate() {
    this.broadcast('lobby_update', {
      roomCode: this.roomCode,
      isPrivate: this.isPrivate,
      maxPlayers: this.maxPlayers,
      players: this.lobbyPlayers,
    });
  }

  private handleClientMessage(client: Client, rawType: string, rawData: unknown) {
    const playerId = this.clientToPlayerId.get(client.sessionId);
    if (!playerId) {
      client.send('error', { code: 'UNAUTHORIZED', message: 'Unknown client session' });
      return;
    }

    const payload = typeof rawData === 'object' && rawData !== null ? rawData : {};
    const message = { type: rawType, ...payload };

    if (message.type === 'requestInit') {
      const lp = this.lobbyPlayers.find((p) => p.id === playerId);
      client.send('init', {
        playerId,
        reconnectToken: lp?.reconnectToken,
        roomCode: this.roomCode,
      });
      if (this.inGame && this.gameState) {
        client.send('state', this.gameState);
      } else {
        this.broadcastLobbyUpdate();
      }
      return;
    }

    // 1. Handle Lobby-specific messages
    if (!this.inGame) {
      this.handleLobbyMessage(client, playerId, message);
      return;
    }

    // 2. Handle In-Game messages
    if (this.inGame && this.gameState) {
      this.handleGameAction(client, playerId, message);
    }
  }

  private handleLobbyMessage(client: Client, playerId: string, message: any) {
    const player = this.lobbyPlayers.find((p) => p.id === playerId);
    if (!player) return;

    if (message.type === 'ready') {
      player.isReady = !player.isReady;
      this.broadcastLobbyUpdate();
      return;
    }

    if (message.type === 'setToken') {
      if (message.token && TOKENS.some((t) => t.id === message.token)) {
        const isTaken = this.lobbyPlayers.some(
          (p) => p.id !== playerId && p.token === message.token,
        );
        if (!isTaken) {
          player.token = message.token;
        }
      }
      if (message.color && typeof message.color === 'string') {
        player.color = message.color;
      }
      this.broadcastLobbyUpdate();
      return;
    }

    if (message.type === 'kickPlayer' && player.isHost) {
      const targetId = message.playerId;
      const targetClient = this.clients.find(
        (c) => this.clientToPlayerId.get(c.sessionId) === targetId,
      );
      if (targetClient && targetId !== playerId) {
        targetClient.leave(4001); // Kicked
      }
      return;
    }

    if (message.type === 'addBot' && player.isHost) {
      if (this.lobbyPlayers.length >= this.maxPlayers) {
        client.send('error', { code: 'ROOM_FULL', message: 'Room has reached max players' });
        return;
      }
      const botIdx = this.lobbyPlayers.filter((p) => p.isBot).length + 1;
      const botNames = ['Bobur Bot', 'Charos Bot', 'Dilnoza Bot', 'Erkin Bot', 'Farrukh Bot'];
      const botName = botNames[botIdx - 1] || `AI Bot ${botIdx}`;

      const availableToken =
        TOKENS.find((t) => !this.lobbyPlayers.some((p) => p.token === t.id))?.id || 'damas';

      const availableColor =
        PLAYER_COLORS.find((c) => !this.lobbyPlayers.some((p) => p.color === c)) || '#10B981';

      const botPlayer: LobbyPlayer = {
        id: `bot-${Date.now().toString(36)}-${botIdx}`,
        name: botName,
        token: availableToken,
        color: availableColor,
        isReady: true,
        isHost: false,
        reconnectToken: `bot-${Date.now().toString(36)}-${botIdx}`,
        isBot: true,
      };

      this.lobbyPlayers.push(botPlayer);
      this.broadcastLobbyUpdate();
      return;
    }

    if (message.type === 'startGame' && player.isHost) {
      if (this.lobbyPlayers.length < 2) {
        client.send('error', { code: 'NOT_ENOUGH_PLAYERS', message: 'Need at least 2 players' });
        return;
      }
      const allReady = this.lobbyPlayers.every((p) => p.isReady || p.isHost);
      if (!allReady) {
        client.send('error', { code: 'PLAYERS_NOT_READY', message: 'All players must be ready' });
        return;
      }

      this.startGame();
    }
  }

  private startGame() {
    const settings: RoomSettings = {
      roomCode: this.roomCode,
      isPrivate: this.isPrivate,
      maxPlayers: this.maxPlayers,
      turnTimeoutSec: this.turnTimeoutSec,
      mode: this.mode,
      shortGameMinutes: 30,
    };

    const playersInput = this.lobbyPlayers.map((p) => ({
      id: p.id,
      name: p.name,
      token: p.token,
      color: p.color,
      isHost: p.isHost,
      isBot: p.isBot,
    }));

    // Server-authoritative random seed
    const seed = crypto.randomInt(1, 2147483647);
    this.rng = createPRNG(seed);
    this.gameState = createInitialGameState(playersInput, settings, this.rng);
    this.inGame = true;

    this.setMetadata({ inGame: true });

    this.broadcast('game_started', { roomCode: this.roomCode });
    this.broadcast('state', this.gameState);

    this.resetTurnTimer();
    this.checkAndTriggerBotTurn();
  }

  private handleGameAction(client: Client, playerId: string, rawAction: unknown) {
    if (!this.gameState) return;

    // Validate with zod
    const parseRes = ClientActionSchema.safeParse(rawAction);
    if (!parseRes.success) {
      client.send('error', {
        code: 'INVALID_ACTION_SCHEMA',
        message: parseRes.error.issues.map((i) => i.message).join('; '),
      });
      return;
    }

    const action = parseRes.data as ClientAction;
    const result = applyAction(this.gameState, playerId, action, this.rng);

    if (!result.success) {
      client.send('error', {
        code: result.code ?? 'ACTION_FAILED',
        message: result.error,
      });
      return;
    }

    this.gameState = result.state;
    this.broadcast('state', this.gameState);

    for (const event of result.events) {
      this.broadcast('event', event);
    }

    if (this.gameState.phase === 'GAME_OVER') {
      this.clearAllTimers();
      return;
    }

    this.resetTurnTimer();
    this.checkAndTriggerBotTurn();
  }

  private checkAndTriggerBotTurn() {
    if (!this.gameState || this.gameState.phase === 'GAME_OVER') return;

    let actingPlayer: Player | undefined;

    if (this.gameState.phase === 'AUCTION' && this.gameState.auction) {
      const activeIds = this.gameState.auction.active;
      const botId = activeIds.find((id) => this.gameState?.players.find((p) => p.id === id)?.isBot);
      if (botId) {
        actingPlayer = this.gameState.players.find((p) => p.id === botId);
      }
    } else if (this.gameState.phase === 'DEBT' && this.gameState.pendingDebt) {
      const debtor = this.gameState.players.find(
        (p) => p.id === this.gameState?.pendingDebt?.debtor,
      );
      if (debtor?.isBot) {
        actingPlayer = debtor;
      }
    } else {
      const current = getCurrentPlayer(this.gameState);
      if (current.isBot) {
        actingPlayer = current;
      }
    }

    if (actingPlayer) {
      if (this.botMoveTimer) clearTimeout(this.botMoveTimer);
      this.botMoveTimer = setTimeout(() => {
        if (!this.gameState || this.gameState.phase === 'GAME_OVER') return;
        const botAction = decideBotAction(this.gameState, actingPlayer!.id);
        const res = applyAction(this.gameState, actingPlayer!.id, botAction, this.rng);

        if (res.success) {
          this.gameState = res.state;
          this.broadcast('state', this.gameState);
          for (const ev of res.events) {
            this.broadcast('event', ev);
          }
          this.resetTurnTimer();
          this.checkAndTriggerBotTurn();
        }
      }, 300); // 300ms realistic delay
    }
  }

  private resetTurnTimer() {
    if (this.turnTimer) clearTimeout(this.turnTimer);
    if (!this.gameState || this.gameState.phase === 'GAME_OVER') return;

    const timeoutMs =
      this.gameState.phase === 'AUCTION'
        ? 20 * 1000 // 20s for auction
        : this.turnTimeoutSec * 1000;

    this.turnTimer = setTimeout(() => {
      this.handleTurnTimeout();
    }, timeoutMs);
  }

  private handleTurnTimeout() {
    if (!this.gameState || this.gameState.phase === 'GAME_OVER') return;

    let actingPlayerId: string;
    if (this.gameState.phase === 'AUCTION' && this.gameState.auction) {
      actingPlayerId = this.gameState.auction.active[0] ?? getCurrentPlayer(this.gameState).id;
    } else if (this.gameState.phase === 'DEBT' && this.gameState.pendingDebt) {
      actingPlayerId = this.gameState.pendingDebt.debtor;
    } else {
      actingPlayerId = getCurrentPlayer(this.gameState).id;
    }

    // Auto action via bot heuristic
    const autoAction = decideBotAction(this.gameState, actingPlayerId);
    const res = applyAction(this.gameState, actingPlayerId, autoAction, this.rng);

    if (res.success) {
      this.gameState = res.state;
      this.broadcast('state', this.gameState);
      for (const ev of res.events) {
        this.broadcast('event', ev);
      }
      this.resetTurnTimer();
      this.checkAndTriggerBotTurn();
    } else {
      // Fallback action
      if (this.gameState.phase === 'AUCTION') {
        applyAction(this.gameState, actingPlayerId, { type: 'passAuction' }, this.rng);
      } else if (this.gameState.phase === 'BUY_DECISION') {
        applyAction(this.gameState, actingPlayerId, { type: 'declineBuy' }, this.rng);
      } else if (this.gameState.phase === 'POST_ROLL') {
        applyAction(this.gameState, actingPlayerId, { type: 'endTurn' }, this.rng);
      }
      this.broadcast('state', this.gameState);
      this.resetTurnTimer();
    }
  }

  private clearAllTimers() {
    if (this.turnTimer) clearTimeout(this.turnTimer);
    if (this.auctionTimer) clearTimeout(this.auctionTimer);
    if (this.botMoveTimer) clearTimeout(this.botMoveTimer);
  }
}
