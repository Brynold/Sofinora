import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, DollarSign, PieChart } from 'lucide-react';
import CalculatorLayout from '../components/CalculatorLayout';
import { FormField, Input, Select, Button, ResultDisplay } from '../components/CalculatorForm';
import FinancialChart, { ChartData } from '../components/FinancialChart';
import ActionableInsights from '../components/ActionableInsights';
import { useTheme } from '../context/ThemeContext';
import {
  annualRateToNominalMonthlyRate,
  futureValue,
  futureValueOfMonthlySeries,
  safePercentage,
} from '../utils/finance';

interface YearlyData {
  year: number;
  investedAmount: number;
  interest: number;
  totalValue: number;
}

const MFCalculator: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Investment type state (SIP or Lumpsum)
  const [investmentType, setInvestmentType] = useState<'sip' | 'lumpsum'>('sip');
  
  // Fund category state
  const [fundCategory, setFundCategory] = useState<'equity' | 'debt' | 'hybrid'>('equity');
  
  // Form state
  const [investmentAmount, setInvestmentAmount] = useState<number>(10000);
  const [expectedReturnRate, setExpectedReturnRate] = useState<number>(12);
  const [investmentPeriod, setInvestmentPeriod] = useState<number>(5);
  
  // Results state
  const [totalInvestment, setTotalInvestment] = useState<number>(0);
  const [estimatedReturns, setEstimatedReturns] = useState<number>(0);
  const [maturityValue, setMaturityValue] = useState<number>(0);
  const [yearlyData, setYearlyData] = useState<YearlyData[]>([]);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [activeChart, setActiveChart] = useState<'bar' | 'pie'>('bar');
  const formatMoney = (value: number) => `₹${Math.round(value).toLocaleString('en-IN')}`;
  const corpusMultiple = totalInvestment > 0 ? maturityValue / totalInvestment : 0;
  const doublingYears = expectedReturnRate > 0 ? 72 / expectedReturnRate : 0;
  const mfSummary = `${investmentType === 'sip' ? 'A monthly investment' : 'A lump sum investment'} of ${formatMoney(investmentAmount)} in a ${fundCategory} fund is projected to grow to about ${formatMoney(maturityValue)} over ${investmentPeriod} years.`;
  const mfInsights = [
    {
      title: 'Return mix',
      detail: `Projected gains contribute about ${Math.round(safePercentage(estimatedReturns, maturityValue))}% of the final value.`,
      tone: estimatedReturns > totalInvestment ? 'positive' as const : 'neutral' as const,
    },
    {
      title: investmentType === 'sip' ? 'SIP discipline' : 'Lumpsum compounding',
      detail: investmentType === 'sip'
        ? `Your plan turns each rupee of contribution into roughly ${corpusMultiple.toFixed(2)} rupees of corpus over the selected period.`
        : `At ${expectedReturnRate}% annual growth, money roughly doubles every ${doublingYears.toFixed(1)} years under the rule of 72.`,
      tone: 'action' as const,
    },
    {
      title: 'Assumption check',
      detail: `${fundCategory.charAt(0).toUpperCase() + fundCategory.slice(1)} funds can swing above or below this path, so review the return assumption alongside your risk comfort.`,
      tone: 'caution' as const,
    },
  ];
  const mfNextSteps = [
    { label: 'Compare with SIP calculator', to: '/calculators/sip' },
    { label: 'See goal-based SIP need', to: '/calculators/goal-sip' },
  ];
  
  // Calculate Lumpsum MF returns
  const calculateLumpsumReturns = () => {
    if (
      !investmentAmount ||
      !expectedReturnRate ||
      !investmentPeriod ||
      investmentAmount <= 0 ||
      expectedReturnRate <= 0 ||
      investmentPeriod <= 0
    ) {
      setTotalInvestment(0);
      setEstimatedReturns(0);
      setMaturityValue(0);
      setYearlyData([]);
      setShowResults(false);
      return;
    }
    
    const data: YearlyData[] = [];
    const monthlyRate = annualRateToNominalMonthlyRate(expectedReturnRate);
    let currentValue = investmentAmount;
    
    for (let year = 1; year <= investmentPeriod; year++) {
      const startValue = currentValue;
      currentValue = futureValue(currentValue, monthlyRate, 12);
      
      const yearlyInterest = currentValue - startValue;
      
      data.push({
        year,
        investedAmount: investmentAmount,
        interest: parseFloat(yearlyInterest.toFixed(2)),
        totalValue: parseFloat(currentValue.toFixed(2))
      });
    }

    setTotalInvestment(investmentAmount);
    setEstimatedReturns(parseFloat((currentValue - investmentAmount).toFixed(2)));
    setMaturityValue(parseFloat(currentValue.toFixed(2)));
    setYearlyData(data);
    setShowResults(true);
  };

  // Calculate SIP MF returns
  const calculateSIPReturns = () => {
    if (
      !investmentAmount ||
      !expectedReturnRate ||
      !investmentPeriod ||
      investmentAmount <= 0 ||
      expectedReturnRate <= 0 ||
      investmentPeriod <= 0
    ) {
      setTotalInvestment(0);
      setEstimatedReturns(0);
      setMaturityValue(0);
      setYearlyData([]);
      setShowResults(false);
      return;
    }
    
    const data: YearlyData[] = [];
    const monthlyRate = annualRateToNominalMonthlyRate(expectedReturnRate);
    let totalAmount = 0;
    let totalInvested = 0;

    for (let year = 1; year <= investmentPeriod; year++) {
      const yearStart = totalAmount;
      const yearlyInvestment = investmentAmount * 12;
      totalInvested += yearlyInvestment;
      
      totalAmount = futureValue(totalAmount, monthlyRate, 12) + futureValueOfMonthlySeries({
        payment: investmentAmount,
        months: 12,
        monthlyRate,
        contributionAtStart: true,
      });
      
      const yearlyInterest = totalAmount - yearStart - yearlyInvestment;
      
      data.push({
        year,
        investedAmount: totalInvested,
        interest: parseFloat(yearlyInterest.toFixed(2)),
        totalValue: parseFloat(totalAmount.toFixed(2))
      });
    }

    setTotalInvestment(totalInvested);
    setEstimatedReturns(parseFloat((totalAmount - totalInvested).toFixed(2)));
    setMaturityValue(parseFloat(totalAmount.toFixed(2)));
    setYearlyData(data);
    setShowResults(true);
  };

  // Handle calculate button click
  const handleCalculate = () => {
    if (investmentType === 'lumpsum') {
      calculateLumpsumReturns();
    } else {
      calculateSIPReturns();
    }
  };

  // Chart options
  const chartOptions = {
    tooltip: {
      formatter: (value: number) => `₹${value.toLocaleString('en-IN')}`,
    },
    colors: {
      investment: isDark ? '#1c1c1e' : '#0284c7',
      interest: isDark ? '#ff6b00' : '#10b981',
    },
  };

  // Pie chart data for composition visualization
  const compositionData: ChartData[] = [
    { name: 'Total Investment', value: totalInvestment, color: chartOptions.colors.investment },
    { name: 'Interest Earned', value: estimatedReturns, color: chartOptions.colors.interest },
  ];

  // Chart data for year wise growth
  const yearlyChartData: ChartData[] = yearlyData.map(data => ({
    name: `Year ${data.year}`,
    value: data.totalValue,
    color: data.year === investmentPeriod ? '#0ea5e9' : undefined
  }));

  return (
    <CalculatorLayout
      title="Mutual Fund Calculator"
      description="Calculate potential returns on your mutual fund investments whether through SIP or lumpsum."
      icon={<BarChart3 size={24} className={isDark ? 'text-banking-orange' : ''} />}
    >
      <div className="space-y-6">
        <motion.div 
          className={`rounded-xl p-4 ${isDark ? 'bg-banking-darkgray border-0 shadow-lg' : 'bg-blue-50 border border-blue-100'}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-start gap-3">
            <BarChart3 size={20} className={isDark ? 'text-banking-orange' : 'text-blue-500'} />
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-blue-800'}`}>
                <strong>Investment Types:</strong> Choose between SIP (Systematic Investment Plan) where you invest a fixed amount regularly, or Lumpsum where you invest a single amount at once.
              </p>
              <p className={`text-xs mt-1 ${isDark ? 'text-banking-orange' : 'text-blue-600'}`}>
                SIPs typically provide better risk-adjusted returns due to rupee cost averaging.
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Investment Type Selection */}
          <motion.div 
            className={`rounded-xl p-5 ${isDark ? 'bg-banking-gray border-0 shadow-lg' : 'bg-white border border-gray-100 shadow-sm'}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-5 text-primary-600 dark:text-banking-orange">
              <TrendingUp size={18} />
              <h3 className="font-medium">Investment Details</h3>
            </div>
            
            <FormField label="Investment Type" labelClass={isDark ? 'banking-label' : ''}>
              <Select
                value={investmentType}
                onChange={(e) => setInvestmentType(e.target.value as 'sip' | 'lumpsum')}
                className={isDark ? 'banking-input' : ''}
              >
                <option value="sip">SIP (Monthly)</option>
                <option value="lumpsum">Lumpsum (One-time)</option>
              </Select>
            </FormField>
            
            <FormField label="Fund Category" labelClass={isDark ? 'banking-label' : ''}>
              <Select
                value={fundCategory}
                onChange={(e) => setFundCategory(e.target.value as 'equity' | 'debt' | 'hybrid')}
                className={isDark ? 'banking-input' : ''}
              >
                <option value="equity">Equity</option>
                <option value="debt">Debt</option>
                <option value="hybrid">Hybrid</option>
              </Select>
            </FormField>
            
            <FormField label={investmentType === 'sip' ? "Monthly Investment" : "Lumpsum Investment"} labelClass={isDark ? 'banking-label' : ''}>
              <Input
                type="number"
                prefix="₹"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                placeholder="Enter investment amount"
                min="500"
                step="500"
                className={isDark ? 'banking-input' : ''}
              />
            </FormField>
          </motion.div>

          {/* Growth Rate and Period */}
          <motion.div 
            className={`rounded-xl p-5 ${isDark ? 'bg-banking-gray border-0 shadow-lg' : 'bg-white border border-gray-100 shadow-sm'}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-5 text-primary-600 dark:text-banking-orange">
              <DollarSign size={18} />
              <h3 className="font-medium">Return Details</h3>
            </div>
            
            <FormField label="Expected Return Rate" labelClass={isDark ? 'banking-label' : ''}>
              <Input
                type="number"
                suffix="%"
                value={expectedReturnRate}
                onChange={(e) => setExpectedReturnRate(Number(e.target.value))}
                placeholder="Enter expected return rate"
                min="1"
                max="30"
                step="0.1"
                className={isDark ? 'banking-input' : ''}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Historical returns: Equity (10-12%), Debt (6-8%), Hybrid (8-10%)
              </p>
            </FormField>
            
            <FormField label="Investment Period" labelClass={isDark ? 'banking-label' : ''}>
              <Input
                type="number"
                suffix="years"
                value={investmentPeriod}
                onChange={(e) => setInvestmentPeriod(Number(e.target.value))}
                placeholder="Enter investment period"
                min="1"
                max="30"
                step="1"
                className={isDark ? 'banking-input' : ''}
              />
            </FormField>
          </motion.div>
        </div>

        <div className="flex justify-center mt-6">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button onClick={handleCalculate} className={isDark ? 'banking-button-primary w-full py-4 text-base' : ''}>
              <BarChart3 size={18} />
              Calculate Returns
            </Button>
          </motion.div>
        </div>

        {/* Results Section */}
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-10"
          >
            <h2 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-800'}`}>Investment Results</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ResultDisplay 
                label="Total Investment" 
                value={`₹${totalInvestment.toLocaleString('en-IN')}`}
                icon={<DollarSign size={20} />}
                darkCustomClass={isDark ? 'dark-card' : ''}
              />
              <ResultDisplay 
                label="Estimated Returns" 
                value={`₹${estimatedReturns.toLocaleString('en-IN')}`}
                icon={<TrendingUp size={20} />} 
                highlight={true}
                darkCustomClass={isDark ? 'dark-card' : ''}
              />
              <ResultDisplay 
                label="Maturity Value" 
                value={`₹${maturityValue.toLocaleString('en-IN')}`}
                icon={<BarChart3 size={20} />}
                highlight={true}
                darkCustomClass={isDark ? 'dark-card' : ''}
              />
            </div>

            <div className="mt-6">
              <div className="w-full bg-gray-200 dark:bg-dark-border rounded-full h-2.5">
                <div className="bg-primary-600 dark:bg-primary-500 h-2.5 rounded-full" style={{ width: `${safePercentage(totalInvestment, maturityValue)}%` }}></div>
              </div>
              <div className="flex justify-between mt-2 text-xs">
                <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Principal: {Math.round(safePercentage(totalInvestment, maturityValue))}%</span>
                <span className="text-primary-600 dark:text-primary-400">Returns: {Math.round(safePercentage(estimatedReturns, maturityValue))}%</span>
              </div>
            </div>

            <ActionableInsights
              summary={mfSummary}
              insights={mfInsights}
              nextSteps={mfNextSteps}
            />

            {/* Chart Toggle */}
            <div className="flex space-x-4 mt-8 mb-4">
              <button
                onClick={() => setActiveChart('bar')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeChart === 'bar'
                    ? 'bg-primary-100 text-primary-700 dark:bg-banking-gray dark:text-banking-orange'
                    : 'bg-gray-100 text-gray-700 dark:bg-dark-card dark:text-gray-300'
                }`}
              >
                <BarChart3 size={16} />
                Growth Chart
              </button>
              <button
                onClick={() => setActiveChart('pie')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeChart === 'pie'
                    ? 'bg-primary-100 text-primary-700 dark:bg-banking-gray dark:text-banking-orange'
                    : 'bg-gray-100 text-gray-700 dark:bg-dark-card dark:text-gray-300'
                }`}
              >
                <PieChart size={16} />
                Composition
              </button>
            </div>

            {/* Charts - Mobile friendly version */}
            <div className={`rounded-xl p-4 sm:p-5 ${isDark ? 'bg-banking-gray border-0 shadow-lg' : 'bg-white border border-gray-100 shadow-sm'} overflow-hidden`}>
              {activeChart === 'bar' ? (
                <div className="h-72 sm:h-80 w-full">
                  <FinancialChart
                    data={yearlyChartData}
                    type="bar"
                  />
                </div>
              ) : (
                <div className="px-4 py-6">
                  {/* Simple pie chart container */}
                  <div className="w-full aspect-square max-w-[280px] mx-auto mb-8">
                    <FinancialChart
                      data={compositionData}
                      type="pie"
                      showLegend={false}
                    />
                  </div>
                  
                  {/* Clear legend below chart */}
                  <div className="w-full max-w-[280px] mx-auto">
                    <div className="flex flex-col gap-6">
                      {compositionData.map((item, index) => (
                        <div key={`legend-${index}`} className="flex items-center border-b pb-4 border-gray-100 dark:border-gray-700 last:border-0">
                          <div className="w-6 h-6 rounded-full mr-4" style={{ backgroundColor: item.color }}></div>
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {maturityValue > 0 ? `${Math.round(safePercentage(item.value, maturityValue))}%` : '0%'}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              ₹{item.value.toLocaleString('en-IN')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Year-wise breakup table */}
            <div className={`mt-8 overflow-x-auto ${isDark ? 'bg-banking-gray border-0 shadow-lg' : 'bg-white border border-gray-100 shadow-sm'} rounded-lg p-4`}>
              <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Year-wise Breakdown
              </h4>
              <table className="w-full min-w-full divide-y divide-gray-200 dark:divide-dark-border">
                <thead>
                  <tr>
                    <th className={`px-4 py-3.5 text-left text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Year</th>
                    <th className={`px-4 py-3.5 text-left text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Invested Amount</th>
                    <th className={`px-4 py-3.5 text-left text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Interest Earned</th>
                    <th className={`px-4 py-3.5 text-left text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Total Value</th>
                  </tr>
                </thead>
                <tbody className={`divide-y divide-gray-200 dark:divide-dark-border ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {yearlyData.map((data) => (
                    <tr key={data.year} className={data.year === investmentPeriod ? (isDark ? 'bg-banking-darkgray/50' : 'bg-blue-50') : ''}>
                      <td className="px-4 py-3.5">{data.year}</td>
                      <td className="px-4 py-3.5">₹{data.investedAmount.toLocaleString('en-IN')}</td>
                      <td className={`px-4 py-3.5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        ₹{data.interest.toLocaleString('en-IN')}
                      </td>
                      <td className={`px-4 py-3.5 ${isDark ? 'text-primary-400 font-medium' : 'text-primary-600 font-medium'}`}>
                        ₹{data.totalValue.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* About Mutual Funds */}
            <motion.div 
              className={`mt-8 rounded-xl p-5 ${isDark ? 'bg-banking-darkgray/70 border-0 shadow-lg' : 'bg-blue-50 border border-blue-100'}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h4 className={`text-lg font-medium mb-3 ${isDark ? 'text-white' : 'text-blue-800'}`}>
                About Mutual Fund Investments
              </h4>
              
              <div className="space-y-4">
                <div>
                  <h5 className={`text-sm font-medium mb-1 ${isDark ? 'text-banking-orange' : 'text-blue-700'}`}>Types of Funds:</h5>
                  <ul className={`list-disc pl-5 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <li><strong>Equity Funds:</strong> Invest primarily in stocks, higher risk with potentially higher returns.</li>
                    <li><strong>Debt Funds:</strong> Invest in fixed income securities, lower risk with stable returns.</li>
                    <li><strong>Hybrid Funds:</strong> Balanced mix of equity and debt, moderate risk with moderate returns.</li>
                  </ul>
                </div>
                
                <div>
                  <h5 className={`text-sm font-medium mb-1 ${isDark ? 'text-banking-orange' : 'text-blue-700'}`}>Important Points:</h5>
                  <ul className={`list-disc pl-5 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <li>Past performance is not indicative of future results.</li>
                    <li>SIPs help average out your purchase cost and reduce risk through market volatility.</li>
                    <li>Equity funds are generally best for long-term goals (5+ years).</li>
                    <li>Debt funds may be suitable for short to medium-term goals (1-3 years).</li>
                    <li>All mutual fund investments are subject to market risks. Read all scheme-related documents carefully.</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </CalculatorLayout>
  );
};

export default MFCalculator;
