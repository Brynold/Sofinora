import { useEffect, useState } from 'react';
import { Check, Cookie, LockKeyhole, Palette } from 'lucide-react';
import { Link } from '../router';
import {
  OPEN_COOKIE_SETTINGS_EVENT,
  THEME_COOKIE_NAME,
  deleteCookie,
  getCookieConsent,
  saveCookieConsent,
  type CookieConsentLevel,
} from '../utils/cookies';

export default function CookieConsent() {
  const [isOpen, setIsOpen] = useState(() => getCookieConsent() === null);
  const [savedLevel, setSavedLevel] = useState<CookieConsentLevel | null>(() => getCookieConsent());

  useEffect(() => {
    const openSettings = () => setIsOpen(true);
    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, openSettings);
    return () => window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, openSettings);
  }, []);

  const choose = (level: CookieConsentLevel) => {
    if (level === 'necessary') deleteCookie(THEME_COOKIE_NAME);
    saveCookieConsent(level);
    setSavedLevel(level);
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[80] p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-5" role="dialog" aria-modal="true" aria-labelledby="cookie-title">
      <div className="mx-auto max-w-3xl overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.28)] dark:border-white/10 dark:bg-slate-900">
        <div className="flex items-start gap-3 p-4 sm:p-5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700 dark:bg-cyan-400/10 dark:text-cyan-200">
            <Cookie size={21} />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-300">Privacy controls</p>
            <h2 id="cookie-title" className="mt-1 font-display text-xl font-bold text-slate-950 dark:text-white">Choose how this site remembers you</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Sofinora uses one necessary cookie to remember this choice. With your permission, it can also remember your light or dark theme. We do not use advertising cookies.
            </p>
          </div>
        </div>

        <div className="grid gap-2 border-y border-slate-200 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-white/[0.025] sm:grid-cols-2 sm:p-4">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-white/[0.04]">
            <LockKeyhole size={18} className="shrink-0 text-emerald-600 dark:text-emerald-300" />
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 dark:text-white">Necessary</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Remembers your cookie selection</p>
            </div>
            <span className="ml-auto rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200">Always on</span>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-white/[0.04]">
            <Palette size={18} className="shrink-0 text-cyan-600 dark:text-cyan-300" />
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 dark:text-white">Preferences</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Remembers your selected theme</p>
            </div>
            {savedLevel === 'preferences' && <Check size={17} className="ml-auto text-cyan-600 dark:text-cyan-300" aria-label="Currently allowed" />}
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
          <Link to="/privacy" className="py-2 text-center text-sm font-semibold text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">Read privacy details</Link>
          <div className="grid grid-cols-1 gap-2 sm:flex">
            <button type="button" onClick={() => choose('necessary')} className="min-h-11 rounded-full border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100 dark:border-white/15 dark:text-slate-200 dark:hover:bg-white/5">
              Necessary only
            </button>
            <button type="button" onClick={() => choose('preferences')} className="min-h-11 rounded-full bg-cyan-400 px-5 py-2 text-sm font-extrabold text-slate-950 shadow-sm transition hover:bg-cyan-300 active:scale-[0.98]">
              Allow preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
