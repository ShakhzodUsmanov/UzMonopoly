import React, { useState } from 'react';

interface DiceRollProps {
  dice: [number, number];
  isRolling?: boolean;
  canRoll?: boolean;
  onRoll?: () => void;
  doubles?: boolean;
}

const DIE_PIPS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[25, 25], [75, 75]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[25, 25], [75, 25], [25, 75], [75, 75]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]],
};

export const SingleDie: React.FC<{ value: number; rolling: boolean }> = ({ value, rolling }) => {
  const pips = DIE_PIPS[Math.min(6, Math.max(1, value))] || DIE_PIPS[1]!;

  return (
    <div
      style={{
        width: 52,
        height: 52,
        borderRadius: 12,
        background: 'linear-gradient(145deg, #FFFFFF, #E2E8F0)',
        boxShadow: rolling
          ? '0 0 20px rgba(245, 158, 11, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.8), inset 0 -3px 5px rgba(0, 0, 0, 0.2)'
          : '0 8px 18px rgba(0, 0, 0, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.8), inset 0 -3px 5px rgba(0, 0, 0, 0.2)',
        position: 'relative',
        display: 'inline-block',
        border: '1.5px solid rgba(255, 255, 255, 0.6)',
        animation: rolling ? 'diceRoll 0.6s cubic-bezier(0.25, 1, 0.5, 1) infinite' : 'none',
        transform: 'perspective(400px)',
      }}
    >
      <svg width="100%" height="100%" viewBox="0 0 100 100">
        {pips.map(([cx, cy], i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={10}
            fill="#0F172A"
            stroke="#334155"
            strokeWidth="1.5"
          />
        ))}
      </svg>
    </div>
  );
};

export const DiceRoll: React.FC<DiceRollProps> = ({
  dice,
  isRolling = false,
  canRoll = false,
  onRoll,
  doubles = false,
}) => {
  const [internalRolling, setInternalRolling] = useState(false);

  const handleClick = () => {
    if (!canRoll || isRolling || internalRolling) return;
    setInternalRolling(true);
    if (onRoll) onRoll();
    setTimeout(() => setInternalRolling(false), 600);
  };

  const rolling = isRolling || internalRolling;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
        <SingleDie value={dice[0]} rolling={rolling} />
        <SingleDie value={dice[1]} rolling={rolling} />
      </div>

      {doubles && !rolling && (
        <div
          className="badge badge-gold animate-fade-in"
          style={{
            fontSize: 12,
            padding: '4px 10px',
            animation: 'pulseGlow 1.5s infinite',
          }}
        >
          ✨ Dubl! {dice[0]} + {dice[1]} (Yana bir bor yuring!)
        </div>
      )}

      {canRoll && (
        <button
          className="btn btn-gold"
          onClick={handleClick}
          disabled={rolling}
          id="btn-roll-dice"
          style={{
            fontSize: 15,
            padding: '12px 24px',
            boxShadow: '0 0 25px rgba(245, 158, 11, 0.45)',
          }}
        >
          🎲 Toshlarni tashlash
        </button>
      )}
    </div>
  );
};
