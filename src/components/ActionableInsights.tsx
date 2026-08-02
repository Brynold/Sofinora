import React from 'react';
import { Link } from '../router';
import { ArrowRight, Lightbulb } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import ShareReportButton from './ShareReportButton';

interface InsightItem {
  title: string;
  detail: string;
  tone?: 'neutral' | 'positive' | 'caution' | 'action';
}

interface NextStep {
  label: string;
  to: string;
}

interface ActionableInsightsProps {
  title?: string;
  summary: string;
  insights: InsightItem[];
  nextSteps?: NextStep[];
}

const toneStyles: Record<NonNullable<InsightItem['tone']>, string> = {
  neutral: 'border-slate-200 bg-slate-50 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200',
  positive: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200',
  caution: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100',
  action: 'border-cyan-200 bg-cyan-50 text-cyan-800 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-100',
};

const ActionableInsights: React.FC<ActionableInsightsProps> = ({
  title = 'Use This Result',
  summary,
  insights,
  nextSteps = [],
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <section className={`mt-6 min-w-0 rounded-[1.35rem] border p-4 sm:mt-8 sm:rounded-[1.5rem] sm:p-5 ${
      isDark ? 'border-white/10 bg-slate-900/75' : 'border-slate-200 bg-white'
    }`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
            isDark ? 'bg-cyan-500/10 text-cyan-200' : 'bg-cyan-50 text-cyan-700'
          }`}>
            <Lightbulb size={14} />
            {title}
          </div>
          <p className={`mt-3 max-w-3xl text-sm leading-7 ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}>
            {summary}
          </p>
        </div>

        <ShareReportButton
          summary={summary}
          details={insights.map((insight) => `${insight.title}: ${insight.detail}`)}
          className="w-full self-start whitespace-nowrap sm:w-auto"
        />
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {insights.map((insight, index) => (
          <div
            key={`${insight.title}-${index}`}
            className={`rounded-[1.25rem] border p-4 ${toneStyles[insight.tone || 'neutral']}`}
          >
            <p className="text-sm font-semibold">{insight.title}</p>
            <p className="mt-2 text-sm leading-6 opacity-90">{insight.detail}</p>
          </div>
        ))}
      </div>

      {nextSteps.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-3">
          {nextSteps.map((step) => (
            <Link
              key={`${step.to}-${step.label}`}
              to={step.to}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${
                isDark ? 'bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/15' : 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100'
              }`}
            >
              {step.label}
              <ArrowRight size={14} />
            </Link>
          ))}
        </div>
      )}

      <Link
        to="/starter-pack"
        className={`mt-5 flex flex-col gap-3 rounded-[1.25rem] border p-4 sm:flex-row sm:items-center sm:justify-between ${
          isDark ? 'border-cyan-400/15 bg-cyan-400/5' : 'border-cyan-200 bg-cyan-50'
        }`}
      >
        <span>
          <span className={`block text-sm font-semibold ${isDark ? 'text-cyan-100' : 'text-cyan-900'}`}>Keep this result in a complete money-planning system</span>
          <span className={`mt-1 block text-xs leading-5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Budget, net worth, goals, emergency fund and annual review templates.</span>
        </span>
        <span className={`inline-flex shrink-0 items-center gap-2 text-sm font-bold ${isDark ? 'text-cyan-200' : 'text-cyan-700'}`}>
          Free Starter Pack <ArrowRight size={14} />
        </span>
      </Link>
    </section>
  );
};

export default ActionableInsights;
