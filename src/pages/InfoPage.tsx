import { Link } from '../router';
import { ArrowRight, BookOpen, LockKeyhole, Scale, Sparkles } from 'lucide-react';

type PageType = 'about' | 'methodology' | 'privacy' | 'terms' | 'disclosure';

const content: Record<PageType, {
  eyebrow: string;
  title: string;
  intro: string;
  icon: typeof Sparkles;
  sections: Array<{ heading: string; body: string }>;
}> = {
  about: {
    eyebrow: 'Built for clearer decisions',
    title: 'Money math should be understandable.',
    intro: 'Sofinora brings India-focused saving, investing, tax and retirement calculations into one calm, privacy-first workspace.',
    icon: Sparkles,
    sections: [
      { heading: 'What we solve', body: 'Financial choices often hide their most important trade-offs. Sofinora shows contributions, projected growth, interest, inflation and time together so you can compare options before acting.' },
      { heading: 'What we do not do', body: 'Sofinora does not recommend securities, promise returns or replace a qualified financial or tax professional. It provides educational estimates based on the assumptions you choose.' },
      { heading: 'Our standard', body: 'Calculations should explain their assumptions, use plain language and protect your privacy. Government-scheme rules and default rates are reviewed against official sources and should always be verified before a transaction.' },
    ],
  },
  methodology: {
    eyebrow: 'Transparent by design',
    title: 'Know what sits behind every result.',
    intro: 'Results are projections, not promises. Each calculator applies standard time-value-of-money formulas to the values you enter.',
    icon: BookOpen,
    sections: [
      { heading: 'Growth calculations', body: 'SIP, mutual-fund and retirement projections compound the selected annual return at monthly intervals. CAGR annualizes the change between starting and ending values. IRR finds a discount rate that brings the entered cash flows close to a zero net present value.' },
      { heading: 'Government savings', body: 'PPF, NSC, NPS and Sukanya calculations use scheme-specific contribution and maturity rules. Displayed rates are editable because government rates and product terms can change.' },
      { heading: 'Tax and inflation', body: 'HRA estimates use the least of actual HRA, eligible rent above 10% of salary, and the applicable metro or non-metro salary percentage. Inflation calculations compound the rate entered by the user.' },
      { heading: 'Rounding and timing', body: 'Intermediate calculations use full precision and displayed amounts may be rounded to the nearest rupee. Deposit timing can change actual interest, so each projection should be treated as an estimate.' },
    ],
  },
  privacy: {
    eyebrow: 'Privacy first',
    title: 'Your financial inputs stay yours.',
    intro: 'The calculators run in your browser. Sofinora does not require an account to calculate a result.',
    icon: LockKeyhole,
    sections: [
      { heading: 'Calculator information', body: 'Values entered into calculators are processed on your device. The Net Worth tool may use local browser storage so your entries remain available on the same device.' },
      { heading: 'Cookies and preferences', body: 'Sofinora uses a necessary cookie to remember your cookie selection for 180 days. If you allow preferences, it also stores your selected light or dark theme in a first-party cookie for up to one year. Sofinora does not currently use advertising or cross-site tracking cookies. You can change your choice through Cookie settings in the footer.' },
      { heading: 'No sale of financial data', body: 'Sofinora does not sell calculator inputs or use them to make lending, insurance or investment decisions.' },
      { heading: 'Starter Pack registration', body: 'When Google Sheets registration is enabled, Sofinora records the submitted email address, registration time, source, consent status and access mode in a private Google Sheet. This information is used to provide access and measure Phase 1 engagement, not to make financial decisions or send marketing without separate consent.' },
      { heading: 'Feedback and suggestions', body: 'When you submit feedback, Sofinora stores the selected category, message, optional email address, submission time, source and page path in a private Google Sheet. This information is used to review bugs and improve the product. Do not include passwords, account numbers, identity documents or sensitive financial information.' },
      { heading: 'Storage and deletion', body: 'Registration records are stored using Google Workspace services controlled by Sofinora and retained only while needed for access management and Phase 1 reporting. You may request correction or deletion through the Contact page once support email is enabled.' },
      { heading: 'Purchases', body: 'When a paid product is enabled, checkout and payment details are handled by the named payment provider under its privacy policy. Sofinora does not request or store complete card, banking, PIN or UPI credential information.' },
    ],
  },
  terms: {
    eyebrow: 'Important information',
    title: 'Use estimates as a starting point.',
    intro: 'Sofinora is an educational planning tool and does not provide personalized investment, legal, accounting or tax advice.',
    icon: Scale,
    sections: [
      { heading: 'No guarantee', body: 'Market returns, inflation, interest rates, tax rules and government-scheme terms can change. Actual outcomes may differ materially from projections.' },
      { heading: 'Verify before acting', body: 'Confirm current rates, eligibility, taxation and product documents with the relevant official institution or a qualified professional before committing money.' },
      { heading: 'User responsibility', body: 'You are responsible for the accuracy of inputs and for decisions made using the outputs. Sofinora should be one source of information, not the sole basis for a financial decision.' },
      { heading: 'Digital products', body: 'Templates provided during the free Phase 1 release are licensed to the registered user for personal use. Original files may not be resold, redistributed, published or uploaded for public download.' },
    ],
  },
  disclosure: {
    eyebrow: 'Commercial transparency',
    title: 'Paid relationships should never be hidden.',
    intro: 'Sofinora may earn revenue from its own digital products and, in the future, from clearly labelled affiliate or sponsored links.',
    icon: Scale,
    sections: [
      { heading: 'Our products', body: 'The Sofinora Starter Pack is free during Phase 1. If it becomes paid later, the product page will clearly show the price, contents and personal-use licence before checkout.' },
      { heading: 'Affiliate links', body: 'A link that may earn Sofinora a commission will be labelled Affiliate link, Sponsored or a similarly clear disclosure near the link. A commercial relationship does not change the price paid by the visitor unless explicitly stated.' },
      { heading: 'No pay-to-rank calculators', body: 'Payment does not determine calculator formulas, default assumptions or educational explanations. Sponsored products will not be presented as guaranteed, risk-free or suitable for everyone.' },
      { heading: 'Financial-information boundary', body: 'Sofinora provides educational calculations, not recommendations to buy or sell securities. Visitors should verify product documents and use appropriately registered professionals where personalized advice is required.' },
    ],
  },
};

