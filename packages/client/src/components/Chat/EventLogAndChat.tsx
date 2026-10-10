import React, { useState, useRef, useEffect } from 'react';
import type { GameEvent } from '@uzmonopoly/shared';
import { Send, MessageSquare, ScrollText } from 'lucide-react';
import type { Translations, Locale } from '../../i18n.js';

interface EventLogAndChatProps {
  events: GameEvent[];
  chatMessages: { id: string; sender: string; text: string; color: string; time: string }[];
  onSendChat: (text: string) => void;
  locale: Locale;
  t: Translations;
}

export const EventLogAndChat: React.FC<EventLogAndChatProps> = ({
  events,
  chatMessages,
  onSendChat,
  locale,
  t,
}) => {
  const [activeTab, setActiveTab] = useState<'events' | 'chat'>('events');
  const [inputText, setInputText] = useState('');
  const logEndRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === 'events') {
      logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [events.length, chatMessages.length, activeTab]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    onSendChat(inputText.trim());
    setInputText('');
  };

  const quickReplies = ["Salom!", "Omad!", "Zo‘r o‘yin!", "Dubl bo‘ldi! 🎲", "Auksionga qo‘y!"];

  return (
    <div
      className="glass-panel"
      style={{
        width: '100%',
        height: 380,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Tab Header */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(0, 0, 0, 0.2)',
        }}
      >
        <button
          onClick={() => setActiveTab('events')}
          style={{
            flex: 1,
            padding: '12px 16px',
            background: activeTab === 'events' ? 'rgba(255,255,255,0.06)' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'events' ? '2px solid #F59E0B' : '2px solid transparent',
            color: activeTab === 'events' ? '#F8FAFC' : 'var(--text-muted)',
            fontSize: 13,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            cursor: 'pointer',
          }}
        >
          <ScrollText size={15} />
          <span>{t.eventsTab}</span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          style={{
            flex: 1,
            padding: '12px 16px',
            background: activeTab === 'chat' ? 'rgba(255,255,255,0.06)' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'chat' ? '2px solid #00A3C4' : '2px solid transparent',
            color: activeTab === 'chat' ? '#F8FAFC' : 'var(--text-muted)',
            fontSize: 13,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            cursor: 'pointer',
          }}
        >
          <MessageSquare size={15} />
          <span>{t.chatTab}</span>
          {chatMessages.length > 0 && (
            <span
              style={{
                fontSize: 10,
                background: '#00A3C4',
                color: '#FFF',
                borderRadius: '50%',
                padding: '1px 6px',
              }}
            >
              {chatMessages.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Event Log */}
      {activeTab === 'events' && (
        <div
          style={{
            flex: 1,
            padding: 14,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            fontSize: 12.5,
          }}
        >
          {events.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-dim)', marginTop: 40 }}>
              Voqealar jurnali bo‘sh
            </div>
          ) : (
            events.map((ev) => {
              const text = ev.message[locale] || ev.message['uz'] || ev.message['en'] || '';
              return (
                <div
                  key={ev.seq}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 8,
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderLeft: '3px solid #00A3C4',
                    color: '#E2E8F0',
                    lineHeight: 1.4,
                  }}
                >
                  <span style={{ fontSize: 10, color: 'var(--text-dim)', marginRight: 6 }}>
                    #{ev.seq}
                  </span>
                  {text}
                </div>
              );
            })
          )}
          <div ref={logEndRef} />
        </div>
      )}

      {/* Tab 2: Live Chat */}
      {activeTab === 'chat' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Chat Messages */}
          <div
            style={{
              flex: 1,
              padding: 14,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              fontSize: 13,
            }}
          >
            {chatMessages.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-dim)', marginTop: 40 }}>
                Xabarlar yo‘q. Birinchi bo‘lib yozing!
              </div>
            ) : (
              chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 8,
                    background: 'rgba(255, 255, 255, 0.04)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <strong style={{ color: msg.color, fontSize: 12 }}>{msg.sender}</strong>
                    <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>{msg.time}</span>
                  </div>
                  <div style={{ color: '#F1F5F9' }}>{msg.text}</div>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Replies */}
          <div
            style={{
              display: 'flex',
              gap: 6,
              padding: '6px 10px',
              overflowX: 'auto',
              background: 'rgba(0,0,0,0.15)',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            {quickReplies.map((qr) => (
              <button
                key={qr}
                onClick={() => onSendChat(qr)}
                style={{
                  padding: '3px 8px',
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-muted)',
                  fontSize: 11,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                }}
              >
                {qr}
              </button>
            ))}
          </div>

          {/* Chat Input */}
          <form
            onSubmit={handleSend}
            style={{
              display: 'flex',
              gap: 8,
              padding: '10px',
              borderTop: '1px solid var(--border-subtle)',
              background: 'rgba(0, 0, 0, 0.25)',
            }}
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t.chatPlaceholder}
              style={{
                flex: 1,
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 8,
                padding: '8px 12px',
                color: '#FFF',
                fontSize: 13,
                outline: 'none',
              }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: '8px 12px' }}
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
