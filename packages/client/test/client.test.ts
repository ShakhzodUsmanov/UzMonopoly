import { describe, it, expect } from 'vitest';
import { CLIENT_CONFIG } from '../src/index.js';

describe('Client config', () => {
  it('exposes shared constants correctly', () => {
    expect(CLIENT_CONFIG.startCash).toBe(3000);
    expect(CLIENT_CONFIG.totalTiles).toBe(52);
  });
});
