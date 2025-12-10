import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button3D from '../components/Button3D';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [userId, setUserId] = useState('test-user');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await login(userId);
      navigate('/');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-game-bg flex items-center justify-center p-4 overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 bg-game-bg opacity-50" 
           style={{
             backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(255, 255, 255, 0.4) 2px, transparent 2.5px), radial-gradient(circle at 90% 80%, rgba(255, 255, 255, 0.4) 2px, transparent 2.5px)',
             backgroundSize: '40px 40px'
           }}></div>

      <div className="bg-panel-bg border-4 border-white rounded-[30px] p-8 w-full max-w-sm text-center shadow-xl relative z-10 animate-bounce-in">
        <div className="text-6xl mb-4 animate-bounce">🎮</div>
        <h1 className="font-titan text-5xl text-orange-400 text-stroke-white mb-2 drop-shadow-md" style={{ WebkitTextStroke: '2px white' }}>
          FYND<br/>GAMES
        </h1>
        <p className="font-nunito font-bold text-gray-500 uppercase tracking-widest mb-8">
          Play . Win . Shop
        </p>

        <div className="mb-6">
           <input 
             type="text" 
             value={userId}
             onChange={(e) => setUserId(e.target.value)}
             className="w-full p-4 rounded-xl border-2 border-gray-300 font-nunito font-bold text-gray-700 focus:outline-none focus:border-orange-400 bg-white"
             placeholder="Username"
           />
        </div>

        <Button3D 
          label={loading ? "Loading..." : "START PLAYING"} 
          onClick={handleLogin}
          variant="green"
          disabled={loading}
        />
        
        <div className="mt-4 text-xs font-nunito font-bold text-gray-400">
          POWERED BY BOLTIC & FYND
        </div>
      </div>
    </div>
  );
};

export default Login;
