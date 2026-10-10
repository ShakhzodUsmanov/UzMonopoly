import { describe, it, expect } from 'vitest';
import {
  createInitialGameState,
  createPRNG,
  checkGameOver,
  calculateNetWorth,
} from '../src/index.js';

describe('Phase 6: Short Game Mode Engine Logic', () => {
  it('terminates game when turn limit is reached in short mode and selects winner by Net Worth', () => {
    const rng = createPRNG(42);
    const game = createInitialGameState(
      [
        { id: 'p1', name: 'Alisher', token: 'doppi', color: '#EF4444' },
        { id: 'p2', name: 'Bobur', token: 'choynak', color: '#3B82F6' },
      ],
      {
        roomCode: 'SHORT',
        isPrivate: false,
        maxPlayers: 2,
        turnTimeoutSec: 30,
        mode: 'short',
        shortGameMinutes: 5, // 5 * 4 = 20 max turns
      },
      rng,
    );

    // Initial check: game is not over
    expect(checkGameOver(game).isGameOver).toBe(false);

    // Give p1 some properties and houses to boost net worth
    game.tiles[1]!.ownerId = 'p1';
    game.tiles[1]!.houses = 2;
    game.players[0]!.cash = 800;

    // p2 has less cash
    game.players[1]!.cash = 500;

    expect(calculateNetWorth(game, 'p1')).toBeGreaterThan(calculateNetWorth(game, 'p2'));

    // Fast-forward seq to reach maxShortTurns (20)
    game.seq = 20;

    const overCheck = checkGameOver(game);
    expect(overCheck.isGameOver).toBe(true);
    expect(overCheck.reason).toBe('SHORT_GAME_LIMIT');
    expect(overCheck.winnerId).toBe('p1');
  });

  it('handles regular elimination even before turn limit in short mode', () => {
    const rng = createPRNG(42);
    const game = createInitialGameState(
      [
        { id: 'p1', name: 'Alisher', token: 'doppi', color: '#EF4444' },
        { id: 'p2', name: 'Bobur', token: 'choynak', color: '#3B82F6' },
      ],
      {
        roomCode: 'SHORT',
        isPrivate: false,
        maxPlayers: 2,
        turnTimeoutSec: 30,
        mode: 'short',
        shortGameMinutes: 45,
      },
      rng,
    );

    // p2 goes bankrupt
    game.players[1]!.bankrupt = true;

    const overCheck = checkGameOver(game);
    expect(overCheck.isGameOver).toBe(true);
    expect(overCheck.reason).toBe('ELIMINATION');
    expect(overCheck.winnerId).toBe('p1');
  });
});
