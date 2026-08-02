import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Activity, UsersRound } from 'lucide-react';

const MIN_ACTIVITY = 200;
const MAX_ACTIVITY = 300;

const nextActivityCount = (current: number) => {
  const change = Math.floor(Math.random() * 7) - 3;
  return Math.min(MAX_ACTIVITY, Math.max(MIN_ACTIVITY, current + change));
};

const LiveActivityBadge: React.FC = () => {
  const [count, setCount] = useState(247);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCount((current) => nextActivityCount(current));
    }, 3200);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div
      className="group mt-5 grid w-full max-w-[25rem] grid-cols-[auto_1fr_auto] items-center gap-3 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.07] p-3 shadow-[0_16px_45px_rgba(2,8,23,0.26)] backdrop-blur-xl transition-colors hover:border-cyan-300/25 hover:bg-white/[0.09] sm:gap-4 sm:p-3.5"
      aria-label={`Activity preview: ${count} planners exploring tools`}
      title="Animated activity preview. Connect live analytics to show verified concurrent visitors."
    >
      <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-300/15 bg-emerald-300/10 text-emerald-300" aria-hidden="true">
        {!reduceMotion && <span className="absolute inset-0 animate-ping rounded-xl bg-emerald-300/10" />}
        <UsersRound className="relative" size={20} />
        <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-slate-950 bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
      </span>

      <span className="min-w-0">
        <span className="flex items-baseline gap-1.5">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={count}
              className="inline-block min-w-[3ch] font-display text-xl font-bold tabular-nums text-white sm:text-2xl"
              initial={reduceMotion ? false : { opacity: 0, y: 7 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -7 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {count}
            </motion.span>
          </AnimatePresence>
          <span className="truncate text-xs font-semibold uppercase tracking-[0.12em] text-cyan-200 sm:text-sm">active now</span>
        </span>
        <span className="mt-0.5 block truncate text-xs text-slate-400 sm:text-sm">Exploring Sofinora tools</span>
      </span>

      <span className="flex h-10 items-end gap-1 rounded-xl border border-white/10 bg-slate-950/35 px-2.5 py-2" aria-hidden="true">
        {[35, 62, 46, 82, 58].map((height, index) => (
          <motion.span
            key={height}
            className="w-1 rounded-full bg-gradient-to-t from-cyan-500 to-emerald-300"
            animate={reduceMotion ? undefined : { height: [`${height}%`, `${Math.min(100, height + 18)}%`, `${height}%`] }}
            transition={{ duration: 1.8 + index * 0.16, repeat: Infinity, ease: 'easeInOut' }}
            style={{ height: `${height}%` }}
          />
        ))}
        <Activity className="ml-1 self-center text-cyan-300/70" size={13} />
      </span>
    </div>
  );
};

export default LiveActivityBadge;
