import { Link } from '../router';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center text-center">
      <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-600">404</p>
      <h1 className="mt-4 font-display text-4xl font-bold text-slate-950 dark:text-white">This page is not part of the plan.</h1>
      <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300">The link may be outdated. Return to the calculator directory and continue from there.</p>
      <Link to="/" className="mt-7 inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 font-semibold text-white dark:bg-cyan-400 dark:text-slate-950"><ArrowLeft size={17} /> Back home</Link>
    </div>
  );
}
