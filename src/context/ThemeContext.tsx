import React, { createContext, useContext, useState, useEffect } from 'react';
import { COOKIE_CONSENT_EVENT, THEME_COOKIE_NAME, deleteCookie, getCookie, preferencesAllowed, setCookie } from '../utils/cookies';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check if user has a preference in localStorage or prefers dark mode via OS
  const getInitialTheme = (): Theme => {
    if (typeof window !== 'undefined') {
      const cookieTheme = preferencesAllowed() ? getCookie(THEME_COOKIE_NAME) as Theme | null : null;
      const savedTheme = preferencesAllowed() ? cookieTheme || localStorage.getItem('theme') as Theme | null : null;
      
      if (savedTheme) {
        return savedTheme;
      }
      
      const userMedia = window.matchMedia('(prefers-color-scheme: dark)');
      if (userMedia.matches) {
        return 'dark';
      }
    }
    
    return 'light'; // Default theme
  };

  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  // Apply theme class to html element
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    if (preferencesAllowed()) {
      localStorage.setItem('theme', theme);
      setCookie(THEME_COOKIE_NAME, theme, 365);
    } else {
      localStorage.removeItem('theme');
      deleteCookie(THEME_COOKIE_NAME);
    }
  }, [theme]);

  useEffect(() => {
    const syncThemeCookie = () => {
      if (preferencesAllowed()) {
        localStorage.setItem('theme', theme);
        setCookie(THEME_COOKIE_NAME, theme, 365);
      } else {
        localStorage.removeItem('theme');
        deleteCookie(THEME_COOKIE_NAME);
      }
    };

    window.addEventListener(COOKIE_CONSENT_EVENT, syncThemeCookie);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, syncThemeCookie);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 
