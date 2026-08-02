import React from 'react';
import { Link } from '../router';
import { ArrowRight, PiggyBank, ShieldCheck, TrendingUp } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { OPEN_COOKIE_SETTINGS_EVENT } from '../utils/cookies';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const popularTools = [
    { name: 'SIP Calculator', path: '/calculators/sip' },
    { name: 'Retirement Calculator', path: '/calculators/retirement' },
    { name: 'EMI Calculator', path: '/calculators/emi' },
    { name: 'Inflation Calculator', path: '/calculators/inflation' },
    { name: 'Net Worth Tracker', path: '/calculators/net-worth' },
    { name: 'Goal SIP Calculator', path: '/calculators/goal-sip' },
  ];

  const planningTracks = [
    { name: 'Savings And Deposits', path: '/calculators/fd' },
    { name: 'Investment Growth', path: '/calculators/mf' },
    { name: 'Retirement Planning', path: '/calculators/nps' },
    { name: 'Tax Planning', path: '/calculators/hra' },
  ];

  return (
    <footer className={`mt-12 border-t ${
      isDark ? 'border-white/10 bg-slate-950/80' : 'border-slate-200 bg-white/80'
    }`}>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.9fr_0.9fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-cyan-300 dark:bg-cyan-400/10 dark:text-cyan-200">
                <PiggyBank className="h-5 w-5" />
              </span>
              <div>
                <p className={`text-lg font-display font-bold ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  Sofinora
                </p>
                <p className={`text-xs uppercase tracking-[0.18em] ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  Financial clarity without spreadsheet drag
                </p>
              </div>
            </div>

            <p className={`mt-4 max-w-xl text-sm leading-7 ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}>
              This app is built to help you pressure-test financial decisions before you commit real
              money. Use it to compare deposits, investing plans, tax benefits, retirement targets,
              and the inflation-adjusted future cost of your goals.
            </p>

            <div className={`mt-6 rounded-[1.5rem] border p-5 ${
              isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'
            }`}>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-300">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <p className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Turn results into a plan</p>
                  <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Use the editable budget, goals, net worth, emergency fund and annual review templates.</p>
                </div>
              </div>
              <Link
                to="/starter-pack"
                className={`mt-4 inline-flex items-center gap-2 text-sm font-semibold ${
                  isDark ? 'text-cyan-200' : 'text-cyan-700'
                }`}
              >
                Get the Starter Pack Free
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          <div>
            <h3 className={`text-sm font-semibold uppercase tracking-[0.18em] ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>
              Popular Calculators
            </h3>
            <ul className="mt-4 space-y-3">
              {popularTools.map((tool) => (
                <li key={tool.path}>
                  <Link
                    to={tool.path}
                    className={`group inline-flex items-center gap-2 text-sm ${
                      isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <TrendingUp size={14} className={isDark ? 'text-cyan-300' : 'text-cyan-600'} />
                    <span>{tool.name}</span>
                    <ArrowRight size={13} className="opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={`text-sm font-semibold uppercase tracking-[0.18em] ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>
              Planning Tracks
            </h3>
            <ul className="mt-4 space-y-3">
              {planningTracks.map((track) => (
                <li key={track.path}>
                  <Link
                    to={track.path}
                    className={`inline-flex items-center gap-2 text-sm ${
                      isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${isDark ? 'bg-cyan-300' : 'bg-cyan-600'}`} />
                    {track.name}
                  </Link>
                </li>
              ))}
            </ul>

            <div className={`mt-8 rounded-[1.5rem] border p-5 ${
              isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'
            }`}>
              <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Quick reminder</p>
              <p className={`mt-2 text-sm leading-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Calculator outputs are estimates, not financial advice. Use them to narrow choices and
                then verify rates, rules, and product terms before acting.
              </p>
            </div>
          </div>
        </div>

        <div className={`mt-10 flex flex-col gap-3 border-t pt-6 text-sm sm:flex-row sm:items-center sm:justify-between ${
          isDark ? 'border-white/10 text-slate-400' : 'border-slate-200 text-slate-500'
        }`}>
          <p>© {currentYear} Sofinora India. Assumptions reviewed August 2026.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link to="/about" className="hover:text-inherit">About</Link>
            <Link to="/methodology" className="hover:text-inherit">Methodology</Link>
            <Link to="/privacy" className="hover:text-inherit">Privacy</Link>
            <Link to="/terms" className="hover:text-inherit">Terms</Link>
            <Link to="/disclosure" className="hover:text-inherit">Disclosure</Link>
            <Link to="/contact" className="hover:text-inherit">Contact</Link>
            <Link to="/feedback" className="hover:text-inherit">Feedback</Link>
            <button type="button" onClick={() => window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS_EVENT))} className="text-left hover:text-inherit">Cookie settings</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
