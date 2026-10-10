import React from 'react';
import type { CardDefinition } from '@uzmonopoly/shared';
import type { Translations, Locale } from '../../i18n.js';
import { audioService } from '../../services/audio.js';
import { Sparkles, Coins, Navigation, ArrowRight } from 'lucide-react';

interface CardDrawnModalProps {
  card: CardDefinition;
  onClose: () => void;
  locale: Locale;
  t: Translations;
}

export const CardDrawnModal: React.FC<CardDrawnModalProps> = ({
  card,
  onClose,
  locale,
  t,
}) => {
  const isImkon = card.type === 'imkon';
  const themeColor = isImkon ? '#F59E0B' : '#10B981';
  const typeTitle = isImkon ? t.cardModal.imkonTitle : t.cardModal.xazinaTitle;

  const handleDismiss = () => {
    audioService.playClick();
    onClose();
  };

  return (
    <div className="modal-overlay" id="modal-card-drawn" onClick={handleDismiss}>
      <div
        className="modal-content animate-fade-in"
        style={{
          maxWidth: 400,
          padding: 0,
          overflow: 'hidden',
          background: 'linear-gradient(180deg, #131E35 0%, #0B1120 100%)',
          border: `2px solid ${themeColor}`,
          boxShadow: `0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px ${isImkon ? 'rgba(245, 158, 11, 0.25)' : 'rgba(16, 185, 129, 0.25)'}`,
          transform: 'scale(1)',
          transition: 'transform 0.2s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ornamental Header */}
        <div
          style={{
            background: `linear-gradient(135deg, ${themeColor} 0%, rgba(15, 23, 42, 0.95) 100%)`,
            padding: '28px 24px 20px',
            textAlign: 'center',
            color: '#FFFFFF',
            position: 'relative',
          }}
        >
          {/* Decorative Uzbek Girih Pattern Overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 0.12,
              backgroundImage: `radial-gradient(circle at 50% 50%, #FFF 10%, transparent 10%)`,
              backgroundSize: '16px 16px',
            }}
          />

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(0,0,0,0.4)',
              padding: '4px 16px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              color: isImkon ? '#FDE68A' : '#A7F3D0',
              marginBottom: 10,
              position: 'relative',
            }}
          >
            <Sparkles size={14} />
            <span>{typeTitle}</span>
          </div>

          <h2
            style={{
              fontSize: 22,
              fontWeight: 900,
              fontFamily: 'var(--font-heading)',
              textShadow: '0 2px 6px rgba(0,0,0,0.6)',
              margin: 0,
              position: 'relative',
            }}
          >
            {card.title[locale] || card.title.uz}
          </h2>
        </div>

        {/* Card Body */}
        <div style={{ padding: '24px 24px 20px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Description Text */}
          <div
            style={{
              fontSize: 15,
              lineHeight: 1.6,
              textAlign: 'center',
              color: '#F1F5F9',
              background: 'rgba(255,255,255,0.03)',
              padding: '16px 20px',
              borderRadius: 12,
              border: '1px solid var(--border-subtle)',
            }}
          >
            {card.description[locale] || card.description.uz}
          </div>

          {/* Action indicator tag */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            {card.amount ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 14px',
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 800,
                  background: card.amount > 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: card.amount > 0 ? '#10B981' : '#EF4444',
                  border: `1px solid ${card.amount > 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                }}
              >
                <Coins size={14} />
                <span>
                  {card.amount > 0 ? `+${card.amount.toLocaleString()}` : card.amount.toLocaleString()} so‘m
                </span>
              </div>
            ) : card.targetTileIndex !== undefined ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 14px',
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 700,
                  background: 'rgba(59, 130, 246, 0.15)',
                  color: '#60A5FA',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                }}
              >
                <Navigation size={14} />
                <span>Katakka harakat: #{card.targetTileIndex}</span>
              </div>
            ) : null}
          </div>

          {/* Dismiss button */}
          <button
            className={isImkon ? 'btn btn-gold' : 'btn btn-primary'}
            style={{
              width: '100%',
              padding: '12px 20px',
              fontSize: 14,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
            onClick={handleDismiss}
            id="btn-dismiss-card"
          >
            <span>{t.cardModal.understand}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
