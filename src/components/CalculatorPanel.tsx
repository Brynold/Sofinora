import React from 'react';
import { useTheme } from '../context/ThemeContext';

export const CalculatorPanel: React.FC<{
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
  className?: string;
}> = ({ title, eyebrow, children, className = '' }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <section className={`min-w-0 rounded-[1.35rem] border p-4 sm:p-5 ${
      isDark ? 'border-white/10 bg-slate-950/40' : 'border-slate-200 bg-white'
    } ${className}`}>
      {eyebrow && <p className={`text-xs font-bold uppercase tracking-[0.16em] ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>{eyebrow}</p>}
      <h2 className={`mt-1 text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
};

export const CalculatorNotice: React.FC<{ children: React.ReactNode; tone?: 'info' | 'warning' }> = ({ children, tone = 'info' }) => (
  <div className={`rounded-2xl border px-4 py-3 text-sm leading-6 ${
    tone === 'warning'
      ? 'border-amber-300/30 bg-amber-400/10 text-amber-800 dark:text-amber-100'
      : 'border-cyan-300/30 bg-cyan-400/10 text-cyan-800 dark:text-cyan-100'
  }`}>
    {children}
  </div>
);
