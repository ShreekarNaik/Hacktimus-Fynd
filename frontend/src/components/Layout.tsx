import React, { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useCounter } from '../hooks/useCounter';
import confetti from 'canvas-confetti';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Animated Balance
  const animatedBalance = useCounter(user?.coinsBalance || 0, 1500);
  const prevBalanceRef = useRef<number | null>(null);

  useEffect(() => {
      // Wait for user to be loaded
      if (user === null || user === undefined) return;

      const current = user.coinsBalance;
      
      // Initialize ref if null (first load)
      if (prevBalanceRef.current === null) {
          prevBalanceRef.current = current;
          return;
      }

      const prev = prevBalanceRef.current;
      
      if (current > prev) {
          // Trigger Confetti from the coin pill position
          const pill = document.getElementById('coin-pill');
          if (pill) {
              const rect = pill.getBoundingClientRect();
              const x = (rect.left + rect.width / 2) / window.innerWidth;
              const y = (rect.top + rect.height / 2) / window.innerHeight;
              
              confetti({
                  particleCount: 30,
                  spread: 60,
                  origin: { x, y },
                  colors: ['#FFD700', '#FFA500', '#ffffff'],
                  disableForReducedMotion: true,
                  zIndex: 100
              });
          }
      }
      prevBalanceRef.current = current;
  }, [user?.coinsBalance]);

  return (
    <div className="min-h-screen bg-game-bg flex flex-col items-center relative overflow-hidden">
       {/* Bg Pattern */}
       <div className="absolute inset-0 z-0 pointer-events-none" 
           style={{
             backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(255, 255, 255, 0.4) 2px, transparent 2.5px), radial-gradient(circle at 90% 80%, rgba(255, 255, 255, 0.4) 2px, transparent 2.5px)',
             backgroundSize: '40px 40px'
           }}></div>

      {/* Header HUD */}
      <div className="w-full max-w-md px-4 pt-6 z-10 flex justify-between items-center mb-4">
        
        {/* Profile / Balance Pill */}
        <div 
             id="coin-pill"
             className="bg-white/90 backdrop-blur px-2 py-1.5 pr-4 rounded-full shadow-md flex items-center space-x-3 border border-white/50 cursor-pointer hover:scale-105 transition-transform"
             onClick={() => navigate('/profile')}
        >
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 flex items-center justify-center text-white font-black text-xs shadow-inner border-2 border-white">
                 {user?.userId?.charAt(0).toUpperCase() || 'U'}
             </div>
             <div className="flex flex-col">
                 <span className="text-[10px] font-bold text-gray-400 leading-none">BALANCE</span>
                 <span className="text-sm font-black text-gray-800 leading-none flex items-center">
                     {animatedBalance} <span className="text-yellow-500 ml-1">©</span>
                 </span>
             </div>
        </div>

        {/* Buttons Right */}
        <div className="flex space-x-2">
            <button onClick={() => navigate('/leaderboard')} className="w-10 h-10 bg-white/90 rounded-full shadow-md flex items-center justify-center text-xl hover:bg-yellow-50 transition-colors border border-white/50" title="Leaderboard">
                🏆
            </button>
            <button onClick={() => navigate('/')} className="w-10 h-10 bg-white/90 rounded-full shadow-md flex items-center justify-center text-xl hover:bg-blue-50 transition-colors border border-white/50" title="Home">
                🏠
            </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full max-w-md z-10 px-4 pb-8 overflow-y-auto no-scrollbar">
        {children}
      </div>
    </div>
  );
};

export default Layout;
