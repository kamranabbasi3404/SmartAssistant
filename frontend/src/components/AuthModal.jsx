import React, { useState, useEffect } from 'react';
import { 
  X, Lock, Mail, User, ShieldCheck, LogIn, CheckCircle2, 
  ArrowRight, AlertTriangle, ExternalLink, Eye, EyeOff, ShieldAlert, Sparkles, KeyRound 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AuthModal = ({ isOpen, onClose }) => {
  const { login, register, googleLogin } = useAuth();
  const [mode, setMode] = useState('login'); // 'login', 'signup', 'oauth'
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [verificationData, setVerificationData] = useState(null);

  // Initialize Real Google Identity Services (GSI)
  useEffect(() => {
    if (!isOpen || mode !== 'oauth') return;

    const loadGoogleScript = () => {
      if (document.getElementById('google-gsi-script')) {
        initGoogleSignIn();
        return;
      }
      const script = document.createElement('script');
      script.id = 'google-gsi-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => initGoogleSignIn();
      document.body.appendChild(script);
    };

    const initGoogleSignIn = () => {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: '150770514467-n3n70dgi1jausvqu2qbtoc6sr2je1u9r.apps.googleusercontent.com',
            callback: handleGoogleCredentialResponse,
            auto_select: false
          });

          const targetBtn = document.getElementById('googleSignInContainer');
          if (targetBtn) {
            targetBtn.innerHTML = '';
            window.google.accounts.id.renderButton(targetBtn, {
              theme: 'filled_blue',
              size: 'large',
              width: 340,
              text: 'continue_with',
              shape: 'pill'
            });
          }
        } catch (err) {
          console.warn('Google GSI init warning:', err);
        }
      }
    };

    loadGoogleScript();
  }, [isOpen, mode]);

  if (!isOpen) return null;

  const handleGoogleCredentialResponse = async (response) => {
    if (!response || !response.credential) {
      setError('Failed to receive Google credential token.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await googleLogin(response.credential);
      setSuccess('Authenticated via Real Google OAuth 2.0!');
      setTimeout(() => onClose(), 800);
    } catch (err) {
      setError(err.message || 'Google OAuth 2.0 verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setVerificationData(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
        setSuccess('Welcome back! Logged in successfully.');
        setTimeout(() => onClose(), 600);
      } else if (mode === 'signup') {
        if (!name.trim()) throw new Error('Please enter your full name.');
        const res = await register(name, email, password);
        setVerificationData(res);
        setSuccess('Registration initiated! Confirmation email link generated.');
      }
    } catch (err) {
      setError(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  // Compute password strength for Sign Up
  const getPasswordStrength = () => {
    if (!password) return { score: 0, label: '', color: '#e2e8f0' };
    if (password.length < 6) return { score: 1, label: 'Weak', color: '#ef4444' };
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      return { score: 3, label: 'Strong', color: '#10b981' };
    }
    return { score: 2, label: 'Medium', color: '#f59e0b' };
  };

  const strength = getPasswordStrength();

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(11, 15, 25, 0.82)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      
      {/* Container Card with Ambient Glow & Max Height Viewport Fitting */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '450px',
        maxHeight: 'calc(100vh - 2rem)',
        borderRadius: '24px',
        background: '#ffffff',
        boxShadow: '0 30px 70px -15px rgba(79, 70, 229, 0.35), 0 0 0 1px rgba(226, 232, 240, 0.8)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        animation: 'fadeInScale 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        
        {/* Top Decorative Banner Header (Fixed Header) */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
          padding: '1.25rem 1.5rem 1.15rem 1.5rem',
          color: '#ffffff',
          position: 'relative',
          flexShrink: 0,
          overflow: 'hidden'
        }}>
          {/* Subtle Ambient Glow Circles */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '160px',
            height: '160px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.4) 0%, rgba(0,0,0,0) 70%)',
            pointerEvents: 'none'
          }} />

          {/* Close Button */}
          <button
            onClick={onClose}
            title="Close Modal"
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'}
          >
            <X size={16} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
            <div style={{
              background: 'rgba(99, 102, 241, 0.25)',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              padding: '0.2rem 0.55rem',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
              color: '#818cf8',
              textTransform: 'uppercase'
            }}>
              <ShieldCheck size={13} color="#818cf8" />
              <span>Enterprise Authorization</span>
            </div>
          </div>

          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 0.15rem 0', letterSpacing: '-0.02em', color: '#ffffff' }}>
            {mode === 'login' && 'Welcome Back'}
            {mode === 'signup' && 'Create Your Account'}
            {mode === 'oauth' && 'Google Single Sign-On'}
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0, lineHeight: 1.3 }}>
            {mode === 'login' && 'Sign in to access your AI Smart Assistant workspace'}
            {mode === 'signup' && 'Register email for instant AI assistant access'}
            {mode === 'oauth' && 'Fast 1-click authentication with Google OAuth 2.0'}
          </p>
        </div>

        {/* Modal Content Body (Scrollable Body) */}
        <div style={{ padding: '1.25rem 1.5rem', flex: 1, overflowY: 'auto' }}>
          
          {/* Segmented Control Pill Navigation */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            background: '#f1f5f9',
            padding: '3px',
            borderRadius: '14px',
            marginBottom: '1.15rem',
            border: '1px solid #e2e8f0'
          }}>
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); setVerificationData(null); }}
              style={{
                padding: '0.5rem 0.4rem',
                border: 'none',
                borderRadius: '10px',
                fontSize: '0.825rem',
                fontWeight: 700,
                cursor: 'pointer',
                background: mode === 'login' ? '#ffffff' : 'transparent',
                color: mode === 'login' ? '#4f46e5' : '#64748b',
                boxShadow: mode === 'login' ? '0 3px 8px rgba(15, 23, 42, 0.08)' : 'none',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.3rem'
              }}
            >
              <LogIn size={14} /> Log In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(''); setVerificationData(null); }}
              style={{
                padding: '0.5rem 0.4rem',
                border: 'none',
                borderRadius: '10px',
                fontSize: '0.825rem',
                fontWeight: 700,
                cursor: 'pointer',
                background: mode === 'signup' ? '#ffffff' : 'transparent',
                color: mode === 'signup' ? '#4f46e5' : '#64748b',
                boxShadow: mode === 'signup' ? '0 3px 8px rgba(15, 23, 42, 0.08)' : 'none',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.3rem'
              }}
            >
              <User size={14} /> Sign Up
            </button>
            <button
              type="button"
              onClick={() => { setMode('oauth'); setError(''); setVerificationData(null); }}
              style={{
                padding: '0.5rem 0.4rem',
                border: 'none',
                borderRadius: '10px',
                fontSize: '0.825rem',
                fontWeight: 700,
                cursor: 'pointer',
                background: mode === 'oauth' ? '#ffffff' : 'transparent',
                color: mode === 'oauth' ? '#4f46e5' : '#64748b',
                boxShadow: mode === 'oauth' ? '0 3px 8px rgba(15, 23, 42, 0.08)' : 'none',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.3rem'
              }}
            >
              <KeyRound size={14} /> Google
            </button>
          </div>

          {/* Error Banner Callout */}
          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              padding: '0.75rem 0.85rem',
              borderRadius: '12px',
              fontSize: '0.825rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.55rem',
              lineHeight: 1.35
            }}>
              <ShieldAlert size={18} style={{ flexShrink: 0, color: '#dc2626', marginTop: '1px' }} />
              <div>
                <strong style={{ display: 'block', marginBottom: '1px', color: '#991b1b' }}>Authentication Alert</strong>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Success Banner Callout */}
          {success && !verificationData && (
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#166534',
              padding: '0.75rem 0.85rem',
              borderRadius: '12px',
              fontSize: '0.825rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.55rem',
              fontWeight: 600
            }}>
              <CheckCircle2 size={18} color="#16a34a" />
              <span>{success}</span>
            </div>
          )}

          {/* Email Confirmation Banner Callout */}
          {verificationData && (
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              padding: '1rem',
              borderRadius: '16px',
              marginBottom: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#15803d', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                <CheckCircle2 size={18} color="#16a34a" />
                <span>Verification Link Sent to Email!</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#334155', margin: 0, lineHeight: 1.4 }}>
                We sent an official confirmation link to <strong>{verificationData.email}</strong>. Please check your email inbox and click the button to activate your account.
              </p>
            </div>
          )}

          {mode === 'oauth' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '1.25rem 1rem',
                textAlign: 'center',
                width: '100%',
                boxSizing: 'border-box'
              }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '14px',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.6rem auto',
                  boxShadow: '0 3px 8px rgba(0,0,0,0.04)'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                </div>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: '#0f172a' }}>
                  Official Google OAuth 2.0
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, lineHeight: 1.35 }}>
                  Fast single sign-on using your verified Google credentials.
                </p>
              </div>

              {/* Google Sign-In Button Container */}
              <div id="googleSignInContainer" style={{ width: '100%', minHeight: '44px', display: 'flex', justifyContent: 'center' }}></div>

            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              
              {mode === 'signup' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                    Full Name
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="text"
                      placeholder="Alex Developer"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={mode === 'signup'}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.65rem 0.65rem 2.4rem',
                        borderRadius: '12px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.875rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#6366f1';
                        e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.15)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#cbd5e1';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.65rem 0.65rem 2.4rem',
                      borderRadius: '12px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.875rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#6366f1';
                      e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.15)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#cbd5e1';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>
                    Password
                  </label>
                  {mode === 'signup' && password && (
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: strength.color }}>
                      {strength.label}
                    </span>
                  )}
                </div>

                <div style={{ position: 'relative' }}>
                  <Lock size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.65rem 2.4rem 0.65rem 2.4rem',
                      borderRadius: '12px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.875rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#6366f1';
                      e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.15)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#cbd5e1';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>

                {/* Password Strength Indicator Bar */}
                {mode === 'signup' && password && (
                  <div style={{ display: 'flex', gap: '4px', marginTop: '0.35rem' }}>
                    <div style={{ flex: 1, height: '3px', borderRadius: '2px', background: strength.score >= 1 ? strength.color : '#e2e8f0' }} />
                    <div style={{ flex: 1, height: '3px', borderRadius: '2px', background: strength.score >= 2 ? strength.color : '#e2e8f0' }} />
                    <div style={{ flex: 1, height: '3px', borderRadius: '2px', background: strength.score >= 3 ? strength.color : '#e2e8f0' }} />
                  </div>
                )}
              </div>

              {/* Security Banner Note */}
              {mode === 'login' && (
                <div style={{
                  fontSize: '0.75rem',
                  color: '#475569',
                  background: '#f8fafc',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem'
                }}>
                  <ShieldCheck size={15} color="#6366f1" style={{ flexShrink: 0 }} />
                  <span>5 failed attempts will trigger an automatic <strong>24h account freeze</strong>.</span>
                </div>
              )}

              {/* Primary Action Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #d946ef 100%)',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 6px 16px -3px rgba(79, 70, 229, 0.4)',
                  transition: 'all 0.2s ease',
                  marginTop: '0.15rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 10px 20px -3px rgba(79, 70, 229, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 6px 16px -3px rgba(79, 70, 229, 0.4)';
                }}
              >
                {loading ? 'Processing Authentication...' : (mode === 'login' ? 'Log In to Account' : 'Create Account & Send Verification Email')}
                <ArrowRight size={17} />
              </button>

              {/* Mode Switcher Toggle Links */}
              <div style={{ textAlign: 'center', marginTop: '0.35rem' }}>
                {mode === 'login' ? (
                  <span style={{ fontSize: '0.825rem', color: '#64748b' }}>
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => { setMode('signup'); setError(''); setVerificationData(null); }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#4f46e5',
                        fontSize: '0.825rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      Sign Up
                    </button>
                  </span>
                ) : (
                  <span style={{ fontSize: '0.825rem', color: '#64748b' }}>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => { setMode('login'); setError(''); setVerificationData(null); }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#4f46e5',
                        fontSize: '0.825rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      Log In
                    </button>
                  </span>
                )}
              </div>

            </form>
          )}

        </div>

        {/* Modal Security Footer (Fixed Footer) */}
        <div style={{
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          padding: '0.75rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.725rem',
          color: '#64748b',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Lock size={12} color="#16a34a" />
            <span>256-bit Encrypted SSL</span>
          </div>
          <span>FastAPI OAuth 2.0 Security</span>
        </div>

      </div>
    </div>
  );
};

export default AuthModal;
