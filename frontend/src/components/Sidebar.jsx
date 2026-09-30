import React from 'react';
import { MessageSquare, FileText, Sparkles, Wrench, Key, Bot, PanelLeft, PanelLeftClose } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, openApiKeyModal, hasApiKey, isOpen, toggleSidebar }) => {
  const navItems = [
    { id: 'chat', label: 'AI Chat Interface', icon: MessageSquare, badge: 'Core' },
    { id: 'document', label: 'Document Intelligence', icon: FileText, badge: 'RAG' },
    { id: 'content', label: 'Content Generator', icon: Sparkles, badge: 'Studio' },
    { id: 'tools', label: 'AI Agent & Tools', icon: Wrench, badge: 'Autonomous' },
  ];

  return (
    <aside style={{
      width: isOpen ? '275px' : '72px',
      minWidth: isOpen ? '275px' : '72px',
      opacity: 1,
      padding: isOpen ? '1.25rem 0.85rem' : '1.25rem 0.5rem',
      background: 'rgba(10, 14, 24, 0.95)',
      borderRight: '1px solid rgba(255, 255, 255, 0.08)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      gap: '1.5rem',
      backdropFilter: 'blur(20px)',
      overflow: 'hidden',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxSizing: 'border-box'
    }}>
      {/* Brand Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: isOpen ? 'space-between' : 'center',
        padding: '0.4rem 0.2rem',
        whiteSpace: 'nowrap'
      }}>
        {isOpen ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)'
              }}>
                <Bot size={22} color="#ffffff" />
              </div>
              <div>
                <h2 style={{ fontSize: '1rem', fontWeight: '700', color: '#fff', lineHeight: 1.2 }}>Smart Assistant</h2>
                <span style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 500 }}>AI Productivity Suite</span>
              </div>
            </div>

            <button
              onClick={toggleSidebar}
              title="Collapse to Mini Bar"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#9ca3af',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.color = '#9ca3af';
              }}
            >
              <PanelLeftClose size={18} />
            </button>
          </>
        ) : (
          /* Mini Sidebar Logo / Toggle Button */
          <button
            onClick={toggleSidebar}
            title="Expand Sidebar"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Bot size={24} color="#ffffff" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, whiteSpace: 'nowrap', alignItems: isOpen ? 'stretch' : 'center' }}>
        {isOpen && (
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.05em', padding: '0 0.4rem 0.2rem 0.4rem', fontWeight: 600 }}>
            Modules
          </div>
        )}
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={isOpen ? '' : item.label}
              style={{
                width: isOpen ? '100%' : '44px',
                height: isOpen ? 'auto' : '44px',
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'center',
                justifyContent: isOpen ? 'space-between' : 'center',
                padding: isOpen ? '0.7rem 0.75rem' : '0',
                borderRadius: '12px',
                border: isActive ? '1px solid rgba(99, 102, 241, 0.5)' : '1px solid transparent',
                background: isActive ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                color: isActive ? '#ffffff' : '#9ca3af',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontWeight: isActive ? 600 : 400
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.color = '#ffffff';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#9ca3af';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0, overflow: 'hidden' }}>
                <Icon size={20} color={isActive ? '#818cf8' : '#9ca3af'} style={{ flexShrink: 0 }} />
                {isOpen && <span style={{ fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>}
              </div>
              {isOpen && (
                <span style={{
                  fontSize: '0.65rem',
                  background: isActive ? 'rgba(129, 140, 248, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                  color: isActive ? '#a5b4fc' : '#6b7280',
                  padding: '0.15rem 0.45rem',
                  borderRadius: '6px',
                  flexShrink: 0,
                  marginLeft: '0.35rem'
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* API Key Status Footer */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.07)',
        borderRadius: '12px',
        padding: isOpen ? '0.85rem' : '0.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: isOpen ? 'stretch' : 'center',
        gap: '0.6rem',
        whiteSpace: 'nowrap'
      }}>
        {isOpen ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 500 }}>Gemini API</span>
              <span style={{
                fontSize: '0.7rem',
                padding: '0.15rem 0.5rem',
                borderRadius: '12px',
                background: hasApiKey ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: hasApiKey ? '#4ade80' : '#f87171',
                border: hasApiKey ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                fontWeight: 600
              }}>
                {hasApiKey ? 'Connected' : 'Key Needed'}
              </span>
            </div>
            <button
              onClick={openApiKeyModal}
              className="btn-secondary"
              style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem', padding: '0.5rem' }}
            >
              <Key size={14} /> Configure API Key
            </button>
          </>
        ) : (
          /* Mini API Key Button */
          <button
            onClick={openApiKeyModal}
            title={hasApiKey ? 'Gemini API Connected' : 'Configure API Key'}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: hasApiKey ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: hasApiKey ? '#4ade80' : '#f87171',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            <Key size={16} />
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
