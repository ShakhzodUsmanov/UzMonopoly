export interface GameRulesConfig {
  currency: string;
  startCash: number;
  salaryPassGo: number;
  jailFine: number;
  maxJailTurns: number;
  maxDoublesBeforeJail: number;
  maxHousesPerTile: number;
  hotelLevel: number;
  totalBankHouses: number;
  totalBankHotels: number;
  rentLevelMultipliers: readonly [number, number, number, number, number, number];
  monopolyMultiplier: number;
  mortgageFactor: number;
  unmortgageInterestFactor: number;
  buildingSaleFactor: number;
  defaultTurnTimeoutSec: number;
  auctionTimeoutSec: number;
  reconnectTimeoutSec: number;
}

export const GAME_CONFIG: GameRulesConfig = {
  currency: "so'm",
  startCash: 3000,
  salaryPassGo: 300,
  jailFine: 100,
  maxJailTurns: 3,
  maxDoublesBeforeJail: 3,
  maxHousesPerTile: 4,
  hotelLevel: 5,
  totalBankHouses: 32,
  totalBankHotels: 12,
  rentLevelMultipliers: [1, 5, 15, 45, 80, 125] as const,
  monopolyMultiplier: 2,
  mortgageFactor: 0.5,
  unmortgageInterestFactor: 1.1,
  buildingSaleFactor: 0.5,
  defaultTurnTimeoutSec: 60,
  auctionTimeoutSec: 20,
  reconnectTimeoutSec: 60,
};

/**
 * Calculate the rent of a property.
 * @param baseRent Base rent of the property (level 0)
 * @param houses Number of houses (0 to 4), or 5 for hotel
 * @param hasMonopoly Whether the owner has all properties of the group
 * @param mortgaged Whether the property is mortgaged
 */
export function calculateRent(
  baseRent: number,
  houses: number,
  hasMonopoly: boolean,
  mortgaged: boolean,
): number {
  if (mortgaged) {
    return 0;
  }
  if (houses <= 0) {
    return hasMonopoly ? baseRent * GAME_CONFIG.monopolyMultiplier : baseRent;
  }
  const level = Math.min(houses, GAME_CONFIG.hotelLevel);
  const multiplier = GAME_CONFIG.rentLevelMultipliers[level] ?? 1;
  return baseRent * multiplier;
}

/**
 * Mortgage value for a tile: price / 2
 */
export function calculateMortgageValue(price: number): number {
  return Math.floor(price * GAME_CONFIG.mortgageFactor);
}

/**
 * Unmortgage cost: mortgageValue * 1.1 (rounded up)
 */
export function calculateUnmortgageCost(price: number): number {
  const mortgageVal = calculateMortgageValue(price);
  return Math.ceil((mortgageVal * 11) / 10);
}

/**
 * Building sell value: half of the house cost
 */
export function calculateBuildingSellValue(houseCost: number): number {
  return Math.floor(houseCost * GAME_CONFIG.buildingSaleFactor);
}
