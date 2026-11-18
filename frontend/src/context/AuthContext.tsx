/**
 * TIME-MATE - Authentication Context & Session Provider
 * 
 * Manages the current authenticated student state, JWT token persistence
 * in browser localStorage (`bt_token`), automatic session hydration on mount,
 * and session termination (logout).
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

/**
 * Shape of the authentication context exposed to consumers.
 */
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => void;
  updateUserLocal: (name: string) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * On initial mount, inspects localStorage for an existing JWT token.
   * If found, calls /api/auth/me to re-hydrate the user profile.
   */
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('bt_token');
      if (token) {
        try {
          const res = await api.auth.getMe();
          setUser(res.user);
        } catch (err) {
          console.warn('[AuthContext] Session expired or invalid token. Removing local token.');
          localStorage.removeItem('bt_token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  /**
   * Submits credentials to /api/auth/login, stores token, and updates user state.
   */
  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const res = await api.auth.login({ email, password });
      localStorage.setItem('bt_token', res.token);
      setUser(res.user);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in.');
      throw err;
    }
  };

  /**
   * Registers a new student account, persists token, and establishes user session.
   */
  const signup = async (name: string, email: string, password: string, confirmPassword: string) => {
    setError(null);
    try {
      const res = await api.auth.signup({ name, email, password, confirmPassword });
      localStorage.setItem('bt_token', res.token);
      setUser(res.user);
    } catch (err: any) {
      setError(err.message || 'Failed to create account.');
      throw err;
    }
  };

  /**
   * Signs out the user, removes the JWT token, and resets state.
   */
  const logout = () => {
    api.auth.logout();
    setUser(null);
  };

  /**
   * Updates local student name without needing a full re-fetch.
   */
  const updateUserLocal = (name: string) => {
    if (user) {
      setUser({ ...user, name });
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, signup, logout, updateUserLocal, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to access authentication context.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
