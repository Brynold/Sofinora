import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Info, Calendar, DollarSign, TrendingUp, PieChart as PieChartIcon, CheckSquare, Shield, FileText, Activity } from 'lucide-react';
import CalculatorLayout from '../components/CalculatorLayout';
import { FormField, Input, Button, ResultDisplay } from '../components/CalculatorForm';
import ActionableInsights from '../components/ActionableInsights';
import { useTheme } from '../context/ThemeContext';
import { annualRateToNominalMonthlyRate, roundTo } from '../utils/finance';

interface YearlyData {
  year: number;
  age: number;
  contribution: number;
  employerContribution: number;
  totalContribution: number;
  equityValue: number;
  debtValue: number;
  liquidValue: number;
  totalValue: number;
}

const RetirementCalculator: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // State variables
  const [monthlyContribution, setMonthlyContribution] = useState<number>(5000);
  const [employerContribution, setEmployerContribution] = useState<number>(0);
  const [currentAge, setCurrentAge] = useState<number>(30);
  const [retirementAge, setRetirementAge] = useState<number>(60);
  const [expectedReturns, setExpectedReturns] = useState<{
    equity: number;
    debt: number;
    liquid: number;
  }>({
    equity: 12,
    debt: 8,
    liquid: 5
  });
  const [assetAllocation, setAssetAllocation] = useState<{
    equity: number;
    debt: number;
    liquid: number;
  }>({
    equity: 60,
    debt: 30,
    liquid: 10
  });
  const [yearlyData, setYearlyData] = useState<YearlyData[]>([]);
  const [totalInvestment, setTotalInvestment] = useState<number>(0);
  const [corpusAtRetirement, setCorpusAtRetirement] = useState<number>(0);
  const [monthlyPension, setMonthlyPension] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>('inputs');
  const [allocationError, setAllocationError] = useState<string>('');
  const [showResults, setShowResults] = useState<boolean>(false);
  const formatInsightCurrency = (value: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  const yearsToRetirement = retirementAge - currentAge;
  const corpusMultiple = totalInvestment > 0 ? corpusAtRetirement / totalInvestment : 0;
  const retirementSummary = `Contributing ₹${(monthlyContribution + employerContribution).toLocaleString('en-IN')} per month until age ${retirementAge} projects a retirement corpus of about ${formatInsightCurrency(corpusAtRetirement)}.`;
  const retirementInsights = [
    {
      title: 'Time horizon',
      detail: `You have about ${yearsToRetirement} years left for compounding before retirement under this plan.`,
      tone: yearsToRetirement >= 15 ? 'positive' as const : 'caution' as const,
    },
    {
      title: 'Corpus efficiency',
      detail: `The model grows each rupee invested into roughly ${corpusMultiple.toFixed(2)} rupees of retirement corpus by the target age.`,
      tone: 'neutral' as const,
    },
    {
      title: 'Income lens',
      detail: `Using the 4% rule, the projected corpus supports about ${formatInsightCurrency(monthlyPension)} per month before inflation, taxes, and healthcare changes.`,
      tone: 'action' as const,
    },
  ];
  const retirementNextSteps = [
    { label: 'Compare with NPS', to: '/calculators/nps' },
    { label: 'Check inflation drag', to: '/calculators/inflation' },
  ];

  // Asset allocation validation and update
  const handleAssetAllocationChange = (type: 'equity' | 'debt' | 'liquid', value: number) => {
    const newAllocation = { ...assetAllocation, [type]: value };
    const total = newAllocation.equity + newAllocation.debt + newAllocation.liquid;
    
    if (total !== 100) {
      setAllocationError(`Total allocation should be 100%, currently ${total}%`);
    } else {
      setAllocationError('');
    }
    
    setAssetAllocation(newAllocation);
  };

  // Calculate retirement corpus
  const calculateRetirement = () => {
    setShowResults(false);

    if (
      monthlyContribution < 0 ||
      employerContribution < 0 ||
      currentAge >= retirementAge ||
      assetAllocation.equity + assetAllocation.debt + assetAllocation.liquid !== 100
    ) {
      return;
    }

    const investmentYears = retirementAge - currentAge;
    const newYearlyData: YearlyData[] = [];
    
    let totalEquity = 0;
    let totalDebt = 0;
    let totalLiquid = 0;
    let totalContributed = 0;
    const monthlyReturns = {
      equity: annualRateToNominalMonthlyRate(expectedReturns.equity),
      debt: annualRateToNominalMonthlyRate(expectedReturns.debt),
      liquid: annualRateToNominalMonthlyRate(expectedReturns.liquid),
    };

    for (let year = 1; year <= investmentYears; year++) {
      let yearlyContribution = 0;
      let yearlyEmployerContribution = 0;

      for (let month = 1; month <= 12; month++) {
        totalEquity *= 1 + monthlyReturns.equity;
        totalDebt *= 1 + monthlyReturns.debt;
        totalLiquid *= 1 + monthlyReturns.liquid;

        yearlyContribution += monthlyContribution;
        yearlyEmployerContribution += employerContribution;
        totalContributed += monthlyContribution + employerContribution;

        totalEquity += (monthlyContribution + employerContribution) * (assetAllocation.equity / 100);
        totalDebt += (monthlyContribution + employerContribution) * (assetAllocation.debt / 100);
        totalLiquid += (monthlyContribution + employerContribution) * (assetAllocation.liquid / 100);
      }

      const totalYearlyContribution = yearlyContribution + yearlyEmployerContribution;
      
      newYearlyData.push({
        year,
        age: currentAge + year,
        contribution: roundTo(yearlyContribution, 2),
        employerContribution: roundTo(yearlyEmployerContribution, 2),
        totalContribution: roundTo(totalYearlyContribution, 2),
        equityValue: roundTo(totalEquity, 2),
        debtValue: roundTo(totalDebt, 2),
        liquidValue: roundTo(totalLiquid, 2),
        totalValue: roundTo(totalEquity + totalDebt + totalLiquid, 2)
      });
    }

    setYearlyData(newYearlyData);
    setTotalInvestment(roundTo(totalContributed, 2));
    setCorpusAtRetirement(roundTo(totalEquity + totalDebt + totalLiquid, 2));
    
    // Estimate monthly pension (using 4% withdrawal rule as a simplified approach)
    const yearlyWithdrawal = (totalEquity + totalDebt + totalLiquid) * 0.04;
    setMonthlyPension(roundTo(yearlyWithdrawal / 12, 2));
    setShowResults(true);
  };

  // Chart options and colors
  const lineColors = {
    total: isDark ? '#6366F1' : '#4F46E5',
    equity: isDark ? '#10B981' : '#059669',
    debt: isDark ? '#F59E0B' : '#D97706',
    liquid: isDark ? '#60A5FA' : '#3B82F6'
  };

  const pieColors = ['#4F46E5', '#D97706', '#3B82F6'];
  
  const chartOptions = {
    grid: {
      strokeDasharray: '3 3',
      stroke: isDark ? '#374151' : '#E5E7EB'
    },
    xAxisTick: {
      fill: isDark ? '#9CA3AF' : '#4B5563'
    },
    yAxisTick: {
      fill: isDark ? '#9CA3AF' : '#4B5563'
    }
  };

  const pieChartData = [
    { name: 'Equity', value: assetAllocation.equity },
    { name: 'Debt', value: assetAllocation.debt },
    { name: 'Liquid', value: assetAllocation.liquid }
  ];

  // Format currency helper function
  const formatCurrency = (value: number, decimals: number = 2) => {
    // For very large numbers, use crores/lakhs format
    if (value >= 10000000) { // ≥ 1 crore
      const crores = value / 10000000;
      return `₹${crores.toFixed(1)} Cr`;
    } else if (value >= 100000) { // ≥ 1 lakh
      const lakhs = value / 100000;
      return `₹${lakhs.toFixed(1)} L`;
    }
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  };

  // Enhanced retirement planning steps and guide
  const planningSteps = [
    {
      title: "Assess Your Current Financial Situation",
      description: "Take inventory of your current savings, debts, income, and expenses to understand your financial baseline.",
      icon: <FileText className="w-6 h-6 text-primary-500" />
    },
    {
      title: "Set Clear Retirement Goals",
      description: "Define your desired retirement lifestyle, location, activities, and the age at which you plan to retire.",
      icon: <CheckSquare className="w-6 h-6 text-primary-500" />
    },
    {
      title: "Create a Diversified Portfolio",
      description: "Balance your investments across equity, debt, and liquid assets based on your risk tolerance and time horizon.",
      icon: <PieChartIcon className="w-6 h-6 text-primary-500" />
    },
    {
      title: "Monitor and Adjust Regularly",
      description: "Review your retirement plan annually or after major life events and adjust your strategy as needed.",
      icon: <Activity className="w-6 h-6 text-primary-500" />
    },
    {
      title: "Protect Your Retirement Assets",
      description: "Consider proper insurance coverage and estate planning to protect your retirement corpus from unexpected events.",
      icon: <Shield className="w-6 h-6 text-primary-500" />
    }
  ];

  return (
    <CalculatorLayout
      title="Plan Your Financial Freedom"
      description="Estimate your retirement corpus and monthly pension for a worry-free future"
      icon={<Calendar size={24} />}
    >
      <div className={`max-w-6xl mx-auto ${isDark ? 'text-white' : 'text-gray-800'}`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5">
            <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm border border-gray-100'}`}>
              <div className="flex mb-5 space-x-2">
                <button 
                  onClick={() => setActiveTab('inputs')}
                  className={`px-5 py-2.5 rounded-lg text-sm font-medium ${
                    activeTab === 'inputs' 
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' 
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  Basic Inputs
                </button>
                <button 
                  onClick={() => setActiveTab('advanced')}
                  className={`px-5 py-2.5 rounded-lg text-sm font-medium ${
                    activeTab === 'advanced' 
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' 
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  Advanced
                </button>
              </div>

              {activeTab === 'inputs' && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  <FormField label="Monthly Contribution (₹)">
                    <Input
                      type="number"
                      value={monthlyContribution}
                      onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                      min={0}
                      step={100}
                      className={isDark ? 'dark-input' : ''}
                    />
                  </FormField>

                  <FormField label="Employer Monthly Contribution (₹)">
                    <Input
                      type="number"
                      value={employerContribution}
                      onChange={(e) => setEmployerContribution(Number(e.target.value))}
                      min={0}
                      step={100}
                      className={isDark ? 'dark-input' : ''}
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Optional. Add if your employer contributes to your retirement
                    </p>
                  </FormField>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Your Current Age">
                      <Input
                        type="number"
                        value={currentAge}
                        onChange={(e) => setCurrentAge(Number(e.target.value))}
                        min={18}
                        max={retirementAge - 1}
                        className={isDark ? 'dark-input' : ''}
                      />
                    </FormField>
                    <FormField label="Retirement Age">
                      <Input
                        type="number"
                        value={retirementAge}
                        onChange={(e) => setRetirementAge(Number(e.target.value))}
                        min={currentAge + 1}
                        max={100}
                        className={isDark ? 'dark-input' : ''}
                      />
                    </FormField>
                  </div>
                </motion.div>
              )}

              {activeTab === 'advanced' && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  <h3 className="text-lg font-semibold flex items-center mb-4">
                    <PieChartIcon className="w-5 h-5 mr-2 text-primary-500" />
                    Asset Allocation
                  </h3>
                  
                  {allocationError && (
                    <div className="text-red-500 text-sm mb-2">{allocationError}</div>
                  )}
                  
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <FormField label="Equity %">
                      <Input
                        type="number"
                        value={assetAllocation.equity}
                        onChange={(e) => handleAssetAllocationChange('equity', Number(e.target.value))}
                        min={0}
                        max={100}
                        className={isDark ? 'dark-input' : ''}
                      />
                    </FormField>
                    <FormField label="Debt %">
                      <Input
                        type="number"
                        value={assetAllocation.debt}
                        onChange={(e) => handleAssetAllocationChange('debt', Number(e.target.value))}
                        min={0}
                        max={100}
                        className={isDark ? 'dark-input' : ''}
                      />
                    </FormField>
                    <FormField label="Liquid %">
                      <Input
                        type="number"
                        value={assetAllocation.liquid}
                        onChange={(e) => handleAssetAllocationChange('liquid', Number(e.target.value))}
                        min={0}
                        max={100}
                        className={isDark ? 'dark-input' : ''}
                      />
                    </FormField>
                  </div>

                  <h3 className="text-lg font-semibold flex items-center mb-4">
                    <TrendingUp className="w-5 h-5 mr-2 text-primary-500" />
                    Expected Returns
                  </h3>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <FormField label="Equity (%)">
                      <Input
                        type="number"
                        value={expectedReturns.equity}
                        onChange={(e) => setExpectedReturns({...expectedReturns, equity: Number(e.target.value)})}
                        min={0}
                        max={30}
                        step={0.1}
                        className={isDark ? 'dark-input' : ''}
                      />
                    </FormField>
                    <FormField label="Debt (%)">
                      <Input
                        type="number"
                        value={expectedReturns.debt}
                        onChange={(e) => setExpectedReturns({...expectedReturns, debt: Number(e.target.value)})}
                        min={0}
                        max={20}
                        step={0.1}
                        className={isDark ? 'dark-input' : ''}
                      />
                    </FormField>
                    <FormField label="Liquid (%)">
                      <Input
                        type="number"
                        value={expectedReturns.liquid}
                        onChange={(e) => setExpectedReturns({...expectedReturns, liquid: Number(e.target.value)})}
                        min={0}
                        max={10}
                        step={0.1}
                        className={isDark ? 'dark-input' : ''}
                      />
                    </FormField>
                  </div>
                </motion.div>
              )}

              <div className="mt-8">
                <Button onClick={calculateRetirement} className={`${isDark ? 'banking-button-primary' : 'bg-primary-600 hover:bg-primary-700 text-white'} w-full py-3.5 text-base font-medium rounded-lg transition-colors`}>
                  Calculate Retirement Corpus
                </Button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            {showResults && corpusAtRetirement > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm border border-gray-100'}`}>
                  <h3 className="text-xl font-bold mb-5">Results</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5">
                    <div className="min-w-0">
                      <ResultDisplay
                        label="Total Investment"
                        value={formatCurrency(totalInvestment, 0)}
                        icon={<DollarSign size={20} />}
                        darkCustomClass="bg-gray-50 dark:bg-gray-800 h-full"
                      />
                    </div>
                    <div className="min-w-0">
                      <ResultDisplay
                        label="Corpus at Retirement"
                        value={formatCurrency(corpusAtRetirement, 0)}
                        icon={<TrendingUp size={20} />}
                        highlight
                        darkCustomClass="bg-primary-50 dark:bg-primary-900/30 h-full"
                      />
                    </div>
                    <div className="min-w-0">
                      <ResultDisplay
                        label="Est. Monthly Pension"
                        value={formatCurrency(monthlyPension, 0)}
                        icon={<Calendar size={20} />}
                        highlight
                        darkCustomClass="bg-secondary-50 dark:bg-secondary-900/30 h-full"
                      />
                    </div>
                  </div>

                  <ActionableInsights
                    summary={retirementSummary}
                    insights={retirementInsights}
                    nextSteps={retirementNextSteps}
                  />
                </div>

                <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm border border-gray-100'}`}>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-5">
                    <h3 className="text-xl font-bold mb-2 md:mb-0">Growth Visualization</h3>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: lineColors.total }}></div>
                        <span className="text-xs">Total</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: lineColors.equity }}></div>
                        <span className="text-xs">Equity</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: lineColors.debt }}></div>
                        <span className="text-xs">Debt</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: lineColors.liquid }}></div>
                        <span className="text-xs">Liquid</span>
                      </div>
                    </div>
                  </div>

                  <div className="h-72 sm:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={yearlyData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 25,
                        }}
                      >
                        <CartesianGrid {...chartOptions.grid} />
                        <XAxis 
                          dataKey="age" 
                          label={{ 
                            value: 'Age', 
                            position: 'insideBottomRight', 
                            offset: -10,
                            fill: isDark ? '#9CA3AF' : '#4B5563'
                          }}
                          tick={{ fill: chartOptions.xAxisTick.fill }}
                        />
                        <YAxis 
                          tickFormatter={(value) => formatCurrency(value, 0)}
                          tick={{ fill: chartOptions.yAxisTick.fill }}
                          width={80}
                        />
                        <Tooltip 
                          formatter={(value: number) => [formatCurrency(value), '']}
                          labelFormatter={(label) => `Age: ${label}`}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="totalValue" 
                          name="Total Value" 
                          stroke={lineColors.total} 
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="equityValue" 
                          name="Equity" 
                          stroke={lineColors.equity} 
                          strokeWidth={1.5}
                          dot={false}
                          strokeDasharray="3 3"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="debtValue" 
                          name="Debt" 
                          stroke={lineColors.debt} 
                          strokeWidth={1.5}
                          dot={false}
                          strokeDasharray="3 3"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="liquidValue" 
                          name="Liquid" 
                          stroke={lineColors.liquid} 
                          strokeWidth={1.5}
                          dot={false}
                          strokeDasharray="3 3"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  <div className="md:col-span-5">
                    <div className={`overflow-hidden p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm border border-gray-100'}`}>
                      <h3 className="text-xl font-bold">Asset Allocation</h3>
                      <div
                        className="mt-4 h-44 min-w-0"
                        role="img"
                        aria-label={`Asset allocation: ${pieChartData.map((item) => `${item.name} ${item.value}%`).join(', ')}`}
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieChartData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={72}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {pieChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => [`${value}%`, 'Allocation']} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3 md:grid-cols-1 xl:grid-cols-3">
                        {pieChartData.map((item, index) => (
                          <div
                            key={`allocation-legend-${item.name}`}
                            className={`flex min-w-0 items-center justify-between gap-3 rounded-lg px-3 py-2 ${
                              isDark ? 'bg-white/5' : 'bg-slate-50'
                            }`}
                          >
                            <span className="flex min-w-0 items-center gap-2 text-sm">
                              <span
                                className="h-2.5 w-2.5 shrink-0 rounded-full"
                                style={{ backgroundColor: pieColors[index % pieColors.length] }}
                              />
                              <span className="truncate">{item.name}</span>
                            </span>
                            <span className="shrink-0 text-sm font-semibold tabular-nums">{item.value}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:col-span-7">
                    <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm border border-gray-100'}`}>
                      <div className="flex items-start">
                        <Info className="w-5 h-5 text-primary-500 mr-3 mt-1" />
                        <div>
                          <h3 className="text-xl font-bold mb-3">About Retirement Planning</h3>
                          <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                            <p>Effective retirement planning involves regular contributions, appropriate asset allocation based on your risk profile and time horizon, and discipline.</p>
                            <p>The 4% rule suggests withdrawing 4% of your retirement corpus annually, which this calculator uses to estimate your monthly pension.</p>
                            <p>Consider diversification across asset classes to balance growth potential with stability. As you approach retirement, gradually shift towards more conservative investments.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            {(!showResults || corpusAtRetirement === 0) && (
              <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm border border-gray-100'}`}>
                <div className="flex items-start mb-6">
                  <Info className="w-6 h-6 text-primary-500 mr-3 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold mb-3">Your Retirement Planning Guide</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                      Follow these actionable steps to build a comprehensive retirement plan that will secure your financial future.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {planningSteps.map((step, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${isDark ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
                      <div className="flex items-start">
                        <div className="mr-4 mt-1">{step.icon}</div>
                        <div>
                          <h4 className="font-semibold text-base mb-1">{step.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{step.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800">
                  <h4 className="font-semibold text-primary-700 dark:text-primary-300 mb-2">Pro Tip: The Power of Compounding</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Starting early is crucial for retirement planning. Even a small delay can significantly reduce your final corpus due to the compound effect. 
                    If you start 5 years later, you might need to contribute up to 50% more monthly to achieve the same retirement corpus.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </CalculatorLayout>
  );
};

export default RetirementCalculator; 
