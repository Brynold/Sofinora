import { useEffect, useState, type FormEvent } from 'react';
import { ArrowRight, BadgeCheck, Check, Download, FileSpreadsheet, LockKeyhole, Mail, Printer, ShieldCheck, Sparkles } from 'lucide-react';
import { businessConfig, trackCommerceEvent } from '../config/business';
import { scrollToSection } from '../utils/scrollUtils';

const ACCESS_STORAGE_KEY = 'finplanner:starter-pack-access';
const STARTER_PACK_DOWNLOAD = '/downloads/FinPlanner-Starter-Pack.zip';
const WORKBOOK_DOWNLOAD = '/downloads/FinPlanner-Complete-Financial-Planner.xlsx';
const GUIDE_DOWNLOAD = '/downloads/FinPlanner-Complete-Planning-Guide.pdf';

const contents = [
  { title: 'Connected Dashboard', text: 'See net worth, cash surplus, debt, emergency cover, goals and retirement in one automatic summary.' },
  { title: 'Budget & Cash Flow', text: 'Compare planned and actual spending, then map income, saving and one-off costs across 12 months.' },
  { title: 'Net Worth & Emergency Fund', text: 'Track assets and liabilities and calculate an accessible reserve from essential expenses.' },
  { title: 'Goals & Scenarios', text: 'Plan five inflation-aware goals and compare conservative, base and optimistic contribution estimates.' },
  { title: 'Debt Payoff', text: 'Compare interest rates, total payments, payoff estimates and avalanche versus snowball priorities.' },
  { title: 'Protection Review', text: 'Organise insurance, nominees, renewals, important documents and family-readiness actions.' },
  { title: 'Retirement & Allocation', text: 'Estimate retirement needs and compare current versus target investment allocation.' },
  { title: 'Review & 90-Day Plan', text: 'Complete tax and annual checklists, then assign owners, dates and success measures to the next actions.' },
  { title: 'Fillable 12-Page Guide', text: 'Type directly into 178 fields, tick 35 checkboxes, save your answers or print the structured worksheets.' },
];

const faqs = [
  ['Which apps can open the workbook?', 'The XLSX file works with Microsoft Excel and can be imported into Google Sheets. Some visual details may vary by app.'],
  ['Is this personalized financial advice?', 'No. The pack is an educational planning system. It does not recommend securities or replace investment, tax, legal, or accounting advice.'],
  ['Is there a subscription?', 'No. The Starter Pack is free during Phase 1 and there is no recurring subscription.'],
  ['Can I share the files?', 'You can share your completed outputs, but the original templates are licensed only for the purchaser’s personal use and may not be resold or redistributed.'],
];

