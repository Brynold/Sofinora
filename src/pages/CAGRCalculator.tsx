import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, BarChart2, ArrowRight, Clock, TrendingUp } from 'lucide-react';
import CalculatorLayout from '../components/CalculatorLayout';
import { FormField, Input, Button, ResultDisplay } from '../components/CalculatorForm';
import ActionableInsights from '../components/ActionableInsights';
import FinancialChart, { ChartData } from '../components/FinancialChart';
import { useTheme } from '../context/ThemeContext';
import { calculateCAGR as calculateCAGRValue, formatCurrencyINR } from '../utils/finance';

// Helper component for animating elements when they come into view
const AnimateOnView = ({ children }: { children: React.ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.div>
    </div>
  );
};

const CAGRCalculator: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // State variables for inputs
  const [initialInvestment, setInitialInvestment] = useState<number>(100000);
  const [finalAmount, setFinalAmount] = useState<number>(250000);
  const [timePeriod, setTimePeriod] = useState<number>(5);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [error, setError] = useState('');

  // State variables for calculation results
  const [cagrPercentage, setCAGRPercentage] = useState<number>(0);
  const [absoluteReturn, setAbsoluteReturn] = useState<number>(0);
  const [absReturnPercentage, setAbsReturnPercentage] = useState<number>(0);
  const [yearlyBreakdown, setYearlyBreakdown] = useState<{
    year: number;
    amount: number;
    growth: number;
  }[]>([]);
  const [yearlyData, setYearlyData] = useState<ChartData[]>([]);
  const [comparisonData, setComparisonData] = useState<ChartData[]>([]);
  const bankFdValue = comparisonData.find((item) => item.name === 'Bank FD')?.value ?? 0;
  const doublingYears = cagrPercentage > 0 ? 72 / cagrPercentage : 0;
  const cagrGapVsFd = finalAmount - bankFdValue;
  const cagrSummary = `Your investment grew from ${formatCurrencyINR(initialInvestment)} to ${formatCurrencyINR(finalAmount)} over ${timePeriod} years, delivering a CAGR of ${cagrPercentage.toFixed(2)}% and an absolute gain of ${formatCurrencyINR(absoluteReturn)}.`;
  const cagrInsights = [
    {
      title: 'Compounding speed',
      detail: cagrPercentage > 0
        ? `At this pace, your money roughly doubles every ${doublingYears.toFixed(1)} years under the rule of 72.`
        : 'A zero or negative CAGR means the investment did not compound upward over this holding period.',
      tone: cagrPercentage >= 12 ? 'positive' as const : cagrPercentage >= 6 ? 'neutral' as const : 'caution' as const,
    },
    {
      title: 'Benchmark check',
      detail: bankFdValue > 0
        ? `A 6% bank FD on the same starting amount would end near ${formatCurrencyINR(bankFdValue)}. Your result is ${cagrGapVsFd >= 0 ? `${formatCurrencyINR(cagrGapVsFd)} higher` : `${formatCurrencyINR(Math.abs(cagrGapVsFd))} lower`} than that.`
        : 'Compare this CAGR with low-risk options like bank FDs or PPF to judge whether the extra risk was worth it.',
      tone: cagrGapVsFd >= 0 ? 'positive' as const : 'caution' as const,
    },
    {
      title: 'Decision lens',
      detail: `Your total return is ${absReturnPercentage.toFixed(2)}%. Use CAGR for annualized comparison, and use total return to understand the raw gain in rupees.`,
      tone: 'action' as const,
    },
  ];
  const cagrNextSteps = [
    { label: 'Compare with Mutual Fund', to: '/calculators/mf' },
    { label: 'Review cash-flow IRR', to: '/calculators/irr' },
  ];

  const calculateCAGR = () => {
    setShowResults(false);

    // Calculate CAGR using the formula: (Final Value / Initial Value)^(1/n) - 1
    // Where n is the number of years
    
    if (initialInvestment <= 0 || finalAmount <= 0 || timePeriod <= 0) {
      setError('Enter positive starting value, ending value and duration.');
      return;
    }
    setError('');

    // Calculate CAGR
    const cagr = calculateCAGRValue(initialInvestment, finalAmount, timePeriod);
    setCAGRPercentage(cagr * 100);

    // Calculate absolute return
    const absReturn = finalAmount - initialInvestment;
    setAbsoluteReturn(absReturn);
    setAbsReturnPercentage((absReturn / initialInvestment) * 100);

    // Generate yearly breakdown data
    const breakdown = [];
    let yearlyAmount = initialInvestment;

    for (let year = 0; year <= timePeriod; year++) {
      if (year === 0) {
        breakdown.push({
          year,
          amount: initialInvestment,
          growth: 0
        });
      } else {
        const previousAmount = yearlyAmount;
        yearlyAmount = initialInvestment * Math.pow(1 + cagr, year);
        const yearlyGrowth = yearlyAmount - previousAmount;
        
        breakdown.push({
          year,
          amount: yearlyAmount,
          growth: yearlyGrowth
        });
      }
    }

    setYearlyBreakdown(breakdown);

    // Create chart data for growth visualization
    const chartData = breakdown.map(item => ({
      name: `Year ${item.year}`,
      value: item.amount,
      color: isDark ? '#ff6b00' : '#0ea5e9'
    }));

    setYearlyData(chartData);

    // Create comparison data with other investment options (for illustration)
    const bankFD = initialInvestment * Math.pow(1 + 0.06, timePeriod); // Assuming 6% FD rate
    const ppf = initialInvestment * Math.pow(1 + 0.071, timePeriod); // Illustrative 7.1% PPF rate

    const comparisonChartData = [
      { name: 'Your Investment', value: finalAmount, color: isDark ? '#ff6b00' : '#0ea5e9' },
      { name: 'Bank FD', value: bankFD, color: isDark ? '#1c1c1e' : '#84cc16' },
      { name: 'PPF', value: ppf, color: isDark ? '#2c2c2e' : '#8b5cf6' }
    ];

    setComparisonData(comparisonChartData);
    setShowResults(true);
  };

  return (
    <CalculatorLayout
      title="CAGR Calculator"
      description="Calculate the Compound Annual Growth Rate (CAGR) of your investments."
      icon={<TrendingUp size={24} className={isDark ? 'text-banking-orange' : ''} />}
    >
      <div className="space-y-6">
        <motion.div 
          className={`rounded-xl p-4 ${isDark ? 'bg-banking-darkgray border-0 shadow-lg' : 'bg-blue-50 border border-blue-100'}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-start gap-3">
            <TrendingUp size={20} className={isDark ? 'text-banking-orange' : 'text-blue-500'} />
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-blue-800'}`}>
                <strong>Key Features:</strong> The CAGR (Compound Annual Growth Rate) calculator helps you understand the annual growth rate of your investments over a specific time period, smoothing out the volatility of year-to-year returns.
              </p>
              <p className={`text-xs mt-1 ${isDark ? 'text-banking-orange' : 'text-blue-600'}`}>
                CAGR is a better measure of investment performance than simple average returns.
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div 
            className={`rounded-xl p-5 ${isDark ? 'bg-banking-gray border-0 shadow-lg' : 'bg-white border border-gray-100 shadow-sm'}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-5 text-primary-600 dark:text-banking-orange">
              <DollarSign size={18} />
              <h3 className="font-medium">Investment Values</h3>
            </div>
            
            <FormField label="Initial Investment" labelClass={isDark ? 'banking-label' : ''}>
              <Input
                type="number"
                prefix="₹"
                value={initialInvestment}
                onChange={(e) => setInitialInvestment(Number(e.target.value))}
                placeholder="Enter initial investment amount"
                min="1"
                step="1000"
                className={isDark ? 'banking-input' : ''}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                The amount you initially invested
              </p>
            </FormField>
            
            <FormField label="Final Amount" labelClass={isDark ? 'banking-label' : ''}>
              <Input
                type="number"
                prefix="₹"
                value={finalAmount}
                onChange={(e) => setFinalAmount(Number(e.target.value))}
                placeholder="Enter final investment value"
                min="1"
                step="1000"
                className={isDark ? 'banking-input' : ''}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                The current or final value of your investment
              </p>
            </FormField>
          </motion.div>

          <motion.div 
            className={`rounded-xl p-5 ${isDark ? 'bg-banking-gray border-0 shadow-lg' : 'bg-white border border-gray-100 shadow-sm'}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-5 text-primary-600 dark:text-banking-orange">
              <Clock size={18} />
              <h3 className="font-medium">Time Period</h3>
            </div>
            
            <FormField label="Investment Duration" labelClass={isDark ? 'banking-label' : ''}>
              <Input
                type="number"
                suffix="years"
                value={timePeriod}
                onChange={(e) => setTimePeriod(Number(e.target.value))}
                placeholder="Enter investment duration"
                min="1"
                max="50"
                step="1"
                className={isDark ? 'banking-input' : ''}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Number of years between initial and final investment
              </p>
            </FormField>
          </motion.div>
        </div>

        <div className="mt-12 flex justify-center mt-6">
          {error && <p role="alert" className="mr-4 rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</p>}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button onClick={calculateCAGR} className={isDark ? 'banking-button-primary w-full py-4 text-base' : ''}>
              <TrendingUp size={18} />
              Calculate CAGR
            </Button>
          </motion.div>
        </div>
      </div>

      {showResults && (
        <motion.div 
          className={`mt-12 ${isDark ? 'border-t border-banking-darkgray' : 'border-t'} pt-10`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h3 className={`text-xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            CAGR Calculation Results
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ResultDisplay 
              label="CAGR" 
              value={`${cagrPercentage.toFixed(2)}%`} 
              highlight={true} 
              darkCustomClass={isDark ? 'bg-banking-darkgray border-0 text-banking-orange shadow-lg rounded-xl' : ''}
            />
            
            <ResultDisplay 
              label="Absolute Return" 
              value={`₹${Math.round(absoluteReturn).toLocaleString()}`} 
              darkCustomClass={isDark ? 'bg-banking-darkgray border-0 shadow-lg rounded-xl' : ''}
            />
            
            <ResultDisplay 
              label="Total Return" 
              value={`${absReturnPercentage.toFixed(2)}%`}
              darkCustomClass={isDark ? 'bg-banking-darkgray border-0 shadow-lg rounded-xl' : ''}
            />
          </div>
          
          <div className={`mt-8 p-5 rounded-xl ${
            isDark ? 'bg-banking-gray border-0 shadow-lg' : 'bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-primary-600/10 border border-primary-500/20 dark:bg-banking-darkgray dark:border-0 dark:shadow-lg">
                <DollarSign size={20} className={`${isDark ? 'text-banking-orange' : 'text-primary-500'}`} />
                <span className="text-sm font-medium">
                  ₹{initialInvestment.toLocaleString()} <span className="text-xs">initial</span>
                </span>
              </div>
              
              <ArrowRight className={`hidden md:block ${isDark ? 'text-gray-600' : 'text-gray-400'}`} size={20} />
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-primary-600/10 border border-primary-500/20 dark:bg-banking-darkgray dark:border-0 dark:shadow-lg">
                <TrendingUp size={20} className={`${isDark ? 'text-banking-orange' : 'text-primary-500'}`} />
                <span className="text-sm font-medium">
                  {cagrPercentage.toFixed(2)}% <span className="text-xs">CAGR</span>
                </span>
              </div>
              
              <ArrowRight className={`hidden md:block ${isDark ? 'text-gray-600' : 'text-gray-400'}`} size={20} />
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-600/10 border border-emerald-500/20 dark:bg-banking-darkgray dark:border-0 dark:shadow-lg">
                <span className={`text-sm font-medium ${isDark ? 'text-banking-green' : 'text-emerald-500'}`}>
                  ₹{finalAmount.toLocaleString()}
                </span>
              </div>
              
              <div className="hidden md:block p-3 rounded-lg border border-primary-500/20 dark:border-0 dark:bg-banking-darkgray dark:shadow-lg ml-auto">
                <span className="text-xs font-medium">
                  Over <span className={isDark ? 'text-banking-orange' : 'text-blue-600'}>{timePeriod} years</span>
                </span>
              </div>
            </div>
          </div>

          <ActionableInsights
            title="What This CAGR Means"
            summary={cagrSummary}
            insights={cagrInsights}
            nextSteps={cagrNextSteps}
          />

          {/* Growth Visualization */}
          <div className="mt-10">
            <h3 className={`text-xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Growth Visualization
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className={isDark ? 'chart-container rounded-xl' : ''}>
                <FinancialChart 
                  data={yearlyData} 
                  type="bar" 
                  title="Year-by-Year Growth" 
                  xAxisLabel="Year" 
                  yAxisLabel="Amount (₹)" 
                  height={300}
                />
              </div>
              
              <div className={isDark ? 'chart-container rounded-xl' : ''}>
                <FinancialChart 
                  data={comparisonData} 
                  type="bar" 
                  title="Investment Comparison" 
                  xAxisLabel="Investment Type" 
                  yAxisLabel="Final Value (₹)" 
                  height={300}
                />
              </div>
            </div>
          </div>

          {/* Detailed breakdown table */}
          <motion.div
            className="mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 size={18} className={isDark ? 'text-banking-orange' : 'text-primary-600'} />
              <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Year-by-Year Breakdown
              </h3>
            </div>
            
            <div className={`rounded-xl overflow-hidden ${isDark ? 'bg-banking-darkgray border-0 shadow-lg data-table' : 'border border-gray-200'}`}>
              <table className="min-w-full divide-y divide-gray-200 dark:divide-banking-highlight">
                <thead className={isDark ? 'bg-banking-gray' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-6 py-4 text-left text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Year</th>
                    <th className={`px-6 py-4 text-left text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Value</th>
                    <th className={`px-6 py-4 text-left text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Growth</th>
                    <th className={`px-6 py-4 text-left text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Growth %</th>
                  </tr>
                </thead>
                <tbody className={`divide-y divide-gray-200 dark:divide-banking-gray ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {yearlyBreakdown.map((item, index) => (
                    <tr key={index} className={index % 2 === 0 ? (isDark ? 'bg-banking-gray/50' : 'bg-gray-50') : ''}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">Year {item.year}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">₹{Math.round(item.amount).toLocaleString()}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${item.growth >= 0 ? (isDark ? 'text-banking-orange' : 'text-emerald-600') : 'text-red-500'}`}>
                        {item.year === 0 ? '-' : `₹${Math.round(item.growth).toLocaleString()}`}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${item.growth >= 0 ? (isDark ? 'text-banking-green' : 'text-primary-700') : 'text-red-500'}`}>
                        {item.year === 0 ? '-' : `${(item.growth / (item.amount - item.growth) * 100).toFixed(2)}%`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={`mt-3 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              This table shows how your investment grows year by year at the calculated CAGR.
            </p>
          </motion.div>

          {/* CAGR Explanation */}
          <AnimateOnView>
            <div className={`mt-10 p-5 rounded-xl ${
              isDark ? 'bg-banking-darkgray border-0 shadow-lg' : 'bg-white border border-gray-200 shadow-sm'
            }`}>
              <h4 className={`text-lg font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                About CAGR
              </h4>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                The Compound Annual Growth Rate (CAGR) is a representation of the annual growth rate of an investment over a specified time period. It provides a smoothed rate of return that accounts for the compounding effect.
              </p>
              <div className={`mt-3 p-3 rounded ${isDark ? 'bg-banking-gray' : 'bg-primary-50'} text-sm`}>
                <p className={`font-medium mb-1 ${isDark ? 'text-banking-orange' : 'text-primary-600'}`}>CAGR Formula:</p>
                <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                  CAGR = (Final Value / Initial Value)^(1/n) - 1
                </p>
                <p className={`mt-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Where n is the number of years
                </p>
              </div>
              <p className={`mt-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                CAGR is useful for comparing investments with different time periods or for understanding the "smoothed" growth rate of fluctuating investments. However, it doesn't account for investment volatility or cash flows during the investment period.
              </p>
            </div>
          </AnimateOnView>
        </motion.div>
      )}
    </CalculatorLayout>
  );
};

export default CAGRCalculator; 