export default function InfoPage({ type }: { type: PageType }) {
  const page = content[type];
  const Icon = page.icon;
  return (
    <article className="mx-auto w-full max-w-5xl py-8 sm:py-14">
      <div className="overflow-hidden rounded-[2rem] bg-slate-950 p-7 text-white shadow-2xl sm:p-12">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-200"><Icon size={24} /></div>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">{page.eyebrow}</p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-bold tracking-tight sm:text-5xl">{page.title}</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">{page.intro}</p>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {page.sections.map((section) => (
          <section key={section.heading} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900">
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">{section.heading}</h2>
            <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">{section.body}</p>
          </section>
        ))}
      </div>
      {type === 'methodology' && (
        <section className="mt-6 rounded-3xl border border-cyan-200 bg-cyan-50 p-6 dark:border-cyan-400/20 dark:bg-cyan-400/5">
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">Primary references</h2>
          <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold text-cyan-800 dark:text-cyan-200">
            <a href="https://www.indiapost.gov.in/banking-services/savings" target="_blank" rel="noreferrer" className="rounded-full bg-white px-4 py-2 shadow-sm dark:bg-slate-900">India Post savings schemes</a>
            <a href="https://www.incometax.gov.in/" target="_blank" rel="noreferrer" className="rounded-full bg-white px-4 py-2 shadow-sm dark:bg-slate-900">Income Tax Department</a>
            <a href="https://www.pfrda.org.in/" target="_blank" rel="noreferrer" className="rounded-full bg-white px-4 py-2 shadow-sm dark:bg-slate-900">PFRDA</a>
            <a href="https://www.rbi.org.in/" target="_blank" rel="noreferrer" className="rounded-full bg-white px-4 py-2 shadow-sm dark:bg-slate-900">Reserve Bank of India</a>
          </div>
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">Assumptions and regulatory copy last reviewed: July 2026.</p>
        </section>
      )}
      <Link to="/" className="mt-8 inline-flex items-center gap-2 rounded-full bg-cyan-500 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-400">Explore calculators <ArrowRight size={17} /></Link>
    </article>
  );
}
