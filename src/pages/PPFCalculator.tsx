import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, ArrowRight, Shield, Briefcase, TrendingUp } from 'lucide-react';
import CalculatorLayout from '../components/CalculatorLayout';
import { FormField, Input, Select, Button, ResultDisplay } from '../components/CalculatorForm';
import ActionableInsights from '../components/ActionableInsights';
import FinancialChart, { ChartData } from '../components/FinancialChart';
import { useTheme } from '../context/ThemeContext';
import { formatCurrencyINR, roundTo, safePercentage } from '../utils/finance';

interface YearlyData {
  year: number;
  investmentForYear: number;
  interestForYear: number;
  totalInvestment: number;
  totalInterest: number;
  closingBalance: number;
}

const PPFCalculator: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // State variables
  const [yearlyContribution, setYearlyContribution] = useState<number>(150000);
  const [interestRate, setInterestRate] = useState<number>(7.1);
  const [tenure, setTenure] = useState<number>(15);
  const [extendTenure, setExtendTenure] = useState<'no' | '5years' | 'annually'>('no');
  const [monthlyInvestment, setMonthlyInvestment] = useState<boolean>(false);
  const [contributionIncrement, setContributionIncrement] = useState<number>(0);
  const [totalInvestment, setTotalInvestment] = useState<number>(0);
  const [totalInterest, setTotalInterest] = useState<number>(0);
  const [maturityAmount, setMaturityAmount] = useState<number>(0);
  const [yearlyData, setYearlyData] = useState<YearlyData[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isCalculated, setIsCalculated] = useState<boolean>(false);
  const effectiveYearlyContribution = Math.min(yearlyContribution, 150000);
  const contributionYears = yearlyData.filter((item) => item.investmentForYear > 0).length;
  const totalPlanYears = yearlyData.length;
  const ppfSummary = `Starting with ${formatCurrencyINR(effectiveYearlyContribution)} per year for ${contributionYears} contribution years projects a PPF maturity value of ${formatCurrencyINR(maturityAmount)} over ${totalPlanYears} total years.`;
  const ppfInsights = [
    {
      title: 'Compounding payoff',
      detail: `Tax-free interest contributes about ${safePercentage(totalInterest, maturityAmount).toFixed(1)}% of the final corpus, which is why long holding periods matter in PPF.`,
      tone: totalInterest > totalInvestment ? 'positive' as const : 'neutral' as const,
    },
    {
      title: 'Tax cap',
      detail: `Only up to ${formatCurrencyINR(150000)} per financial year qualifies for Section 80C and earns PPF benefits, even if you planned a higher input.`,
      tone: yearlyContribution > 150000 ? 'caution' as const : 'action' as const,
    },
    {
      title: 'Funding strategy',
      detail: monthlyInvestment
        ? 'Monthly contributions help discipline, but depositing before the 5th of each month helps maximize interest eligibility.'
        : 'A lump-sum contribution near the start of the financial year can improve the effective interest earned in PPF.',
      tone: 'action' as const,
    },
  ];
  const ppfNextSteps = [
    { label: 'Compare with NSC', to: '/calculators/nsc' },
    { label: 'Check retirement plan', to: '/calculators/retirement' },
  ];
  
  // Calculate PPF returns
  const calculatePPF = () => {
    // Validate inputs
    if (yearlyContribution <= 0 || interestRate < 0 || tenure <= 0) {
      return;
    }
    
    // Calculate total tenure based on extension option
    const totalTenure = 
      extendTenure === '5years' ? tenure + 5 : 
      extendTenure === 'annually' ? tenure + 5 : 
      tenure;
    
    const yearlyDataArray: YearlyData[] = [];
    let totalInvestmentAmount = 0;
    let totalInterestAmount = 0;
    let currentContribution = Math.min(yearlyContribution, 150000);
    let previousBalance = 0;
    const annualRate = interestRate / 100;
    
    for (let year = 1; year <= totalTenure; year++) {
      const shouldContribute = year <= tenure || extendTenure === 'annually';

      const investmentForYear = shouldContribute ? currentContribution : 0;
      totalInvestmentAmount += investmentForYear;
      let interestForYear = 0;
      let closingBalance = previousBalance;

      if (monthlyInvestment && shouldContribute) {
        const monthlyAmount = investmentForYear / 12;
        let runningBalance = previousBalance;

        for (let month = 1; month <= 12; month++) {
          runningBalance += monthlyAmount;
          interestForYear += runningBalance * (annualRate / 12);
        }

        closingBalance = previousBalance + investmentForYear + interestForYear;
      } else {
        const openingEligibleBalance = previousBalance + investmentForYear;
        interestForYear = openingEligibleBalance * annualRate;
        closingBalance = openingEligibleBalance + interestForYear;
      }
      
      totalInterestAmount += interestForYear;

      yearlyDataArray.push({
        year,
        investmentForYear: roundTo(investmentForYear, 2),
        interestForYear: roundTo(interestForYear, 2),
        totalInvestment: roundTo(totalInvestmentAmount, 2),
        totalInterest: roundTo(totalInterestAmount, 2),
        closingBalance: roundTo(closingBalance, 2),
      });

      previousBalance = closingBalance;

      if (shouldContribute && contributionIncrement > 0) {
        currentContribution = Math.min(
          currentContribution * (1 + contributionIncrement / 100),
          150000
        );
      }
    }
    
    setYearlyData(yearlyDataArray);
    setTotalInvestment(roundTo(totalInvestmentAmount, 2));
    setTotalInterest(roundTo(totalInterestAmount, 2));
    setMaturityAmount(roundTo(previousBalance, 2));
    setIsCalculated(true);
    
    // Prepare chart data
    const chartDataArray: ChartData[] = yearlyDataArray.map(data => ({
      name: `Year ${data.year}`,
      value: data.closingBalance,
      color: '#0284c7'
    }));
    
    setChartData(chartDataArray);
  };
  
  // Reset form if monthly investment option changes
  useEffect(() => {
    setIsCalculated(false);
  }, [monthlyInvestment]);
  
  return (
    <CalculatorLayout
      title="PPF Calculator"
      description="Calculate returns on your Public Provident Fund (PPF) investment with this easy-to-use calculator."
      icon={<Shield size={24} />}
    >
      <div className="grid min-w-0 grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
        {/* Input Form */}
        <div>
          <h2 className="mb-4 font-display text-xl font-bold">Investment Details</h2>
          
          <FormField label="Yearly Contribution">
            <Input
              type="number"
              value={yearlyContribution}
              onChange={(e) => setYearlyContribution(Number(e.target.value))}
              prefix="₹"
              placeholder="Enter yearly contribution"
              min={500}
              max={150000}
            />
            <div className="text-xs text-gray-500 mt-1">
              Min: ₹500, Max: ₹1,50,000 per financial year
            </div>
          </FormField>
          
          <FormField label="Interest Rate (% per annum)">
            <Input
              type="number"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              suffix="%"
              placeholder="Enter interest rate"
              min={1}
              max={10}
              step={0.1}
            />
            <div className="text-xs text-gray-500 mt-1">
              Current rate: 7.1% (subject to quarterly revision)
            </div>
          </FormField>
          
          <FormField label="Investment Period (in years)">
            <Input
              type="number"
              value={tenure}
              onChange={(e) => setTenure(Number(e.target.value))}
              placeholder="Enter investment period"
              min={15}
              max={50}
              amountInWords={false}
            />
            <div className="text-xs text-gray-500 mt-1">
              Minimum lock-in period is 15 years
            </div>
          </FormField>
          
          <FormField label="Investment Frequency">
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5 dark:bg-white/[0.05]">
              <label className={`flex min-h-11 cursor-pointer items-center justify-center rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${!monthlyInvestment ? 'border-cyan-300 bg-white text-cyan-800 shadow-sm dark:border-cyan-400/30 dark:bg-cyan-400/10 dark:text-cyan-200' : 'border-transparent text-slate-600 dark:text-slate-300'}`}>
                <input
                  type="radio"
                  className="sr-only"
                  checked={!monthlyInvestment}
                  onChange={() => setMonthlyInvestment(false)}
                />
                <span>Yearly</span>
              </label>
              <label className={`flex min-h-11 cursor-pointer items-center justify-center rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${monthlyInvestment ? 'border-cyan-300 bg-white text-cyan-800 shadow-sm dark:border-cyan-400/30 dark:bg-cyan-400/10 dark:text-cyan-200' : 'border-transparent text-slate-600 dark:text-slate-300'}`}>
                <input
                  type="radio"
                  className="sr-only"
                  checked={monthlyInvestment}
                  onChange={() => setMonthlyInvestment(true)}
                />
                <span>Monthly</span>
              </label>
            </div>
          </FormField>
          
          <FormField label="Extension Option">
            <Select
              value={extendTenure}
              onChange={(e) => setExtendTenure(e.target.value as any)}
            >
              <option value="no">No Extension</option>
              <option value="5years">Extend by 5 years (no contribution)</option>
              <option value="annually">Extend 5 years & continue contributions</option>
            </Select>
          </FormField>
          
          <FormField label="Yearly Contribution Increment (%)">
            <Input
              type="number"
              value={contributionIncrement}
              onChange={(e) => setContributionIncrement(Number(e.target.value))}
              suffix="%"
              placeholder="Enter yearly increment"
              min={0}
              max={20}
              step={0.5}
            />
            <div className="text-xs text-gray-500 mt-1">
              Optional: Increase your contribution each year
            </div>
          </FormField>
          
          <div className="mt-6">
            <Button onClick={calculatePPF} className="w-full">
              Calculate Returns <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>
        </div>
        
        {/* Results Section */}
        <div>
          {isCalculated && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="mb-4 font-display text-xl font-bold">Investment Summary</h2>
              
              <div className="grid grid-cols-1 gap-4 mb-6">
                <ResultDisplay
                  label="Total Investment"
                  value={`₹${totalInvestment.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                  icon={<DollarSign size={18} className="text-primary-500" />}
                />
                
                <ResultDisplay
                  label="Total Interest Earned"
                  value={`₹${totalInterest.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                  icon={<TrendingUp size={18} className="text-emerald-500" />}
                />
                
                <ResultDisplay
                  label="Maturity Amount"
                  value={`₹${maturityAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                  icon={<Briefcase size={18} className="text-amber-500" />}
                />
              </div>

              <ActionableInsights
                title="How To Use This PPF Plan"
                summary={ppfSummary}
                insights={ppfInsights}
                nextSteps={ppfNextSteps}
              />
              
              {/* Chart showing investment growth */}
              <div className="mt-6 min-w-0">
                <h3 className="mb-3 text-lg font-semibold">Investment Growth Over Time</h3>
                <div className="min-w-0 overflow-hidden rounded-[1.25rem]">
                  <FinancialChart 
                    data={chartData}
                    title="PPF Growth"
                    type="line"
                    height={240}
                  />
                </div>
              </div>
              
              {/* Pie chart for investment vs interest */}
              <div className="mt-8">
                <h3 className="mb-3 text-lg font-semibold">Investment vs. Interest</h3>
                <div className="min-w-0 overflow-hidden rounded-[1.25rem]">
                  <FinancialChart 
                    data={[
                      { name: 'Investment', value: totalInvestment, color: 'primary' },
                      { name: 'Interest', value: totalInterest, color: 'secondary' },
                    ]}
                    title=""
                    type="pie"
                    height={220}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Yearly Breakdown Table */}
      {isCalculated && yearlyData.length > 0 && (
        <motion.div
          className="mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="mb-4 font-display text-xl font-bold">Year-wise Breakdown</h2>
          
          <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/10 sm:block">
            <table className={`min-w-full divide-y divide-gray-200 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <thead className={isDark ? 'bg-gray-800' : 'bg-gray-50'}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Year</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Investment Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Interest Earned</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Closing Balance</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {yearlyData.map((data, index) => (
                  <tr key={index} className={index % 2 === 0 ? (isDark ? 'bg-gray-800' : 'bg-white') : (isDark ? 'bg-gray-750' : 'bg-gray-50')}>
                    <td className="px-6 py-4 whitespace-nowrap">{data.year}</td>
                    <td className="px-6 py-4 whitespace-nowrap">₹{data.investmentForYear.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                    <td className="px-6 py-4 whitespace-nowrap">₹{data.interestForYear.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                    <td className="px-6 py-4 whitespace-nowrap">₹{data.closingBalance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 sm:hidden">
            {yearlyData.map((data) => (
              <article key={data.year} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-3 dark:border-white/10">
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-700 dark:text-cyan-300">Year {data.year}</span>
                  <span className="text-base font-bold tabular-nums text-slate-950 dark:text-white">₹{data.closingBalance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Invested</p>
                    <p className="mt-1 text-sm font-bold tabular-nums text-slate-800 dark:text-slate-100">₹{data.investmentForYear.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Interest</p>
                    <p className="mt-1 text-sm font-bold tabular-nums text-emerald-700 dark:text-emerald-300">₹{data.interestForYear.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </motion.div>
      )}
      
      {/* Information Section */}
      <div className="mt-8 rounded-2xl bg-gray-50 p-4 dark:bg-gray-800 sm:mt-12 sm:p-6">
        <h2 className="mb-4 font-display text-xl font-bold">About PPF Investment</h2>
        
        <div className="space-y-4">
          <p>
            <strong>Public Provident Fund (PPF)</strong> is a government-backed long-term savings scheme that offers an attractive interest rate and tax benefits. It is one of the most popular tax-saving instruments in India.
          </p>
          
          <div>
            <h3 className="font-medium mb-2">Key Features of PPF:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Lock-in period of 15 years with option to extend in blocks of 5 years</li>
              <li>Partial withdrawal allowed from the 7th financial year</li>
              <li>Loan facility available from 3rd to 5th financial year</li>
              <li>Current interest rate: 7.1% p.a. (subject to quarterly revision)</li>
              <li>Interest is calculated on the lowest balance between the 5th and last day of the month</li>
              <li>Minimum annual contribution: ₹500</li>
              <li>Maximum annual contribution: ₹1,50,000</li>
              <li>Contributions can be made in lump sum or in a maximum of 12 installments per year</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Tax Benefits:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Exempt-Exempt-Exempt (EEE) tax status</li>
              <li>Investment amount eligible for tax deduction under Section 80C of Income Tax Act (up to ₹1,50,000)</li>
              <li>Interest earned is tax-free</li>
              <li>Maturity amount is tax-free</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Who Can Invest:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Any resident Indian individual</li>
              <li>On behalf of minors (parents or legal guardians)</li>
              <li>HUF (Hindu Undivided Family)</li>
              <li>NRIs are not eligible to open a new PPF account</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Investment Strategy Tips:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Invest before the 5th of each month to maximize interest earnings</li>
              <li>Consider investing the maximum amount at the beginning of the financial year</li>
              <li>Maintain continuity by making at least the minimum contribution each year</li>
              <li>Plan your extensions strategically based on your financial goals</li>
            </ul>
          </div>
        </div>
      </div>
    </CalculatorLayout>
  );
};

export default PPFCalculator; 
