import React from 'react';
import { Cpu, ShieldCheck, PanelLeft, LogIn, LogOut, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header = ({ activeTabTitle, isSidebarOpen, toggleSidebar, openAuthModal, openLogoutModal }) => {
  const { user, isAuthenticated } = useAuth();

  return (
    <header style={{
      height: '64px',
      borderBottom: '1px solid #e2e8f0',
      background: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.5rem',
      zIndex: 10
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {!isSidebarOpen && (
          <button
            onClick={toggleSidebar}
            title="Open Sidebar"
            style={{
              background: '#f1f5f9',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#475569',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(79, 70, 229, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(79, 70, 229, 0.3)';
              e.currentTarget.style.color = '#4f46e5';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f1f5f9';
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.color = '#475569';
            }}
          >
            <PanelLeft size={20} />
          </button>
        )}

        <h1 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
          {activeTabTitle}
        </h1>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        
        {/* Engine Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          background: '#f1f5f9',
          border: '1px solid #e2e8f0',
          padding: '0.35rem 0.75rem',
          borderRadius: '20px',
          fontSize: '0.8rem',
          color: '#334155'
        }}>
          <Cpu size={14} color="#4f46e5" />
          <span>Engine: <strong style={{ color: '#4f46e5' }}>Gemini 3.6 Flash</strong></span>
        </div>

        {/* User Auth Profile Pill or Sign In Button */}
        {isAuthenticated ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(124, 58, 237, 0.08) 100%)',
            border: '1px solid rgba(79, 70, 229, 0.25)',
            padding: '0.25rem 0.6rem 0.25rem 0.35rem',
            borderRadius: '24px'
          }}>
            <img
              src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
              alt={user.name}
              style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#e2e8f0' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e293b', lineHeight: 1.1 }}>
                {user.name}
              </span>
              <span style={{ fontSize: '0.65rem', color: '#4f46e5', fontWeight: 600 }}>
                {user.role || 'OAuth2 Verified'}
              </span>
            </div>
            <button
              onClick={() => {
                if (openLogoutModal) openLogoutModal();
              }}
              title="Sign Out"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: '0.2rem'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={openAuthModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              border: 'none',
              padding: '0.4rem 0.9rem',
              borderRadius: '20px',
              fontSize: '0.825rem',
              fontWeight: 600,
              color: '#ffffff',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)',
              transition: 'transform 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <LogIn size={15} />
            <span>Sign In / OAuth 2.0</span>
          </button>
        )}

      </div>
    </header>
  );
};

export default Header;
