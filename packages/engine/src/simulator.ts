import type { RoomSettings } from '@uzmonopoly/shared';
import { TOKENS, PLAYER_COLORS } from '@uzmonopoly/shared';
import { createPRNG } from './rng.js';
import { createInitialGameState, type CreatePlayerInput } from './state/createGame.js';
import { applyAction } from './engine.js';
import { decideBotAction } from './bot.js';
import { calculateNetWorth, getCurrentPlayer } from './helpers.js';

export interface SimulationResult {
  gameIndex: number;
  seed: number;
  turns: number;
  completed: boolean;
  winnerId?: string;
  winnerName?: string;
  winnerNetWorth: number;
  playerCount: number;
}

export interface BulkSimulationStats {
  totalGames: number;
  completedGames: number;
  timedOutGames: number;
  avgTurns: number;
  minTurns: number;
  maxTurns: number;
  winDistribution: Record<string, number>;
  winRateBySeat: number[];
}

export function simulateGame(
  seed: number,
  playerCount = 4,
  maxTurns = 1500,
  gameIndex = 0,
): SimulationResult {
  const rng = createPRNG(seed);

  const players: CreatePlayerInput[] = [];
  for (let i = 0; i < playerCount; i++) {
    players.push({
      id: `bot-${i + 1}`,
      name: `Bot ${i + 1}`,
      token: TOKENS[i % TOKENS.length]!.id,
      color: PLAYER_COLORS[i % PLAYER_COLORS.length]!,
      isBot: true,
    });
  }

  const settings: RoomSettings = {
    roomCode: 'BOT01',
    isPrivate: true,
    maxPlayers: playerCount,
    turnTimeoutSec: 60,
    mode: 'full',
  };

  let state = createInitialGameState(players, settings, rng);
  let turns = 0;
  let stuckCounter = 0;
  let lastSeq = state.seq;

  while (state.phase !== 'GAME_OVER' && turns < maxTurns) {
    let actingPlayerId: string;

    if (state.phase === 'AUCTION' && state.auction) {
      // Pick first active bidder
      const activeBidders = state.auction.active;
      if (activeBidders.length > 0) {
        // Choose one who isn't high bidder
        const nonHigh = activeBidders.filter((id) => id !== state.auction?.highBidder);
        actingPlayerId = nonHigh[0] ?? activeBidders[0]!;
      } else {
        actingPlayerId = getCurrentPlayer(state).id;
      }
    } else if (state.phase === 'DEBT' && state.pendingDebt) {
      actingPlayerId = state.pendingDebt.debtor;
    } else {
      actingPlayerId = getCurrentPlayer(state).id;
    }

    const action = decideBotAction(state, actingPlayerId);
    const result = applyAction(state, actingPlayerId, action, rng, true);

    if (!result.success) {
      // Fallback safe action to prevent infinite hang
      if (state.phase === 'AUCTION') {
        applyAction(state, actingPlayerId, { type: 'passAuction' }, rng, true);
      } else if (state.phase === 'DEBT') {
        applyAction(state, actingPlayerId, { type: 'declareBankruptcy' }, rng, true);
      } else if (state.phase === 'BUY_DECISION') {
        applyAction(state, actingPlayerId, { type: 'declineBuy' }, rng, true);
      } else {
        applyAction(state, actingPlayerId, { type: 'endTurn' }, rng, true);
      }
    } else {
      state = result.state;
    }

    if (state.seq === lastSeq) {
      stuckCounter++;
      if (stuckCounter > 20) {
        // Break infinite loop if any
        break;
      }
    } else {
      stuckCounter = 0;
      lastSeq = state.seq;
    }

    turns++;
  }

  const completed = state.phase === 'GAME_OVER' && Boolean(state.winnerId);
  let winnerId = state.winnerId;

  if (!winnerId) {
    // If reached max turns, determine winner by highest net worth
    let maxNW = -1;
    for (const p of state.players) {
      if (!p.bankrupt) {
        const nw = calculateNetWorth(state, p.id);
        if (nw > maxNW) {
          maxNW = nw;
          winnerId = p.id;
        }
      }
    }
  }

  const winner = state.players.find((p) => p.id === winnerId);
  const winnerNetWorth = winnerId ? calculateNetWorth(state, winnerId) : 0;

  return {
    gameIndex,
    seed,
    turns,
    completed,
    winnerId,
    winnerName: winner?.name,
    winnerNetWorth,
    playerCount,
  };
}

export function runBulkSimulations(
  count = 1000,
  playerCount = 4,
  maxTurnsPerGame = 1500,
): BulkSimulationStats {
  const winDistribution: Record<string, number> = {};
  const seatWins = new Array(playerCount).fill(0);
  let totalTurns = 0;
  let minTurns = Infinity;
  let maxTurns = 0;
  let completedGames = 0;
  let timedOutGames = 0;

  for (let i = 0; i < count; i++) {
    const seed = 100000 + i * 37 + 13;
    const res = simulateGame(seed, playerCount, maxTurnsPerGame, i);

    totalTurns += res.turns;
    if (res.turns < minTurns) minTurns = res.turns;
    if (res.turns > maxTurns) maxTurns = res.turns;

    if (res.completed) {
      completedGames++;
    } else {
      timedOutGames++;
    }

    if (res.winnerId) {
      winDistribution[res.winnerId] = (winDistribution[res.winnerId] ?? 0) + 1;
      const seatIndex = parseInt(res.winnerId.replace('bot-', ''), 10) - 1;
      if (seatIndex >= 0 && seatIndex < playerCount) {
        seatWins[seatIndex] = (seatWins[seatIndex] ?? 0) + 1;
      }
    }
  }

  const winRateBySeat = seatWins.map((wins) => Math.round((wins / count) * 100));

  return {
    totalGames: count,
    completedGames,
    timedOutGames,
    avgTurns: Math.round(totalTurns / count),
    minTurns: minTurns === Infinity ? 0 : minTurns,
    maxTurns,
    winDistribution,
    winRateBySeat,
  };
}
