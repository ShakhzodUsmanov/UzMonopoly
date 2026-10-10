import React from 'react';
import type { TileDefinition, TileState, Player } from '@uzmonopoly/shared';
import { COLOR_GROUPS } from '@uzmonopoly/shared';
import { calculateRent } from '@uzmonopoly/engine';
import { X } from 'lucide-react';

interface PropertyCardModalProps {
  tile: TileDefinition | null;
  tileState?: TileState;
  owner?: Player;
  onClose: () => void;
}

const GROUP_COLORS = Object.fromEntries(COLOR_GROUPS.map((g) => [g.id, g.color]));

export const PropertyCardModal: React.FC<PropertyCardModalProps> = ({
  tile,
  tileState,
  owner,
  onClose,
}) => {
  if (!tile) return null;

  const groupColor = tile.group ? GROUP_COLORS[tile.group] || '#475569' : '#0284C7';
  const baseRent = tile.baseRent ?? 0;
  const houseCost = tile.houseCost ?? 50;
  const mortgageValue = tile.price ? Math.floor(tile.price / 2) : 0;

  return (
    <div className="modal-overlay" onClick={onClose} id="modal-property-card">
      <div
        className="modal-content animate-fade-in"
        style={{ maxWidth: 360, padding: 0, overflow: 'hidden' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Band */}
        <div
          style={{
            background: groupColor,
            padding: '20px 16px',
            position: 'relative',
            textAlign: 'center',
            color: '#FFF',
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              right: 12,
              top: 12,
              background: 'rgba(0,0,0,0.3)',
              border: 'none',
              borderRadius: '50%',
              width: 28,
              height: 28,
              color: '#FFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              opacity: 0.9,
            }}
          >
            MULK HUJJATI
          </div>
          <h3
            style={{
              fontSize: 20,
              fontWeight: 800,
              marginTop: 4,
              fontFamily: 'var(--font-heading)',
            }}
          >
            {tile.name}
          </h3>
          {tile.price && (
            <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.95, marginTop: 2 }}>
              Narxi: {tile.price} so‘m
            </div>
          )}
        </div>

        {/* Content Details */}
        <div style={{ padding: 20 }}>
          {tile.type === 'PROPERTY' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingBottom: 6,
                  borderBottom: '1px solid var(--border-subtle)',
                }}
              >
                <span>Oddiy ijara:</span>
                <span style={{ fontWeight: 700 }}>
                  {calculateRent(baseRent, 0, false, false)} so‘m
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Monopoliya bilan:</span>
                <span style={{ fontWeight: 600 }}>
                  {calculateRent(baseRent, 0, true, false)} so‘m
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>1 ta filial bilan:</span>
                <span style={{ fontWeight: 600 }}>
                  {calculateRent(baseRent, 1, false, false)} so‘m
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>2 ta filial bilan:</span>
                <span style={{ fontWeight: 600 }}>
                  {calculateRent(baseRent, 2, false, false)} so‘m
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>3 ta filial bilan:</span>
                <span style={{ fontWeight: 600 }}>
                  {calculateRent(baseRent, 3, false, false)} so‘m
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>4 ta filial bilan:</span>
                <span style={{ fontWeight: 600 }}>
                  {calculateRent(baseRent, 4, false, false)} so‘m
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  color: '#F59E0B',
                  fontWeight: 700,
                }}
              >
                <span>Bosh ofis (Mehmonxona):</span>
                <span>{calculateRent(baseRent, 5, false, false)} so‘m</span>
              </div>

              <div
                style={{
                  marginTop: 12,
                  paddingTop: 12,
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  fontSize: 12,
                  color: 'var(--text-muted)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Har bir filial narxi:</span>
                  <span style={{ color: 'var(--text-main)' }}>{houseCost} so‘m</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Garov qiymati:</span>
                  <span style={{ color: 'var(--text-main)' }}>{mortgageValue} so‘m</span>
                </div>
                {tileState && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      color: tileState.mortgaged ? '#EF4444' : '#10B981',
                    }}
                  >
                    <span>Holati:</span>
                    <span>{tileState.mortgaged ? 'Garovda' : `${tileState.houses} ta bino`}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '16px 0',
                color: 'var(--text-muted)',
                fontSize: 14,
              }}
            >
              Maxsus maydon: <strong style={{ color: 'var(--text-main)' }}>{tile.name}</strong>
            </div>
          )}

          {/* Owner Info */}
          {owner && (
            <div
              style={{
                marginTop: 16,
                padding: '10px 14px',
                borderRadius: 10,
                background: 'rgba(255, 255, 255, 0.04)',
                border: `1px solid ${owner.color}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Egasi:</span>
              <span style={{ fontWeight: 700, color: owner.color }}>{owner.name}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
