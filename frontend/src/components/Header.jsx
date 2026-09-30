import React from 'react';
import { Cpu, ShieldCheck, PanelLeft } from 'lucide-react';

const Header = ({ activeTabTitle, isSidebarOpen, toggleSidebar }) => {
  return (
    <header style={{
      height: '64px',
      borderBottom: '1px solid #e2e8f0',
      background: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.5rem'
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

        <h1 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#0f172a' }}>{activeTabTitle}</h1>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          background: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.25)',
          padding: '0.35rem 0.75rem',
          borderRadius: '20px',
          fontSize: '0.8rem',
          color: '#16a34a'
        }}>
          <ShieldCheck size={14} />
          <span>System Ready</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
