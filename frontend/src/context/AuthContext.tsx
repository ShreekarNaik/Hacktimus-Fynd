import React, { createContext, useContext, useState, useEffect } from 'react';
import client from '../api/client';
import type { AuthState } from '../types';

interface AuthContextType extends AuthState {
  login: (userId: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    isLoading: true,
  });

  const fetchProfile = async () => {
    try {
      const res = await client.get('/user/profile');
      setState(prev => ({ ...prev, user: res.data, isAuthenticated: true, isLoading: false }));
    } catch (e) {
      console.error('Failed to fetch profile', e);
      logout();
    }
  };

  useEffect(() => {
    if (state.token) {
      fetchProfile();
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.token]);

  const login = async (userId: string) => {
    const res = await client.post('/auth/login', { userId });
    const { token, user } = res.data;
    localStorage.setItem('token', token);
    setState({ user, token, isAuthenticated: true, isLoading: false });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
