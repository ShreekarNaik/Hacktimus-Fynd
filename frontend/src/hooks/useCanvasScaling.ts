import { useEffect } from 'react';

export const useCanvasScaling = (canvasRef: React.RefObject<HTMLCanvasElement | null>, width: number, height: number) => {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Handle High DPI
    const dpr = window.devicePixelRatio || 1;
    
    // Set actual size in memory (scaled to account for extra pixel density)
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    
    // Normalize coordinate system to use css pixels
    ctx.scale(dpr, dpr);
    
    // Set visible size
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    
    return () => {
        // Cleanup if needed
    }
  }, [width, height]);
};
