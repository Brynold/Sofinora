import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import App from './App';

afterEach(() => {
  cleanup();
  localStorage.clear();
  window.history.pushState({}, '', '/');
});

const routes = [
  ['/calculators/cagr', 'CAGR Calculator'],
  ['/calculators/irr', 'IRR Calculator'],
  ['/calculators/rd', 'RD Calculator'],
  ['/calculators/sip', 'SIP Calculator'],
  ['/calculators/nsc', 'NSC Calculator'],
  ['/calculators/fd', 'Fixed Deposit (FD) Calculator'],
  ['/calculators/hra', 'HRA Calculator'],
  ['/calculators/mf', 'Mutual Fund Calculator'],
  ['/calculators/goal-sip', 'Goal SIP Calculator'],
  ['/calculators/ssy', 'SSY Calculator'],
  ['/calculators/retirement', 'Plan Your Financial Freedom'],
  ['/calculators/nps', 'NPS Calculator'],
  ['/calculators/emi', 'EMI Calculator'],
  ['/calculators/ppf', 'PPF Calculator'],
  ['/calculators/inflation', 'Inflation Calculator'],
  ['/calculators/emergency-fund', 'Emergency Fund Calculator'],
  ['/calculators/net-worth', 'Net Worth Tracker'],
  ['/calculators/income-tax', 'Old vs New Income Tax Calculator'],
  ['/calculators/step-up-sip', 'Step-up SIP Calculator'],
  ['/calculators/home-loan-prepayment', 'Home Loan Prepayment Calculator'],
  ['/calculators/swp', 'SWP Calculator'],
  ['/calculators/youtube-earnings', 'YouTube Earnings Calculator'],
] as const;

const productRoutes = [
  ['/starter-pack', /turn calculator results into a money plan/i],
  ['/contact', /how can we help/i],
  ['/feedback', /help shape the next sofinora release/i],
  ['/disclosure', /paid relationships should never be hidden/i],
] as const;

describe('calculator routes', () => {
  it('loads the open investment video only after consent to play', async () => {
    render(<App />);
    expect(await screen.findByRole('heading', { name: /investment basics/i })).toBeInTheDocument();
    expect(screen.queryByTitle(/investing 101/i)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /play open video/i }));
    expect(screen.getByTitle(/investing 101/i)).toHaveAttribute('src', expect.stringContaining('youtube-nocookie.com'));
  });

  it.each(routes)('renders %s', async (route, heading) => {
    window.history.pushState({}, '', route);
    render(<App />);
    expect(await screen.findByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
  });

  it.each(productRoutes)('renders %s', async (route, heading) => {
    window.history.pushState({}, '', route);
    render(<App />);
    expect(await screen.findByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
  });

  it('navigates from the header Starter Pack CTA', async () => {
    render(<App />);
    fireEvent.click(await screen.findByRole('link', { name: 'Get the free Starter Pack' }));
    expect(await screen.findByRole('heading', { level: 1, name: /turn calculator results into a money plan/i })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/starter-pack');
    expect(window.location.hash).toBe('#free-access');
  });

  it('keeps the Starter Pack CTA actionable on its own page', async () => {
    window.history.pushState({}, '', '/starter-pack');
    render(<App />);

    const cta = await screen.findByRole('link', { name: 'Go to the free access form' });
    expect(cta).toHaveAttribute('href', '/starter-pack#free-access');
    expect(cta).toHaveAttribute('aria-current', 'page');
  });

  it('unlocks the free Starter Pack after email and consent', async () => {
    window.history.pushState({}, '', '/starter-pack');
    render(<App />);

    fireEvent.change(await screen.findByLabelText('Email address'), { target: { value: 'reader@example.com' } });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: /unlock free download/i }));

    expect(await screen.findByRole('heading', { name: /your free access is unlocked/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /download complete starter pack/i })).toHaveAttribute('href', '/downloads/FinPlanner-Starter-Pack.zip');
    expect(screen.getByRole('link', { name: /excel workbook/i })).toHaveAttribute('href', '/downloads/FinPlanner-Complete-Financial-Planner.xlsx');
    expect(screen.getByRole('link', { name: /fillable pdf guide/i })).toHaveAttribute('href', '/downloads/FinPlanner-Complete-Planning-Guide.pdf');
    expect(localStorage.getItem('finplanner:starter-pack-access')).toContain('reader@example.com');
  });

  it('renders a helpful not-found page', async () => {
    window.history.pushState({}, '', '/missing-page');
    render(<App />);
    expect(await screen.findByRole('heading', { level: 1, name: /not part of the plan/i })).toBeInTheDocument();
  });

  it('shows one asset composition and one liability composition card', async () => {
    window.history.pushState({}, '', '/calculators/net-worth');
    render(<App />);

    expect(await screen.findByRole('heading', { name: 'Asset Composition' })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { name: 'Asset Composition' })).toHaveLength(1);
    expect(screen.getAllByRole('heading', { name: 'Liability Composition' })).toHaveLength(1);
    expect(within(screen.getByRole('img', { name: 'Asset composition chart' })).queryByText('Cash & Equivalents')).not.toBeInTheDocument();
  });

  it('edits an existing net-worth asset and recalculates the value', async () => {
    window.history.pushState({}, '', '/calculators/net-worth');
    render(<App />);

    fireEvent.click(await screen.findByRole('button', { name: 'Edit Savings Account' }));
    fireEvent.change(screen.getByLabelText('Asset name'), { target: { value: 'Emergency Savings' } });
    fireEvent.change(screen.getByLabelText('Current value'), { target: { value: '150000' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByText('Emergency Savings')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit Emergency Savings' })).toBeInTheDocument();
  });

  it('keeps retirement allocation labels in a responsive legend', async () => {
    window.history.pushState({}, '', '/calculators/retirement');
    render(<App />);

    fireEvent.click(await screen.findByRole('button', { name: 'Calculate Retirement Corpus' }));

    expect(await screen.findByRole('img', { name: /asset allocation: equity 60%, debt 30%, liquid 10%/i })).toBeInTheDocument();
    expect(screen.queryByText('Equity: 60%')).not.toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
    expect(screen.getByText('30%')).toBeInTheDocument();
    expect(screen.getByText('10%')).toBeInTheDocument();
  });
});
