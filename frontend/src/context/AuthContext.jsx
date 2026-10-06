import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const API_BASE_URL = 'http://127.0.0.1:8000/api';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000; // 7 Days in Milliseconds

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('AUTH_TOKEN') || null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('AUTH_USER');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);
  const [verifyNotice, setVerifyNotice] = useState(null);

  const saveAuthData = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('AUTH_TOKEN', newToken);
    localStorage.setItem('AUTH_USER', JSON.stringify(newUser));
    localStorage.setItem('AUTH_LOGIN_TIMESTAMP', Date.now().toString());
  };

  const logout = (showNotice = true) => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('AUTH_TOKEN');
    localStorage.removeItem('AUTH_USER');
    localStorage.removeItem('AUTH_LOGIN_TIMESTAMP');
    if (showNotice) {
      setVerifyNotice({
        type: 'info',
        message: '👋 Signed Out: You have been logged out successfully.'
      });
    }
  };


  // Validate token and check 7-day expiration
  useEffect(() => {
    const initAuth = async () => {
      // 1. Check if URL contains ?verify_token=...
      const urlParams = new URLSearchParams(window.location.search);
      const verifyToken = urlParams.get('verify_token');

      if (verifyToken) {
        try {
          const res = await fetch(`${API_BASE_URL}/auth/verify-email?token=${verifyToken}`);
          const data = await res.json();
          if (res.ok && data.access_token) {
            saveAuthData(data.access_token, data.user);
            setVerifyNotice({ type: 'success', message: '🎉 Email verified successfully! 7-Day session started.' });
          } else {
            setVerifyNotice({ type: 'error', message: data.detail || 'Failed to verify email.' });
          }
        } catch (err) {
          setVerifyNotice({ type: 'error', message: 'Network error during email verification.' });
        } finally {
          window.history.replaceState({}, document.title, window.location.pathname);
          setLoading(false);
          return;
        }
      }

      // 2. Check 7-Day Expiration Timestamp
      const loginTimestamp = localStorage.getItem('AUTH_LOGIN_TIMESTAMP');
      if (loginTimestamp) {
        const elapsed = Date.now() - parseInt(loginTimestamp, 10);
        if (elapsed > SEVEN_DAYS_MS) {
          console.log('Session expired: 7 days reached.');
          logout();
          setVerifyNotice({
            type: 'error',
            message: '🔒 Your 7-day login session has expired for security. Please sign in again.'
          });
          setLoading(false);
          return;
        }
      }

      // 3. Validate existing token on backend
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          localStorage.setItem('AUTH_USER', JSON.stringify(data.user));
        } else {
          // Token expired or invalid on server side
          logout();
          setVerifyNotice({
            type: 'error',
            message: '🔒 Your session has expired. Please sign in again.'
          });
        }
      } catch (err) {
        console.warn('Auth verification network error:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Login failed.');
    }
    saveAuthData(data.access_token, data.user);
    return data.user;
  };

  const register = async (name, email, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Registration failed.');
    }
    return data;
  };

  const googleLogin = async (credential) => {
    const res = await fetch(`${API_BASE_URL}/auth/oauth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Google OAuth 2.0 verification failed.');
    }
    saveAuthData(data.access_token, data.user);
    return data.user;
  };

  const authFetch = (url, options = {}) => {
    const headers = { ...options.headers };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return fetch(url, { ...options, headers });
  };

  return (
    <AuthContext.Provider value={{
      token,
      user,
      loading,
      verifyNotice,
      setVerifyNotice,
      isAuthenticated: !!token && !!user,
      login,
      register,
      googleLogin,
      logout,
      authFetch
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
