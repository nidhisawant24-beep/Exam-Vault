import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axiosClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('examvault_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  
  const [token, setToken] = useState(() => localStorage.getItem('examvault_token') || null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('examvault_theme') === 'dark';
  });

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('examvault_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('examvault_theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  // Check current session validity
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
          localStorage.setItem('examvault_user', JSON.stringify(res.data.user));
        } catch (err) {
          console.warn('Session verification failed:', err);
          logout();
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, [token]);

  // Inactivity auto-logout (15 minutes)
  useEffect(() => {
    if (!token) return;

    let timeoutId;
    const INACTIVITY_TIME = 15 * 60 * 1000;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        alert('Your session has timed out due to 15 minutes of inactivity. For security, you have been logged out.');
        logout();
      }, INACTIVITY_TIME);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(evt => window.addEventListener(evt, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach(evt => window.removeEventListener(evt, resetTimer));
    };
  }, [token]);

  const registerUser = async (formData) => {
    const res = await api.post('/auth/register', formData);
    return res.data;
  };

  const loginInit = async (identifier, password) => {
    const res = await api.post('/auth/login-init', { identifier, password });
    if (res.data.require_otp === false && res.data.token) {
      const { token: jwtToken, user: userData } = res.data;
      setToken(jwtToken);
      setUser(userData);
      localStorage.setItem('examvault_token', jwtToken);
      localStorage.setItem('examvault_user', JSON.stringify(userData));
    }
    return res.data;
  };

  const loginVerifyOtp = async (identifier, otp) => {
    const res = await api.post('/auth/login-verify-otp', { identifier, otp });
    const { token: jwtToken, user: userData } = res.data;
    setToken(jwtToken);
    setUser(userData);
    localStorage.setItem('examvault_token', jwtToken);
    localStorage.setItem('examvault_user', JSON.stringify(userData));
    return userData;
  };

  const resendOtp = async (identifier) => {
    const res = await api.post('/auth/resend-otp', { identifier });
    return res.data;
  };

  const logout = useCallback(async () => {
    try {
      if (token) {
        await api.post('/auth/logout');
      }
    } catch (e) {
      // ignore
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('examvault_token');
      localStorage.removeItem('examvault_user');
    }
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        darkMode,
        toggleDarkMode,
        registerUser,
        loginInit,
        loginVerifyOtp,
        resendOtp,
        logout,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === 'admin',
        isFaculty: user?.role === 'faculty',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
