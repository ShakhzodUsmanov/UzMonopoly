import { describe, it, expect } from 'vitest';
import { createPRNG } from '../src/rng.js';
import { createInitialGameState } from '../src/state/createGame.js';
import { applyAction } from '../src/engine.js';
import type { RoomSettings } from '@uzmonopoly/shared';

function setupTestGame() {
  const rng = createPRNG(42);
  const settings: RoomSettings = {
    roomCode: 'TEST1',
    isPrivate: true,
    maxPlayers: 2,
    turnTimeoutSec: 60,
    mode: 'full',
  };
  const state = createInitialGameState(
    [
      { id: 'p1', name: 'Player 1', token: 'doppi', color: '#EF4444' },
      { id: 'p2', name: 'Player 2', token: 'choynak', color: '#3B82F6' },
    ],
    settings,
    rng,
  );
  return { state, rng };
}

describe('Movement & Jail Rules', () => {
  it('awards salary when passing Boshlash (GO)', () => {
    const { state } = setupTestGame();
    const p1 = state.players[0]!;
    p1.position = 50; // Near GO (tile 0)
    p1.cash = 3000;

    // Mock RNG to roll 2 + 3 = 5 -> moves to tile 3, passing GO
    let rollCount = 0;
    const mockRng = {
      next: () => 0.5,
      nextInt: () => {
        rollCount++;
        return rollCount % 2 === 1 ? 2 : 3;
      },
      shuffle: <T>(arr: readonly T[]) => [...arr],
    };

    const res = applyAction(state, 'p1', { type: 'rollDice' }, mockRng);
    expect(res.success).toBe(true);
    if (!res.success) return;

    const updatedP1 = res.state.players[0]!;
    expect(updatedP1.position).toBe(3);
    // 3000 + 300 salary = 3300
    expect(updatedP1.cash).toBe(3300);
  });

  it('sends player to jail on three consecutive doubles', () => {
    const { state } = setupTestGame();

    // Mock RNG that always rolls doubles (3, 3)
    const doublesRng = {
      next: () => 0.5,
      nextInt: () => 3, // both dice = 3
      shuffle: <T>(arr: readonly T[]) => [...arr],
    };

    // First double -> lands on tile 6 (BUY_DECISION)
    let res = applyAction(state, 'p1', { type: 'rollDice' }, doublesRng);
    expect(res.success).toBe(true);
    if (!res.success) return;
    expect(res.state.doublesCount).toBe(1);

    // Resolve tile 6 (buy so phase becomes POST_ROLL)
    if (res.state.phase === 'BUY_DECISION') {
      res = applyAction(res.state, 'p1', { type: 'buy' }, doublesRng);
      expect(res.success).toBe(true);
      if (!res.success) return;
    }

    // End turn -> extra turn given because of doubles!
    res = applyAction(res.state, 'p1', { type: 'endTurn' }, doublesRng);
    expect(res.success).toBe(true);
    if (!res.success) return;
    expect(res.state.phase).toBe('ROLL');

    // Second double -> lands on tile 12 (Imkon - Chance)
    res = applyAction(res.state, 'p1', { type: 'rollDice' }, doublesRng);
    expect(res.success).toBe(true);
    if (!res.success) return;
    expect(res.state.doublesCount).toBe(2);

    // If BUY_DECISION, buy it
    if (res.state.phase === 'BUY_DECISION') {
      res = applyAction(res.state, 'p1', { type: 'buy' }, doublesRng);
      expect(res.success).toBe(true);
      if (!res.success) return;
    }

    // End turn -> extra turn given
    res = applyAction(res.state, 'p1', { type: 'endTurn' }, doublesRng);
    expect(res.success).toBe(true);
    if (!res.success) return;
    expect(res.state.phase).toBe('ROLL');

    // Third double -> straight to jail!
    res = applyAction(res.state, 'p1', { type: 'rollDice' }, doublesRng);
    expect(res.success).toBe(true);
    if (!res.success) return;

    const p1 = res.state.players[0]!;
    expect(p1.inJail).toBe(true);
    expect(p1.position).toBe(13); // Jail index
    expect(res.state.doublesCount).toBe(0);
  });

  it('exits jail by paying fine (100 so‘m)', () => {
    const { state, rng } = setupTestGame();
    const p1 = state.players[0]!;
    p1.inJail = true;
    p1.position = 13;
    p1.cash = 1000;
    state.phase = 'JAIL';

    const res = applyAction(state, 'p1', { type: 'payJailFine' }, rng);
    expect(res.success).toBe(true);
    if (!res.success) return;

    const updatedP1 = res.state.players[0]!;
    expect(updatedP1.inJail).toBe(false);
    expect(updatedP1.cash).toBe(900); // 1000 - 100
    expect(res.state.phase).toBe('ROLL');
  });

  it('exits jail using Get Out of Jail Free card', () => {
    const { state, rng } = setupTestGame();
    const p1 = state.players[0]!;
    p1.inJail = true;
    p1.position = 13;
    p1.jailCards = 1;
    state.phase = 'JAIL';

    const res = applyAction(state, 'p1', { type: 'useJailCard' }, rng);
    expect(res.success).toBe(true);
    if (!res.success) return;

    const updatedP1 = res.state.players[0]!;
    expect(updatedP1.inJail).toBe(false);
    expect(updatedP1.jailCards).toBe(0);
    expect(res.state.phase).toBe('ROLL');
  });

  it('exits jail by rolling doubles', () => {
    const { state } = setupTestGame();
    const p1 = state.players[0]!;
    p1.inJail = true;
    p1.position = 13;
    state.phase = 'JAIL';

    // Mock doubles (4, 4)
    const doublesRng = {
      next: () => 0.5,
      nextInt: () => 4,
      shuffle: <T>(arr: readonly T[]) => [...arr],
    };

    const res = applyAction(state, 'p1', { type: 'rollDice' }, doublesRng);
    expect(res.success).toBe(true);
    if (!res.success) return;

    const updatedP1 = res.state.players[0]!;
    expect(updatedP1.inJail).toBe(false);
    expect(updatedP1.position).toBe(21); // 13 + 8 = 21
  });

  it('forces fine payment after 3 failed turns in jail', () => {
    const { state } = setupTestGame();
    const p1 = state.players[0]!;
    p1.inJail = true;
    p1.jailTurns = 2; // Already spent 2 turns
    p1.position = 13;
    p1.cash = 1000;
    state.phase = 'JAIL';

    // Mock non-doubles: d1=2, d2=3
    let callCount = 0;
    const nonDoublesRng = {
      next: () => 0.5,
      nextInt: (_min: number, _max: number) => {
        callCount++;
        return callCount % 2 === 1 ? 2 : 3;
      },
      shuffle: <T>(arr: readonly T[]) => [...arr],
    };

    const res = applyAction(state, 'p1', { type: 'rollDice' }, nonDoublesRng);
    expect(res.success).toBe(true);
    if (!res.success) return;

    const updatedP1 = res.state.players[0]!;
    expect(updatedP1.inJail).toBe(false);
    expect(updatedP1.cash).toBe(900); // 1000 - 100 fine
    expect(updatedP1.position).toBe(18); // 13 + 2 + 3 = 18
  });
});
