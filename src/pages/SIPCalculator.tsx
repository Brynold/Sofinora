import React, { useState } from 'react';
import { Coins, TrendingUp, BarChart2, LineChart as LineChartIcon, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import CalculatorLayout from '../components/CalculatorLayout';
import { FormField, Input, Button, ResultDisplay } from '../components/CalculatorForm';
import FinancialChart, { ChartData } from '../components/FinancialChart';
import ActionableInsights from '../components/ActionableInsights';
import { useTheme } from '../context/ThemeContext';
import {
  annualRateToNominalMonthlyRate,
  futureValueOfMonthlySeries,
  safePercentage,
} from '../utils/finance';

const SIPCalculator: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [monthlyInvestment, setMonthlyInvestment] = useState<number>(5000);
  const [expectedReturnRate, setExpectedReturnRate] = useState<number>(12);
  const [years, setYears] = useState<number>(10);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [investedAmount, setInvestedAmount] = useState<number>(0);
  const [wealthGained, setWealthGained] = useState<number>(0);
  const [maturityValue, setMaturityValue] = useState<number>(0);
  const [activeChart, setActiveChart] = useState<'bar' | 'line'>('line');
  const [yearlyData, setYearlyData] = useState<ChartData[]>([]);

  // Array of financial quotes for motivation
  const financialQuotes = [
    "The best time to start investing was 20 years ago. The second best time is now.",
    "It's not about timing the market, but time in the market.",
    "Compound interest is the eighth wonder of the world.",
    "The stock market is a device for transferring money from the impatient to the patient.",
    "Investing isn't about beating others at their game. It's about controlling yourself at your own game."
  ];
  const [randomQuote] = useState(() => financialQuotes[Math.floor(Math.random() * financialQuotes.length)]);
  const formatMoney = (value: number) => `₹${Math.round(value).toLocaleString('en-IN')}`;
  const maturityMultiple = investedAmount > 0 ? maturityValue / investedAmount : 0;
  const sipSummary = `A monthly SIP of ${formatMoney(monthlyInvestment)} for ${years} years at ${expectedReturnRate}% could grow ${formatMoney(investedAmount)} of invested capital into about ${formatMoney(maturityValue)}.`;
  const sipInsights = [
    {
      title: 'Compounding contribution',
      detail: `${Math.round(safePercentage(wealthGained, maturityValue))}% of the final corpus comes from returns, not principal.`,
      tone: wealthGained > investedAmount ? 'positive' as const : 'neutral' as const,
    },
    {
      title: years >= 10 ? 'Time is doing real work' : 'Time can still do more',
      detail: years >= 10
        ? `Your corpus is about ${maturityMultiple.toFixed(1)}x the money you put in, which is where long horizons really help.`
        : `Extending this SIP even a few more years can materially lift the final corpus because compounding speeds up later.`,
      tone: years >= 10 ? 'positive' as const : 'action' as const,
    },
    {
      title: 'Monthly commitment check',
      detail: `Each ${formatMoney(monthlyInvestment)} you invest monthly is projected to become about ${formatMoney(maturityValue / Math.max(years * 12, 1))} of corpus on average.`,
      tone: 'neutral' as const,
    },
  ];
  const sipNextSteps = [
    { label: 'Turn this into a goal plan', to: '/calculators/goal-sip' },
    { label: 'Check inflation impact', to: '/calculators/inflation' },
  ];

  const calculateSIP = () => {
    const monthlyInterestRate = annualRateToNominalMonthlyRate(expectedReturnRate);
    const totalMonths = years * 12;
    const totalInvestedAmount = monthlyInvestment * totalMonths;

    const maturityAmount = futureValueOfMonthlySeries({
      payment: monthlyInvestment,
      months: totalMonths,
      monthlyRate: monthlyInterestRate,
      contributionAtStart: true,
    });
    
    const estimatedReturns = maturityAmount - totalInvestedAmount;
    
    setInvestedAmount(totalInvestedAmount);
    setWealthGained(Math.round(estimatedReturns));
    setMaturityValue(Math.round(maturityAmount));

    // Generate yearly growth data for charts
    const yearlyGrowthData: ChartData[] = [];
    
    for (let i = 1; i <= years; i++) {
      const months = i * 12;
      const amount = futureValueOfMonthlySeries({
        payment: monthlyInvestment,
        months,
        monthlyRate: monthlyInterestRate,
        contributionAtStart: true,
      });
        
      yearlyGrowthData.push({
        name: `Year ${i}`,
        value: Math.round(amount),
        color: i === years ? '#0ea5e9' : undefined
      });
    }
    
    setYearlyData(yearlyGrowthData);
    setShowResults(true);
  };

  // Component for year-wise breakup data
  const YearwiseBreakup = () => {
    const breakupData = [];
    const monthlyInterestRate = annualRateToNominalMonthlyRate(expectedReturnRate);
    
    for (let i = 1; i <= Math.min(years, 5); i++) {
      const months = i * 12;
      const invested = monthlyInvestment * months;
      const maturity = futureValueOfMonthlySeries({
        payment: monthlyInvestment,
        months,
        monthlyRate: monthlyInterestRate,
        contributionAtStart: true,
      });
      const returns = maturity - invested;
      
      breakupData.push({ year: i, invested, returns, maturity });
    }
    
    return (
      <div className={`mt-6 overflow-x-auto ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-100'} rounded-lg border shadow-sm p-4`}>
        <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
          Year-wise Breakdown
        </h4>
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              <th className={`px-4 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300 bg-dark-border' : 'text-gray-500 bg-gray-50'} uppercase tracking-wider`}>Year</th>
              <th className={`px-4 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300 bg-dark-border' : 'text-gray-500 bg-gray-50'} uppercase tracking-wider`}>Invested Amount</th>
              <th className={`px-4 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300 bg-dark-border' : 'text-gray-500 bg-gray-50'} uppercase tracking-wider`}>Est. Returns</th>
              <th className={`px-4 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300 bg-dark-border' : 'text-gray-500 bg-gray-50'} uppercase tracking-wider`}>Value</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
            {breakupData.map((item) => (
              <tr key={item.year} className={isDark ? 'hover:bg-dark-border/50' : 'hover:bg-gray-50'}>
                <td className={`px-4 py-3 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Year {item.year}</td>
                <td className={`px-4 py-3 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>₹{item.invested.toLocaleString()}</td>
                <td className={`px-4 py-3 whitespace-nowrap text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>₹{Math.round(item.returns).toLocaleString()}</td>
                <td className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>₹{Math.round(item.maturity).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <CalculatorLayout
      title="SIP Calculator"
      description="How much can you save by starting an SIP? Find out! Calculate the future value of your Systematic Investment Plan (SIP)."
      icon={<Coins size={24} />}
    >
      <div className="space-y-6">
        <motion.div 
          className={`rounded-lg p-4 border ${isDark ? 'bg-blue-900/30 border-blue-800' : 'bg-blue-50 border-blue-100'}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-start gap-3">
            <FileText size={20} className={isDark ? 'text-blue-300' : 'text-blue-500'} />
            <div>
              <p className={`text-sm ${isDark ? 'text-blue-100' : 'text-blue-800'}`}>
                <span className="font-medium">Financial Wisdom:</span> {randomQuote}
              </p>
              <p className={`text-xs mt-1 ${isDark ? 'text-blue-200/70' : 'text-blue-600'}`}>
                Start your SIP journey today for a financially secure tomorrow.
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
              <TrendingUp size={18} />
              <h3 className="font-medium">Investment Details</h3>
            </div>
            
            <FormField label="Monthly Investment">
              <Input
                type="number"
                prefix="₹"
                value={monthlyInvestment}
                onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
                placeholder="Enter monthly investment"
                min="100"
              />
            </FormField>
            
            <FormField label="Expected Return Rate (p.a.)">
              <Input
                type="number"
                suffix="%"
                value={expectedReturnRate}
                onChange={(e) => setExpectedReturnRate(Number(e.target.value))}
                placeholder="Enter expected return rate"
                min="1"
                max="50"
                step="0.1"
              />
            </FormField>
          </motion.div>

          <motion.div 
            className={`rounded-lg p-5 border shadow-sm ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-100'}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-4 flex min-h-8 items-center justify-between">
              <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400">
                <Coins size={18} />
                <h3 className="font-medium">Investment Period</h3>
              </div>
            </div>

            <FormField label="Investment Period">
              <div className="space-y-2">
                <div className="flex items-center">
                  <Input
                    type="number"
                    value={years}
                    onChange={(e) => setYears(Number(e.target.value))}
                    placeholder="Enter years"
                    min="1"
                    max="30"
                    amountInWords={false}
                  />
                  <span className={`ml-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Years</span>
                </div>
                
                {/* Year slider */}
                <div className="mt-3 px-2">
                  <input 
                    type="range" 
                    min="1" 
                    max="30" 
                    value={years}
                    onChange={(e) => setYears(Number(e.target.value))}
                    aria-label="Investment period in years"
                    className="h-2 w-full cursor-pointer touch-pan-y select-none appearance-none rounded-lg bg-gray-200 accent-primary-500 dark:bg-dark-border"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>1 yr</span>
                    <span>15 yrs</span>
                    <span>30 yrs</span>
                  </div>
                </div>
              </div>
            </FormField>
          </motion.div>
        </div>

        <div className="flex justify-center mt-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button onClick={calculateSIP}>
              <Coins size={18} />
              Calculate SIP Returns
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
            SIP Investment Results
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ResultDisplay 
              label="Invested Amount" 
              value={`₹${investedAmount.toLocaleString()}`} 
            />
            
            <ResultDisplay 
              label="Wealth Gained" 
              value={`₹${wealthGained.toLocaleString()}`} 
            />
            
            <ResultDisplay 
              label="Maturity Value" 
              value={`₹${maturityValue.toLocaleString()}`} 
              highlight={true}
            />
          </div>
          
          <div className={`mt-6 p-5 rounded-lg border ${
            isDark ? 'bg-dark-card/50 border-dark-border' : 'bg-gradient-to-r from-blue-50 to-primary-50 border-blue-100'
          }`}>
            <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Summary
            </h4>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              By investing <strong className="text-primary-500">₹{monthlyInvestment.toLocaleString()}</strong> monthly for <strong className="text-primary-500">{years} years</strong> at an expected return rate of <strong className="text-primary-500">{expectedReturnRate}%</strong>, your total investment of <strong className="text-primary-500">₹{investedAmount.toLocaleString()}</strong> could grow to <strong className={isDark ? 'text-emerald-400' : 'text-emerald-600'}>₹{maturityValue.toLocaleString()}</strong>, generating wealth of <strong className={isDark ? 'text-emerald-400' : 'text-emerald-600'}>₹{wealthGained.toLocaleString()}</strong>.
            </p>
          </div>
          
          <div className="mt-6">
            <div className="w-full bg-gray-200 dark:bg-dark-border rounded-full h-2.5">
              <div className="bg-primary-600 dark:bg-primary-500 h-2.5 rounded-full" style={{ width: `${safePercentage(investedAmount, maturityValue)}%` }}></div>
            </div>
            <div className="flex justify-between mt-2 text-xs">
              <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Principal: {Math.round(safePercentage(investedAmount, maturityValue))}%</span>
              <span className="text-primary-600 dark:text-primary-400">Returns: {Math.round(safePercentage(wealthGained, maturityValue))}%</span>
            </div>
          </div>

          <ActionableInsights
            summary={sipSummary}
            insights={sipInsights}
            nextSteps={sipNextSteps}
          />

          {/* Yearly breakup table */}
          <YearwiseBreakup />

          {/* Charts */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Growth Visualization
              </h3>
              
              <div className="flex gap-2">
                <motion.button
                  onClick={() => setActiveChart('line')}
                  className={`p-2 rounded-md border flex items-center gap-1 ${
                    activeChart === 'line'
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
                  <LineChartIcon size={16} />
                  <span className="text-sm">Line</span>
                </motion.button>
                
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
                  <span className="text-sm">Bar</span>
                </motion.button>
              </div>
            </div>
            
            <AnimatedChartContainer isActive={activeChart === 'line'}>
              <FinancialChart 
                data={yearlyData} 
                type="line" 
                title="Year-by-Year Growth" 
                xAxisLabel="Year" 
                yAxisLabel="Amount (₹)" 
                height={350}
              />
            </AnimatedChartContainer>
            
            <AnimatedChartContainer isActive={activeChart === 'bar'}>
              <FinancialChart 
                data={yearlyData} 
                type="bar" 
                title="Year-by-Year Growth" 
                xAxisLabel="Year" 
                yAxisLabel="Amount (₹)" 
                height={350}
              />
            </AnimatedChartContainer>
          </div>
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

export default SIPCalculator; 
