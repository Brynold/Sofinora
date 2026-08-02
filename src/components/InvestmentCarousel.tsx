import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiArrowRight, FiPause, FiPlay } from 'react-icons/fi';
import { BiLineChart, BiCoinStack, BiWallet, BiBarChartAlt2, BiTrendingUp } from 'react-icons/bi';
import { useTheme } from '../context/ThemeContext';

interface CarouselSlide {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
}

// Cartoon character component for finance-themed mascots
const CartoonCharacter: React.FC<{ type: string; color: string; isDark: boolean }> = ({ type, color, isDark }) => {
  // Different character styles based on the slide type
  const getCharacterVariants = () => {
    switch (type) {
      case 'planner':
        return {
          body: (
            <motion.div 
              className={`w-14 h-14 sm:w-16 sm:h-16 md:w-24 md:h-24 rounded-full ${color.replace('text', 'bg')}/80`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring", 
                stiffness: 260, 
                damping: 20,
                delay: 0.3
              }}
            />
          ),
          eyes: (
            <>
              <motion.div 
                className={`absolute top-1/3 left-1/4 w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 rounded-full bg-white`}
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ delay: 0.5, duration: 0.4 }}
              />
              <motion.div 
                className={`absolute top-1/3 right-1/4 w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 rounded-full bg-white`}
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ delay: 0.5, duration: 0.4 }}
              />
            </>
          ),
          mouth: (
            <motion.div 
              className={`absolute bottom-1/4 left-1/2 w-6 h-1.5 sm:w-8 sm:h-2 md:w-10 md:h-3 bg-white rounded-lg -translate-x-1/2`}
              initial={{ width: 0 }}
              animate={{ width: '40%' }}
              transition={{ delay: 0.6, duration: 0.3 }}
            />
          ),
          accessory: (
            <motion.div 
              className={`absolute -top-1.5 -right-1 w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 ${isDark ? 'border-gray-300' : 'border-gray-700'} border-2 rounded-full border-b-0 border-l-0`}
              initial={{ rotate: -45, opacity: 0 }}
              animate={{ rotate: -45, opacity: 1 }}
              transition={{ delay: 0.7 }}
            />
          )
        };
      case 'tracker':
        return {
          body: (
            <motion.div 
              className={`w-14 h-14 sm:w-16 sm:h-16 md:w-24 md:h-24 ${color.replace('text', 'bg')}/80 rounded-lg`}
              initial={{ rotate: 45, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ 
                type: "spring", 
                stiffness: 200, 
                damping: 15,
                delay: 0.3
              }}
            />
          ),
          eyes: (
            <>
              <motion.div 
                className={`absolute top-1/3 left-1/4 w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 rounded-full bg-white`}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
              />
              <motion.div 
                className={`absolute top-1/3 right-1/4 w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 rounded-full bg-white`}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
              />
            </>
          ),
          mouth: (
            <motion.div 
              className={`absolute bottom-1/4 left-1/2 w-6 h-3 sm:w-8 sm:h-4 md:w-10 md:h-5 -translate-x-1/2 overflow-hidden`}
              initial={{ height: 0 }}
              animate={{ height: '20%' }}
              transition={{ delay: 0.6 }}
            >
              <div className="w-full h-full bg-white rounded-b-full" />
            </motion.div>
          ),
          accessory: (
            <motion.div 
              className={`absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-3 sm:w-8 sm:h-4 md:w-10 md:h-5 ${isDark ? 'border-gray-300' : 'border-gray-700'} border-2 rounded-t-full`}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, type: "spring" }}
            />
          )
        };
      case 'freedom':
        return {
          body: (
            <motion.div 
              className={`w-14 h-14 sm:w-16 sm:h-16 md:w-24 md:h-24 ${color.replace('text', 'bg')}/80`}
              initial={{ borderRadius: '0%' }}
              animate={{ borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%' }}
              transition={{ delay: 0.3, duration: 0.5 }}
            />
          ),
          eyes: (
            <>
              <motion.div 
                className={`absolute top-1/3 left-1/4 w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 bg-white`}
                initial={{ borderRadius: '0%' }}
                animate={{ borderRadius: '50%' }}
                transition={{ delay: 0.5, duration: 0.3 }}
              />
              <motion.div 
                className={`absolute top-1/3 right-1/4 w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 bg-white`}
                initial={{ borderRadius: '0%' }}
                animate={{ borderRadius: '50%' }}
                transition={{ delay: 0.5, duration: 0.3 }}
              />
            </>
          ),
          mouth: (
            <motion.div 
              className={`absolute bottom-1/4 left-1/2 h-2 sm:h-3 md:h-4 bg-white rounded-lg -translate-x-1/2`}
              initial={{ width: 0 }}
              animate={{ width: '50%' }}
              transition={{ 
                delay: 0.6, 
                type: "spring",
                stiffness: 300,
                damping: 10
              }}
            />
          ),
          accessory: (
            <motion.div 
              className={`absolute -top-2 -left-2 w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
              initial={{ rotate: -30, scale: 0 }}
              animate={{ rotate: -30, scale: 1 }}
              transition={{ delay: 0.7, type: "spring" }}
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 1L15 9H21L16 14L18 22L12 17L6 22L8 14L3 9H9L12 1Z" fill="currentColor" />
              </svg>
            </motion.div>
          )
        };
      case 'trends':
        return {
          body: (
            <motion.div 
              className={`w-14 h-14 sm:w-16 sm:h-16 md:w-24 md:h-24 ${color.replace('text', 'bg')}/80 rounded-lg`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ 
                type: "spring", 
                stiffness: 500, 
                damping: 15,
                delay: 0.3
              }}
            />
          ),
          eyes: (
            <>
              <motion.div 
                className={`absolute top-1/3 left-1/4 w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-5 bg-white rounded-full`}
                initial={{ height: 0 }}
                animate={{ height: 20 }}
                transition={{ delay: 0.5, duration: 0.3 }}
              />
              <motion.div 
                className={`absolute top-1/3 right-1/4 w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-5 bg-white rounded-full`}
                initial={{ height: 0 }}
                animate={{ height: 20 }}
                transition={{ delay: 0.55, duration: 0.3 }}
              />
            </>
          ),
          mouth: (
            <motion.div 
              className={`absolute bottom-1/4 left-1/2 w-6 h-1 sm:w-8 sm:h-1 md:w-10 md:h-2 bg-white -translate-x-1/2`}
              initial={{ width: 0 }}
              animate={{ width: '40%' }}
              transition={{ delay: 0.6, duration: 0.3 }}
            />
          ),
          accessory: (
            <motion.div 
              className={`absolute -top-3 left-1/2 -translate-x-1/2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, type: "spring" }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="12" width="4" height="8" rx="1" fill="currentColor" />
                <rect x="10" y="8" width="4" height="12" rx="1" fill="currentColor" />
                <rect x="17" y="4" width="4" height="16" rx="1" fill="currentColor" />
              </svg>
            </motion.div>
          )
        };
      case 'optimize':
        return {
          body: (
            <motion.div 
              className={`w-14 h-14 sm:w-16 sm:h-16 md:w-24 md:h-24 ${color.replace('text', 'bg')}/80`}
              initial={{ borderRadius: 0 }}
              animate={{ 
                borderRadius: ['0%', '50%', '50% 50% 50% 50% / 60% 60% 40% 40%'] 
              }}
              transition={{ 
                delay: 0.3, 
                duration: 0.8,
                times: [0, 0.5, 1]
              }}
            />
          ),
          eyes: (
            <>
              <motion.div 
                className={`absolute top-1/3 left-1/4 w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 rounded-full bg-white`}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: [0, 1, 1, 0.3, 1] }}
                transition={{ delay: 0.5, duration: 1, times: [0, 0.3, 0.5, 0.6, 1] }}
              />
              <motion.div 
                className={`absolute top-1/3 right-1/4 w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 rounded-full bg-white`}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: [0, 1, 1, 0.3, 1] }}
                transition={{ delay: 0.5, duration: 1, times: [0, 0.3, 0.5, 0.6, 1] }}
              />
            </>
          ),
          mouth: (
            <motion.div 
              className={`absolute bottom-1/4 left-1/2 h-2 sm:h-3 md:h-4 bg-white -translate-x-1/2 rounded-lg overflow-hidden`}
              initial={{ width: 0 }}
              animate={{ width: '50%' }}
              transition={{ 
                delay: 0.6, 
                type: "spring",
                stiffness: 400,
                damping: 15
              }}
            >
              <motion.div 
                className="w-full h-full bg-white" 
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                transition={{ delay: 0.8, duration: 0.3 }}
              />
            </motion.div>
          ),
          accessory: (
            <motion.div 
              className={`absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-4 sm:w-10 sm:h-5 md:w-14 md:h-7 ${isDark ? 'border-gray-300' : 'border-gray-700'} border-2 rounded-t-full`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                delay: 0.7, 
                type: "spring",
                stiffness: 200,
                damping: 10
              }}
            />
          )
        };
      default:
        return {
          body: (
            <motion.div 
              className={`w-14 h-14 sm:w-16 sm:h-16 md:w-24 md:h-24 rounded-full ${color.replace('text', 'bg')}/80`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            />
          ),
          eyes: null,
          mouth: null,
          accessory: null
        };
    }
  };

  const characterParts = getCharacterVariants();

  return (
    <motion.div 
      className="relative"
      animate={{ 
        y: [0, -5, 0, -5, 0],
      }}
      transition={{ 
        repeat: Infinity, 
        duration: 5,
        ease: "easeInOut" 
      }}
    >
      {characterParts.body}
      {characterParts.eyes}
      {characterParts.mouth}
      {characterParts.accessory}
    </motion.div>
  );
};

