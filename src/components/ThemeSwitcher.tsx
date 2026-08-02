import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

const ThemeSwitcher: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative p-2 rounded-full bg-gray-200 dark:bg-gray-700 transition-colors"
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === 'dark' ? 0 : 180 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
        className="flex items-center justify-center"
      >
        {theme === 'dark' ? (
          <Moon className="text-yellow-300 w-5 h-5" />
        ) : (
          <Sun className="text-yellow-500 w-5 h-5" />
        )}
      </motion.div>
    </motion.button>
  );
};

export default ThemeSwitcher; 