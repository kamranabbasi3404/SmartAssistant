import React from 'react';
import { MessageSquare, FileText, Sparkles, Wrench, Key, Bot, PanelLeftClose, ShieldCheck, UserCheck, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ activeTab, setActiveTab, openApiKeyModal, openAuthModal, hasApiKey, isOpen, toggleSidebar }) => {
  const { user, isAuthenticated } = useAuth();

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
      background: '#ffffff',
      borderRight: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      gap: '1.25rem',
      boxShadow: '2px 0 12px rgba(15, 23, 42, 0.03)',
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
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)'
              }}>
                <Bot size={22} color="#ffffff" />
              </div>
              <div>
                <h2 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', lineHeight: 1.2 }}>Smart Assistant</h2>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>AI Productivity Suite</span>
              </div>
            </div>

            <button
              onClick={toggleSidebar}
              title="Collapse Sidebar"
              style={{
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(79, 70, 229, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(79, 70, 229, 0.3)';
                e.currentTarget.style.color = '#4f46e5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f1f5f9';
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.color = '#64748b';
              }}
            >
              <PanelLeftClose size={18} />
            </button>
          </>
        ) : (
          /* Mini Sidebar Logo Button */
          <button
            onClick={toggleSidebar}
            title="Expand Sidebar"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)',
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
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1, whiteSpace: 'nowrap', alignItems: isOpen ? 'stretch' : 'center' }}>
        {isOpen && (
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em', padding: '0 0.4rem 0.2rem 0.4rem', fontWeight: 700 }}>
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
                border: isActive ? '1px solid rgba(79, 70, 229, 0.3)' : '1px solid transparent',
                background: isActive ? 'rgba(79, 70, 229, 0.08)' : 'transparent',
                color: isActive ? '#4f46e5' : '#475569',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontWeight: isActive ? 600 : 500
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = '#f8fafc';
                  e.currentTarget.style.color = '#0f172a';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#475569';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0, overflow: 'hidden' }}>
                <Icon size={20} color={isActive ? '#4f46e5' : '#64748b'} style={{ flexShrink: 0 }} />
                {isOpen && <span style={{ fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>}
              </div>
              {isOpen && (
                <span style={{
                  fontSize: '0.65rem',
                  background: isActive ? 'rgba(79, 70, 229, 0.15)' : '#f1f5f9',
                  color: isActive ? '#4f46e5' : '#64748b',
                  padding: '0.15rem 0.45rem',
                  borderRadius: '6px',
                  flexShrink: 0,
                  marginLeft: '0.35rem',
                  fontWeight: 600
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Auth & API Key Section */}
      <div style={{
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        padding: isOpen ? '0.85rem' : '0.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: isOpen ? 'stretch' : 'center',
        gap: '0.6rem',
        whiteSpace: 'nowrap'
      }}>
        {isOpen ? (
          <>
            {/* OAuth2 Badge */}
            <button
              onClick={openAuthModal}
              style={{
                background: isAuthenticated ? 'rgba(34, 197, 94, 0.08)' : 'rgba(79, 70, 229, 0.08)',
                border: isAuthenticated ? '1px solid rgba(34, 197, 94, 0.25)' : '1px solid rgba(79, 70, 229, 0.25)',
                borderRadius: '10px',
                padding: '0.5rem 0.65rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={16} color={isAuthenticated ? '#16a34a' : '#4f46e5'} />
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#1e293b' }}>
                    {isAuthenticated ? user.name : 'OAuth 2.0 Auth'}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: isAuthenticated ? '#16a34a' : '#4f46e5' }}>
                    {isAuthenticated ? (user.role || 'Authorized') : 'Click to Sign In'}
                  </div>
                </div>
              </div>
              {!isAuthenticated && <LogIn size={14} color="#4f46e5" />}
            </button>

            <div style={{ borderTop: '1px solid #e2e8f0', margin: '0.1rem 0' }}></div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>Gemini API</span>
              <span style={{
                fontSize: '0.68rem',
                padding: '0.15rem 0.45rem',
                borderRadius: '12px',
                background: hasApiKey ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                color: hasApiKey ? '#16a34a' : '#dc2626',
                border: hasApiKey ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                fontWeight: 600
              }}>
                {hasApiKey ? 'Connected' : 'Key Needed'}
              </span>
            </div>

            <button
              onClick={openApiKeyModal}
              className="btn-secondary"
              style={{ width: '100%', justifyContent: 'center', fontSize: '0.78rem', padding: '0.45rem' }}
            >
              <Key size={14} /> Configure API Key
            </button>
          </>
        ) : (
          <>
            <button
              onClick={openAuthModal}
              title={isAuthenticated ? `Authenticated as ${user.name}` : 'OAuth 2.0 Sign In'}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: '#ffffff',
                border: isAuthenticated ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(79, 70, 229, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isAuthenticated ? '#16a34a' : '#4f46e5',
                cursor: 'pointer'
              }}
            >
              <ShieldCheck size={18} />
            </button>

            <button
              onClick={openApiKeyModal}
              title={hasApiKey ? 'Gemini API Connected' : 'Configure API Key'}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: '#ffffff',
                border: hasApiKey ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: hasApiKey ? '#16a34a' : '#dc2626',
                cursor: 'pointer'
              }}
            >
              <Key size={16} />
            </button>
          </>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
