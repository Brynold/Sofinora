import React, { useState } from 'react';
import { DollarSign, Calendar, BarChart2, PieChart, Sparkles, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import CalculatorLayout from '../components/CalculatorLayout';
import { FormField, Input, Button, ResultDisplay } from '../components/CalculatorForm';
import ActionableInsights from '../components/ActionableInsights';
import FinancialChart, { ChartData } from '../components/FinancialChart';
import { useTheme } from '../context/ThemeContext';
import { formatCurrencyINR, safePercentage } from '../utils/finance';
import { calculateSSYProjection } from '../utils/planning';

const SSYCalculator: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [yearlyDeposit, setYearlyDeposit] = useState<number>(50000);
  const [rate, setRate] = useState<number>(8.2);
  const [girlAge, setGirlAge] = useState<number>(2);
  const [depositYears, setDepositYears] = useState<number>(15); // Max deposit period is 15 years
  const [showResults, setShowResults] = useState<boolean>(false);
  const [maturityAmount, setMaturityAmount] = useState<number>(0);
  const [totalDeposit, setTotalDeposit] = useState<number>(0);
  const [interestEarned, setInterestEarned] = useState<number>(0);
  const [maturityYear, setMaturityYear] = useState<number>(0);
  const [yearlyData, setYearlyData] = useState<ChartData[]>([]);
  const [activeChart, setActiveChart] = useState<'bar' | 'pie'>('bar');
  const [depositData, setDepositData] = useState<{
    year: number;
    deposit: number;
    interest: number;
    balance: number;
  }[]>([]);
  const effectiveDepositYears = Math.min(Math.max(depositYears, 0), 15);
  const maturityYearsRemaining = 21;
  const ssySummary = `Depositing ${formatCurrencyINR(yearlyDeposit)} per year for ${effectiveDepositYears} years can grow to about ${formatCurrencyINR(maturityAmount)} by ${maturityYear}, 21 years after opening the account.`;
  const ssyInsights = [
    {
      title: 'Long runway',
      detail: `A newly opened account has ${maturityYearsRemaining} years to compound. The child's age determines opening eligibility, not the maturity term.`,
      tone: maturityYearsRemaining >= 12 ? 'positive' as const : 'neutral' as const,
    },
    {
      title: 'Compounding payoff',
      detail: `Interest contributes about ${safePercentage(interestEarned, maturityAmount).toFixed(1)}% of the maturity corpus, showing how powerful the lock-in can be over time.`,
      tone: interestEarned > totalDeposit ? 'positive' as const : 'neutral' as const,
    },
    {
      title: 'Planning note',
      detail: `Deposits stop after ${effectiveDepositYears} years, but the balance keeps compounding until 21 years from account opening. Keep separate liquidity for earlier expenses.`,
      tone: 'action' as const,
    },
  ];
  const ssyNextSteps = [
    { label: 'Compare with PPF', to: '/calculators/ppf' },
    { label: 'Build emergency fund', to: '/calculators/emergency-fund' },
  ];

  const calculateSSY = () => {
    if (yearlyDeposit <= 0 || rate < 0 || girlAge < 0 || girlAge > 10) {
      return;
    }

    const projection = calculateSSYProjection({ yearlyDeposit, annualRatePercent: rate, depositYears: effectiveDepositYears });
    setTotalDeposit(projection.totalDeposited);
    setMaturityAmount(projection.maturityAmount);
    setInterestEarned(projection.interestEarned);
    setMaturityYear(new Date().getFullYear() + 21);
    setYearlyData(projection.schedule.map((item) => ({ name: `Year ${item.year}`, value: item.balance })));
    setDepositData(projection.schedule);
    setShowResults(true);
  };

  // Pie chart data showing investment vs interest
  const compositionData: ChartData[] = [
    { name: 'Total Deposit', value: totalDeposit, color: '#0284c7' },
    { name: 'Interest Earned', value: interestEarned, color: '#10b981' },
  ];

  return (
    <CalculatorLayout
      title="SSY Calculator"
      description="Plan your daughter's future with Sukanya Samriddhi Yojana (SSY) Calculator. Calculate maturity value, interest earned and year-by-year growth."
      icon={<Sparkles size={24} />}
    >
      <div className="space-y-6">
        <motion.div 
          className={`rounded-lg p-4 border ${isDark ? 'bg-primary-900/30 border-primary-800' : 'bg-purple-50 border-purple-100'}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-start gap-3">
            <Sparkles size={20} className={isDark ? 'text-purple-300' : 'text-purple-500'} />
            <div>
              <p className={`text-sm ${isDark ? 'text-primary-100' : 'text-purple-800'}`}>
                <strong>Key Benefits:</strong> SSY is a government-backed savings scheme for girl children with high interest rates, tax benefits under Section 80C, and partial withdrawal facility for education expenses.
              </p>
              <p className={`text-xs mt-1 ${isDark ? 'text-purple-200/70' : 'text-purple-600'}`}>
                The account matures 21 years after opening. Deposits are permitted for up to 15 years from opening.
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div 
            className={`rounded-lg p-5 border shadow-sm ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-100'}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-4 text-primary-600 dark:text-primary-400">
              <DollarSign size={18} />
              <h3 className="font-medium">Investment Details</h3>
            </div>
            
            <FormField label="Yearly Deposit">
              <Input
                type="number"
                prefix="₹"
                value={yearlyDeposit}
                onChange={(e) => setYearlyDeposit(Number(e.target.value))}
                placeholder="Enter yearly deposit"
                min="250"
                max="150000"
                step="1000"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Min: ₹250, Max: ₹1,50,000 per year
              </p>
            </FormField>
            
            <FormField label="Interest Rate (p.a.)">
              <Input
                type="number"
                suffix="%"
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                placeholder="Enter interest rate"
                min="1"
                step="0.1"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Illustrative default: 8.2% p.a. Rates can change quarterly; verify the current official rate before investing.
              </p>
            </FormField>
          </motion.div>

          <motion.div 
            className={`rounded-lg p-5 border shadow-sm ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-100'}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-4 text-primary-600 dark:text-primary-400">
              <Calendar size={18} />
              <h3 className="font-medium">Girl Child Details</h3>
            </div>
            
            <FormField label="Girl's Age (in years)">
              <Input
                type="number"
                value={girlAge}
                onChange={(e) => setGirlAge(Number(e.target.value))}
                placeholder="Enter age in years"
                min="0"
                max="10"
                step="1"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                SSY account can be opened for a girl child under 10 years of age
              </p>
            </FormField>
            
            <FormField label="Deposit Period (in years)">
              <Input
                type="number"
                value={depositYears}
                onChange={(e) => setDepositYears(Number(e.target.value))}
                placeholder="Enter deposit period"
                min="1"
                max="15"
                step="1"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Max 15 years from the date of account opening
              </p>
            </FormField>
          </motion.div>
        </div>

        <div className="flex justify-center mt-2">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button onClick={calculateSSY}>
              <Sparkles size={18} />
              Calculate SSY Returns
            </Button>
          </motion.div>
        </div>
      </div>

      {showResults && (
        <motion.div 
          className={`mt-10 border-t pt-8 ${isDark ? 'border-dark-border' : ''}`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h3 className={`text-xl font-semibold mb-5 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            SSY Investment Results
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <ResultDisplay 
              label="Maturity Amount" 
              value={`₹${maturityAmount.toLocaleString()}`} 
              highlight={true} 
            />
            
            <ResultDisplay 
              label="Total Deposit" 
              value={`₹${totalDeposit.toLocaleString()}`} 
            />
            
            <ResultDisplay 
              label="Interest Earned" 
              value={`₹${interestEarned.toLocaleString()}`} 
            />
            
            <ResultDisplay 
              label="Maturity Year" 
              value={maturityYear.toString()} 
            />
          </div>
          
          <div className={`mt-6 p-5 rounded-lg border ${
            isDark ? 'bg-dark-card/50 border-dark-border' : 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-100'
          }`}>
            <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Summary
            </h4>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              A yearly deposit of <strong className="text-primary-500">₹{yearlyDeposit.toLocaleString()}</strong> at <strong className="text-primary-500">{rate}%</strong> interest rate for <strong className="text-primary-500">{effectiveDepositYears} years</strong> will grow to <strong className={isDark ? 'text-purple-400' : 'text-purple-600'}>₹{maturityAmount.toLocaleString()}</strong> by {maturityYear}, when your daughter turns 21. You'll earn <strong className={isDark ? 'text-emerald-400' : 'text-emerald-600'}>₹{interestEarned.toLocaleString()}</strong> as interest on your total deposit of <strong>₹{totalDeposit.toLocaleString()}</strong>.
            </p>
          </div>

          <ActionableInsights
            title="Use This SSY Projection"
            summary={ssySummary}
            insights={ssyInsights}
            nextSteps={ssyNextSteps}
          />

          {/* Timeline of key events */}
          <div className={`mt-6 p-5 rounded-lg border ${
            isDark ? 'bg-dark-card/50 border-dark-border' : 'bg-blue-50 border-blue-100'
          }`}>
            <div className="flex items-center gap-2 mb-4">
              <Clock size={18} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
              <h4 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Important Timelines
              </h4>
            </div>
            
            <div className="flex flex-col space-y-4">
              <div className="flex">
                <div className="flex flex-col items-center mr-4">
                  <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
                    isDark ? 'bg-primary-900 text-primary-300' : 'bg-primary-100 text-primary-700'
                  }`}>
                    1
                  </div>
                  <div className="h-full w-0.5 bg-gray-300 dark:bg-gray-700 mt-1"></div>
                </div>
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Account Opening
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    SSY account opened for {girlAge} year old girl in {new Date().getFullYear()}
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex flex-col items-center mr-4">
                  <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
                    isDark ? 'bg-primary-900 text-primary-300' : 'bg-primary-100 text-primary-700'
                  }`}>
                    2
                  </div>
                  <div className="h-full w-0.5 bg-gray-300 dark:bg-gray-700 mt-1"></div>
                </div>
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Last Deposit
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Deposits end after {effectiveDepositYears} years in {new Date().getFullYear() + effectiveDepositYears}
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex flex-col items-center mr-4">
                  <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
                    isDark ? 'bg-primary-900 text-primary-300' : 'bg-primary-100 text-primary-700'
                  }`}>
                    3
                  </div>
                  <div className="h-full w-0.5 bg-gray-300 dark:bg-gray-700 mt-1"></div>
                </div>
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Partial Withdrawal (Optional)
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Up to 50% can be withdrawn when she turns 18 in {new Date().getFullYear() + (18 - girlAge)} for education
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex flex-col items-center mr-4">
                  <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
                    isDark ? 'bg-emerald-900 text-emerald-300' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    4
                  </div>
                </div>
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Maturity
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Account matures when she turns 21 in {maturityYear}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-6">
            <div className="w-full bg-gray-200 dark:bg-dark-border rounded-full h-3">
              <div className="bg-primary-600 dark:bg-primary-500 h-3 rounded-full" style={{ width: `${safePercentage(totalDeposit, maturityAmount)}%` }}></div>
            </div>
            <div className="flex justify-between mt-2 text-xs">
              <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Deposit: <span className="font-medium">{Math.round(safePercentage(totalDeposit, maturityAmount))}%</span></span>
              <span className="text-primary-600 dark:text-primary-400">Interest: <span className="font-medium">{Math.round(safePercentage(interestEarned, maturityAmount))}%</span></span>
            </div>
          </div>

          {/* Charts */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Growth Visualization
              </h3>
              
              <div className="flex gap-2">
                <motion.button
                  onClick={() => setActiveChart('bar')}
                  className={`p-2 rounded-md border flex items-center gap-1 ${
                    activeChart === 'bar'
                      ? isDark 
                        ? 'bg-primary-900 border-primary-700 text-white' 
                        : 'bg-primary-50 border-primary-200 text-primary-700'
                      : isDark
                        ? 'bg-dark-card border-dark-border text-gray-300'
                        : 'bg-white border-gray-200 text-gray-600'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <BarChart2 size={16} />
                  <span className="text-sm">Growth</span>
                </motion.button>
                
                <motion.button
                  onClick={() => setActiveChart('pie')}
                  className={`p-2 rounded-md border flex items-center gap-1 ${
                    activeChart === 'pie'
                      ? isDark 
                        ? 'bg-primary-900 border-primary-700 text-white' 
                        : 'bg-primary-50 border-primary-200 text-primary-700'
                      : isDark
                        ? 'bg-dark-card border-dark-border text-gray-300'
                        : 'bg-white border-gray-200 text-gray-600'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <PieChart size={16} />
                  <span className="text-sm">Composition</span>
                </motion.button>
              </div>
            </div>
            
            <AnimatedChartContainer isActive={activeChart === 'bar'}>
              <FinancialChart 
                data={yearlyData} 
                type="bar" 
                title="Year-by-Year Growth" 
                xAxisLabel="Year" 
                yAxisLabel="Amount (₹)" 
                height={300}
              />
            </AnimatedChartContainer>
            
            <AnimatedChartContainer isActive={activeChart === 'pie'}>
              <FinancialChart 
                data={compositionData} 
                type="pie" 
                title="Principal vs Interest" 
                height={300}
              />
            </AnimatedChartContainer>
          </div>

          {/* Detailed breakdown */}
          <motion.div
            className="mt-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 size={18} className={isDark ? 'text-primary-400' : 'text-primary-600'} />
              <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Year-by-Year Breakdown
              </h3>
            </div>
            
            <div className={`rounded-lg border overflow-x-auto ${isDark ? 'border-dark-border bg-dark-card/50' : 'border-gray-200'}`}>
              <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
                <thead className={isDark ? 'bg-dark-card' : 'bg-gray-50'}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Year</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Age</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Deposit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Interest</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Balance</th>
                  </tr>
                </thead>
                <tbody className={`divide-y divide-gray-200 dark:divide-dark-border ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                  {depositData.map((data, index) => (
                    <tr key={index} className={index % 2 === 0 ? (isDark ? 'bg-dark-card/30' : 'bg-gray-50') : ''}>
                      <td className="px-6 py-3 whitespace-nowrap text-sm">{new Date().getFullYear() + data.year}</td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm">{girlAge + data.year}</td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm">₹{data.deposit.toLocaleString()}</td>
                      <td className={`px-6 py-3 whitespace-nowrap text-sm ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        ₹{data.interest.toLocaleString()}
                      </td>
                      <td className={`px-6 py-3 whitespace-nowrap text-sm font-medium ${isDark ? 'text-primary-400' : 'text-primary-700'}`}>
                        ₹{data.balance.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      )}
    </CalculatorLayout>
  );
};

// Helper component for chart animation
const AnimatedChartContainer: React.FC<{children: React.ReactNode, isActive: boolean}> = ({children, isActive}) => (
  <motion.div
    className="mt-4"
    initial={false}
    animate={{
      opacity: isActive ? 1 : 0,
      height: isActive ? 'auto' : 0,
      overflow: 'hidden'
    }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

export default SSYCalculator; 
