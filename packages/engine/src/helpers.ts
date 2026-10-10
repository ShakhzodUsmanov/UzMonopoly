import type {
  GameState,
  Player,
  TileDefinition,
  TileState,
  GameEvent,
  LocalizedText,
} from '@uzmonopoly/shared';
import { BOARD_TILES, getTileByIndex, getTilesByGroup } from './data/board.js';
import { GAME_CONFIG, calculateMortgageValue } from './data/config.js';

export function cloneState(state: GameState): GameState {
  return structuredClone(state);
}

export function getCurrentPlayer(state: GameState): Player {
  const player = state.players[state.turnIndex];
  if (!player) {
    throw new Error(`Current player at turn index ${state.turnIndex} not found`);
  }
  return player;
}

export function getPlayer(state: GameState, playerId: string): Player | undefined {
  return state.players.find((p) => p.id === playerId);
}

export function getTileDef(index: number): TileDefinition {
  return getTileByIndex(index);
}

export function getTileState(state: GameState, index: number): TileState {
  const ts = state.tiles[index];
  if (!ts) {
    throw new Error(`Tile state for index ${index} not found`);
  }
  return ts;
}

export function ownsEntireGroup(state: GameState, playerId: string, groupId: string): boolean {
  const groupTiles = getTilesByGroup(groupId);
  if (groupTiles.length === 0) return false;
  return groupTiles.every((t) => state.tiles[t.index]?.ownerId === playerId);
}

export function hasAnyMortgagedInGroup(state: GameState, groupId: string): boolean {
  const groupTiles = getTilesByGroup(groupId);
  return groupTiles.some((t) => state.tiles[t.index]?.mortgaged);
}

export function getGroupHouseLevels(state: GameState, groupId: string): number[] {
  const groupTiles = getTilesByGroup(groupId);
  return groupTiles.map((t) => state.tiles[t.index]?.houses ?? 0);
}

export function countBankBuildingsUsed(state: GameState): {
  houses: number;
  hotels: number;
} {
  let houses = 0;
  let hotels = 0;
  for (const t of Object.values(state.tiles)) {
    if (t.houses === GAME_CONFIG.hotelLevel) {
      hotels++;
    } else if (t.houses > 0) {
      houses += t.houses;
    }
  }
  return { houses, hotels };
}

export function getNextActivePlayerIndex(state: GameState, currentIndex: number): number {
  const n = state.players.length;
  let next = (currentIndex + 1) % n;
  let loops = 0;
  while (state.players[next]?.bankrupt && loops < n) {
    next = (next + 1) % n;
    loops++;
  }
  return next;
}

export function checkGameOver(state: GameState): {
  isGameOver: boolean;
  winnerId?: string;
} {
  const activePlayers = state.players.filter((p) => !p.bankrupt);
  if (activePlayers.length <= 1) {
    return {
      isGameOver: true,
      winnerId: activePlayers[0]?.id,
    };
  }
  return { isGameOver: false };
}

export function calculateNetWorth(state: GameState, playerId: string): number {
  const player = getPlayer(state, playerId);
  if (!player) return 0;
  let netWorth = player.cash;

  for (const [idxStr, ts] of Object.entries(state.tiles)) {
    if (ts.ownerId === playerId) {
      const idx = Number(idxStr);
      const def = BOARD_TILES[idx];
      if (def?.price) {
        netWorth += ts.mortgaged ? calculateMortgageValue(def.price) : def.price;
      }
      if (def?.houseCost && ts.houses > 0) {
        netWorth += ts.houses * def.houseCost;
      }
    }
  }

  return netWorth;
}

export function createEvent(
  state: GameState,
  type: string,
  message: LocalizedText,
  playerId?: string,
  data?: Record<string, unknown>,
): GameEvent {
  const seq = state.seq + 1;
  state.seq = seq;
  return {
    id: `ev-${seq}-${Date.now().toString(36)}`,
    seq,
    timestamp: 0,
    type,
    playerId,
    message,
    data,
  };
}
