import React from 'react';
import type { GameState, TileDefinition, Player } from '@uzmonopoly/shared';
import { BOARD_TILES } from '@uzmonopoly/engine';
import { BoardTile } from './BoardTile.js';
import { PlayerToken } from './PlayerToken.js';

interface GameBoardProps {
  gameState: GameState;
  onTileClick?: (tile: TileDefinition) => void;
  selectedTileIndex?: number;
  centerContent?: React.ReactNode;
}

interface TileLayout {
  tile: TileDefinition;
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  orientation: 'bottom' | 'left' | 'top' | 'right' | 'corner';
}

// 1000 x 1000 Board Dimensions
const BOARD_DIM = 1000;
const CORNER_SIZE = 130;
const SIDE_TILES_COUNT = 12;
const SIDE_TILE_SIZE = (BOARD_DIM - 2 * CORNER_SIZE) / SIDE_TILES_COUNT; // 740 / 12 = 61.6667

export function computeBoardLayout(): TileLayout[] {
  return BOARD_TILES.map((tile) => {
    const idx = tile.index;

    // 1. Corner 0: Bottom-Right (START)
    if (idx === 0) {
      const x = BOARD_DIM - CORNER_SIZE;
      const y = BOARD_DIM - CORNER_SIZE;
      return {
        tile,
        x,
        y,
        width: CORNER_SIZE,
        height: CORNER_SIZE,
        centerX: x + CORNER_SIZE / 2,
        centerY: y + CORNER_SIZE / 2,
        orientation: 'corner',
      };
    }

    // 2. Bottom Side: Tiles 1..12 (Right to Left)
    if (idx >= 1 && idx <= 12) {
      const x = BOARD_DIM - CORNER_SIZE - idx * SIDE_TILE_SIZE;
      const y = BOARD_DIM - CORNER_SIZE;
      return {
        tile,
        x,
        y,
        width: SIDE_TILE_SIZE,
        height: CORNER_SIZE,
        centerX: x + SIDE_TILE_SIZE / 2,
        centerY: y + CORNER_SIZE / 2,
        orientation: 'bottom',
      };
    }

    // 3. Corner 13: Bottom-Left (JAIL)
    if (idx === 13) {
      const x = 0;
      const y = BOARD_DIM - CORNER_SIZE;
      return {
        tile,
        x,
        y,
        width: CORNER_SIZE,
        height: CORNER_SIZE,
        centerX: x + CORNER_SIZE / 2,
        centerY: y + CORNER_SIZE / 2,
        orientation: 'corner',
      };
    }

    // 4. Left Side: Tiles 14..25 (Bottom to Top)
    if (idx >= 14 && idx <= 25) {
      const k = idx - 13;
      const x = 0;
      const y = BOARD_DIM - CORNER_SIZE - k * SIDE_TILE_SIZE;
      return {
        tile,
        x,
        y,
        width: CORNER_SIZE,
        height: SIDE_TILE_SIZE,
        centerX: x + CORNER_SIZE / 2,
        centerY: y + SIDE_TILE_SIZE / 2,
        orientation: 'left',
      };
    }

    // 5. Corner 26: Top-Left (FREE PARKING)
    if (idx === 26) {
      const x = 0;
      const y = 0;
      return {
        tile,
        x,
        y,
        width: CORNER_SIZE,
        height: CORNER_SIZE,
        centerX: x + CORNER_SIZE / 2,
        centerY: y + CORNER_SIZE / 2,
        orientation: 'corner',
      };
    }

    // 6. Top Side: Tiles 27..38 (Left to Right)
    if (idx >= 27 && idx <= 38) {
      const k = idx - 26;
      const x = CORNER_SIZE + (k - 1) * SIDE_TILE_SIZE;
      const y = 0;
      return {
        tile,
        x,
        y,
        width: SIDE_TILE_SIZE,
        height: CORNER_SIZE,
        centerX: x + SIDE_TILE_SIZE / 2,
        centerY: y + CORNER_SIZE / 2,
        orientation: 'top',
      };
    }

    // 7. Corner 39: Top-Right (GO TO JAIL)
    if (idx === 39) {
      const x = BOARD_DIM - CORNER_SIZE;
      const y = 0;
      return {
        tile,
        x,
        y,
        width: CORNER_SIZE,
        height: CORNER_SIZE,
        centerX: x + CORNER_SIZE / 2,
        centerY: y + CORNER_SIZE / 2,
        orientation: 'corner',
      };
    }

    // 8. Right Side: Tiles 40..51 (Top to Bottom)
    const k = idx - 39;
    const x = BOARD_DIM - CORNER_SIZE;
    const y = CORNER_SIZE + (k - 1) * SIDE_TILE_SIZE;
    return {
      tile,
      x,
      y,
      width: CORNER_SIZE,
      height: SIDE_TILE_SIZE,
      centerX: x + CORNER_SIZE / 2,
      centerY: y + SIDE_TILE_SIZE / 2,
      orientation: 'right',
    };
  });
}

