import type { TokenId, GroupId } from './constants.js';

export type Language = 'uz' | 'ru' | 'en';

export type Phase =
  | 'LOBBY'
  | 'ROLL'
  | 'MOVING'
  | 'BUY_DECISION'
  | 'AUCTION'
  | 'POST_ROLL'
  | 'JAIL'
  | 'DEBT'
  | 'GAME_OVER';

export type TileType =
  | 'START'
  | 'PROPERTY'
  | 'CHANCE'
  | 'COMMUNITY_CHEST'
  | 'TAX'
  | 'JAIL'
  | 'FREE_PARKING'
  | 'GO_TO_JAIL';

export interface LocalizedText {
  uz: string;
  ru: string;
  en: string;
}

export interface TileDefinition {
  index: number;
  type: TileType;
  name: string;
  nameI18n?: LocalizedText;
  group?: GroupId;
  price?: number;
  baseRent?: number;
  houseCost?: number;
  taxAmount?: number;
  side: 1 | 2 | 3 | 4;
}

export interface Player {
  id: string;
  name: string;
  token: TokenId;
  color: string;
  cash: number;
  position: number;
  inJail: boolean;
  jailTurns: number;
  jailCards: number;
  bankrupt: boolean;
  connected: boolean;
  isReady?: boolean;
  isHost?: boolean;
  isBot?: boolean;
}

export interface TileState {
  ownerId?: string;
  houses: number; // 0..4 = houses, 5 = hotel
  mortgaged: boolean;
}

export interface AuctionState {
  tileId: number;
  highBid: number;
  highBidder?: string;
  active: string[];
  endsAt: number;
}

export interface TradeOffer {
  id: string;
  initiatorId: string;
  targetId: string;
  initiatorMoney: number;
  targetMoney: number;
  initiatorTiles: number[];
  targetTiles: number[];
  initiatorJailCards: number;
  targetJailCards: number;
}

export interface PendingDebt {
  debtor: string;
  creditor?: string; // undefined if bank
  amount: number;
  reason?: string;
}

export interface GameEvent {
  id: string;
  seq: number;
  timestamp: number;
  type: string;
  playerId?: string;
  message: LocalizedText;
  data?: Record<string, unknown>;
}

export interface RoomSettings {
  roomCode: string;
  isPrivate: boolean;
  maxPlayers: number;
  turnTimeoutSec: number;
  mode: 'full' | 'short';
  shortGameMinutes?: number;
}

export interface GameState {
  seq: number;
  phase: Phase;
  players: Player[];
  turnIndex: number;
  doublesCount: number;
  lastDice?: [number, number];
  tiles: Record<number, TileState>;
  auction?: AuctionState;
  pendingTrade?: TradeOffer;
  pendingDebt?: PendingDebt;
  decks: {
    imkon: number[];
    xazina: number[];
  };
  log: GameEvent[];
  settings: RoomSettings;
  winnerId?: string;
}

export interface CardDefinition {
  id: number;
  type: 'imkon' | 'xazina';
  title: LocalizedText;
  description: LocalizedText;
  actionType:
    | 'ADVANCE_TO_GO'
    | 'ADVANCE_TO_TILE'
    | 'GO_BACK_TILES'
    | 'GO_TO_JAIL'
    | 'GET_OUT_OF_JAIL_FREE'
    | 'RECEIVE_MONEY'
    | 'PAY_MONEY'
    | 'PAY_EACH_PLAYER'
    | 'COLLECT_FROM_EACH_PLAYER'
    | 'PROPERTY_REPAIR';
  amount?: number;
  targetTileIndex?: number;
  houseCost?: number;
  hotelCost?: number;
  relativeTiles?: number;
}
