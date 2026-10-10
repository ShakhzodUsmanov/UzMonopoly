import { describe, it, expect } from 'vitest';
import { createPRNG } from '../src/rng.js';
import { createInitialGameState } from '../src/state/createGame.js';
import { applyAction } from '../src/engine.js';
import type { RoomSettings, TokenId } from '@uzmonopoly/shared';

function setupTestGame(playerCount = 3) {
  const rng = createPRNG(77);
  const settings: RoomSettings = {
    roomCode: 'AUCT1',
    isPrivate: true,
    maxPlayers: playerCount,
    turnTimeoutSec: 60,
    mode: 'full',
  };
  const tokens: TokenId[] = ['doppi', 'choynak', 'qozon'];
  const players = [];
  const colors = ['#EF4444', '#3B82F6', '#10B981'];
  for (let i = 0; i < playerCount; i++) {
    players.push({
      id: `p${i + 1}`,
      name: `Player ${i + 1}`,
      token: tokens[i] ?? 'doppi',
      color: colors[i]!,
    });
  }
  const state = createInitialGameState(players, settings, rng);
  return { state, rng };
}

describe('Auction, Trade & Bankruptcy Rules', () => {
  it('triggers auction on declineBuy and resolves to highest bidder', () => {
    const { state, rng } = setupTestGame(3);
    const p1 = state.players[0]!;
    p1.position = 14; // Korzinka
    state.phase = 'BUY_DECISION';

    // P1 declines
    let res = applyAction(state, 'p1', { type: 'declineBuy' }, rng);
    expect(res.success).toBe(true);
    if (!res.success) return;

    expect(res.state.phase).toBe('AUCTION');
    expect(res.state.auction).toBeDefined();
    expect(res.state.auction?.tileId).toBe(14);

    // P2 bids 50
    res = applyAction(res.state, 'p2', { type: 'bid', amount: 50 }, rng);
    expect(res.success).toBe(true);
    if (!res.success) return;
    expect(res.state.auction?.highBid).toBe(50);
    expect(res.state.auction?.highBidder).toBe('p2');

    // P3 bids 70
    res = applyAction(res.state, 'p3', { type: 'bid', amount: 70 }, rng);
    expect(res.success).toBe(true);
    if (!res.success) return;
    expect(res.state.auction?.highBid).toBe(70);
    expect(res.state.auction?.highBidder).toBe('p3');

    // P1 passes
    res = applyAction(res.state, 'p1', { type: 'passAuction' }, rng);
    expect(res.success).toBe(true);
    if (!res.success) return;

    // P2 passes -> only P3 (high bidder) remains, auction concludes!
    res = applyAction(res.state, 'p2', { type: 'passAuction' }, rng);
    expect(res.success).toBe(true);
    if (!res.success) return;

    expect(res.state.phase).toBe('POST_ROLL');
    expect(res.state.auction).toBeUndefined();
    expect(res.state.tiles[14]!.ownerId).toBe('p3');
    // P3 started with 3000, paid 70 -> 2930
    expect(res.state.players[2]!.cash).toBe(2930);
  });

  it('leaves property unowned when all players pass the auction', () => {
    const { state, rng } = setupTestGame(3);
    state.players[0]!.position = 14;
    state.phase = 'BUY_DECISION';

    let res = applyAction(state, 'p1', { type: 'declineBuy' }, rng);
    if (!res.success) return;

    // All 3 players pass without bidding
    res = applyAction(res.state, 'p1', { type: 'passAuction' }, rng);
    if (!res.success) return;
    res = applyAction(res.state, 'p2', { type: 'passAuction' }, rng);
    if (!res.success) return;
    res = applyAction(res.state, 'p3', { type: 'passAuction' }, rng);
    if (!res.success) return;

    expect(res.state.phase).toBe('POST_ROLL');
    expect(res.state.tiles[14]!.ownerId).toBeUndefined();
  });

  it('handles proposing and accepting trades with property and money swap', () => {
    const { state, rng } = setupTestGame(2);
    // P1 owns tile 1, P2 owns tile 14
    state.tiles[1]!.ownerId = 'p1';
    state.tiles[14]!.ownerId = 'p2';
    state.players[0]!.cash = 1000;
    state.players[1]!.cash = 1000;
    state.phase = 'POST_ROLL';

    // P1 proposes trade: gives tile 1 + 200 so'm, asks for tile 14
    let res = applyAction(
      state,
      'p1',
      {
        type: 'proposeTrade',
        targetId: 'p2',
        initiatorTiles: [1],
        initiatorMoney: 200,
        targetTiles: [14],
        targetMoney: 0,
        initiatorJailCards: 0,
        targetJailCards: 0,
      },
      rng,
    );
    expect(res.success).toBe(true);
    if (!res.success) return;

    const tradeId = res.state.pendingTrade!.id;
    expect(tradeId).toBeDefined();

    // P2 accepts trade
    res = applyAction(res.state, 'p2', { type: 'answerTrade', tradeId, accept: true }, rng);
    expect(res.success).toBe(true);
    if (!res.success) return;

    expect(res.state.pendingTrade).toBeUndefined();
    expect(res.state.tiles[1]!.ownerId).toBe('p2');
    expect(res.state.tiles[14]!.ownerId).toBe('p1');
    expect(res.state.players[0]!.cash).toBe(800); // 1000 - 200
    expect(res.state.players[1]!.cash).toBe(1200); // 1000 + 200
  });

  it('rejects trade if property group has buildings', () => {
    const { state, rng } = setupTestGame(2);
    // P1 owns tile 1, 2, 3 and built a house on tile 1
    state.tiles[1]!.ownerId = 'p1';
    state.tiles[1]!.houses = 1;
    state.tiles[2]!.ownerId = 'p1';
    state.tiles[3]!.ownerId = 'p1';
    state.tiles[14]!.ownerId = 'p2';
    state.phase = 'POST_ROLL';

    const res = applyAction(
      state,
      'p1',
      {
        type: 'proposeTrade',
        targetId: 'p2',
        initiatorTiles: [2], // Trying to trade unbuilt tile from group with house
        initiatorMoney: 0,
        targetTiles: [14],
        targetMoney: 0,
        initiatorJailCards: 0,
        targetJailCards: 0,
      },
      rng,
    );
    expect(res.success).toBe(false);
    expect(res.code).toBe('BUILDINGS_EXIST');
  });

  it('transfers assets to creditor on bankruptcy and declares winner', () => {
    const { state, rng } = setupTestGame(2);
    // P1 owes P2 1000 rent but only has 100 cash and tile 1
    state.tiles[1]!.ownerId = 'p1';
    state.players[0]!.cash = 100;
    state.players[1]!.cash = 500;
    state.pendingDebt = {
      debtor: 'p1',
      creditor: 'p2',
      amount: 1000,
      reason: 'RENT',
    };
    state.phase = 'DEBT';

    // P1 declares bankruptcy
    const res = applyAction(state, 'p1', { type: 'declareBankruptcy' }, rng);
    expect(res.success).toBe(true);
    if (!res.success) return;

    // P1 is bankrupt
    expect(res.state.players[0]!.bankrupt).toBe(true);
    // P2 received P1's remaining 100 cash (500 + 100 = 600)
    expect(res.state.players[1]!.cash).toBe(600);
    // P2 received P1's property (tile 1)
    expect(res.state.tiles[1]!.ownerId).toBe('p2');

    // Only P2 remains active -> GAME_OVER, P2 wins!
    expect(res.state.phase).toBe('GAME_OVER');
    expect(res.state.winnerId).toBe('p2');
  });

  it('returns properties to bank when bankrupt to bank', () => {
    const { state, rng } = setupTestGame(3);
    state.tiles[1]!.ownerId = 'p1';
    state.tiles[1]!.mortgaged = true;
    state.players[0]!.cash = 50;
    state.pendingDebt = {
      debtor: 'p1',
      creditor: undefined, // Bank
      amount: 400,
      reason: 'TAX',
    };
    state.phase = 'DEBT';

    const res = applyAction(state, 'p1', { type: 'declareBankruptcy' }, rng);
    expect(res.success).toBe(true);
    if (!res.success) return;

    expect(res.state.players[0]!.bankrupt).toBe(true);
    // Tile 1 is unowned and unmortgaged
    expect(res.state.tiles[1]!.ownerId).toBeUndefined();
    expect(res.state.tiles[1]!.mortgaged).toBe(false);

    // 2 players remain -> game continues, phase is ROLL for next player
    expect(res.state.phase).toBe('ROLL');
  });
});
