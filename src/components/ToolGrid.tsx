import React, { useDeferredValue, useState } from 'react';
import ToolCard from './ToolCard';
import {
  Banknote,
  BarChart3,
  Calculator,
  Coins,
  CreditCard,
  HeartPulse,
  Home,
  Landmark,
  LineChart,
  PercentSquare,
  PiggyBank,
  Scale,
  Search,
  Shield,
  Sparkles,
  CalendarClock,
  ArrowUpRight,
  PlayCircle,
  Target,
  TrendingUp,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

type ToolCategory = 'investment' | 'savings' | 'retirement' | 'tax' | 'income';
type ToolStatus = 'implemented' | 'coming-soon';
type CategoryFilter = ToolCategory | 'all';

interface Tool {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  category: ToolCategory;
  status: ToolStatus;
}

const tools: Tool[] = [
  {
    id: 'youtube-earnings',
    title: 'YouTube Earnings Calculator',
    description: 'Estimate monthly and yearly creator income from views, RPM, and brand revenue.',
    icon: <PlayCircle size={22} />,
    route: '/calculators/youtube-earnings',
    category: 'income',
    status: 'implemented'
  },
  {
    id: 'income-tax',
    title: 'Income Tax Calculator',
    description: 'Compare old and new tax regimes for FY 2025–26 and see the estimated saving.',
    icon: <Scale size={22} />,
    route: '/calculators/income-tax',
    category: 'tax',
    status: 'implemented'
  },
  {
    id: 'step-up-sip',
    title: 'Step-up SIP Calculator',
    description: 'Compare a rising annual SIP with a flat SIP and measure the extra corpus.',
    icon: <ArrowUpRight size={22} />,
    route: '/calculators/step-up-sip',
    category: 'investment',
    status: 'implemented'
  },
  {
    id: 'home-loan-prepayment',
    title: 'Home Loan Prepayment',
    description: 'See how lump-sum and monthly prepayments reduce interest and loan tenure.',
    icon: <Home size={22} />,
    route: '/calculators/home-loan-prepayment',
    category: 'savings',
    status: 'implemented'
  },
  {
    id: 'swp',
    title: 'SWP Calculator',
    description: 'Test how long an investment corpus can support regular withdrawals.',
    icon: <CalendarClock size={22} />,
    route: '/calculators/swp',
    category: 'retirement',
    status: 'implemented'
  },
  {
    id: 'fd',
    title: 'FD Calculator',
    description: 'Project maturity amount, interest earned, and compounding impact for fixed deposits.',
    icon: <Banknote size={22} />,
    route: '/calculators/fd',
    category: 'savings',
    status: 'implemented'
  },
  {
    id: 'emi',
    title: 'EMI Calculator',
    description: 'Estimate monthly loan payments, total interest, and amortization schedule.',
    icon: <CreditCard size={22} />,
    route: '/calculators/emi',
    category: 'savings',
    status: 'implemented'
  },
  {
    id: 'ppf',
    title: 'PPF Calculator',
    description: 'Map yearly contributions, credited interest, and maturity value for PPF.',
    icon: <Shield size={22} />,
    route: '/calculators/ppf',
    category: 'savings',
    status: 'implemented'
  },
  {
    id: 'retirement',
    title: 'Retirement Calculator',
    description: 'Estimate your future corpus and sustainable monthly income after retirement.',
    icon: <HeartPulse size={22} />,
    route: '/calculators/retirement',
    category: 'retirement',
    status: 'implemented'
  },
  {
    id: 'nps',
    title: 'NPS Calculator',
    description: 'Plan NPS contributions, annuity split, and lump-sum corpus at retirement.',
    icon: <HeartPulse size={22} />,
    route: '/calculators/nps',
    category: 'retirement',
    status: 'implemented'
  },
  {
    id: 'rd',
    title: 'RD Calculator',
    description: 'See how recurring deposits grow month by month under different compounding options.',
    icon: <TrendingUp size={22} />,
    route: '/calculators/rd',
    category: 'savings',
    status: 'implemented'
  },
  {
    id: 'cagr',
    title: 'CAGR Calculator',
    description: 'Measure the annualized growth rate of an investment over time.',
    icon: <LineChart size={22} />,
    route: '/calculators/cagr',
    category: 'investment',
    status: 'implemented'
  },
  {
    id: 'nsc',
    title: 'NSC Calculator',
    description: 'Check maturity amount and annual compounding for National Savings Certificates.',
    icon: <Calculator size={22} />,
    route: '/calculators/nsc',
    category: 'savings',
    status: 'implemented'
  },
  {
    id: 'hra',
    title: 'HRA Calculator',
    description: 'Calculate exempt and taxable HRA based on salary, rent, and city type.',
    icon: <Home size={22} />,
    route: '/calculators/hra',
    category: 'tax',
    status: 'implemented'
  },
  {
    id: 'mf',
    title: 'Mutual Fund Calculator',
    description: 'Compare SIP and lumpsum growth for mutual fund investments.',
    icon: <BarChart3 size={22} />,
    route: '/calculators/mf',
    category: 'investment',
    status: 'implemented'
  },
  {
    id: 'ssy',
    title: 'SSY Calculator',
    description: 'Plan Sukanya Samriddhi contributions and maturity timeline for your child.',
    icon: <Sparkles size={22} />,
    route: '/calculators/ssy',
    category: 'savings',
    status: 'implemented'
  },
  {
    id: 'irr',
    title: 'IRR Calculator',
    description: 'Evaluate uneven cash flows with a more robust internal rate of return estimate.',
    icon: <Landmark size={22} />,
    route: '/calculators/irr',
    category: 'investment',
    status: 'implemented'
  },
  {
    id: 'sip',
    title: 'SIP Calculator',
    description: 'Estimate future wealth from disciplined monthly investing.',
    icon: <Coins size={22} />,
    route: '/calculators/sip',
    category: 'investment',
    status: 'implemented'
  },
  {
    id: 'goal-sip',
    title: 'Goal SIP Calculator',
    description: 'Work backwards from your target amount to the SIP required each month.',
    icon: <Target size={22} />,
    route: '/calculators/goal-sip',
    category: 'investment',
    status: 'implemented'
  },
  {
    id: 'inflation',
    title: 'Inflation Calculator',
    description: 'See how much more money you will need to preserve purchasing power.',
    icon: <PercentSquare size={22} />,
    route: '/calculators/inflation',
    category: 'investment',
    status: 'implemented'
  },
  {
    id: 'emergency-fund',
    title: 'Emergency Fund Calculator',
    description: 'Estimate the right buffer for your living costs, risk profile, and dependents.',
    icon: <PiggyBank size={22} />,
    route: '/calculators/emergency-fund',
    category: 'savings',
    status: 'implemented'
  },
  {
    id: 'net-worth',
    title: 'Net Worth Tracker',
    description: 'Track assets, liabilities, and overall financial health in one place.',
    icon: <Scale size={22} />,
    route: '/calculators/net-worth',
    category: 'investment',
    status: 'implemented'
  }
];

const categoryMeta: Record<ToolCategory, {
  accent: string;
  description: string;
  label: string;
}> = {
  investment: {
    accent: 'from-cyan-500 to-blue-600',
    description: 'Growth, returns, projection, and portfolio math.',
    label: 'Investment Calculators',
  },
  savings: {
    accent: 'from-emerald-500 to-teal-600',
    description: 'Deposits, reserves, and stable saving strategies.',
    label: 'Savings And Deposits',
  },
  retirement: {
    accent: 'from-amber-400 to-orange-500',
    description: 'Corpus planning, pension estimates, and long-term goals.',
    label: 'Retirement Planning',
  },
  tax: {
    accent: 'from-rose-500 to-fuchsia-600',
    description: 'Practical exemption and take-home calculations.',
    label: 'Tax Planning',
  },
  income: {
    accent: 'from-violet-500 to-fuchsia-600',
    description: 'Creator revenue, side income, and earning potential.',
    label: 'Income Calculators',
  },
};

const ToolGrid: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  const filteredTools = tools.filter((tool) => {
    const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
    const matchesQuery =
      deferredQuery.length === 0 ||
      tool.title.toLowerCase().includes(deferredQuery) ||
      tool.description.toLowerCase().includes(deferredQuery);

    return matchesCategory && matchesQuery;
  });

  const sections = Object.entries(categoryMeta)
    .map(([category, meta]) => ({
      category: category as ToolCategory,
      meta,
      tools: filteredTools.filter((tool) => tool.category === category),
    }))
    .filter((section) => section.tools.length > 0);

  const implementedCount = tools.filter((tool) => tool.status === 'implemented').length;

  return (
    <section id="calculator-directory" className="space-y-8">
      <div className={`rounded-[1.75rem] border px-6 py-6 shadow-soft-lg sm:px-8 ${
        isDark
          ? 'border-white/10 bg-slate-900/75'
          : 'border-white/70 bg-white/85'
      }`}>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${
              isDark ? 'text-cyan-300' : 'text-cyan-700'
            }`}>
              Calculator Directory
            </p>
            <h2 className={`mt-2 text-3xl font-display font-bold ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Find the right tool by question, not just by name.
            </h2>
            <p className={`mt-3 text-sm leading-6 ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}>
              Search for the problem you’re solving, then jump into a calculator with clearer breakups,
              more reliable formulas, and better year-wise views.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[420px]">
            <div className={`rounded-2xl border p-4 ${
              isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'
            }`}>
              <p className={`text-xs uppercase tracking-[0.16em] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Available now</p>
              <p className={`mt-2 text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{implementedCount}</p>
            </div>
            <div className={`rounded-2xl border p-4 ${
              isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'
            }`}>
              <p className={`text-xs uppercase tracking-[0.16em] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Planning lanes</p>
              <p className={`mt-2 text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>5</p>
            </div>
            <div className={`rounded-2xl border p-4 ${
              isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'
            }`}>
              <p className={`text-xs uppercase tracking-[0.16em] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Search results</p>
              <p className={`mt-2 text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{filteredTools.length}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 lg:min-w-[360px] ${
            isDark ? 'border-white/10 bg-slate-950/70' : 'border-slate-200 bg-slate-50'
          }`}>
            <Search size={18} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by calculator or financial question"
              className={`w-full bg-transparent text-sm outline-none ${
                isDark ? 'text-white placeholder:text-slate-500' : 'text-slate-900 placeholder:text-slate-500'
              }`}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {(['all', 'investment', 'savings', 'retirement', 'tax', 'income'] as CategoryFilter[]).map((category) => {
              const label = category === 'all' ? 'All tools' : categoryMeta[category].label;
              const isActive = activeCategory === category;

              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-950 text-white dark:bg-cyan-400 dark:text-slate-950'
                      : isDark
                        ? 'bg-white/5 text-slate-300 hover:bg-white/10'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {sections.length === 0 ? (
        <div className={`rounded-[1.5rem] border border-dashed px-6 py-12 text-center ${
          isDark ? 'border-white/10 bg-slate-900/65 text-slate-300' : 'border-slate-300 bg-white/80 text-slate-600'
        }`}>
          <p className="text-lg font-semibold">No calculators matched this search.</p>
          <p className="mt-2 text-sm">Try a simpler phrase like “retirement”, “EMI”, or “inflation”.</p>
        </div>
      ) : (
        sections.map((section) => (
          <div key={section.category} className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white ${section.meta.accent}`}>
                  {section.meta.label}
                </div>
                <p className={`mt-2 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  {section.meta.description}
                </p>
              </div>
              <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {section.tools.length} calculators
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {section.tools.map((tool) => (
                <ToolCard
                  key={tool.id}
                  title={tool.title}
                  description={tool.description}
                  icon={tool.icon}
                  route={tool.route}
                  status={tool.status}
                  categoryLabel={section.meta.label}
                />
              ))}
            </div>
          </div>
        ))
      )}
    </section>
  );
};

export default ToolGrid;
