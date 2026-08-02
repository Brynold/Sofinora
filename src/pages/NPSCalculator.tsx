import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Calendar, Heart, BarChart2, PieChart } from 'lucide-react';
import CalculatorLayout from '../components/CalculatorLayout';
import { FormField, Input, Button, ResultDisplay } from '../components/CalculatorForm';
import FinancialChart, { ChartData } from '../components/FinancialChart';
import ActionableInsights from '../components/ActionableInsights';
import { useTheme } from '../context/ThemeContext';
import {
  annualRateToNominalMonthlyRate,
  clamp,
  roundTo,
  safePercentage,
} from '../utils/finance';

interface YearlyData {
  year: number;
  investedAmount: number;
  interest: number;
  totalValue: number;
}

const NPSCalculator: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // State variables for inputs
  const [monthlyContribution, setMonthlyContribution] = useState<number>(5000);
  const [employerContribution, setEmployerContribution] = useState<number>(5000);
  const [annualIncrease, setAnnualIncrease] = useState<number>(10);
  const [currentAge, setCurrentAge] = useState<number>(30);
  const [retirementAge, setRetirementAge] = useState<number>(60);
  const [expectedReturn, setExpectedReturn] = useState<number>(10);
  const [equityAllocation, setEquityAllocation] = useState<number>(50);
  const [gsecAllocation, setGsecAllocation] = useState<number>(30);
  const [cbonds, setCbonds] = useState<number>(20);
  const [annuityPercentage, setAnnuityPercentage] = useState<number>(40);
  const [annuityReturn, setAnnuityReturn] = useState<number>(6);
  
  // Results state
  const [showResults, setShowResults] = useState<boolean>(false);
  const [totalInvestment, setTotalInvestment] = useState<number>(0);
  const [corpusAtRetirement, setCorpusAtRetirement] = useState<number>(0);
  const [lumpSumAmount, setLumpSumAmount] = useState<number>(0);
  const [monthlyPension, setMonthlyPension] = useState<number>(0);
  const [yearlyData, setYearlyData] = useState<YearlyData[]>([]);
  const [activeChart, setActiveChart] = useState<'bar' | 'pie'>('bar');
  const formatMoney = (value: number) => `₹${Math.round(value).toLocaleString('en-IN')}`;
  const effectiveAnnuityPercentage = clamp(annuityPercentage, 40, 100);
  const pensionPerTenPercentShift = corpusAtRetirement * 0.1 * (annuityReturn / 100 / 12);
  const npsSummary = `With combined monthly contributions of ${formatMoney(monthlyContribution + employerContribution)}, this NPS path projects a retirement corpus near ${formatMoney(corpusAtRetirement)} by age ${retirementAge}.`;
  const npsInsights = [
    {
      title: 'Tax-free lump sum',
      detail: `At the current annuity split, about ${formatMoney(lumpSumAmount)} stays available as lump sum at retirement.`,
      tone: 'positive' as const,
    },
    {
      title: 'Pension lever',
      detail: `Every additional 10% of corpus shifted into annuity changes estimated pension by roughly ${formatMoney(pensionPerTenPercentShift)} per month.`,
      tone: 'action' as const,
    },
    {
      title: 'Growth dependence',
      detail: `${Math.round(safePercentage(corpusAtRetirement - totalInvestment, corpusAtRetirement))}% of the final corpus is projected to come from investment growth rather than contributions.`,
      tone: 'neutral' as const,
    },
  ];
  const npsNextSteps = [
    { label: 'Compare with retirement planner', to: '/calculators/retirement' },
    { label: 'Check inflation-adjusted needs', to: '/calculators/inflation' },
  ];

  // Calculate NPS returns
  const calculateNPS = () => {
    setShowResults(false);

    const investmentPeriod = retirementAge - currentAge;
    if (
      monthlyContribution < 0 ||
      employerContribution < 0 ||
      annualIncrease < 0 ||
      expectedReturn < 0 ||
      annuityReturn < 0 ||
      investmentPeriod <= 0 ||
      !isAllocationValid
    ) {
      return;
    }

    const allocationSpreads = {
      equity: 4,
      gsec: -2.5,
      cbond: -1,
    };
    const weightedSpread =
      (equityAllocation * allocationSpreads.equity +
        gsecAllocation * allocationSpreads.gsec +
        cbonds * allocationSpreads.cbond) /
      100;

    const annualReturns = {
      equity: Math.max(0, expectedReturn + allocationSpreads.equity - weightedSpread),
      gsec: Math.max(0, expectedReturn + allocationSpreads.gsec - weightedSpread),
      cbond: Math.max(0, expectedReturn + allocationSpreads.cbond - weightedSpread),
    };

    const monthlyReturns = {
      equity: annualRateToNominalMonthlyRate(annualReturns.equity),
      gsec: annualRateToNominalMonthlyRate(annualReturns.gsec),
      cbond: annualRateToNominalMonthlyRate(annualReturns.cbond),
    };

    const data: YearlyData[] = [];
    let totalContribution = 0;
    let equityCorpus = 0;
    let gsecCorpus = 0;
    let cbondCorpus = 0;

    for (let year = 1; year <= investmentPeriod; year++) {
      const contributionGrowthFactor = Math.pow(1 + annualIncrease / 100, year - 1);
      const adjustedMonthlyContribution = monthlyContribution * contributionGrowthFactor;
      const adjustedEmployerContribution = employerContribution * contributionGrowthFactor;
      let yearlyContribution = 0;
      const openingValue = equityCorpus + gsecCorpus + cbondCorpus;

      for (let month = 1; month <= 12; month++) {
        equityCorpus *= 1 + monthlyReturns.equity;
        gsecCorpus *= 1 + monthlyReturns.gsec;
        cbondCorpus *= 1 + monthlyReturns.cbond;

        const combinedContribution = adjustedMonthlyContribution + adjustedEmployerContribution;
        yearlyContribution += combinedContribution;
        totalContribution += combinedContribution;

        equityCorpus += combinedContribution * (equityAllocation / 100);
        gsecCorpus += combinedContribution * (gsecAllocation / 100);
        cbondCorpus += combinedContribution * (cbonds / 100);
      }

      const totalValue = equityCorpus + gsecCorpus + cbondCorpus;
      data.push({
        year,
        investedAmount: roundTo(totalContribution, 2),
        interest: roundTo(totalValue - openingValue - yearlyContribution, 2),
        totalValue: roundTo(totalValue, 2),
      });
    }

    const finalCorpus = equityCorpus + gsecCorpus + cbondCorpus;
    const annuityPortion = finalCorpus * (effectiveAnnuityPercentage / 100);
    const lumpSumPortion = finalCorpus - annuityPortion;
    const monthlyAnnuity = annuityPortion * (annuityReturn / 100 / 12);

    setTotalInvestment(roundTo(totalContribution, 2));
    setCorpusAtRetirement(roundTo(finalCorpus, 2));
    setLumpSumAmount(roundTo(lumpSumPortion, 2));
    setMonthlyPension(roundTo(monthlyAnnuity, 2));
    setYearlyData(data);
    setShowResults(true);
  };
  
  // Chart options
  const chartOptions = {
    colors: {
      investment: isDark ? '#1c1c1e' : '#0284c7',
      interest: isDark ? '#ff6b00' : '#10b981',
      equity: isDark ? '#f59e0b' : '#f59e0b',
      gsec: isDark ? '#0ea5e9' : '#0ea5e9',
      cbonds: isDark ? '#8b5cf6' : '#8b5cf6',
      annuity: isDark ? '#ef4444' : '#ef4444',
      lumpsum: isDark ? '#14b8a6' : '#14b8a6'
    },
  };

  // Chart data for yearly growth
  const yearlyChartData: ChartData[] = yearlyData.map(data => ({
    name: `Year ${data.year}`,
    value: data.totalValue,
    color: data.year === retirementAge - currentAge ? '#0ea5e9' : undefined
  }));

  // Pie chart data for asset allocation
  const allocationData: ChartData[] = [
    { name: 'Equity', value: equityAllocation, color: chartOptions.colors.equity },
    { name: 'Govt Securities', value: gsecAllocation, color: chartOptions.colors.gsec },
    { name: 'Corporate Bonds', value: cbonds, color: chartOptions.colors.cbonds }
  ];
  
  // Validate NPS allocations add up to 100%
  const isAllocationValid = equityAllocation + gsecAllocation + cbonds === 100;

  return (
    <CalculatorLayout
      title="NPS Calculator"
      description="Plan your retirement with National Pension System investment calculator."
      icon={<Heart size={24} className={isDark ? 'text-banking-orange' : ''} />}
    >
      <div className="space-y-6">
        <motion.div 
          className={`rounded-xl p-4 ${isDark ? 'bg-banking-darkgray border-0 shadow-lg' : 'bg-blue-50 border border-blue-100'}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-start gap-3">
            <Heart size={20} className={isDark ? 'text-banking-orange' : 'text-blue-500'} />
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-blue-800'}`}>
                <strong>About NPS:</strong> The National Pension System (NPS) is a voluntary, long-term retirement savings scheme designed to enable systematic savings during the subscriber's working life.
              </p>
              <p className={`text-xs mt-1 ${isDark ? 'text-banking-orange' : 'text-blue-600'}`}>
                NPS offers tax benefits under Section 80C and Section 80CCD(1B) of the Income Tax Act.
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contribution Details */}
          <motion.div 
            className={`rounded-xl p-5 ${isDark ? 'bg-banking-gray border-0 shadow-lg' : 'bg-white border border-gray-100 shadow-sm'}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-5 text-primary-600 dark:text-banking-orange">
              <DollarSign size={18} />
              <h3 className="font-medium">Contribution Details</h3>
            </div>
            
            <FormField label="Monthly Contribution" labelClass={isDark ? 'banking-label' : ''}>
              <Input
                type="number"
                prefix="₹"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                placeholder="Your monthly contribution"
                min="500"
                step="100"
                className={isDark ? 'banking-input' : ''}
              />
            </FormField>
            
            <FormField label="Employer Contribution (if any)" labelClass={isDark ? 'banking-label' : ''}>
              <Input
                type="number"
                prefix="₹"
                value={employerContribution}
                onChange={(e) => setEmployerContribution(Number(e.target.value))}
                placeholder="Monthly employer contribution"
                min="0"
                step="100"
                className={isDark ? 'banking-input' : ''}
              />
            </FormField>
            
            <FormField label="Annual Contribution Increase" labelClass={isDark ? 'banking-label' : ''}>
              <Input
                type="number"
                suffix="%"
                value={annualIncrease}
                onChange={(e) => setAnnualIncrease(Number(e.target.value))}
                placeholder="Yearly increase in contribution"
                min="0"
                max="20"
                step="0.5"
                className={isDark ? 'banking-input' : ''}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Expected yearly increase in your contributions
              </p>
            </FormField>
          </motion.div>

          {/* Age & Time Period */}
          <motion.div 
            className={`rounded-xl p-5 ${isDark ? 'bg-banking-gray border-0 shadow-lg' : 'bg-white border border-gray-100 shadow-sm'}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-5 text-primary-600 dark:text-banking-orange">
              <Calendar size={18} />
              <h3 className="font-medium">Age & Time Period</h3>
            </div>
            
            <FormField label="Current Age" labelClass={isDark ? 'banking-label' : ''}>
              <Input
                type="number"
                suffix="years"
                value={currentAge}
                onChange={(e) => setCurrentAge(Number(e.target.value))}
                placeholder="Your current age"
                min="18"
                max="59"
                step="1"
                className={isDark ? 'banking-input' : ''}
              />
            </FormField>
            
            <FormField label="Retirement Age" labelClass={isDark ? 'banking-label' : ''}>
              <Input
                type="number"
                suffix="years"
                value={retirementAge}
                onChange={(e) => setRetirementAge(Number(e.target.value))}
                placeholder="Your expected retirement age"
                min="60"
                max="70"
                step="1"
                className={isDark ? 'banking-input' : ''}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                The minimum age for NPS withdrawal is 60 years
              </p>
            </FormField>
            
            {/* Investment Period Display */}
            <div className={`mt-4 p-2 text-center rounded-lg ${isDark ? 'bg-banking-darkgray' : 'bg-blue-50'}`}>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-blue-800'}`}>
                Investment Period: <strong>{retirementAge - currentAge} years</strong>
              </p>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Investment Allocation */}
          <motion.div 
            className={`rounded-xl p-5 ${isDark ? 'bg-banking-gray border-0 shadow-lg' : 'bg-white border border-gray-100 shadow-sm'}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-center gap-2 mb-5 text-primary-600 dark:text-banking-orange">
              <PieChart size={18} />
              <h3 className="font-medium">Investment Allocation</h3>
            </div>
            
            <FormField label="Expected Return Rate" labelClass={isDark ? 'banking-label' : ''}>
              <Input
                type="number"
                suffix="%"
                value={expectedReturn}
                onChange={(e) => setExpectedReturn(Number(e.target.value))}
                placeholder="Expected average return"
                min="1"
                max="15"
                step="0.5"
                className={isDark ? 'banking-input' : ''}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Historical NPS returns have been around 8-12% p.a.
              </p>
            </FormField>
            
            <div className="grid grid-cols-3 gap-2 mb-2">
              <FormField label="Equity (%)" labelClass={isDark ? 'banking-label text-xs' : 'text-xs'}>
                <Input
                  type="number"
                  value={equityAllocation}
                  onChange={(e) => setEquityAllocation(Number(e.target.value))}
                  min="0"
                  max="75"
                  step="1"
                  className={isDark ? 'banking-input' : ''}
                />
              </FormField>
              
              <FormField label="G-Sec (%)" labelClass={isDark ? 'banking-label text-xs' : 'text-xs'}>
                <Input
                  type="number"
                  value={gsecAllocation}
                  onChange={(e) => setGsecAllocation(Number(e.target.value))}
                  min="0"
                  max="100"
                  step="1"
                  className={isDark ? 'banking-input' : ''}
                />
              </FormField>
              
              <FormField label="Corp. Bonds (%)" labelClass={isDark ? 'banking-label text-xs' : 'text-xs'}>
                <Input
                  type="number"
                  value={cbonds}
                  onChange={(e) => setCbonds(Number(e.target.value))}
                  min="0"
                  max="100"
                  step="1"
                  className={isDark ? 'banking-input' : ''}
                />
              </FormField>
            </div>
            
            {!isAllocationValid && (
              <p className="text-xs text-red-500 mt-1">
                Total allocation must equal 100%. Current total: {equityAllocation + gsecAllocation + cbonds}%
              </p>
            )}
            
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Note: NPS limits equity allocation to a maximum of 75%.
            </p>
          </motion.div>

          {/* Withdrawal Options */}
          <motion.div 
            className={`rounded-xl p-5 ${isDark ? 'bg-banking-gray border-0 shadow-lg' : 'bg-white border border-gray-100 shadow-sm'}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-center gap-2 mb-5 text-primary-600 dark:text-banking-orange">
              <BarChart2 size={18} />
              <h3 className="font-medium">Withdrawal Options</h3>
            </div>
            
            <FormField label="Annuity Portion (%)" labelClass={isDark ? 'banking-label' : ''}>
              <Input
                type="number"
                suffix="%"
                value={annuityPercentage}
                onChange={(e) => setAnnuityPercentage(Number(e.target.value))}
                placeholder="Percentage for annuity"
                min="40"
                max="100"
                step="1"
                className={isDark ? 'banking-input' : ''}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                This calculator models a traditional normal-exit scenario with at least 40% allocated to annuity. Other current exit options may apply.
              </p>
            </FormField>
            
            <FormField label="Expected Annuity Return" labelClass={isDark ? 'banking-label' : ''}>
              <Input
                type="number"
                suffix="%"
                value={annuityReturn}
                onChange={(e) => setAnnuityReturn(Number(e.target.value))}
                placeholder="Expected annuity return"
                min="1"
                max="10"
                step="0.5"
                className={isDark ? 'banking-input' : ''}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Use an illustrative annuity rate and compare actual provider quotes before deciding.
              </p>
            </FormField>
            
            <div className={`mt-4 p-2 text-center rounded-lg ${isDark ? 'bg-banking-darkgray' : 'bg-blue-50'}`}>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-blue-800'}`}>
                Lump Sum Portion: <strong>{100 - clamp(annuityPercentage, 40, 100)}%</strong>
              </p>
            </div>
          </motion.div>
        </div>

        <div className="flex justify-center mt-6">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={calculateNPS} 
              className={isDark ? 'banking-button-primary w-full py-4 text-base' : ''}
              disabled={!isAllocationValid}
            >
              <TrendingUp size={18} />
              Calculate NPS Returns
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
            <h2 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-800'}`}>NPS Investment Results</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ResultDisplay 
                label="Total Investment" 
                value={`₹${Math.round(totalInvestment).toLocaleString('en-IN')}`}
                icon={<DollarSign size={20} />}
                darkCustomClass={isDark ? 'dark-card' : ''}
              />
              <ResultDisplay 
                label="Corpus at Retirement" 
                value={`₹${Math.round(corpusAtRetirement).toLocaleString('en-IN')}`}
                icon={<TrendingUp size={20} />} 
                highlight={true}
                darkCustomClass={isDark ? 'dark-card' : ''}
              />
              <ResultDisplay 
                label="Estimated Returns"
                value={`₹${Math.round(corpusAtRetirement - totalInvestment).toLocaleString('en-IN')}`}
                icon={<BarChart2 size={20} />}
                highlight={true}
                darkCustomClass={isDark ? 'dark-card' : ''}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <ResultDisplay 
                label="Lump Sum Available" 
                value={`₹${Math.round(lumpSumAmount).toLocaleString('en-IN')}`}
                icon={<DollarSign size={20} />}
                darkCustomClass={`${isDark ? 'dark-card' : ''} ${isDark ? 'border-l-4 border-l-teal-500' : 'border-l-4 border-l-teal-500'}`}
              />
              <ResultDisplay 
                label="Monthly Pension (Approx)" 
                value={`₹${Math.round(monthlyPension).toLocaleString('en-IN')}`}
                icon={<Calendar size={20} />}
                highlight={true}
                darkCustomClass={`${isDark ? 'dark-card' : ''} ${isDark ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-red-500'}`}
                subtext="Based on annuity corpus and expected return rate"
              />
            </div>

            <div className="mt-6">
              <div className="w-full bg-gray-200 dark:bg-dark-border rounded-full h-2.5">
                <div className="bg-primary-600 dark:bg-primary-500 h-2.5 rounded-full" style={{ width: `${safePercentage(totalInvestment, corpusAtRetirement)}%` }}></div>
              </div>
              <div className="flex justify-between mt-2 text-xs">
                <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Principal: {Math.round(safePercentage(totalInvestment, corpusAtRetirement))}%</span>
                <span className="text-primary-600 dark:text-primary-400">Returns: {Math.round(safePercentage(corpusAtRetirement - totalInvestment, corpusAtRetirement))}%</span>
              </div>
            </div>

            <ActionableInsights
              summary={npsSummary}
              insights={npsInsights}
              nextSteps={npsNextSteps}
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
                <BarChart2 size={16} />
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
                Asset Allocation
              </button>
            </div>

            {/* Charts */}
            <div className={`rounded-xl p-5 ${isDark ? 'bg-banking-gray border-0 shadow-lg' : 'bg-white border border-gray-100 shadow-sm'} overflow-hidden`}>
              <div className="h-80">
                {activeChart === 'bar' ? (
                  <FinancialChart
                    data={yearlyChartData}
                    type="bar"
                    title="Corpus Growth Over Time"
                  />
                ) : (
                  <FinancialChart
                    data={allocationData}
                    type="pie"
                    title="Asset Allocation"
                  />
                )}
              </div>
            </div>

            {/* Year-wise breakdown table */}
            <div className={`mt-8 overflow-x-auto ${isDark ? 'bg-banking-gray border-0 shadow-lg' : 'bg-white border border-gray-100 shadow-sm'} rounded-lg p-4`}>
              <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Year-wise Breakdown
              </h4>
              <table className="w-full min-w-full divide-y divide-gray-200 dark:divide-dark-border">
                <thead>
                  <tr>
                    <th className={`px-4 py-3.5 text-left text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Year</th>
                    <th className={`px-4 py-3.5 text-left text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Age</th>
                    <th className={`px-4 py-3.5 text-left text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Invested Amount</th>
                    <th className={`px-4 py-3.5 text-left text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Interest Earned</th>
                    <th className={`px-4 py-3.5 text-left text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Corpus</th>
                  </tr>
                </thead>
                <tbody className={`divide-y divide-gray-200 dark:divide-dark-border ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {yearlyData.map((data) => (
                    <tr key={data.year} className={data.year === retirementAge - currentAge ? (isDark ? 'bg-banking-darkgray/50' : 'bg-blue-50') : ''}>
                      <td className="px-4 py-3.5">{data.year}</td>
                      <td className="px-4 py-3.5">{currentAge + data.year}</td>
                      <td className="px-4 py-3.5">₹{Math.round(data.investedAmount).toLocaleString('en-IN')}</td>
                      <td className={`px-4 py-3.5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        ₹{Math.round(data.interest).toLocaleString('en-IN')}
                      </td>
                      <td className={`px-4 py-3.5 ${isDark ? 'text-primary-400 font-medium' : 'text-primary-600 font-medium'}`}>
                        ₹{Math.round(data.totalValue).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* NPS Information */}
            <motion.div 
              className={`mt-8 rounded-xl p-5 ${isDark ? 'bg-banking-darkgray/70 border-0 shadow-lg' : 'bg-blue-50 border border-blue-100'}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h4 className={`text-lg font-medium mb-3 ${isDark ? 'text-white' : 'text-blue-800'}`}>
                About National Pension System
              </h4>
              
              <div className="space-y-4">
                <div>
                  <h5 className={`text-sm font-medium mb-1 ${isDark ? 'text-banking-orange' : 'text-blue-700'}`}>Key Features:</h5>
                  <ul className={`list-disc pl-5 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <li><strong>Low Cost:</strong> NPS has one of the lowest fund management charges.</li>
                    <li><strong>Flexible Asset Allocation:</strong> You can choose your own asset allocation mix.</li>
                    <li><strong>Tax Benefits:</strong> Contributions are eligible for tax deduction under Sec 80C and additional deduction under Sec 80CCD(1B).</li>
                    <li><strong>Tier I & Tier II:</strong> Tier I is mandatory and has restrictions on withdrawals, while Tier II is voluntary with flexible withdrawals.</li>
                  </ul>
                </div>
                
                <div>
                  <h5 className={`text-sm font-medium mb-1 ${isDark ? 'text-banking-orange' : 'text-blue-700'}`}>Withdrawal Rules:</h5>
                  <ul className={`list-disc pl-5 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <li>This projection uses the traditional normal-exit model: up to 60% lump sum and at least 40% toward annuity.</li>
                    <li>PFRDA now permits additional retirement-income and drawdown structures in eligible cases; verify the option available to your account.</li>
                    <li>Premature-exit and small-corpus rules vary by subscriber type, exit reason and current regulation.</li>
                    <li>Partial withdrawals are allowed after 3 years for specific purposes like children's education, home purchase, etc.</li>
                  </ul>
                </div>
                
                <p className={`text-xs italic ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Disclaimer: This calculator provides an estimate based on the given inputs. Actual returns may vary based on market conditions, fund performance, and changes in contribution amounts.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </CalculatorLayout>
  );
};

export default NPSCalculator; 
