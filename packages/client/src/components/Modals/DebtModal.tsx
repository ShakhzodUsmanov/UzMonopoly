import React from 'react';
import type { GameState, ClientAction } from '@uzmonopoly/shared';
import { BOARD_TILES, calculateMortgageValue, calculateBuildingSellValue } from '@uzmonopoly/engine';
import type { Translations, Locale } from '../../i18n.js';
import { audioService } from '../../services/audio.js';
import { AlertOctagon, CheckCircle2, Skull } from 'lucide-react';

interface DebtModalProps {
  gameState: GameState;
  myPlayerId: string;
  onAction: (action: ClientAction) => void;
  locale: Locale;
  t: Translations;
}

export const DebtModal: React.FC<DebtModalProps> = ({
  gameState,
  myPlayerId,
  onAction,
  locale,
  t,
}) => {
  const pendingDebt = gameState.pendingDebt;
  if (!pendingDebt || pendingDebt.debtor !== myPlayerId) return null;

  const myPlayer = gameState.players.find((p) => p.id === myPlayerId);
  const creditorPlayer = pendingDebt.creditor
    ? gameState.players.find((p) => p.id === pendingDebt.creditor)
    : undefined;

  const creditorName = creditorPlayer ? creditorPlayer.name : t.debtModal.bank;
  const myCash = myPlayer?.cash ?? 0;
  const debtAmount = pendingDebt.amount;
  const needed = Math.max(0, debtAmount - myCash);
  const canPay = myCash >= debtAmount;

  // Find assets player can liquidate
  const myOwnedTiles = BOARD_TILES.filter((t) => gameState.tiles[t.index]?.ownerId === myPlayerId);
  const tilesWithHouses = myOwnedTiles.filter((t) => (gameState.tiles[t.index]?.houses ?? 0) > 0);
  const mortgageableTiles = myOwnedTiles.filter(
    (t) => !gameState.tiles[t.index]?.mortgaged && (gameState.tiles[t.index]?.houses ?? 0) === 0,
  );

  const handlePayDebt = () => {
    audioService.playCoin();
    onAction({ type: 'payDebt' });
  };

  const handleBankruptcy = () => {
    if (confirm(t.debtModal.confirmBankruptcy)) {
      audioService.playBankruptcy();
      onAction({ type: 'declareBankruptcy' });
    }
  };

  const handleQuickMortgage = (tileIndex: number) => {
    audioService.playCoin();
    onAction({ type: 'mortgage', tileId: tileIndex });
  };

  const handleQuickSellHouse = (tileIndex: number) => {
    audioService.playClick();
    onAction({ type: 'sellBuilding', tileId: tileIndex });
  };

  return (
    <div className="modal-overlay" id="modal-debt" style={{ backdropFilter: 'blur(8px)', zIndex: 1000 }}>
      <div
        className="modal-content animate-fade-in"
        style={{
          maxWidth: 480,
          padding: 0,
          overflow: 'hidden',
          background: 'linear-gradient(180deg, #1E1B2E 0%, #0F172A 100%)',
          border: '2px solid #EF4444',
          boxShadow: '0 25px 70px rgba(239, 68, 68, 0.35)',
        }}
      >
        {/* Urgent Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #DC2626 0%, #7F1D1D 100%)',
            padding: '22px 24px',
            color: '#FFF',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AlertOctagon size={26} color="#FDE047" />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: '#FDE047' }}>
              {t.debtModal.header}
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, fontFamily: 'var(--font-heading)' }}>
              {debtAmount.toLocaleString()} so‘m
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Debt breakdown */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: 12,
              padding: '14px 18px',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              fontSize: 13,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>{t.debtModal.creditor}:</span>
              <span style={{ color: '#F8FAFC', fontWeight: 700 }}>{creditorName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>{t.currentBalance}:</span>
              <span style={{ color: '#F8FAFC', fontWeight: 700 }}>{myCash.toLocaleString()} so‘m</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: 8,
                borderTop: '1px solid var(--border-subtle)',
                fontWeight: 800,
              }}
            >
              <span>{t.debtModal.remainingToCollect}:</span>
              <span style={{ color: canPay ? '#10B981' : '#EF4444', fontSize: 15 }}>
                {canPay ? '0 so‘m' : `${needed.toLocaleString()} so‘m`}
              </span>
            </div>
          </div>

          {/* If can pay right now */}
          {canPay ? (
            <button
              className="btn btn-gold"
              style={{
                padding: '14px',
                fontSize: 15,
                fontWeight: 800,
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
              onClick={handlePayDebt}
              id="btn-pay-debt"
            >
              <CheckCircle2 size={18} />
              <span>{t.debtModal.payFullDebt}</span>
            </button>
          ) : (
            /* Quick Liquidation Options */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>
                💡 {t.debtModal.liquidationHelp}
              </div>

              {/* Houses to sell */}
              {tilesWithHouses.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#F59E0B' }}>
                    {t.debtModal.sellBuildings}:
                  </div>
                  {tilesWithHouses.map((tDef) => {
                    const houseCost = tDef.houseCost ?? 50;
                    const refund = calculateBuildingSellValue(houseCost);
                    return (
                      <div
                        key={tDef.index}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 10px',
                          background: 'rgba(255,255,255,0.04)',
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                      >
                        <span>{tDef.nameI18n?.[locale] || tDef.name}</span>
                        <button
                          className="btn btn-outline"
                          style={{ padding: '4px 8px', fontSize: 11 }}
                          onClick={() => handleQuickSellHouse(tDef.index)}
                        >
                          +{refund} so‘m
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Properties to mortgage */}
              {mortgageableTiles.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#10B981' }}>
                    {t.debtModal.mortgageProperties}:
                  </div>
                  <div style={{ maxHeight: 120, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {mortgageableTiles.map((tDef) => {
                      const mortgageVal = calculateMortgageValue(tDef.price ?? 0);
                      return (
                        <div
                          key={tDef.index}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '6px 10px',
                            background: 'rgba(255,255,255,0.04)',
                            borderRadius: 8,
                            fontSize: 12,
                          }}
                        >
                          <span>{tDef.nameI18n?.[locale] || tDef.name}</span>
                          <button
                            className="btn btn-outline"
                            style={{ padding: '4px 8px', fontSize: 11 }}
                            onClick={() => handleQuickMortgage(tDef.index)}
                          >
                            +{mortgageVal} so‘m
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Bankruptcy Button */}
              <button
                className="btn btn-outline"
                style={{
                  width: '100%',
                  padding: '12px',
                  color: '#EF4444',
                  borderColor: 'rgba(239, 68, 68, 0.4)',
                  marginTop: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
                onClick={handleBankruptcy}
                id="btn-declare-bankruptcy"
              >
                <Skull size={16} />
                <span>{t.debtModal.declareBankruptcy}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
