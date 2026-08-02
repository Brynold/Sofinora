import React, { useState } from 'react';
import { ExternalLink, PlayCircle, Sparkles } from 'lucide-react';
import CalculatorLayout from '../components/CalculatorLayout';
import { Button, FormField, Input, ResultDisplay } from '../components/CalculatorForm';
import { CalculatorNotice, CalculatorPanel } from '../components/CalculatorPanel';
import FinancialChart from '../components/FinancialChart';
import ActionableInsights from '../components/ActionableInsights';
import { estimateYouTubeEarnings, YouTubeEarningsResult } from '../utils/advancedCalculators';
import { formatCurrencyINR } from '../utils/finance';

const YouTubeEarningsCalculator: React.FC = () => {
  const [views, setViews] = useState(500_000);
  const [lowRpm, setLowRpm] = useState(20);
  const [expectedRpm, setExpectedRpm] = useState(80);
  const [highRpm, setHighRpm] = useState(200);
  const [outsideIncome, setOutsideIncome] = useState(0);
  const [result, setResult] = useState<YouTubeEarningsResult | null>(null);

  const calculate = () => {
    if (views < 0 || lowRpm < 0 || expectedRpm < lowRpm || highRpm < expectedRpm || outsideIncome < 0) return;
    setResult(estimateYouTubeEarnings(views, lowRpm, expectedRpm, highRpm, outsideIncome));
  };
  const invalidRange = expectedRpm < lowRpm || highRpm < expectedRpm;

  return (
    <CalculatorLayout
      title="YouTube Earnings Calculator"
      description="Estimate a creator’s monthly and yearly revenue using views and an editable RPM range."
      icon={<PlayCircle size={24} />}
    >
      <CalculatorNotice>
        RPM means estimated creator revenue per 1,000 views after YouTube’s revenue share. For the closest estimate, copy RPM from YouTube Studio → Analytics → Revenue. Public views alone cannot reveal a creator’s exact income.
      </CalculatorNotice>

      <div className="mt-5 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <CalculatorPanel eyebrow="Channel activity" title="Views and RPM assumptions">
          <FormField label="Monthly video views" hint="Use total monthly views across long videos, Shorts and live streams only if the RPM range represents that mix.">
            <Input type="number" value={views} min="0" amountInWords={false} onChange={(e) => setViews(Number(e.target.value))} />
          </FormField>

          <div className="grid gap-1 sm:grid-cols-3 sm:gap-3">
            <FormField label="Low RPM"><Input type="number" prefix="₹" suffix="/1K" value={lowRpm} min="0" step="1" amountInWords={false} onChange={(e) => setLowRpm(Number(e.target.value))} /></FormField>
            <FormField label="Expected RPM"><Input type="number" prefix="₹" suffix="/1K" value={expectedRpm} min="0" step="1" amountInWords={false} onChange={(e) => setExpectedRpm(Number(e.target.value))} /></FormField>
            <FormField label="High RPM"><Input type="number" prefix="₹" suffix="/1K" value={highRpm} min="0" step="1" amountInWords={false} onChange={(e) => setHighRpm(Number(e.target.value))} /></FormField>
          </div>
          {invalidRange && <p className="-mt-3 mb-4 text-sm text-rose-500">Keep the RPM values ordered from low to expected to high.</p>}

          <FormField label="Other monthly creator income" hint="Optional: brand deals, affiliate income, merchandise or services not already included in YouTube RPM.">
            <Input type="number" prefix="₹" value={outsideIncome} min="0" onChange={(e) => setOutsideIncome(Number(e.target.value))} />
          </FormField>

          <Button className="w-full" disabled={invalidRange} onClick={calculate}><Sparkles size={18} /> Estimate creator earnings</Button>
          <a
            href="https://support.google.com/youtube/answer/9314357?hl=en"
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-cyan-700 hover:underline dark:text-cyan-300"
          >
            Understand RPM on YouTube Help <ExternalLink size={14} />
          </a>
        </CalculatorPanel>

        <CalculatorPanel eyebrow="Estimated earnings" title={result ? 'Monthly earning range' : 'Your estimate will appear here'}>
          {result ? <>
            <div className="grid gap-3 sm:grid-cols-3">
              <ResultDisplay label="Low estimate" value={formatCurrencyINR(result.low)} />
              <ResultDisplay label="Expected" value={formatCurrencyINR(result.expected)} highlight />
              <ResultDisplay label="High estimate" value={formatCurrencyINR(result.high)} />
            </div>
            <div className="rounded-2xl border border-emerald-300/30 bg-emerald-400/10 p-4 text-emerald-900 dark:text-emerald-100">
              <p className="text-xs font-bold uppercase tracking-[0.16em]">Expected yearly income</p>
              <p className="mt-1 break-words text-3xl font-bold tabular-nums">{formatCurrencyINR(result.annualExpected)}</p>
              <p className="mt-1 text-sm">before taxes and creator expenses</p>
            </div>
            <FinancialChart
              data={[
                { name: 'Low', value: result.low, color: 'amber' },
                { name: 'Expected', value: result.expected, color: 'primary' },
                { name: 'High', value: result.high, color: 'emerald' },
              ]}
              type="bar"
              title="Monthly revenue range"
              height={260}
              showLegend={false}
            />
          </> : <div className="min-h-52 space-y-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
            <p>The example RPM values are assumptions—not a promise or a platform-wide average.</p>
            <p>Actual RPM varies with geography, topic, season, format, monetization and audience behaviour.</p>
          </div>}
        </CalculatorPanel>
      </div>

      {result && <ActionableInsights
        summary={`${views.toLocaleString('en-IN')} monthly views at an expected RPM of ${formatCurrencyINR(expectedRpm)} could produce about ${formatCurrencyINR(result.expected)} per month including the additional income entered.`}
        insights={[
          { title: 'YouTube-reported revenue', detail: `${formatCurrencyINR(result.youtubeRevenue)} at the expected RPM assumption.`, tone: 'positive' },
          { title: 'Revenue outside RPM', detail: `${formatCurrencyINR(result.additionalIncome)} from sponsorships, affiliates or other entered sources.`, tone: 'neutral' },
          { title: 'Reality check', detail: 'Only the creator’s YouTube Analytics and business records can confirm actual earnings.', tone: 'caution' },
        ]}
        nextSteps={[{ label: 'Estimate income tax', to: '/calculators/income-tax' }, { label: 'Build an emergency fund', to: '/calculators/emergency-fund' }]}
      />}
    </CalculatorLayout>
  );
};

export default YouTubeEarningsCalculator;
