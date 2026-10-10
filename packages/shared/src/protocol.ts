import { z } from 'zod';

export const TokenIdSchema = z.enum(['doppi', 'choynak', 'qozon', 'tarvuz', 'damas', 'tulpar']);

export const ClientReadySchema = z.object({
  type: z.literal('ready'),
});

export const ClientSetTokenSchema = z.object({
  type: z.literal('setToken'),
  token: TokenIdSchema,
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
});

export const ClientStartGameSchema = z.object({
  type: z.literal('startGame'),
});

export const ClientRollDiceSchema = z.object({
  type: z.literal('rollDice'),
});

export const ClientBuySchema = z.object({
  type: z.literal('buy'),
});

export const ClientDeclineBuySchema = z.object({
  type: z.literal('declineBuy'),
});

export const ClientBidSchema = z.object({
  type: z.literal('bid'),
  amount: z.number().int().positive(),
});

export const ClientPassAuctionSchema = z.object({
  type: z.literal('passAuction'),
});

export const ClientBuildSchema = z.object({
  type: z.literal('build'),
  tileId: z.number().int().min(0).max(51),
});

export const ClientSellBuildingSchema = z.object({
  type: z.literal('sellBuilding'),
  tileId: z.number().int().min(0).max(51),
});

export const ClientMortgageSchema = z.object({
  type: z.literal('mortgage'),
  tileId: z.number().int().min(0).max(51),
});

export const ClientUnmortgageSchema = z.object({
  type: z.literal('unmortgage'),
  tileId: z.number().int().min(0).max(51),
});

export const ClientProposeTradeSchema = z.object({
  type: z.literal('proposeTrade'),
  targetId: z.string().min(1),
  initiatorMoney: z.number().int().min(0).default(0),
  targetMoney: z.number().int().min(0).default(0),
  initiatorTiles: z.array(z.number().int().min(0).max(51)).default([]),
  targetTiles: z.array(z.number().int().min(0).max(51)).default([]),
  initiatorJailCards: z.number().int().min(0).default(0),
  targetJailCards: z.number().int().min(0).default(0),
});

export const ClientAnswerTradeSchema = z.object({
  type: z.literal('answerTrade'),
  tradeId: z.string().min(1),
  accept: z.boolean(),
});

export const ClientPayJailFineSchema = z.object({
  type: z.literal('payJailFine'),
});

export const ClientUseJailCardSchema = z.object({
  type: z.literal('useJailCard'),
});

export const ClientEndTurnSchema = z.object({
  type: z.literal('endTurn'),
});

export const ClientChatSchema = z.object({
  type: z.literal('chat'),
  text: z.string().trim().min(1).max(200),
});

export const ClientActionSchema = z.discriminatedUnion('type', [
  ClientReadySchema,
  ClientSetTokenSchema,
  ClientStartGameSchema,
  ClientRollDiceSchema,
  ClientBuySchema,
  ClientDeclineBuySchema,
  ClientBidSchema,
  ClientPassAuctionSchema,
  ClientBuildSchema,
  ClientSellBuildingSchema,
  ClientMortgageSchema,
  ClientUnmortgageSchema,
  ClientProposeTradeSchema,
  ClientAnswerTradeSchema,
  ClientPayJailFineSchema,
  ClientUseJailCardSchema,
  ClientEndTurnSchema,
  ClientChatSchema,
]);

export type ClientAction = z.infer<typeof ClientActionSchema>;
export type ClientActionType = ClientAction['type'];

export const CreateRoomOptionsSchema = z.object({
  playerName: z.string().trim().min(1).max(20),
  maxPlayers: z.number().int().min(2).max(6).default(6),
  isPrivate: z.boolean().default(false),
  turnTimeoutSec: z.number().int().min(15).max(180).default(60),
  mode: z.enum(['full', 'short']).default('full'),
  shortGameMinutes: z.number().int().min(10).max(120).optional(),
});

export type CreateRoomOptions = z.infer<typeof CreateRoomOptionsSchema>;

export const JoinRoomOptionsSchema = z.object({
  playerName: z.string().trim().min(1).max(20),
  roomCode: z.string().trim().length(5),
  reconnectToken: z.string().optional(),
});

export type JoinRoomOptions = z.infer<typeof JoinRoomOptionsSchema>;
