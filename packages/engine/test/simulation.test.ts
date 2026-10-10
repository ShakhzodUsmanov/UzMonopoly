import { describe, it, expect } from 'vitest';
import { runBulkSimulations, simulateGame } from '../src/simulator.js';

describe('Engine Bot Simulation (1000 Games)', () => {
  it('runs a single game deterministically with fixed seed', () => {
    const res1 = simulateGame(12345, 4, 1000);
    const res2 = simulateGame(12345, 4, 1000);

    expect(res1.turns).toBe(res2.turns);
    expect(res1.winnerId).toBe(res2.winnerId);
    expect(res1.winnerNetWorth).toBe(res2.winnerNetWorth);
    expect(res1.turns).toBeGreaterThan(10);
  });

  it('runs 1000 full bot games without crashes or hangs', () => {
    const startTime = performance.now();
    const stats = runBulkSimulations(1000, 4, 1200);
    const duration = performance.now() - startTime;

    console.log('--- 1000 Bot Games Simulation Results ---');
    console.log(`Total games: ${stats.totalGames}`);
    console.log(`Completed by elimination: ${stats.completedGames}`);
    console.log(`Resolved by asset value timeout: ${stats.timedOutGames}`);
    console.log(`Average turns: ${stats.avgTurns}`);
    console.log(`Min turns: ${stats.minTurns}`);
    console.log(`Max turns: ${stats.maxTurns}`);
    console.log(`Win distribution:`, JSON.stringify(stats.winDistribution));
    console.log(`Win rate by seat (%):`, stats.winRateBySeat);
    console.log(`Total duration: ${Math.round(duration)}ms`);

    expect(stats.totalGames).toBe(1000);
    expect(stats.completedGames + stats.timedOutGames).toBe(1000);
    expect(stats.avgTurns).toBeGreaterThan(20);
    expect(stats.avgTurns).toBeLessThan(1200);

    // Ensure all 4 player seats won games
    for (let i = 0; i < 4; i++) {
      expect(stats.winRateBySeat[i]).toBeGreaterThan(5); // At least 5% win rate for each seat
    }
  }, 60000); // 60s timeout
});