const InvestmentCarousel: React.FC = () => {
  const { theme } = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const isDark = theme === 'dark';
  
  const slides: CarouselSlide[] = [
    {
      title: "Plan Your Financial Future",
      description: "Set clear goals and create a roadmap for your financial success with our comprehensive planning tools.",
      icon: <BiLineChart size={36} className="md:text-[48px]" />,
      color: "text-blue-500",
      gradient: "from-blue-500/20 to-blue-600/5",
    },
    {
      title: "Track Your Investments",
      description: "Monitor your portfolio performance and make informed decisions with real-time tracking and analysis.",
      icon: <BiCoinStack size={36} className="md:text-[48px]" />,
      color: "text-green-500",
      gradient: "from-green-500/20 to-green-600/5",
    },
    {
      title: "Achieve Financial Freedom",
      description: "Build wealth and secure your future with smart planning tools and personalized recommendations.",
      icon: <BiWallet size={36} className="md:text-[48px]" />,
      color: "text-purple-500",
      gradient: "from-purple-500/20 to-purple-600/5",
    },
    {
      title: "Analyze Market Trends",
      description: "Stay ahead of market trends with advanced analytics and detailed performance metrics.",
      icon: <BiBarChartAlt2 size={36} className="md:text-[48px]" />,
      color: "text-amber-500",
      gradient: "from-amber-500/20 to-amber-600/5",
    },
    {
      title: "Optimize Your Strategy",
      description: "Fine-tune your investment strategy with AI-powered recommendations and scenario analysis.",
      icon: <BiTrendingUp size={36} className="md:text-[48px]" />,
      color: "text-pink-500",
      gradient: "from-pink-500/20 to-pink-600/5",
    },
  ];

  const characterTypes = ['planner', 'tracker', 'freedom', 'trends', 'optimize'];

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (isPlaying) {
      interval = setInterval(() => {
        nextSlide();
      }, 5000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, nextSlide]);

  // Animation variants
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
  };

  // Bouncy button variants
  const buttonVariants = {
    idle: { scale: 1 },
    hover: { 
      scale: 1.1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: { scale: 0.9 }
  };

  // To track the drag direction
  const [direction, setPage] = useState<number>(0);

  const updatePage = useCallback(
    (newPage: number, newDirection: number) => {
      setPage(newDirection);
      setCurrentSlide(newPage);
    },
    []
  );

  // Bouncing coin animation
  const BouncingCoin = () => (
    <motion.div 
      className={`absolute -bottom-3 right-4 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full ${slides[currentSlide].color.replace('text-', 'bg-')}/80 border-4 ${isDark ? 'border-gray-700' : 'border-gray-100'} z-10 shadow-lg`}
      initial={{ y: 0 }}
      animate={{ 
        y: [-10, 30, -10], 
        rotate: [0, 10, -10, 10, 0]
      }}
      transition={{ 
        y: { 
          repeat: Infinity, 
          duration: 1.5, 
          ease: "easeInOut",
        },
        rotate: {
          repeat: Infinity,
          duration: 1.5,
          ease: "easeInOut",
          times: [0, 0.25, 0.5, 0.75, 1]
        }
      }}
    >
      <div className="w-full h-full flex items-center justify-center text-white font-bold">$</div>
    </motion.div>
  );

  return (
    <div className={`mt-6 md:mt-8 relative rounded-xl md:rounded-2xl overflow-hidden shadow-xl ${isDark ? 'bg-dark-card' : 'bg-white'}`}>
      {/* Decorative particles - fewer on mobile for performance */}
      <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full ${slides[currentSlide].color.replace('text-', 'bg-')}`}
            initial={{ opacity: 0 }}
            animate={{
              x: [
                Math.random() * 100 - 50,
                Math.random() * 100 - 50,
                Math.random() * 100 - 50,
              ],
              y: [
                Math.random() * 100 - 50,
                Math.random() * 100 - 50,
                Math.random() * 100 - 50,
              ],
              scale: [Math.random() * 0.5 + 0.5, Math.random() * 0.5 + 1, Math.random() * 0.5 + 0.5],
              opacity: [0.3, 0.8, 0.3],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 30 + 10}px`,
              height: `${Math.random() * 30 + 10}px`,
              zIndex: 1
            }}
          />
        ))}
      </div>

      {/* Background gradient based on current slide */}
      <motion.div 
        className={`absolute inset-0 bg-gradient-to-br ${slides[currentSlide].gradient} ${isDark ? 'opacity-40' : 'opacity-70'} pointer-events-none`}
        animate={{ 
          opacity: isDark ? [0.3, 0.4, 0.3] : [0.5, 0.7, 0.5],
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%']
        }}
        transition={{ 
          duration: 8, 
          ease: "easeInOut",
          repeat: Infinity,
        }}
      />

      {/* Cartoon coin animation */}
      <BouncingCoin />

      <div className="p-4 sm:p-6 md:p-10 relative z-10">
        <div className="flex flex-col min-h-[250px] sm:min-h-[280px] md:min-h-[300px]">
          {/* Carousel Content */}
          <div className="relative flex-grow">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentSlide}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 20 },
                  opacity: { duration: 0.4 },
                  scale: { type: "spring", stiffness: 300, damping: 20 },
                }}
                className="absolute top-0 left-0 w-full h-full flex flex-col items-center gap-4 sm:gap-6 p-2 sm:p-4"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={(_, { offset, velocity }) => {
                  const swipe = offset.x < -50 || (offset.x < 0 && velocity.x < -500);
                  
                  if (swipe) {
                    updatePage(
                      (currentSlide + 1) % slides.length,
                      1
                    );
                  } else if (offset.x > 50 || (offset.x > 0 && velocity.x > 500)) {
                    updatePage(
                      currentSlide === 0 ? slides.length - 1 : currentSlide - 1,
                      -1
                    );
                  }
                }}
              >
                {/* Cartoon character based on slide type */}
                <div className="flex-shrink-0 relative z-10 mb-3">
                  <CartoonCharacter 
                    type={characterTypes[currentSlide]} 
                    color={slides[currentSlide].color} 
                    isDark={isDark}
                  />
                </div>
                
                <div className="flex-1 text-center relative z-10">
                  <motion.h2 
                    className={`text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 ${slides[currentSlide].color}`}
                    initial={{ y: 20, opacity: 0, scale: 0.9 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    transition={{ 
                      delay: 0.2, 
                      duration: 0.4,
                      y: { type: "spring", stiffness: 200, damping: 20 }
                    }}
                  >
                    {slides[currentSlide].title}
                  </motion.h2>
                  <motion.p 
                    className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-sm sm:text-base md:text-lg max-w-md mx-auto line-clamp-3 sm:line-clamp-none`}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ 
                      delay: 0.3, 
                      duration: 0.4,
                      y: { type: "spring", stiffness: 200, damping: 20 } 
                    }}
                  >
                    {slides[currentSlide].description}
                  </motion.p>

                  {/* Bouncing icon - show on all screen sizes */}
                  <motion.div 
                    className={`flex justify-center items-center mt-3 sm:mt-4 ${slides[currentSlide].color}`}
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ 
                      scale: 1, 
                      y: [0, -5, 0],
                      rotate: [-5, 5, -5]
                    }}
                    transition={{
                      scale: { delay: 0.4, duration: 0.3, type: "spring" },
                      y: { 
                        delay: 0.7,
                        repeat: Infinity,
                        duration: 1.5,
                        ease: "easeInOut" 
                      },
                      rotate: {
                        delay: 0.7,
                        repeat: Infinity,
                        duration: 2,
                        ease: "easeInOut"
                      }
                    }}
                  >
                    {slides[currentSlide].icon}
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          
          {/* Controls */}
          <div className="flex justify-between items-center mt-6 sm:mt-8 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-1 sm:space-x-2">
              {slides.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? `w-6 sm:w-10 ${slides[index].color.replace('text-', 'bg-')}` 
                      : `w-1.5 sm:w-2 ${isDark ? 'bg-gray-600' : 'bg-gray-300'} hover:bg-gray-400`
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  animate={index === currentSlide ? {
                    scale: [1, 1.1, 1],
                    transition: {
                      duration: 0.5,
                      repeat: Infinity,
                      repeatType: "mirror"
                    }
                  } : {}}
                />
              ))}
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-3">
              <motion.button
                onClick={prevSlide}
                className={`p-1.5 sm:p-2 rounded-full ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                aria-label="Previous slide"
                variants={buttonVariants}
                initial="idle"
                whileHover="hover"
                whileTap="tap"
              >
                <FiArrowLeft className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-sm sm:text-base`} />
              </motion.button>
              
              <motion.button
                onClick={togglePlay}
                className={`p-1.5 sm:p-2 rounded-full ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                aria-label={isPlaying ? "Pause autoplay" : "Start autoplay"}
                variants={buttonVariants}
                initial="idle"
                whileHover="hover"
                whileTap="tap"
              >
                {isPlaying ? (
                  <FiPause className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-sm sm:text-base`} />
                ) : (
                  <FiPlay className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-sm sm:text-base`} />
                )}
              </motion.button>
              
              <motion.button
                onClick={nextSlide}
                className={`p-1.5 sm:p-2 rounded-full ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                aria-label="Next slide"
                variants={buttonVariants}
                initial="idle"
                whileHover="hover"
                whileTap="tap"
              >
                <FiArrowRight className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-sm sm:text-base`} />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className={`h-1 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
        <motion.div 
          className={`h-full ${slides[currentSlide].color.replace('text-', 'bg-')}`}
          initial={{ width: `${((currentSlide) / slides.length) * 100}%` }}
          animate={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
          transition={{ 
            duration: isPlaying ? 5 : 0.5, 
            ease: "linear" 
          }}
        />
      </div>
    </div>
  );
};

export default InvestmentCarousel; 
