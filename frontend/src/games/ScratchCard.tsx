import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button3D from '../components/Button3D';
import Layout from '../components/Layout';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

const ScratchCard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [revealed, setRevealed] = useState(false);
    const [prize, setPrize] = useState<any>(null); // { label: '...', coins: 10, reward: ... }
    const [isDrawing, setIsDrawing] = useState(false);

    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

    useEffect(() => {
        setupCard();
        determinePrize();
        // Start game session immediately on load
        client.post('/games/start', { userId: user?.userId, gameName: 'scratch' })
              .then(res => setCurrentSessionId(res.data.sessionId))
              .catch(console.error);
    }, []);

    const determinePrize = async () => {
        // In real app, we might fetch this secure token
        // Here we simulate
        const roll = Math.random();
        let p = { label: 'BETTER LUCK NEXT TIME', value: 0 };
        if (roll > 0.8) p = { label: '50% OFF', value: 50 };
        else if (roll > 0.5) p = { label: '100 COINS', value: 0 };
        else if (roll > 0.3) p = { label: '10% OFF', value: 10 };
        setPrize(p);
    };

    const setupCard = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const dpr = window.devicePixelRatio || 1;
        const width = 300;
        const height = 150;
        
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        
        ctx.scale(dpr, dpr);
        
        ctx.fillStyle = '#b0c4de'; // Silver scratch layer
        ctx.fillRect(0, 0, width, height);
        
        // Add pattern or text
        ctx.fillStyle = '#a0b3cd';
        ctx.font = '20px Nunito';
        ctx.textAlign = 'center';
        for(let i=0; i<10; i++) {
            ctx.fillText("SCRATCH ME", Math.random()*width, Math.random()*height);
        }
    };

    const handleMove = (e: any) => {
        if (!isDrawing || revealed) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const x = (clientX - rect.left); 
        const y = (clientY - rect.top);

        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fill();

        checkReveal();
    };

    const checkReveal = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        if (Math.random() < 0.1) { // 10% chance to check to save perf
             const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height); 
             const data = imageData.data;
             let clearCount = 0;
             for(let i=3; i<data.length; i+=4) {
                 if(data[i] === 0) clearCount++;
             }
             
             if (clearCount / (canvas.width * canvas.height) > 0.5) {
                 finishScratch();
             }
        }
    };
    
    const finishScratch = async () => {
        setRevealed(true);
        // Clear all
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx) {
             ctx.clearRect(0,0,300,150); 
        }
        
        try {
            const score = prize.value > 0 || prize.label.includes('COINS') ? 100 : 0;
            if (currentSessionId) {
                await client.post('/games/submit', {
                    sessionId: currentSessionId,
                    score
                });
            }
        } catch(e) {}
    };

    return (
        <Layout>
            <div className="flex flex-col items-center p-8">
                 <h1 className="font-titan text-4xl text-blue-500 mb-8">LUCKY SCRATCH</h1>
                 
                 <div className="relative w-[300px] h-[150px] bg-white rounded-lg shadow-xl overflow-hidden mb-8 border-4 border-blue-200">
                     {/* Hidden Prize Layer */}
                     <div className="absolute inset-0 flex items-center justify-center bg-stripes-blue">
                         <div className="text-center animate-pulse">
                             <h3 className="font-black text-2xl text-gray-700">{prize?.label || '...'}</h3>
                             {revealed && <div className="text-sm font-bold text-green-500 mt-2">CLAIMED!</div>}
                         </div>
                     </div>
                     
                     {/* Canvas Layer */}
                     <canvas 
                        ref={canvasRef}
                        width={300} 
                        height={150}
                        className={`absolute inset-0 cursor-crosshair ${revealed ? 'pointer-events-none opacity-0 transition-opacity duration-500' : ''}`}
                        onMouseDown={() => setIsDrawing(true)}
                        onMouseUp={() => setIsDrawing(false)}
                        onMouseMove={handleMove}
                        onTouchStart={() => setIsDrawing(true)}
                        onTouchEnd={() => setIsDrawing(false)}
                        onTouchMove={handleMove}
                     />
                 </div>
                 
                 {revealed && (
                     <div className="animate-bounce-in">
                         <Button3D label="PLAY AGAIN" onClick={() => {
                             setRevealed(false);
                             setupCard();
                             determinePrize();
                             setIsDrawing(false);
                             // Start new session
                             client.post('/games/start', { userId: user?.userId, gameName: 'scratch' })
                                  .then(res => setCurrentSessionId(res.data.sessionId))
                                  .catch(console.error);
                         }} variant="green" />
                     </div>
                 )}
                 
                 {!revealed && (
                     <p className="text-gray-400 font-bold text-sm animate-pulse">Scratch the silver area to reveal!</p>
                 )}
                 <button onClick={() => navigate('/')} className="mt-8 text-blue-300 font-bold underline">BACK TO HOME</button>
            </div>
        </Layout>
    );
};
export default ScratchCard;
