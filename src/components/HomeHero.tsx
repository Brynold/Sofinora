import React from 'react';
import { Link } from '../router';
import { ArrowRight, FileSpreadsheet, Sparkles, Target, TrendingUp } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const HomeHero: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const highlights = [
    {
      label: 'Goal-based planning',
      value: '17 tools',
      note: 'From SIP and FD to inflation, EMI, and retirement',
    },
    {
      label: 'Decision-ready outputs',
      value: 'Instant',
      note: 'Clear breakups, milestone views, and year-wise projections',
    },
    {
      label: 'Planning flow',
      value: '1 place',
      note: 'Estimate, compare, and stress-test before committing money',
    },
  ];

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 px-6 py-8 shadow-[0_30px_80px_rgba(15,23,42,0.28)] sm:px-8 lg:px-10 lg:py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.22),_transparent_34%),radial-gradient(circle_at_80%_20%,_rgba(14,165,233,0.2),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.22),_transparent_28%)]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:40px_40px]" />

      <div className="relative grid gap-8 lg:grid-cols-[1.25fr_0.95fr] lg:items-end">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">
            <Sparkles size={14} />
            Financial Planning Workspace
          </div>

          <h1 className="mt-5 max-w-3xl font-display text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Make every money decision with the math already worked out.
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">
            Use accurate calculators for savings, investing, tax planning, and retirement so you can
            compare choices, spot tradeoffs, and plan with more confidence.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <a
              href="#calculator-directory"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition-transform hover:-translate-y-0.5"
            >
              Explore Calculators
              <ArrowRight size={16} />
            </a>
            <Link
              to="/starter-pack"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/8 px-5 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-white/12"
            >
              Get Starter Pack Free
              <FileSpreadsheet size={16} />
            </Link>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {highlights.map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">{item.label}</p>
                <p className="mt-2 text-2xl font-bold text-white">{item.value}</p>
                <p className="mt-1 text-sm text-slate-300">{item.note}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={`rounded-[1.75rem] border p-6 backdrop-blur ${
          isDark
            ? 'border-white/10 bg-slate-900/80'
            : 'border-white/20 bg-white/90'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${
                isDark ? 'text-cyan-300' : 'text-cyan-700'
              }`}>
                Start Here
              </p>
              <h2 className={`mt-2 text-2xl font-display font-semibold ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                A faster planning loop
              </h2>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-300">
              <TrendingUp size={22} />
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className={`rounded-2xl border p-4 ${
              isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'
            }`}>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-300">
                  <Target size={18} />
                </div>
                <div>
                  <p className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Choose the question first</p>
                  <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Goal SIP, EMI, inflation, and retirement are great starting points.</p>
                </div>
              </div>
            </div>

            <div className={`rounded-2xl border p-4 ${
              isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'
            }`}>
              <p className={`text-sm font-semibold uppercase tracking-[0.16em] ${
                isDark ? 'text-slate-300' : 'text-slate-500'
              }`}>
                Popular jump-ins
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Link to="/calculators/sip" className={`rounded-2xl border px-4 py-3 text-sm font-medium transition-colors ${
                  isDark ? 'border-white/10 bg-slate-950/60 text-white hover:bg-slate-950' : 'border-slate-200 bg-white text-slate-900 hover:bg-slate-50'
                }`}>
                  SIP Calculator
                </Link>
                <Link to="/calculators/retirement" className={`rounded-2xl border px-4 py-3 text-sm font-medium transition-colors ${
                  isDark ? 'border-white/10 bg-slate-950/60 text-white hover:bg-slate-950' : 'border-slate-200 bg-white text-slate-900 hover:bg-slate-50'
                }`}>
                  Retirement Planner
                </Link>
                <Link to="/calculators/emi" className={`rounded-2xl border px-4 py-3 text-sm font-medium transition-colors ${
                  isDark ? 'border-white/10 bg-slate-950/60 text-white hover:bg-slate-950' : 'border-slate-200 bg-white text-slate-900 hover:bg-slate-50'
                }`}>
                  EMI Calculator
                </Link>
                <Link to="/calculators/inflation" className={`rounded-2xl border px-4 py-3 text-sm font-medium transition-colors ${
                  isDark ? 'border-white/10 bg-slate-950/60 text-white hover:bg-slate-950' : 'border-slate-200 bg-white text-slate-900 hover:bg-slate-50'
                }`}>
                  Inflation Check
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeHero;
