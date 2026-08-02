import React, { useState } from 'react';
import { Calculator, TrendingUp, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import CalculatorLayout from '../components/CalculatorLayout';
import { FormField, Input, Button } from '../components/CalculatorForm';
import ActionableInsights from '../components/ActionableInsights';
import { ChartData } from '../components/FinancialChart';
import { useTheme } from '../context/ThemeContext';
import { formatCurrencyINR, safePercentage } from '../utils/finance';

interface YearlyData {
  name: string;
  principal: number;
  interest: number;
  total: number;
}

const NSCCalculator: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // State variables
  const [investmentAmount, setInvestmentAmount] = useState<number>(10000);
  const [interestRate, setInterestRate] = useState<number>(7.7);
  const [tenure, setTenure] = useState<number>(5);
  const [maturityAmount, setMaturityAmount] = useState<number>(0);
  const [totalInvestment, setTotalInvestment] = useState<number>(0);
  const [interestEarned, setInterestEarned] = useState<number>(0);
  const [yearlyData, setYearlyData] = useState<YearlyData[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [error, setError] = useState('');
  const nscSummary = `A one-time NSC investment of ${formatCurrencyINR(totalInvestment)} at ${interestRate}% for ${tenure} years grows to ${formatCurrencyINR(maturityAmount)}, earning ${formatCurrencyINR(interestEarned)} in interest.`;
  const nscInsights = [
    {
      title: 'Guaranteed growth',
      detail: `Interest contributes about ${safePercentage(interestEarned, maturityAmount).toFixed(1)}% of the maturity value, which makes NSC useful for capital protection with predictable returns.`,
      tone: 'positive' as const,
    },
    {
      title: 'Tax lens',
      detail: 'The principal qualifies for Section 80C deduction. Accrued interest is taxable each year, though the reinvested portion generally also counts under 80C except in the final year.',
      tone: 'action' as const,
    },
    {
      title: 'Liquidity note',
      detail: 'NSC is best for money you can leave untouched until maturity because premature exit options are very limited.',
      tone: 'caution' as const,
    },
  ];
  const nscNextSteps = [
    { label: 'Compare with FD', to: '/calculators/fd' },
    { label: 'Compare with PPF', to: '/calculators/ppf' },
  ];
  
  const calculateNSC = () => {
    if (!investmentAmount || !interestRate || !tenure) {
      setError('Enter a positive investment, interest rate and tenure.');
      return;
    }
    setError('');
    
    const rate = interestRate / 100;
    
    // Calculate maturity amount: A = P(1 + r)^t
    const maturity = investmentAmount * Math.pow(1 + rate, tenure);
    const interest = maturity - investmentAmount;
    
    setMaturityAmount(Math.round(maturity * 100) / 100);
    setTotalInvestment(investmentAmount);
    setInterestEarned(Math.round(interest * 100) / 100);
    
    // Generate yearly data
    const yearsData: YearlyData[] = [];
    const chartD: ChartData[] = [];
    
    for (let year = 0; year <= tenure; year++) {
      const yearAmount = investmentAmount * Math.pow(1 + rate, year);
      const yearInterest = yearAmount - investmentAmount;
      
      yearsData.push({
        name: `Year ${year}`,
        principal: investmentAmount,
        interest: Math.round(yearInterest * 100) / 100,
        total: Math.round(yearAmount * 100) / 100
      });
      
      chartD.push({
        name: `Year ${year}`,
        value: Math.round(yearAmount),
        color: '#0284c7' // Blue color for consistent chart
      });
    }
    
    setYearlyData(yearsData);
    setChartData(chartD);
    setShowResults(true);
  };
  
  const resetForm = () => {
    setInvestmentAmount(10000);
    setInterestRate(6.8);
    setTenure(5);
    setShowResults(false);
  };
  
  return (
    <CalculatorLayout
      title="NSC Calculator"
      description="Calculate returns on your National Savings Certificate (NSC) investment. NSC is a safe government-backed investment with fixed returns."
      icon={<Calculator size={24} />}
    >
      <div className="space-y-6">
        <motion.div 
          className={`rounded-lg p-4 border ${isDark ? 'bg-primary-900/30 border-primary-800' : 'bg-blue-50 border-blue-100'}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p className={`text-sm ${isDark ? 'text-primary-100' : 'text-blue-800'}`}>
            <strong>Quick Tip:</strong> National Savings Certificate (NSC) is a government-backed savings bond that offers guaranteed returns along with tax benefits under Section 80C of the Income Tax Act.
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
              <TrendingUp size={18} />
              <h3 className="font-medium">Investment Details</h3>
            </div>
            
            <FormField label="Investment Amount">
              <Input
                type="number"
                prefix="₹"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                placeholder="Enter investment amount"
                min="1"
              />
            </FormField>
            
            <FormField label="Interest Rate">
              <Input
                type="number"
                suffix="%"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                placeholder="Enter interest rate"
                min="0.1"
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
            <div className="flex items-center gap-2 mb-4 text-primary-600 dark:text-primary-400">
              <Calendar size={18} />
              <h3 className="font-medium">Time Period</h3>
            </div>
            
            <FormField label="Tenure (Years)">
              <Input
                type="number"
                value={tenure}
                onChange={(e) => setTenure(Number(e.target.value))}
                placeholder="Enter tenure in years"
                min="1"
                max="40"
              />
            </FormField>
            
            <div className="mt-8 flex space-x-3">
              {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</p>}
              <Button type="button" onClick={calculateNSC}>
                Calculate
              </Button>
              <button
                type="button"
                onClick={resetForm}
                className={`px-4 py-2 rounded-md border ${isDark 
                  ? 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700' 
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'} 
                  transition-colors flex items-center justify-center space-x-2`}
              >
                Reset
              </button>
            </div>
          </motion.div>
        </div>

        {showResults && (
          <motion.div 
            className="mt-8 bg-white dark:bg-dark-card rounded-xl shadow-md p-6 border border-gray-100 dark:border-dark-border"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
              <span className="text-primary-500">📈</span>
              NSC Investment Summary
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <motion.div 
                className="bg-gray-50 dark:bg-dark-card-light rounded-lg p-4 border border-gray-100 dark:border-dark-border"
              >
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Invested Amount</p>
                <div className="text-xl font-bold text-gray-800 dark:text-white">
                  ₹ {totalInvestment.toLocaleString()}
                </div>
              </motion.div>

              <motion.div 
                className="bg-gray-50 dark:bg-dark-card-light rounded-lg p-4 border border-gray-100 dark:border-dark-border"
              >
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Interest Earned</p>
                <div className="text-xl font-bold text-primary-600 dark:text-primary-400">
                  ₹ {interestEarned.toLocaleString()}
                </div>
              </motion.div>

              <motion.div 
                className="bg-primary-50 dark:bg-primary-900/30 rounded-lg p-4 border border-primary-100 dark:border-primary-800/40"
              >
                <p className="text-sm text-primary-600 dark:text-primary-400 mb-1">Maturity Value</p>
                <div className="text-xl font-bold text-primary-700 dark:text-primary-300">
                  ₹ {maturityAmount.toLocaleString()}
                </div>
              </motion.div>
            </div>

            <ActionableInsights
              title="Use This NSC Result"
              summary={nscSummary}
              insights={nscInsights}
              nextSteps={nscNextSteps}
            />

            {/* Growth Chart */}
            <motion.div
              className="mt-6 h-64 md:h-72"
            >
              <h3 className="text-md font-medium mb-3 text-gray-700 dark:text-gray-300">Investment Growth</h3>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 5, left: 0, bottom: 15 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                  <XAxis 
                    dataKey="name" 
                    label={{ 
                      value: 'Years', 
                      position: 'insideBottomRight', 
                      offset: -10,
                      fill: isDark ? '#ccc' : '#666'
                    }}
                    tick={{ fill: isDark ? '#ccc' : '#666' }}
                  />
                  <YAxis 
                    tickFormatter={(value) => `₹${value.toLocaleString()}`}
                    tick={{ fill: isDark ? '#ccc' : '#666' }}
                  />
                  <Tooltip 
                    formatter={(value) => [`₹${Number(value).toLocaleString()}`, null]}
                    labelFormatter={(label) => `Year ${label}`}
                    contentStyle={{ 
                      backgroundColor: isDark ? '#1f2937' : '#ffffff',
                      borderColor: isDark ? '#374151' : '#e5e7eb',
                      color: isDark ? '#e5e7eb' : '#111827'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    name="Investment Value" 
                    stroke={isDark ? '#6366F1' : '#4F46E5'} 
                    strokeWidth={2} 
                    dot={{ fill: isDark ? '#6366F1' : '#4F46E5', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
            
            {/* Year-wise Breakdown */}
            <motion.div
              className="mt-8"
            >
              <h3 className="text-md font-medium mb-3 text-gray-700 dark:text-gray-300">Year-wise Interest Breakdown</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-dark-card-light">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Year</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Year Start Value</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Interest Earned</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Year End Value</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-gray-700">
                    {yearlyData.map((item, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-50 dark:bg-dark-card-light' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">{item.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                          ₹{(item.principal).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-600 dark:text-primary-400">
                          ₹{(item.interest).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200">
                          ₹{(item.total).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Information section */}
      <motion.div 
        className="mt-8 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800/40"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h3 
          className="text-lg font-semibold mb-2 text-blue-700 dark:text-blue-300 flex items-center gap-2"
        >
          <span className="text-blue-500">ℹ️</span>
          About NSC Investment
        </motion.h3>
        <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300 opacity-90">
          <p>• National Savings Certificate (NSC) is a fixed income investment scheme that helps you save tax under Section 80C of Income Tax Act.</p>
          <p>• NSC has a fixed tenure of 5 years with interest compounded annually but paid at maturity.</p>
          <p>• The current interest rate is 6.8% p.a. (as of April 2023), which is subject to change periodically by the government.</p>
          <p>• While the interest earned is taxable each year, it is automatically reinvested which also qualifies for tax deduction under Section 80C (except in the final year).</p>
          <p>• NSC can be purchased from any post office in India in denominations starting from ₹100.</p>
        </div>
      </motion.div>
    </CalculatorLayout>
  );
};

export default NSCCalculator; 
