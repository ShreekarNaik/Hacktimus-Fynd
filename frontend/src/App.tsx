import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminProvider, useAdmin } from './context/AdminContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import GameLayout from './components/Layout';
import SandFallGame from './games/SandFall';
import SpinWheel from './games/SpinWheel';
import ScratchCard from './games/ScratchCard';
import Quiz from './games/Quiz';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  return <>{children}</>;
};

const AdminProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAdmin();
  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/admin/login" />;
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <AdminProvider>
        <Router>
          <Routes>
            {/* User Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <GameLayout>
                  <Dashboard />
                </GameLayout>
              </ProtectedRoute>
            } />
            <Route path="/game/sandfall" element={<ProtectedRoute><SandFallGame /></ProtectedRoute>} />
            <Route path="/game/spin" element={<ProtectedRoute><SpinWheel /></ProtectedRoute>} />
            <Route path="/game/scratch" element={<ProtectedRoute><ScratchCard /></ProtectedRoute>} />
            <Route path="/game/quiz" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            
            {/* Admin Routes - Isolated, no navigation from user app */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            } />
          </Routes>
        </Router>
      </AdminProvider>
    </AuthProvider>
  );
}

export default App;
