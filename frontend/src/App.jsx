import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ChatInterface from './components/ChatInterface';
import DocumentIntelligence from './components/DocumentIntelligence';
import ContentGenerator from './components/ContentGenerator';
import AgentTools from './components/AgentTools';
import ApiKeyModal from './components/ApiKeyModal';
import AuthModal from './components/AuthModal';
import LogoutModal from './components/LogoutModal';
import { useAuth } from './context/AuthContext';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

function App() {
  const { authFetch, verifyNotice, setVerifyNotice, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [apiKey, setApiKey] = useState(localStorage.getItem('GEMINI_API_KEY') || '');
  const [hasApiKey, setHasApiKey] = useState(false);
  
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Check health and API key configuration on backend
  const checkHealth = async (keyToCheck) => {
    try {
      const headers = {};
      if (keyToCheck) headers['x-api-key'] = keyToCheck;

      const res = await authFetch('http://127.0.0.1:8000/api/health', { headers });
      const data = await res.json();
      setHasApiKey(data.has_api_key);
    } catch (err) {
      console.warn('Backend health check failed:', err);
    }
  };

  useEffect(() => {
    checkHealth(apiKey);
  }, [apiKey]);

  // Auto-dismiss notification toast banner after 6 seconds
  useEffect(() => {
    if (verifyNotice) {
      const timer = setTimeout(() => {
        setVerifyNotice(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [verifyNotice]);

  const saveApiKey = (newKey) => {
    setApiKey(newKey);
    localStorage.setItem('GEMINI_API_KEY', newKey);
    checkHealth(newKey);
  };

  const handleConfirmLogout = () => {
    logout(true);
    setIsAuthModalOpen(true);
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'chat': return '💬 AI Chat Interface';
      case 'document': return '📄 Document Intelligence Studio';
      case 'content': return '✍️ AI Content Generation Studio';
      case 'tools': return '⚙️ AI Agent & Autonomous Tools';
      default: return 'AI Smart Assistant';
    }
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', background: '#f8fafc' }}>
      
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openApiKeyModal={() => setIsApiKeyModalOpen(true)}
        openAuthModal={() => setIsAuthModalOpen(true)}
        hasApiKey={hasApiKey}
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Workspace Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <Header
          activeTabTitle={getTabTitle()}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          openAuthModal={() => setIsAuthModalOpen(true)}
          openLogoutModal={() => setIsLogoutModalOpen(true)}
        />
        
        {/* Notification Toast Banner */}
        {verifyNotice && (
          <div style={{
            background: verifyNotice.type === 'success' ? '#f0fdf4' : (verifyNotice.type === 'info' ? '#eff6ff' : '#fef2f2'),
            borderBottom: verifyNotice.type === 'success' ? '1px solid #bbf7d0' : (verifyNotice.type === 'info' ? '1px solid #bfdbfe' : '1px solid #fecaca'),
            color: verifyNotice.type === 'success' ? '#15803d' : (verifyNotice.type === 'info' ? '#1d4ed8' : '#dc2626'),
            padding: '0.65rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.875rem',
            fontWeight: 600,
            animation: 'fadeIn 0.2s ease-out',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {verifyNotice.type === 'success' ? <CheckCircle2 size={18} /> : (verifyNotice.type === 'info' ? <CheckCircle2 size={18} color="#1d4ed8" /> : <AlertTriangle size={18} />)}
              <span>{verifyNotice.message}</span>
            </div>
            <button
              onClick={() => setVerifyNotice(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        <main style={{ flex: 1, position: 'relative', overflow: 'hidden', minHeight: 0 }}>
          {activeTab === 'chat' && (
            <ChatInterface
              apiKey={apiKey}
              onChatStart={() => setIsSidebarOpen(false)}
              openAuthModal={() => setIsAuthModalOpen(true)}
            />
          )}
          {activeTab === 'document' && (
            <DocumentIntelligence
              apiKey={apiKey}
              openAuthModal={() => setIsAuthModalOpen(true)}
            />
          )}
          {activeTab === 'content' && (
            <ContentGenerator
              apiKey={apiKey}
              openAuthModal={() => setIsAuthModalOpen(true)}
            />
          )}
          {activeTab === 'tools' && (
            <AgentTools
              openAuthModal={() => setIsAuthModalOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Modal for setting API key */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        apiKey={apiKey}
        saveApiKey={saveApiKey}
      />

      {/* Modal for OAuth 2.0 & JWT Authentication */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Modal for Logout Confirmation */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
      />

    </div>
  );
}

export default App;

