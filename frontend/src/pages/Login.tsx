import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button3D from '../components/Button3D';

const Login: React.FC = () => {
  const { loginWithOtp, register, sendOtp } = useAuth();
  const navigate = useNavigate();
  
  const [isRegistering, setIsRegistering] = useState(false);
  const [step, setStep] = useState<'ID' | 'OTP'>('ID');
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [username, setUsername] = useState('');
  const [otp, setOtp] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
        setError("Please enter a valid Phone Number");
        return;
    }
    if (isRegistering && !username) {
        setError("Please enter a Username");
        return;
    }

    setLoading(true);
    setError('');
    try {
        await sendOtp(phoneNumber);
        setStep('OTP');
    } catch (err: any) {
        console.error(err);
        setError("Failed to send OTP");
    } finally {
        setLoading(false);
    }
  };

  const handleAuth = async () => {
    if (!otp) {
        setError("Please enter OTP");
        return;
    }
    setLoading(true);
    setError('');
    try {
      if (isRegistering) {
          await register(phoneNumber, username, otp);
      } else {
          await loginWithOtp(phoneNumber, otp);
      }
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError(typeof err === 'string' ? err : 'Authentication Failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
      setIsRegistering(!isRegistering);
      setStep('ID');
      setOtp('');
      setError('');
      // Keep phone number if user switches mode, but clear username
      setUsername(''); 
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
          {isRegistering ? "Join the Fun" : "Play . Win . Shop"}
        </p>

        <div className="space-y-4 mb-6">
           {isRegistering && step === 'ID' && (
               <input 
                 type="text" 
                 value={username}
                 onChange={(e) => setUsername(e.target.value)}
                 className="w-full p-4 rounded-xl border-2 border-gray-300 font-nunito font-bold text-gray-700 focus:outline-none focus:border-orange-400 bg-white shadow-inner animate-fade-in"
                 placeholder="Choose a Username"
               />
           )}

           <input 
             type="text" 
             value={phoneNumber}
             onChange={(e) => setPhoneNumber(e.target.value)}
             className="w-full p-4 rounded-xl border-2 border-gray-300 font-nunito font-bold text-gray-700 focus:outline-none focus:border-orange-400 bg-white shadow-inner"
             placeholder="Phone Number"
             disabled={step === 'OTP'}
           />
           
           {step === 'OTP' && (
               <input 
                 type="text" 
                 value={otp}
                 onChange={(e) => setOtp(e.target.value)}
                 className="w-full p-4 rounded-xl border-2 border-gray-300 font-nunito font-bold text-gray-700 focus:outline-none focus:border-orange-400 bg-white shadow-inner animate-fade-in"
                 placeholder="Enter OTP (Any)"
               />
           )}
        </div>
        
        {error && (
            <div className="bg-red-100 text-red-500 font-bold p-3 rounded-xl mb-4 text-sm animate-pulse">
                ⚠️ {error}
            </div>
        )}

        {step === 'ID' ? (
            <Button3D 
              label={loading ? "SENDING..." : "SEND OTP"} 
              onClick={handleSendOtp}
              variant="blue"
              disabled={loading}
            />
        ) : (
            <Button3D 
              label={loading ? "VERIFYING..." : (isRegistering ? "SIGN UP" : "START PLAYING")} 
              onClick={handleAuth}
              variant="green"
              disabled={loading}
            />
        )}
        
        <div className="mt-6">
            <button 
                onClick={toggleMode}
                className="text-gray-500 font-bold underline hover:text-orange-500 transition-colors"
            >
                {isRegistering ? "Already have an account? Login" : "New User? Sign Up"}
            </button>
        </div>
        
        <div className="mt-4 text-xs font-nunito font-bold text-gray-400">
          POWERED BY BOLTIC & FYND
        </div>
      </div>
    </div>
  );
};

export default Login;
