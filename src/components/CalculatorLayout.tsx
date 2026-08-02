import React, { ReactNode } from 'react';
import { Link } from '../router';
import { ArrowLeft, Home } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface IconProps {
  size?: number;
}

interface CalculatorLayoutProps {
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
}

const CalculatorLayout: React.FC<CalculatorLayoutProps> = ({
  title,
  description,
  icon,
  children
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Create a larger version of the icon for the background
  const largeIcon = React.isValidElement(icon) 
    ? React.cloneElement(icon as React.ReactElement<IconProps>, { size: 140 }) 
    : null;

  return (
    <div className="mx-auto w-full min-w-0 max-w-7xl py-3 sm:py-4 sm:pt-8">
      <div className="mb-3 hidden sm:block">
        <Link 
          to="/" 
          className={`inline-flex items-center gap-2 px-3 py-1.5 ${
            isDark 
              ? 'bg-slate-900/90 border border-white/10 text-cyan-200 hover:text-white' 
              : 'bg-white/95 border border-slate-200 text-slate-700 hover:text-slate-950 hover:bg-white'
          } rounded-full shadow-sm transition-colors font-medium text-sm backdrop-blur`}
        >
          <ArrowLeft size={14} />
          Back to Home
        </Link>
      </div>
      
      <div className="relative mb-4 overflow-hidden rounded-[1.4rem] bg-slate-950 p-5 shadow-[0_20px_48px_rgba(15,23,42,0.2)] sm:mb-5 sm:rounded-[1.75rem] sm:p-6 md:mt-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.24),_transparent_34%),radial-gradient(circle_at_90%_20%,_rgba(14,165,233,0.2),_transparent_24%),linear-gradient(135deg,rgba(2,6,23,0.9),rgba(8,47,73,0.94))]"></div>
        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-10 translate-y-10">
          {largeIcon}
        </div>
        <div className="relative z-10">
          <div className="mb-3 flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white p-2.5 text-cyan-700 sm:h-auto sm:w-auto sm:p-3">
              {icon}
            </div>
            <h1 className="min-w-0 font-display text-[1.65rem] font-bold leading-tight text-white sm:text-3xl">{title}</h1>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-slate-200 sm:leading-7 md:text-base">{description}</p>
        </div>
      </div>
      
      <div className={`${isDark ? 'bg-slate-900/80 border-white/10' : 'bg-white/90 border-white/70'} relative min-w-0 overflow-hidden rounded-[1.4rem] border p-4 shadow-lg sm:rounded-[1.75rem] sm:p-6`}>
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400"></div>
        {children}
      </div>
      
      <div className="mt-5 grid grid-cols-1 gap-2.5 sm:flex sm:gap-4">
        <Link 
          to="/" 
          className={`flex min-h-11 items-center justify-center gap-2 px-4 py-2 ${
            isDark 
              ? 'bg-slate-900/80 border-white/10 text-cyan-200 hover:text-white' 
              : 'bg-white/95 border border-slate-200 text-slate-700 hover:text-slate-950 hover:bg-white'
          } rounded-full shadow-sm transition-colors font-medium border`}
        >
          <ArrowLeft size={16} />
          Back to all calculators
        </Link>
        <Link 
          to="/" 
          className={`flex min-h-11 items-center justify-center gap-2 px-4 py-2 ${
            isDark 
              ? 'bg-cyan-400/10 border-cyan-400/15 text-cyan-200 hover:text-white' 
              : 'bg-cyan-50 border border-cyan-100 text-cyan-700 hover:text-cyan-800 hover:bg-cyan-100'
          } rounded-full shadow-sm transition-colors font-medium`}
        >
          <Home size={16} />
          Home
        </Link>
      </div>
    </div>
  );
};

export default CalculatorLayout; 
