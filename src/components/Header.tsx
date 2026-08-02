import React, { useEffect, useState } from 'react';
import { Link, useLocation } from '../router';
import { Moon, Sun, Menu, X, ChevronRight, ArrowDown, ArrowRight, MessageSquarePlus, PiggyBank, Shield, TrendingUp } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { scrollToSection } from '../utils/scrollUtils';

// Define type for navigation items
type NavItem = {
  name: string;
  path: string;
  isNew?: boolean;
};

const Header: React.FC = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isStarterPackPage = location.pathname === '/starter-pack';

  // Navigation items
  const navItems: NavItem[] = [
    { name: 'Home', path: '/' },
    { name: 'SIP', path: '/calculators/sip' },
    { name: 'Retirement', path: '/calculators/retirement' },
    { name: 'Net Worth', path: '/calculators/net-worth' },
    { name: 'Starter Pack', path: '/starter-pack', isNew: true },
  ];

  // Toggle mobile menu
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleStarterPackClick = () => {
    setIsMenuOpen(false);

    // When the user is already on this page, changing to the same route does
    // not trigger a navigation. Give the CTA an immediate, visible action.
    if (isStarterPackPage) {
      window.requestAnimationFrame(() => scrollToSection('free-access'));
    }
  };
  
  // Close menu when path changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-50 w-full border-b border-white/10 bg-white/80 shadow-soft backdrop-blur-xl dark:bg-slate-950/75"
    >
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center justify-between gap-2 py-2.5 sm:gap-4 sm:py-3.5">
          {/* Logo */}
          <Link to="/" className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-cyan-300 shadow-[0_12px_24px_rgba(15,23,42,0.18)] dark:bg-cyan-400/10 dark:text-cyan-200 sm:h-11 sm:w-11">
              <PiggyBank className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-lg font-display font-bold text-slate-900 dark:text-white">
                Sofinora
              </span>
              <span className="hidden whitespace-nowrap text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400 lg:block">
                Calculators That Explain The Tradeoffs
              </span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center rounded-full border border-slate-200/80 bg-white/85 p-1 shadow-soft dark:border-white/10 dark:bg-white/5 xl:flex">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'bg-slate-950 text-white dark:bg-cyan-400/15 dark:text-cyan-200'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white'
                }`}
              >
                {item.name}
                {item.isNew && (
                  <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-semibold">
                    NEW
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Action buttons */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="flex h-11 w-11 touch-manipulation items-center justify-center rounded-full border border-slate-200 bg-white p-2 text-slate-600 transition-colors hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-white sm:h-auto sm:w-auto"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </button>

            {/* Call to action button - only on desktop */}
            <Link
              to="/starter-pack#free-access"
              onClick={handleStarterPackClick}
              aria-label={isStarterPackPage ? 'Go to the free access form' : 'Get the free Starter Pack'}
              aria-current={isStarterPackPage ? 'page' : undefined}
              className="group hidden items-center whitespace-nowrap rounded-full bg-slate-950 px-3.5 py-2.5 text-sm font-semibold text-white shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-[0.98] dark:bg-cyan-400 dark:text-slate-950 lg:inline-flex lg:px-5"
            >
              <Shield className="mr-1.5 h-4 w-4 lg:mr-2" />
              <span>{isStarterPackPage ? 'Go to Free Access' : 'Starter Pack'}</span>
              <span className="ml-1 rounded-full bg-cyan-300/20 px-1.5 py-0.5 text-[10px] font-extrabold tracking-wide text-cyan-200 dark:bg-slate-950/10 dark:text-slate-950">FREE</span>
              {isStarterPackPage ? (
                <ArrowDown className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-y-1 lg:ml-2" />
              ) : (
                <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1 lg:ml-2" />
              )}
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={toggleMenu}
              className="flex h-11 w-11 touch-manipulation items-center justify-center rounded-full border border-slate-200 bg-white p-2 text-slate-600 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-300 xl:hidden sm:h-auto sm:w-auto"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t border-white/10 bg-white/95 backdrop-blur-xl dark:bg-slate-950/95 xl:hidden"
          >
            <div className="px-4 py-3 space-y-1 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between py-3 px-3 rounded-lg ${
                    location.pathname === item.path
                      ? 'bg-slate-950 text-white dark:bg-cyan-400/15 dark:text-cyan-200'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center">
                    {item.name}
                    {item.isNew && (
                      <span className="ml-2 bg-accent-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-semibold">
                        NEW
                      </span>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              ))}

              <Link
                to="/feedback"
                className="flex items-center justify-between rounded-lg px-3 py-3 text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
              >
                <span className="flex items-center gap-2"><MessageSquarePlus className="h-4 w-4" /> Feedback</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
              
              {/* Special CTA for mobile */}
              <Link 
                to="/starter-pack#free-access"
                onClick={handleStarterPackClick}
                className="flex items-center justify-between mt-4 py-3 px-4 rounded-2xl bg-slate-950 text-white font-medium dark:bg-cyan-400 dark:text-slate-950"
              >
                <div className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  <span>{isStarterPackPage ? 'Go to Free Access' : 'Get Starter Pack Free'}</span>
                </div>
                {isStarterPackPage ? <ArrowDown className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header; 