const BOARD_LAYOUT = computeBoardLayout();

export const GameBoard: React.FC<GameBoardProps> = ({
  gameState,
  onTileClick,
  selectedTileIndex,
  centerContent,
}) => {
  const currentActingPlayer = gameState.players[gameState.turnIndex];

  // Group players by current position for offset calculation
  const playersByTile: Record<number, Player[]> = {};
  for (const player of gameState.players) {
    if (!player.bankrupt) {
      playersByTile[player.position] = playersByTile[player.position] || [];
      playersByTile[player.position]!.push(player);
    }
  }

  // Offset configuration for multiple tokens on the same tile
  const getPlayerOffset = (playerIndex: number, totalOnTile: number) => {
    if (totalOnTile <= 1) return { dx: 0, dy: 0 };
    const offsets2 = [
      { dx: -12, dy: 0 },
      { dx: 12, dy: 0 },
    ];
    const offsets4 = [
      { dx: -12, dy: -12 },
      { dx: 12, dy: -12 },
      { dx: -12, dy: 12 },
      { dx: 12, dy: 12 },
    ];
    const offsets6 = [
      { dx: -14, dy: -14 },
      { dx: 14, dy: -14 },
      { dx: -14, dy: 14 },
      { dx: 14, dy: 14 },
      { dx: 0, dy: -20 },
      { dx: 0, dy: 20 },
    ];
    if (totalOnTile <= 2) return offsets2[playerIndex] || { dx: 0, dy: 0 };
    if (totalOnTile <= 4) return offsets4[playerIndex] || { dx: 0, dy: 0 };
    return offsets6[playerIndex] || { dx: 0, dy: 0 };
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: 880,
        aspectRatio: '1 / 1',
        margin: '0 auto',
      }}
    >
      <svg
        viewBox="0 0 1000 1000"
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          borderRadius: 24,
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 40px rgba(0, 163, 196, 0.1)',
          border: '2px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Background Canvas with Islamic / Uzbek Geometric Girih Grid */}
        <defs>
          <radialGradient id="boardCenterGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#0F172A" />
            <stop offset="70%" stop-color="#090E1A" />
            <stop offset="100%" stop-color="#050811" />
          </radialGradient>

          <pattern id="uzbekPattern" width="60" height="60" patternUnits="userSpaceOnUse">
            <path
              d="M 30 0 L 60 30 L 30 60 L 0 30 Z"
              fill="none"
              stroke="rgba(245, 158, 11, 0.05)"
              strokeWidth="1.5"
            />
            <circle
              cx="30"
              cy="30"
              r="10"
              fill="none"
              stroke="rgba(0, 163, 196, 0.04)"
              strokeWidth="1"
            />
          </pattern>
        </defs>

        {/* Board Center Area */}
        <rect x={130} y={130} width={740} height={740} fill="url(#boardCenterGrad)" />
        <rect x={130} y={130} width={740} height={740} fill="url(#uzbekPattern)" />

        {/* Decorative Inner Golden Border */}
        <rect
          x={132}
          y={132}
          width={736}
          height={736}
          fill="none"
          stroke="rgba(245, 158, 11, 0.25)"
          strokeWidth="1.5"
        />

        {/* Uzbek Suzani Medallion Rosette */}
        <g transform="translate(500, 500)" opacity="0.18" pointerEvents="none">
          <circle r="180" fill="none" stroke="#F59E0B" strokeWidth="2" strokeDasharray="6,4" />
          <circle r="150" fill="none" stroke="#00A3C4" strokeWidth="1.5" />
          <circle r="110" fill="none" stroke="#10B981" strokeWidth="2" />
          <circle r="70" fill="none" stroke="#F59E0B" strokeWidth="1.5" />
          <circle r="25" fill="#F59E0B" opacity="0.3" />
          {/* 8-pointed star rosette petals */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
            <g key={angle} transform={`rotate(${angle})`}>
              <path
                d="M 0 0 C 30 -50 40 -120 0 -160 C -40 -120 -30 -50 0 0 Z"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="1.5"
              />
              <circle cx="0" cy="-130" r="6" fill="#00A3C4" opacity="0.6" />
            </g>
          ))}
        </g>

        {/* Board Title Center Graphic */}
        <g style={{ pointerEvents: 'none' }}>
          <text
            x={500}
            y={280}
            fill="#F8FAFC"
            fontSize="46"
            fontWeight="900"
            fontFamily="var(--font-heading)"
            textAnchor="middle"
            letterSpacing="6px"
          >
            UZMONOPOLY
          </text>
          <text
            x={500}
            y={310}
            fill="#F59E0B"
            fontSize="14"
            fontWeight="700"
            fontFamily="var(--font-heading)"
            textAnchor="middle"
            letterSpacing="3px"
          >
            O‘ZBEKISTON MILLIY BIZNES O‘YINI
          </text>
        </g>

        {/* Render 52 Tiles */}
        {BOARD_LAYOUT.map((layout) => {
          const tileState = gameState.tiles[layout.tile.index];
          const owner = tileState?.ownerId
            ? gameState.players.find((p) => p.id === tileState.ownerId)
            : undefined;
          const isCurrent =
            selectedTileIndex === layout.tile.index ||
            currentActingPlayer?.position === layout.tile.index;

          return (
            <BoardTile
              key={layout.tile.index}
              tile={layout.tile}
              tileState={tileState}
              owner={owner}
              isCurrentTile={isCurrent}
              x={layout.x}
              y={layout.y}
              width={layout.width}
              height={layout.height}
              orientation={layout.orientation}
              onClick={() => onTileClick && onTileClick(layout.tile)}
            />
          );
        })}

        {/* Render Player Tokens */}
        {Object.entries(playersByTile).map(([tileIdxStr, playersOnTile]) => {
          const tileIdx = Number(tileIdxStr);
          const layout = BOARD_LAYOUT[tileIdx];
          if (!layout) return null;

          return playersOnTile.map((player, pIdx) => {
            const offset = getPlayerOffset(pIdx, playersOnTile.length);
            const isActing = currentActingPlayer?.id === player.id;

            return (
              <PlayerToken
                key={player.id}
                player={player}
                cx={layout.centerX + offset.dx}
                cy={layout.centerY + offset.dy}
                isCurrent={isActing}
              />
            );
          });
        })}
      </svg>

      {/* Center Interactive Overlay / Actions */}
      {centerContent && (
        <div
          style={{
            position: 'absolute',
            top: '36%',
            left: '18%',
            right: '18%',
            bottom: '18%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'auto',
          }}
        >
          {centerContent}
        </div>
      )}
    </div>
  );
};
