import React, { useState, useRef, useEffect } from 'react';

export default function ChatPanel({ messages, activeTab, setActiveTab, isOpen, sendMessage, clanId, username }) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const currentMessages = messages[activeTab] || [];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current && isOpen) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentMessages.length, isOpen]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const success = await sendMessage(inputText);
    if (success) {
      setInputText('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'general', label: '🌐 General', enabled: true },
    { id: 'clan', label: '🛡️ Clan', enabled: !!clanId },
    { id: 'friends', label: '👥 Friends', enabled: false }
  ];

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: '600px',
      height: '350px',
      background: 'linear-gradient(to top, #0a1015, #111920)',
      border: '1px solid rgba(102, 252, 241, 0.3)',
      borderBottom: 'none',
      borderRadius: '12px 12px 0 0',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 999,
      boxShadow: '0 -4px 20px rgba(0,0,0,0.6)'
    }}>
      {/* Tab Bar */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid rgba(102, 252, 241, 0.2)',
        padding: '0 8px',
        flexShrink: 0
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => tab.enabled && setActiveTab(tab.id)}
            style={{
              padding: '10px 16px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #66FCF1' : '2px solid transparent',
              color: !tab.enabled ? '#555' : (activeTab === tab.id ? '#66FCF1' : '#8899aa'),
              cursor: tab.enabled ? 'pointer' : 'not-allowed',
              fontSize: '13px',
              fontWeight: activeTab === tab.id ? 600 : 400,
              transition: 'all 0.2s',
              opacity: tab.enabled ? 1 : 0.5
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Messages Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        {activeTab === 'friends' ? (
          <div style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            height: '100%', color: '#555', fontSize: '14px' 
          }}>
            👥 Friends chat coming soon!
          </div>
        ) : currentMessages.length === 0 ? (
          <div style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            height: '100%', color: '#555', fontSize: '14px' 
          }}>
            No messages yet. Say something!
          </div>
        ) : (
          currentMessages.map((msg, i) => {
            const isOwn = msg.username === username;
            return (
              <div key={msg.id || i} style={{
                display: 'flex',
                gap: '6px',
                alignItems: 'baseline',
                padding: '2px 0'
              }}>
                <span style={{ 
                  color: '#555', 
                  fontSize: '11px', 
                  flexShrink: 0,
                  minWidth: '40px'
                }}>
                  {formatTime(msg.created_at)}
                </span>
                <span style={{ 
                  color: isOwn ? '#66FCF1' : '#E8A87C', 
                  fontWeight: 600, 
                  fontSize: '13px',
                  flexShrink: 0
                }}>
                  {isOwn ? 'You' : msg.username}:
                </span>
                <span style={{ 
                  color: '#d0d0d0', 
                  fontSize: '13px',
                  wordBreak: 'break-word'
                }}>
                  {msg.message}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {activeTab !== 'friends' && (
        <div style={{
          display: 'flex',
          gap: '8px',
          padding: '8px 12px',
          borderTop: '1px solid rgba(102, 252, 241, 0.15)',
          flexShrink: 0
        }}>
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${activeTab === 'clan' ? 'clan' : 'everyone'}...`}
            maxLength={200}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(102, 252, 241, 0.2)',
              color: '#fff',
              fontSize: '13px',
              outline: 'none'
            }}
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              background: inputText.trim() ? 'rgba(102, 252, 241, 0.2)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${inputText.trim() ? 'rgba(102, 252, 241, 0.4)' : 'rgba(255,255,255,0.1)'}`,
              color: inputText.trim() ? '#66FCF1' : '#555',
              cursor: inputText.trim() ? 'pointer' : 'not-allowed',
              fontSize: '13px',
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
}
