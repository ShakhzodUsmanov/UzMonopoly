import React from 'react';
import type { TileDefinition, TileState, Player } from '@uzmonopoly/shared';
import { COLOR_GROUPS } from '@uzmonopoly/shared';

interface BoardTileProps {
  tile: TileDefinition;
  tileState?: TileState;
  owner?: Player;
  isCurrentTile?: boolean;
  onClick?: () => void;
  x: number;
  y: number;
  width: number;
  height: number;
  orientation: 'bottom' | 'left' | 'top' | 'right' | 'corner';
}

const GROUP_COLORS = Object.fromEntries(
  COLOR_GROUPS.map((g) => [g.id, g.color]),
);

export const BoardTile: React.FC<BoardTileProps> = ({
  tile,
  tileState,
  owner,
  isCurrentTile = false,
  onClick,
  x,
  y,
  width,
  height,
  orientation,
}) => {
  const isCorner = orientation === 'corner';
  const groupColor = tile.group ? GROUP_COLORS[tile.group] || '#475569' : undefined;
  const isMortgaged = tileState?.mortgaged ?? false;
  const houses = tileState?.houses ?? 0;

  // Header band dimensions based on tile orientation
  const renderHeaderBar = () => {
    if (!groupColor || isCorner) return null;

    let barX = x;
    let barY = y;
    let barW = width;
    let barH = 22;

    if (orientation === 'bottom') {
      barH = 22;
      barY = y;
    } else if (orientation === 'top') {
      barH = 22;
      barY = y + height - 22;
    } else if (orientation === 'left') {
      barW = 22;
      barX = x + width - 22;
      barH = height;
    } else if (orientation === 'right') {
      barW = 22;
      barX = x;
      barH = height;
    }

    return (
      <g>
        <rect
          x={barX}
          y={barY}
          width={barW}
          height={barH}
          fill={groupColor}
          stroke="rgba(0,0,0,0.4)"
          strokeWidth="0.5"
        />
        {/* Render Houses or Hotel */}
        {houses > 0 && houses < 5 && (
          <g>
            {Array.from({ length: houses }).map((_, i) => {
              const hx = orientation === 'bottom' || orientation === 'top'
                ? barX + 6 + i * 13
                : barX + 4;
              const hy = orientation === 'bottom' || orientation === 'top'
                ? barY + 4
                : barY + 6 + i * 13;
              return (
                <rect
                  key={i}
                  x={hx}
                  y={hy}
                  width={10}
                  height={12}
                  rx={2}
                  fill="#10B981"
                  stroke="#064E3B"
                  strokeWidth="1"
                />
              );
            })}
          </g>
        )}
        {houses === 5 && (
          <rect
            x={orientation === 'bottom' || orientation === 'top' ? barX + barW / 2 - 12 : barX + 3}
            y={orientation === 'bottom' || orientation === 'top' ? barY + 3 : barY + barH / 2 - 10}
            width={orientation === 'bottom' || orientation === 'top' ? 24 : 16}
            height={orientation === 'bottom' || orientation === 'top' ? 15 : 20}
            rx={2}
            fill="#EF4444"
            stroke="#7F1D1D"
            strokeWidth="1.5"
          />
        )}
      </g>
    );
  };

  // Render corner or special tile icon/graphics
  const renderSpecialIcon = () => {
    const cx = x + width / 2;
    const cy = y + height / 2;

    if (tile.type === 'START') {
      return (
        <g>
          <rect x={x + 10} y={y + 10} width={width - 20} height={height - 20} rx={12} fill="rgba(245,158,11,0.15)" />
          <path d={`M ${cx - 24} ${cy} L ${cx + 14} ${cy} M ${cx + 6} ${cy - 12} L ${cx + 18} ${cy} L ${cx + 6} ${cy + 12}`} stroke="#F59E0B" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          <text x={cx} y={cy + 36} fill="#F59E0B" fontSize="13" fontWeight="800" textAnchor="middle" fontFamily="var(--font-heading)">
            BOSHLASH
          </text>
        </g>
      );
    }

    if (tile.type === 'JAIL') {
      return (
        <g>
          <rect x={x + 10} y={y + 10} width={width - 20} height={height - 20} rx={12} fill="rgba(239,68,68,0.12)" />
          {/* Prison Bars */}
          <line x1={cx - 18} y1={cy - 20} x2={cx - 18} y2={cy + 15} stroke="#94A3B8" strokeWidth="3" />
          <line x1={cx - 6} y1={cy - 20} x2={cx - 6} y2={cy + 15} stroke="#94A3B8" strokeWidth="3" />
          <line x1={cx + 6} y1={cy - 20} x2={cx + 6} y2={cy + 15} stroke="#94A3B8" strokeWidth="3" />
          <line x1={cx + 18} y1={cy - 20} x2={cx + 18} y2={cy + 15} stroke="#94A3B8" strokeWidth="3" />
          <text x={cx} y={cy + 36} fill="#EF4444" fontSize="12" fontWeight="800" textAnchor="middle" fontFamily="var(--font-heading)">
            QAMOQXONA
          </text>
        </g>
      );
    }

    if (tile.type === 'FREE_PARKING') {
      return (
        <g>
          <rect x={x + 10} y={y + 10} width={width - 20} height={height - 20} rx={12} fill="rgba(16,185,129,0.12)" />
          <circle cx={cx} cy={cy - 4} r={20} fill="#10B981" />
          <text x={cx} y={cy + 4} fill="#FFF" fontSize="22" fontWeight="900" textAnchor="middle" fontFamily="var(--font-heading)">P</text>
          <text x={cx} y={cy + 36} fill="#10B981" fontSize="11" fontWeight="800" textAnchor="middle" fontFamily="var(--font-heading)">
            BEPUL TO‘XTASH
          </text>
        </g>
      );
    }

    if (tile.type === 'GO_TO_JAIL') {
      return (
        <g>
          <rect x={x + 10} y={y + 10} width={width - 20} height={height - 20} rx={12} fill="rgba(239,68,68,0.15)" />
          <circle cx={cx} cy={cy - 8} r={16} fill="#EF4444" />
          <path d={`M ${cx - 8} ${cy - 8} L ${cx + 8} ${cy - 8} M ${cx} ${cy - 16} L ${cx} ${cy}`} stroke="#FFF" strokeWidth="2.5" />
          <text x={cx} y={cy + 36} fill="#F87171" fontSize="12" fontWeight="800" textAnchor="middle" fontFamily="var(--font-heading)">
            QAMOQQA BOR!
          </text>
        </g>
      );
    }

    if (tile.type === 'CHANCE') {
      return (
        <g>
          <circle cx={cx} cy={cy - 6} r={14} fill="rgba(245,158,11,0.2)" />
          <text x={cx} y={cy + 1} fill="#F59E0B" fontSize="20" fontWeight="900" textAnchor="middle">?</text>
        </g>
      );
    }

    if (tile.type === 'COMMUNITY_CHEST') {
      return (
        <g>
          <rect x={cx - 14} y={cy - 14} width={28} height={18} rx={3} fill="#0284C7" stroke="#38BDF8" strokeWidth="1.5" />
          <circle cx={cx} cy={cy - 5} r={2.5} fill="#F59E0B" />
        </g>
      );
    }

    if (tile.type === 'TAX') {
      return (
        <g>
          <circle cx={cx} cy={cy - 8} r={13} fill="rgba(239,68,68,0.2)" />
          <text x={cx} y={cy - 2} fill="#EF4444" fontSize="14" fontWeight="800" textAnchor="middle">%</text>
        </g>
      );
    }

    if (tile.group === 'aviation') {
      return (
        <g>
          <circle cx={cx} cy={cy - 8} r={13} fill="rgba(56,189,248,0.15)" />
          <text x={cx} y={cy - 2} fill="#38BDF8" fontSize="13" fontWeight="800" textAnchor="middle">✈</text>
        </g>
      );
    }

    return null;
  };

  return (
    <g
      id={`tile-${tile.index}`}
      onClick={onClick}
      style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
    >
      {/* Tile Base Box */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={isCurrentTile ? '#1E293B' : '#0B1120'}
        stroke={isCurrentTile ? '#F59E0B' : 'rgba(255, 255, 255, 0.12)'}
        strokeWidth={isCurrentTile ? 2.5 : 1}
      />

      {/* Owner Colored Accent Border */}
      {owner && (
        <rect
          x={x + 1}
          y={y + 1}
          width={width - 2}
          height={height - 2}
          fill="none"
          stroke={owner.color}
          strokeWidth={2}
          strokeOpacity={0.8}
        />
      )}

      {/* Header bar for property */}
      {renderHeaderBar()}

      {/* Special Icon */}
      {renderSpecialIcon()}

      {/* Tile Name Text */}
      {!isCorner && (
        <g>
          <text
            x={x + width / 2}
            y={
              orientation === 'bottom'
                ? y + 42
                : orientation === 'top'
                  ? y + 26
                  : y + height / 2 - 4
            }
            fill="#F8FAFC"
            fontSize={width < 70 ? '8.5' : '10'}
            fontWeight="600"
            textAnchor="middle"
            fontFamily="var(--font-heading)"
          >
            {tile.name.length > 13 ? `${tile.name.slice(0, 12)}…` : tile.name}
          </text>

          {/* Price Tag if property */}
          {tile.price && (
            <text
              x={x + width / 2}
              y={
                orientation === 'bottom'
                  ? y + height - 12
                  : orientation === 'top'
                    ? y + height - 28
                    : y + height / 2 + 16
              }
              fill="#94A3B8"
              fontSize="8.5"
              fontWeight="500"
              textAnchor="middle"
              fontFamily="var(--font-heading)"
            >
              {tile.price} so‘m
            </text>
          )}
        </g>
      )}

      {/* Mortgaged Stamp Overlay */}
      {isMortgaged && (
        <g>
          <rect
            x={x + 2}
            y={y + 2}
            width={width - 4}
            height={height - 4}
            fill="rgba(15, 23, 42, 0.75)"
          />
          <text
            x={x + width / 2}
            y={y + height / 2 + 4}
            fill="#EF4444"
            fontSize="9"
            fontWeight="900"
            textAnchor="middle"
            transform={`rotate(-25, ${x + width / 2}, ${y + height / 2})`}
            letterSpacing="1px"
          >
            GAROVDA
          </text>
        </g>
      )}
    </g>
  );
};
