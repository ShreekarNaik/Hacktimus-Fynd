import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
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

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <GameLayout>
                <Dashboard />
              </GameLayout>
            </ProtectedRoute>
          } />
          <Route path="/game/sandfall" element={<SandFallGame />} />
          <Route path="/game/spin" element={<SpinWheel />} />
          <Route path="/game/scratch" element={<ScratchCard />} />
          <Route path="/game/quiz" element={<Quiz />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
