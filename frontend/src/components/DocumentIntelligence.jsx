import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Upload, FileText, CheckCircle, AlertCircle, Sparkles, HelpCircle, FileCheck, Layers, ListChecks } from 'lucide-react';

const DocumentIntelligence = ({ apiKey }) => {
  const [docData, setDocData] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeAction, setActiveAction] = useState(null);
  const [question, setQuestion] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setErrorMsg('');
    setAnalysisResult('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/document/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setDocData(data);
      } else {
        setErrorMsg(data.detail || data.error || 'Failed to extract text from document.');
      }
    } catch (err) {
      setErrorMsg('Failed to connect to backend server. Make sure FastAPI server is running.');
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyze = async (action, customQ = null) => {
    if (!docData || !docData.text) return;

    setAnalyzing(true);
    setActiveAction(action);
    setErrorMsg('');

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (apiKey) headers['x-api-key'] = apiKey;

      const response = await fetch('http://127.0.0.1:8000/api/document/analyze', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          document_text: docData.text,
          action: action,
          question: customQ || question
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAnalysisResult(data.result);
      } else {
        setErrorMsg(data.detail || data.error || 'Failed to analyze document.');
      }
    } catch (err) {
      setErrorMsg('Network error while running document analysis.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', padding: '1.25rem', gap: '1.25rem', overflowY: 'auto' }}>
      
      {/* Top Banner / Upload Zone */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '0.25rem' }}>Document Intelligence Hub</h2>
            <p style={{ fontSize: '0.88rem', color: '#9ca3af' }}>Upload company policies, reports, PDFs, DOCX, or TXT documents for strict AI context extraction.</p>
          </div>

          <label className="btn-primary" style={{ cursor: 'pointer' }}>
            <Upload size={18} />
            <span>{uploading ? 'Parsing File...' : 'Upload Document (PDF, DOCX, TXT)'}</span>
            <input
              type="file"
              accept=".pdf,.docx,.doc,.txt,.md"
              onChange={handleFileUpload}
              disabled={uploading}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        {errorMsg && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Uploaded File Stats Card */}
        {docData && (
          <div style={{
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            padding: '1rem 1.25rem',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'rgba(99, 102, 241, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FileCheck size={24} color="#818cf8" />
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', color: '#fff', fontWeight: 600 }}>{docData.filename}</h4>
                <div style={{ display: 'flex', gap: '0.8rem', fontSize: '0.78rem', color: '#9ca3af', marginTop: '0.2rem' }}>
                  <span>Format: <strong style={{ color: '#a5b4fc', uppercase: 'true' }}>{docData.ext.toUpperCase()}</strong></span>
                  <span>• Words: <strong>{docData.word_count.toLocaleString()}</strong></span>
                  <span>• Pages: <strong>{docData.pages}</strong></span>
                  <span>• Chars: <strong>{docData.char_count.toLocaleString()}</strong></span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#4ade80', fontSize: '0.82rem', fontWeight: 600 }}>
              <CheckCircle size={16} /> Document Ingested & Ready
            </div>
          </div>
        )}
      </div>

      {/* Main Analysis Workspace */}
      {docData ? (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.25rem', flex: 1 }}>
          
          {/* Action Toolbox */}
          <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1rem', color: '#fff', fontWeight: 600 }}>AI Analysis Actions</h3>
            
            <button
              onClick={() => handleAnalyze('summarize')}
              disabled={analyzing}
              className="btn-secondary"
              style={{
                justifyContent: 'flex-start',
                padding: '0.85rem 1rem',
                border: activeAction === 'summarize' ? '1px solid #818cf8' : '1px solid rgba(255, 255, 255, 0.08)',
                background: activeAction === 'summarize' ? 'rgba(99, 102, 241, 0.2)' : 'transparent'
              }}
            >
              <FileText size={18} color="#818cf8" />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Summarize Document</div>
                <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>Generate executive summary</div>
              </div>
            </button>

            <button
              onClick={() => handleAnalyze('key_topics')}
              disabled={analyzing}
              className="btn-secondary"
              style={{
                justifyContent: 'flex-start',
                padding: '0.85rem 1rem',
                border: activeAction === 'key_topics' ? '1px solid #c084fc' : '1px solid rgba(255, 255, 255, 0.08)',
                background: activeAction === 'key_topics' ? 'rgba(192, 132, 252, 0.2)' : 'transparent'
              }}
            >
              <Layers size={18} color="#c084fc" />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Identify Key Topics</div>
                <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>Extract core concepts & rules</div>
              </div>
            </button>

            <button
              onClick={() => handleAnalyze('extract_info')}
              disabled={analyzing}
              className="btn-secondary"
              style={{
                justifyContent: 'flex-start',
                padding: '0.85rem 1rem',
                border: activeAction === 'extract_info' ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
                background: activeAction === 'extract_info' ? 'rgba(56, 189, 248, 0.2)' : 'transparent'
              }}
            >
              <ListChecks size={18} color="#38bdf8" />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Extract Key Information</div>
                <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>Stats, dates, & quantitative data</div>
              </div>
            </button>

            <hr style={{ borderColor: 'rgba(255, 255, 255, 0.08)', margin: '0.5rem 0' }} />

            {/* Document Q&A Section */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#fff', marginBottom: '0.5rem', fontWeight: 600 }}>
                Strict Document Q&A
              </label>
              <textarea
                rows={3}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask a question (e.g. 'What is the company leave policy?')"
                className="custom-input"
                style={{ resize: 'none', fontSize: '0.85rem', marginBottom: '0.6rem' }}
              />
              <button
                onClick={() => handleAnalyze('qa', question)}
                disabled={analyzing || !question.trim()}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <HelpCircle size={16} /> Ask Question
              </button>
            </div>
          </div>

          {/* Results Output Window */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '400px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={18} color="#818cf8" />
                <h3 style={{ fontSize: '1rem', color: '#fff', fontWeight: 600 }}>
                  {analyzing ? 'AI Analyzing Document...' : 'Analysis Results'}
                </h3>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', lineHeight: '1.65', color: '#e5e7eb', fontSize: '0.95rem' }}>
              {analyzing ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem', color: '#9ca3af' }}>
                  <Sparkles size={32} className="pulse-glow" color="#818cf8" />
                  <span>Processing context and compiling answer from document...</span>
                </div>
              ) : analysisResult ? (
                <ReactMarkdown>{analysisResult}</ReactMarkdown>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#6b7280', gap: '0.75rem' }}>
                  <FileText size={40} color="rgba(255, 255, 255, 0.15)" />
                  <p>Select an analysis action from the left toolbox or ask a question about your uploaded document.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      ) : (
        /* Empty State */
        <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', flex: 1, justifyContent: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'rgba(99, 102, 241, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.5rem'
          }}>
            <FileText size={32} color="#818cf8" />
          </div>
          <h3 style={{ fontSize: '1.25rem', color: '#fff' }}>No Document Ingested Yet</h3>
          <p style={{ color: '#9ca3af', maxWidth: '450px', fontSize: '0.9rem', lineHeight: '1.5' }}>
            Upload a PDF, DOCX, or TXT document above to start summarizing, asking strict context-bound questions, or extracting key info.
          </p>
        </div>
      )}
    </div>
  );
};

export default DocumentIntelligence;
