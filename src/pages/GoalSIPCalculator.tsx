import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, BarChart2, PieChart, ArrowRight, Clock, Target } from 'lucide-react';
import CalculatorLayout from '../components/CalculatorLayout';
import { FormField, Input, Button, ResultDisplay } from '../components/CalculatorForm';
import FinancialChart, { ChartData } from '../components/FinancialChart';
import ActionableInsights from '../components/ActionableInsights';
import { useTheme } from '../context/ThemeContext';
import {
  annualRateToNominalMonthlyRate,
  clamp,
  futureValue,
  futureValueOfMonthlySeries,
  roundTo,
  safePercentage,
} from '../utils/finance';

const GoalSIPCalculator: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // State variables for inputs
  const [goalAmount, setGoalAmount] = useState<number>(1000000);
  const [currentSavings, setCurrentSavings] = useState<number>(0);
  const [timePeriod, setTimePeriod] = useState<number>(5);
  const [expectedReturn, setExpectedReturn] = useState<number>(12);
  const [inflationRate, setInflationRate] = useState<number>(6);
  const [showResults, setShowResults] = useState<boolean>(false);

  // State variables for calculation results
  const [requiredMonthlyInvestment, setRequiredMonthlyInvestment] = useState<number>(0);
  const [inflationAdjustedGoal, setInflationAdjustedGoal] = useState<number>(0);
  const [totalInvestmentAmount, setTotalInvestmentAmount] = useState<number>(0);
  const [wealthGained, setWealthGained] = useState<number>(0);
  const [yearlyBreakdown, setYearlyBreakdown] = useState<{
    year: number;
    investment: number;
    returns: number;
    balance: number;
  }[]>([]);
  const [activeChart, setActiveChart] = useState<'bar' | 'pie'>('bar');
  const [yearlyData, setYearlyData] = useState<ChartData[]>([]);
  const formatMoney = (value: number) => `₹${Math.round(value).toLocaleString('en-IN')}`;
  const goalMonths = timePeriod * 12;
  const goalMonthlyRate = annualRateToNominalMonthlyRate(expectedReturn);
  const futureValueOfCurrentSavings = futureValue(currentSavings, goalMonthlyRate, goalMonths);
  const currentSavingsCoverage = safePercentage(futureValueOfCurrentSavings, inflationAdjustedGoal);
  const goalSummary = `To reach about ${formatMoney(inflationAdjustedGoal)} in ${timePeriod} years, this plan needs an SIP of roughly ${formatMoney(requiredMonthlyInvestment)} per month at ${expectedReturn}% expected return.`;
  const goalInsights = [
    {
      title: 'Existing savings help first',
      detail: currentSavings > 0
        ? `Your current savings could grow to about ${formatMoney(futureValueOfCurrentSavings)}, covering roughly ${currentSavingsCoverage.toFixed(1)}% of the inflation-adjusted target.`
        : 'You are starting from zero saved toward this goal, so the SIP has to do all the heavy lifting.',
      tone: currentSavings > 0 ? 'positive' as const : 'neutral' as const,
    },
    {
      title: 'Funding split',
      detail: `${Math.round(safePercentage(totalInvestmentAmount, inflationAdjustedGoal))}% of the goal comes from new SIP contributions and ${Math.round(safePercentage(wealthGained, inflationAdjustedGoal))}% from projected growth.`,
      tone: 'neutral' as const,
    },
    {
      title: 'Monthly commitment',
      detail: `This target asks for about ${formatMoney(requiredMonthlyInvestment)} every month for ${goalMonths} months, so the timeline is as important as the return assumption.`,
      tone: 'action' as const,
    },
  ];
  const goalNextSteps = [
    { label: 'Compare with SIP growth', to: '/calculators/sip' },
    { label: 'Review inflation again', to: '/calculators/inflation' },
  ];

  const calculateGoalSIP = () => {
    setShowResults(false);

    if (goalAmount <= 0 || timePeriod <= 0 || expectedReturn < 0 || inflationRate < 0 || currentSavings < 0) {
      return;
    }

    const futureGoalAmount = goalAmount * Math.pow(1 + inflationRate / 100, timePeriod);
    setInflationAdjustedGoal(futureGoalAmount);

    const monthlyRate = annualRateToNominalMonthlyRate(expectedReturn);
    const months = timePeriod * 12;
    const futureValueOfCurrentSavings = futureValue(currentSavings, monthlyRate, months);
    const targetShortfall = Math.max(0, futureGoalAmount - futureValueOfCurrentSavings);
    const sipFutureValueFactor = futureValueOfMonthlySeries({
      payment: 1,
      months,
      monthlyRate,
      contributionAtStart: true,
    });

    const monthlyInvestment =
      targetShortfall > 0 && sipFutureValueFactor > 0 ? targetShortfall / sipFutureValueFactor : 0;
    const totalSipContribution = monthlyInvestment * months;
    const projectedSipCorpus = futureValueOfMonthlySeries({
      payment: monthlyInvestment,
      months,
      monthlyRate,
      contributionAtStart: true,
    });
    const projectedCorpus = futureValueOfCurrentSavings + projectedSipCorpus;
    const projectedReturns = projectedCorpus - currentSavings - totalSipContribution;

    setRequiredMonthlyInvestment(roundTo(monthlyInvestment, 2));
    setTotalInvestmentAmount(roundTo(totalSipContribution, 2));
    setWealthGained(roundTo(projectedReturns, 2));

    const breakdownData: {
      year: number;
      investment: number;
      returns: number;
      balance: number;
    }[] = [];
    let totalInvestment = 0;
    let currentBalance = currentSavings;

    for (let month = 1; month <= months; month++) {
      currentBalance += monthlyInvestment;
      totalInvestment += monthlyInvestment;
      currentBalance *= 1 + monthlyRate;

      if (month % 12 === 0 || month === months) {
        breakdownData.push({
          year: Math.ceil(month / 12),
          investment: roundTo(totalInvestment, 2),
          returns: roundTo(currentBalance - currentSavings - totalInvestment, 2),
          balance: roundTo(currentBalance, 2),
        });
      }
    }

    setYearlyBreakdown(breakdownData);

    // Create chart data
    const chartData = breakdownData.map(item => ({
      name: `Year ${item.year}`,
      value: item.balance,
      color: isDark ? '#ff6b00' : '#0ea5e9'
    }));

    setYearlyData(chartData);
    setShowResults(true);
  };

  // Pie chart data for composition visualization
  const compositionData: ChartData[] = [
    { name: 'Initial Investment', value: currentSavings, color: isDark ? '#262626' : '#94a3b8' },
    { name: 'Total SIP Investment', value: totalInvestmentAmount, color: isDark ? '#1c1c1e' : '#0284c7' },
    { name: 'Wealth Gained', value: wealthGained, color: isDark ? '#ff6b00' : '#10b981' },
  ];

  return (
    <CalculatorLayout
      title="Goal SIP Calculator"
      description="Calculate the monthly SIP investment needed to achieve your financial goals."
      icon={<Target size={24} className={isDark ? 'text-banking-orange' : ''} />}
    >
      <div className="space-y-6">
        <motion.div 
          className={`rounded-xl p-4 ${isDark ? 'bg-banking-darkgray border-0 shadow-lg' : 'bg-blue-50 border border-blue-100'}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-start gap-3">
            <Target size={20} className={isDark ? 'text-banking-orange' : 'text-blue-500'} />
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-blue-800'}`}>
                <strong>Key Features:</strong> This calculator helps you determine how much you need to invest monthly through SIP to achieve your financial goals, taking inflation into account.
              </p>
              <p className={`text-xs mt-1 ${isDark ? 'text-banking-orange' : 'text-blue-600'}`}>
                Planning ahead helps you meet your financial goals with disciplined investments.
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
              <Target size={18} />
              <h3 className="font-medium">Goal Details</h3>
            </div>
            
            <FormField label="Target Goal Amount" labelClass={isDark ? 'banking-label' : ''}>
              <Input
                type="number"
                prefix="₹"
                value={goalAmount}
                onChange={(e) => setGoalAmount(Number(e.target.value))}
                placeholder="Enter your financial goal amount"
                min="10000"
                step="10000"
                className={isDark ? 'banking-input' : ''}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                The amount you want to achieve in the future
              </p>
            </FormField>
            
            <FormField label="Current Savings" labelClass={isDark ? 'banking-label' : ''}>
              <Input
                type="number"
                prefix="₹"
                value={currentSavings}
                onChange={(e) => setCurrentSavings(Number(e.target.value))}
                placeholder="Enter your current savings (optional)"
                min="0"
                step="1000"
                className={isDark ? 'banking-input' : ''}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Amount already saved towards this goal
              </p>
            </FormField>
            
            <FormField label="Inflation Rate (p.a.)" labelClass={isDark ? 'banking-label' : ''}>
              <Input
                type="number"
                suffix="%"
                value={inflationRate}
                onChange={(e) => setInflationRate(Number(e.target.value))}
                placeholder="Enter expected inflation rate"
                min="0"
                max="20"
                step="0.1"
                className={isDark ? 'banking-input' : ''}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Average inflation in India ranges from 4-6%
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
              <h3 className="font-medium">Investment Details</h3>
            </div>
            
            <FormField label="Time Period" labelClass={isDark ? 'banking-label' : ''}>
              <Input
                type="number"
                suffix="years"
                value={timePeriod}
                onChange={(e) => setTimePeriod(Number(e.target.value))}
                placeholder="Enter investment time period"
                min="1"
                max="40"
                step="1"
                className={isDark ? 'banking-input' : ''}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Number of years until you need to achieve your goal
              </p>
            </FormField>
            
            <FormField label="Expected Return Rate (p.a.)" labelClass={isDark ? 'banking-label' : ''}>
              <Input
                type="number"
                suffix="%"
                value={expectedReturn}
                onChange={(e) => setExpectedReturn(Number(e.target.value))}
                placeholder="Enter expected annual return rate"
                min="1"
                max="30"
                step="0.1"
                className={isDark ? 'banking-input' : ''}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Historically, equity mutual funds have returned 12-15% p.a.
              </p>
            </FormField>
          </motion.div>
        </div>

        <div className="flex justify-center mt-6">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button onClick={calculateGoalSIP} className={isDark ? 'banking-button-primary w-full py-4 text-base' : ''}>
              <Target size={18} />
              Calculate Required SIP
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
            Goal SIP Calculation Results
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ResultDisplay 
              label="Monthly SIP Required" 
              value={`₹${Math.round(requiredMonthlyInvestment).toLocaleString()}`} 
              highlight={true} 
              darkCustomClass={isDark ? 'bg-banking-darkgray border-0 text-banking-orange shadow-lg rounded-xl' : ''}
            />
            
            <ResultDisplay 
              label="Inflation-Adjusted Goal" 
              value={`₹${Math.round(inflationAdjustedGoal).toLocaleString()}`} 
              darkCustomClass={isDark ? 'bg-banking-darkgray border-0 shadow-lg rounded-xl' : ''}
            />
            
            <ResultDisplay 
              label="Total Wealth Gained" 
              value={`₹${Math.round(wealthGained).toLocaleString()}`}
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
                  ₹{Math.round(requiredMonthlyInvestment).toLocaleString()} <span className="text-xs">monthly</span>
                </span>
              </div>
              
              <ArrowRight className={`hidden md:block ${isDark ? 'text-gray-600' : 'text-gray-400'}`} size={20} />
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-primary-600/10 border border-primary-500/20 dark:bg-banking-darkgray dark:border-0 dark:shadow-lg">
                <span className={`text-xs font-medium ${isDark ? 'text-banking-orange' : 'text-primary-500'}`}>for</span>
                <span className="text-sm font-medium">
                  {timePeriod} <span className="text-xs">years</span>
                </span>
              </div>
              
              <ArrowRight className={`hidden md:block ${isDark ? 'text-gray-600' : 'text-gray-400'}`} size={20} />
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-600/10 border border-emerald-500/20 dark:bg-banking-darkgray dark:border-0 dark:shadow-lg">
                <span className={`text-sm font-medium ${isDark ? 'text-banking-green' : 'text-emerald-500'}`}>
                  ₹{Math.round(inflationAdjustedGoal).toLocaleString()}
                </span>
              </div>
              
              <div className="hidden md:block p-3 rounded-lg border border-primary-500/20 dark:border-0 dark:bg-banking-darkgray dark:shadow-lg ml-auto">
                <span className="text-xs font-medium">
                  <span className={isDark ? 'text-banking-orange' : 'text-blue-600'}>
                    {safePercentage(wealthGained, currentSavings + totalInvestmentAmount).toFixed(1)}% gain
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-8">
            <div className="w-full bg-gray-200 dark:bg-banking-darkgray rounded-full h-3">
              <div 
                className="bg-primary-600 h-3 rounded-full" 
                style={{ 
                  width: `${clamp(safePercentage(totalInvestmentAmount + currentSavings, inflationAdjustedGoal), 0, 100)}%`,
                  backgroundColor: isDark ? '#FF6B00' : ''
                }}
              ></div>
            </div>
            <div className="flex justify-between mt-2 text-xs">
              <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Investment: <span className="font-medium">
                  {Math.round(safePercentage(totalInvestmentAmount + currentSavings, inflationAdjustedGoal))}%
                </span>
              </span>
              <span className={isDark ? 'text-banking-orange' : 'text-primary-600'}>
                Returns: <span className="font-medium">
                  {Math.round(safePercentage(wealthGained, inflationAdjustedGoal))}%
                </span>
              </span>
            </div>
          </div>

          <ActionableInsights
            summary={goalSummary}
            insights={goalInsights}
            nextSteps={goalNextSteps}
          />

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
                  data={yearlyData} 
                  type="bar" 
                  title="Year-by-Year Growth" 
                  xAxisLabel="Year" 
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
                  title="Investment vs Returns" 
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
                Year-by-Year Breakdown
              </h3>
            </div>
            
            <div className={`rounded-xl overflow-hidden ${isDark ? 'bg-banking-darkgray border-0 shadow-lg data-table' : 'border border-gray-200'}`}>
              <table className="min-w-full divide-y divide-gray-200 dark:divide-banking-highlight">
                <thead className={isDark ? 'bg-banking-gray' : 'bg-gray-50'}>
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Year</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Invested</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Wealth Gained</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Value</th>
                  </tr>
                </thead>
                <tbody className={`divide-y divide-gray-200 dark:divide-banking-gray ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {yearlyBreakdown.map((item, index) => (
                    <tr key={index} className={index % 2 === 0 ? (isDark ? 'bg-banking-gray/50' : 'bg-gray-50') : ''}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">Year {item.year}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">₹{Math.round(item.investment).toLocaleString()}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-banking-orange' : 'text-emerald-600'}`}>
                        ₹{Math.round(item.returns).toLocaleString()}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDark ? 'text-banking-green' : 'text-primary-700'}`}>
                        ₹{Math.round(item.balance).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
              This table shows how your investment grows year by year. The total value includes current savings, SIP investments, and returns.
            </p>
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

export default GoalSIPCalculator; 
