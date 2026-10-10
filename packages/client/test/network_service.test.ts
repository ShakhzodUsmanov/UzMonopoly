import { describe, it, expect } from 'vitest';
import { NetworkService } from '../src/services/network.js';
import type { GameState } from '@uzmonopoly/shared';

describe('NetworkService Client Integration', () => {
  it('initializes and starts local solo game vs 3 AI bots', async () => {
    const service = new NetworkService();
    let latestState: GameState | undefined;

    service.onStateUpdate = (state) => {
      latestState = state;
    };

    service.startSoloGame('Tester', 'damas');

    expect(latestState).toBeDefined();
    expect(latestState!.players).toHaveLength(4);
    expect(latestState!.players[0]!.name).toBe('Tester');
    expect(latestState!.players[0]!.token).toBe('damas');
    expect(latestState!.players[1]!.isBot).toBe(true);
    expect(latestState!.players[2]!.isBot).toBe(true);
    expect(latestState!.players[3]!.isBot).toBe(true);
    expect(latestState!.phase).toBe('ROLL');

    // Human player performs roll action
    service.sendAction({ type: 'rollDice' });

    // Wait 100ms for action to process
    await new Promise((r) => setTimeout(r, 100));

    expect(latestState!.phase).not.toBe('LOBBY');
    expect(service.inGame).toBe(true);

    service.leave();
    expect(service.inGame).toBe(false);
  });
});
