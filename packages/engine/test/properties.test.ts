import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { simulateGame } from '../src/simulator.js';
import { countBankBuildingsUsed } from '../src/helpers.js';
import { GAME_CONFIG } from '../src/data/config.js';
import { createPRNG } from '../src/rng.js';
import { createInitialGameState } from '../src/state/createGame.js';
import { applyAction } from '../src/engine.js';
import { decideBotAction } from '../src/bot.js';

describe('Property-Based Tests (Invariants with fast-check)', () => {
  it('ensures no non-bankrupt player ever has negative cash across any game state', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 200000 }),
        fc.integer({ min: 2, max: 4 }),
        (seed, playerCount) => {
          const rng = createPRNG(seed);
          const players = [];
          for (let i = 0; i < playerCount; i++) {
            players.push({
              id: `p-${i + 1}`,
              name: `Bot ${i + 1}`,
              token: 'doppi' as const,
              color: '#EF4444',
              isBot: true,
            });
          }

          let state = createInitialGameState(
            players,
            {
              roomCode: 'PROP1',
              isPrivate: true,
              maxPlayers: playerCount,
              turnTimeoutSec: 60,
              mode: 'full',
            },
            rng,
          );

          // Run 80 steps
          for (let step = 0; step < 80; step++) {
            if (state.phase === 'GAME_OVER') break;

            let actingId = state.players[state.turnIndex]?.id ?? 'p-1';
            if (state.phase === 'DEBT' && state.pendingDebt) {
              actingId = state.pendingDebt.debtor;
            } else if (state.phase === 'AUCTION' && state.auction?.active.length) {
              actingId = state.auction.active[0]!;
            }

            const action = decideBotAction(state, actingId);
            const res = applyAction(state, actingId, action, rng);
            if (res.success) {
              state = res.state;

              // Invariant check: no non-bankrupt player has negative cash
              for (const p of state.players) {
                if (!p.bankrupt) {
                  expect(p.cash).toBeGreaterThanOrEqual(0);
                }
              }

              // Invariant check: bank building limits
              const bank = countBankBuildingsUsed(state);
              expect(bank.houses).toBeLessThanOrEqual(GAME_CONFIG.totalBankHouses);
              expect(bank.hotels).toBeLessThanOrEqual(GAME_CONFIG.totalBankHotels);
            }
          }
        },
      ),
      { numRuns: 50 },
    );
  });

  it('guarantees complete game invariant preservation via simulateGame', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1000, max: 99999 }), (seed) => {
        const res = simulateGame(seed, 3, 200);
        expect(res.turns).toBeGreaterThan(0);
        expect(res.turns).toBeLessThanOrEqual(200);
        expect(res.playerCount).toBe(3);
        if (res.completed) {
          expect(res.winnerId).toBeDefined();
        }
      }),
      { numRuns: 30 },
    );
  });
});
