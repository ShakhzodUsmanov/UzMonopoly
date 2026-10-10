import type { GameState, ClientAction } from '@uzmonopoly/shared';
import { BOARD_TILES } from './data/board.js';
import { calculateUnmortgageCost } from './data/config.js';
import {
  getCurrentPlayer,
  getTileDef,
  hasAnyMortgagedInGroup,
  ownsEntireGroup,
  countBankBuildingsUsed,
} from './helpers.js';

export function decideBotAction(state: GameState, botId: string): ClientAction {
  const player = state.players.find((p) => p.id === botId);
  if (!player || player.bankrupt) {
    return { type: 'endTurn' };
  }

  // 1. Debt resolution
  if (state.phase === 'DEBT' && state.pendingDebt?.debtor === botId) {
    const debtAmount = state.pendingDebt.amount;
    if (player.cash >= debtAmount) {
      return { type: 'payDebt' };
    }

    // Try to sell buildings first
    for (const [idxStr, ts] of Object.entries(state.tiles)) {
      if (ts.ownerId === botId && ts.houses > 0) {
        const tileIdx = Number(idxStr);
        const def = BOARD_TILES[tileIdx];
        if (def?.group) {
          const groupTiles = BOARD_TILES.filter((t) => t.group === def.group);
          const maxHouses = Math.max(...groupTiles.map((t) => state.tiles[t.index]?.houses ?? 0));
          if (ts.houses === maxHouses) {
            return { type: 'sellBuilding', tileId: tileIdx };
          }
        }
      }
    }

    // Try to mortgage properties
    for (const [idxStr, ts] of Object.entries(state.tiles)) {
      if (ts.ownerId === botId && !ts.mortgaged) {
        const tileIdx = Number(idxStr);
        const def = BOARD_TILES[tileIdx];
        if (def?.group) {
          const groupTiles = BOARD_TILES.filter((t) => t.group === def.group);
          const hasHousesInGroup = groupTiles.some((t) => (state.tiles[t.index]?.houses ?? 0) > 0);
          if (!hasHousesInGroup) {
            return { type: 'mortgage', tileId: tileIdx };
          }
        }
      }
    }

    // Cannot raise more cash -> declare bankruptcy
    return { type: 'declareBankruptcy' };
  }

  // 2. Auction participation
  if (state.phase === 'AUCTION' && state.auction) {
    const auction = state.auction;
    if (!auction.active.includes(botId)) {
      return { type: 'passAuction' };
    }
    if (auction.highBidder === botId) {
      // Already highest bidder, wait or pass
      return { type: 'passAuction' };
    }

    const tile = getTileDef(auction.tileId);
    const tilePrice = tile.price ?? 100;

    // Check if completing monopoly
    const completesMonopoly = tile.group
      ? BOARD_TILES.filter((t) => t.group === tile.group).filter(
          (t) => t.index !== tile.index && state.tiles[t.index]?.ownerId === botId,
        ).length === 2
      : false;

    const maxBudget = completesMonopoly
      ? Math.floor(player.cash * 0.8)
      : Math.min(Math.floor(player.cash * 0.5), Math.floor(tilePrice * 0.9));

    const nextBid = auction.highBid === 0 ? 10 : auction.highBid + 10;
    if (nextBid <= maxBudget && nextBid <= player.cash) {
      return { type: 'bid', amount: nextBid };
    }
    return { type: 'passAuction' };
  }

  // 3. Trade responses
  if (state.pendingTrade && state.pendingTrade.targetId === botId) {
    // Simple trade evaluation: accept if net value gained > net value given
    const trade = state.pendingTrade;
    const valueGained = trade.initiatorMoney + trade.initiatorTiles.length * 150;
    const valueGiven = trade.targetMoney + trade.targetTiles.length * 150;
    return {
      type: 'answerTrade',
      tradeId: trade.id,
      accept: valueGained >= valueGiven,
    };
  }

  // 4. Must be current player for remaining phases
  const current = getCurrentPlayer(state);
  if (current.id !== botId) {
    return { type: 'passAuction' };
  }

  // 5. Jail phase
  if (state.phase === 'JAIL') {
    if (player.jailCards > 0) {
      return { type: 'useJailCard' };
    }
    if (player.cash >= 600) {
      return { type: 'payJailFine' };
    }
    return { type: 'rollDice' };
  }

  // 6. Roll phase
  if (state.phase === 'ROLL') {
    return { type: 'rollDice' };
  }

  // 7. Buy decision
  if (state.phase === 'BUY_DECISION') {
    const tile = getTileDef(player.position);
    const price = tile.price ?? 0;

    // Check if completing monopoly
    const completesMonopoly = tile.group
      ? BOARD_TILES.filter((t) => t.group === tile.group).filter(
          (t) => t.index !== tile.index && state.tiles[t.index]?.ownerId === botId,
        ).length === 2
      : false;

    if (completesMonopoly && player.cash >= price) {
      return { type: 'buy' };
    }

    // Keep reserve of at least 200 so'm
    if (player.cash >= price + 200) {
      return { type: 'buy' };
    }

    return { type: 'declineBuy' };
  }

  // 8. Post-roll phase
  if (state.phase === 'POST_ROLL') {
    // A. Check building houses
    const bankBuildings = countBankBuildingsUsed(state);
    for (const [idxStr, ts] of Object.entries(state.tiles)) {
      if (ts.ownerId === botId) {
        const tileIdx = Number(idxStr);
        const def = BOARD_TILES[tileIdx];
        if (def?.group && ts.houses < 5) {
          if (
            ownsEntireGroup(state, botId, def.group) &&
            !hasAnyMortgagedInGroup(state, def.group)
          ) {
            const houseCost = def.houseCost ?? 50;
            // Check uniform rule
            const groupTiles = BOARD_TILES.filter((t) => t.group === def.group);
            const minHouses = Math.min(...groupTiles.map((t) => state.tiles[t.index]?.houses ?? 0));

            if (ts.houses === minHouses && player.cash >= houseCost + 300) {
              if (
                (ts.houses < 4 && bankBuildings.houses < 32) ||
                (ts.houses === 4 && bankBuildings.hotels < 12)
              ) {
                return { type: 'build', tileId: tileIdx };
              }
            }
          }
        }
      }
    }

    // B. Check unmortgage
    for (const [idxStr, ts] of Object.entries(state.tiles)) {
      if (ts.ownerId === botId && ts.mortgaged) {
        const tileIdx = Number(idxStr);
        const def = BOARD_TILES[tileIdx];
        if (def?.price) {
          const cost = calculateUnmortgageCost(def.price);
          if (player.cash >= cost + 400) {
            return { type: 'unmortgage', tileId: tileIdx };
          }
        }
      }
    }

    return { type: 'endTurn' };
  }

  return { type: 'endTurn' };
}
