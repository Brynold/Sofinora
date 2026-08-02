import React from 'react';
import { ArrowUpRight, ExternalLink } from 'lucide-react';
import { useNavigate } from '../router';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

type ToolStatus = 'implemented' | 'coming-soon';

interface ToolCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  categoryLabel?: string;
  status?: ToolStatus;
}

const ToolCard: React.FC<ToolCardProps> = ({
  title,
  description,
  icon,
  route,
  categoryLabel,
  status = 'implemented',
}) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const isComingSoon = status === 'coming-soon';

  const handleClick = () => {
    if (isComingSoon) {
      return;
    }

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    setTimeout(() => {
      navigate(route);
    }, 250);
  };

  return (
    <motion.article
      whileHover={{ scale: isComingSoon ? 1.01 : 1.02, y: isComingSoon ? -2 : -5 }}
      whileTap={{ scale: isComingSoon ? 0.99 : 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      onClick={handleClick}
      className={`group relative overflow-hidden rounded-[1.5rem] border transition-all duration-300 ${
        isComingSoon ? 'cursor-default opacity-80' : 'cursor-pointer'
      } ${
        isDark
          ? 'border-white/10 bg-slate-900/80 hover:border-cyan-400/30'
          : 'border-white/80 bg-white/90 hover:border-cyan-200'
      }`}
    >
      <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.2),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(14,165,233,0.14),_transparent_26%)]" />

      <div className="relative p-6">
        <div className="flex items-center justify-between">
          <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
            isDark ? 'bg-white/5 text-slate-300' : 'bg-slate-100 text-slate-600'
          }`}>
            {categoryLabel || 'Calculator'}
          </span>

          {isComingSoon ? (
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${
              isDark ? 'bg-white/5 text-slate-300' : 'bg-slate-100 text-slate-600'
            }`}>
              Coming Soon
            </span>
          ) : (
            <motion.div
              whileHover={{ rotate: 15, scale: 1.08 }}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-400/15"
            >
              <ArrowUpRight className={isDark ? 'h-4 w-4 text-cyan-200' : 'h-4 w-4 text-cyan-700'} />
            </motion.div>
          )}
        </div>

        <div className={`mt-5 inline-flex rounded-[1.1rem] p-3 ${
          isDark ? 'bg-white/5 text-cyan-200' : 'bg-slate-100 text-cyan-700'
        }`}>
          {icon}
        </div>

        <h3 className={`mt-5 font-display text-xl font-semibold ${
          isDark ? 'text-white' : 'text-slate-900'
        }`}>
          {title}
        </h3>

        <p className={`mt-3 min-h-[72px] text-sm leading-6 ${
          isDark ? 'text-slate-300' : 'text-slate-600'
        }`}>
          {description}
        </p>

        {!isComingSoon && (
          <div className={`mt-5 flex items-center justify-between border-t pt-4 text-sm font-medium ${
            isDark ? 'border-white/10 text-cyan-200' : 'border-slate-200 text-cyan-700'
          }`}>
            <span>Open calculator</span>
            <ExternalLink size={14} />
          </div>
        )}
      </div>
    </motion.article>
  );
};

export default ToolCard;
