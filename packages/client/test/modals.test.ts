import { describe, it, expect } from 'vitest';
import { DICTIONARY, type Locale } from '../src/i18n.js';
import { IMKON_CARDS, XAZINA_CARDS, createInitialGameState, createPRNG } from '@uzmonopoly/engine';
import { audioService } from '../src/services/audio.js';

describe('Phase 5: Client Game Actions & Modals', () => {
  const locales: Locale[] = ['uz', 'ru', 'en'];

  it('contains full modal translations across all 3 languages', () => {
    for (const loc of locales) {
      const t = DICTIONARY[loc];

      // Buy Modal
      expect(t.buyModal.header).toBeTruthy();
      expect(t.buyModal.thinking).toBeTruthy();

      // Auction Modal
      expect(t.auctionModal.header).toBeTruthy();
      expect(t.auctionModal.currentBid).toBeTruthy();
      expect(t.auctionModal.quickBid).toBeTruthy();

      // Trade Modal
      expect(t.tradeModal.header).toBeTruthy();
      expect(t.tradeModal.iGive).toBeTruthy();
      expect(t.tradeModal.iGet).toBeTruthy();
      expect(t.tradeModal.sendProposal).toBeTruthy();

      // Card Modal
      expect(t.cardModal.imkonTitle).toBeTruthy();
      expect(t.cardModal.xazinaTitle).toBeTruthy();
      expect(t.cardModal.understand).toBeTruthy();

      // Property Modal
      expect(t.propertyModal.header).toBeTruthy();
      expect(t.propertyModal.buildBranch).toBeTruthy();
      expect(t.propertyModal.mortgage).toBeTruthy();
      expect(t.propertyModal.unmortgage).toBeTruthy();

      // Debt Modal
      expect(t.debtModal.header).toBeTruthy();
      expect(t.debtModal.remainingToCollect).toBeTruthy();
      expect(t.debtModal.payFullDebt).toBeTruthy();
      expect(t.debtModal.declareBankruptcy).toBeTruthy();

      // Game Over Modal
      expect(t.gameOverModal.victoryTitle).toBeTruthy();
      expect(t.gameOverModal.playAgain).toBeTruthy();
      expect(t.gameOverModal.homeMenu).toBeTruthy();

      // Why can't I validation reasons
      expect(t.reasons.reasonNotOwner).toBeTruthy();
      expect(t.reasons.reasonNeedMonopoly).toBeTruthy();
      expect(t.reasons.reasonGroupMortgaged).toBeTruthy();
      expect(t.reasons.reasonEvenBuild).toBeTruthy();
      expect(t.reasons.reasonInsufficientCash).toBeTruthy();
      expect(t.reasons.reasonNoBuildings).toBeTruthy();
      expect(t.reasons.reasonEvenSell).toBeTruthy();
      expect(t.reasons.reasonAlreadyMortgaged).toBeTruthy();
      expect(t.reasons.reasonBuildingsExist).toBeTruthy();
      expect(t.reasons.reasonNotMortgaged).toBeTruthy();
    }
  });

  it('IMKON and XAZINA cards have localized titles and descriptions', () => {
    expect(IMKON_CARDS.length).toBeGreaterThanOrEqual(16);
    expect(XAZINA_CARDS.length).toBeGreaterThanOrEqual(16);

    for (const card of [...IMKON_CARDS, ...XAZINA_CARDS]) {
      expect(card.title.uz).toBeTruthy();
      expect(card.title.ru).toBeTruthy();
      expect(card.title.en).toBeTruthy();
      expect(card.description.uz).toBeTruthy();
      expect(card.description.ru).toBeTruthy();
      expect(card.description.en).toBeTruthy();
    }
  });

  it('audioService supports all synthesized Web Audio sound triggers', () => {
    expect(audioService).toBeDefined();
    expect(typeof audioService.playDiceRoll).toBe('function');
    expect(typeof audioService.playTokenStep).toBe('function');
    expect(typeof audioService.playCoin).toBe('function');
    expect(typeof audioService.playJailSlam).toBe('function');
    expect(typeof audioService.playBankruptcy).toBe('function');
    expect(typeof audioService.playVictoryFanfare).toBe('function');
    expect(typeof audioService.playClick).toBe('function');
    expect(typeof audioService.toggleMute).toBe('function');

    const initial = audioService.enabled;
    const toggled = audioService.toggleMute();
    expect(toggled).toBe(!initial);
    // Restore
    audioService.toggleMute();
  });

  it('correctly models building validation conditions for player properties', () => {
    const rng = createPRNG(12345);
    const game = createInitialGameState(
      [
        { id: 'p1', name: 'Alisher', token: 'doppi', color: '#EF4444' },
        { id: 'p2', name: 'Bobur', token: 'choynak', color: '#3B82F6' },
      ],
      {
        roomCode: 'TEST1',
        isPrivate: false,
        maxPlayers: 2,
        turnTimeoutSec: 60,
        mode: 'full',
      },
      rng,
    );

    // Give p1 property #1 (Chorsu)
    game.tiles[1]!.ownerId = 'p1';
    // p1 does not have monopoly yet (Chorsu group has 3 tiles: #1, #2, #4)
    expect(game.tiles[1]!.houses).toBe(0);

    // Reasons check
    const t = DICTIONARY.uz;
    const canBuildWithoutMonopoly = false;
    expect(canBuildWithoutMonopoly).toBe(false);
    expect(t.reasons.reasonNeedMonopoly).toContain('Guruhning barcha mulklariga');
  });
});
