import React from 'react';
import type { GameState, Player, ClientAction } from '@uzmonopoly/shared';
import { BOARD_TILES } from '@uzmonopoly/engine';
import { DiceRoll } from '../Dice/DiceRoll.js';
import type { Translations } from '../../i18n.js';

interface GameConsoleProps {
  gameState: GameState;
  myPlayerId?: string;
  onAction: (action: ClientAction) => void;
  t: Translations;
  turnTimeLeft?: number;
}

export const GameConsole: React.FC<GameConsoleProps> = ({
  gameState,
  myPlayerId,
  onAction,
  t,
  turnTimeLeft = 60,
}) => {
  const currentActingPlayer: Player | undefined = gameState.players[gameState.turnIndex];
  const isMyTurn = myPlayerId ? currentActingPlayer?.id === myPlayerId : true;
  const currentTile = currentActingPlayer ? BOARD_TILES[currentActingPlayer.position] : undefined;
  const lastDice: [number, number] = [
    gameState.doublesCount > 0 ? 3 : 4,
    gameState.doublesCount > 0 ? 3 : 2,
  ];

  return (
    <div
      className="glass-panel animate-fade-in"
      style={{
        width: '100%',
        maxWidth: 440,
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        background: 'rgba(11, 17, 32, 0.88)',
        boxShadow: '0 12px 36px rgba(0,0,0,0.6)',
      }}
    >
      {/* Turn Banner with Timer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          paddingBottom: 10,
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: currentActingPlayer?.color || '#F59E0B',
              boxShadow: `0 0 10px ${currentActingPlayer?.color || '#F59E0B'}`,
            }}
          />
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
              }}
            >
              {isMyTurn ? t.yourTurn : t.waitingTurn}
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
              {currentActingPlayer?.name}
            </div>
          </div>
        </div>

        {/* Circular Countdown Timer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 800,
              fontFamily: 'var(--font-heading)',
              color: turnTimeLeft < 10 ? '#EF4444' : '#F59E0B',
              padding: '4px 10px',
              borderRadius: 20,
              background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${turnTimeLeft < 10 ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.2)'}`,
            }}
          >
            ⏱️ {turnTimeLeft}s
          </div>
        </div>
      </div>

      {/* 3D Dice Display */}
      <DiceRoll
        dice={lastDice}
        canRoll={isMyTurn && gameState.phase === 'ROLL'}
        onRoll={() => onAction({ type: 'rollDice' })}
        doubles={gameState.doublesCount > 0}
      />

      {/* Decision Actions depending on Phase */}
      {gameState.phase === 'BUY_DECISION' && currentTile && (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 13, textAlign: 'center', color: 'var(--text-muted)' }}>
            <strong style={{ color: '#F8FAFC' }}>{currentTile.name}</strong> ({currentTile.price}{' '}
            so‘m) sotib olasizmi?
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className="btn btn-gold"
              style={{ flex: 1 }}
              onClick={() => onAction({ type: 'buy' })}
              disabled={
                !isMyTurn ||
                (currentActingPlayer && currentActingPlayer.cash < (currentTile.price ?? 0))
              }
              id="btn-buy-property"
            >
              💳 {t.buyProperty}
            </button>
            <button
              className="btn btn-outline"
              style={{ flex: 1 }}
              onClick={() => onAction({ type: 'declineBuy' })}
              disabled={!isMyTurn}
              id="btn-decline-buy"
            >
              🔨 {t.declineBuy}
            </button>
          </div>
        </div>
      )}

      {/* Auction Phase */}
      {gameState.phase === 'AUCTION' && gameState.auction && (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>AUKSION</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#F59E0B' }}>
              Eng yuqori taklif: {gameState.auction.highBid} so‘m
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={() => onAction({ type: 'bid', amount: gameState.auction!.highBid + 10 })}
              id="btn-bid-auction"
            >
              ➕ {gameState.auction.highBid + 10} so‘m
            </button>
            <button
              className="btn btn-outline"
              style={{ flex: 1 }}
              onClick={() => onAction({ type: 'passAuction' })}
              id="btn-pass-auction"
            >
              {t.passAuction}
            </button>
          </div>
        </div>
      )}

      {/* Post Roll -> End Turn */}
      {gameState.phase === 'POST_ROLL' && (
        <button
          className="btn btn-primary"
          style={{ width: '100%', padding: '12px 20px', fontSize: 15 }}
          onClick={() => onAction({ type: 'endTurn' })}
          disabled={!isMyTurn}
          id="btn-end-turn"
        >
          ➡️ {t.endTurn}
        </button>
      )}

      {/* Jail Options */}
      {gameState.phase === 'JAIL' && (
        <div style={{ display: 'flex', gap: 8, width: '100%' }}>
          <button
            className="btn btn-gold"
            style={{ flex: 1, fontSize: 13 }}
            onClick={() => onAction({ type: 'payJailFine' })}
            disabled={!isMyTurn || (currentActingPlayer && currentActingPlayer.cash < 50)}
          >
            {t.payJailFine}
          </button>
          <button
            className="btn btn-outline"
            style={{ flex: 1, fontSize: 13 }}
            onClick={() => onAction({ type: 'rollDice' })}
            disabled={!isMyTurn}
          >
            🎲 Дубль синаш
          </button>
        </div>
      )}

      {/* Game Over */}
      {gameState.phase === 'GAME_OVER' && (
        <div style={{ textAlign: 'center', padding: 12 }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#F59E0B' }}>
            🏆 {t.winnerDeclared}
          </div>
          <div style={{ fontSize: 16, marginTop: 4 }}>
            {gameState.players.find((p) => !p.bankrupt)?.name}
          </div>
        </div>
      )}
    </div>
  );
};
