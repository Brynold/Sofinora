import { useEffect } from 'react';
import { useLocation } from '../router';

const routeMeta: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'Sofinora India — Clear financial planning calculators',
    description: 'Free, privacy-first calculators for SIP, PPF, NPS, retirement, tax, loans and savings in India.',
  },
  '/secure-your-future': {
    title: 'Retirement Readiness Check | Sofinora India',
    description: 'Build an inflation-aware retirement estimate with a simple guided planning flow.',
  },
  '/starter-pack': {
    title: 'Sofinora Starter Pack — Budget, Goals & Net Worth Templates',
    description: 'Get the free Phase 1 Sofinora Starter Pack with an editable Indian personal-finance workbook and printable annual planning worksheet.',
  },
  '/contact': {
    title: 'Contact Sofinora India',
    description: 'Contact Sofinora for calculator support, Starter Pack questions, and purchase assistance.',
  },
  '/feedback': {
    title: 'Feedback & Suggestions | Sofinora India',
    description: 'Share a Sofinora feature suggestion, report a calculator issue, or tell us how to make financial planning clearer.',
  },
  '/about': {
    title: 'About Sofinora India',
    description: 'Why Sofinora exists and how it helps people understand financial trade-offs.',
  },
  '/methodology': {
    title: 'Calculation Methodology | Sofinora India',
    description: 'Review the assumptions, formulas and official sources used by Sofinora calculators.',
  },
  '/privacy': {
    title: 'Privacy Policy | Sofinora India',
    description: 'Learn how Sofinora protects your data and keeps calculator inputs on your device.',
  },
  '/terms': {
    title: 'Terms and Disclaimer | Sofinora India',
    description: 'Important terms, limitations and financial-information disclaimers for Sofinora.',
  },
  '/disclosure': {
    title: 'Affiliate & Commercial Disclosure | Sofinora India',
    description: 'Learn how Sofinora labels paid products, sponsored placements, and affiliate links.',
  },
};

const calculatorNames: Record<string, string> = {
  cagr: 'CAGR', irr: 'IRR', rd: 'Recurring Deposit', sip: 'SIP', nsc: 'NSC', fd: 'Fixed Deposit',
  hra: 'HRA', mf: 'Mutual Fund', 'goal-sip': 'Goal SIP', ssy: 'Sukanya Samriddhi',
  retirement: 'Retirement', nps: 'NPS', emi: 'EMI', ppf: 'PPF', inflation: 'Inflation',
  'emergency-fund': 'Emergency Fund', 'net-worth': 'Net Worth',
  'income-tax': 'Old vs New Income Tax', 'step-up-sip': 'Step-up SIP',
  'home-loan-prepayment': 'Home Loan Prepayment', swp: 'SWP',
  'youtube-earnings': 'YouTube Earnings',
};

const upsertMeta = (name: string, content: string) => {
  let element = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.name = name;
    document.head.appendChild(element);
  }
  element.content = content;
};

export default function Seo() {
  const { pathname } = useLocation();

  useEffect(() => {
    const slug = pathname.startsWith('/calculators/') ? pathname.split('/').pop() ?? '' : '';
    const calculatorName = calculatorNames[slug];
    const meta = calculatorName
      ? {
          title: `${calculatorName} Calculator India | Sofinora`,
          description: `Use the free ${calculatorName} calculator to understand projections, assumptions and financial trade-offs in Indian rupees.`,
        }
      : routeMeta[pathname] ?? {
          title: 'Page not found | Sofinora India',
          description: 'Return to Sofinora to explore free financial planning calculators.',
        };

    document.title = meta.title;
    upsertMeta('description', meta.description);
    upsertMeta('robots', pathname === '/404' ? 'noindex,follow' : 'index,follow');

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `${window.location.origin}${pathname}`;
  }, [pathname]);

  return null;
}
