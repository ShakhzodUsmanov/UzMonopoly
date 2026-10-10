import type { GameState, Player, CardDefinition, GameEvent } from '@uzmonopoly/shared';
import { IMKON_CARDS, XAZINA_CARDS } from '../data/cards.js';
import { GAME_CONFIG, calculateRent } from '../data/config.js';
import { getTileDef, createEvent, ownsEntireGroup } from '../helpers.js';
import type { RNG } from '../rng.js';

export function resolveCardAction(
  state: GameState,
  player: Player,
  card: CardDefinition,
  _rng: RNG,
  events: GameEvent[],
): void {
  events.push(
    createEvent(
      state,
      'CARD_DRAWN',
      {
        uz: `${player.name} «${card.title.uz}» kartasini oldi: ${card.description.uz}`,
        ru: `${player.name} вытянул(а) карточку «${card.title.ru}»: ${card.description.ru}`,
        en: `${player.name} drew "${card.title.en}": ${card.description.en}`,
      },
      player.id,
      { cardId: card.id, cardType: card.type },
    ),
  );

  switch (card.actionType) {
    case 'ADVANCE_TO_GO': {
      player.position = 0;
      player.cash += GAME_CONFIG.salaryPassGo;
      events.push(
        createEvent(
          state,
          'PASS_GO',
          {
            uz: `${player.name} «Boshlash» katagiga o‘tdi va ${GAME_CONFIG.salaryPassGo} so‘m oldi.`,
            ru: `${player.name} перешел на «Boshlash» и получил ${GAME_CONFIG.salaryPassGo} so'm.`,
            en: `${player.name} advanced to GO and collected ${GAME_CONFIG.salaryPassGo} so'm.`,
          },
          player.id,
          { amount: GAME_CONFIG.salaryPassGo },
        ),
      );
      state.phase = 'POST_ROLL';
      break;
    }

    case 'ADVANCE_TO_TILE': {
      const target = card.targetTileIndex ?? 0;
      if (target < player.position) {
        player.cash += GAME_CONFIG.salaryPassGo;
        events.push(
          createEvent(
            state,
            'PASS_GO',
            {
              uz: `${player.name} «Boshlash»dan o‘tdi va ${GAME_CONFIG.salaryPassGo} so‘m oldi.`,
              ru: `${player.name} прошел «Boshlash» и получил ${GAME_CONFIG.salaryPassGo} so'm.`,
              en: `${player.name} passed GO and collected ${GAME_CONFIG.salaryPassGo} so'm.`,
            },
            player.id,
            { amount: GAME_CONFIG.salaryPassGo },
          ),
        );
      }
      player.position = target;
      resolveTileLanding(state, player, target, events);
      break;
    }

    case 'GO_BACK_TILES': {
      const steps = card.relativeTiles ?? 3;
      player.position = (player.position - steps + 52) % 52;
      events.push(
        createEvent(
          state,
          'MOVE',
          {
            uz: `${player.name} ${steps} katak ortga qaytib, ${player.position}-katakka tushdi.`,
            ru: `${player.name} вернулся на ${steps} клетки назад на клетку ${player.position}.`,
            en: `${player.name} moved back ${steps} spaces to tile ${player.position}.`,
          },
          player.id,
          { position: player.position },
        ),
      );
      resolveTileLanding(state, player, player.position, events);
      break;
    }

    case 'GO_TO_JAIL': {
      player.position = 13;
      player.inJail = true;
      player.jailTurns = 0;
      state.doublesCount = 0;
      state.phase = 'POST_ROLL';
      events.push(
        createEvent(
          state,
          'GO_TO_JAIL',
          {
            uz: `${player.name} qamoqxonaga jo‘natildi!`,
            ru: `${player.name} отправляется в тюрьму!`,
            en: `${player.name} was sent to Jail!`,
          },
          player.id,
        ),
      );
      break;
    }

    case 'GET_OUT_OF_JAIL_FREE': {
      player.jailCards += 1;
      state.phase = 'POST_ROLL';
      events.push(
        createEvent(
          state,
          'GET_OUT_OF_JAIL_CARD',
          {
            uz: `${player.name} qamoqdan ozodlik kartasini oldi.`,
            ru: `${player.name} получил карточку освобождения из тюрьмы.`,
            en: `${player.name} received a Get Out of Jail Free card.`,
          },
          player.id,
        ),
      );
      break;
    }

    case 'RECEIVE_MONEY': {
      const amount = card.amount ?? 0;
      player.cash += amount;
      state.phase = 'POST_ROLL';
      events.push(
        createEvent(
          state,
          'RECEIVE_MONEY',
          {
            uz: `${player.name} ${amount} so‘m oldi.`,
            ru: `${player.name} получил(а) ${amount} so'm.`,
            en: `${player.name} received ${amount} so'm.`,
          },
          player.id,
          { amount },
        ),
      );
      break;
    }

    case 'PAY_MONEY': {
      const amount = card.amount ?? 0;
      if (player.cash >= amount) {
        player.cash -= amount;
        state.phase = 'POST_ROLL';
        events.push(
          createEvent(
            state,
            'PAY_MONEY',
            {
              uz: `${player.name} ${amount} so‘m to‘ladi.`,
              ru: `${player.name} заплатил(а) ${amount} so'm.`,
              en: `${player.name} paid ${amount} so'm.`,
            },
            player.id,
            { amount },
          ),
        );
      } else {
        state.pendingDebt = {
          debtor: player.id,
          creditor: undefined,
          amount,
          reason: 'CARD_PAYMENT',
        };
        state.phase = 'DEBT';
        events.push(
          createEvent(
            state,
            'DEBT_ENTERED',
            {
              uz: `${player.name}da ${amount} so‘m yetishmadi va qarzga kirdi.`,
              ru: `${player.name} не может заплатить ${amount} so'm и входит в долг.`,
              en: `${player.name} cannot pay ${amount} so'm and is now in debt.`,
            },
            player.id,
            { amount },
          ),
        );
      }
      break;
    }

    case 'PAY_EACH_PLAYER': {
      const amount = card.amount ?? 50;
      const otherPlayers = state.players.filter((p) => p.id !== player.id && !p.bankrupt);
      const total = otherPlayers.length * amount;

      if (player.cash >= total) {
        player.cash -= total;
        otherPlayers.forEach((p) => {
          p.cash += amount;
        });
        state.phase = 'POST_ROLL';
        events.push(
          createEvent(
            state,
            'PAY_PLAYERS',
            {
              uz: `${player.name} har bir o‘yinchiga ${amount} so‘mdan to‘ladi.`,
              ru: `${player.name} выплатил каждому игроку по ${amount} so'm.`,
              en: `${player.name} paid ${amount} so'm to each player.`,
            },
            player.id,
            { amount, total },
          ),
        );
      } else {
        state.pendingDebt = {
          debtor: player.id,
          creditor: undefined,
          amount: total,
          reason: 'PAY_EACH_PLAYER',
        };
        state.phase = 'DEBT';
      }
      break;
    }

    case 'COLLECT_FROM_EACH_PLAYER': {
      const amount = card.amount ?? 30;
      const otherPlayers = state.players.filter((p) => p.id !== player.id && !p.bankrupt);
      let collected = 0;

      otherPlayers.forEach((p) => {
        if (p.cash >= amount) {
          p.cash -= amount;
          collected += amount;
        } else {
          // Player gives whatever they have
          collected += p.cash;
          p.cash = 0;
        }
      });

      player.cash += collected;
      state.phase = 'POST_ROLL';
      events.push(
        createEvent(
          state,
          'COLLECT_FROM_PLAYERS',
          {
            uz: `${player.name} boshqa o‘yinchilardan jami ${collected} so‘m yig‘ib oldi.`,
            ru: `${player.name} собрал(а) с других игроков всего ${collected} so'm.`,
            en: `${player.name} collected ${collected} so'm from other players.`,
          },
          player.id,
          { collected },
        ),
      );
      break;
    }

    case 'PROPERTY_REPAIR': {
      const houseCost = card.houseCost ?? 25;
      const hotelCost = card.hotelCost ?? 100;
      let houses = 0;
      let hotels = 0;

      for (const ts of Object.values(state.tiles)) {
        if (ts.ownerId === player.id) {
          if (ts.houses === GAME_CONFIG.hotelLevel) {
            hotels++;
          } else if (ts.houses > 0) {
            houses += ts.houses;
          }
        }
      }

      const totalRepair = houses * houseCost + hotels * hotelCost;
      if (player.cash >= totalRepair) {
        player.cash -= totalRepair;
        state.phase = 'POST_ROLL';
        events.push(
          createEvent(
            state,
            'PROPERTY_REPAIR',
            {
              uz: `${player.name} ta’mirlash uchun ${totalRepair} so‘m to‘ladi (${houses} uy, ${hotels} mehmonxona).`,
              ru: `${player.name} заплатил(а) за ремонт ${totalRepair} so'm (${houses} домов, ${hotels} отелей).`,
              en: `${player.name} paid ${totalRepair} so'm for property repair (${houses} houses, ${hotels} hotels).`,
            },
            player.id,
            { totalRepair, houses, hotels },
          ),
        );
      } else {
        state.pendingDebt = {
          debtor: player.id,
          creditor: undefined,
          amount: totalRepair,
          reason: 'PROPERTY_REPAIR',
        };
        state.phase = 'DEBT';
      }
      break;
    }
  }
}

