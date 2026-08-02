import React, { useState } from 'react';
import {
  BookOpen,
  ExternalLink,
  Play,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const VIDEO_ID = 'l4TzfPfLMB4';
const SOURCE_URL = 'https://learn.saylor.org/mod/page/view.php?id=90238';
const LICENSE_URL = 'https://creativecommons.org/licenses/by/3.0/';
const topics = [
  {
    title: 'Diversification',
    takeaway: 'Spread money across different assets so one weak result does not control the whole portfolio.',
  },
  {
    title: 'Risk & return',
    takeaway: 'Higher expected returns usually come with larger short-term swings and a greater chance of loss.',
  },
  {
    title: 'Asset allocation',
    takeaway: 'Match your equity, debt and cash mix to the goal, timeline and your ability to handle volatility.',
  },
  {
    title: 'Compounding',
    takeaway: 'Returns can earn further returns over time, making consistency and a long horizon powerful.',
  },
];

const InvestmentVideo: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [loaded, setLoaded] = useState(false);
  const [activeTopic, setActiveTopic] = useState(0);

  return (
    <section
      aria-labelledby="investment-video-title"
      className={`overflow-hidden rounded-[1.75rem] border shadow-soft-lg ${
        isDark ? 'border-white/10 bg-slate-900/80' : 'border-white/70 bg-white/90'
      }`}
    >
      <div className="grid items-center lg:grid-cols-[0.82fr_1.18fr]">
        <div className="flex flex-col justify-center p-5 sm:p-8">
          <div className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.17em] ${
            isDark ? 'bg-violet-400/10 text-violet-200' : 'bg-violet-50 text-violet-700'
          }`}>
            <BookOpen size={14} /> Learn before calculating
          </div>
          <h2 id="investment-video-title" className={`mt-4 font-display text-2xl font-bold sm:text-3xl ${isDark ? 'text-white' : 'text-slate-950'}`}>
            Investment basics: risk, assets and diversification
          </h2>
          <p className={`mt-3 text-sm leading-7 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Explore a topic, watch the open lesson, then put the idea into practice with a calculator.
          </p>

          <div className="mt-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className={`text-xs font-bold uppercase tracking-[0.16em] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Preview the lesson
              </p>
              <span className={`text-xs ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>Tap a topic</span>
            </div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Investment lesson topics">
              {topics.map((topic, index) => {
                const active = activeTopic === index;
                return (
                  <button
                    key={topic.title}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setActiveTopic(index)}
                    className={`min-h-10 touch-manipulation rounded-full border px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
                      active
                        ? 'border-cyan-400 bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/15'
                        : isDark
                          ? 'border-white/10 bg-white/5 text-slate-200 hover:border-cyan-300/50 hover:bg-white/10'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-cyan-300 hover:bg-cyan-50'
                    }`}
                  >
                    {topic.title}
                  </button>
                );
              })}
            </div>
            <div
              aria-live="polite"
              className={`mt-3 rounded-2xl border p-4 ${
                isDark ? 'border-violet-300/15 bg-violet-400/5' : 'border-violet-100 bg-violet-50/80'
              }`}
            >
              <div className={`flex items-center gap-2 text-sm font-bold ${isDark ? 'text-violet-200' : 'text-violet-800'}`}>
                <Sparkles size={16} /> {topics[activeTopic].title}
              </div>
              <p className={`mt-1 text-sm leading-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                {topics[activeTopic].takeaway}
              </p>
            </div>
          </div>

        </div>

        <div className="relative aspect-video w-full self-center overflow-hidden bg-gradient-to-br from-slate-950 via-violet-950 to-cyan-950">
          {loaded ? (
            <iframe
              className="absolute inset-0 h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&rel=0`}
              title="Investing 101: stocks, bonds, cash, portfolios and asset allocation"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          ) : (
            <button
              type="button"
              onClick={() => setLoaded(true)}
              className="group absolute inset-0 flex h-full w-full touch-manipulation flex-col items-center justify-center overflow-hidden p-6 text-center focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-cyan-300"
            >
              <span className="absolute inset-0 opacity-50 transition duration-700 group-hover:scale-110 [background-image:radial-gradient(circle_at_25%_25%,rgba(34,211,238,0.55),transparent_24%),radial-gradient(circle_at_75%_70%,rgba(167,139,250,0.55),transparent_26%)]" />
              <span className="absolute left-[12%] top-[16%] h-24 w-24 rounded-full border border-cyan-300/15 transition duration-700 group-hover:-translate-y-2 group-hover:scale-110" />
              <span className="absolute bottom-[12%] right-[10%] h-40 w-40 rounded-full border border-violet-300/15 transition duration-700 group-hover:translate-y-2 group-hover:scale-110" />
              <span className="relative mb-6 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-cyan-200 backdrop-blur">
                Free lesson · 8 minutes
              </span>
              <span className="relative flex h-24 w-24 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white shadow-2xl backdrop-blur transition duration-300 group-hover:scale-110 group-hover:border-cyan-300/70 group-hover:bg-cyan-300/15">
                <span className="absolute inset-[-10px] animate-pulse rounded-full border border-cyan-300/20" />
                <Play size={38} className="ml-1" fill="currentColor" />
              </span>
              <span className="relative mt-6 text-2xl font-bold text-white sm:text-3xl">Investing 101</span>
              <span className="relative mt-2 max-w-sm text-sm leading-6 text-slate-300">
                Tap anywhere to start. The privacy-friendly player loads only when you choose to watch.
              </span>
              <span className="relative mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-cyan-400 px-6 py-3 font-bold text-slate-950 shadow-lg shadow-cyan-950/30 transition group-hover:bg-cyan-300 group-active:scale-[0.98]">
                <Play size={17} fill="currentColor" /> Play open video
              </span>
            </button>
          )}
        </div>
      </div>

      <div className={`flex flex-col gap-3 border-t px-5 py-4 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-8 ${
        isDark ? 'border-white/10 bg-slate-950/30 text-slate-400' : 'border-slate-200 bg-slate-50/80 text-slate-500'
      }`}>
        <div className="flex items-start gap-2.5 leading-5 sm:items-center">
          <ShieldCheck size={17} className="shrink-0 text-emerald-500" />
          <span>Open educational video by Smart Investing Trends, shared unchanged under CC BY 3.0.</span>
        </div>
        <div className="flex shrink-0 flex-wrap gap-4 font-semibold">
          <a href={SOURCE_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-cyan-700 hover:underline dark:text-cyan-300">
            Course source <ExternalLink size={13} />
          </a>
          <a href={LICENSE_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-cyan-700 hover:underline dark:text-cyan-300">
            CC BY 3.0 licence <ExternalLink size={13} />
          </a>
        </div>
      </div>
    </section>
  );
};

export default InvestmentVideo;
