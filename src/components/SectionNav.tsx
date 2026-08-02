import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

interface SectionLink {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface SectionNavProps {
  sections: SectionLink[];
  currentSection?: string;
}

const SectionNav: React.FC<SectionNavProps> = ({ sections, currentSection }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={`sticky top-4 z-20 p-2 rounded-lg shadow-md ${
      isDark ? 'bg-dark-card border border-dark-border' : 'bg-white border border-gray-100'
    }`}>
      <div className="flex gap-2 overflow-x-auto custom-scrollbar">
        {sections.map((section) => (
          <motion.button
            key={section.id}
            onClick={() => handleClick(section.id)}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm whitespace-nowrap rounded-md transition ${
              currentSection === section.id
                ? isDark
                  ? 'bg-primary-900/40 text-primary-300 font-medium'
                  : 'bg-primary-50 text-primary-700 font-medium'
                : isDark
                  ? 'text-gray-300 hover:bg-dark-elevated'
                  : 'text-gray-700 hover:bg-gray-50'
            }`}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {section.icon}
            {section.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default SectionNav; 