import { describe, it, expect } from 'vitest';
import { BOARD_TILES, getTileByIndex, getTilesByGroup } from '../src/data/board.js';
import { IMKON_CARDS, XAZINA_CARDS } from '../src/data/cards.js';
import {
  GAME_CONFIG,
  calculateRent,
  calculateMortgageValue,
  calculateUnmortgageCost,
  calculateBuildingSellValue,
} from '../src/data/config.js';
import { COLOR_GROUPS, TOTAL_TILES } from '@uzmonopoly/shared';

describe('Board Data Integrity', () => {
  it('should have exactly 52 tiles indexed from 0 to 51', () => {
    expect(BOARD_TILES.length).toBe(TOTAL_TILES);
    expect(BOARD_TILES.length).toBe(52);

    BOARD_TILES.forEach((tile, idx) => {
      expect(tile.index).toBe(idx);
    });
  });

  it('should have exactly 4 corner tiles in the correct positions', () => {
    const corners = [
      { index: 0, type: 'START', name: 'Boshlash' },
      { index: 13, type: 'JAIL', name: 'Qamoqxona' },
      { index: 26, type: 'FREE_PARKING', name: 'Dam olish' },
      { index: 39, type: 'GO_TO_JAIL', name: 'Qamoqqa!' },
    ];

    corners.forEach((corner) => {
      const tile = getTileByIndex(corner.index);
      expect(tile.type).toBe(corner.type);
      expect(tile.name).toBe(corner.name);
    });
  });

  it('should have 14 color groups, each containing exactly 3 companies', () => {
    expect(COLOR_GROUPS.length).toBe(14);

    const properties = BOARD_TILES.filter((tile) => tile.type === 'PROPERTY');
    expect(properties.length).toBe(42);

    COLOR_GROUPS.forEach((group) => {
      const tilesInGroup = getTilesByGroup(group.id);
      expect(tilesInGroup.length).toBe(3);

      tilesInGroup.forEach((t) => {
        expect(t.houseCost).toBe(group.houseCost);
        expect(t.price).toBeGreaterThan(0);
        expect(t.baseRent).toBeGreaterThan(0);
      });
    });
  });

  it('should have 2 Xazina, 2 Imkon, and 2 Tax tiles', () => {
    const xazinaTiles = BOARD_TILES.filter((t) => t.type === 'COMMUNITY_CHEST');
    expect(xazinaTiles.map((t) => t.index)).toEqual([4, 20]);

    const imkonTiles = BOARD_TILES.filter((t) => t.type === 'CHANCE');
    expect(imkonTiles.map((t) => t.index)).toEqual([12, 25]);

    const taxTiles = BOARD_TILES.filter((t) => t.type === 'TAX');
    expect(taxTiles.map((t) => t.index)).toEqual([8, 24]);
    expect(taxTiles[0]?.taxAmount).toBe(200);
    expect(taxTiles[1]?.taxAmount).toBe(400);
  });

  it('should have non-decreasing company prices around the board', () => {
    const properties = BOARD_TILES.filter((tile) => tile.type === 'PROPERTY');
    for (let i = 1; i < properties.length; i++) {
      const prevPrice = properties[i - 1]?.price ?? 0;
      const currPrice = properties[i]?.price ?? 0;
      expect(currPrice).toBeGreaterThanOrEqual(prevPrice);
    }
  });

  it('should have correct house costs per side', () => {
    // Side 1: 50, Side 2: 100, Side 3: 150, Side 4: 200
    const properties = BOARD_TILES.filter((t) => t.type === 'PROPERTY');

    const side1 = properties.filter((t) => t.side === 1);
    const side2 = properties.filter((t) => t.side === 2);
    const side3 = properties.filter((t) => t.side === 3);
    const side4 = properties.filter((t) => t.side === 4);

    expect(side1.length).toBe(9);
    expect(side2.length).toBe(9);
    expect(side3.length).toBe(12);
    expect(side4.length).toBe(12);

    side1.forEach((t) => expect(t.houseCost).toBe(50));
    side2.forEach((t) => expect(t.houseCost).toBe(100));
    side3.forEach((t) => expect(t.houseCost).toBe(150));
    side4.forEach((t) => expect(t.houseCost).toBe(200));
  });
});

