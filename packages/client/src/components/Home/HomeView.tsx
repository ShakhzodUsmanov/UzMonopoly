import React, { useState } from 'react';
import type { Translations, Locale } from '../../i18n.js';
import { PlusCircle, LogIn, Bot, Globe, Shield, Users, Zap } from 'lucide-react';

interface HomeViewProps {
  onCreateRoom: (playerName: string, maxPlayers: number, isPrivate: boolean, mode: 'full' | 'short') => void;
  onJoinRoom: (roomCode: string, playerName: string) => void;
  onStartSolo: (playerName: string) => void;
  locale: Locale;
  onSelectLocale: (locale: Locale) => void;
  t: Translations;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onCreateRoom,
  onJoinRoom,
  onStartSolo,
  locale,
  onSelectLocale,
  t,
}) => {
  const [playerName, setPlayerName] = useState(
    localStorage.getItem('uzmonopoly_nickname') || 'Alisher',
  );
  const [roomCode, setRoomCode] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [isPrivate, setIsPrivate] = useState(false);
  const [gameMode, setGameMode] = useState<'full' | 'short'>('full');
  const [mode, setMode] = useState<'create' | 'join' | null>(null);

  const saveNickname = (name: string) => {
    setPlayerName(name);
    localStorage.setItem('uzmonopoly_nickname', name);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;
    saveNickname(playerName);
    onCreateRoom(playerName.trim(), maxPlayers, isPrivate, gameMode);
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || !roomCode.trim()) return;
    saveNickname(playerName);
    onJoinRoom(roomCode.trim().toUpperCase(), playerName.trim());
  };

  const handleSoloClick = () => {
    if (!playerName.trim()) return;
    saveNickname(playerName);
    onStartSolo(playerName.trim());
  };

  return (
    <div
      style={{
        maxWidth: 880,
        width: '100%',
        margin: '0 auto',
        padding: '30px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 28,
      }}
    >
      {/* Top Bar with Language Selector */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        {(['uz', 'ru', 'en'] as Locale[]).map((loc) => (
          <button
            key={loc}
            onClick={() => onSelectLocale(loc)}
            className={`btn ${locale === loc ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '6px 14px', fontSize: 12, textTransform: 'uppercase' }}
          >
            <Globe size={13} />
            <span>{loc}</span>
          </button>
        ))}
      </div>

      {/* Hero Branding */}
      <div
        className="glass-panel"
        style={{
          padding: '40px 32px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          background: 'radial-gradient(circle at 50% 0%, rgba(0, 163, 196, 0.2), transparent 70%), rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
        }}
      >
        <div className="badge badge-gold" style={{ marginBottom: 14 }}>
          🇺🇿 O‘ZBEKISTON MILLIY BIZNES O‘YINI
        </div>

        <h1
          className="heading-gold"
          style={{
            fontSize: 'clamp(36px, 6vw, 56px)',
            lineHeight: 1.1,
            marginBottom: 12,
          }}
        >
          UZMONOPOLY
        </h1>

        <p
          style={{
            fontSize: 'clamp(14px, 2.5vw, 17px)',
            color: 'var(--text-muted)',
            maxWidth: 580,
            margin: '0 auto 28px',
          }}
        >
          {t.tagline}
        </p>

        {/* Nickname Input */}
        <div style={{ maxWidth: 360, margin: '0 auto 24px' }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textAlign: 'left' }}>
            {t.enterNickname}
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => saveNickname(e.target.value)}
            placeholder="Alisher"
            id="input-player-name"
            style={{
              width: '100%',
              padding: '14px 18px',
              borderRadius: 12,
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1.5px solid var(--border-highlight)',
              color: '#FFF',
              fontSize: 16,
              fontWeight: 600,
              outline: 'none',
              textAlign: 'center',
            }}
          />
        </div>

        {/* Main CTA Buttons */}
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            className="btn btn-gold"
            onClick={() => setMode(mode === 'create' ? null : 'create')}
            id="btn-open-create-room"
            style={{ padding: '14px 26px', fontSize: 15 }}
          >
            <PlusCircle size={18} />
            <span>{t.createRoom}</span>
          </button>

          <button
            className="btn btn-primary"
            onClick={() => setMode(mode === 'join' ? null : 'join')}
            id="btn-open-join-room"
            style={{ padding: '14px 26px', fontSize: 15 }}
          >
            <LogIn size={18} />
            <span>{t.joinRoom}</span>
          </button>

          <button
            className="btn btn-outline"
            onClick={handleSoloClick}
            id="btn-start-solo-practice"
            style={{ padding: '14px 24px', fontSize: 15 }}
          >
            <Bot size={18} color="#8B5CF6" />
            <span>{t.soloPractice}</span>
          </button>
        </div>
      </div>

      {/* Modal / Form Panel: Create Room */}
      {mode === 'create' && (
        <form onSubmit={handleCreateSubmit} className="glass-panel animate-fade-in" style={{ padding: 24, maxWidth: 500, margin: '0 auto', width: '100%' }}>
          <h3 className="heading-gold" style={{ fontSize: 20, marginBottom: 16 }}>{t.createRoom}</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
                {t.maxPlayers} (2 — 6)
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[2, 3, 4, 5, 6].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setMaxPlayers(num)}
                    className={`btn ${maxPlayers === num ? 'btn-primary' : 'btn-outline'}`}
                    style={{ flex: 1, padding: 10 }}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
                {t.mode}
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setGameMode('full')}
                  className={`btn ${gameMode === 'full' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ flex: 1, padding: 10, fontSize: 13 }}
                >
                  {t.modeFull}
                </button>
                <button
                  type="button"
                  onClick={() => setGameMode('short')}
                  className={`btn ${gameMode === 'short' ? 'btn-gold' : 'btn-outline'}`}
                  style={{ flex: 1, padding: 10, fontSize: 13 }}
                >
                  ⚡ {t.modeShort}
                </button>
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginTop: 4 }}>
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                style={{ width: 18, height: 18 }}
              />
              <span style={{ fontSize: 13 }}>{t.privateRoom}</span>
            </label>

            <button type="submit" className="btn btn-gold" id="btn-submit-create-room" style={{ padding: 14, marginTop: 8 }}>
              {t.createRoom}
            </button>
          </div>
        </form>
      )}

      {/* Modal / Form Panel: Join Room */}
      {mode === 'join' && (
        <form onSubmit={handleJoinSubmit} className="glass-panel animate-fade-in" style={{ padding: 24, maxWidth: 500, margin: '0 auto', width: '100%' }}>
          <h3 className="heading-blue" style={{ fontSize: 20, marginBottom: 16 }}>{t.joinRoom}</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
                {t.enterRoomCode}
              </label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="masalan: E782K"
                maxLength={5}
                id="input-room-code"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 10,
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1.5px solid var(--border-highlight)',
                  color: '#FFF',
                  fontSize: 18,
                  fontWeight: 700,
                  letterSpacing: '3px',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                }}
              />
            </div>

            <button type="submit" className="btn btn-primary" id="btn-submit-join-room" style={{ padding: 14, marginTop: 8 }}>
              {t.joinRoom}
            </button>
          </div>
        </form>
      )}

      {/* Highlights / Features Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <div className="glass-panel" style={{ padding: 20 }}>
          <Zap size={22} color="#F59E0B" style={{ marginBottom: 10 }} />
          <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>52 Katakli Katta Maydon</h4>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Toshkent, Samarqand, Buxoro, Xiva va yirik milliy brendlar: Uzum, Korzinka, Safia, Damas.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: 20 }}>
          <Users size={22} color="#00A3C4" style={{ marginBottom: 10 }} />
          <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>2 — 6 O‘yinchi</h4>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Do‘stlar bilan birgalikda onlayn o‘ynang yoki aqlli AI botlarga qarshi sinovdan o‘ting.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: 20 }}>
          <Shield size={22} color="#10B981" style={{ marginBottom: 10 }} />
          <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Avtomatik Tiklanish</h4>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Tarmoq uzilsa ham 60 soniya ichida o‘yinga qayta ulanish kafolatlangan.
          </p>
        </div>
      </div>
    </div>
  );
};
