import React, { useState, useEffect } from 'react';
import { Calculator, TrendingUp, Calendar, RefreshCw, BarChart2, PieChart, ToggleLeft, ToggleRight, FileText, BarChart } from 'lucide-react';
import { motion } from 'framer-motion';
import CalculatorLayout from '../components/CalculatorLayout';
import { FormField, Input, Button, ResultDisplay, Select } from '../components/CalculatorForm';
import FinancialChart, { ChartData } from '../components/FinancialChart';
import ActionableInsights from '../components/ActionableInsights';
import { useTheme } from '../context/ThemeContext';
import SectionNav from '../components/SectionNav';

type CompoundFrequency = 'annually' | 'semi-annually' | 'quarterly' | 'monthly' | 'daily';
type TimeUnit = 'years' | 'months' | 'days';
const FD_SECTIONS = [
  { id: 'fd-calculator-form', label: 'Calculator', icon: <Calculator size={16} /> },
  { id: 'fd-results', label: 'Results', icon: <FileText size={16} /> },
  { id: 'fd-charts', label: 'Charts', icon: <BarChart size={16} /> },
];

const FDCalculator: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [principal, setPrincipal] = useState<number>(10000);
  const [rate, setRate] = useState<number>(5.5);
  const [timePeriod, setTimePeriod] = useState<number>(5);
  const [timeUnit, setTimeUnit] = useState<TimeUnit>('years');
  const [compoundFrequency, setCompoundFrequency] = useState<CompoundFrequency>('quarterly');
  const [showResults, setShowResults] = useState<boolean>(false);
  const [maturityAmount, setMaturityAmount] = useState<number>(0);
  const [interestEarned, setInterestEarned] = useState<number>(0);
  const [activeChart, setActiveChart] = useState<'bar' | 'pie'>('bar');
  const [yearlyData, setYearlyData] = useState<ChartData[]>([]);
  const [isCompoundingEnabled, setIsCompoundingEnabled] = useState<boolean>(true);
  const [activeSection, setActiveSection] = useState<string>('fd-calculator-form');

  // Track scroll position to update active section
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      
      for (const section of FD_SECTIONS) {
        const element = document.getElementById(section.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const calculateFD = () => {
    // Convert time period to years based on selected unit
    let totalTimeInYears = timePeriod;
    
    if (timeUnit === 'months') {
      totalTimeInYears = timePeriod / 12;
    } else if (timeUnit === 'days') {
      totalTimeInYears = timePeriod / 365;
    }
    
    // Determine the number of times interest is compounded per year
    const compoundsPerYearMap: Record<CompoundFrequency, number> = {
      'annually': 1,
      'semi-annually': 2,
      'quarterly': 4,
      'monthly': 12,
      'daily': 365
    };
    
    // Use 'quarterly' as default when compounding is disabled
    const effectiveCompoundFrequency = isCompoundingEnabled ? compoundFrequency : 'quarterly';
    const compoundsPerYear = compoundsPerYearMap[effectiveCompoundFrequency];
    
    // Calculate maturity amount using compound interest formula
    // A = P(1 + r/n)^(nt)
    // Where: 
    // A = Maturity amount
    // P = Principal
    // r = Rate of interest (in decimal)
    // n = Number of times interest is compounded per year
    // t = Time period in years
    
    const interestRate = rate / 100;
    const maturity = principal * Math.pow(1 + (interestRate / compoundsPerYear), compoundsPerYear * totalTimeInYears);
    const interest = maturity - principal;
    
    setMaturityAmount(Math.round(maturity * 100) / 100);
    setInterestEarned(Math.round(interest * 100) / 100);
    
    // Generate yearly growth data for charts
    const newYearlyData: ChartData[] = [];
    const fullYears = Math.ceil(totalTimeInYears);
    
    for (let i = 0; i <= fullYears; i++) {
      const yearAmount = principal * Math.pow(1 + (interestRate / compoundsPerYear), compoundsPerYear * i);
      
      newYearlyData.push({
        name: `Year ${i}`,
        value: Math.round(yearAmount),
      });
    }
    
    setYearlyData(newYearlyData);
    setShowResults(true);
    
    // Scroll to results section after a short delay to allow rendering
    setTimeout(() => {
      const resultsSection = document.getElementById('fd-results');
      if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // Pie chart data showing principal vs interest
  const compositionData: ChartData[] = [
    { name: 'Principal', value: principal, color: '#0284c7' },
    { name: 'Interest', value: interestEarned, color: '#10b981' },
  ];

  // Toggle compounding frequency
  const toggleCompounding = () => {
    setIsCompoundingEnabled(!isCompoundingEnabled);
    // If disabling, set to quarterly (default)
    if (isCompoundingEnabled) {
      setCompoundFrequency('quarterly');
    }
  };

  // Get time period in human-readable format for results summary
  const getTimeDescription = () => {
    if (timeUnit === 'years') {
      return `${timePeriod} ${timePeriod === 1 ? 'year' : 'years'}`;
    } else if (timeUnit === 'months') {
      const years = Math.floor(timePeriod / 12);
      const months = timePeriod % 12;
      if (years === 0) return `${timePeriod} ${timePeriod === 1 ? 'month' : 'months'}`;
      if (months === 0) return `${years} ${years === 1 ? 'year' : 'years'}`;
      return `${years} ${years === 1 ? 'year' : 'years'} and ${months} ${months === 1 ? 'month' : 'months'}`;
    } else {
      const years = Math.floor(timePeriod / 365);
      const days = timePeriod % 365;
      if (years === 0) return `${timePeriod} ${timePeriod === 1 ? 'day' : 'days'}`;
      if (days === 0) return `${years} ${years === 1 ? 'year' : 'years'}`;
      return `${years} ${years === 1 ? 'year' : 'years'} and ${days} ${days === 1 ? 'day' : 'days'}`;
    }
  };

  const getTotalTimeInYears = () => {
    if (timeUnit === 'months') {
      return timePeriod / 12;
    }
    if (timeUnit === 'days') {
      return timePeriod / 365;
    }
    return timePeriod;
  };

  const formatMoney = (value: number) => `₹${Math.round(value).toLocaleString('en-IN')}`;
  const totalTimeInYears = getTotalTimeInYears();
  const annualCompoundedMaturity = principal * Math.pow(1 + rate / 100, totalTimeInYears);
  const compoundingLift = Math.max(0, maturityAmount - annualCompoundedMaturity);
  const effectiveAnnualYield =
    principal > 0 && totalTimeInYears > 0
      ? (Math.pow(maturityAmount / principal, 1 / totalTimeInYears) - 1) * 100
      : 0;
  const fdSummary = `Investing ${formatMoney(principal)} for ${getTimeDescription()} at ${rate}% is projected to mature at about ${formatMoney(maturityAmount)}.`;
  const fdInsights = [
    {
      title: 'Guaranteed gain',
      detail: `This deposit adds about ${formatMoney(interestEarned)} of interest on top of your principal.`,
      tone: 'positive' as const,
    },
    {
      title: 'Effective yearly yield',
      detail: `The result works out to roughly ${effectiveAnnualYield.toFixed(2)}% annualized growth over the selected tenure.`,
      tone: 'neutral' as const,
    },
    {
      title: 'Compounding bonus',
      detail: isCompoundingEnabled && compoundFrequency !== 'annually'
        ? `Using ${compoundFrequency} compounding adds about ${formatMoney(compoundingLift)} versus annual compounding at the same rate.`
        : 'Changing tenure or rate will move the result more than compounding frequency in this setup.',
      tone: 'action' as const,
    },
  ];
  const fdNextSteps = [
    { label: 'Compare with RD', to: '/calculators/rd' },
    { label: 'Check inflation effect', to: '/calculators/inflation' },
  ];

  // Handle time unit change
  const handleTimeUnitChange = (newUnit: TimeUnit) => {
    // Convert current value to the new unit
    let newTimePeriod = timePeriod;
    
    if (timeUnit === 'years' && newUnit === 'months') {
      newTimePeriod = timePeriod * 12;
    } else if (timeUnit === 'years' && newUnit === 'days') {
      newTimePeriod = timePeriod * 365;
    } else if (timeUnit === 'months' && newUnit === 'years') {
      newTimePeriod = Math.max(1, Math.floor(timePeriod / 12));
    } else if (timeUnit === 'months' && newUnit === 'days') {
      newTimePeriod = timePeriod * 30; // Approximation
    } else if (timeUnit === 'days' && newUnit === 'years') {
      newTimePeriod = Math.max(1, Math.floor(timePeriod / 365));
    } else if (timeUnit === 'days' && newUnit === 'months') {
      newTimePeriod = Math.max(1, Math.floor(timePeriod / 30)); // Approximation
    }
    
    setTimeUnit(newUnit);
    setTimePeriod(Math.round(newTimePeriod));
  };

  return (
    <CalculatorLayout
      title="Fixed Deposit (FD) Calculator"
      description="Find out your FD Maturity Details with ease. Calculate the total return on your fixed deposit based on the principal amount, interest rate, and time period."
      icon={<Calculator size={24} />}
    >
      {showResults && (
        <SectionNav sections={FD_SECTIONS} currentSection={activeSection} />
      )}
      <div className="space-y-6" id="fd-calculator-form">
        <motion.div 
          className={`rounded-lg p-4 border ${isDark ? 'bg-primary-900/30 border-primary-800' : 'bg-emerald-50 border-emerald-100'}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p className={`text-sm ${isDark ? 'text-primary-100' : 'text-emerald-800'}`}>
            <strong>Quick Tip:</strong> Fixed Deposits provide predictable contractual returns, but premature-withdrawal rules, taxes and deposit-insurance limits still matter.
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
            
            <FormField label="Principal Amount">
              <Input
                type="number"
                prefix="₹"
                value={principal}
                onChange={(e) => setPrincipal(Number(e.target.value))}
                placeholder="Enter principal amount"
                min="1"
              />
            </FormField>
            
            <FormField label="Interest Rate">
              <Input
                type="number"
                suffix="%"
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
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
            
            <div className="flex gap-4 items-start">
              <div className="flex-grow">
                <FormField label="Time Period">
                  <Input
                    type="number"
                    value={timePeriod}
                    onChange={(e) => setTimePeriod(Number(e.target.value))}
                    placeholder="Enter time period"
                    min="1"
                  />
                </FormField>
              </div>
              
              <div className="w-1/3">
                <FormField label="Unit">
                  <Select 
                    value={timeUnit} 
                    onChange={(e) => handleTimeUnitChange(e.target.value as TimeUnit)}
                  >
                    <option value="years">Years</option>
                    <option value="months">Months</option>
                    <option value="days">Days</option>
                  </Select>
                </FormField>
              </div>
            </div>
            
            <div className={`mt-2 px-3 py-2 rounded-lg text-xs ${
              isDark ? 'bg-dark-elevated text-gray-400' : 'bg-gray-50 text-gray-600'
            }`}>
              {timeUnit === 'years' && (
                <span>Approximately {timePeriod * 12} months or {timePeriod * 365} days</span>
              )}
              {timeUnit === 'months' && (
                <span>Approximately {(timePeriod / 12).toFixed(1)} years or {timePeriod * 30} days</span>
              )}
              {timeUnit === 'days' && (
                <span>Approximately {(timePeriod / 365).toFixed(2)} years or {(timePeriod / 30).toFixed(1)} months</span>
              )}
            </div>
          </motion.div>
        </div>

        <motion.div 
          className={`rounded-lg p-5 border shadow-sm ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-100'}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400">
              <RefreshCw size={18} />
              <h3 className="font-medium">Compounding Frequency</h3>
            </div>
            
            <motion.button
              onClick={toggleCompounding}
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm transition-all ${
                isDark 
                  ? isCompoundingEnabled ? 'bg-primary-900/40 text-primary-300' : 'bg-gray-800 text-gray-400' 
                  : isCompoundingEnabled ? 'bg-primary-50 text-primary-700' : 'bg-gray-100 text-gray-600'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isCompoundingEnabled ? (
                <>
                  <ToggleRight size={16} />
                  <span>Enabled</span>
                </>
              ) : (
                <>
                  <ToggleLeft size={16} />
                  <span>Disabled</span>
                </>
              )}
            </motion.button>
          </div>
          
          {isCompoundingEnabled ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {(['annually', 'semi-annually', 'quarterly', 'monthly', 'daily'] as CompoundFrequency[]).map((frequency) => (
                <motion.div
                  key={frequency}
                  onClick={() => setCompoundFrequency(frequency)}
                  className={`cursor-pointer rounded-lg p-3 text-center text-sm transition-all ${
                    compoundFrequency === frequency
                      ? isDark 
                        ? 'bg-primary-900 text-primary-100 border-2 border-primary-700 font-medium scale-105'
                        : 'bg-primary-100 text-primary-700 border-2 border-primary-300 font-medium scale-105'
                      : isDark
                        ? 'bg-dark-border text-gray-300 border border-dark-border hover:bg-dark-border/80'
                        : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Compounding frequency is set to <span className="font-medium text-primary-600 dark:text-primary-400">Quarterly</span> (default).
                Toggle the switch above to customize the compounding frequency.
              </p>
            </div>
          )}
        </motion.div>

        <div className="flex justify-center mt-2">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button onClick={calculateFD}>
              <Calculator size={18} />
              Calculate FD Maturity
            </Button>
          </motion.div>
        </div>
      </div>

      {showResults && (
        <motion.div 
          id="fd-results"
          className={`mt-10 border-t pt-8 ${isDark ? 'border-dark-border' : ''}`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h3 className={`text-xl font-semibold mb-5 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            FD Maturity Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ResultDisplay 
              label="Maturity Amount" 
              value={`₹${maturityAmount.toLocaleString()}`} 
              highlight={true} 
            />
            
            <ResultDisplay 
              label="Interest Earned" 
              value={`₹${interestEarned.toLocaleString()}`} 
            />
          </div>
          
          <div className={`mt-6 p-5 rounded-lg border ${
            isDark ? 'bg-dark-card/50 border-dark-border' : 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200'
          }`}>
            <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Summary
            </h4>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              If you invest <strong className="text-primary-500">₹{principal.toLocaleString()}</strong> at an interest rate of <strong className="text-primary-500">{rate}%</strong> for <strong className="text-primary-500">{getTimeDescription()}</strong> with <strong className="text-primary-500">{compoundFrequency}</strong> compounding, you will earn <strong className={isDark ? 'text-emerald-400' : 'text-emerald-600'}>₹{interestEarned.toLocaleString()}</strong> as interest, and your total maturity amount will be <strong className={isDark ? 'text-emerald-400' : 'text-emerald-600'}>₹{maturityAmount.toLocaleString()}</strong>.
            </p>
          </div>

          {/* Progress bar */}
          <div className="mt-6">
            <div className="w-full bg-gray-200 dark:bg-dark-border rounded-full h-3">
              <div className="bg-primary-600 dark:bg-primary-500 h-3 rounded-full" style={{ width: `${(principal / maturityAmount) * 100}%` }}></div>
            </div>
            <div className="flex justify-between mt-2 text-xs">
              <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Principal: <span className="font-medium">{Math.round((principal / maturityAmount) * 100)}%</span></span>
              <span className="text-primary-600 dark:text-primary-400">Interest: <span className="font-medium">{Math.round((interestEarned / maturityAmount) * 100)}%</span></span>
            </div>
          </div>

          <ActionableInsights
            summary={fdSummary}
            insights={fdInsights}
            nextSteps={fdNextSteps}
          />

          {/* Charts */}
          <div className="mt-8" id="fd-charts">
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Visual Insights
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

export default FDCalculator; 
