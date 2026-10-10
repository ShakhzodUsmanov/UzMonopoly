import React, { useState } from 'react';
import type { GameState, ClientAction, TileDefinition } from '@uzmonopoly/shared';
import { BOARD_TILES } from '@uzmonopoly/engine';
import { COLOR_GROUPS } from '@uzmonopoly/shared';
import type { Translations, Locale } from '../../i18n.js';
import { audioService } from '../../services/audio.js';
import { ArrowLeftRight, Check, X } from 'lucide-react';

interface TradeModalProps {
  gameState: GameState;
  myPlayerId: string;
  onAction: (action: ClientAction) => void;
  onClose: () => void;
  locale: Locale;
  t: Translations;
}

const GROUP_COLORS = Object.fromEntries(COLOR_GROUPS.map((g) => [g.id, g.color]));

export const TradeModal: React.FC<TradeModalProps> = ({
  gameState,
  myPlayerId,
  onAction,
  onClose,
  locale,
  t,
}) => {
  const myPlayer = gameState.players.find((p) => p.id === myPlayerId);
  const otherPlayers = gameState.players.filter((p) => p.id !== myPlayerId && !p.bankrupt);
  const pendingTrade = gameState.pendingTrade;

  // Review mode if there's a trade targeting me
  const isIncomingTrade = pendingTrade && pendingTrade.targetId === myPlayerId;
  const isOutgoingTrade = pendingTrade && pendingTrade.initiatorId === myPlayerId;

  // New trade proposal form state
  const [selectedTargetId, setSelectedTargetId] = useState<string>(
    otherPlayers[0]?.id || '',
  );
  const [myMoney, setMyMoney] = useState<number>(0);
  const [targetMoney, setTargetMoney] = useState<number>(0);
  const [selectedMyTiles, setSelectedMyTiles] = useState<number[]>([]);
  const [selectedTargetTiles, setSelectedTargetTiles] = useState<number[]>([]);

  const targetPlayer = gameState.players.find((p) => p.id === selectedTargetId);

  // Helper to get properties owned by a player
  const getPlayerProperties = (playerId: string): TileDefinition[] => {
    return BOARD_TILES.filter((t) => {
      const state = gameState.tiles[t.index];
      return state?.ownerId === playerId;
    });
  };

  const myProperties = myPlayer ? getPlayerProperties(myPlayer.id) : [];
  const targetProperties = targetPlayer ? getPlayerProperties(targetPlayer.id) : [];

  // Toggle tile selection
  const toggleMyTile = (index: number) => {
    setSelectedMyTiles((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  const toggleTargetTile = (index: number) => {
    setSelectedTargetTiles((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  const handleProposeTrade = () => {
    if (!selectedTargetId) return;
    audioService.playClick();
    onAction({
      type: 'proposeTrade',
      targetId: selectedTargetId,
      initiatorMoney: myMoney,
      targetMoney: targetMoney,
      initiatorTiles: selectedMyTiles,
      targetTiles: selectedTargetTiles,
      initiatorJailCards: 0,
      targetJailCards: 0,
    });
  };

  const handleAnswerTrade = (accept: boolean) => {
    if (!pendingTrade) return;
    if (accept) {
      audioService.playCoin();
    } else {
      audioService.playClick();
    }
    onAction({
      type: 'answerTrade',
      tradeId: pendingTrade.id,
      accept,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" id="modal-trade" onClick={onClose}>
      <div
        className="modal-content animate-fade-in"
        style={{
          maxWidth: 640,
          padding: 0,
          overflow: 'hidden',
          background: 'linear-gradient(180deg, #131E35 0%, #0B1120 100%)',
          border: '1px solid var(--border-gold)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
            padding: '18px 24px',
            color: '#FFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ArrowLeftRight size={22} color="#F59E0B" />
            <span style={{ fontSize: 18, fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
              {isIncomingTrade ? t.tradeModal.receivedProposal : t.tradeModal.header}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Section */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Mode 1: Review Incoming Trade */}
          {isIncomingTrade && pendingTrade && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                <strong style={{ color: '#F59E0B' }}>
                  {gameState.players.find((p) => p.id === pendingTrade.initiatorId)?.name}
                </strong>{' '}
                {t.tradeModal.proposalNotice}:
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* They Give */}
                <div
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: 12,
                    padding: 14,
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#10B981', marginBottom: 8 }}>
                    🎁 {t.tradeModal.theyGive}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#F8FAFC', marginBottom: 6 }}>
                    💵 {pendingTrade.initiatorMoney.toLocaleString()} so‘m
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {pendingTrade.initiatorTiles.map((idx) => {
                      const tDef = BOARD_TILES[idx];
                      if (!tDef) return null;
                      return (
                        <div key={idx} style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          • {tDef.nameI18n?.[locale] || tDef.name}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* They Want */}
                <div
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: 12,
                    padding: 14,
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#EF4444', marginBottom: 8 }}>
                    🤝 {t.tradeModal.theyWant}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#F8FAFC', marginBottom: 6 }}>
                    💵 {pendingTrade.targetMoney.toLocaleString()} so‘m
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {pendingTrade.targetTiles.map((idx) => {
                      const tDef = BOARD_TILES[idx];
                      if (!tDef) return null;
                      return (
                        <div key={idx} style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          • {tDef.nameI18n?.[locale] || tDef.name}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button
                  className="btn btn-gold"
                  style={{ flex: 1, padding: '12px' }}
                  onClick={() => handleAnswerTrade(true)}
                  id="btn-accept-trade"
                >
                  <Check size={16} />
                  <span>{t.tradeModal.accept}</span>
                </button>
                <button
                  className="btn btn-outline"
                  style={{ flex: 1, padding: '12px', color: '#EF4444', borderColor: 'rgba(239,68,68,0.3)' }}
                  onClick={() => handleAnswerTrade(false)}
                  id="btn-reject-trade"
                >
                  <X size={16} />
                  <span>{t.tradeModal.reject}</span>
                </button>
              </div>
            </div>
          )}

          {/* Mode 2: Outgoing Trade Pending */}
          {isOutgoingTrade && pendingTrade && (
            <div
              style={{
                textAlign: 'center',
                padding: '30px 20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 700 }}>
                ⏳ {t.tradeModal.waitingResponse}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                {gameState.players.find((p) => p.id === pendingTrade.targetId)?.name}{' '}
                {t.tradeModal.reviewingNotice}
              </div>
              <button
                className="btn btn-outline"
                style={{ marginTop: 12 }}
                onClick={() => handleAnswerTrade(false)}
              >
                {t.tradeModal.cancelProposal}
              </button>
            </div>
          )}

          {/* Mode 3: Compose New Trade Proposal */}
          {!pendingTrade && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Partner Select */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>
                  {t.tradeModal.tradeWith}:
                </span>
                <select
                  value={selectedTargetId}
                  onChange={(e) => {
                    setSelectedTargetId(e.target.value);
                    setSelectedTargetTiles([]);
                  }}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    color: '#FFF',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    fontSize: 13,
                    flex: 1,
                  }}
                >
                  {otherPlayers.map((p) => (
                    <option key={p.id} value={p.id} style={{ background: '#0F172A' }}>
                      {p.name} ({p.cash.toLocaleString()} so‘m)
                    </option>
                  ))}
                </select>
              </div>

              {/* 2-Column Split: I Give / I Get */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* Left Column: I Give */}
                <div
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 12,
                    padding: 14,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#F59E0B' }}>
                    📤 {t.tradeModal.iGive}
                  </div>

                  {/* Money Input */}
                  <div>
                    <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                      {t.tradeModal.money} (max: {myPlayer?.cash ?? 0})
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={myPlayer?.cash ?? 0}
                      value={myMoney}
                      onChange={(e) => setMyMoney(Math.min(myPlayer?.cash ?? 0, Math.max(0, Number(e.target.value))))}
                      style={{
                        width: '100%',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 6,
                        padding: '6px 10px',
                        color: '#FFF',
                        fontSize: 13,
                      }}
                    />
                  </div>

                  {/* Property Checklist */}
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                    {t.tradeModal.properties}:
                  </div>
                  <div style={{ maxHeight: 160, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {myProperties.length === 0 ? (
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        {t.tradeModal.noProperties}
                      </div>
                    ) : (
                      myProperties.map((tile) => {
                        const checked = selectedMyTiles.includes(tile.index);
                        const groupCol = tile.group ? GROUP_COLORS[tile.group] || '#475569' : '#0284C7';
                        return (
                          <label
                            key={tile.index}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              fontSize: 12,
                              padding: '4px 6px',
                              borderRadius: 4,
                              background: checked ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
                              cursor: 'pointer',
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleMyTile(tile.index)}
                            />
                            <span
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                background: groupCol,
                              }}
                            />
                            <span>{tile.nameI18n?.[locale] || tile.name}</span>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Right Column: I Get */}
                <div
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 12,
                    padding: 14,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#10B981' }}>
                    📥 {t.tradeModal.iGet}
                  </div>

                  {/* Money Input */}
                  <div>
                    <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                      {t.tradeModal.money} (max: {targetPlayer?.cash ?? 0})
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={targetPlayer?.cash ?? 0}
                      value={targetMoney}
                      onChange={(e) => setTargetMoney(Math.min(targetPlayer?.cash ?? 0, Math.max(0, Number(e.target.value))))}
                      style={{
                        width: '100%',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 6,
                        padding: '6px 10px',
                        color: '#FFF',
                        fontSize: 13,
                      }}
                    />
                  </div>

                  {/* Property Checklist */}
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                    {t.tradeModal.properties}:
                  </div>
                  <div style={{ maxHeight: 160, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {targetProperties.length === 0 ? (
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        {t.tradeModal.noProperties}
                      </div>
                    ) : (
                      targetProperties.map((tile) => {
                        const checked = selectedTargetTiles.includes(tile.index);
                        const groupCol = tile.group ? GROUP_COLORS[tile.group] || '#475569' : '#0284C7';
                        return (
                          <label
                            key={tile.index}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              fontSize: 12,
                              padding: '4px 6px',
                              borderRadius: 4,
                              background: checked ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                              cursor: 'pointer',
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleTargetTile(tile.index)}
                            />
                            <span
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                background: groupCol,
                              }}
                            />
                            <span>{tile.nameI18n?.[locale] || tile.name}</span>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Propose Button */}
              <button
                className="btn btn-gold"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: 14,
                  opacity: selectedMyTiles.length === 0 && myMoney === 0 && selectedTargetTiles.length === 0 && targetMoney === 0 ? 0.5 : 1,
                }}
                disabled={selectedMyTiles.length === 0 && myMoney === 0 && selectedTargetTiles.length === 0 && targetMoney === 0}
                onClick={handleProposeTrade}
                id="btn-propose-trade"
              >
                🤝 {t.tradeModal.sendProposal}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
