import { describe, it, expect } from 'vitest';
import { computeBoardLayout } from '../src/components/Board/GameBoard.js';

describe('52-Tile Board Layout Calculation', () => {
  const layout = computeBoardLayout();

  it('computes layout for exactly 52 tiles', () => {
    expect(layout).toHaveLength(52);
  });

  it('positions all 4 corners with corner dimensions', () => {
    const corners = layout.filter((l) => l.orientation === 'corner');
    expect(corners).toHaveLength(4);

    const cornerIndices = corners.map((c) => c.tile.index);
    expect(cornerIndices).toEqual([0, 13, 26, 39]);

    for (const c of corners) {
      expect(c.width).toBe(130);
      expect(c.height).toBe(130);
      expect(c.x).toBeGreaterThanOrEqual(0);
      expect(c.x + c.width).toBeLessThanOrEqual(1000);
      expect(c.y).toBeGreaterThanOrEqual(0);
      expect(c.y + c.height).toBeLessThanOrEqual(1000);
    }
  });

  it('positions exactly 12 tiles on each of the 4 sides', () => {
    const bottomTiles = layout.filter((l) => l.orientation === 'bottom');
    const leftTiles = layout.filter((l) => l.orientation === 'left');
    const topTiles = layout.filter((l) => l.orientation === 'top');
    const rightTiles = layout.filter((l) => l.orientation === 'right');

    expect(bottomTiles).toHaveLength(12);
    expect(leftTiles).toHaveLength(12);
    expect(topTiles).toHaveLength(12);
    expect(rightTiles).toHaveLength(12);
  });

  it('ensures all coordinates are finite numbers within 1000x1000 viewport', () => {
    for (const l of layout) {
      expect(Number.isFinite(l.x)).toBe(true);
      expect(Number.isFinite(l.y)).toBe(true);
      expect(Number.isFinite(l.centerX)).toBe(true);
      expect(Number.isFinite(l.centerY)).toBe(true);

      expect(l.x).toBeGreaterThanOrEqual(0);
      expect(l.x + l.width).toBeLessThanOrEqual(1000.01);
      expect(l.y).toBeGreaterThanOrEqual(0);
      expect(l.y + l.height).toBeLessThanOrEqual(1000.01);
    }
  });
});
