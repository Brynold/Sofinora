import React, { useEffect, useRef } from 'react';

interface AnimatedNumbersProps {
  value: string;
  duration?: number;
}

const AnimatedNumbers: React.FC<AnimatedNumbersProps> = ({ value, duration = 1000 }) => {
  const elementRef = useRef<HTMLSpanElement>(null);
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    const endValue = parseFloat(value.replace(/,/g, ''));
    const startValue = 0;
    const startTime = performance.now();
    
    const updateNumber = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      
      if (elapsedTime < duration) {
        const progress = elapsedTime / duration;
        const currentValue = Math.floor(startValue + progress * (endValue - startValue));
        element.textContent = currentValue.toLocaleString();
        requestAnimationFrame(updateNumber);
      } else {
        element.textContent = endValue.toLocaleString();
      }
    };
    
    requestAnimationFrame(updateNumber);
  }, [value, duration]);
  
  return <span ref={elementRef}>{value}</span>;
};

export default AnimatedNumbers; 