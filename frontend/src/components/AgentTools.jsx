import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Calculator, Globe, Wrench, Play, CheckCircle, AlertCircle, Terminal, Info } from 'lucide-react';

const AgentTools = () => {
  const [calcInput, setCalcInput] = useState('(25 * 40) + sqrt(144) - pow(2, 5)');
  const [calcResult, setCalcResult] = useState(null);
  const [calcLoading, setCalcLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('Google Gemini 2.5 Flash updates');
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const handleCalcExecute = async () => {
    if (!calcInput.trim()) return;
    setCalcLoading(true);
    setCalcResult(null);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/tools/calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expression: calcInput })
      });
      const data = await res.json();
      setCalcResult(data);
    } catch (err) {
      setCalcResult({ success: false, error: 'Failed to execute calculator tool.' });
    } finally {
      setCalcLoading(false);
    }
  };

  const handleSearchExecute = async () => {
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    setSearchResults(null);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/tools/web-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      });
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      setSearchResults({ success: false, error: 'Failed to execute web search tool.' });
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', padding: '1.25rem', gap: '1.25rem', overflowY: 'auto' }}>
      
      {/* Intro Header */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Wrench size={22} color="#22d3ee" /> Autonomous AI Agent Tools
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#9ca3af' }}>
            The AI automatically detects when a calculation or real-time web search is required and invokes these tools autonomously.
          </p>
        </div>

        <div style={{
          background: 'rgba(6, 182, 212, 0.1)',
          border: '1px solid rgba(6, 182, 212, 0.25)',
          padding: '0.65rem 1rem',
          borderRadius: '12px',
          fontSize: '0.82rem',
          color: '#22d3ee',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Info size={16} />
          <span>Active Agent Tools: <strong>Calculator</strong> & <strong>DuckDuckGo Web Search</strong></span>
        </div>
      </div>

      {/* Grid of Tools */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', flex: 1 }}>
        
        {/* Tool 1: Math Calculator */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(6, 182, 212, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Calculator size={20} color="#22d3ee" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', color: '#fff' }}>Tool 1: Calculator & Math Engine</h3>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Evaluates math expressions safely</span>
              </div>
            </div>

            <span className="tool-badge">Callable Function</span>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#d1d5db', marginBottom: '0.5rem', fontWeight: 500 }}>
              Test Mathematical Expression
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={calcInput}
                onChange={(e) => setCalcInput(e.target.value)}
                placeholder="e.g. (45 * 12) + sqrt(144)"
                className="custom-input"
              />
              <button onClick={handleCalcExecute} disabled={calcLoading} className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
                <Play size={16} /> Test Tool
              </button>
            </div>
          </div>

          {/* Result Terminal Box */}
          <div style={{
            flex: 1,
            background: 'rgba(9, 13, 22, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '1rem',
            fontFamily: 'monospace',
            fontSize: '0.88rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#6b7280', fontSize: '0.78rem' }}>
              <Terminal size={14} /> Tool Output Log:
            </div>

            {calcLoading ? (
              <span style={{ color: '#22d3ee' }}>Executing calculator function...</span>
            ) : calcResult ? (
              calcResult.success ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', color: '#4ade80' }}>
                  <span>✓ Success</span>
                  <span style={{ color: '#9ca3af' }}>Input: {calcResult.expression}</span>
                  <span style={{ fontSize: '1.1rem', color: '#22d3ee', fontWeight: 'bold' }}>Result: {calcResult.result}</span>
                </div>
              ) : (
                <span style={{ color: '#f87171' }}>✗ Error: {calcResult.error}</span>
              )
            ) : (
              <span style={{ color: '#4b5563' }}>Waiting for tool invocation...</span>
            )}
          </div>
        </div>

        {/* Tool 2: Web Search & Extractor */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(168, 85, 247, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Globe size={20} color="#c084fc" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', color: '#fff' }}>Tool 2: Live Web Search & Content Extractor</h3>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Fetches live DuckDuckGo web search results</span>
              </div>
            </div>

            <span className="tool-badge" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', borderColor: 'rgba(168, 85, 247, 0.3)' }}>
              Live Web Access
            </span>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#d1d5db', marginBottom: '0.5rem', fontWeight: 500 }}>
              Test Search Query
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. Current weather in Tokyo"
                className="custom-input"
              />
              <button onClick={handleSearchExecute} disabled={searchLoading} className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
                <Play size={16} /> Test Search
              </button>
            </div>
          </div>

          {/* Search Results Display Box */}
          <div style={{
            flex: 1,
            background: 'rgba(9, 13, 22, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '1rem',
            fontSize: '0.85rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#6b7280', fontSize: '0.78rem' }}>
              <Terminal size={14} /> Search Results Log:
            </div>

            {searchLoading ? (
              <span style={{ color: '#c084fc' }}>Querying DuckDuckGo web search engine...</span>
            ) : searchResults ? (
              searchResults.success && searchResults.results.length > 0 ? (
                searchResults.results.map((item, idx) => (
                  <div key={idx} style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.65rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <a href={item.url} target="_blank" rel="noreferrer" style={{ color: '#818cf8', fontWeight: 600, textDecoration: 'none' }}>
                      {item.title}
                    </a>
                    <p style={{ color: '#9ca3af', fontSize: '0.8rem', marginTop: '0.25rem' }}>{item.snippet}</p>
                  </div>
                ))
              ) : (
                <span style={{ color: '#f87171' }}>{searchResults.message || searchResults.error || 'No search results.'}</span>
              )
            ) : (
              <span style={{ color: '#4b5563' }}>Waiting for tool invocation...</span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AgentTools;
