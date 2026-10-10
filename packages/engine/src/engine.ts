import type { GameState, ClientAction, GameEvent } from '@uzmonopoly/shared';
import { BOARD_TILES } from './data/board.js';
import {
  GAME_CONFIG,
  calculateBuildingSellValue,
  calculateMortgageValue,
  calculateUnmortgageCost,
} from './data/config.js';
import {
  cloneState,
  createEvent,
  getCurrentPlayer,
  getNextActivePlayerIndex,
  getTileDef,
  hasAnyMortgagedInGroup,
  ownsEntireGroup,
  countBankBuildingsUsed,
  checkGameOver,
} from './helpers.js';
import { resolveTileLanding } from './cards/applyCard.js';
import type { RNG } from './rng.js';

export type ActionResult =
  | { success: true; state: GameState; events: GameEvent[] }
  | { success: false; error: string; code?: string };

export function applyAction(
  prevState: GameState,
  playerId: string,
  action: ClientAction,
  rng: RNG,
  inPlace = false,
): ActionResult {
  const state = inPlace ? prevState : cloneState(prevState);
  const events: GameEvent[] = [];

  const player = state.players.find((p) => p.id === playerId);
  if (!player) {
    return { success: false, error: 'Player not found in game', code: 'PLAYER_NOT_FOUND' };
  }

  if (player.bankrupt && action.type !== 'chat') {
    return {
      success: false,
      error: 'Bankrupt player cannot perform actions',
      code: 'PLAYER_BANKRUPT',
    };
  }

  if (state.phase === 'GAME_OVER' && action.type !== 'chat') {
    return { success: false, error: 'Game is already over', code: 'GAME_OVER' };
  }

  switch (action.type) {
    case 'chat': {
      events.push(
        createEvent(
          state,
          'CHAT',
          {
            uz: `${player.name}: ${action.text}`,
            ru: `${player.name}: ${action.text}`,
            en: `${player.name}: ${action.text}`,
          },
          player.id,
          { text: action.text },
        ),
      );
      return { success: true, state, events };
    }

    case 'ready':
    case 'setToken':
    case 'startGame': {
      // Lobby-level actions handled by server room or ignored in active game
      return { success: true, state, events };
    }

    case 'payJailFine': {
      if (state.phase !== 'JAIL') {
        return { success: false, error: 'Not in jail phase', code: 'INVALID_PHASE' };
      }
      if (getCurrentPlayer(state).id !== playerId) {
        return { success: false, error: 'Not your turn', code: 'NOT_YOUR_TURN' };
      }
      if (player.cash < GAME_CONFIG.jailFine) {
        return { success: false, error: 'Not enough cash for jail fine', code: 'NOT_ENOUGH_CASH' };
      }

      player.cash -= GAME_CONFIG.jailFine;
      player.inJail = false;
      player.jailTurns = 0;
      state.phase = 'ROLL';

      events.push(
        createEvent(
          state,
          'PAY_JAIL_FINE',
          {
            uz: `${player.name} qamoqdan chiqish uchun ${GAME_CONFIG.jailFine} so‘m jarima to‘ladi.`,
            ru: `${player.name} заплатил(а) штраф ${GAME_CONFIG.jailFine} so'm и вышел(а) из тюрьмы.`,
            en: `${player.name} paid ${GAME_CONFIG.jailFine} so'm fine and got out of Jail.`,
          },
          player.id,
          { amount: GAME_CONFIG.jailFine },
        ),
      );
      return { success: true, state, events };
    }

    case 'useJailCard': {
      if (state.phase !== 'JAIL') {
        return { success: false, error: 'Not in jail phase', code: 'INVALID_PHASE' };
      }
      if (getCurrentPlayer(state).id !== playerId) {
        return { success: false, error: 'Not your turn', code: 'NOT_YOUR_TURN' };
      }
      if (player.jailCards <= 0) {
        return { success: false, error: 'No jail card available', code: 'NO_JAIL_CARD' };
      }

      player.jailCards -= 1;
      player.inJail = false;
      player.jailTurns = 0;
      state.decks.imkon.push(9); // return to deck
      state.phase = 'ROLL';

      events.push(
        createEvent(
          state,
          'USE_JAIL_CARD',
          {
            uz: `${player.name} ozodlik kartasini ishlatib qamoqdan chiqdi.`,
            ru: `${player.name} использовал(а) карточку освобождения и вышел(а) из тюрьмы.`,
            en: `${player.name} used a Get Out of Jail Free card.`,
          },
          player.id,
        ),
      );
      return { success: true, state, events };
    }

    case 'rollDice': {
      const isCurrentTurn = getCurrentPlayer(state).id === playerId;
      if (!isCurrentTurn) {
        return { success: false, error: 'Not your turn to roll', code: 'NOT_YOUR_TURN' };
      }
      if (state.phase !== 'ROLL' && state.phase !== 'JAIL') {
        return {
          success: false,
          error: `Cannot roll in phase ${state.phase}`,
          code: 'INVALID_PHASE',
        };
      }

      const d1 = rng.nextInt(1, 6);
      const d2 = rng.nextInt(1, 6);
      state.lastDice = [d1, d2];
      const isDouble = d1 === d2;

      events.push(
        createEvent(
          state,
          'DICE_ROLLED',
          {
            uz: `${player.name} ${d1} va ${d2} tashladi (jami ${d1 + d2}).`,
            ru: `${player.name} бросил(а) ${d1} и ${d2} (сумма ${d1 + d2}).`,
            en: `${player.name} rolled ${d1} and ${d2} (sum ${d1 + d2}).`,
          },
          player.id,
          { dice: [d1, d2], isDouble },
        ),
      );

      if (state.phase === 'JAIL') {
        if (isDouble) {
          player.inJail = false;
          player.jailTurns = 0;
          state.doublesCount = 0;
          events.push(
            createEvent(
              state,
              'JAIL_DOUBLES_ESCAPE',
              {
                uz: `${player.name} dubl tashlab qamoqdan chiqdi!`,
                ru: `${player.name} выбросил(а) дубль и освободился(лась) из тюрьмы!`,
                en: `${player.name} rolled doubles and got out of Jail!`,
              },
              player.id,
            ),
          );
          // Move the roll distance
          const newPos = (player.position + d1 + d2) % 52;
          player.position = newPos;
          resolveTileLanding(state, player, newPos, events, rng);
        } else {
          player.jailTurns += 1;
          if (player.jailTurns >= GAME_CONFIG.maxJailTurns) {
            // Must pay fine after 3rd attempt
            if (player.cash >= GAME_CONFIG.jailFine) {
              player.cash -= GAME_CONFIG.jailFine;
              player.inJail = false;
              player.jailTurns = 0;
              const newPos = (player.position + d1 + d2) % 52;
              player.position = newPos;
              resolveTileLanding(state, player, newPos, events, rng);
            } else {
              state.pendingDebt = {
                debtor: player.id,
                creditor: undefined,
                amount: GAME_CONFIG.jailFine,
                reason: 'JAIL_FINE',
              };
              state.phase = 'DEBT';
            }
          } else {
            state.phase = 'POST_ROLL';
          }
        }
        return { success: true, state, events };
      }

      // Normal ROLL phase
      if (isDouble) {
        state.doublesCount += 1;
        if (state.doublesCount >= GAME_CONFIG.maxDoublesBeforeJail) {
          player.position = 13;
          player.inJail = true;
          player.jailTurns = 0;
          state.doublesCount = 0;
          state.phase = 'POST_ROLL';
          events.push(
            createEvent(
              state,
              'THREE_DOUBLES_TO_JAIL',
              {
                uz: `${player.name} ketma-ket 3 ta dubl tashlab qamoqqa tushdi!`,
                ru: `${player.name} выбросил 3 дубля подряд и отправляется в тюрьму!`,
                en: `${player.name} rolled three doubles in a row and went to Jail!`,
              },
              player.id,
            ),
          );
          return { success: true, state, events };
        }
      } else {
        state.doublesCount = 0;
      }

      // Move player
      const oldPos = player.position;
      const newPos = (oldPos + d1 + d2) % 52;

      if (newPos < oldPos) {
        // Passed GO (Boshlash)
        player.cash += GAME_CONFIG.salaryPassGo;
        events.push(
          createEvent(
            state,
            'PASS_GO',
            {
              uz: `${player.name} «Boshlash»dan o‘tib ${GAME_CONFIG.salaryPassGo} so‘m oldi.`,
              ru: `${player.name} прошел «Boshlash» и получил ${GAME_CONFIG.salaryPassGo} so'm.`,
              en: `${player.name} passed GO and collected ${GAME_CONFIG.salaryPassGo} so'm.`,
            },
            player.id,
            { amount: GAME_CONFIG.salaryPassGo },
          ),
        );
      }

      player.position = newPos;
      events.push(
        createEvent(
          state,
          'MOVE',
          {
            uz: `${player.name} ${newPos}-katakka («${BOARD_TILES[newPos]?.name}») qadam qo‘ydi.`,
            ru: `${player.name} перешел на поле ${newPos} («${BOARD_TILES[newPos]?.name}»).`,
            en: `${player.name} landed on tile ${newPos} ("${BOARD_TILES[newPos]?.name}").`,
          },
          player.id,
          { position: newPos },
        ),
      );

      resolveTileLanding(state, player, newPos, events, rng);
      return { success: true, state, events };
    }

    case 'buy': {
      if (state.phase !== 'BUY_DECISION') {
        return { success: false, error: 'Not in buy decision phase', code: 'INVALID_PHASE' };
      }
      if (getCurrentPlayer(state).id !== playerId) {
        return { success: false, error: 'Not your turn to buy', code: 'NOT_YOUR_TURN' };
      }

      const tile = getTileDef(player.position);
      const tileState = state.tiles[player.position]!;
      if (tile.type !== 'PROPERTY' || tileState.ownerId !== undefined) {
        return {
          success: false,
          error: 'Tile is not available for purchase',
          code: 'TILE_NOT_AVAILABLE',
        };
      }

      const price = tile.price ?? 0;
      if (player.cash < price) {
        return {
          success: false,
          error: 'Not enough cash to buy property',
          code: 'NOT_ENOUGH_CASH',
        };
      }

      player.cash -= price;
      tileState.ownerId = player.id;
      state.phase = 'POST_ROLL';

      events.push(
        createEvent(
          state,
          'BUY_PROPERTY',
          {
            uz: `${player.name} «${tile.name}» mulkini ${price} so‘mga sotib oldi.`,
            ru: `${player.name} купил(а) «${tile.name}» за ${price} so'm.`,
            en: `${player.name} bought "${tile.name}" for ${price} so'm.`,
          },
          player.id,
          { tileIndex: player.position, price },
        ),
      );
      return { success: true, state, events };
    }

    case 'declineBuy': {
      if (state.phase !== 'BUY_DECISION') {
        return { success: false, error: 'Not in buy decision phase', code: 'INVALID_PHASE' };
      }
      if (getCurrentPlayer(state).id !== playerId) {
        return { success: false, error: 'Not your turn', code: 'NOT_YOUR_TURN' };
      }

      const tile = getTileDef(player.position);
      // Trigger auction!
      const activeBidders = state.players.filter((p) => !p.bankrupt).map((p) => p.id);
      state.phase = 'AUCTION';
      state.auction = {
        tileId: player.position,
        highBid: 0,
        highBidder: undefined,
        active: activeBidders,
        endsAt: 0,
      };

      events.push(
        createEvent(
          state,
          'AUCTION_STARTED',
          {
            uz: `${player.name} xarid qilishdan bosh tortdi. «${tile.name}» auksionga qo‘yildi!`,
            ru: `${player.name} отказался от покупки. «${tile.name}» выставлен на аукцион!`,
            en: `${player.name} declined to buy. "${tile.name}" is now on auction!`,
          },
          player.id,
          { tileIndex: player.position },
        ),
      );
      return { success: true, state, events };
    }

    case 'bid': {
      if (state.phase !== 'AUCTION' || !state.auction) {
        return { success: false, error: 'No active auction', code: 'NO_AUCTION' };
      }
      if (!state.auction.active.includes(playerId)) {
        return {
          success: false,
          error: 'Player is not active in this auction',
          code: 'NOT_IN_AUCTION',
        };
      }
      if (action.amount <= state.auction.highBid) {
        return {
          success: false,
          error: `Bid must be strictly higher than current bid of ${state.auction.highBid}`,
          code: 'BID_TOO_LOW',
        };
      }
      if (player.cash < action.amount) {
        return { success: false, error: 'Not enough cash for bid', code: 'NOT_ENOUGH_CASH' };
      }

      state.auction.highBid = action.amount;
      state.auction.highBidder = playerId;

      events.push(
        createEvent(
          state,
          'AUCTION_BID',
          {
            uz: `${player.name} ${action.amount} so‘m taklif qildi.`,
            ru: `${player.name} сделал(а) ставку ${action.amount} so'm.`,
            en: `${player.name} placed a bid of ${action.amount} so'm.`,
          },
          player.id,
          { amount: action.amount },
        ),
      );
      return { success: true, state, events };
    }

    case 'passAuction': {
      if (state.phase !== 'AUCTION' || !state.auction) {
        return { success: false, error: 'No active auction', code: 'NO_AUCTION' };
      }
      if (!state.auction.active.includes(playerId)) {
        return {
          success: false,
          error: 'Player already passed or not in auction',
          code: 'NOT_IN_AUCTION',
        };
      }

      state.auction.active = state.auction.active.filter((id) => id !== playerId);
      events.push(
        createEvent(
          state,
          'AUCTION_PASS',
          {
            uz: `${player.name} auksionda pas berdi.`,
            ru: `${player.name} спасовал(а) на аукционе.`,
            en: `${player.name} passed on the auction.`,
          },
          player.id,
        ),
      );

      // Check if auction ends
      const { highBidder, highBid, tileId, active } = state.auction;
      const tile = getTileDef(tileId);

      // If everyone passed or only 1 active bidder remains who is the high bidder
      if (active.length === 0 || (active.length === 1 && highBidder && active[0] === highBidder)) {
        if (highBidder) {
          const winner = state.players.find((p) => p.id === highBidder)!;
          winner.cash -= highBid;
          state.tiles[tileId]!.ownerId = winner.id;

          events.push(
            createEvent(
              state,
              'AUCTION_WON',
              {
                uz: `${winner.name} «${tile.name}»ni auksionda ${highBid} so‘mga yutib oldi!`,
                ru: `${winner.name} выиграл(а) «${tile.name}» на аукционе за ${highBid} so'm!`,
                en: `${winner.name} won "${tile.name}" at auction for ${highBid} so'm!`,
              },
              winner.id,
              { tileId, highBid },
            ),
          );
        } else {
          events.push(
            createEvent(
              state,
              'AUCTION_ENDED_NO_BIDS',
              {
                uz: `Hech kim taklif bermadi. «${tile.name}» sotilmadi.`,
                ru: `Никто не сделал ставок. «${tile.name}» остался не купленным.`,
                en: `No bids placed. "${tile.name}" remains unsold.`,
              },
              undefined,
              { tileId },
            ),
          );
        }

        state.auction = undefined;
        state.phase = 'POST_ROLL';
      }

      return { success: true, state, events };
    }

    case 'build': {
      const tile = getTileDef(action.tileId);
      const tileState = state.tiles[action.tileId]!;

      if (tile.type !== 'PROPERTY' || !tile.group) {
        return { success: false, error: 'Cannot build on non-property tile', code: 'INVALID_TILE' };
      }
      if (tileState.ownerId !== playerId) {
        return { success: false, error: 'You do not own this tile', code: 'NOT_OWNER' };
      }
      if (!ownsEntireGroup(state, playerId, tile.group)) {
        return {
          success: false,
          error: 'Must own entire color group to build',
          code: 'NO_MONOPOLY',
        };
      }
      if (hasAnyMortgagedInGroup(state, tile.group)) {
        return {
          success: false,
          error: 'Cannot build if any property in group is mortgaged',
          code: 'GROUP_MORTGAGED',
        };
      }
      if (tileState.houses >= GAME_CONFIG.hotelLevel) {
        return { success: false, error: 'Tile already has a hotel', code: 'MAX_BUILDINGS' };
      }

      const houseCost = tile.houseCost ?? 50;
      if (player.cash < houseCost) {
        return { success: false, error: 'Not enough cash to build', code: 'NOT_ENOUGH_CASH' };
      }

      // Bank building limits check
      const bankBuildings = countBankBuildingsUsed(state);
      if (tileState.houses === GAME_CONFIG.maxHousesPerTile) {
        // Upgrading to hotel
        if (bankBuildings.hotels >= GAME_CONFIG.totalBankHotels) {
          return { success: false, error: 'No hotels left in bank', code: 'NO_HOTELS_LEFT' };
        }
      } else {
        // Building a house
        if (bankBuildings.houses >= GAME_CONFIG.totalBankHouses) {
          return { success: false, error: 'No houses left in bank', code: 'NO_HOUSES_LEFT' };
        }
      }

      // Uniform building rule: tile houses cannot exceed min houses in group before build
      const groupTiles = BOARD_TILES.filter((t) => t.group === tile.group);
      const minHouses = Math.min(...groupTiles.map((t) => state.tiles[t.index]?.houses ?? 0));
      if (tileState.houses > minHouses) {
        return {
          success: false,
          error: 'Must build evenly across color group',
          code: 'UNIFORM_BUILD_VIOLATION',
        };
      }

      player.cash -= houseCost;
      tileState.houses += 1;

      const isHotel = tileState.houses === GAME_CONFIG.hotelLevel;
      events.push(
        createEvent(
          state,
          'BUILD',
          {
            uz: `${player.name} «${tile.name}»da ${isHotel ? 'mehmonxona' : 'uy'} qurdi (${houseCost} so‘m).`,
            ru: `${player.name} построил(а) ${isHotel ? 'отель' : 'дом'} на «${tile.name}» (${houseCost} so'm).`,
            en: `${player.name} built a ${isHotel ? 'hotel' : 'house'} on "${tile.name}" (${houseCost} so'm).`,
          },
          player.id,
          { tileId: action.tileId, houses: tileState.houses, cost: houseCost },
        ),
      );
      return { success: true, state, events };
    }

    case 'sellBuilding': {
      const tile = getTileDef(action.tileId);
      const tileState = state.tiles[action.tileId]!;

      if (tileState.ownerId !== playerId) {
        return { success: false, error: 'You do not own this tile', code: 'NOT_OWNER' };
      }
      if (tileState.houses <= 0) {
        return { success: false, error: 'Tile has no buildings to sell', code: 'NO_BUILDINGS' };
      }

      // Uniform selling rule: tile houses cannot be less than max houses in group before sale
      const groupTiles = BOARD_TILES.filter((t) => t.group === tile.group);
      const maxHouses = Math.max(...groupTiles.map((t) => state.tiles[t.index]?.houses ?? 0));
      if (tileState.houses < maxHouses) {
        return {
          success: false,
          error: 'Must sell buildings evenly across color group',
          code: 'UNIFORM_SELL_VIOLATION',
        };
      }

      const refund = calculateBuildingSellValue(tile.houseCost ?? 50);
      tileState.houses -= 1;
      player.cash += refund;

      events.push(
        createEvent(
          state,
          'SELL_BUILDING',
          {
            uz: `${player.name} «${tile.name}»dagi binoni sotdi va ${refund} so‘m oldi.`,
            ru: `${player.name} продал(а) постройку на «${tile.name}» и получил(а) ${refund} so'm.`,
            en: `${player.name} sold building on "${tile.name}" for ${refund} so'm.`,
          },
          player.id,
          { tileId: action.tileId, refund, housesLeft: tileState.houses },
        ),
      );
      return { success: true, state, events };
    }

    case 'mortgage': {
      const tile = getTileDef(action.tileId);
      const tileState = state.tiles[action.tileId]!;

      if (tileState.ownerId !== playerId) {
        return { success: false, error: 'You do not own this tile', code: 'NOT_OWNER' };
      }
      if (tileState.mortgaged) {
        return { success: false, error: 'Tile is already mortgaged', code: 'ALREADY_MORTGAGED' };
      }

      // Check group has 0 buildings
      if (tile.group) {
        const groupTiles = BOARD_TILES.filter((t) => t.group === tile.group);
        const hasBuildings = groupTiles.some((t) => (state.tiles[t.index]?.houses ?? 0) > 0);
        if (hasBuildings) {
          return {
            success: false,
            error: 'Cannot mortgage property while group has buildings',
            code: 'GROUP_HAS_BUILDINGS',
          };
        }
      }

      const mortgageVal = calculateMortgageValue(tile.price ?? 0);
      tileState.mortgaged = true;
      player.cash += mortgageVal;

      events.push(
        createEvent(
          state,
          'MORTGAGE',
          {
            uz: `${player.name} «${tile.name}»ni garovga qo‘ydi va ${mortgageVal} so‘m oldi.`,
            ru: `${player.name} заложил(а) «${tile.name}» и получил(а) ${mortgageVal} so'm.`,
            en: `${player.name} mortgaged "${tile.name}" for ${mortgageVal} so'm.`,
          },
          player.id,
          { tileId: action.tileId, mortgageValue: mortgageVal },
        ),
      );
      return { success: true, state, events };
    }

    case 'unmortgage': {
      const tile = getTileDef(action.tileId);
      const tileState = state.tiles[action.tileId]!;

      if (tileState.ownerId !== playerId) {
        return { success: false, error: 'You do not own this tile', code: 'NOT_OWNER' };
      }
      if (!tileState.mortgaged) {
        return { success: false, error: 'Tile is not mortgaged', code: 'NOT_MORTGAGED' };
      }

      const unmortgageCost = calculateUnmortgageCost(tile.price ?? 0);
      if (player.cash < unmortgageCost) {
        return { success: false, error: 'Not enough cash to unmortgage', code: 'NOT_ENOUGH_CASH' };
      }

      player.cash -= unmortgageCost;
      tileState.mortgaged = false;

      events.push(
        createEvent(
          state,
          'UNMORTGAGE',
          {
            uz: `${player.name} «${tile.name}»ni garovdan ${unmortgageCost} so‘mga qaytarib oldi.`,
            ru: `${player.name} выкупил(а) «${tile.name}» из залога за ${unmortgageCost} so'm.`,
            en: `${player.name} unmortgaged "${tile.name}" for ${unmortgageCost} so'm.`,
          },
          player.id,
          { tileId: action.tileId, cost: unmortgageCost },
        ),
      );
      return { success: true, state, events };
    }

    case 'proposeTrade': {
      if (state.pendingTrade) {
        return { success: false, error: 'A trade is already pending', code: 'TRADE_PENDING' };
      }
      if (action.targetId === playerId) {
        return { success: false, error: 'Cannot trade with yourself', code: 'INVALID_TARGET' };
      }
      const target = state.players.find((p) => p.id === action.targetId);
      if (!target || target.bankrupt) {
        return {
          success: false,
          error: 'Target player not found or bankrupt',
          code: 'TARGET_UNAVAILABLE',
        };
      }
      if (player.cash < action.initiatorMoney || player.jailCards < action.initiatorJailCards) {
        return {
          success: false,
          error: 'Initiator lacks offered resources',
          code: 'INSUFFICIENT_ASSETS',
        };
      }

      // Check all initiator tiles
      for (const tId of action.initiatorTiles) {
        const tDef = getTileDef(tId);
        const tState = state.tiles[tId]!;
        if (tState.ownerId !== playerId) {
          return {
            success: false,
            error: 'Initiator does not own offered tile',
            code: 'NOT_OWNER',
          };
        }
        if (tDef.group) {
          const groupTiles = BOARD_TILES.filter((t) => t.group === tDef.group);
          if (groupTiles.some((t) => (state.tiles[t.index]?.houses ?? 0) > 0)) {
            return {
              success: false,
              error: 'Cannot trade property when group has buildings',
              code: 'BUILDINGS_EXIST',
            };
          }
        }
      }

      // Check target tiles
      for (const tId of action.targetTiles) {
        const tDef = getTileDef(tId);
        const tState = state.tiles[tId]!;
        if (tState.ownerId !== target.id) {
          return {
            success: false,
            error: 'Target player does not own requested tile',
            code: 'TARGET_NOT_OWNER',
          };
        }
        if (tDef.group) {
          const groupTiles = BOARD_TILES.filter((t) => t.group === tDef.group);
          if (groupTiles.some((t) => (state.tiles[t.index]?.houses ?? 0) > 0)) {
            return {
              success: false,
              error: 'Cannot trade property when group has buildings',
              code: 'BUILDINGS_EXIST',
            };
          }
        }
      }

      state.pendingTrade = {
        id: `trade-${state.seq + 1}`,
        initiatorId: playerId,
        targetId: action.targetId,
        initiatorMoney: action.initiatorMoney,
        targetMoney: action.targetMoney,
        initiatorTiles: action.initiatorTiles,
        targetTiles: action.targetTiles,
        initiatorJailCards: action.initiatorJailCards,
        targetJailCards: action.targetJailCards,
      };

      events.push(
        createEvent(
          state,
          'TRADE_PROPOSED',
          {
            uz: `${player.name} ${target.name}ga ayirboshlash taklifini yubordi.`,
            ru: `${player.name} предложил(а) сделку игроку ${target.name}.`,
            en: `${player.name} proposed a trade to ${target.name}.`,
          },
          player.id,
          { tradeId: state.pendingTrade.id },
        ),
      );
      return { success: true, state, events };
    }

    case 'answerTrade': {
      if (!state.pendingTrade || state.pendingTrade.id !== action.tradeId) {
        return { success: false, error: 'No matching pending trade', code: 'NO_MATCHING_TRADE' };
      }
      if (state.pendingTrade.targetId !== playerId) {
        return { success: false, error: 'Only target player can answer trade', code: 'NOT_TARGET' };
      }

      const trade = state.pendingTrade;
      const initiator = state.players.find((p) => p.id === trade.initiatorId)!;
      const target = player;

      if (!action.accept) {
        state.pendingTrade = undefined;
        events.push(
          createEvent(
            state,
            'TRADE_REJECTED',
            {
              uz: `${target.name} ${initiator.name}ning ayirboshlash taklifini rad etdi.`,
              ru: `${target.name} отклонил(а) предложение сделки от ${initiator.name}.`,
              en: `${target.name} rejected trade offer from ${initiator.name}.`,
            },
            target.id,
          ),
        );
        return { success: true, state, events };
      }

      // Check both still have resources
      if (
        initiator.cash < trade.initiatorMoney ||
        initiator.jailCards < trade.initiatorJailCards ||
        target.cash < trade.targetMoney ||
        target.jailCards < trade.targetJailCards
      ) {
        state.pendingTrade = undefined;
        return {
          success: false,
          error: 'Trade cancelled: insufficient assets',
          code: 'TRADE_ASSETS_CHANGED',
        };
      }

      // Swap money
      initiator.cash -= trade.initiatorMoney;
      target.cash += trade.initiatorMoney;

      target.cash -= trade.targetMoney;
      initiator.cash += trade.targetMoney;

      // Swap jail cards
      initiator.jailCards -= trade.initiatorJailCards;
      target.jailCards += trade.initiatorJailCards;

      target.jailCards -= trade.targetJailCards;
      initiator.jailCards += trade.targetJailCards;

      // Swap tiles
      for (const tId of trade.initiatorTiles) {
        state.tiles[tId]!.ownerId = target.id;
      }
      for (const tId of trade.targetTiles) {
        state.tiles[tId]!.ownerId = initiator.id;
      }

      state.pendingTrade = undefined;
      events.push(
        createEvent(
          state,
          'TRADE_ACCEPTED',
          {
            uz: `${target.name} va ${initiator.name} o‘rtasida ayirboshlash amalga oshdi!`,
            ru: `Сделка между ${target.name} и ${initiator.name} успешно завершена!`,
            en: `Trade between ${target.name} and ${initiator.name} was completed!`,
          },
          target.id,
        ),
      );
      return { success: true, state, events };
    }

    case 'payDebt': {
      if (state.phase !== 'DEBT' || !state.pendingDebt) {
        return { success: false, error: 'No active debt to pay', code: 'NO_DEBT' };
      }
      if (state.pendingDebt.debtor !== playerId) {
        return { success: false, error: 'You are not the debtor', code: 'NOT_DEBTOR' };
      }
      if (player.cash < state.pendingDebt.amount) {
        return {
          success: false,
          error: `Not enough cash to clear debt of ${state.pendingDebt.amount}`,
          code: 'NOT_ENOUGH_CASH',
        };
      }

      const debt = state.pendingDebt;
      player.cash -= debt.amount;

      if (debt.creditor) {
        const creditor = state.players.find((p) => p.id === debt.creditor);
        if (creditor) {
          creditor.cash += debt.amount;
        }
      }

      state.pendingDebt = undefined;
      state.phase = 'POST_ROLL';

      events.push(
        createEvent(
          state,
          'DEBT_CLEARED',
          {
            uz: `${player.name} ${debt.amount} so‘m qarzini to‘liq uzdi.`,
            ru: `${player.name} полностью погасил(а) долг ${debt.amount} so'm.`,
            en: `${player.name} paid off debt of ${debt.amount} so'm.`,
          },
          player.id,
          { amount: debt.amount },
        ),
      );
      return { success: true, state, events };
    }

    case 'declareBankruptcy': {
      if (state.phase !== 'DEBT' || !state.pendingDebt) {
        return { success: false, error: 'No active debt for bankruptcy', code: 'NO_DEBT' };
      }
      if (state.pendingDebt.debtor !== playerId) {
        return { success: false, error: 'You are not the debtor', code: 'NOT_DEBTOR' };
      }

      player.bankrupt = true;
      const creditor = state.pendingDebt.creditor
        ? state.players.find((p) => p.id === state.pendingDebt?.creditor)
        : undefined;

      // Transfer cash
      if (creditor && player.cash > 0) {
        creditor.cash += player.cash;
      }
      player.cash = 0;

      // Transfer or release properties
      for (const ts of Object.values(state.tiles)) {
        if (ts.ownerId === player.id) {
          if (creditor) {
            // Creditor receives tile
            ts.ownerId = creditor.id;
          } else {
            // Bank takes over: tile becomes unowned, unmortgaged, buildings removed
            ts.ownerId = undefined;
            ts.houses = 0;
            ts.mortgaged = false;
          }
        }
      }

      // Return jail cards to deck
      if (player.jailCards > 0) {
        for (let i = 0; i < player.jailCards; i++) {
          state.decks.imkon.push(9);
        }
        player.jailCards = 0;
      }

      events.push(
        createEvent(
          state,
          'BANKRUPTCY',
          {
            uz: `${player.name} o‘yinda bankrot bo‘ldi!`,
            ru: `${player.name} объявил(а) себя банкротом!`,
            en: `${player.name} went bankrupt!`,
          },
          player.id,
          { creditorId: creditor?.id },
        ),
      );

      state.pendingDebt = undefined;

      // Check if game is over
      const { isGameOver, winnerId } = checkGameOver(state);
      if (isGameOver && winnerId) {
        state.phase = 'GAME_OVER';
        state.winnerId = winnerId;
        const winner = state.players.find((p) => p.id === winnerId);
        events.push(
          createEvent(
            state,
            'GAME_OVER',
            {
              uz: `O‘yin tugadi! G‘olib: ${winner?.name}!`,
              ru: `Игра окончена! Победитель: ${winner?.name}!`,
              en: `Game Over! Winner: ${winner?.name}!`,
            },
            winnerId,
          ),
        );
      } else {
        // Next player's turn
        state.turnIndex = getNextActivePlayerIndex(state, state.turnIndex);
        state.doublesCount = 0;
        state.lastDice = undefined;
        const nextPlayer = getCurrentPlayer(state);
        state.phase = nextPlayer.inJail ? 'JAIL' : 'ROLL';
      }

      return { success: true, state, events };
    }

    case 'endTurn': {
      if (state.phase !== 'POST_ROLL') {
        return {
          success: false,
          error: 'Can only end turn in post-roll phase',
          code: 'INVALID_PHASE',
        };
      }
      if (getCurrentPlayer(state).id !== playerId) {
        return { success: false, error: 'Not your turn to end', code: 'NOT_YOUR_TURN' };
      }

      // Check if player rolled doubles and is not in jail
      const rolledDoubles =
        state.lastDice &&
        state.lastDice[0] === state.lastDice[1] &&
        !player.inJail &&
        state.doublesCount > 0 &&
        state.doublesCount < GAME_CONFIG.maxDoublesBeforeJail;

      if (rolledDoubles) {
        // Player rolls again!
        state.phase = 'ROLL';
        events.push(
          createEvent(
            state,
            'EXTRA_TURN_DOUBLES',
            {
              uz: `${player.name} dubl tashlagani uchun yana bir bor yuradi!`,
              ru: `${player.name} выбросил дубль и ходит ещё раз!`,
              en: `${player.name} rolled doubles and gets another turn!`,
            },
            player.id,
          ),
        );
      } else {
        // Check game over
        const { isGameOver, winnerId } = checkGameOver(state);
        if (isGameOver && winnerId) {
          state.phase = 'GAME_OVER';
          state.winnerId = winnerId;
          const winner = state.players.find((p) => p.id === winnerId);
          events.push(
            createEvent(
              state,
              'GAME_OVER',
              {
                uz: `O‘yin tugadi! G‘olib: ${winner?.name}!`,
                ru: `Игра окончена! Победитель: ${winner?.name}!`,
                en: `Game Over! Winner: ${winner?.name}!`,
              },
              winnerId,
            ),
          );
        } else {
          // Pass turn to next active player
          state.turnIndex = getNextActivePlayerIndex(state, state.turnIndex);
          state.doublesCount = 0;
          state.lastDice = undefined;

          const nextPlayer = getCurrentPlayer(state);
          state.phase = nextPlayer.inJail ? 'JAIL' : 'ROLL';

          events.push(
            createEvent(
              state,
              'TURN_STARTED',
              {
                uz: `Navbat: ${nextPlayer.name}`,
                ru: `Ход игрока: ${nextPlayer.name}`,
                en: `Turn: ${nextPlayer.name}`,
              },
              nextPlayer.id,
            ),
          );
        }
      }

      return { success: true, state, events };
    }
  }
}
