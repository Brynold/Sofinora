import { useEffect, useRef, useState, type FormEvent } from 'react';
import { BadgeCheck, Bug, Lightbulb, MessageSquareText, Send } from 'lucide-react';
import { Link } from '../router';
import { businessConfig, trackCommerceEvent } from '../config/business';
import { Select } from '../components/CalculatorForm';

const categories = [
  { value: 'suggestion', label: 'Feature suggestion' },
  { value: 'bug', label: 'Bug or calculation issue' },
  { value: 'general', label: 'General feedback' },
];

export default function FeedbackPage() {
  const [category, setCategory] = useState('suggestion');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const successHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!submitted) return;
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      successHeadingRef.current?.focus({ preventScroll: true });
    });
  }, [submitted]);

  const submitFeedback = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    if (website) return;
    if (!businessConfig.feedbackEnabled || !businessConfig.registrationEndpoint) {
      setError('Feedback collection is still being connected. Please try again shortly.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const body = new URLSearchParams({
        action: 'feedback',
        category,
        email: email.trim().toLowerCase(),
        message: message.trim(),
        source: 'finplanner-feedback-page',
        pagePath: '/feedback',
        consent: 'true',
      });
      await fetch(businessConfig.registrationEndpoint, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body,
      });
      setSubmitted(true);
      trackCommerceEvent('feedback_submitted', { category });
    } catch {
      setError('We could not send your feedback. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <article className="mx-auto flex w-full max-w-3xl items-center py-10 sm:py-16">
        <section className="w-full rounded-[2rem] border border-emerald-200 bg-white p-8 text-center shadow-xl dark:border-emerald-400/20 dark:bg-slate-900 sm:p-12">
          <BadgeCheck className="mx-auto text-emerald-500" size={44} />
          <h1 ref={successHeadingRef} tabIndex={-1} className="mt-5 font-display text-4xl font-bold text-slate-950 outline-none dark:text-white">Thank you for helping Sofinora improve.</h1>
          <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-600 dark:text-slate-300">Your feedback has been recorded for review. Please do not send passwords, account numbers, identity documents, or other sensitive financial information.</p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <button type="button" onClick={() => { setSubmitted(false); setMessage(''); }} className="rounded-2xl bg-slate-950 px-6 py-3 font-bold text-white dark:bg-cyan-400 dark:text-slate-950">Send another response</button>
            <Link to="/" className="rounded-2xl border border-slate-200 px-6 py-3 font-bold text-slate-700 dark:border-white/10 dark:text-slate-200">Return home</Link>
          </div>
        </section>
      </article>
    );
  }

  return (
    <article className="mx-auto w-full max-w-5xl py-8 sm:py-14">
      <section className="overflow-hidden rounded-[2rem] bg-slate-950 p-7 text-white shadow-2xl sm:p-12">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-200"><MessageSquareText size={24} /></div>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">Feedback & suggestions</p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-bold tracking-tight sm:text-5xl">Help shape the next Sofinora release.</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">Tell us what would make a calculator clearer, report something that looks wrong, or suggest the next useful planning feature.</p>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
        <aside className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900">
            <Lightbulb className="text-amber-500" size={24} />
            <h2 className="mt-4 font-bold text-slate-950 dark:text-white">Suggestions</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Describe the problem you want solved and what a useful result would look like.</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900">
            <Bug className="text-rose-500" size={24} />
            <h2 className="mt-4 font-bold text-slate-950 dark:text-white">Bug reports</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Mention the calculator, the field involved, and safe example values that reproduce the issue.</p>
          </div>
        </aside>

        <form onSubmit={submitFeedback} aria-busy={submitting} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900 sm:p-8" aria-label="Feedback and suggestion form">
          <label htmlFor="feedback-category" className="block text-sm font-bold text-slate-900 dark:text-white">Feedback type</label>
          <div className="mt-2">
            <Select id="feedback-category" value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-2xl px-4 py-3.5">
              {categories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </Select>
          </div>

          <label htmlFor="feedback-email" className="mt-5 block text-sm font-bold text-slate-900 dark:text-white">Email address <span className="font-normal text-slate-500">(optional)</span></label>
          <input id="feedback-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-slate-950 outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/15 dark:border-white/15 dark:bg-slate-950 dark:text-white" />

          <label htmlFor="feedback-message" className="mt-5 block text-sm font-bold text-slate-900 dark:text-white">Your feedback</label>
          <textarea id="feedback-message" required minLength={10} maxLength={2000} rows={7} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="What should we improve, add, or fix?" className="mt-2 w-full resize-y rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-slate-950 outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/15 dark:border-white/15 dark:bg-slate-950 dark:text-white" />
          <p className="mt-1 text-right text-xs text-slate-500">{message.length}/2000</p>

          <div className="hidden" aria-hidden="true"><label htmlFor="feedback-website">Website</label><input id="feedback-website" tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} /></div>

          <label className="mt-4 flex items-start gap-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            <input type="checkbox" required className="mt-1 h-4 w-4 shrink-0 accent-cyan-600" />
            <span>I agree that Sofinora may store this response in its private Google Sheet for product improvement. I have not included sensitive financial information.</span>
          </label>

          {error && <p role="alert" className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-400/10 dark:text-rose-200">{error}</p>}
          {!businessConfig.feedbackEnabled && <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-400/10 dark:text-amber-100">Feedback storage is being connected. The form will open as soon as the updated Sheet service is published.</p>}

          <span className="sr-only" aria-live="polite">{submitting ? 'Sending your feedback' : error ? 'Feedback could not be sent' : ''}</span>
          <button type="submit" disabled={submitting || !businessConfig.feedbackEnabled} className="mt-5 inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-cyan-500 px-6 py-3.5 font-bold text-slate-950 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-cyan-400 hover:shadow-lg active:translate-y-0 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0 disabled:hover:shadow-sm">
            {submitting ? <span className="h-[18px] w-[18px] animate-spin rounded-full border-2 border-slate-950/25 border-t-slate-950" aria-hidden="true" /> : <Send size={18} />}
            {submitting ? 'Sending feedback…' : 'Send feedback'}
          </button>
        </form>
      </div>
    </article>
  );
}
