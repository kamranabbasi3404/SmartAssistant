import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ChatInterface from './components/ChatInterface';
import DocumentIntelligence from './components/DocumentIntelligence';
import ContentGenerator from './components/ContentGenerator';
import AgentTools from './components/AgentTools';
import ApiKeyModal from './components/ApiKeyModal';

function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [apiKey, setApiKey] = useState(localStorage.getItem('GEMINI_API_KEY') || '');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Check health and API key configuration on backend
  const checkHealth = async (keyToCheck) => {
    try {
      const headers = {};
      if (keyToCheck) headers['x-api-key'] = keyToCheck;

      const res = await fetch('http://127.0.0.1:8000/api/health', { headers });
      const data = await res.json();
      setHasApiKey(data.has_api_key);
    } catch (err) {
      console.warn('Backend health check failed:', err);
    }
  };

  useEffect(() => {
    checkHealth(apiKey);
  }, [apiKey]);

  const saveApiKey = (newKey) => {
    setApiKey(newKey);
    localStorage.setItem('GEMINI_API_KEY', newKey);
    checkHealth(newKey);
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
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', background: '#090d16' }}>
      
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openApiKeyModal={() => setIsModalOpen(true)}
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
        />
        
        <main style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {activeTab === 'chat' && (
            <ChatInterface
              apiKey={apiKey}
              onChatStart={() => setIsSidebarOpen(false)}
            />
          )}
          {activeTab === 'document' && <DocumentIntelligence apiKey={apiKey} />}
          {activeTab === 'content' && <ContentGenerator apiKey={apiKey} />}
          {activeTab === 'tools' && <AgentTools />}
        </main>
      </div>

      {/* Modal for setting API key */}
      <ApiKeyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        apiKey={apiKey}
        saveApiKey={saveApiKey}
      />

    </div>
  );
}

export default App;
