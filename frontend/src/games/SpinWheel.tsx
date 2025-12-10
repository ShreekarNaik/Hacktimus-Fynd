import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button3D from '../components/Button3D';
import Layout from '../components/Layout';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';

const SEGMENTS = [
  { label: 'TRY AGAIN', color: '#95a5a6', value: 0 },
  { label: '5% OFF', color: '#3498db', value: 5 },
  { label: '10 COINS', color: '#f1c40f', value: 0, coins: 10 },
  { label: '10% OFF', color: '#e74c3c', value: 10 },
  { label: 'TRY AGAIN', color: '#95a5a6', value: 0 },
  { label: '20 COINS', color: '#f1c40f', value: 0, coins: 20 },
  { label: '50% OFF', color: '#9b59b6', value: 50 },
  { label: 'TRY AGAIN', color: '#95a5a6', value: 0 },
];

const SpinWheel = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [spinning, setSpinning] = useState(false);
  const spinningRef = useRef(false); // Ref for loop access
  const [result, setResult] = useState<any>(null);
  
  // New States for Modal UX
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  
  // Animation state
  const rotation = useRef(0);
  const velocity = useRef(0);
  const requestRef = useRef<number>(0);

  useEffect(() => {
    drawWheel();
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Scale for DPI
    const dpr = window.devicePixelRatio || 1;
    // We want logical size 280x280
    const logicalSize = 280;
    
    if (canvas.width !== logicalSize * dpr) {
        canvas.width = logicalSize * dpr;
        canvas.height = logicalSize * dpr;
        canvas.style.width = `${logicalSize}px`;
        canvas.style.height = `${logicalSize}px`;
        ctx.scale(dpr, dpr);
    }
    
    const w = logicalSize;
    const h = logicalSize;
    
    const cx = w/2;
    const cy = h/2;
    const radius = Math.min(w, h)/2 - 10;
    
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation.current);
    
    const arc = (Math.PI * 2) / SEGMENTS.length;
    
    SEGMENTS.forEach((seg, i) => {
        ctx.beginPath();
        ctx.fillStyle = seg.color;
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, i * arc, (i+1) * arc);
        ctx.fill();
        ctx.stroke();
        
        ctx.save();
        ctx.rotate(i * arc + arc/2);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Nunito';
        ctx.textAlign = 'right';
        ctx.fillText(seg.label, radius - 20, 5);
        ctx.restore();
    });
    ctx.restore();
    
    // Pointer
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.moveTo(cx + 15, cy - radius - 5);
    ctx.lineTo(cx - 15, cy - radius - 5);
    ctx.lineTo(cx, cy - radius + 25);
    ctx.fill();
  };

  const animate = () => {
      rotation.current += velocity.current;
      velocity.current *= 0.985; // Friction

      // Check ref, not state, to avoid stale closure issues
      if (velocity.current < 0.002 && spinningRef.current) {
          console.log("Stopping spin... Velocity:", velocity.current);
          stopSpin();
      } else {
          drawWheel();
          requestRef.current = requestAnimationFrame(animate);
      }
  };

  const startSpin = async () => {
      console.log("Start Spin clicked");
      if (spinningRef.current || submitting) return;
      
      setSpinning(true);
      spinningRef.current = true;
      setResult(null);
      
      try {
           const res = await client.post('/games/start', { userId: user?.userId, gameName: 'spin' });
           setCurrentSessionId(res.data.sessionId);
           console.log("Session started:", res.data.sessionId);
           
           velocity.current = 0.5 + Math.random() * 0.3; // Initial kick
           requestRef.current = requestAnimationFrame(animate); 
      } catch(e) {
           console.error("Failed to start session", e);
           setSpinning(false);
           spinningRef.current = false;
           alert("Could not start game. Please try again.");
      }
  };
  
  const stopSpin = async () => {
      console.log("stopSpin called");
      cancelAnimationFrame(requestRef.current);
      
      setSpinning(false);
      spinningRef.current = false;
      
      setSubmitting(true);
      setShowModal(true);
      console.log("States updated: spinning=false, submitting=true, showModal=true");
      
      // Determine winner based on angle
      const arc = (Math.PI * 2) / SEGMENTS.length;
      const angle = rotation.current % (Math.PI * 2);
      const totalRot = (Math.PI * 2) - angle + (Math.PI * 1.5); // align top
      const normalizedRot = totalRot % (Math.PI * 2);
      const index = Math.floor(normalizedRot / arc) % SEGMENTS.length;
      
      const wonItem = SEGMENTS[index];
      
      let score = wonItem.value > 0 ? 100 : 10;
      
      try {
          // Use actual session ID if available, else fallback
          const sid = currentSessionId || `sim-${Date.now()}`;
          const res = await client.post('/games/submit', { 
            sessionId: sid, 
            score 
          });
          
          setResult({
              ...res.data,
              item: wonItem
          });
      } catch(e) {
          console.error(e);
          // Fallback result for demo if backend fails
          setResult({
              item: wonItem,
              coinsEarned: score * 0.1,
              reward: null
          });
      } finally {
          setSubmitting(false);
      }
      
      drawWheel();
  };

  return (
    <Layout>
      <div className="text-center p-4">
        <h1 className="font-titan text-4xl text-purple-500 mb-4 drop-shadow-sm">SPIN WHEEL</h1>
        
        <div className="relative w-[300px] h-[300px] mx-auto mb-8 bg-white rounded-full shadow-xl border-8 border-purple-100 p-1">
             <canvas ref={canvasRef} width={280} height={280} />
        </div>
        
        {!spinning && !submitting && (
            <Button3D label="SPIN NOW" onClick={startSpin} variant="blue" />
        )}
        
        {spinning && (
            <div className="font-titan text-2xl text-gray-400 animate-pulse">SPINNING...</div>
        )}
        
        <Modal isOpen={showModal}>
             <div className="p-6 text-center w-full">
                 {submitting && (
                     <div className="flex flex-col items-center animate-pulse py-8">
                         <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin mb-4"></div>
                         <h3 className="font-titan text-2xl text-gray-400">CHECKING LUCK...</h3>
                     </div>
                 )}
                 
                 {!submitting && result && (
                     <div className="animate-bounce-in">
                         <h3 className="font-titan text-4xl text-purple-600 mb-2 drop-shadow-sm">
                             {result.item.label === 'TRY AGAIN' ? 'OOPS!' : 'YOU WON!'}
                         </h3>
                         <p className="font-bold text-gray-500 text-lg mb-6">{result.item.label}</p>
                         
                         {result.reward && (
                             <div className="bg-yellow-100 p-4 rounded-xl mb-6 text-yellow-800 font-bold border-2 border-yellow-300 border-dashed relative overflow-hidden">
                                 <div className="text-xs uppercase mb-1 opacity-70">Coupon Code</div>
                                 <div className="text-2xl font-black tracking-widest">{result.reward.couponCode}</div>
                                 <div className="text-sm mt-1">{result.reward.discountPercentage}% OFF</div>
                             </div>
                         )}
                         
                         <div className="space-y-3">
                             <Button3D label="SPIN AGAIN" onClick={() => { setShowModal(false); setResult(null); }} variant="green" />
                             <button onClick={() => navigate('/')} className="block w-full text-gray-400 font-bold text-sm underline hover:text-gray-600">EXIT GAME</button>
                         </div>
                     </div>
                 )}
             </div>
        </Modal>
      </div>
    </Layout>
  );
};
export default SpinWheel;
