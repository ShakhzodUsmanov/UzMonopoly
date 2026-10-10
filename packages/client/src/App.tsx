import React, { useState, useEffect } from 'react';
import type { GameState, TileDefinition, GameEvent, TokenId } from '@uzmonopoly/shared';
import { DICTIONARY, type Locale } from './i18n.js';
import { networkService, type LobbyInfo } from './services/network.js';
import { HomeView } from './components/Home/HomeView.js';
import { RoomLobbyView } from './components/Lobby/RoomLobbyView.js';
import { GameBoard } from './components/Board/GameBoard.js';
import { GameConsole } from './components/Console/GameConsole.js';
import { PlayerList } from './components/Players/PlayerList.js';
import { EventLogAndChat } from './components/Chat/EventLogAndChat.js';
import { PropertyCardModal } from './components/Board/PropertyCardModal.js';
import confetti from 'canvas-confetti';
import { LogOut } from 'lucide-react';

export const App: React.FC = () => {
  const [locale, setLocale] = useState<Locale>('uz');
  const t = DICTIONARY[locale];

  const [screen, setScreen] = useState<'home' | 'lobby' | 'game'>('home');
  const [lobbyInfo, setLobbyInfo] = useState<LobbyInfo | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [chatMessages, setChatMessages] = useState<
    { id: string; sender: string; text: string; color: string; time: string }[]
  >([]);
  const [selectedTile, setSelectedTile] = useState<TileDefinition | null>(null);
  const [myPlayerId] = useState<string>('player-me');
  const [turnTimeLeft, setTurnTimeLeft] = useState<number>(60);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Hook up network listeners
  useEffect(() => {
    networkService.onLobbyUpdate = (lobby) => {
      setLobbyInfo(lobby);
      setScreen('lobby');
    };

    networkService.onStateUpdate = (state) => {
      setGameState(state);
      setScreen('game');
      setTurnTimeLeft(state.phase === 'AUCTION' ? 20 : 60);

      // Trigger confetti on Victory
      if (state.phase === 'GAME_OVER') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    };

    networkService.onGameEvent = (ev) => {
      setEvents((prev) => [...prev, ev]);
    };

    networkService.onChatMessage = (msg) => {
      setChatMessages((prev) => [...prev, msg]);
    };

    networkService.onError = (err) => {
      setErrorMessage(err.message);
      setTimeout(() => setErrorMessage(null), 4000);
    };

    return () => {
      networkService.leave();
    };
  }, []);

  // Turn timer countdown effect
  useEffect(() => {
    if (screen !== 'game' || !gameState || gameState.phase === 'GAME_OVER') return;

    const interval = setInterval(() => {
      setTurnTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [screen, gameState?.phase, gameState?.seq]);

  // Actions
  const handleCreateRoom = async (playerName: string, maxPlayers: number, isPrivate: boolean) => {
    try {
      await networkService.createOnlineRoom(playerName, maxPlayers, isPrivate);
    } catch {
      // Fallback to solo game if local server is not connected
      networkService.startSoloGame(playerName);
    }
  };

  const handleJoinRoom = async (roomCode: string, playerName: string) => {
    try {
      await networkService.joinOnlineRoom(roomCode, playerName);
    } catch (err: any) {
      setErrorMessage(err.message || 'Xonaga ulanishda xatolik yuz berdi');
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  const handleStartSolo = (playerName: string) => {
    networkService.startSoloGame(playerName);
  };

  const handleReadyToggle = () => {
    networkService.sendAction({ type: 'ready' });
  };

  const handleSetToken = (token: TokenId, color: string) => {
    networkService.sendAction({ type: 'setToken', token, color });
  };

  const handleKickPlayer = (playerId: string) => {
    networkService.sendAction({ type: 'kickPlayer', playerId });
  };

  const handleStartGame = () => {
    networkService.sendAction({ type: 'startGame' });
  };

  const handleLeave = () => {
    networkService.leave();
    setScreen('home');
    setGameState(null);
    setLobbyInfo(null);
    setEvents([]);
  };

  const handleSendChat = (text: string) => {
    const sender = gameState?.players.find((p) => p.id === myPlayerId)?.name || 'Men';
    const color = gameState?.players.find((p) => p.id === myPlayerId)?.color || '#3B82F6';
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newMsg = {
      id: Math.random().toString(),
      sender,
      text,
      color,
      time: timeStr,
    };

    setChatMessages((prev) => [...prev, newMsg]);
    networkService.sendAction({ type: 'chat', text });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Toast Notification */}
      {errorMessage && (
        <div
          className="animate-fade-in"
          style={{
            position: 'fixed',
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#EF4444',
            color: '#FFF',
            padding: '10px 20px',
            borderRadius: 12,
            boxShadow: '0 8px 24px rgba(239, 68, 68, 0.4)',
            zIndex: 9999,
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          ⚠️ {errorMessage}
        </div>
      )}

      {/* Screen 1: Home View */}
      {screen === 'home' && (
        <HomeView
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          onStartSolo={handleStartSolo}
          locale={locale}
          onSelectLocale={setLocale}
          t={t}
        />
      )}

      {/* Screen 2: Room Lobby View */}
      {screen === 'lobby' && lobbyInfo && (
        <RoomLobbyView
          lobby={lobbyInfo}
          myPlayerId={myPlayerId}
          onReady={handleReadyToggle}
          onSetToken={handleSetToken}
          onKickPlayer={handleKickPlayer}
          onStartGame={handleStartGame}
          onLeave={handleLeave}
          t={t}
        />
      )}

      {/* Screen 3: Active Game View */}
      {screen === 'game' && gameState && (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          {/* Top Game Navigation Bar */}
          <header
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 20px',
              borderBottom: '1px solid var(--border-subtle)',
              background: 'rgba(11, 17, 32, 0.85)',
              backdropFilter: 'blur(12px)',
              position: 'sticky',
              top: 0,
              zIndex: 100,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span className="heading-gold" style={{ fontSize: 20, fontWeight: 900, letterSpacing: '1px' }}>
                UZMONOPOLY
              </span>
              <span className="badge badge-gold" style={{ fontSize: 10 }}>
                Xona: #{gameState.settings?.roomCode || 'SOLO'}
              </span>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value as Locale)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#FFF',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 8,
                  padding: '6px 10px',
                  fontSize: 12,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="uz" style={{ background: '#0F172A' }}>O‘zbekcha</option>
                <option value="ru" style={{ background: '#0F172A' }}>Русский</option>
                <option value="en" style={{ background: '#0F172A' }}>English</option>
              </select>

              <button
                className="btn btn-outline"
                style={{ padding: '6px 12px', fontSize: 12 }}
                onClick={handleLeave}
                title={t.leaveRoom}
              >
                <LogOut size={14} />
                <span>{t.leaveRoom}</span>
              </button>
            </div>
          </header>

          {/* Main Gameplay Layout: Responsive 3-Panel Desktop / Stacked Mobile */}
          <main
            style={{
              flex: 1,
              display: 'grid',
              gridTemplateColumns: 'minmax(260px, 320px) minmax(400px, 880px) minmax(280px, 340px)',
              gap: 20,
              padding: '20px',
              maxWidth: 1600,
              width: '100%',
              margin: '0 auto',
              alignItems: 'start',
            }}
            className="game-responsive-grid"
          >
            {/* Left Column: Player Cards */}
            <aside style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <PlayerList gameState={gameState} myPlayerId={myPlayerId} t={t} />
            </aside>

            {/* Center Column: 52-tile Board & Interactive Center Console */}
            <section style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <GameBoard
                gameState={gameState}
                selectedTileIndex={selectedTile?.index}
                onTileClick={(tile) => setSelectedTile(tile)}
                centerContent={
                  <GameConsole
                    gameState={gameState}
                    myPlayerId={myPlayerId}
                    onAction={(action) => networkService.sendAction(action)}
                    t={t}
                    turnTimeLeft={turnTimeLeft}
                  />
                }
              />
            </section>

            {/* Right Column: Event Log & Live Chat */}
            <aside style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <EventLogAndChat
                events={events}
                chatMessages={chatMessages}
                onSendChat={handleSendChat}
                locale={locale}
                t={t}
              />
            </aside>
          </main>
        </div>
      )}

      {/* Property Inspection Modal */}
      {selectedTile && (
        <PropertyCardModal
          tile={selectedTile}
          tileState={gameState?.tiles[selectedTile.index]}
          owner={
            gameState?.tiles[selectedTile.index]?.ownerId
              ? gameState.players.find((p) => p.id === gameState.tiles[selectedTile.index]?.ownerId)
              : undefined
          }
          onClose={() => setSelectedTile(null)}
        />
      )}

      {/* Responsive Breakpoints CSS */}
      <style>{`
        @media (max-width: 1024px) {
          .game-responsive-grid {
            grid-template-columns: 1fr !important;
            padding: 10px !important;
            gap: 14px !important;
          }
        }
      `}</style>
    </div>
  );
};
