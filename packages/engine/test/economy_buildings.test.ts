import { describe, it, expect } from 'vitest';
import { createPRNG } from '../src/rng.js';
import { createInitialGameState } from '../src/state/createGame.js';
import { applyAction } from '../src/engine.js';
import type { RoomSettings } from '@uzmonopoly/shared';

function setupTestGame() {
  const rng = createPRNG(99);
  const settings: RoomSettings = {
    roomCode: 'ECON1',
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

describe('Economy & Buildings Rules', () => {
  it('allows buying unowned property and updates ownership', () => {
    const { state, rng } = setupTestGame();
    const p1 = state.players[0]!;
    p1.position = 1; // Safia Bakery (price 60)
    p1.cash = 1000;
    state.phase = 'BUY_DECISION';

    const res = applyAction(state, 'p1', { type: 'buy' }, rng);
    expect(res.success).toBe(true);
    if (!res.success) return;

    expect(res.state.players[0]!.cash).toBe(940); // 1000 - 60
    expect(res.state.tiles[1]!.ownerId).toBe('p1');
    expect(res.state.phase).toBe('POST_ROLL');
  });

  it('charges double rent for full monopoly without houses', () => {
    const { state } = setupTestGame();
    // Bakery group: tiles 1, 2, 3. Owner p2
    state.tiles[1]!.ownerId = 'p2';
    state.tiles[2]!.ownerId = 'p2';
    state.tiles[3]!.ownerId = 'p2';

    // Safia Bakery (tile 1) base rent is 2 -> monopoly rent is 4
    const p1 = state.players[0]!;
    const p2 = state.players[1]!;
    p1.position = 0;
    p1.cash = 1000;
    p2.cash = 1000;
    state.phase = 'ROLL';

    // Move to tile 1
    p1.position = 51;
    let call = 0;
    const rngMove = {
      next: () => 0.5,
      nextInt: () => {
        call++;
        return call === 1 ? 1 : 1; // 1+1=2 -> 51+2=1 (mod 52)
      },
      shuffle: <T>(arr: readonly T[]) => [...arr],
    };

    const res = applyAction(state, 'p1', { type: 'rollDice' }, rngMove);
    expect(res.success).toBe(true);
    if (!res.success) return;

    // p1 passed GO (salary +300), then landed on tile 1, paying 4 rent
    // 1000 + 300 - 4 = 1296
    expect(res.state.players[0]!.cash).toBe(1296);
    expect(res.state.players[1]!.cash).toBe(1004); // 1000 + 4
  });

  it('enforces uniform building rules across color group', () => {
    const { state, rng } = setupTestGame();
    // P1 owns all fastfood: tiles 5, 6, 7 (houseCost: 50)
    state.tiles[5]!.ownerId = 'p1';
    state.tiles[6]!.ownerId = 'p1';
    state.tiles[7]!.ownerId = 'p1';
    state.players[0]!.cash = 2000;
    state.phase = 'POST_ROLL';

    // 1. Build first house on tile 5 -> success
    let res = applyAction(state, 'p1', { type: 'build', tileId: 5 }, rng);
    expect(res.success).toBe(true);
    if (!res.success) return;
    expect(res.state.tiles[5]!.houses).toBe(1);
    const validState = res.state;

    // 2. Try to build second house on tile 5 before tiles 6 and 7 have 1 house -> fails!
    const failedRes = applyAction(validState, 'p1', { type: 'build', tileId: 5 }, rng);
    expect(failedRes.success).toBe(false);
    expect(failedRes.code).toBe('UNIFORM_BUILD_VIOLATION');

    // 3. Build on tile 6, then on tile 7 -> success
    res = applyAction(validState, 'p1', { type: 'build', tileId: 6 }, rng);
    expect(res.success).toBe(true);
    if (!res.success) return;

    res = applyAction(res.state, 'p1', { type: 'build', tileId: 7 }, rng);
    expect(res.success).toBe(true);
    if (!res.success) return;

    // Now all have 1 house. Can build 2nd house on tile 5!
    res = applyAction(res.state, 'p1', { type: 'build', tileId: 5 }, rng);
    expect(res.success).toBe(true);
    if (!res.success) return;
    expect(res.state.tiles[5]!.houses).toBe(2);
  });

  it('enforces uniform building selling rules', () => {
    const { state, rng } = setupTestGame();
    // Fastfood group: tile 5 has 2 houses, 6 has 1, 7 has 1
    state.tiles[5]!.ownerId = 'p1';
    state.tiles[5]!.houses = 2;
    state.tiles[6]!.ownerId = 'p1';
    state.tiles[6]!.houses = 1;
    state.tiles[7]!.ownerId = 'p1';
    state.tiles[7]!.houses = 1;
    state.players[0]!.cash = 500;
    state.phase = 'POST_ROLL';

    // Trying to sell from tile 6 (has 1 house, while tile 5 has 2) -> fails uniform sell!
    let res = applyAction(state, 'p1', { type: 'sellBuilding', tileId: 6 }, rng);
    expect(res.success).toBe(false);
    expect(res.code).toBe('UNIFORM_SELL_VIOLATION');

    // Selling from tile 5 (has max houses: 2) -> succeeds!
    res = applyAction(state, 'p1', { type: 'sellBuilding', tileId: 5 }, rng);
    expect(res.success).toBe(true);
    if (!res.success) return;

    expect(res.state.tiles[5]!.houses).toBe(1);
    // House cost was 50, selling returns half (25)
    expect(res.state.players[0]!.cash).toBe(525);
  });

  it('handles mortgage and unmortgage correctly', () => {
    const { state, rng } = setupTestGame();
    // Tile 14: Korzinka (price: 180, mortgage: 90, unmortgage: ceil(90 * 1.1) = 99)
    state.tiles[14]!.ownerId = 'p1';
    state.players[0]!.cash = 100;
    state.phase = 'POST_ROLL';

    // Mortgage tile 14
    let res = applyAction(state, 'p1', { type: 'mortgage', tileId: 14 }, rng);
    expect(res.success).toBe(true);
    if (!res.success) return;

    expect(res.state.tiles[14]!.mortgaged).toBe(true);
    expect(res.state.players[0]!.cash).toBe(190); // 100 + 90

    // Unmortgage tile 14
    res = applyAction(res.state, 'p1', { type: 'unmortgage', tileId: 14 }, rng);
    expect(res.success).toBe(true);
    if (!res.success) return;

    expect(res.state.tiles[14]!.mortgaged).toBe(false);
    expect(res.state.players[0]!.cash).toBe(91); // 190 - 99 = 91
  });

  it('prevents building if any property in group is mortgaged', () => {
    const { state, rng } = setupTestGame();
    // Bakery group: 1, 2, 3
    state.tiles[1]!.ownerId = 'p1';
    state.tiles[2]!.ownerId = 'p1';
    state.tiles[3]!.ownerId = 'p1';
    state.tiles[2]!.mortgaged = true; // One is mortgaged
    state.players[0]!.cash = 1000;
    state.phase = 'POST_ROLL';

    const res = applyAction(state, 'p1', { type: 'build', tileId: 1 }, rng);
    expect(res.success).toBe(false);
    expect(res.code).toBe('GROUP_MORTGAGED');
  });

  it('prevents mortgaging if any property in group has buildings', () => {
    const { state, rng } = setupTestGame();
    // Bakery group: 1, 2, 3
    state.tiles[1]!.ownerId = 'p1';
    state.tiles[2]!.ownerId = 'p1';
    state.tiles[3]!.ownerId = 'p1';
    state.tiles[1]!.houses = 1; // Has house
    state.players[0]!.cash = 1000;
    state.phase = 'POST_ROLL';

    const res = applyAction(state, 'p1', { type: 'mortgage', tileId: 2 }, rng);
    expect(res.success).toBe(false);
    expect(res.code).toBe('GROUP_HAS_BUILDINGS');
  });
});
