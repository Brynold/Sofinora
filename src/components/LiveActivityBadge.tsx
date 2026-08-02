import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Activity, UsersRound } from 'lucide-react';

const HEARTBEAT_INTERVAL_MS = 20_000;
const VISITOR_ID_KEY = 'sofinora-presence-session-id';

type PresenceResponse = {
  activeSessions: number;
};

const LiveActivityBadge: React.FC = () => {
  const [count, setCount] = useState<number | null>(null);
  const [status, setStatus] = useState<'connecting' | 'live' | 'unavailable'>('connecting');
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    let visitorId: string | null = null;
    try {
      visitorId = window.sessionStorage.getItem(VISITOR_ID_KEY);
      if (!visitorId) {
        visitorId = window.crypto.randomUUID();
        window.sessionStorage.setItem(VISITOR_ID_KEY, visitorId);
      }
    } catch {
      visitorId = window.crypto.randomUUID();
    }

    let cancelled = false;
    const heartbeat = async () => {
      try {
        const response = await fetch('/api/presence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ visitorId }),
        });

        if (!response.ok) throw new Error(`Presence request failed with ${response.status}`);
        const data: unknown = await response.json();
        const activeSessions =
          typeof data === 'object' && data !== null && 'activeSessions' in data
            ? (data as PresenceResponse).activeSessions
            : undefined;

        if (typeof activeSessions !== 'number' || !Number.isInteger(activeSessions) || activeSessions < 0) {
          throw new Error('Invalid presence response');
        }
        if (!cancelled) {
          setCount(activeSessions);
          setStatus('live');
        }
      } catch {
        if (!cancelled) {
          setCount(null);
          setStatus('unavailable');
        }
      }
    };

    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') void heartbeat();
    };

    void heartbeat();
    const interval = window.setInterval(() => void heartbeat(), HEARTBEAT_INTERVAL_MS);
    document.addEventListener('visibilitychange', refreshWhenVisible);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, []);

  const statusLabel = status === 'live' ? 'active now' : status === 'connecting' ? 'connecting' : 'live count unavailable';
  const detailLabel = status === 'live' ? 'Anonymous active sessions' : 'Waiting for the presence service';

  return (
    <div
      className="group mt-5 grid w-full max-w-[25rem] grid-cols-[auto_1fr_auto] items-center gap-3 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.07] p-3 shadow-[0_16px_45px_rgba(2,8,23,0.26)] backdrop-blur-xl transition-colors hover:border-cyan-300/25 hover:bg-white/[0.09] sm:gap-4 sm:p-3.5"
      aria-label={status === 'live' ? `${count} active sessions now` : statusLabel}
      title="Anonymous live count. Visitors automatically expire after inactivity."
    >
      <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-300/15 bg-emerald-300/10 text-emerald-300" aria-hidden="true">
        {!reduceMotion && <span className="absolute inset-0 animate-ping rounded-xl bg-emerald-300/10" />}
        <UsersRound className="relative" size={20} />
        <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-slate-950 bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
      </span>

      <span className="min-w-0">
        <span className="flex items-baseline gap-1.5">
          <span className="inline-block font-display text-xl font-bold tabular-nums text-white sm:text-2xl">
            {count ?? '—'}
          </span>
          <span className="truncate text-xs font-semibold uppercase tracking-[0.12em] text-cyan-200 sm:text-sm">{statusLabel}</span>
        </span>
        <span className="mt-0.5 block truncate text-xs text-slate-400 sm:text-sm">{detailLabel}</span>
      </span>

      <span className="flex h-10 items-end gap-1 rounded-xl border border-white/10 bg-slate-950/35 px-2.5 py-2" aria-hidden="true">
        {[35, 62, 46, 82, 58].map((height, index) => (
          <motion.span
            key={height}
            className="w-1 rounded-full bg-gradient-to-t from-cyan-500 to-emerald-300"
            animate={reduceMotion || status !== 'live' ? undefined : { height: [`${height}%`, `${Math.min(100, height + 18)}%`, `${height}%`] }}
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
