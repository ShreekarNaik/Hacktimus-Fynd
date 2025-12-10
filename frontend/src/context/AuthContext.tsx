import React, { createContext, useContext, useState, useEffect } from 'react';
import client from '../api/client';
import type { AuthState } from '../types';

interface AuthContextType extends AuthState {
  login: (userId: string, password?: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
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
    const storedUserId = localStorage.getItem('userId');
    if (!storedUserId) {
        logout();
        return;
    }

    try {
      const res = await client.get(`/user/${storedUserId}`);
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

  /* 
   * Updated login to accept password. 
   * Note: We are using "pass123" as the mock password in backend.
   */
  const login = async (userId: string, password?: string) => {
    try {
      const res = await client.post('/auth/login', { userId, password });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('userId', user.userId);
      setState({ user, token, isAuthenticated: true, isLoading: false });
    } catch (e: any) {
      console.error('Login failed', e);
      // Re-throw so UI can handle error
      throw e.response?.data?.error || "Login Failed";
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refreshProfile: fetchProfile }}>
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
