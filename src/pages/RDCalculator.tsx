import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Calendar, BarChart2, PieChart, ArrowRight, Clock } from 'lucide-react';
import CalculatorLayout from '../components/CalculatorLayout';
import { FormField, Input, Select, Button, ResultDisplay } from '../components/CalculatorForm';
import ActionableInsights from '../components/ActionableInsights';
import FinancialChart, { ChartData } from '../components/FinancialChart';
import { useTheme } from '../context/ThemeContext';
import {
  annualRateToEffectiveMonthlyRate,
  formatCurrencyINR,
  roundTo,
  safePercentage,
} from '../utils/finance';

// Define a type for compounding frequency to avoid string type issues
type CompoundFrequency = 'monthly' | 'quarterly' | 'half-yearly' | 'yearly';

const AnimateOnView = ({ children }: { children: React.ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
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

const RDCalculator: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // State variables for inputs
  const [monthlyDeposit, setMonthlyDeposit] = useState<number>(5000);
  const [interestRate, setInterestRate] = useState<number>(6.7);
  const [tenureMonths, setTenureMonths] = useState<number>(60);
  const [compoundFrequency, setCompoundFrequency] = useState<CompoundFrequency>("quarterly");
  const [showResults, setShowResults] = useState<boolean>(false);

  // State variables for calculation results
  const [maturityAmount, setMaturityAmount] = useState<number>(0);
  const [totalDeposited, setTotalDeposited] = useState<number>(0);
  const [interestEarned, setInterestEarned] = useState<number>(0);
  const [monthlyData, setMonthlyData] = useState<ChartData[]>([]);
  const [activeChart, setActiveChart] = useState<'bar' | 'pie'>('bar');
  const [depositDetails, setDepositDetails] = useState<{
    month: number;
    deposit: number;
    interest: number;
    balance: number;
  }[]>([]);
  const [showChart, setShowChart] = useState<boolean>(false);
  const [tableData, setTableData] = useState<any[]>([]);
  const rdSummary = `Saving ${formatCurrencyINR(monthlyDeposit)} each month for ${tenureMonths} months at ${interestRate}% can build about ${formatCurrencyINR(maturityAmount)} by maturity.`;
  const rdInsights = [
    {
      title: 'Savings discipline',
      detail: `You are setting aside ${formatCurrencyINR(totalDeposited)} in total principal, which makes RD useful for fixed goals with predictable timelines.`,
      tone: 'positive' as const,
    },
    {
      title: 'Interest share',
      detail: `Interest makes up about ${safePercentage(interestEarned, maturityAmount).toFixed(1)}% of the maturity value under the selected compounding pattern.`,
      tone: interestEarned >= totalDeposited * 0.2 ? 'positive' as const : 'neutral' as const,
    },
    {
      title: 'Best use case',
      detail: 'RD works best for short- to medium-term goals where capital safety matters more than beating inflation over long periods.',
      tone: 'action' as const,
    },
  ];
  const rdNextSteps = [
    { label: 'Compare with FD', to: '/calculators/fd' },
    { label: 'Try Goal SIP', to: '/calculators/goal-sip' },
  ];

  const calculateRD = () => {
    if (monthlyDeposit <= 0 || interestRate < 0 || tenureMonths <= 0) {
      setShowResults(false);
      setShowChart(false);
      setMaturityAmount(0);
      setTotalDeposited(0);
      setInterestEarned(0);
      setDepositDetails([]);
      setTableData([]);
      setMonthlyData([]);
      return;
    }

    setShowResults(false);
    setShowChart(false);

    let compoundingPeriods = 4; // Default is quarterly
    switch (compoundFrequency) {
      case 'monthly':
        compoundingPeriods = 12;
        break;
      case 'quarterly':
        compoundingPeriods = 4;
        break;
      case 'half-yearly':
        compoundingPeriods = 2;
        break;
      case 'yearly':
        compoundingPeriods = 1;
        break;
    }

    const monthlyRate = annualRateToEffectiveMonthlyRate(interestRate, compoundingPeriods);
    const totalDepositedAmount = monthlyDeposit * tenureMonths;
    setTotalDeposited(totalDepositedAmount);

    let currentBalance = 0;
    const details: {
      month: number;
      deposit: number;
      interest: number;
      balance: number;
    }[] = [];
    const tableRows: {
      month: number;
      deposit: number;
      interest: number;
      balance: number;
    }[] = [];
    const chartInterval = Math.max(1, Math.floor(tenureMonths / 12));

    for (let month = 1; month <= tenureMonths; month++) {
      currentBalance += monthlyDeposit;
      currentBalance *= 1 + monthlyRate;

      const detail = {
        month,
        deposit: roundTo(monthlyDeposit * month, 2),
        interest: roundTo(currentBalance - (monthlyDeposit * month), 2),
        balance: roundTo(currentBalance, 2),
      };

      details.push(detail);

      if (month === 1 || month % chartInterval === 0 || month === tenureMonths) {
        tableRows.push(detail);
      }
    }

    setMaturityAmount(roundTo(currentBalance, 2));
    setInterestEarned(roundTo(currentBalance - totalDepositedAmount, 2));
    setDepositDetails(details);
    setTableData(tableRows);
    
    const chartMonthlyData: ChartData[] = tableRows.map(row => ({
      name: `Month ${row.month}`,
      value: row.balance,
      color: isDark ? '#ff6b00' : '#0ea5e9'
    }));
    
    setMonthlyData(chartMonthlyData);
    setShowResults(true);
    setShowChart(true);
  };

  // Pie chart data for composition visualization
  const compositionData: ChartData[] = [
    { name: 'Total Deposit', value: totalDeposited, color: isDark ? '#1c1c1e' : '#0284c7' },
    { name: 'Interest Earned', value: interestEarned, color: isDark ? '#ff6b00' : '#10b981' },
  ];

  return (
    <CalculatorLayout
      title="RD Calculator"
      description="Calculate returns on your Recurring Deposit (RD) investments with various compounding options."
      icon={<Calendar size={24} className={isDark ? 'text-banking-orange' : ''} />}
    >
      <div className="space-y-6">
        <motion.div 
          className={`rounded-xl p-4 ${isDark ? 'bg-banking-darkgray border-0 shadow-lg' : 'bg-blue-50 border border-blue-100'}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-start gap-3">
            <Calendar size={20} className={isDark ? 'text-banking-orange' : 'text-blue-500'} />
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-blue-800'}`}>
                <strong>Key Features:</strong> A Recurring Deposit is a fixed deposit where you deposit a fixed amount every month for a predetermined period. It offers guaranteed returns and is ideal for regular savers.
              </p>
              <p className={`text-xs mt-1 ${isDark ? 'text-banking-orange' : 'text-blue-600'}`}>
                Interest is typically compounded quarterly in most banks.
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
              <h3 className="font-medium">Investment Details</h3>
            </div>
            
            <FormField label="Monthly Deposit" labelClass={isDark ? 'banking-label' : ''}>
              <Input
                type="number"
                prefix="₹"
                value={monthlyDeposit}
                onChange={(e) => setMonthlyDeposit(Number(e.target.value))}
                placeholder="Enter monthly deposit"
                min="500"
                step="500"
                className={isDark ? 'banking-input' : ''}
              />
            </FormField>
            
            <FormField label="Interest Rate (p.a.)" labelClass={isDark ? 'banking-label' : ''}>
              <Input
                type="number"
                suffix="%"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                placeholder="Enter interest rate"
                min="1"
                max="15"
                step="0.1"
                className={isDark ? 'banking-input' : ''}
              />
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
            
            <FormField label="Tenure" labelClass={isDark ? 'banking-label' : ''}>
              <Input
                type="number"
                suffix="months"
                value={tenureMonths}
                onChange={(e) => setTenureMonths(Number(e.target.value))}
                placeholder="Enter tenure in months"
                min="3"
                max="120"
                step="3"
                className={isDark ? 'banking-input' : ''}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                RD tenure typically ranges from 6 months to 10 years
              </p>
            </FormField>
            
            <FormField label="Compounding Frequency" labelClass={isDark ? 'banking-label' : ''}>
              <Select
                value={compoundFrequency}
                onChange={(e) => setCompoundFrequency(e.target.value as CompoundFrequency)}
                className={isDark ? 'banking-input' : ''}
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="half-yearly">Half-Yearly</option>
                <option value="yearly">Yearly</option>
              </Select>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Most banks use quarterly compounding for RDs
              </p>
            </FormField>
          </motion.div>
        </div>

        <div className="flex justify-center mt-6">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button onClick={calculateRD} className={isDark ? 'banking-button-primary w-full py-4 text-base' : ''}>
              <Calendar size={18} />
              Calculate RD Returns
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
            RD Calculation Results
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ResultDisplay 
              label="Maturity Amount" 
              value={`₹${maturityAmount.toLocaleString()}`} 
              highlight={true} 
              darkCustomClass={isDark ? 'bg-banking-darkgray border-0 text-banking-orange shadow-lg rounded-xl' : ''}
            />
            
            <ResultDisplay 
              label="Total Deposit" 
              value={`₹${totalDeposited.toLocaleString()}`} 
              darkCustomClass={isDark ? 'bg-banking-darkgray border-0 shadow-lg rounded-xl' : ''}
            />
            
            <ResultDisplay 
              label="Interest Earned" 
              value={`₹${interestEarned.toLocaleString()}`}
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
                  ₹{monthlyDeposit.toLocaleString()} <span className="text-xs">monthly</span>
                </span>
              </div>
              
              <ArrowRight className={`hidden md:block ${isDark ? 'text-gray-600' : 'text-gray-400'}`} size={20} />
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-primary-600/10 border border-primary-500/20 dark:bg-banking-darkgray dark:border-0 dark:shadow-lg">
                <span className={`text-xs font-medium ${isDark ? 'text-banking-orange' : 'text-primary-500'}`}>for</span>
                <span className="text-sm font-medium">
                  {tenureMonths} <span className="text-xs">months</span>
                </span>
              </div>
              
              <ArrowRight className={`hidden md:block ${isDark ? 'text-gray-600' : 'text-gray-400'}`} size={20} />
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-600/10 border border-emerald-500/20 dark:bg-banking-darkgray dark:border-0 dark:shadow-lg">
                <span className={`text-sm font-medium ${isDark ? 'text-banking-green' : 'text-emerald-500'}`}>
                  ₹{maturityAmount.toLocaleString()}
                </span>
              </div>
              
              <div className="hidden md:block p-3 rounded-lg border border-primary-500/20 dark:border-0 dark:bg-banking-darkgray dark:shadow-lg ml-auto">
                <span className="text-xs font-medium">
                  <span className={isDark ? 'text-banking-orange' : 'text-blue-600'}>₹{interestEarned.toLocaleString()}</span> earned as interest
                </span>
              </div>
            </div>
          </div>

          <ActionableInsights
            title="Use This RD Result"
            summary={rdSummary}
            insights={rdInsights}
            nextSteps={rdNextSteps}
          />

          {/* Progress bar */}
          <div className="mt-8">
            <div className="w-full bg-gray-200 dark:bg-banking-darkgray rounded-full h-3">
              <div 
                className="bg-primary-600 h-3 rounded-full" 
                style={{ 
                  width: `${safePercentage(totalDeposited, maturityAmount)}%`,
                  backgroundColor: isDark ? '#FF6B00' : ''
                }}
              ></div>
            </div>
            <div className="flex justify-between mt-2 text-xs">
              <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Deposit: <span className="font-medium">{Math.round(safePercentage(totalDeposited, maturityAmount))}%</span></span>
              <span className={isDark ? 'text-banking-orange' : 'text-primary-600'}>Interest: <span className="font-medium">{Math.round(safePercentage(interestEarned, maturityAmount))}%</span></span>
            </div>
          </div>

          {/* Charts */}
          <div className="mt-10">
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Growth Visualization
              </h3>
              
              <div className="flex gap-2">
                <motion.button
                  onClick={() => setActiveChart('bar')}
                  className={`p-2.5 rounded-lg border flex items-center gap-1 ${
                    activeChart === 'bar'
                      ? isDark 
                        ? 'bg-banking-darkgray border-0 text-banking-orange shadow-lg' 
                        : 'bg-primary-50 border-primary-200 text-primary-700'
                      : isDark
                        ? 'bg-banking-gray border-0 text-gray-300 shadow'
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
                  className={`p-2.5 rounded-lg border flex items-center gap-1 ${
                    activeChart === 'pie'
                      ? isDark 
                        ? 'bg-banking-darkgray border-0 text-banking-orange shadow-lg' 
                        : 'bg-primary-50 border-primary-200 text-primary-700'
                      : isDark
                        ? 'bg-banking-gray border-0 text-gray-300 shadow'
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
              <div className={isDark ? 'chart-container rounded-xl' : ''}>
                <FinancialChart 
                  data={monthlyData} 
                  type="bar" 
                  title="Month-by-Month Growth" 
                  xAxisLabel="Month" 
                  yAxisLabel="Amount (₹)" 
                  height={300}
                />
              </div>
            </AnimatedChartContainer>
            
            <AnimatedChartContainer isActive={activeChart === 'pie'}>
              <div className={isDark ? 'chart-container rounded-xl' : ''}>
                <FinancialChart 
                  data={compositionData} 
                  type="pie" 
                  title="Principal vs Interest" 
                  height={300}
                />
              </div>
            </AnimatedChartContainer>
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
                Key Milestones
              </h3>
            </div>
            
            <div className={`rounded-xl overflow-hidden ${isDark ? 'bg-banking-darkgray border-0 shadow-lg data-table' : 'border border-gray-200'}`}>
              <table className="min-w-full divide-y divide-gray-200 dark:divide-banking-highlight">
                <thead className={isDark ? 'bg-banking-gray' : 'bg-gray-50'}>
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Month</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Deposit</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Interest</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Balance</th>
                  </tr>
                </thead>
                <tbody className={`divide-y divide-gray-200 dark:divide-banking-gray ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {[
                    // Show first quarter
                    ...depositDetails.slice(0, 3),
                    // Show milestone at 25%
                    depositDetails[Math.floor(tenureMonths * 0.25) - 1],
                    // Show milestone at 50%
                    depositDetails[Math.floor(tenureMonths * 0.5) - 1],
                    // Show milestone at 75%
                    depositDetails[Math.floor(tenureMonths * 0.75) - 1],
                    // Show the last entry
                    depositDetails[tenureMonths - 1]
                  ].filter((data, index, self) =>
                    // Remove duplicates
                    index === self.findIndex(t => t?.month === data?.month)
                  ).map((data, index) => data && (
                    <tr key={index} className={index % 2 === 0 ? (isDark ? 'bg-banking-gray/50' : 'bg-gray-50') : ''}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">Month {data.month}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">₹{data.deposit.toLocaleString()}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-banking-orange' : 'text-emerald-600'}`}>
                        ₹{data.interest.toLocaleString()}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDark ? 'text-banking-green' : 'text-primary-700'}`}>
                        ₹{data.balance.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
              Showing key milestones. Interest is added at each {compoundFrequency} compounding period.
            </p>
          </motion.div>
        </motion.div>
      )}

      {showChart && tableData.length > 0 && (
        <AnimateOnView>
          <div className="p-6">
            <h3 className={`text-lg font-medium mb-4 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Investment Milestones
            </h3>
            <div className="overflow-x-auto">
              <table className={`min-w-full border-collapse ${isDark ? 'data-table' : ''}`}>
                <thead>
                  <tr className={isDark ? 'border-b border-banking-highlight' : 'bg-gray-50 border-b border-gray-200'}>
                    <th className={`py-3 px-4 text-left ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Month</th>
                    <th className={`py-3 px-4 text-left ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Deposit (₹)</th>
                    <th className={`py-3 px-4 text-left ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Interest (₹)</th>
                    <th className={`py-3 px-4 text-left ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Balance (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, index) => (
                    <tr key={index} className={`
                      ${index % 2 === 0 
                        ? isDark ? 'bg-banking-darkgray' : 'bg-white' 
                        : isDark ? 'bg-banking-gray' : 'bg-gray-50'
                      }
                      ${isDark ? 'border-b border-banking-highlight' : 'border-b border-gray-200'}
                    `}>
                      <td className={`py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{row.month}</td>
                      <td className={`py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {row.deposit.toLocaleString('en-IN')}
                      </td>
                      <td className={`py-3 px-4 ${isDark ? 'text-banking-green' : 'text-green-600'}`}>
                        {row.interest.toLocaleString('en-IN')}
                      </td>
                      <td className={`py-3 px-4 ${isDark ? 'text-banking-orange font-medium' : 'text-primary-600 font-medium'}`}>
                        {row.balance.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </AnimateOnView>
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

export default RDCalculator; 
