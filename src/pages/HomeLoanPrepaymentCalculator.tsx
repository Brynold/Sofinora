import React, { useState } from 'react';
import { Home, WalletCards } from 'lucide-react';
import CalculatorLayout from '../components/CalculatorLayout';
import { Button, FormField, Input, ResultDisplay } from '../components/CalculatorForm';
import { CalculatorPanel } from '../components/CalculatorPanel';
import FinancialChart from '../components/FinancialChart';
import ActionableInsights from '../components/ActionableInsights';
import { calculateLoanPrepayment, LoanPrepaymentResult } from '../utils/advancedCalculators';
import { formatCurrencyINR } from '../utils/finance';

const duration = (months: number) => `${Math.floor(months / 12)}y ${months % 12}m`;

const HomeLoanPrepaymentCalculator: React.FC = () => {
  const [principal, setPrincipal] = useState(5_000_000);
  const [rate, setRate] = useState(8.5);
  const [years, setYears] = useState(20);
  const [prepayment, setPrepayment] = useState(500_000);
  const [afterYears, setAfterYears] = useState(3);
  const [extraMonthly, setExtraMonthly] = useState(5_000);
  const [result, setResult] = useState<LoanPrepaymentResult | null>(null);

  const calculate = () => {
    if (principal <= 0 || years <= 0 || rate < 0 || afterYears < 0) return;
    setResult(calculateLoanPrepayment(principal, rate, years, prepayment, afterYears, extraMonthly));
  };

  return (
    <CalculatorLayout title="Home Loan Prepayment Calculator" description="Estimate how a lump-sum or recurring prepayment changes your interest cost and loan closing date." icon={<Home size={24} />}>
      <div className="grid gap-5 lg:grid-cols-2">
        <CalculatorPanel eyebrow="Current loan" title="Loan details">
          <FormField label="Outstanding loan amount"><Input type="number" prefix="₹" value={principal} min="10000" onChange={(e) => setPrincipal(Number(e.target.value))} /></FormField>
          <div className="grid gap-1 sm:grid-cols-2 sm:gap-4">
            <FormField label="Interest rate"><Input type="number" suffix="%" value={rate} min="0" max="30" step="0.1" onChange={(e) => setRate(Number(e.target.value))} /></FormField>
            <FormField label="Remaining tenure"><Input type="number" suffix="years" amountInWords={false} value={years} min="1" max="40" onChange={(e) => setYears(Number(e.target.value))} /></FormField>
          </div>
        </CalculatorPanel>
        <CalculatorPanel eyebrow="Prepayment plan" title="Test your strategy">
          <FormField label="One-time prepayment"><Input type="number" prefix="₹" value={prepayment} min="0" onChange={(e) => setPrepayment(Number(e.target.value))} /></FormField>
          <FormField label="Make it after"><Input type="number" suffix="years" amountInWords={false} value={afterYears} min="0" max={years} onChange={(e) => setAfterYears(Number(e.target.value))} /></FormField>
          <FormField label="Extra payment every month"><Input type="number" prefix="₹" value={extraMonthly} min="0" onChange={(e) => setExtraMonthly(Number(e.target.value))} /></FormField>
          <Button className="w-full" onClick={calculate}><WalletCards size={18} /> Calculate savings</Button>
        </CalculatorPanel>
      </div>
      {result && <>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ResultDisplay label="Regular EMI" value={formatCurrencyINR(result.emi)} />
          <ResultDisplay label="Interest saved" value={formatCurrencyINR(result.interestSaved)} highlight />
          <ResultDisplay label="Time saved" value={duration(result.monthsSaved)} />
          <ResultDisplay label="New payoff time" value={duration(result.revisedMonths)} />
        </div>
        <CalculatorPanel className="mt-5" title="Outstanding balance after prepayments">
          <FinancialChart data={result.yearly.map((point) => ({ name: `Y${Math.ceil(point.year)}`, value: point.value }))} type="area" height={290} showLegend={false} />
        </CalculatorPanel>
        <ActionableInsights
          summary={`Your planned prepayments could save about ${formatCurrencyINR(result.interestSaved)} and close the loan ${duration(result.monthsSaved)} earlier.`}
          insights={[
            { title: 'Revised interest', detail: `${formatCurrencyINR(result.revisedInterest)} versus ${formatCurrencyINR(result.originalInterest)} without prepayment.`, tone: 'positive' },
            { title: 'Monthly cash commitment', detail: `${formatCurrencyINR(result.emi + extraMonthly)} including the extra payment.`, tone: 'action' },
            { title: 'Before paying', detail: 'Confirm lender prepayment rules and keep an adequate emergency fund.', tone: 'caution' },
          ]}
          nextSteps={[{ label: 'Check emergency fund', to: '/calculators/emergency-fund' }, { label: 'Compare regular EMI', to: '/calculators/emi' }]}
        />
      </>}
    </CalculatorLayout>
  );
};

export default HomeLoanPrepaymentCalculator;
