import React, { useState } from 'react';
import { BadgeIndianRupee, ExternalLink, Scale } from 'lucide-react';
import CalculatorLayout from '../components/CalculatorLayout';
import { Button, FormField, Input, ResultDisplay } from '../components/CalculatorForm';
import { CalculatorNotice, CalculatorPanel } from '../components/CalculatorPanel';
import FinancialChart from '../components/FinancialChart';
import ActionableInsights from '../components/ActionableInsights';
import { calculateSalaryTaxComparison, TaxComparisonResult } from '../utils/advancedCalculators';
import { formatCurrencyINR } from '../utils/finance';

const IncomeTaxCalculator: React.FC = () => {
  const [salary, setSalary] = useState(1_500_000);
  const [deductions, setDeductions] = useState(250_000);
  const [result, setResult] = useState<TaxComparisonResult | null>(null);

  const calculate = () => {
    if (salary <= 0 || salary > 5_000_000 || deductions < 0) return;
    setResult(calculateSalaryTaxComparison(salary, deductions));
  };
  const recommendation = result?.recommended === 'old' ? 'Old regime' : result?.recommended === 'new' ? 'New regime' : 'Both are equal';

  return (
    <CalculatorLayout title="Old vs New Income Tax Calculator" description="Compare estimated salary tax under both regimes for FY 2025–26 (AY 2026–27)." icon={<Scale size={24} />}>
      <CalculatorNotice tone="warning">
        This simplified estimate is for resident salaried individuals under 60 with ordinary salary income up to ₹50 lakh. It includes standard deduction, eligible rebate, marginal relief and 4% cess, but excludes surcharge and special-rate income.
      </CalculatorNotice>
      <div className="mt-5 grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <CalculatorPanel eyebrow="FY 2025–26" title="Income and deductions">
          <FormField label="Annual gross salary"><Input type="number" prefix="₹" value={salary} min="100000" max="5000000" onChange={(e) => setSalary(Number(e.target.value))} /></FormField>
          <FormField label="Old-regime deductions and exemptions" hint="Enter eligible totals such as 80C, HRA, home-loan interest, NPS and health insurance. Do not include the ₹50,000 standard deduction—it is applied automatically.">
            <Input type="number" prefix="₹" value={deductions} min="0" max={salary} onChange={(e) => setDeductions(Number(e.target.value))} />
          </FormField>
          <Button className="w-full" disabled={salary <= 0 || salary > 5_000_000} onClick={calculate}><BadgeIndianRupee size={18} /> Compare tax regimes</Button>
          {salary > 5_000_000 && <p className="mt-3 text-sm text-rose-500">This simplified comparison supports salary up to ₹50 lakh.</p>}
          <a className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-cyan-700 hover:underline dark:text-cyan-300" href="https://www.incometax.gov.in/iec/foportal/help/individual/return-applicable-1" target="_blank" rel="noreferrer">
            Verify AY 2026–27 slabs on Income Tax India <ExternalLink size={14} />
          </a>
        </CalculatorPanel>

        <CalculatorPanel eyebrow="Regime comparison" title={result ? `${recommendation} estimates lower tax` : 'Your comparison will appear here'}>
          {result ? <>
            <div className="grid gap-3 sm:grid-cols-2">
              <ResultDisplay label="Old-regime tax" value={formatCurrencyINR(result.oldTax)} highlight={result.recommended === 'old'} subtext={`Taxable income ${formatCurrencyINR(result.oldTaxableIncome)}`} />
              <ResultDisplay label="New-regime tax" value={formatCurrencyINR(result.newTax)} highlight={result.recommended === 'new'} subtext={`Taxable income ${formatCurrencyINR(result.newTaxableIncome)}`} />
            </div>
            <div className="rounded-2xl bg-emerald-500/10 p-4 text-emerald-800 dark:text-emerald-100">
              <p className="text-xs font-bold uppercase tracking-[0.15em]">Estimated annual saving</p>
              <p className="mt-1 text-3xl font-bold tabular-nums">{formatCurrencyINR(result.savings)}</p>
              <p className="mt-1 text-sm">with {recommendation.toLowerCase()}</p>
            </div>
            <FinancialChart data={[{ name: 'Old regime', value: result.oldTax, color: 'rose' }, { name: 'New regime', value: result.newTax, color: 'emerald' }]} type="bar" title="Estimated tax payable" height={240} showLegend={false} />
          </> : <p className="min-h-48 text-sm leading-7 text-slate-500 dark:text-slate-400">Add only deductions that you are actually eligible to claim. The new regime is the default, but eligible non-business taxpayers can compare both when filing.</p>}
        </CalculatorPanel>
      </div>
      {result && <ActionableInsights
        summary={`${recommendation} currently estimates ${formatCurrencyINR(result.savings)} less annual tax for the values entered.`}
        insights={[
          { title: 'Old-regime taxable income', detail: `${formatCurrencyINR(result.oldTaxableIncome)} after deductions and standard deduction.`, tone: result.recommended === 'old' ? 'positive' : 'neutral' },
          { title: 'New-regime taxable income', detail: `${formatCurrencyINR(result.newTaxableIncome)} after the ₹75,000 standard deduction.`, tone: result.recommended === 'new' ? 'positive' : 'neutral' },
          { title: 'Important check', detail: 'Confirm exemptions, special-rate income and eligibility before filing your return.', tone: 'caution' },
        ]}
        nextSteps={[{ label: 'Calculate HRA exemption', to: '/calculators/hra' }, { label: 'Plan NPS contributions', to: '/calculators/nps' }]}
      />}
    </CalculatorLayout>
  );
};

export default IncomeTaxCalculator;
