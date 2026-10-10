import React from 'react';
import type { Player } from '@uzmonopoly/shared';
import { TokenIcon } from '../Tokens/TokenIcon.js';

interface PlayerTokenProps {
  player: Player;
  cx: number;
  cy: number;
  isCurrent?: boolean;
}

export const PlayerToken: React.FC<PlayerTokenProps> = ({ player, cx, cy, isCurrent = false }) => {
  return (
    <g
      id={`player-token-${player.id}`}
      style={{
        transition: 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
        transform: `translate(${cx}px, ${cy}px)`,
      }}
    >
      {/* Current Turn Pulse Ring */}
      {isCurrent && (
        <circle
          cx={0}
          cy={0}
          r={22}
          fill="none"
          stroke="#F59E0B"
          strokeWidth={2.5}
          strokeDasharray="4 4"
          opacity={0.85}
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0"
            to="360"
            dur="6s"
            repeatCount="indefinite"
          />
        </circle>
      )}

      {/* Shadow */}
      <ellipse cx={0} cy={12} rx={14} ry={4} fill="#000" opacity={0.45} />

      {/* Player Color Base Ring */}
      <circle cx={0} cy={0} r={16} fill="#0F172A" stroke={player.color} strokeWidth={3} />

      {/* Embedded Token Graphic */}
      <foreignObject x={-12} y={-12} width={24} height={24}>
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <TokenIcon token={player.token} size={20} glow={isCurrent} />
        </div>
      </foreignObject>
    </g>
  );
};
