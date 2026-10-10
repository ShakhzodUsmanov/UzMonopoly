import React, { useState } from 'react';
import type { GameState, ClientAction } from '@uzmonopoly/shared';
import { BOARD_TILES } from '@uzmonopoly/engine';
import { COLOR_GROUPS } from '@uzmonopoly/shared';
import type { Translations, Locale } from '../../i18n.js';
import { audioService } from '../../services/audio.js';
import { Gavel, Clock, UserCheck, Plus, XCircle } from 'lucide-react';

interface AuctionModalProps {
  gameState: GameState;
  myPlayerId: string;
  onAction: (action: ClientAction) => void;
  locale: Locale;
  t: Translations;
  turnTimeLeft?: number;
}

const GROUP_COLORS = Object.fromEntries(COLOR_GROUPS.map((g) => [g.id, g.color]));

export const AuctionModal: React.FC<AuctionModalProps> = ({
  gameState,
  myPlayerId,
  onAction,
  locale,
  t,
  turnTimeLeft = 20,
}) => {
  const auction = gameState.auction;
  if (!auction) return null;

  const tile = BOARD_TILES[auction.tileId];
  const highBidder = gameState.players.find((p) => p.id === auction.highBidder);
  const myPlayer = gameState.players.find((p) => p.id === myPlayerId);
  const isMeActive = auction.active.includes(myPlayerId);
  const isMeHighBidder = auction.highBidder === myPlayerId;
  const myCash = myPlayer?.cash ?? 0;

  const [customBid, setCustomBid] = useState<number>(auction.highBid + 50);

  const tileName = tile?.nameI18n?.[locale] || tile?.name || 'Mulk';
  const groupColor = tile?.group ? GROUP_COLORS[tile.group] || '#3B82F6' : '#10B981';

  const handleBid = (amount: number) => {
    if (amount <= auction.highBid || amount > myCash || !isMeActive) return;
    audioService.playCoin();
    onAction({ type: 'bid', amount });
  };

  const handlePass = () => {
    audioService.playClick();
    onAction({ type: 'passAuction' });
  };

  return (
    <div className="modal-overlay" id="modal-auction">
      <div
        className="modal-content animate-fade-in"
        style={{
          maxWidth: 460,
          padding: 0,
          overflow: 'hidden',
          background: 'linear-gradient(180deg, #131E35 0%, #0B1120 100%)',
          border: '1px solid var(--border-gold)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(245, 158, 11, 0.2)',
        }}
      >
        {/* Banner with Animated Gavel */}
        <div
          style={{
            background: `linear-gradient(135deg, ${groupColor} 0%, rgba(15, 23, 42, 0.95) 100%)`,
            padding: '20px 24px',
            color: '#FFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'rgba(245, 158, 11, 0.2)',
                border: '1px solid var(--accent-gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#F59E0B',
              }}
            >
              <Gavel size={24} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '1px', color: '#FDE68A', textTransform: 'uppercase' }}>
                {t.auctionModal.header}
              </div>
              <div style={{ fontSize: 18, fontWeight: 900, fontFamily: 'var(--font-heading)' }}>
                {tileName}
              </div>
            </div>
          </div>

          {/* Auction Timer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(0,0,0,0.4)',
              padding: '6px 12px',
              borderRadius: 20,
              border: `1px solid ${turnTimeLeft <= 5 ? '#EF4444' : 'rgba(255,255,255,0.2)'}`,
              color: turnTimeLeft <= 5 ? '#EF4444' : '#F59E0B',
              fontWeight: 800,
              fontSize: 13,
            }}
          >
            <Clock size={14} />
            <span>{turnTimeLeft}s</span>
          </div>
        </div>

        {/* Current Bid Display */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 14,
              padding: '16px 20px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              {t.auctionModal.currentBid}
            </div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 900,
                color: '#F59E0B',
                fontFamily: 'var(--font-heading)',
                letterSpacing: '1px',
              }}
            >
              {auction.highBid > 0 ? `${auction.highBid.toLocaleString()} so‘m` : t.auctionModal.noBids}
            </div>

            {highBidder ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  fontSize: 13,
                  marginTop: 4,
                }}
              >
                <UserCheck size={16} color="#10B981" />
                <span style={{ color: 'var(--text-muted)' }}>{t.auctionModal.highBidder}:</span>
                <span
                  style={{
                    fontWeight: 700,
                    color: highBidder.color,
                  }}
                >
                  {highBidder.name} {highBidder.id === myPlayerId ? `(${t.auctionModal.you})` : ''}
                </span>
              </div>
            ) : (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                {t.auctionModal.beFirst}
              </div>
            )}
          </div>

          {/* Active Participants List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {t.auctionModal.participants} ({auction.active.length})
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {gameState.players
                .filter((p) => !p.bankrupt)
                .map((p) => {
                  const isActive = auction.active.includes(p.id);
                  const isLeader = auction.highBidder === p.id;
                  return (
                    <div
                      key={p.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '4px 10px',
                        borderRadius: 16,
                        background: isActive ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${
                          isLeader ? 'var(--accent-gold)' : isActive ? 'var(--border-subtle)' : 'rgba(255,255,255,0.05)'
                        }`,
                        opacity: isActive ? 1 : 0.4,
                        fontSize: 12,
                        textDecoration: isActive ? 'none' : 'line-through',
                      }}
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: p.color,
                        }}
                      />
                      <span>{p.name}</span>
                      {isLeader && <span>👑</span>}
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Bidding Controls if player is still in auction */}
          {isMeActive ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 4 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>
                {t.auctionModal.quickBid}:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {[10, 50, 100].map((inc) => {
                  const targetBid = auction.highBid + inc;
                  const canAfford = myCash >= targetBid;
                  return (
                    <button
                      key={inc}
                      className="btn btn-outline"
                      style={{
                        padding: '10px 4px',
                        fontSize: 13,
                        fontWeight: 700,
                        opacity: !canAfford || isMeHighBidder ? 0.5 : 1,
                        cursor: !canAfford || isMeHighBidder ? 'not-allowed' : 'pointer',
                      }}
                      disabled={!canAfford || isMeHighBidder}
                      onClick={() => handleBid(targetBid)}
                      id={`btn-bid-plus-${inc}`}
                      title={!canAfford ? t.reasons.reasonInsufficientCash : isMeHighBidder ? t.reasons.reasonAlreadyHighBidder : `+${inc} so'm`}
                    >
                      <Plus size={14} />
                      <span>+{inc} so‘m</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Bid Row */}
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="number"
                  min={auction.highBid + 1}
                  max={myCash}
                  value={customBid}
                  onChange={(e) => setCustomBid(Number(e.target.value))}
                  style={{
                    flex: 1,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    color: '#FFF',
                    fontSize: 14,
                    fontWeight: 700,
                    outline: 'none',
                  }}
                  placeholder={`${auction.highBid + 10}...`}
                />
                <button
                  className="btn btn-primary"
                  style={{
                    padding: '8px 16px',
                    opacity: customBid <= auction.highBid || customBid > myCash || isMeHighBidder ? 0.5 : 1,
                  }}
                  disabled={customBid <= auction.highBid || customBid > myCash || isMeHighBidder}
                  onClick={() => handleBid(customBid)}
                  id="btn-bid-custom"
                >
                  {t.auctionModal.bid}
                </button>
              </div>

              {/* Pass Button */}
              <button
                className="btn btn-outline"
                style={{
                  width: '100%',
                  padding: '10px',
                  color: '#EF4444',
                  borderColor: 'rgba(239, 68, 68, 0.3)',
                  marginTop: 4,
                }}
                onClick={handlePass}
                id="btn-pass-auction-modal"
              >
                <XCircle size={16} />
                <span>{t.passAuction}</span>
              </button>
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '14px',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: 10,
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-muted)',
                fontSize: 13,
              }}
            >
              🔒 {t.auctionModal.youPassed}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
