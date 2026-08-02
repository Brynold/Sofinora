import React, { useState } from 'react';
import { ArrowUpRight, TrendingUp } from 'lucide-react';
import CalculatorLayout from '../components/CalculatorLayout';
import { Button, FormField, Input, ResultDisplay } from '../components/CalculatorForm';
import { CalculatorPanel } from '../components/CalculatorPanel';
import FinancialChart from '../components/FinancialChart';
import ActionableInsights from '../components/ActionableInsights';
import { calculateStepUpSip, StepUpSipResult } from '../utils/advancedCalculators';
import { formatCurrencyINR } from '../utils/finance';

const StepUpSIPCalculator: React.FC = () => {
  const [monthly, setMonthly] = useState(10_000);
  const [stepUp, setStepUp] = useState(10);
  const [returns, setReturns] = useState(12);
  const [years, setYears] = useState(15);
  const [result, setResult] = useState<StepUpSipResult | null>(null);

  const calculate = () => {
    if (monthly <= 0 || years <= 0 || returns < 0 || stepUp < 0) return;
    setResult(calculateStepUpSip(monthly, stepUp, returns, years));
  };

  return (
    <CalculatorLayout title="Step-up SIP Calculator" description="See how increasing your SIP every year can accelerate long-term wealth creation." icon={<TrendingUp size={24} />}>
      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <CalculatorPanel eyebrow="Investment plan" title="Set your SIP growth">
          <FormField label="Starting monthly SIP"><Input type="number" prefix="₹" value={monthly} min="500" onChange={(e) => setMonthly(Number(e.target.value))} /></FormField>
          <FormField label="Annual SIP increase"><Input type="number" suffix="%" value={stepUp} min="0" max="50" onChange={(e) => setStepUp(Number(e.target.value))} /></FormField>
          <FormField label="Expected annual return"><Input type="number" suffix="%" value={returns} min="0" max="40" step="0.1" onChange={(e) => setReturns(Number(e.target.value))} /></FormField>
          <FormField label="Investment period"><Input type="number" suffix="years" amountInWords={false} value={years} min="1" max="50" onChange={(e) => setYears(Number(e.target.value))} /></FormField>
          <Button className="w-full" onClick={calculate}><ArrowUpRight size={18} /> Compare SIP plans</Button>
        </CalculatorPanel>

        <CalculatorPanel eyebrow="Projection" title={result ? 'Step-up advantage' : 'Your comparison will appear here'}>
          {result ? <>
            <div className="grid gap-3 sm:grid-cols-2">
              <ResultDisplay label="Projected corpus" value={formatCurrencyINR(result.maturity)} highlight />
              <ResultDisplay label="Total invested" value={formatCurrencyINR(result.invested)} />
              <ResultDisplay label="Estimated returns" value={formatCurrencyINR(result.returns)} />
              <ResultDisplay label="Extra vs flat SIP" value={formatCurrencyINR(result.maturity - result.flatSipMaturity)} />
            </div>
            <FinancialChart data={result.yearly.map((point) => ({ name: `Y${point.year}`, value: point.value }))} type="area" title="Corpus growth" height={280} showLegend={false} />
          </> : <p className="min-h-48 text-sm leading-7 text-slate-500 dark:text-slate-400">Enter a comfortable annual increase. Even a modest step-up can make a large difference over a long horizon.</p>}
        </CalculatorPanel>
      </div>
      {result && <ActionableInsights
        summary={`Starting at ${formatCurrencyINR(monthly)} per month and increasing it ${stepUp}% yearly could build about ${formatCurrencyINR(result.maturity)} in ${years} years.`}
        insights={[
          { title: 'Step-up advantage', detail: `${formatCurrencyINR(result.maturity - result.flatSipMaturity)} more than keeping the SIP flat.`, tone: 'positive' },
          { title: 'Final-year monthly SIP', detail: `About ${formatCurrencyINR(monthly * Math.pow(1 + stepUp / 100, Math.max(0, years - 1)))} per month.`, tone: 'action' },
          { title: 'Return assumption', detail: `${returns}% is a projection, not a guaranteed investment return.`, tone: 'caution' },
        ]}
        nextSteps={[{ label: 'Plan a target corpus', to: '/calculators/goal-sip' }, { label: 'Check an SWP', to: '/calculators/swp' }]}
      />}
    </CalculatorLayout>
  );
};

export default StepUpSIPCalculator;
