import React, { useState, useEffect, useCallback } from 'react';
import { FiArrowLeft, FiArrowRight, FiPause, FiPlay } from 'react-icons/fi';
import { BiLineChart, BiCoinStack, BiWallet } from 'react-icons/bi';
import { useTheme } from '../context/ThemeContext';

interface CarouselSlide {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const SimpleCarousel: React.FC = () => {
  const { theme } = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  
  const slides: CarouselSlide[] = [
    {
      title: "Plan Your Financial Future",
      description: "Set clear goals and create a roadmap for your financial success.",
      icon: <BiLineChart size={36} />,
      color: "text-blue-500",
    },
    {
      title: "Track Your Investments",
      description: "Monitor your portfolio performance and make informed decisions.",
      icon: <BiCoinStack size={36} />,
      color: "text-green-500",
    },
    {
      title: "Achieve Financial Freedom",
      description: "Build wealth and secure your future with smart planning tools.",
      icon: <BiWallet size={36} />,
      color: "text-purple-500",
    },
  ];

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [slides.length]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (isPlaying) {
      interval = setInterval(() => {
        nextSlide();
      }, 4000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, nextSlide]);

  return (
    <div className={`mb-10 relative rounded-2xl overflow-hidden shadow-lg ${theme === 'dark' ? 'bg-dark-card' : 'bg-white'}`}>
      <div className="p-6 md:p-8">
        <div className="flex flex-col h-[200px]">
          {/* Carousel Content */}
          <div className="relative flex-grow overflow-hidden">
            <div 
              className="flex transition-transform duration-500 h-full"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {slides.map((slide, index) => (
                <div key={index} className="min-w-full h-full flex flex-col md:flex-row items-center md:items-start gap-4 px-4">
                  <div className={`${slide.color} p-4 rounded-full bg-opacity-10 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    {slide.icon}
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className={`text-xl md:text-2xl font-bold mb-2 ${slide.color}`}>
                      {slide.title}
                    </h3>
                    <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-sm md:text-base`}>
                      {slide.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex justify-between items-center mt-4">
            <div className="flex space-x-1">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? 'w-8 bg-primary-500' 
                      : 'w-4 bg-gray-300 dark:bg-gray-600'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={prevSlide}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Previous slide"
              >
                <FiArrowLeft className="text-gray-600 dark:text-gray-300" />
              </button>
              
              <button
                onClick={togglePlay}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label={isPlaying ? "Pause autoplay" : "Start autoplay"}
              >
                {isPlaying ? (
                  <FiPause className="text-gray-600 dark:text-gray-300" />
                ) : (
                  <FiPlay className="text-gray-600 dark:text-gray-300" />
                )}
              </button>
              
              <button
                onClick={nextSlide}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Next slide"
              >
                <FiArrowRight className="text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="h-1 bg-gray-200 dark:bg-gray-700">
        <div 
          className="h-full bg-primary-500 transition-all duration-300"
          style={{ 
            width: `${((currentSlide + 1) / slides.length) * 100}%`,
            transitionTimingFunction: 'linear'
          }}
        ></div>
      </div>
    </div>
  );
};

export default SimpleCarousel; 
