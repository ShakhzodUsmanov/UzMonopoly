import type { GameState, Player, RoomSettings, TileState, TokenId } from '@uzmonopoly/shared';
import { START_CASH, TOTAL_TILES } from '@uzmonopoly/shared';
import { IMKON_CARDS, XAZINA_CARDS } from '../data/cards.js';
import type { RNG } from '../rng.js';

export interface CreatePlayerInput {
  id: string;
  name: string;
  token: TokenId;
  color: string;
  isBot?: boolean;
  isHost?: boolean;
}

export function createInitialGameState(
  playersInput: CreatePlayerInput[],
  settings: RoomSettings,
  rng: RNG,
): GameState {
  if (playersInput.length < 2 || playersInput.length > 6) {
    throw new Error('UzMonopoly requires between 2 and 6 players');
  }

  const players: Player[] = playersInput.map((p, idx) => ({
    id: p.id,
    name: p.name,
    token: p.token,
    color: p.color,
    cash: START_CASH,
    position: 0,
    inJail: false,
    jailTurns: 0,
    jailCards: 0,
    bankrupt: false,
    connected: true,
    isReady: true,
    isHost: p.isHost ?? idx === 0,
    isBot: p.isBot ?? false,
  }));

  const tiles: Record<number, TileState> = {};
  for (let i = 0; i < TOTAL_TILES; i++) {
    tiles[i] = {
      houses: 0,
      mortgaged: false,
    };
  }

  const imkonDeck = rng.shuffle(IMKON_CARDS.map((c) => c.id));
  const xazinaDeck = rng.shuffle(XAZINA_CARDS.map((c) => c.id));

  return {
    seq: 1,
    phase: 'ROLL',
    players,
    turnIndex: 0,
    doublesCount: 0,
    tiles,
    decks: {
      imkon: imkonDeck,
      xazina: xazinaDeck,
    },
    log: [
      {
        id: 'start-1',
        seq: 1,
        timestamp: 0,
        type: 'GAME_STARTED',
        message: {
          uz: 'O‘yin boshlandi!',
          ru: 'Игра началась!',
          en: 'Game has started!',
        },
      },
    ],
    settings,
  };
}
