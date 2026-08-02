import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, ArrowRight, BarChart2, CalendarRange } from 'lucide-react';
import CalculatorLayout from '../components/CalculatorLayout';
import { FormField, Input, Button, ResultDisplay } from '../components/CalculatorForm';
import FinancialChart, { ChartData } from '../components/FinancialChart';
import ActionableInsights from '../components/ActionableInsights';
import { useTheme } from '../context/ThemeContext';
import { calculateMonthlyLoanPayment } from '../utils/finance';

interface AmortizationItem {
  month: number;
  principalPaid: number;
  interestPaid: number;
  remainingBalance: number;
  payment: number;
}

const EMICalculator: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // State variables
  const [loanAmount, setLoanAmount] = useState<number>(1000000);
  const [interestRate, setInterestRate] = useState<number>(10);
  const [loanTenure, setLoanTenure] = useState<number>(5);
  const [emi, setEmi] = useState<number>(0);
  const [totalInterest, setTotalInterest] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [amortizationSchedule, setAmortizationSchedule] = useState<AmortizationItem[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [error, setError] = useState('');
  const formatMoney = (value: number) => `₹${Math.round(value).toLocaleString('en-IN')}`;
  const firstYearInterest = amortizationSchedule
    .slice(0, 12)
    .reduce((sum, item) => sum + item.interestPaid, 0);
  const principalShare = totalAmount > 0 ? Math.round((loanAmount / totalAmount) * 100) : 0;
  const interestShare = totalAmount > 0 ? 100 - principalShare : 0;
  const shorterTenureYears = loanTenure > 1 ? loanTenure - 1 : loanTenure;
  const shorterTenureMonths = shorterTenureYears * 12;
  const monthlyRate = interestRate / (12 * 100);
  const shorterEmi = shorterTenureMonths > 0
    ? calculateMonthlyLoanPayment(loanAmount, interestRate, shorterTenureMonths)
    : 0;
  const emiSummary = `A loan of ${formatMoney(loanAmount)} over ${loanTenure} years at ${interestRate}% creates an EMI of about ${formatMoney(emi)} per month.`;
  const emiInsights = [
    {
      title: 'Interest drag',
      detail: `You repay about ${formatMoney(totalInterest)} in interest, which is ${Math.round((totalInterest / Math.max(totalAmount, 1)) * 100)}% of the total payout.`,
      tone: totalInterest > loanAmount * 0.5 ? 'caution' as const : 'neutral' as const,
    },
    {
      title: 'Early payments matter most',
      detail: `Roughly ${formatMoney(firstYearInterest)} of interest is paid in just the first 12 months, so prepayments help most when done early.`,
      tone: 'action' as const,
    },
    {
      title: 'One year shorter',
      detail: loanTenure > 1
        ? `Cutting the tenure to ${shorterTenureYears} years would raise EMI to about ${formatMoney(shorterEmi)} but can materially reduce total interest.`
        : 'You are already at the shortest tenure in this form, so the best savings lever is reducing the rate or prepaying.',
      tone: 'action' as const,
    },
  ];
  const emiNextSteps = [
    { label: 'Size your emergency fund', to: '/calculators/emergency-fund' },
    { label: 'See net worth impact', to: '/calculators/net-worth' },
  ];
  
  // Calculate EMI
  const calculateEMI = () => {
    // Validate inputs
    if (loanAmount <= 0 || interestRate < 0 || loanTenure <= 0) {
      setError('Enter a positive loan amount and tenure. The interest rate cannot be negative.');
      return;
    }
    setError('');
    
    // Convert annual interest rate to monthly and decimal form
    const monthlyInterestRate = interestRate / (12 * 100);
    
    // Convert loan tenure from years to months
    const tenureInMonths = loanTenure * 12;
    
    const emiValue = calculateMonthlyLoanPayment(loanAmount, interestRate, tenureInMonths);
    
    // Calculate total payment over entire loan tenure
    const totalPayment = emiValue * tenureInMonths;
    
    // Calculate total interest payable
    const totalInterestPayable = totalPayment - loanAmount;
    
    // Generate amortization schedule
    const schedule: AmortizationItem[] = [];
    let balance = loanAmount;
    
    for (let month = 1; month <= tenureInMonths; month++) {
      const interestForMonth = balance * monthlyInterestRate;
      const principalForMonth = emiValue - interestForMonth;
      balance -= principalForMonth;
      
      schedule.push({
        month,
        principalPaid: principalForMonth,
        interestPaid: interestForMonth,
        remainingBalance: balance > 0 ? balance : 0,
        payment: emiValue
      });
    }
    
    // Chart data for visualization
    const chartD: ChartData[] = [
      { name: 'Principal', value: loanAmount, color: '#0284c7' },
      { name: 'Interest', value: totalInterestPayable, color: '#10b981' }
    ];
    
    // Update state with calculated values
    setEmi(Math.round(emiValue));
    setTotalInterest(Math.round(totalInterestPayable));
    setTotalAmount(Math.round(totalPayment));
    setAmortizationSchedule(schedule);
    setChartData(chartD);
    setShowResults(true);
  };
  
  return (
    <CalculatorLayout
      title="EMI Calculator"
      description="Calculate your Equated Monthly Installment (EMI) for any loan. Find out total interest payable and see amortization schedule."
      icon={<CreditCard size={24} />}
    >
      <div className="space-y-6">
        <motion.div 
          className={`rounded-lg p-4 border ${isDark ? 'bg-primary-900/30 border-primary-800' : 'bg-blue-50 border-blue-100'}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p className={`text-sm ${isDark ? 'text-primary-100' : 'text-blue-800'}`}>
            <strong>Quick Tip:</strong> EMI (Equated Monthly Installment) is the fixed amount you pay each month toward your loan. It includes both principal and interest components.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div 
            className={`rounded-lg p-5 border shadow-sm ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-100'}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-4 text-primary-600 dark:text-primary-400">
              <CreditCard size={18} />
              <h3 className="font-medium">Loan Details</h3>
            </div>
            
            <FormField label="Loan Amount">
              <Input
                type="number"
                prefix="₹"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                placeholder="Enter loan amount"
                min="1000"
              />
            </FormField>
            
            <FormField label="Interest Rate (% per annum)">
              <Input
                type="number"
                suffix="%"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                placeholder="Enter interest rate"
                min="0"
                step="0.1"
              />
            </FormField>
            
            <FormField label="Loan Tenure (Years)">
              <Input
                type="number"
                value={loanTenure}
                onChange={(e) => setLoanTenure(Number(e.target.value))}
                placeholder="Enter loan tenure in years"
                min="1"
              />
            </FormField>
            
            <div className="mt-6">
              {error && <p role="alert" className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</p>}
              <Button onClick={calculateEMI} className="w-full">
                Calculate EMI <ArrowRight size={16} className="ml-2" />
              </Button>
            </div>
          </motion.div>
          
          {showResults && (
            <motion.div 
              className={`rounded-lg p-5 border shadow-sm ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-100'}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-2 mb-4 text-primary-600 dark:text-primary-400">
                <BarChart2 size={18} />
                <h3 className="font-medium">Loan Summary</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <ResultDisplay
                  label="Monthly EMI"
                  value={`₹${emi.toLocaleString()}`}
                  highlight
                />
                
                <ResultDisplay
                  label="Total Interest Payable"
                  value={`₹${totalInterest.toLocaleString()}`}
                />
                
                <ResultDisplay
                  label="Total Payment (Principal + Interest)"
                  value={`₹${totalAmount.toLocaleString()}`}
                />
              </div>
              
              <section className="mt-6 overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-slate-50/80 dark:border-white/10 dark:bg-white/[0.035]">
                <div className="border-b border-slate-200/80 px-5 py-4 dark:border-white/10">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Payment mix</p>
                  <h4 className="mt-1 font-display text-lg font-bold text-slate-950 dark:text-white">Where your repayment goes</h4>
                </div>

                <div className="grid items-center gap-3 p-4 sm:grid-cols-[190px_1fr] sm:p-5">
                  <div className="mx-auto h-[190px] w-full max-w-[220px] overflow-hidden" aria-label={`Loan payment breakdown: principal ${principalShare}%, interest ${interestShare}%`} role="img">
                    <FinancialChart
                      data={chartData}
                      type="pie"
                      height={190}
                      showLegend={false}
                      noWrapper
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-2xl border border-sky-200/70 bg-white p-4 dark:border-sky-400/15 dark:bg-sky-400/[0.06]">
                      <div className="flex items-center justify-between gap-3">
                        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-sky-700 dark:text-sky-300">
                          <span className="h-2.5 w-2.5 rounded-full bg-sky-500" /> Principal
                        </span>
                        <span className="rounded-full bg-sky-100 px-2 py-1 text-xs font-bold text-sky-700 dark:bg-sky-400/10 dark:text-sky-200">{principalShare}%</span>
                      </div>
                      <p className="mt-2 text-lg font-bold tabular-nums text-slate-950 dark:text-white">{formatMoney(loanAmount)}</p>
                    </div>

                    <div className="rounded-2xl border border-emerald-200/70 bg-white p-4 dark:border-emerald-400/15 dark:bg-emerald-400/[0.06]">
                      <div className="flex items-center justify-between gap-3">
                        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Interest
                        </span>
                        <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200">{interestShare}%</span>
                      </div>
                      <p className="mt-2 text-lg font-bold tabular-nums text-slate-950 dark:text-white">{formatMoney(totalInterest)}</p>
                    </div>
                  </div>
                </div>
              </section>
            </motion.div>
          )}
        </div>
        
        {showResults && amortizationSchedule.length > 0 && (
          <motion.div
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <ActionableInsights
              summary={emiSummary}
              insights={emiInsights}
              nextSteps={emiNextSteps}
            />

            <section className="overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-[0_20px_55px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-900/80 dark:shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
              <div className="flex flex-col gap-5 border-b border-slate-200/80 bg-gradient-to-br from-slate-50 to-cyan-50/60 p-5 dark:border-white/10 dark:from-slate-900 dark:to-cyan-950/30 sm:flex-row sm:items-end sm:justify-between sm:p-7">
                <div className="flex items-start gap-3.5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-cyan-300 shadow-lg shadow-slate-950/15 dark:bg-cyan-400/10 dark:text-cyan-200">
                    <CalendarRange size={21} />
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-300">Repayment timeline</p>
                    <h3 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-950 dark:text-white">Amortization schedule</h3>
                    <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                      See how every EMI is divided and how your outstanding balance falls during the first year.
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-4 rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 text-xs font-semibold text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                  <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> Principal</span>
                  <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-amber-400" /> Interest</span>
                </div>
              </div>

              <div className="hidden overflow-x-auto md:block">
                <table className="min-w-full table-fixed">
                  <thead>
                    <tr className="border-b border-slate-200/80 bg-slate-50/70 dark:border-white/10 dark:bg-white/[0.025]">
                      <th className="w-[12%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Month</th>
                      <th className="w-[22%] px-6 py-4 text-right text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Payment</th>
                      <th className="w-[22%] px-6 py-4 text-right text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Principal</th>
                      <th className="w-[22%] px-6 py-4 text-right text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Interest</th>
                      <th className="w-[22%] px-6 py-4 text-right text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/70 dark:divide-white/[0.07]">
                    {amortizationSchedule.slice(0, 12).map((item) => (
                      <tr key={item.month} className="group bg-white transition-colors hover:bg-cyan-50/60 dark:bg-transparent dark:hover:bg-cyan-400/[0.045]">
                        <td className="px-6 py-4">
                          <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-xl bg-slate-100 px-2 text-sm font-bold text-slate-700 transition-colors group-hover:bg-cyan-100 group-hover:text-cyan-800 dark:bg-white/[0.07] dark:text-slate-200 dark:group-hover:bg-cyan-400/15 dark:group-hover:text-cyan-200">
                            {item.month}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-semibold tabular-nums text-slate-800 dark:text-slate-100">{formatMoney(item.payment)}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-semibold tabular-nums text-emerald-700 dark:text-emerald-300">{formatMoney(item.principalPaid)}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-semibold tabular-nums text-amber-700 dark:text-amber-300">{formatMoney(item.interestPaid)}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-bold tabular-nums text-slate-950 dark:text-white">{formatMoney(item.remainingBalance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-slate-200/80 dark:divide-white/10 md:hidden">
                {amortizationSchedule.slice(0, 12).map((item) => (
                  <article key={item.month} className="space-y-4 p-5">
                    <div className="flex items-center justify-between">
                      <span className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-slate-600 dark:bg-white/[0.07] dark:text-slate-300">Month {item.month}</span>
                      <span className="text-base font-bold tabular-nums text-slate-950 dark:text-white">{formatMoney(item.payment)}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-2xl bg-emerald-50 p-3 dark:bg-emerald-400/[0.07]">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Principal</p>
                        <p className="mt-1 text-xs font-bold tabular-nums text-emerald-800 dark:text-emerald-200">{formatMoney(item.principalPaid)}</p>
                      </div>
                      <div className="rounded-2xl bg-amber-50 p-3 dark:bg-amber-400/[0.07]">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-amber-700 dark:text-amber-300">Interest</p>
                        <p className="mt-1 text-xs font-bold tabular-nums text-amber-800 dark:text-amber-200">{formatMoney(item.interestPaid)}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-100 p-3 dark:bg-white/[0.07]">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Balance</p>
                        <p className="mt-1 text-xs font-bold tabular-nums text-slate-800 dark:text-slate-100">{formatMoney(item.remainingBalance)}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {amortizationSchedule.length > 12 && (
                <div className="border-t border-slate-200/80 bg-slate-50/70 px-5 py-4 text-center dark:border-white/10 dark:bg-white/[0.025]">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    First-year preview <span className="mx-2 text-slate-300 dark:text-slate-600">•</span> {loanTenure * 12} payments across {loanTenure} years
                  </p>
                </div>
              )}
            </section>
          </motion.div>
        )}
        
        <motion.div
          className="mt-8 bg-gray-50 dark:bg-gray-800 p-6 rounded-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className="text-lg font-medium mb-3">About EMI Calculation</h3>
          
          <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
            <p>
              <strong>Equated Monthly Installment (EMI)</strong> is a fixed payment amount paid by a borrower to a lender at a specified date each calendar month. EMIs are applied to both interest and principal each month so that over a specified number of years, the loan is paid off in full.
            </p>
            
            <div>
              <h4 className="font-medium text-md mb-2">Factors affecting your EMI:</h4>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  <strong>Loan amount</strong>: Higher loan amount leads to higher EMI
                </li>
                <li>
                  <strong>Interest rate</strong>: Higher interest rate increases your EMI
                </li>
                <li>
                  <strong>Loan tenure</strong>: Longer tenure reduces EMI but increases total interest paid
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-md mb-2">Tips to manage your loan:</h4>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  Make prepayments when you have surplus funds to reduce overall interest
                </li>
                <li>
                  Consider refinancing if you find a significantly lower interest rate
                </li>
                <li>
                  Avoid late payments as they can attract penalties and affect your credit score
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </CalculatorLayout>
  );
};

export default EMICalculator; 
