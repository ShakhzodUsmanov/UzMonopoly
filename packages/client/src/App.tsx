import React, { useState, useEffect } from 'react';
import type { GameState, TileDefinition, GameEvent, TokenId, CardDefinition } from '@uzmonopoly/shared';
import { BOARD_TILES, IMKON_CARDS, XAZINA_CARDS } from '@uzmonopoly/engine';
import { DICTIONARY, type Locale } from './i18n.js';
import { networkService, type LobbyInfo } from './services/network.js';
import { audioService } from './services/audio.js';
import { HomeView } from './components/Home/HomeView.js';
import { RoomLobbyView } from './components/Lobby/RoomLobbyView.js';
import { GameBoard } from './components/Board/GameBoard.js';
import { GameConsole } from './components/Console/GameConsole.js';
import { PlayerList } from './components/Players/PlayerList.js';
import { EventLogAndChat } from './components/Chat/EventLogAndChat.js';
import { PropertyCardModal } from './components/Board/PropertyCardModal.js';
import { BuyDecisionModal } from './components/Modals/BuyDecisionModal.js';
import { AuctionModal } from './components/Modals/AuctionModal.js';
import { TradeModal } from './components/Modals/TradeModal.js';
import { CardDrawnModal } from './components/Modals/CardDrawnModal.js';
import { PropertyManagementModal } from './components/Modals/PropertyManagementModal.js';
import { DebtModal } from './components/Modals/DebtModal.js';
import { GameOverModal } from './components/Modals/GameOverModal.js';
import { LogOut, Volume2, VolumeX, ArrowLeftRight } from 'lucide-react';

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
  const [managedTile, setManagedTile] = useState<TileDefinition | null>(null);
  const [activeCard, setActiveCard] = useState<CardDefinition | null>(null);
  const [isTradeOpen, setIsTradeOpen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(audioService.enabled);
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

      // Auto-open trade modal if someone targets me with a trade
      if (state.pendingTrade && state.pendingTrade.targetId === myPlayerId) {
        setIsTradeOpen(true);
      }
    };

    networkService.onGameEvent = (ev) => {
      setEvents((prev) => [...prev, ev]);

      // Sound design triggers from game events
      if (ev.type === 'MOVE') {
        audioService.playTokenStep();
      } else if (ev.type === 'BUY_PROPERTY' || ev.type === 'BUILD') {
        audioService.playCoin();
      } else if (ev.type === 'GO_TO_JAIL' || ev.type === 'THREE_DOUBLES_TO_JAIL') {
        audioService.playJailSlam();
      } else if (ev.type === 'BANKRUPTCY') {
        audioService.playBankruptcy();
      }

      // Check if event is a card drawn event
      if (ev.type === 'CARD_DRAWN' && ev.data?.cardId) {
        const cardId = ev.data.cardId as number;
        const cardType = ev.data.cardType as 'imkon' | 'xazina';
        const cardList = cardType === 'imkon' ? IMKON_CARDS : XAZINA_CARDS;
        const card = cardList.find((c) => c.id === cardId);
        if (card) {
          setActiveCard(card);
        }
      }
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
  }, [myPlayerId]);

  // Turn timer countdown effect
  useEffect(() => {
    if (screen !== 'game' || !gameState || gameState.phase === 'GAME_OVER') return;

    const interval = setInterval(() => {
      setTurnTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [screen, gameState?.phase, gameState?.seq]);

  // Audio mute toggle
  const handleToggleSound = () => {
    const newState = audioService.toggleMute();
    setSoundEnabled(newState);
  };

  // Actions
  const handleCreateRoom = async (playerName: string, maxPlayers: number, isPrivate: boolean) => {
    try {
      await networkService.createOnlineRoom(playerName, maxPlayers, isPrivate);
    } catch {
      networkService.startSoloGame(playerName);
    }
  };

  const handleJoinRoom = async (roomCode: string, playerName: string) => {
    try {
      await networkService.joinOnlineRoom(roomCode, playerName);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Xonaga ulanishda xatolik yuz berdi';
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  const handleStartSolo = (playerName: string) => {
    networkService.startSoloGame(playerName);
  };

  const handleReadyToggle = () => {
    audioService.playClick();
    networkService.sendAction({ type: 'ready' });
  };

  const handleSetToken = (token: TokenId, color: string) => {
    audioService.playClick();
    networkService.sendAction({ type: 'setToken', token, color });
  };

  const handleKickPlayer = (playerId: string) => {
    audioService.playClick();
    networkService.sendAction({ type: 'kickPlayer', playerId });
  };

  const handleStartGame = () => {
    audioService.playClick();
    networkService.sendAction({ type: 'startGame' });
  };

  const handleLeave = () => {
    audioService.playClick();
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

  // Tile click handling: inspect vs manage
  const handleTileClick = (tile: TileDefinition) => {
    audioService.playClick();
    const state = gameState?.tiles[tile.index];
    if (state?.ownerId === myPlayerId) {
      setManagedTile(tile);
    } else {
      setSelectedTile(tile);
    }
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
              {/* Quick Trade Button */}
              <button
                className="btn btn-outline"
                style={{ padding: '6px 12px', fontSize: 12 }}
                onClick={() => setIsTradeOpen(true)}
                title={t.trade}
              >
                <ArrowLeftRight size={14} color="#F59E0B" />
                <span>{t.trade}</span>
              </button>

              {/* Sound Toggle */}
              <button
                className="btn btn-outline"
                style={{ padding: '6px 10px', fontSize: 12 }}
                onClick={handleToggleSound}
                title={soundEnabled ? 'Ovozni o‘chirish' : 'Ovozni yoqish'}
              >
                {soundEnabled ? <Volume2 size={15} color="#10B981" /> : <VolumeX size={15} color="#94A3B8" />}
              </button>

              {/* Language Selector */}
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

              {/* Leave Room Button */}
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
                selectedTileIndex={selectedTile?.index ?? managedTile?.index}
                onTileClick={handleTileClick}
                centerContent={
                  <GameConsole
                    gameState={gameState}
                    myPlayerId={myPlayerId}
                    onAction={(action) => {
                      if (action.type === 'rollDice') {
                        audioService.playDiceRoll();
                      }
                      networkService.sendAction(action);
                    }}
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

      {/* MODAL 1: Buy Decision Modal */}
      {gameState?.phase === 'BUY_DECISION' && (
        <BuyDecisionModal
          gameState={gameState}
          tile={BOARD_TILES[gameState.players[gameState.turnIndex]?.position ?? 0]!}
          myPlayerId={myPlayerId}
          onAction={(action) => networkService.sendAction(action)}
          locale={locale}
          t={t}
        />
      )}

      {/* MODAL 2: Live Auction Modal */}
      {gameState?.phase === 'AUCTION' && gameState.auction && (
        <AuctionModal
          gameState={gameState}
          myPlayerId={myPlayerId}
          onAction={(action) => networkService.sendAction(action)}
          locale={locale}
          t={t}
          turnTimeLeft={turnTimeLeft}
        />
      )}

      {/* MODAL 3: Trade & Negotiation Modal */}
      {isTradeOpen && gameState && (
        <TradeModal
          gameState={gameState}
          myPlayerId={myPlayerId}
          onAction={(action) => networkService.sendAction(action)}
          onClose={() => setIsTradeOpen(false)}
          locale={locale}
          t={t}
        />
      )}

      {/* MODAL 4: Imkon / Xazina Card Drawn Modal */}
      {activeCard && (
        <CardDrawnModal
          card={activeCard}
          onClose={() => setActiveCard(null)}
          locale={locale}
          t={t}
        />
      )}

      {/* MODAL 5: Property Management (Build / Mortgage / Sell) */}
      {managedTile && gameState && (
        <PropertyManagementModal
          tile={managedTile}
          gameState={gameState}
          myPlayerId={myPlayerId}
          onAction={(action) => networkService.sendAction(action)}
          onClose={() => setManagedTile(null)}
          locale={locale}
          t={t}
        />
      )}

      {/* MODAL 6: Debt Settlement & Liquidation Modal */}
      {gameState?.phase === 'DEBT' && gameState.pendingDebt && (
        <DebtModal
          gameState={gameState}
          myPlayerId={myPlayerId}
          onAction={(action) => networkService.sendAction(action)}
          locale={locale}
          t={t}
        />
      )}

      {/* MODAL 7: Game Over / Victory Celebration Modal */}
      {gameState?.phase === 'GAME_OVER' && (
        <GameOverModal
          gameState={gameState}
          onReturnToLobby={() => {
            handleLeave();
          }}
          onBackHome={() => {
            handleLeave();
          }}
          locale={locale}
          t={t}
        />
      )}

      {/* Property Inspection Modal (when inspecting unowned or other player's property) */}
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
