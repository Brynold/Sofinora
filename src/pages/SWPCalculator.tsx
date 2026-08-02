import React, { useState } from 'react';
import { CalendarClock, Landmark } from 'lucide-react';
import CalculatorLayout from '../components/CalculatorLayout';
import { Button, FormField, Input, ResultDisplay } from '../components/CalculatorForm';
import { CalculatorNotice, CalculatorPanel } from '../components/CalculatorPanel';
import FinancialChart from '../components/FinancialChart';
import ActionableInsights from '../components/ActionableInsights';
import { calculateSwp, SwpResult } from '../utils/advancedCalculators';
import { formatCurrencyINR } from '../utils/finance';

const SWPCalculator: React.FC = () => {
  const [corpus, setCorpus] = useState(5_000_000);
  const [withdrawal, setWithdrawal] = useState(30_000);
  const [returns, setReturns] = useState(8);
  const [years, setYears] = useState(20);
  const [increase, setIncrease] = useState(5);
  const [result, setResult] = useState<SwpResult | null>(null);

  const calculate = () => {
    if (corpus <= 0 || withdrawal <= 0 || years <= 0 || returns < 0 || increase < 0) return;
    setResult(calculateSwp(corpus, withdrawal, returns, years, increase));
  };
  const depleted = result?.depletionMonth != null;

  return (
    <CalculatorLayout title="SWP Calculator" description="Test whether your investment corpus can support regular, inflation-aware withdrawals." icon={<CalendarClock size={24} />}>
      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <CalculatorPanel eyebrow="Withdrawal plan" title="Set your cash flow">
          <FormField label="Starting investment corpus"><Input type="number" prefix="₹" value={corpus} min="10000" onChange={(e) => setCorpus(Number(e.target.value))} /></FormField>
          <FormField label="Monthly withdrawal"><Input type="number" prefix="₹" value={withdrawal} min="500" onChange={(e) => setWithdrawal(Number(e.target.value))} /></FormField>
          <div className="grid gap-1 sm:grid-cols-2 sm:gap-4">
            <FormField label="Expected annual return"><Input type="number" suffix="%" value={returns} min="0" max="30" step="0.1" onChange={(e) => setReturns(Number(e.target.value))} /></FormField>
            <FormField label="Annual withdrawal increase"><Input type="number" suffix="%" value={increase} min="0" max="20" step="0.5" onChange={(e) => setIncrease(Number(e.target.value))} /></FormField>
          </div>
          <FormField label="Withdrawal period"><Input type="number" suffix="years" amountInWords={false} value={years} min="1" max="50" onChange={(e) => setYears(Number(e.target.value))} /></FormField>
          <Button className="w-full" onClick={calculate}><Landmark size={18} /> Test withdrawal plan</Button>
        </CalculatorPanel>
        <CalculatorPanel eyebrow="Sustainability" title={result ? (depleted ? 'Corpus may run out early' : 'Corpus lasts through the plan') : 'Your result will appear here'}>
          {result ? <>
            <CalculatorNotice tone={depleted ? 'warning' : 'info'}>
              {depleted ? `At these assumptions the corpus is depleted after about ${Math.floor(result.depletionMonth! / 12)} years and ${result.depletionMonth! % 12} months.` : `The corpus remains positive after ${years} years.`}
            </CalculatorNotice>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <ResultDisplay label="Ending balance" value={formatCurrencyINR(result.endingBalance)} highlight={!depleted} />
              <ResultDisplay label="Total withdrawn" value={formatCurrencyINR(result.totalWithdrawn)} />
            </div>
            <FinancialChart data={result.yearly.map((point) => ({ name: `Y${Math.ceil(point.year)}`, value: point.value }))} type="area" title="Remaining corpus" height={260} showLegend={false} />
          </> : <p className="min-h-48 text-sm leading-7 text-slate-500 dark:text-slate-400">Use the annual withdrawal increase to model rising living costs instead of assuming your expenses stay flat.</p>}
        </CalculatorPanel>
      </div>
      {result && <ActionableInsights
        summary={depleted ? `This SWP may run out before the planned ${years}-year period.` : `This SWP leaves an estimated ${formatCurrencyINR(result.endingBalance)} after ${years} years.`}
        insights={[
          { title: 'Starting withdrawal rate', detail: `${((withdrawal * 12 / corpus) * 100).toFixed(1)}% of the initial corpus per year.`, tone: depleted ? 'caution' : 'neutral' },
          { title: 'Total cash received', detail: `${formatCurrencyINR(result.totalWithdrawn)} over the simulated period.`, tone: 'positive' },
          { title: 'Stress test', detail: 'Try a lower return or higher withdrawal increase before making a retirement decision.', tone: 'action' },
        ]}
        nextSteps={[{ label: 'Plan retirement corpus', to: '/calculators/retirement' }, { label: 'Check inflation', to: '/calculators/inflation' }]}
      />}
    </CalculatorLayout>
  );
};

export default SWPCalculator;
