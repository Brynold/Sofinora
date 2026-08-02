# Sofinora India

Sofinora is a privacy-first collection of India-focused financial planning calculators. It helps people compare saving, investing, borrowing, tax and retirement scenarios with clear assumptions and year-by-year projections.

## Calculators

- SIP, goal SIP and mutual-fund growth
- CAGR and IRR
- Fixed deposit, recurring deposit and NSC
- PPF and Sukanya Samriddhi
- NPS and retirement planning
- EMI and amortization
- HRA exemption
- Inflation, emergency fund and net worth
- Guided retirement-readiness assessment

Calculator inputs are processed in the browser. The Net Worth tracker stores entries locally on the user's device.

## Local development

Requires Node.js 20.19 or newer.

```bash
npm install
npm run dev
```

## Quality checks

```bash
npm test
npm run build
```

The build command performs TypeScript validation before producing the optimized site in `dist/`.

## Phase 1 commerce setup

Copy `.env.example` to `.env.local` and provide:

- `VITE_STARTER_PACK_PAYMENT_URL`: hosted checkout/payment link that delivers `outputs/FinPlanner-Starter-Pack.zip`
- `VITE_SUPPORT_EMAIL`: customer support email shown on the contact page
- `VITE_PUBLIC_SITE_URL`: final public origin, used to generate `sitemap.xml` and the sitemap line in `robots.txt`

The website never exposes the paid ZIP from `public/`; upload it directly to the selected checkout or digital-delivery provider.

## Technology

- React and TypeScript
- Vite and Vitest
- Tailwind CSS
- React Router
- Recharts and Chart.js
- Framer Motion and Lucide icons

## Important notice

Sofinora provides educational estimates, not personalized financial, legal, accounting or tax advice. Rates, regulations and product terms can change; users should verify current official information before acting.
