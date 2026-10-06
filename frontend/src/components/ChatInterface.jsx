import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Bot, User, Trash2, Wrench, Calculator, Globe, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ChatInterface = ({ apiKey, onChatStart, openAuthModal }) => {
  const { authFetch, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: 'model',
      content: 'Hello! I am your AI Productivity Assistant. How can I help you today? Feel free to ask questions, solve math problems, or request live web searches!',
      tools_used: []
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [useTools, setUseTools] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const queryText = textToSend || input;
    if (!queryText.trim() || loading) return;

    // Gate: Check if user is authenticated
    if (!isAuthenticated) {
      if (openAuthModal) openAuthModal();
      return;
    }

    if (onChatStart) {
      onChatStart();
    }

    const newMessages = [...messages, { role: 'user', content: queryText }];
    setMessages(newMessages);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (apiKey) headers['x-api-key'] = apiKey;

      const response = await authFetch('http://127.0.0.1:8000/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          use_tools: useTools
        })
      });

      const data = await response.json();

      if (response.status === 401) {
        if (openAuthModal) openAuthModal();
        setMessages([
          ...newMessages,
          {
            role: 'model',
            content: '🔒 **Authentication Required**: Please sign in to continue using the AI Assistant.',
            tools_used: []
          }
        ]);
        return;
      }

      if (response.ok) {
        setMessages([
          ...newMessages,
          {
            role: 'model',
            content: data.response,
            tools_used: data.tools_used || []
          }
        ]);
      } else {
        setMessages([
          ...newMessages,
          {
            role: 'model',
            content: `⚠️ **Error**: ${data.detail || 'Failed to generate response. Check your API Key configuration.'}`,
            tools_used: []
          }
        ]);
      }
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          role: 'model',
          content: `⚠️ **Network Error**: Unable to reach backend server at http://127.0.0.1:8000. Is the FastAPI backend running?`,
          tools_used: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: 'model',
        content: 'Chat history cleared. How else can I assist you?',
        tools_used: []
      }
    ]);
  };

  const promptSuggestions = [
    { label: '🔢 Math Calculation', text: 'What is (45 * 12) + sqrt(144) / 4?' },
    { label: '🌐 Live Web Search', text: 'What are the top AI engineering trends in 2026?' },
    { label: '💡 Strategic Advice', text: 'How can I optimize my daily workflow as a software engineer?' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '1.25rem', gap: '1rem', boxSizing: 'border-box' }}>
      
      {/* Top Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1rem',
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Agent Tools Routing:</span>
          <button
            onClick={() => setUseTools(!useTools)}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '20px',
              border: useTools ? '1px solid rgba(2, 132, 199, 0.4)' : '1px solid #cbd5e1',
              background: useTools ? 'rgba(2, 132, 199, 0.1)' : '#f8fafc',
              color: useTools ? '#0284c7' : '#64748b',
              fontSize: '0.8rem',
              cursor: 'pointer',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s ease'
            }}
          >
            <Wrench size={14} />
            {useTools ? 'Autonomous Tools ON' : 'Tools OFF'}
          </button>
        </div>

        <button
          onClick={handleClearChat}
          className="btn-secondary"
          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
        >
          <Trash2 size={14} /> Clear Chat
        </button>
      </div>

      {/* Messages Stream */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        paddingRight: '0.5rem'
      }}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              gap: '0.85rem',
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: msg.role === 'user' ? '75%' : '85%'
            }}
          >
            {msg.role === 'model' && (
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)'
              }}>
                <Bot size={20} color="#fff" />
              </div>
            )}

            <div style={{
              background: msg.role === 'user' ? 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' : '#ffffff',
              border: msg.role === 'user' ? 'none' : '1px solid #e2e8f0',
              padding: '1rem 1.25rem',
              borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              color: msg.role === 'user' ? '#ffffff' : '#0f172a',
              boxShadow: msg.role === 'user' ? '0 4px 14px rgba(79, 70, 229, 0.25)' : '0 2px 8px rgba(15, 23, 42, 0.04)',
              fontSize: '0.95rem',
              lineHeight: '1.6'
            }}>
              {/* Tool Usage Indicator Badge */}
              {msg.tools_used && msg.tools_used.length > 0 && (
                <div style={{ marginBottom: '0.75rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {msg.tools_used.map((t, tIdx) => (
                    <span key={tIdx} className="tool-badge">
                      {t.tool.includes('calculator') ? <Calculator size={12} /> : <Globe size={12} />}
                      Used Tool: <strong>{t.tool}</strong>
                    </span>
                  ))}
                </div>
              )}

              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>

            {msg.role === 'user' && (
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: '#e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <User size={20} color="#475569" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: '0.85rem', alignSelf: 'flex-start' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bot size={20} color="#fff" />
            </div>
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              padding: '0.85rem 1.25rem',
              borderRadius: '18px 18px 18px 4px',
              color: '#4f46e5',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '0.9rem',
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)'
            }}>
              <RefreshCw size={16} className="spin" style={{ animation: 'spin 1.5s linear infinite' }} />
              <span>Thinking & reasoning...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      {messages.length <= 2 && (
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
          {promptSuggestions.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(s.text)}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                padding: '0.45rem 0.85rem',
                borderRadius: '20px',
                color: '#334155',
                fontSize: '0.8rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(79, 70, 229, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(79, 70, 229, 0.3)';
                e.currentTarget.style.color = '#4f46e5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.color = '#334155';
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* Input Box */}
      <div style={{ display: 'flex', gap: '0.75rem', position: 'relative' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask anything, request math calculations, or search the web..."
          className="custom-input"
          style={{ paddingRight: '3.5rem', borderRadius: '14px', fontSize: '0.95rem' }}
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          className="btn-primary"
          style={{
            position: 'absolute',
            right: '6px',
            top: '6px',
            bottom: '6px',
            padding: '0 1rem',
            borderRadius: '10px'
          }}
        >
          <Send size={16} />
        </button>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ChatInterface;
