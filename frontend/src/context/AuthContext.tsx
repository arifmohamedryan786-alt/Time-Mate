import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

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

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('bt_token');
      if (token) {
        try {
          const res = await api.auth.getMe();
          setUser(res.user);
        } catch (err) {
          console.error('Session expired or invalid token');
          localStorage.removeItem('bt_token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

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

  const logout = () => {
    api.auth.logout();
    setUser(null);
  };

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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
