import React, { useEffect } from 'react';
import type { GameState } from '@uzmonopoly/shared';
import { calculateNetWorth, BOARD_TILES } from '@uzmonopoly/engine';
import { TOKENS } from '@uzmonopoly/shared';
import type { Translations, Locale } from '../../i18n.js';
import { audioService } from '../../services/audio.js';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Home } from 'lucide-react';

interface GameOverModalProps {
  gameState: GameState;
  onReturnToLobby: () => void;
  onBackHome: () => void;
  locale?: Locale;
  t: Translations;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  gameState,
  onReturnToLobby,
  onBackHome,
  t,
}) => {
  const winner = gameState.players.find((p) => !p.bankrupt) || gameState.players[0];

  const winnerToken = TOKENS.find((tok) => tok.id === winner?.token);

  useEffect(() => {
    // Play celebratory fanfare
    audioService.playVictoryFanfare();

    // Fire multi-stage celebratory confetti
    const end = Date.now() + 3 * 1000;
    const interval = setInterval(() => {
      if (Date.now() > end) {
        clearInterval(interval);
        return;
      }
      confetti({
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
      });
    }, 350);

    return () => clearInterval(interval);
  }, []);

  if (!winner) return null;

  const winnerNetWorth = calculateNetWorth(gameState, winner.id);
  const ownedTiles = BOARD_TILES.filter((t) => gameState.tiles[t.index]?.ownerId === winner.id);
  const totalHouses = ownedTiles.reduce(
    (acc, t) => acc + (gameState.tiles[t.index]?.houses ?? 0),
    0,
  );

  return (
    <div
      className="modal-overlay"
      id="modal-game-over"
      style={{ backdropFilter: 'blur(10px)', zIndex: 1100 }}
    >
      <div
        className="modal-content animate-fade-in"
        style={{
          maxWidth: 480,
          padding: 0,
          overflow: 'hidden',
          background: 'linear-gradient(180deg, #1A1F38 0%, #0B1120 100%)',
          border: '2px solid var(--accent-gold)',
          boxShadow: '0 25px 80px rgba(245, 158, 11, 0.4)',
          textAlign: 'center',
        }}
      >
        {/* Golden Trophy Banner */}
        <div
          style={{
            background:
              'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(15, 23, 42, 0.95) 100%)',
            padding: '36px 24px 20px',
            position: 'relative',
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%)',
              boxShadow: '0 0 35px rgba(245, 158, 11, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <Trophy size={40} color="#78350F" />
          </div>

          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: '#FDE68A',
            }}
          >
            {t.gameOverModal.victoryTitle}
          </div>
          <h1
            style={{
              fontSize: 30,
              fontWeight: 900,
              color: '#FFF',
              fontFamily: 'var(--font-heading)',
              margin: '6px 0 0',
            }}
          >
            {winner.name}
          </h1>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              marginTop: 10,
              padding: '6px 16px',
              borderRadius: 20,
              background: 'rgba(255,255,255,0.06)',
              border: `1px solid ${winner.color}`,
              fontSize: 14,
              fontWeight: 700,
              color: winner.color,
            }}
          >
            <span>{winnerToken?.icon}</span>
            <span>{t.tokens[winner.token] || winner.token}</span>
          </div>
        </div>

        {/* Stats Summary */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
              textAlign: 'left',
            }}
          >
            <div
              style={{
                background: 'rgba(255,255,255,0.03)',
                padding: '12px 16px',
                borderRadius: 12,
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
                {t.gameOverModal.totalCapital}
              </div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#10B981', marginTop: 4 }}>
                {winnerNetWorth.toLocaleString()} so‘m
              </div>
            </div>

            <div
              style={{
                background: 'rgba(255,255,255,0.03)',
                padding: '12px 16px',
                borderRadius: 12,
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
                {t.gameOverModal.propertiesOwned}
              </div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#F59E0B', marginTop: 4 }}>
                {ownedTiles.length} / 36
              </div>
            </div>

            <div
              style={{
                background: 'rgba(255,255,255,0.03)',
                padding: '12px 16px',
                borderRadius: 12,
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
                {t.gameOverModal.branchesBuilt}
              </div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#60A5FA', marginTop: 4 }}>
                {totalHouses} {t.propertyCard.house}
              </div>
            </div>

            <div
              style={{
                background: 'rgba(255,255,255,0.03)',
                padding: '12px 16px',
                borderRadius: 12,
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
                {t.gameOverModal.turnsPlayed}
              </div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#A78BFA', marginTop: 4 }}>
                {gameState.seq}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button
              className="btn btn-gold"
              style={{ flex: 1, padding: '12px', fontSize: 14 }}
              onClick={onReturnToLobby}
              id="btn-play-again"
            >
              <RotateCcw size={16} />
              <span>{t.gameOverModal.playAgain}</span>
            </button>
            <button
              className="btn btn-outline"
              style={{ flex: 1, padding: '12px', fontSize: 14 }}
              onClick={onBackHome}
              id="btn-return-home"
            >
              <Home size={16} />
              <span>{t.gameOverModal.homeMenu}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
