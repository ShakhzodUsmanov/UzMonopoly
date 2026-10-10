import React from 'react';
import type { GameState } from '@uzmonopoly/shared';
import { TokenIcon } from '../Tokens/TokenIcon.js';
import { Crown, Bot, WifiOff } from 'lucide-react';
import type { Translations } from '../../i18n.js';

interface PlayerListProps {
  gameState: GameState;
  myPlayerId?: string;
  t: Translations;
}

export const PlayerList: React.FC<PlayerListProps> = ({
  gameState,
  myPlayerId,
  t,
}) => {
  const currentActingIdx = gameState.turnIndex;

  return (
    <div
      className="glass-panel"
      style={{
        width: '100%',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: 'var(--text-muted)',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: 6,
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <span>{t.playersTab} ({gameState.players.length})</span>
        <span>{t.cashLabel}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {gameState.players.map((player, idx) => {
          const isActing = currentActingIdx === idx;
          const isMe = player.id === myPlayerId;

          // Count owned properties
          const ownedCount = Object.values(gameState.tiles).filter(
            (ts) => ts.ownerId === player.id,
          ).length;

          return (
            <div
              key={player.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: 12,
                background: isActing
                  ? 'linear-gradient(90deg, rgba(245, 158, 11, 0.15), rgba(15, 23, 42, 0.6))'
                  : 'rgba(255, 255, 255, 0.03)',
                border: isActing
                  ? '1.5px solid rgba(245, 158, 11, 0.5)'
                  : isMe
                    ? '1.5px solid rgba(59, 130, 246, 0.4)'
                    : '1px solid var(--border-subtle)',
                opacity: player.bankrupt ? 0.4 : 1,
                transition: 'all 0.2s ease',
              }}
            >
              {/* Left: Avatar & Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    position: 'relative',
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: '#0F172A',
                    border: `2.5px solid ${player.color}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <TokenIcon token={player.token} size={20} />

                  {/* Status indicator badge */}
                  {player.isBot && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: -3,
                        right: -3,
                        background: '#8B5CF6',
                        borderRadius: '50%',
                        padding: 2,
                        display: 'flex',
                      }}
                      title="AI Bot"
                    >
                      <Bot size={10} color="#FFF" />
                    </span>
                  )}

                  {!player.connected && !player.isBot && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: -3,
                        right: -3,
                        background: '#EF4444',
                        borderRadius: '50%',
                        padding: 2,
                        display: 'flex',
                      }}
                      title="Disconnected"
                    >
                      <WifiOff size={10} color="#FFF" />
                    </span>
                  )}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: '#F8FAFC' }}>
                      {player.name}
                    </span>
                    {player.isHost && <Crown size={12} color="#F59E0B" />}
                    {isMe && (
                      <span className="badge badge-blue" style={{ fontSize: 9, padding: '1px 5px' }}>
                        {t.youBadge}
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', gap: 6, marginTop: 2 }}>
                    <span>{ownedCount} mulk</span>
                    {player.inJail && (
                      <span style={{ color: '#EF4444', fontWeight: 600 }}>🔒 {t.inJail}</span>
                    )}
                    {player.bankrupt && (
                      <span style={{ color: '#94A3B8', fontWeight: 700 }}>☠️ {t.bankrupt}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Cash */}
              <div style={{ textAlign: 'right' }}>
                <div
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 800,
                    fontSize: 14,
                    color: player.cash < 100 ? '#EF4444' : '#10B981',
                  }}
                >
                  {player.cash} so‘m
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
