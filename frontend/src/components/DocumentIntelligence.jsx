import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Upload, FileText, CheckCircle, AlertCircle, Sparkles, HelpCircle, FileCheck, Layers, ListChecks } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DocumentIntelligence = ({ apiKey, openAuthModal }) => {
  const { authFetch, isAuthenticated } = useAuth();
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

    if (!isAuthenticated) {
      if (openAuthModal) openAuthModal();
      return;
    }

    setUploading(true);
    setErrorMsg('');
    setAnalysisResult('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await authFetch('http://127.0.0.1:8000/api/document/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (response.status === 401) {
        if (openAuthModal) openAuthModal();
        setErrorMsg('Authentication required. Please sign in.');
        return;
      }

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

    if (!isAuthenticated) {
      if (openAuthModal) openAuthModal();
      return;
    }

    setAnalyzing(true);
    setActiveAction(action);
    setErrorMsg('');

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (apiKey) headers['x-api-key'] = apiKey;

      const response = await authFetch('http://127.0.0.1:8000/api/document/analyze', {
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
            <h2 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '0.25rem' }}>Document Intelligence Hub</h2>
            <p style={{ fontSize: '0.88rem', color: '#64748b' }}>Upload company policies, reports, PDFs, DOCX, or TXT documents for strict AI context extraction.</p>
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
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            color: '#dc2626',
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
            background: 'rgba(79, 70, 229, 0.05)',
            border: '1px solid rgba(79, 70, 229, 0.2)',
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
                background: 'rgba(79, 70, 229, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FileCheck size={24} color="#4f46e5" />
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', color: '#0f172a', fontWeight: 600 }}>{docData.filename}</h4>
                <div style={{ display: 'flex', gap: '0.8rem', fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>
                  <span>Format: <strong style={{ color: '#4f46e5' }}>{docData.ext.toUpperCase()}</strong></span>
                  <span>• Words: <strong>{docData.word_count.toLocaleString()}</strong></span>
                  <span>• Pages: <strong>{docData.pages}</strong></span>
                  <span>• Chars: <strong>{docData.char_count.toLocaleString()}</strong></span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#16a34a', fontSize: '0.82rem', fontWeight: 600 }}>
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
            <h3 style={{ fontSize: '1rem', color: '#0f172a', fontWeight: 600 }}>AI Analysis Actions</h3>
            
            <button
              onClick={() => handleAnalyze('summarize')}
              disabled={analyzing}
              className="btn-secondary"
              style={{
                justifyContent: 'flex-start',
                padding: '0.85rem 1rem',
                border: activeAction === 'summarize' ? '1px solid #4f46e5' : '1px solid #e2e8f0',
                background: activeAction === 'summarize' ? 'rgba(79, 70, 229, 0.08)' : '#ffffff'
              }}
            >
              <FileText size={18} color="#4f46e5" />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>Summarize Document</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Generate executive summary</div>
              </div>
            </button>

            <button
              onClick={() => handleAnalyze('key_topics')}
              disabled={analyzing}
              className="btn-secondary"
              style={{
                justifyContent: 'flex-start',
                padding: '0.85rem 1rem',
                border: activeAction === 'key_topics' ? '1px solid #7c3aed' : '1px solid #e2e8f0',
                background: activeAction === 'key_topics' ? 'rgba(124, 58, 237, 0.08)' : '#ffffff'
              }}
            >
              <Layers size={18} color="#7c3aed" />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>Identify Key Topics</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Extract core concepts & rules</div>
              </div>
            </button>

            <button
              onClick={() => handleAnalyze('extract_info')}
              disabled={analyzing}
              className="btn-secondary"
              style={{
                justifyContent: 'flex-start',
                padding: '0.85rem 1rem',
                border: activeAction === 'extract_info' ? '1px solid #0284c7' : '1px solid #e2e8f0',
                background: activeAction === 'extract_info' ? 'rgba(2, 132, 199, 0.08)' : '#ffffff'
              }}
            >
              <ListChecks size={18} color="#0284c7" />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>Extract Key Information</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Stats, dates, & quantitative data</div>
              </div>
            </button>

            <hr style={{ borderColor: '#e2e8f0', margin: '0.5rem 0' }} />

            {/* Document Q&A Section */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#0f172a', marginBottom: '0.5rem', fontWeight: 600 }}>
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={18} color="#4f46e5" />
                <h3 style={{ fontSize: '1rem', color: '#0f172a', fontWeight: 600 }}>
                  {analyzing ? 'AI Analyzing Document...' : 'Analysis Results'}
                </h3>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', lineHeight: '1.65', color: '#1e293b', fontSize: '0.95rem' }}>
              {analyzing ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem', color: '#64748b' }}>
                  <Sparkles size={32} className="pulse-glow" color="#4f46e5" />
                  <span>Processing context and compiling answer from document...</span>
                </div>
              ) : analysisResult ? (
                <ReactMarkdown>{analysisResult}</ReactMarkdown>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', gap: '0.75rem' }}>
                  <FileText size={40} color="#cbd5e1" />
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
            background: 'rgba(79, 70, 229, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.5rem'
          }}>
            <FileText size={32} color="#4f46e5" />
          </div>
          <h3 style={{ fontSize: '1.25rem', color: '#0f172a' }}>No Document Ingested Yet</h3>
          <p style={{ color: '#64748b', maxWidth: '450px', fontSize: '0.9rem', lineHeight: '1.5' }}>
            Upload a PDF, DOCX, or TXT document above to start summarizing, asking strict context-bound questions, or extracting key info.
          </p>
        </div>
      )}
    </div>
  );
};

export default DocumentIntelligence;
