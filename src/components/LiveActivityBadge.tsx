import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

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
      className="mt-5 inline-flex max-w-full items-center gap-3 rounded-full border border-cyan-300/15 bg-slate-900/55 px-4 py-2.5 text-sm text-slate-200 shadow-[0_12px_35px_rgba(8,47,73,0.22)] backdrop-blur-md sm:text-base"
      aria-label={`Activity preview: ${count} planners exploring tools`}
      title="Animated activity preview. Connect live analytics to show verified concurrent visitors."
    >
      <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden="true">
        {!reduceMotion && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-60" />
        )}
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.75)]" />
      </span>

      <span className="whitespace-nowrap font-semibold text-white">Live activity preview</span>
      <span className="h-4 w-px bg-white/15" aria-hidden="true" />
      <span className="min-w-0 text-slate-300">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={count}
            className="inline-block min-w-[3ch] text-right font-bold tabular-nums text-cyan-200"
            initial={reduceMotion ? false : { opacity: 0, y: 8, filter: 'blur(3px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8, filter: 'blur(3px)' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {count}
          </motion.span>
        </AnimatePresence>{' '}
        planners exploring tools
      </span>
    </div>
  );
};

export default LiveActivityBadge;
