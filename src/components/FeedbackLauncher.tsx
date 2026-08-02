import { MessageSquarePlus } from 'lucide-react';
import { Link, useLocation } from '../router';

export default function FeedbackLauncher() {
  const { pathname } = useLocation();
  if (pathname === '/feedback') return null;

  return (
    <Link to="/feedback" aria-label="Share feedback or a suggestion" className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-6 z-40 hidden touch-manipulation items-center justify-center gap-2 rounded-full border border-cyan-300/30 bg-slate-950 px-4 py-3 text-sm font-bold text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-cyan-400 dark:text-slate-950 dark:hover:bg-cyan-300 sm:inline-flex">
      <MessageSquarePlus size={18} /> <span className="hidden sm:inline">Feedback</span>
    </Link>
  );
}
