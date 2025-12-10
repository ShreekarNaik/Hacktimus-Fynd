import { useEffect, useState } from 'react';

export const useCounter = (targetValue: number, duration: number = 1000) => {
  const [value, setValue] = useState(targetValue);

  useEffect(() => {
    let startValue = value;
    const startTime = performance.now();
    
    // Safety check
    if (startValue === targetValue) return;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (easeOutExpo)
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      const current = Math.floor(startValue + (targetValue - startValue) * ease);
      setValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [targetValue, duration]);

  return value;
};
