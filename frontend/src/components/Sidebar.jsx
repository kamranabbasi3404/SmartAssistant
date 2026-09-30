import React from 'react';
import { MessageSquare, FileText, Sparkles, Wrench, Key, Bot } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, openApiKeyModal, hasApiKey, isOpen }) => {
  const navItems = [
    { id: 'chat', label: 'AI Chat Interface', icon: MessageSquare, badge: 'Core' },
    { id: 'document', label: 'Document Intelligence', icon: FileText, badge: 'RAG' },
    { id: 'content', label: 'Content Generator', icon: Sparkles, badge: 'Studio' },
    { id: 'tools', label: 'AI Agent & Tools', icon: Wrench, badge: 'Autonomous' },
  ];

  return (
    <aside style={{
      width: isOpen ? '260px' : '0px',
      minWidth: isOpen ? '260px' : '0px',
      opacity: isOpen ? 1 : 0,
      visibility: isOpen ? 'visible' : 'hidden',
      padding: isOpen ? '1.25rem 1rem' : '1.25rem 0px',
      background: 'rgba(10, 14, 24, 0.95)',
      borderRight: isOpen ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      gap: '1.5rem',
      backdropFilter: 'blur(20px)',
      overflow: 'hidden',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.5rem', whiteSpace: 'nowrap' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)'
        }}>
          <Bot size={24} color="#ffffff" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff', lineHeight: 1.2 }}>Smart Assistant</h2>
          <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 500 }}>AI Productivity Suite</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1, whiteSpace: 'nowrap' }}>
        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.05em', padding: '0 0.5rem 0.4rem 0.5rem', fontWeight: 600 }}>
          Modules
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 0.85rem',
                borderRadius: '10px',
                border: isActive ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                color: isActive ? '#ffffff' : '#9ca3af',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontWeight: isActive ? 600 : 400
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Icon size={18} color={isActive ? '#818cf8' : '#9ca3af'} />
                <span style={{ fontSize: '0.9rem' }}>{item.label}</span>
              </div>
              <span style={{
                fontSize: '0.68rem',
                background: isActive ? 'rgba(129, 140, 248, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                color: isActive ? '#a5b4fc' : '#6b7280',
                padding: '0.15rem 0.45rem',
                borderRadius: '6px'
              }}>
                {item.badge}
              </span>
            </button>
          );
        })}
      </nav>

      {/* API Key Status Footer */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.07)',
        borderRadius: '12px',
        padding: '0.85rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem',
        whiteSpace: 'nowrap'
      }}>
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
      </div>
    </aside>
  );
};

export default Sidebar;