export function drawAndApplyCard(
  state: GameState,
  player: Player,
  deckType: 'imkon' | 'xazina',
  rng: RNG,
  events: GameEvent[],
): void {
  const deck = state.decks[deckType];
  const allCards = deckType === 'imkon' ? IMKON_CARDS : XAZINA_CARDS;

  let cardId = deck.shift();
  if (cardId === undefined) {
    const reshuffled = rng.shuffle(allCards.map((c) => c.id));
    deck.push(...reshuffled);
    cardId = deck.shift();
  }

  const card = allCards.find((c) => c.id === cardId);
  if (!card) {
    state.phase = 'POST_ROLL';
    return;
  }

  // Put card back at the end of the deck unless it is GET_OUT_OF_JAIL_FREE
  if (card.actionType !== 'GET_OUT_OF_JAIL_FREE') {
    deck.push(card.id);
  }

  resolveCardAction(state, player, card, rng, events);
}

export function resolveTileLanding(
  state: GameState,
  player: Player,
  tileIndex: number,
  events: GameEvent[],
  rng?: RNG,
): void {
  const tile = getTileDef(tileIndex);
  const tileState = state.tiles[tileIndex]!;

  switch (tile.type) {
    case 'START':
    case 'FREE_PARKING':
    case 'JAIL':
      state.phase = 'POST_ROLL';
      break;

    case 'GO_TO_JAIL':
      player.position = 13;
      player.inJail = true;
      player.jailTurns = 0;
      state.doublesCount = 0;
      state.phase = 'POST_ROLL';
      events.push(
        createEvent(
          state,
          'GO_TO_JAIL',
          {
            uz: `${player.name} «Qamoqqa!» katagiga tushib, qamoqxonaga yo‘l oldi.`,
            ru: `${player.name} попал на поле «В тюрьму!» и отправляется в тюрьму.`,
            en: `${player.name} landed on "Go to Jail" and was sent to Jail.`,
          },
          player.id,
        ),
      );
      break;

    case 'TAX': {
      const taxAmount = tile.taxAmount ?? 200;
      if (player.cash >= taxAmount) {
        player.cash -= taxAmount;
        state.phase = 'POST_ROLL';
        events.push(
          createEvent(
            state,
            'PAY_TAX',
            {
              uz: `${player.name} ${taxAmount} so‘m soliq to‘ladi.`,
              ru: `${player.name} заплатил(а) налог ${taxAmount} so'm.`,
              en: `${player.name} paid ${taxAmount} so'm tax.`,
            },
            player.id,
            { amount: taxAmount },
          ),
        );
      } else {
        state.pendingDebt = {
          debtor: player.id,
          creditor: undefined,
          amount: taxAmount,
          reason: 'TAX',
        };
        state.phase = 'DEBT';
        events.push(
          createEvent(
            state,
            'DEBT_ENTERED',
            {
              uz: `${player.name} soliq to‘lashga yetarli puli yo‘q (${taxAmount} so‘m).`,
              ru: `${player.name} не имеет средств для уплаты налога (${taxAmount} so'm).`,
              en: `${player.name} cannot afford tax payment (${taxAmount} so'm).`,
            },
            player.id,
            { amount: taxAmount },
          ),
        );
      }
      break;
    }

    case 'PROPERTY': {
      if (!tileState.ownerId) {
        // Unowned property: player gets to decide to buy or auction
        state.phase = 'BUY_DECISION';
        events.push(
          createEvent(
            state,
            'BUY_OFFER',
            {
              uz: `${player.name} bo‘sh ${tile.name} mulkiga tushdi (narxi: ${tile.price} so‘m).`,
              ru: `${player.name} остановился на свободном владении ${tile.name} (цена: ${tile.price} so'm).`,
              en: `${player.name} landed on unowned ${tile.name} (price: ${tile.price} so'm).`,
            },
            player.id,
            { tileIndex, price: tile.price },
          ),
        );
      } else if (tileState.ownerId === player.id) {
        // Owned by current player
        state.phase = 'POST_ROLL';
      } else {
        // Owned by other player
        const owner = state.players.find((p) => p.id === tileState.ownerId);
        if (!owner || owner.bankrupt || tileState.mortgaged) {
          // Mortgaged or bankrupt owner: no rent
          state.phase = 'POST_ROLL';
        } else {
          // Standard rule: owner collects rent even while in jail!
          const hasMonopoly = tile.group ? ownsEntireGroup(state, owner.id, tile.group) : false;
          const rent = calculateRent(
            tile.baseRent ?? 0,
            tileState.houses,
            hasMonopoly,
            tileState.mortgaged,
          );

          if (player.cash >= rent) {
            player.cash -= rent;
            owner.cash += rent;
            state.phase = 'POST_ROLL';
            events.push(
              createEvent(
                state,
                'PAY_RENT',
                {
                  uz: `${player.name} ${owner.name}ga ${tile.name} uchun ${rent} so‘m ijara to‘ladi.`,
                  ru: `${player.name} заплатил(а) аренду ${rent} so'm игроку ${owner.name} за ${tile.name}.`,
                  en: `${player.name} paid ${rent} so'm rent to ${owner.name} for ${tile.name}.`,
                },
                player.id,
                { rent, ownerId: owner.id, tileIndex },
              ),
            );
          } else {
            // Cannot pay full rent: enter DEBT phase
            state.pendingDebt = {
              debtor: player.id,
              creditor: owner.id,
              amount: rent,
              reason: 'RENT',
            };
            state.phase = 'DEBT';
            events.push(
              createEvent(
                state,
                'DEBT_ENTERED',
                {
                  uz: `${player.name} ${owner.name}ga ${rent} so‘m ijara to‘lay olmadi va qarzga kirdi.`,
                  ru: `${player.name} не может выплатить аренду ${rent} so'm игроку ${owner.name} и входит в долг.`,
                  en: `${player.name} cannot pay ${rent} so'm rent to ${owner.name} and is in debt.`,
                },
                player.id,
                { rent, creditor: owner.id },
              ),
            );
          }
        }
      }
      break;
    }

    case 'CHANCE': {
      if (rng) {
        drawAndApplyCard(state, player, 'imkon', rng, events);
      } else {
        state.phase = 'POST_ROLL';
      }
      break;
    }

    case 'COMMUNITY_CHEST': {
      if (rng) {
        drawAndApplyCard(state, player, 'xazina', rng, events);
      } else {
        state.phase = 'POST_ROLL';
      }
      break;
    }
  }
}