describe('Cards Data Integrity', () => {
  it('should have exactly 16 Imkon cards with full translations', () => {
    expect(IMKON_CARDS.length).toBe(16);
    IMKON_CARDS.forEach((card) => {
      expect(card.type).toBe('imkon');
      expect(card.title.uz).toBeTruthy();
      expect(card.title.ru).toBeTruthy();
      expect(card.title.en).toBeTruthy();
      expect(card.description.uz).toBeTruthy();
      expect(card.description.ru).toBeTruthy();
      expect(card.description.en).toBeTruthy();
    });
  });

  it('should have exactly 16 Xazina cards with full translations', () => {
    expect(XAZINA_CARDS.length).toBe(16);
    XAZINA_CARDS.forEach((card) => {
      expect(card.type).toBe('xazina');
      expect(card.title.uz).toBeTruthy();
      expect(card.title.ru).toBeTruthy();
      expect(card.title.en).toBeTruthy();
      expect(card.description.uz).toBeTruthy();
      expect(card.description.ru).toBeTruthy();
      expect(card.description.en).toBeTruthy();
    });
  });

  it('should contain Get Out of Jail Free cards in both decks', () => {
    const imkonJail = IMKON_CARDS.find((c) => c.actionType === 'GET_OUT_OF_JAIL_FREE');
    const xazinaJail = XAZINA_CARDS.find((c) => c.actionType === 'GET_OUT_OF_JAIL_FREE');
    expect(imkonJail).toBeDefined();
    expect(xazinaJail).toBeDefined();
  });
});

describe('Game Config and Formulas', () => {
  it('calculates rent correctly based on level, monopoly, and mortgage', () => {
    const base = 20;

    // Normal base
    expect(calculateRent(base, 0, false, false)).toBe(20);

    // Monopoly without houses = double rent
    expect(calculateRent(base, 0, true, false)).toBe(40);

    // 1 house: base * 5
    expect(calculateRent(base, 1, false, false)).toBe(100);
    expect(calculateRent(base, 1, true, false)).toBe(100);

    // 2 houses: base * 15
    expect(calculateRent(base, 2, false, false)).toBe(300);

    // 3 houses: base * 45
    expect(calculateRent(base, 3, false, false)).toBe(900);

    // 4 houses: base * 80
    expect(calculateRent(base, 4, false, false)).toBe(1600);

    // Hotel (5 houses): base * 125
    expect(calculateRent(base, 5, false, false)).toBe(2500);

    // Mortgaged: 0
    expect(calculateRent(base, 0, false, true)).toBe(0);
    expect(calculateRent(base, 3, false, true)).toBe(0);
  });

  it('calculates mortgage, unmortgage, and building sale correctly', () => {
    const price = 260;
    // mortgage = price / 2 = 130
    expect(calculateMortgageValue(price)).toBe(130);

    // unmortgage = ceil(130 * 1.1) = 143
    expect(calculateUnmortgageCost(price)).toBe(143);

    // odd number test: 220 / 2 = 110, unmortgage = 121
    expect(calculateMortgageValue(220)).toBe(110);
    expect(calculateUnmortgageCost(220)).toBe(121);

    // building sale: houseCost / 2
    expect(calculateBuildingSellValue(100)).toBe(50);
    expect(calculateBuildingSellValue(150)).toBe(75);
  });

  it('verifies game rules config constants', () => {
    expect(GAME_CONFIG.startCash).toBe(3000);
    expect(GAME_CONFIG.salaryPassGo).toBe(300);
    expect(GAME_CONFIG.jailFine).toBe(100);
    expect(GAME_CONFIG.maxDoublesBeforeJail).toBe(3);
    expect(GAME_CONFIG.maxJailTurns).toBe(3);
    expect(GAME_CONFIG.totalBankHouses).toBe(32);
    expect(GAME_CONFIG.totalBankHotels).toBe(12);
  });
});
