import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, BarChart2, ArrowRight, Landmark, Plus, Trash2 } from 'lucide-react';
import CalculatorLayout from '../components/CalculatorLayout';
import { FormField, Input, Button, ResultDisplay } from '../components/CalculatorForm';
import ActionableInsights from '../components/ActionableInsights';
import FinancialChart, { ChartData } from '../components/FinancialChart';
import { useTheme } from '../context/ThemeContext';
import {
  calculateIRRFromCashFlows,
  calculateNPV,
  formatCurrencyINR,
} from '../utils/finance';

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

interface CashFlow {
  year: number;
  amount: number;
}

const IRRCalculator: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // State variables for inputs
  const [initialInvestment, setInitialInvestment] = useState<number>(100000);
  const [cashFlows, setCashFlows] = useState<CashFlow[]>([
    { year: 1, amount: 20000 },
    { year: 2, amount: 25000 },
    { year: 3, amount: 30000 },
    { year: 4, amount: 35000 },
    { year: 5, amount: 40000 },
  ]);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [error, setError] = useState('');

  // State variables for calculation results
  const [irrPercentage, setIRRPercentage] = useState<number>(0);
  const [npvAtIRR, setNPVAtIRR] = useState<number>(0);
  const [netCashFlow, setNetCashFlow] = useState<number>(0);
  const [cashFlowData, setCashFlowData] = useState<ChartData[]>([]);
  const [cumulativeData, setCumulativeData] = useState<ChartData[]>([]);
  const sortedCashFlows = [...cashFlows].sort((a, b) => a.year - b.year);
  let cumulativeRecovery = -initialInvestment;
  let paybackYear: number | null = null;

  for (const cashFlow of sortedCashFlows) {
    cumulativeRecovery += cashFlow.amount;

    if (paybackYear === null && cumulativeRecovery >= 0) {
      paybackYear = cashFlow.year;
    }
  }

  const irrSummary = `An initial outlay of ${formatCurrencyINR(initialInvestment)} with ${cashFlows.length} future cash flows produces an IRR of ${irrPercentage.toFixed(2)}% and a net cash surplus of ${formatCurrencyINR(netCashFlow)}.`;
  const irrInsights = [
    {
      title: 'Hurdle-rate test',
      detail: `If your minimum acceptable return is below ${irrPercentage.toFixed(2)}%, this opportunity clears that hurdle. If your hurdle is higher, the deal needs a second look.`,
      tone: irrPercentage >= 12 ? 'positive' as const : irrPercentage > 0 ? 'neutral' as const : 'caution' as const,
    },
    {
      title: 'Capital recovery',
      detail: paybackYear !== null
        ? `Cumulative inflows recover the initial investment by about year ${paybackYear}.`
        : 'The projected cash flows do not fully recover the initial investment within the entered horizon.',
      tone: paybackYear !== null ? 'positive' as const : 'caution' as const,
    },
    {
      title: 'Profitability check',
      detail: `The raw cash surplus is ${formatCurrencyINR(netCashFlow)}. IRR measures annualized efficiency, while this figure shows the absolute rupee outcome.`,
      tone: netCashFlow >= 0 ? 'action' as const : 'caution' as const,
    },
  ];
  const irrNextSteps = [
    { label: 'Compare with CAGR', to: '/calculators/cagr' },
    { label: 'Review mutual fund growth', to: '/calculators/mf' },
  ];

  // Add new cash flow
  const addCashFlow = () => {
    const nextYear = cashFlows.length > 0 ? Math.max(...cashFlows.map(cf => cf.year)) + 1 : 1;
    setCashFlows([...cashFlows, { year: nextYear, amount: 0 }]);
  };

  // Remove cash flow
  const removeCashFlow = (index: number) => {
    const updatedCashFlows = [...cashFlows];
    updatedCashFlows.splice(index, 1);
    setCashFlows(updatedCashFlows);
  };

  // Update cash flow amount
  const updateCashFlowAmount = (index: number, amount: number) => {
    const updatedCashFlows = [...cashFlows];
    updatedCashFlows[index].amount = amount;
    setCashFlows(updatedCashFlows);
  };

  // Update cash flow year
  const updateCashFlowYear = (index: number, year: number) => {
    const updatedCashFlows = [...cashFlows];
    updatedCashFlows[index].year = year;
    setCashFlows(updatedCashFlows);
  };

  const performCalculation = () => {
    setShowResults(false);

    // Validate inputs
    if (initialInvestment <= 0) {
      setError('Initial investment must be a positive number.');
      return;
    }

    if (cashFlows.length === 0) {
      setError('Add at least one future cash flow.');
      return;
    }

    if (cashFlows.some(cf => cf.year <= 0)) {
      setError('Every cash-flow year must be a positive number.');
      return;
    }

    try {
      const irr = calculateIRRFromCashFlows(initialInvestment, cashFlows);

      if (irr === null) {
        setError("A valid IRR could not be found for this cash-flow pattern.");
        return;
      }
      setError('');

      const resolvedNpv = calculateNPV(irr, initialInvestment, cashFlows);
      setIRRPercentage(irr * 100);
      setNPVAtIRR(resolvedNpv);

      // Calculate net cash flow
      const totalCashFlow = cashFlows.reduce((sum, cf) => sum + cf.amount, 0) - initialInvestment;
      setNetCashFlow(totalCashFlow);

      // Prepare data for charts
      const sortedFlows = [...cashFlows].sort((a, b) => a.year - b.year);
      
      // Cash flow chart data
      const cfData: ChartData[] = [
        { name: 'Initial', value: -initialInvestment, color: isDark ? '#ff3b30' : '#ef4444' }, // Initial investment as negative
        ...sortedFlows.map((cf, index) => ({
          name: `Year ${cf.year}`,
          value: cf.amount,
          color: isDark ? '#ff6b00' : '#0ea5e9',
        })),
      ];
      setCashFlowData(cfData);

      // Cumulative cash flow chart data
      let cumulative = -initialInvestment;
      const cumulativeChartData: ChartData[] = [
        { name: 'Initial', value: cumulative, color: isDark ? '#1c1c1e' : '#64748b' },
      ];

      for (const cf of sortedFlows) {
        cumulative += cf.amount;
        cumulativeChartData.push({
          name: `Year ${cf.year}`,
          value: cumulative,
          color: cumulative >= 0 
            ? (isDark ? '#00D840' : '#10b981') 
            : (isDark ? '#ff3b30' : '#ef4444'),
        });
      }
      setCumulativeData(cumulativeChartData);

      setShowResults(true);
    } catch (error) {
      setError('Could not calculate IRR. Check the cash-flow values and try again.');
      console.error("IRR calculation error:", error);
    }
  };

  return (
    <CalculatorLayout
      title="IRR Calculator"
      description="Calculate the Internal Rate of Return (IRR) of your investments with multiple cash flows."
      icon={<Landmark size={24} className={isDark ? 'text-banking-orange' : ''} />}
    >
      <div className="space-y-6">
        <motion.div 
          className={`rounded-xl p-4 ${isDark ? 'bg-banking-darkgray border-0 shadow-lg' : 'bg-blue-50 border border-blue-100'}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-start gap-3">
            <Landmark size={20} className={isDark ? 'text-banking-orange' : 'text-blue-500'} />
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-blue-800'}`}>
                <strong>Key Features:</strong> IRR (Internal Rate of Return) is the discount rate that makes the net present value of all cash flows equal to zero. This calculator helps you evaluate the profitability of investments with multiple cash flows.
              </p>
              <p className={`text-xs mt-1 ${isDark ? 'text-banking-orange' : 'text-blue-600'}`}>
                IRR is commonly used to compare investment alternatives with different cash flow patterns.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className={`rounded-xl p-5 ${isDark ? 'bg-banking-gray border-0 shadow-lg' : 'bg-white border border-gray-100 shadow-sm'}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-5 text-primary-600 dark:text-banking-orange">
            <DollarSign size={18} />
            <h3 className="font-medium">Initial Investment</h3>
          </div>
          
          <FormField label="Initial Investment Amount" labelClass={isDark ? 'banking-label' : ''}>
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
              The amount you initially invested (will be treated as a negative cash flow)
            </p>
          </FormField>
        </motion.div>

        <motion.div 
          className={`rounded-xl p-5 ${isDark ? 'bg-banking-gray border-0 shadow-lg' : 'bg-white border border-gray-100 shadow-sm'}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2 text-primary-600 dark:text-banking-orange">
              <BarChart2 size={18} />
              <h3 className="font-medium">Cash Flows</h3>
            </div>
            <Button 
              onClick={addCashFlow} 
              className={`px-3 py-1.5 ${isDark ? 'bg-banking-darkgray border-0 text-banking-orange hover:bg-banking-darkgray/90' : ''}`}
            >
              <Plus size={16} />
              Add Cash Flow
            </Button>
          </div>
          
          <div className="space-y-4">
            {cashFlows.map((cf, index) => (
              <div key={index} className="flex gap-3 items-start">
                <div className="flex-1">
                  <FormField label={`Year ${index + 1}`} labelClass={isDark ? 'banking-label' : ''}>
                    <Input
                      type="number"
                      value={cf.year}
                      onChange={(e) => updateCashFlowYear(index, Number(e.target.value))}
                      placeholder="Year"
                      min="1"
                      step="1"
                      className={isDark ? 'banking-input' : ''}
                    />
                  </FormField>
                </div>
                <div className="flex-1">
                  <FormField label="Amount" labelClass={isDark ? 'banking-label' : ''}>
                    <Input
                      type="number"
                      prefix="₹"
                      value={cf.amount}
                      onChange={(e) => updateCashFlowAmount(index, Number(e.target.value))}
                      placeholder="Cash flow amount"
                      step="1000"
                      className={isDark ? 'banking-input' : ''}
                    />
                  </FormField>
                </div>
                <button 
                  onClick={() => removeCashFlow(index)}
                  className={`mt-8 p-2 rounded-md ${
                    isDark 
                      ? 'bg-banking-darkgray text-red-500 hover:bg-red-900/20' 
                      : 'bg-gray-100 text-red-500 hover:bg-red-50'
                  }`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            {cashFlows.length === 0 && (
              <p className={`text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                No cash flows added. Click "Add Cash Flow" to add your first cash flow.
              </p>
            )}
          </div>
        </motion.div>

        <div className="flex justify-center mt-6">
          {error && <p role="alert" className="mr-4 rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</p>}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button onClick={performCalculation} className={isDark ? 'banking-button-primary w-full py-4 text-base' : ''}>
              <Landmark size={18} />
              Calculate IRR
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
            IRR Calculation Results
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ResultDisplay 
              label="Internal Rate of Return (IRR)" 
              value={`${irrPercentage.toFixed(2)}%`} 
              highlight={true} 
              darkCustomClass={isDark ? 'bg-banking-darkgray border-0 text-banking-orange shadow-lg rounded-xl' : ''}
            />
            
            <ResultDisplay 
              label="Net Cash Flow" 
              value={`₹${Math.round(netCashFlow).toLocaleString()}`} 
              darkCustomClass={isDark ? 'bg-banking-darkgray border-0 shadow-lg rounded-xl' : ''}
            />
            
            <ResultDisplay 
              label="NPV at IRR" 
              value={`₹${Math.abs(npvAtIRR).toFixed(2)}`}
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
                  ₹{initialInvestment.toLocaleString()} <span className="text-xs">initial investment</span>
                </span>
              </div>
              
              <ArrowRight className={`hidden md:block ${isDark ? 'text-gray-600' : 'text-gray-400'}`} size={20} />
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-primary-600/10 border border-primary-500/20 dark:bg-banking-darkgray dark:border-0 dark:shadow-lg">
                <Landmark size={20} className={`${isDark ? 'text-banking-orange' : 'text-primary-500'}`} />
                <span className="text-sm font-medium">
                  {irrPercentage.toFixed(2)}% <span className="text-xs">IRR</span>
                </span>
              </div>
              
              <ArrowRight className={`hidden md:block ${isDark ? 'text-gray-600' : 'text-gray-400'}`} size={20} />
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-600/10 border border-emerald-500/20 dark:bg-banking-darkgray dark:border-0 dark:shadow-lg">
                <span className={`text-sm font-medium ${netCashFlow >= 0 ? (isDark ? 'text-banking-green' : 'text-emerald-500') : 'text-red-500'}`}>
                  ₹{Math.round(netCashFlow).toLocaleString()}
                </span>
              </div>
              
              <div className="hidden md:block p-3 rounded-lg border border-primary-500/20 dark:border-0 dark:bg-banking-darkgray dark:shadow-lg ml-auto">
                <span className="text-xs font-medium">
                  For <span className={isDark ? 'text-banking-orange' : 'text-blue-600'}>{cashFlows.length} cash flows</span>
                </span>
              </div>
            </div>
          </div>

          <ActionableInsights
            title="How To Read This IRR"
            summary={irrSummary}
            insights={irrInsights}
            nextSteps={irrNextSteps}
          />

          {/* Cash Flow Visualization */}
          <div className="mt-10">
            <h3 className={`text-xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Cash Flow Visualization
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className={isDark ? 'chart-container rounded-xl' : ''}>
                <FinancialChart 
                  data={cashFlowData} 
                  type="bar" 
                  title="Individual Cash Flows" 
                  xAxisLabel="Time Period" 
                  yAxisLabel="Amount (₹)" 
                  height={300}
                />
              </div>
              
              <div className={isDark ? 'chart-container rounded-xl' : ''}>
                <FinancialChart 
                  data={cumulativeData} 
                  type="line" 
                  title="Cumulative Cash Flow" 
                  xAxisLabel="Time Period" 
                  yAxisLabel="Cumulative Amount (₹)" 
                  height={300}
                />
              </div>
            </div>
          </div>

          {/* IRR Explanation */}
          <AnimateOnView>
            <div className={`mt-10 p-5 rounded-xl ${
              isDark ? 'bg-banking-darkgray border-0 shadow-lg' : 'bg-white border border-gray-200 shadow-sm'
            }`}>
              <h4 className={`text-lg font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                About IRR
              </h4>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                The Internal Rate of Return (IRR) is the discount rate that makes the net present value (NPV) of all cash flows equal to zero. It represents the annualized effective compounded return rate that can be earned on the invested capital.
              </p>
              <div className="mt-3 p-3 rounded bg-primary-50 dark:bg-banking-gray text-sm">
                <p className={`font-medium mb-1 ${isDark ? 'text-banking-orange' : 'text-primary-600'}`}>IRR is calculated by solving:</p>
                <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                  0 = NPV = -Initial Investment + CF₁/(1+IRR)¹ + CF₂/(1+IRR)² + ... + CFₙ/(1+IRR)ⁿ
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  Where CF = Cash Flow and n = time period
                </p>
              </div>
              <p className={`mt-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                <strong>When to use IRR:</strong> IRR is particularly useful when comparing investment opportunities with different cash flow patterns. Generally, the higher the IRR, the more desirable the investment. However, IRR should be used alongside other metrics like NPV for a comprehensive analysis.
              </p>
              <p className={`mt-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                <strong>Limitations:</strong> IRR assumes that cash flows can be reinvested at the same rate, which may not be realistic. Multiple IRRs can also occur when cash flow signs change more than once.
              </p>
            </div>
          </AnimateOnView>
        </motion.div>
      )}
    </CalculatorLayout>
  );
};

export default IRRCalculator; 
