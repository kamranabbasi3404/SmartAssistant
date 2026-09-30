import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Sparkles, Copy, Download, Check, Mail, Share2, FileSpreadsheet, FileText, ClipboardList } from 'lucide-react';

const ContentGenerator = ({ apiKey }) => {
  const [contentType, setContentType] = useState('email');
  const [prompt, setPrompt] = useState('Write a professional email asking a client for project requirements.');
  const [tone, setTone] = useState('Professional');
  const [formatStyle, setFormatStyle] = useState('Markdown');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const contentTypes = [
    { id: 'email', label: 'Email Draft', icon: Mail },
    { id: 'social', label: 'Social Media Post', icon: Share2 },
    { id: 'report', label: 'Executive Report', icon: FileSpreadsheet },
    { id: 'meeting_notes', label: 'Meeting Notes', icon: ClipboardList },
    { id: 'summary', label: 'Content Summary', icon: FileText },
  ];

  const tones = ['Professional', 'Casual & Friendly', 'Persuasive & Sales', 'Concise & Direct', 'Authoritative & Formal'];
  const formats = ['Markdown', 'Bullet Points', 'Executive Brief', 'HTML Structure'];

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (apiKey) headers['x-api-key'] = apiKey;

      const response = await fetch('http://127.0.0.1:8000/api/content/generate', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          content_type: contentType,
          user_prompt: prompt,
          tone: tone,
          format_style: formatStyle
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setOutput(data.result);
      } else {
        setErrorMsg(data.detail || data.error || 'Failed to generate content.');
      }
    } catch (err) {
      setErrorMsg('Failed to connect to backend server. Make sure FastAPI server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([output], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${contentType}_generation.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '1.25rem', height: 'calc(100vh - 64px)', padding: '1.25rem', overflowY: 'auto' }}>
      
      {/* Configuration Column */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', color: '#0f172a', marginBottom: '0.25rem' }}>Content Generation Studio</h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Select content type, tone, and format to generate instant polished copy.</p>
        </div>

        {/* Content Type Cards */}
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#334155', marginBottom: '0.5rem', fontWeight: 600 }}>
            Select Output Type
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {contentTypes.map((item) => {
              const Icon = item.icon;
              const isSelected = contentType === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setContentType(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    border: isSelected ? '1px solid #4f46e5' : '1px solid #e2e8f0',
                    background: isSelected ? 'rgba(79, 70, 229, 0.08)' : '#ffffff',
                    color: isSelected ? '#4f46e5' : '#475569',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontWeight: isSelected ? 600 : 400
                  }}
                >
                  <Icon size={18} color={isSelected ? '#4f46e5' : '#64748b'} />
                  <span style={{ fontSize: '0.88rem' }}>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tone Selector */}
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#334155', marginBottom: '0.5rem', fontWeight: 600 }}>
            Desired Tone
          </label>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="custom-input"
            style={{ background: '#ffffff', color: '#0f172a' }}
          >
            {tones.map((t, idx) => (
              <option key={idx} value={t} style={{ background: '#ffffff', color: '#0f172a' }}>{t}</option>
            ))}
          </select>
        </div>

        {/* Format Selector */}
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#334155', marginBottom: '0.5rem', fontWeight: 600 }}>
            Format Style
          </label>
          <select
            value={formatStyle}
            onChange={(e) => setFormatStyle(e.target.value)}
            className="custom-input"
            style={{ background: '#ffffff', color: '#0f172a' }}
          >
            {formats.map((f, idx) => (
              <option key={idx} value={f} style={{ background: '#ffffff', color: '#0f172a' }}>{f}</option>
            ))}
          </select>
        </div>

        {/* Prompt Input */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#334155', marginBottom: '0.5rem', fontWeight: 600 }}>
            Prompt / Instructions
          </label>
          <textarea
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you want to generate in detail..."
            className="custom-input"
            style={{ resize: 'none', flex: 1 }}
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}
        >
          <Sparkles size={18} />
          {loading ? 'Generating Copy...' : 'Generate Content'}
        </button>

        {errorMsg && (
          <div style={{ fontSize: '0.8rem', color: '#dc2626', background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '8px' }}>
            {errorMsg}
          </div>
        )}
      </div>

      {/* Generated Content Output Column */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={20} color="#7c3aed" />
            <h3 style={{ fontSize: '1.1rem', color: '#0f172a' }}>Generated Content Output</h3>
          </div>

          {output && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={handleCopy} className="btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                {copied ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button onClick={handleDownload} className="btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                <Download size={14} /> Download
              </button>
            </div>
          )}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', lineHeight: '1.65', color: '#1e293b', fontSize: '0.95rem' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem', color: '#7c3aed' }}>
              <Sparkles size={36} className="pulse-glow" />
              <span>Crafting tailored content based on your specifications...</span>
            </div>
          ) : output ? (
            <ReactMarkdown>{output}</ReactMarkdown>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', gap: '0.75rem' }}>
              <Sparkles size={40} color="#cbd5e1" />
              <p>Configure parameters on the left panel and click "Generate Content" to start.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default ContentGenerator;
