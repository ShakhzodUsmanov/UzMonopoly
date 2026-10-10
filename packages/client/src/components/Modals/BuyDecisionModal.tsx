import React from 'react';
import type { GameState, TileDefinition, ClientAction } from '@uzmonopoly/shared';
import { COLOR_GROUPS } from '@uzmonopoly/shared';
import { calculateRent } from '@uzmonopoly/engine';
import type { Translations, Locale } from '../../i18n.js';
import { audioService } from '../../services/audio.js';
import { ShoppingCart, Gavel, AlertCircle, Coins, ArrowRight } from 'lucide-react';

interface BuyDecisionModalProps {
  gameState: GameState;
  tile: TileDefinition;
  myPlayerId: string;
  onAction: (action: ClientAction) => void;
  locale: Locale;
  t: Translations;
}

const GROUP_COLORS = Object.fromEntries(COLOR_GROUPS.map((g) => [g.id, g.color]));

export const BuyDecisionModal: React.FC<BuyDecisionModalProps> = ({
  gameState,
  tile,
  myPlayerId,
  onAction,
  locale,
  t,
}) => {
  const activePlayer = gameState.players[gameState.turnIndex];
  const isMyTurn = activePlayer?.id === myPlayerId;
  const price = tile.price ?? 0;
  const myCash = activePlayer?.cash ?? 0;
  const canAfford = myCash >= price;
  const cashAfter = myCash - price;
  const groupColor = tile.group ? GROUP_COLORS[tile.group] || '#3B82F6' : '#10B981';

  const tileName =
    tile.nameI18n?.[locale] || tile.name;

  const handleBuy = () => {
    audioService.playCoin();
    onAction({ type: 'buy' });
  };

  const handleDecline = () => {
    audioService.playClick();
    onAction({ type: 'declineBuy' });
  };

  return (
    <div className="modal-overlay" id="modal-buy-decision">
      <div
        className="modal-content animate-fade-in"
        style={{
          maxWidth: 420,
          padding: 0,
          overflow: 'hidden',
          background: 'linear-gradient(180deg, #131E35 0%, #0B1120 100%)',
          border: '1px solid var(--border-gold)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(245, 158, 11, 0.15)',
        }}
      >
        {/* Top Header Banner with Group Color */}
        <div
          style={{
            background: `linear-gradient(135deg, ${groupColor} 0%, rgba(0,0,0,0.6) 100%)`,
            padding: '22px 20px',
            textAlign: 'center',
            color: '#FFFFFF',
            position: 'relative',
            borderBottom: '2px solid rgba(255,255,255,0.15)',
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              color: '#FDE68A',
            }}
          >
            {t.buyModal.header}
          </div>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 900,
              marginTop: 4,
              fontFamily: 'var(--font-heading)',
              textShadow: '0 2px 4px rgba(0,0,0,0.5)',
            }}
          >
            {tileName}
          </h2>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(4px)',
              padding: '4px 14px',
              borderRadius: 20,
              marginTop: 8,
              fontSize: 14,
              fontWeight: 800,
              color: '#F59E0B',
            }}
          >
            <Coins size={15} />
            <span>{price.toLocaleString()} so‘m</span>
          </div>
        </div>

        {/* Body & Financial calculations */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Quick Rent & Info stats */}
          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 12,
              padding: '12px 16px',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              fontSize: 13,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>{t.propertyCard.baseRent}:</span>
              <span style={{ color: '#F8FAFC', fontWeight: 700 }}>
                {calculateRent(tile.baseRent ?? 0, 0, false, false).toLocaleString()} so‘m
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>{t.propertyCard.fullGroupRent}:</span>
              <span style={{ color: '#10B981', fontWeight: 700 }}>
                {calculateRent(tile.baseRent ?? 0, 0, true, false).toLocaleString()} so‘m
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>{t.propertyCard.mortgageValue}:</span>
              <span style={{ color: '#F59E0B', fontWeight: 700 }}>
                {Math.floor(price / 2).toLocaleString()} so‘m
              </span>
            </div>
          </div>

          {/* Cash balance impact preview */}
          {isMyTurn && (
            <div
              style={{
                background: canAfford ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                border: `1px solid ${canAfford ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                borderRadius: 12,
                padding: '12px 16px',
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 600 }}>{t.currentBalance}</div>
                <div style={{ fontWeight: 800, color: '#F8FAFC' }}>{myCash.toLocaleString()} so‘m</div>
              </div>
              <ArrowRight size={16} color="var(--text-muted)" />
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 600 }}>{t.balanceAfter}</div>
                <div
                  style={{
                    fontWeight: 800,
                    color: canAfford ? '#10B981' : '#EF4444',
                  }}
                >
                  {cashAfter.toLocaleString()} so‘m
                </div>
              </div>
            </div>
          )}

          {/* If not enough cash or waiting */}
          {!canAfford && isMyTurn && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: '#EF4444',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              <AlertCircle size={16} />
              <span>{t.reasons.reasonInsufficientCash}</span>
            </div>
          )}

          {!isMyTurn && (
            <div
              style={{
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: 13,
                padding: '8px 0',
                fontStyle: 'italic',
              }}
            >
              ⏳ {activePlayer?.name} {t.buyModal.thinking}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
            <button
              className="btn btn-gold"
              style={{
                flex: 1,
                padding: '12px 14px',
                fontSize: 14,
                opacity: !isMyTurn || !canAfford ? 0.5 : 1,
                cursor: !isMyTurn || !canAfford ? 'not-allowed' : 'pointer',
              }}
              disabled={!isMyTurn || !canAfford}
              onClick={handleBuy}
              id="btn-confirm-buy"
              title={!canAfford ? t.reasons.reasonInsufficientCash : t.buyProperty}
            >
              <ShoppingCart size={16} />
              <span>{t.buyProperty}</span>
            </button>

            <button
              className="btn btn-outline"
              style={{
                flex: 1,
                padding: '12px 14px',
                fontSize: 14,
                opacity: !isMyTurn ? 0.5 : 1,
                cursor: !isMyTurn ? 'not-allowed' : 'pointer',
              }}
              disabled={!isMyTurn}
              onClick={handleDecline}
              id="btn-decline-to-auction"
              title={t.declineBuy}
            >
              <Gavel size={16} />
              <span>{t.declineBuy}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
