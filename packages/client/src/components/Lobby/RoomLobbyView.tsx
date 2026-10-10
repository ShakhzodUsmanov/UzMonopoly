import React, { useState } from 'react';
import type { TokenId } from '@uzmonopoly/shared';
import { TOKENS, PLAYER_COLORS } from '@uzmonopoly/shared';
import { TokenIcon } from '../Tokens/TokenIcon.js';
import type { LobbyInfo } from '../../services/network.js';
import type { Translations } from '../../i18n.js';
import { Copy, Check, Crown, Play, UserMinus, LogOut, Bot } from 'lucide-react';

interface RoomLobbyViewProps {
  lobby: LobbyInfo;
  myPlayerId?: string;
  onReady: () => void;
  onSetToken: (token: TokenId, color: string) => void;
  onKickPlayer: (playerId: string) => void;
  onAddBot?: () => void;
  onStartGame: () => void;
  onLeave: () => void;
  t: Translations;
}

export const RoomLobbyView: React.FC<RoomLobbyViewProps> = ({
  lobby,
  myPlayerId,
  onReady,
  onSetToken,
  onKickPlayer,
  onAddBot,
  onStartGame,
  onLeave,
  t,
}) => {
  const [copied, setCopied] = useState(false);
  const myPlayer = lobby.players.find((p) => p.id === myPlayerId) || lobby.players[0];
  const isHost = myPlayer?.isHost ?? false;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(lobby.roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const allReady = lobby.players.length >= 2 && lobby.players.every((p) => p.isReady || p.isHost);

  // Taken tokens and colors by other players
  const takenTokens = new Set(
    lobby.players.filter((p) => p.id !== myPlayer?.id).map((p) => p.token),
  );
  const takenColors = new Set(
    lobby.players.filter((p) => p.id !== myPlayer?.id).map((p) => p.color),
  );

  return (
    <div
      style={{
        maxWidth: 720,
        width: '100%',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        padding: '24px 16px',
      }}
    >
      {/* Header Room Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.85), rgba(30, 41, 59, 0.7))',
        }}
      >
        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--text-muted)',
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}
          >
            {t.lobbyTitle}
          </div>
          <h2 className="heading-gold" style={{ fontSize: 28, marginTop: 4 }}>
            XONA #{lobby.roomCode}
          </h2>
          <div style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 2 }}>
            {lobby.isPrivate ? t.privateRoom : t.publicRoom} • Maks: {lobby.maxPlayers} o‘yinchi
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button className="btn btn-outline" onClick={handleCopyCode} id="btn-copy-room-code">
            {copied ? <Check size={16} color="#10B981" /> : <Copy size={16} />}
            <span>{copied ? t.codeCopied : t.copyCode}</span>
          </button>

          <button
            className="btn btn-outline"
            style={{ color: '#EF4444', borderColor: 'rgba(239,68,68,0.3)' }}
            onClick={onLeave}
          >
            <LogOut size={16} />
            <span>{t.leaveRoom}</span>
          </button>
        </div>
      </div>

      {/* Players List Grid */}
      <div className="glass-panel" style={{ padding: 20 }}>
        <h3
          style={{
            fontSize: 16,
            fontWeight: 700,
            marginBottom: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>
            {t.playersTab} ({lobby.players.length}/{lobby.maxPlayers})
          </span>
          <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)' }}>
            {t.waitingPlayers}
          </span>
        </h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 12,
          }}
        >
          {lobby.players.map((player) => {
            const isMe = player.id === myPlayer?.id;

            return (
              <div
                key={player.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: 14,
                  background: isMe ? 'rgba(59, 130, 246, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                  border: `1.5px solid ${isMe ? 'rgba(59, 130, 246, 0.4)' : 'var(--border-subtle)'}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: '#0F172A',
                      border: `3px solid ${player.color}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <TokenIcon token={player.token} size={24} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{player.name}</span>
                      {player.isHost && <Crown size={14} color="#F59E0B" />}
                      {isMe && (
                        <span className="badge badge-blue" style={{ fontSize: 9 }}>
                          {t.youBadge}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      {t.tokens[player.token]}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    className={`badge ${player.isReady ? 'badge-emerald' : 'badge-gold'}`}
                    style={{ fontSize: 10 }}
                  >
                    {player.isReady ? t.ready : t.notReady}
                  </span>

                  {isHost && !player.isHost && (
                    <button
                      onClick={() => onKickPlayer(player.id)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: 'none',
                        color: '#EF4444',
                        padding: 6,
                        borderRadius: 8,
                        cursor: 'pointer',
                      }}
                      title={t.kick}
                    >
                      <UserMinus size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {isHost && onAddBot && lobby.players.length < lobby.maxPlayers && (
          <button
            className="btn btn-outline"
            style={{
              marginTop: 14,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13,
            }}
            onClick={onAddBot}
            id="btn-add-ai-bot"
          >
            <Bot size={16} color="#8B5CF6" />
            <span>+ {t.addBot}</span>
          </button>
        )}
      </div>

      {/* Customization: Token & Color Picker for Me */}
      {myPlayer && (
        <div className="glass-panel" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>{t.chooseToken}</h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
              gap: 10,
              marginBottom: 18,
            }}
          >
            {TOKENS.map((tokenDef) => {
              const isSelected = myPlayer.token === tokenDef.id;
              const isTaken = takenTokens.has(tokenDef.id);

              return (
                <button
                  key={tokenDef.id}
                  onClick={() => !isTaken && onSetToken(tokenDef.id, myPlayer.color)}
                  disabled={isTaken}
                  style={{
                    padding: '12px 8px',
                    borderRadius: 12,
                    background: isSelected
                      ? 'rgba(245, 158, 11, 0.15)'
                      : 'rgba(255, 255, 255, 0.03)',
                    border: isSelected ? '2px solid #F59E0B' : '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                    cursor: isTaken ? 'not-allowed' : 'pointer',
                    opacity: isTaken ? 0.35 : 1,
                  }}
                >
                  <TokenIcon token={tokenDef.id} size={32} glow={isSelected} />
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: isSelected ? '#F59E0B' : 'var(--text-main)',
                    }}
                  >
                    {t.tokens[tokenDef.id]}
                  </span>
                </button>
              );
            })}
          </div>

          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>{t.chooseColor}</h3>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {PLAYER_COLORS.map((colorHex) => {
              const isSelected = myPlayer.color === colorHex;
              const isTaken = takenColors.has(colorHex);

              return (
                <button
                  key={colorHex}
                  onClick={() => !isTaken && onSetToken(myPlayer.token, colorHex)}
                  disabled={isTaken}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: colorHex,
                    border: isSelected ? '3px solid #FFF' : '2px solid transparent',
                    boxShadow: isSelected ? `0 0 14px ${colorHex}` : 'none',
                    cursor: isTaken ? 'not-allowed' : 'pointer',
                    opacity: isTaken ? 0.25 : 1,
                  }}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom Actions: Ready Toggle & Host Start */}
      <div style={{ display: 'flex', gap: 14, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        <button
          className={`btn ${myPlayer?.isReady ? 'btn-outline' : 'btn-primary'}`}
          onClick={onReady}
          id="btn-ready-toggle"
          style={{ padding: '14px 28px', fontSize: 15 }}
        >
          {myPlayer?.isReady ? t.notReady : t.toggleReady}
        </button>

        {isHost && (
          <button
            className="btn btn-gold"
            onClick={onStartGame}
            disabled={!allReady}
            id="btn-start-game"
            style={{ padding: '14px 32px', fontSize: 16 }}
          >
            <Play size={18} fill="#1A1001" />
            <span>{t.startGame}</span>
          </button>
        )}
      </div>
    </div>
  );
};