export default function StarterPackPage() {
  const [email, setEmail] = useState('');
  const [unlocked, setUnlocked] = useState(() => Boolean(localStorage.getItem(ACCESS_STORAGE_KEY)));
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState('');

  useEffect(() => {
    if (window.location.hash === '#free-access') {
      scrollToSection('free-access');
    }
  }, []);

  const unlockStarterPack = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    setSubmitting(true);
    setSubmissionError('');

    try {
      if (businessConfig.registrationEndpoint) {
        const body = new URLSearchParams({
          email: normalizedEmail,
          source: 'starter-pack-page',
          consent: 'true',
          accessMode: 'free-phase-1',
        });
        await fetch(businessConfig.registrationEndpoint, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
          body,
        });
      }

      localStorage.setItem(ACCESS_STORAGE_KEY, JSON.stringify({ email: normalizedEmail, unlockedAt: new Date().toISOString() }));
      setUnlocked(true);
      trackCommerceEvent('starter_pack_unlocked', { product: 'starter_pack', value: 0, currency: 'INR' });
    } catch {
      setSubmissionError('We could not register your access. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const accessButton = (className: string) => (
    <a
      href="#free-access"
      onClick={() => trackCommerceEvent('starter_pack_interest', { product: 'starter_pack', value: 0, currency: 'INR' })}
      className={className}
    >
      Get free Phase 1 access
      <ArrowRight size={18} />
    </a>
  );

  return (
    <article className="mx-auto w-full max-w-7xl py-6 sm:py-10">
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-7 text-white shadow-2xl sm:p-10 lg:p-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.24),_transparent_34%),radial-gradient(circle_at_85%_15%,_rgba(16,185,129,0.2),_transparent_28%)]" />
        <div className="relative grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">
              <Sparkles size={14} /> Free during Phase 1
            </div>
            <h1 className="mt-5 max-w-3xl font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Turn calculator results into a money plan you can keep.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              The Sofinora Complete Pack gives you a connected 16-sheet workbook and a 12-page fillable planning guide—built for Indian rupees and everyday financial decisions.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3 text-sm text-slate-200">
              <span className="inline-flex items-center gap-2"><Check size={16} className="text-emerald-300" /> Free launch access</span>
              <span className="inline-flex items-center gap-2"><Check size={16} className="text-emerald-300" /> Personal-use license</span>
              <span className="inline-flex items-center gap-2"><Check size={16} className="text-emerald-300" /> No account required</span>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              {accessButton('inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-6 py-3.5 font-bold text-slate-950 transition-transform hover:-translate-y-0.5')}
              <a href="#inside" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-6 py-3.5 font-semibold text-white hover:bg-white/10">
                See what is included
              </a>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-white/7 p-5 backdrop-blur">
            <div className="rounded-2xl bg-white p-4 shadow-2xl">
              <img src="/products/starter-pack/dashboard-v2.png" alt="Sofinora connected financial dashboard preview" className="w-full rounded-xl" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                <FileSpreadsheet className="text-cyan-300" size={22} />
                <p className="mt-3 font-semibold">Editable workbook</p>
                <p className="mt-1 text-sm text-slate-400">16 connected sheets</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                <Printer className="text-emerald-300" size={22} />
                <p className="mt-3 font-semibold">Printable review</p>
                <p className="mt-1 text-sm text-slate-400">Fillable 12-page PDF</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="inside" className="py-14 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-300">Inside the pack</p>
          <h2 className="mt-3 font-display text-3xl font-bold text-slate-950 dark:text-white sm:text-4xl">An end-to-end plan, not a basic template</h2>
          <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300">Start with your current position, build stability, fund long-term priorities and finish with three dated actions. Calculations remain editable and visible.</p>
        </div>
        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {contents.map((item) => (
            <div key={item.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900">
              <BadgeCheck className="text-cyan-600 dark:text-cyan-300" size={22} />
              <h3 className="mt-4 text-lg font-bold text-slate-950 dark:text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2 lg:items-center">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-900">
          <img src="/products/starter-pack/goals-v2.png" alt="Sofinora multi-goal and scenario planner preview" className="w-full rounded-2xl" />
        </div>
        <div className="p-2 sm:p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300"><ShieldCheck size={23} /></div>
          <h2 className="mt-5 font-display text-3xl font-bold text-slate-950 dark:text-white">Useful without collecting your financial data</h2>
          <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-300">The files work on your device. Sofinora does not need your bank login, account password, Aadhaar number, or investment statements.</p>
          <div className="mt-6 space-y-3 text-sm text-slate-700 dark:text-slate-200">
            <p className="flex items-start gap-3"><LockKeyhole size={18} className="mt-0.5 shrink-0 text-cyan-600" /> Store the workbook wherever you are comfortable.</p>
            <p className="flex items-start gap-3"><Download size={18} className="mt-0.5 shrink-0 text-cyan-600" /> Keep a clean backup before entering your data.</p>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="grid gap-4 lg:grid-cols-2">
          {faqs.map(([question, answer]) => (
            <div key={question} className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-slate-900">
              <h3 className="font-bold text-slate-950 dark:text-white">{question}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="free-access" className="scroll-mt-28 rounded-[2rem] bg-cyan-50 p-7 dark:bg-cyan-400/5 sm:p-10">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700 dark:bg-cyan-300/10 dark:text-cyan-300"><Mail size={23} /></div>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-300">Free Phase 1 access</p>
          <h2 className="mt-3 font-display text-3xl font-bold text-slate-950 dark:text-white">Download the complete Starter Pack</h2>
          <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">Enter your email to unlock the complete Excel workbook, fillable PDF guide and quick-start instructions. No payment or card details are required.</p>
        </div>

        {unlocked ? (
          <div className="mx-auto mt-7 max-w-xl rounded-3xl border border-emerald-200 bg-white p-6 text-center shadow-sm dark:border-emerald-400/20 dark:bg-slate-900">
            <BadgeCheck className="mx-auto text-emerald-600 dark:text-emerald-300" size={30} />
            <h3 className="mt-3 text-xl font-bold text-slate-950 dark:text-white">Your free access is unlocked</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">The ZIP contains the 16-sheet XLSX planner, the fillable 12-page PDF guide and quick-start instructions.</p>
            <a
              href={STARTER_PACK_DOWNLOAD}
              download
              onClick={() => trackCommerceEvent('starter_pack_download', { product: 'starter_pack', value: 0, currency: 'INR' })}
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3.5 font-bold text-slate-950 hover:bg-emerald-400"
            >
              <Download size={18} /> Download complete Starter Pack
            </a>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <a
                href={WORKBOOK_DOWNLOAD}
                download
                onClick={() => trackCommerceEvent('starter_pack_workbook_download', { product: 'starter_pack_workbook', value: 0, currency: 'INR' })}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-800 hover:bg-slate-50 dark:border-white/10 dark:text-white dark:hover:bg-white/5"
              >
                <FileSpreadsheet size={17} /> Excel workbook
              </a>
              <a
                href={GUIDE_DOWNLOAD}
                download
                onClick={() => trackCommerceEvent('starter_pack_guide_download', { product: 'starter_pack_guide', value: 0, currency: 'INR' })}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-800 hover:bg-slate-50 dark:border-white/10 dark:text-white dark:hover:bg-white/5"
              >
                <Printer size={17} /> Fillable PDF guide
              </a>
            </div>
            <button
              type="button"
              onClick={() => { localStorage.removeItem(ACCESS_STORAGE_KEY); setEmail(''); setUnlocked(false); }}
              className="mt-4 block w-full text-sm font-semibold text-slate-500 underline-offset-4 hover:underline dark:text-slate-400"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={unlockStarterPack} className="mx-auto mt-7 max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900" aria-label="Unlock free Starter Pack">
            <label htmlFor="starter-pack-email" className="block text-sm font-bold text-slate-900 dark:text-white">Email address</label>
            <input
              id="starter-pack-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/15 dark:border-white/15 dark:bg-slate-950 dark:text-white"
            />
            <label className="mt-4 flex items-start gap-3 text-left text-sm leading-6 text-slate-600 dark:text-slate-300">
              <input type="checkbox" required className="mt-1 h-4 w-4 shrink-0 accent-cyan-600" />
              <span>I accept the personal-use terms and understand these are educational planning tools, not financial advice.</span>
            </label>
            <button type="submit" disabled={submitting} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-3.5 font-bold text-white hover:bg-slate-800 disabled:cursor-wait disabled:opacity-70 dark:bg-cyan-400 dark:text-slate-950 dark:hover:bg-cyan-300">
              {submitting ? 'Registering access…' : 'Unlock free download'} {!submitting && <ArrowRight size={18} />}
            </button>
            {submissionError && <p role="alert" className="mt-3 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-400/10 dark:text-rose-200">{submissionError}</p>}
            <p className="mt-4 text-center text-xs leading-5 text-slate-500 dark:text-slate-400">
              {businessConfig.registrationEndpoint
                ? 'Your email is recorded for access management and engagement reporting. It is not added to a marketing list.'
                : 'Google Sheets sync is not connected yet. Your email is saved only in this browser to remember access.'}
            </p>
          </form>
        )}
      </section>
    </article>
  );
}
