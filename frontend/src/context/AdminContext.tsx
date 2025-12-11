import React, { createContext, useContext, useState } from 'react';
import client from '../api/client';
import type { AdminState } from '../types';

interface AdminContextType extends AdminState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AdminState>({
    admin: null,
    token: localStorage.getItem('adminToken'),
    isAuthenticated: !!localStorage.getItem('adminToken'),
    isLoading: false,
  });

  const login = async (username: string, password: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const res = await client.post('/admin/auth/login', { username, password });
      const { token, admin } = res.data;
      localStorage.setItem('adminToken', token);
      setState({ admin, token, isAuthenticated: true, isLoading: false });
    } catch (e: any) {
      setState(prev => ({ ...prev, isLoading: false }));
      console.error('Admin login failed', e);
      throw e.response?.data?.error || "Login Failed";
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setState({ admin: null, token: null, isAuthenticated: false, isLoading: false });
  };

  return (
    <AdminContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
