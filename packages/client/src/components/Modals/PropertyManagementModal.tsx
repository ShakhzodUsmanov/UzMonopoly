import React from 'react';
import type { GameState, TileDefinition, ClientAction } from '@uzmonopoly/shared';
import { COLOR_GROUPS } from '@uzmonopoly/shared';
import {
  calculateMortgageValue,
  calculateUnmortgageCost,
  calculateBuildingSellValue,
  ownsEntireGroup,
  hasAnyMortgagedInGroup,
  BOARD_TILES,
} from '@uzmonopoly/engine';
import type { Translations, Locale } from '../../i18n.js';
import { audioService } from '../../services/audio.js';
import { X, Building2, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface PropertyManagementModalProps {
  tile: TileDefinition;
  gameState: GameState;
  myPlayerId: string;
  onAction: (action: ClientAction) => void;
  onClose: () => void;
  locale: Locale;
  t: Translations;
}

const GROUP_COLORS = Object.fromEntries(COLOR_GROUPS.map((g) => [g.id, g.color]));

export const PropertyManagementModal: React.FC<PropertyManagementModalProps> = ({
  tile,
  gameState,
  myPlayerId,
  onAction,
  onClose,
  locale,
  t,
}) => {
  const tileState = gameState.tiles[tile.index] || { houses: 0, mortgaged: false };
  const myPlayer = gameState.players.find((p) => p.id === myPlayerId);
  const isOwner = tileState.ownerId === myPlayerId;
  const myCash = myPlayer?.cash ?? 0;

  const groupColor = tile.group ? GROUP_COLORS[tile.group] || '#475569' : '#0284C7';
  const price = tile.price ?? 0;
  const houseCost = tile.houseCost ?? 50;
  const mortgageVal = calculateMortgageValue(price);
  const unmortgageCost = calculateUnmortgageCost(price);
  const sellBuildingVal = calculateBuildingSellValue(houseCost);

  // Group status
  const groupTiles = tile.group ? BOARD_TILES.filter((t) => t.group === tile.group) : [];
  const groupHouseCounts = groupTiles.map((t) => gameState.tiles[t.index]?.houses ?? 0);
  const minHouses = groupHouseCounts.length > 0 ? Math.min(...groupHouseCounts) : 0;
  const maxHouses = groupHouseCounts.length > 0 ? Math.max(...groupHouseCounts) : 0;
  const hasMonopoly = tile.group ? ownsEntireGroup(gameState, myPlayerId, tile.group) : false;
  const hasGroupMortgaged = tile.group ? hasAnyMortgagedInGroup(gameState, tile.group) : false;
  const groupHasBuildings = groupHouseCounts.some((h) => h > 0);

  // Validation: Build
  let buildDisabledReason: string | null = null;
  if (!isOwner) buildDisabledReason = t.reasons.reasonNotOwner;
  else if (!hasMonopoly) buildDisabledReason = t.reasons.reasonNeedMonopoly;
  else if (hasGroupMortgaged) buildDisabledReason = t.reasons.reasonGroupMortgaged;
  else if (tileState.houses >= 5) buildDisabledReason = t.reasons.reasonMaxBuildings;
  else if (tileState.houses > minHouses) buildDisabledReason = t.reasons.reasonEvenBuild;
  else if (myCash < houseCost) buildDisabledReason = t.reasons.reasonInsufficientCash;
  const canBuild = buildDisabledReason === null;

  // Validation: Sell Building
  let sellDisabledReason: string | null = null;
  if (!isOwner) sellDisabledReason = t.reasons.reasonNotOwner;
  else if (tileState.houses <= 0) sellDisabledReason = t.reasons.reasonNoBuildings;
  else if (tileState.houses < maxHouses) sellDisabledReason = t.reasons.reasonEvenSell;
  const canSellBuilding = sellDisabledReason === null;

  // Validation: Mortgage
  let mortgageDisabledReason: string | null = null;
  if (!isOwner) mortgageDisabledReason = t.reasons.reasonNotOwner;
  else if (tileState.mortgaged) mortgageDisabledReason = t.reasons.reasonAlreadyMortgaged;
  else if (groupHasBuildings) mortgageDisabledReason = t.reasons.reasonBuildingsExist;
  const canMortgage = mortgageDisabledReason === null;

  // Validation: Unmortgage
  let unmortgageDisabledReason: string | null = null;
  if (!isOwner) unmortgageDisabledReason = t.reasons.reasonNotOwner;
  else if (!tileState.mortgaged) unmortgageDisabledReason = t.reasons.reasonNotMortgaged;
  else if (myCash < unmortgageCost) unmortgageDisabledReason = t.reasons.reasonInsufficientCash;
  const canUnmortgage = unmortgageDisabledReason === null;

  const handleBuild = () => {
    if (!canBuild) return;
    audioService.playCoin();
    onAction({ type: 'build', tileId: tile.index });
  };

  const handleSellBuilding = () => {
    if (!canSellBuilding) return;
    audioService.playClick();
    onAction({ type: 'sellBuilding', tileId: tile.index });
  };

  const handleMortgage = () => {
    if (!canMortgage) return;
    audioService.playCoin();
    onAction({ type: 'mortgage', tileId: tile.index });
  };

  const handleUnmortgage = () => {
    if (!canUnmortgage) return;
    audioService.playCoin();
    onAction({ type: 'unmortgage', tileId: tile.index });
  };

  return (
    <div className="modal-overlay" id="modal-property-management" onClick={onClose}>
      <div
        className="modal-content animate-fade-in"
        style={{
          maxWidth: 440,
          padding: 0,
          overflow: 'hidden',
          background: 'linear-gradient(180deg, #131E35 0%, #0B1120 100%)',
          border: '1px solid var(--border-gold)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            background: `linear-gradient(135deg, ${groupColor} 0%, rgba(15, 23, 42, 0.95) 100%)`,
            padding: '20px 24px',
            color: '#FFF',
            position: 'relative',
            borderBottom: '2px solid rgba(255,255,255,0.1)',
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              right: 14,
              top: 14,
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
              fontWeight: 800,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              opacity: 0.9,
            }}
          >
            {t.propertyModal.header}
          </div>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 900,
              fontFamily: 'var(--font-heading)',
              marginTop: 2,
            }}
          >
            {tile.nameI18n?.[locale] || tile.name}
          </h2>

          {/* Current building status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(0,0,0,0.35)',
                padding: '4px 12px',
                borderRadius: 16,
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              <Building2 size={14} color="#F59E0B" />
              <span>
                {tileState.houses === 5
                  ? `🏨 ${t.propertyCard.hotel}`
                  : tileState.houses > 0
                    ? `🏠 ${tileState.houses} ${t.propertyCard.house}`
                    : t.propertyModal.noBuildings}
              </span>
            </div>

            {tileState.mortgaged && (
              <span className="badge badge-gold" style={{ background: '#EF4444', color: '#FFF' }}>
                ⚠️ {t.propertyModal.mortgagedBadge}
              </span>
            )}
          </div>
        </div>

        {/* Action controls */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Section 1: Construction (Build / Sell House) */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 12,
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 800, color: '#F59E0B' }}>
              🏗️ {t.propertyModal.construction} ({houseCost} so‘m / {t.propertyCard.house})
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {/* Build Button */}
              <div>
                <button
                  className="btn btn-gold"
                  style={{
                    width: '100%',
                    padding: '10px 8px',
                    fontSize: 13,
                    opacity: canBuild ? 1 : 0.45,
                    cursor: canBuild ? 'pointer' : 'not-allowed',
                  }}
                  disabled={!canBuild}
                  onClick={handleBuild}
                  id="btn-build-house"
                >
                  <ArrowUpRight size={15} />
                  <span>{t.propertyModal.buildBranch}</span>
                </button>
                {buildDisabledReason && (
                  <div
                    style={{
                      fontSize: 10,
                      color: 'var(--text-muted)',
                      marginTop: 4,
                      lineHeight: 1.2,
                    }}
                  >
                    ⚠️ {buildDisabledReason}
                  </div>
                )}
              </div>

              {/* Sell Building Button */}
              <div>
                <button
                  className="btn btn-outline"
                  style={{
                    width: '100%',
                    padding: '10px 8px',
                    fontSize: 13,
                    opacity: canSellBuilding ? 1 : 0.45,
                    cursor: canSellBuilding ? 'pointer' : 'not-allowed',
                  }}
                  disabled={!canSellBuilding}
                  onClick={handleSellBuilding}
                  id="btn-sell-building"
                >
                  <ArrowDownRight size={15} />
                  <span>+{sellBuildingVal} so‘m</span>
                </button>
                {sellDisabledReason && (
                  <div
                    style={{
                      fontSize: 10,
                      color: 'var(--text-muted)',
                      marginTop: 4,
                      lineHeight: 1.2,
                    }}
                  >
                    ⚠️ {sellDisabledReason}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Mortgage / Unmortgage */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 12,
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 800, color: '#10B981' }}>
              🏦 {t.propertyModal.mortgageSection}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {/* Mortgage Button */}
              <div>
                <button
                  className="btn btn-outline"
                  style={{
                    width: '100%',
                    padding: '10px 8px',
                    fontSize: 13,
                    borderColor: 'rgba(239, 68, 68, 0.4)',
                    color: '#F87171',
                    opacity: canMortgage ? 1 : 0.45,
                    cursor: canMortgage ? 'pointer' : 'not-allowed',
                  }}
                  disabled={!canMortgage}
                  onClick={handleMortgage}
                  id="btn-mortgage-property"
                >
                  <span>
                    {t.propertyModal.mortgage} (+{mortgageVal})
                  </span>
                </button>
                {mortgageDisabledReason && (
                  <div
                    style={{
                      fontSize: 10,
                      color: 'var(--text-muted)',
                      marginTop: 4,
                      lineHeight: 1.2,
                    }}
                  >
                    ⚠️ {mortgageDisabledReason}
                  </div>
                )}
              </div>

              {/* Unmortgage Button */}
              <div>
                <button
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '10px 8px',
                    fontSize: 13,
                    opacity: canUnmortgage ? 1 : 0.45,
                    cursor: canUnmortgage ? 'pointer' : 'not-allowed',
                  }}
                  disabled={!canUnmortgage}
                  onClick={handleUnmortgage}
                  id="btn-unmortgage-property"
                >
                  <span>
                    {t.propertyModal.unmortgage} (-{unmortgageCost})
                  </span>
                </button>
                {unmortgageDisabledReason && (
                  <div
                    style={{
                      fontSize: 10,
                      color: 'var(--text-muted)',
                      marginTop: 4,
                      lineHeight: 1.2,
                    }}
                  >
                    ⚠️ {unmortgageDisabledReason}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
