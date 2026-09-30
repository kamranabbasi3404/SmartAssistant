import React from 'react';
import { Cpu, ShieldCheck, PanelLeft } from 'lucide-react';

const Header = ({ activeTabTitle, isSidebarOpen, toggleSidebar }) => {
  return (
    <header style={{
      height: '64px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      background: 'rgba(9, 13, 22, 0.8)',
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
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#cbd5e1',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)';
              e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            <PanelLeft size={20} />
          </button>
        )}

        <h1 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#f3f4f6' }}>{activeTabTitle}</h1>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '0.35rem 0.75rem',
          borderRadius: '20px',
          fontSize: '0.8rem',
          color: '#cbd5e1'
        }}>
          <Cpu size={14} color="#818cf8" />
          <span>Engine: <strong style={{ color: '#a5b4fc' }}>Gemini 3.6 Flash</strong></span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          background: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.2)',
          padding: '0.35rem 0.75rem',
          borderRadius: '20px',
          fontSize: '0.8rem',
          color: '#4ade80'
        }}>
          <ShieldCheck size={14} />
          <span>System Ready</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
