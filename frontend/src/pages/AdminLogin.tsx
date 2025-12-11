import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { useNavigate } from 'react-router-dom';
import Button3D from '../components/Button3D';

const AdminLogin: React.FC = () => {
  const { login } = useAdmin();
  const navigate = useNavigate();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Please enter both username and password");
      return;
    }

    setLoading(true);
    setError('');
    try {
      await login(username, password);
      navigate('/admin/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(typeof err === 'string' ? err : 'Login Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
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
        <div className="text-6xl mb-4 animate-bounce">🔐</div>
        <h1 className="font-titan text-5xl text-orange-400 text-stroke-white mb-2 drop-shadow-md" style={{ WebkitTextStroke: '2px white' }}>
          ADMIN<br/>PANEL
        </h1>
        <p className="font-nunito font-bold text-gray-500 uppercase tracking-widest mb-8">
          Configuration Portal
        </p>

        <div className="space-y-4 mb-6">
          <input 
            type="text" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full p-4 rounded-xl border-2 border-gray-300 font-nunito font-bold text-gray-700 focus:outline-none focus:border-orange-400 bg-white shadow-inner"
            placeholder="Username"
          />
          
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full p-4 rounded-xl border-2 border-gray-300 font-nunito font-bold text-gray-700 focus:outline-none focus:border-orange-400 bg-white shadow-inner"
            placeholder="Password"
          />
        </div>
        
        {error && (
          <div className="bg-red-100 text-red-500 font-bold p-3 rounded-xl mb-4 text-sm animate-pulse">
            ⚠️ {error}
          </div>
        )}

        <Button3D 
          label={loading ? "LOGGING IN..." : "LOGIN"} 
          onClick={handleLogin}
          variant="blue"
          disabled={loading}
        />
        
        <div className="mt-4 text-xs font-nunito font-bold text-gray-400">
          ADMIN ACCESS ONLY
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
