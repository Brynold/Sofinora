import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';

// Animated value counter component
interface AnimatedCounterProps {
  endValue: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  decimals?: number;
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  endValue,
  prefix = '',
  suffix = '',
  duration = 2,
  decimals = 0,
  className = ''
}) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (isInView) {
      let startTime: number;
      const animateCount = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
        const currentCount = progress * endValue;
        setCount(currentCount);
        
        if (progress < 1) {
          requestAnimationFrame(animateCount);
        }
      };
      
      requestAnimationFrame(animateCount);
    }
  }, [endValue, duration, isInView]);

  return (
    <span ref={ref} className={`animate-count ${className}`}>
      {prefix}
      {count.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
      {suffix}
    </span>
  );
};

// Shimmer effect container
interface ShimmerContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const ShimmerContainer: React.FC<ShimmerContainerProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`shimmer ${className}`}>
      {children}
    </div>
  );
};

// Animated card with entrance animation
interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className = '',
  delay = 0
}) => {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [controls, isInView]);

  return (
    <motion.div
      ref={ref}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      initial="hidden"
      animate={controls}
      transition={{
        duration: 0.5,
        delay: delay,
        ease: 'easeOut'
      }}
      className={`hover-lift ${className}`}
    >
      {children}
    </motion.div>
  );
};

// Pulsing highlight element
interface PulseHighlightProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
}

export const PulseHighlight: React.FC<PulseHighlightProps> = ({
  children,
  className = '',
  color = 'primary'
}) => {
  return (
    <div className={`pulse-highlight relative ${className}`} style={{ 
      '--highlight-color': `var(--color-${color}-500)` 
    } as React.CSSProperties}>
      {children}
    </div>
  );
};

// Floating element that gently animates
interface FloatingElementProps {
  children: React.ReactNode;
  className?: string;
  amplitude?: number;
  duration?: number;
}

export const FloatingElement: React.FC<FloatingElementProps> = ({
  children,
  className = '',
  amplitude = 10,
  duration = 3
}) => {
  return (
    <motion.div
      className={className}
      animate={{ 
        y: [0, -amplitude, 0, amplitude, 0],
        rotate: [0, 2, 0, -2, 0]
      }}
      transition={{ 
        duration,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  );
};

// Typing text animation
interface TypewriterTextProps {
  text: string;
  className?: string;
  speed?: number;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  className = '',
  speed = 50
}) => {
  const [displayText, setDisplayText] = useState('');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  
  useEffect(() => {
    if (isInView) {
      let i = 0;
      const interval = setInterval(() => {
        if (i <= text.length) {
          setDisplayText(text.substring(0, i));
          i++;
        } else {
          clearInterval(interval);
        }
      }, speed);
      
      return () => clearInterval(interval);
    }
  }, [isInView, speed, text]);
  
  return (
    <span ref={ref} className={className}>
      {displayText}
      {displayText.length < text.length && <span className="animate-pulse">|</span>}
    </span>
  );
}; 