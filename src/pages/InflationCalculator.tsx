import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingDown, Calendar, BarChart2, ArrowRight } from 'lucide-react';
import CalculatorLayout from '../components/CalculatorLayout';
import { FormField, Input, Button, ResultDisplay } from '../components/CalculatorForm';
import FinancialChart, { ChartData } from '../components/FinancialChart';
import ActionableInsights from '../components/ActionableInsights';
import { useTheme } from '../context/ThemeContext';

interface YearlyData {
  year: number;
  nominalValue: number;
  realValue: number;
  inflationImpact: number;
}

const InflationCalculator: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // State variables
  const [currentAmount, setCurrentAmount] = useState<number>(100000);
  const [inflationRate, setInflationRate] = useState<number>(6.5);
  const [years, setYears] = useState<number>(20);
  const [futureAmount, setFutureAmount] = useState<number>(0);
  const [purchasingPowerLoss, setPurchasingPowerLoss] = useState<number>(0);
  const [yearlyData, setYearlyData] = useState<YearlyData[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isCalculated, setIsCalculated] = useState<boolean>(false);
  const formatMoney = (value: number) => `₹${Math.round(value).toLocaleString('en-IN')}`;
  const futurePurchasingPower = currentAmount * (1 - purchasingPowerLoss / 100);
  const inflationSummary = `${formatMoney(currentAmount)} today would require about ${formatMoney(futureAmount)} after ${years} years to buy the same basket of goods at ${inflationRate}% inflation.`;
  const inflationInsights = [
    {
      title: 'Real value left',
      detail: `If your money does not grow, its purchasing power falls to roughly ${formatMoney(futurePurchasingPower)} in today's terms.`,
      tone: 'caution' as const,
    },
    {
      title: 'Return hurdle',
      detail: `To preserve purchasing power, your post-tax investment return needs to beat about ${inflationRate.toFixed(1)}% per year.`,
      tone: 'action' as const,
    },
    {
      title: 'Delay cost',
      detail: `Inflation adds about ${formatMoney(futureAmount - currentAmount)} to the amount you will need for the same goal.`,
      tone: 'neutral' as const,
    },
  ];
  const inflationNextSteps = [
    { label: 'Plan a goal SIP', to: '/calculators/goal-sip' },
    { label: 'Estimate retirement corpus', to: '/calculators/retirement' },
  ];
  
  // Calculate effect of inflation
  const calculateInflation = () => {
    // Validate inputs
    if (currentAmount <= 0 || inflationRate < 0 || years <= 0) {
      return;
    }
    
    const inflationFactor = Math.pow(1 + (inflationRate / 100), years);
    const calculatedFutureAmount = currentAmount * inflationFactor;
    const futurePurchasingPower = currentAmount / inflationFactor;
    const calculatedPurchasingPowerLoss =
      ((currentAmount - futurePurchasingPower) / currentAmount) * 100;
    
    // Calculate yearly data
    const yearlyDataArray: YearlyData[] = [];
    const chartDataArray: ChartData[] = [];
    
    for (let year = 0; year <= years; year++) {
      const yearlyInflationFactor = Math.pow(1 + (inflationRate / 100), year);
      const nominalValue = currentAmount * yearlyInflationFactor;
      const realValue = currentAmount / yearlyInflationFactor;
      const inflationImpact = currentAmount - realValue;
      
      yearlyDataArray.push({
        year,
        nominalValue,
        realValue,
        inflationImpact
      });
      
      chartDataArray.push({
        name: `Year ${year}`,
        value: nominalValue,
        color: 'primary'
      });
    }
    
    // Update state
    setFutureAmount(calculatedFutureAmount);
    setPurchasingPowerLoss(calculatedPurchasingPowerLoss);
    setYearlyData(yearlyDataArray);
    setChartData(chartDataArray);
    setIsCalculated(true);
  };
  
  // Reset calculation when inputs change
  useEffect(() => {
    setIsCalculated(false);
  }, [currentAmount, inflationRate, years]);
  
  // Common items for purchasing power examples
  const commonItems = [
    { name: "Movie Ticket", currentCost: 300 },
    { name: "Dining Out (for two)", currentCost: 2000 },
    { name: "Groceries (weekly)", currentCost: 3000 },
    { name: "Smartphone", currentCost: 50000 }
  ];
  
  return (
    <CalculatorLayout
      title="Inflation Calculator"
      description="Understand how inflation erodes your purchasing power over time and plan accordingly."
      icon={<TrendingDown size={24} />}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Form */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Inflation Impact</h2>
          
          <FormField label="Current Amount (₹)">
            <Input
              type="number"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(Number(e.target.value))}
              placeholder="Enter current amount"
              min={1}
            />
          </FormField>
          
          <FormField label="Annual Inflation Rate (%)">
            <Input
              type="number"
              value={inflationRate}
              onChange={(e) => setInflationRate(Number(e.target.value))}
              placeholder="Enter inflation rate"
              min={0.1}
              max={30}
              step={0.1}
            />
            <div className="text-xs text-gray-500 mt-1">
              Average inflation rate in India: 6-7% annually
            </div>
          </FormField>
          
          <FormField label="Time Period (Years)">
            <Input
              type="number"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              placeholder="Enter number of years"
              min={1}
              max={50}
            />
          </FormField>
          
          <div className="mt-6">
            <Button onClick={calculateInflation} className="w-full">
              Calculate Impact <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>
          
          {/* Common items table */}
          <div className="mt-10">
            <h3 className="text-lg font-medium mb-3">Inflation's Impact on Common Expenses</h3>
            
            {isCalculated && (
              <div className="overflow-x-auto">
                <table className={`min-w-full divide-y divide-gray-200 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <thead className={isDark ? 'bg-gray-800' : 'bg-gray-50'}>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Item</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Current Cost</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Future Cost (in {years} years)</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {commonItems.map((item, index) => {
                      const futureCost = item.currentCost * Math.pow(1 + (inflationRate / 100), years);
                      
                      return (
                        <tr key={index} className={index % 2 === 0 ? (isDark ? 'bg-gray-800' : 'bg-white') : (isDark ? 'bg-gray-750' : 'bg-gray-50')}>
                          <td className="px-4 py-3">{item.name}</td>
                          <td className="px-4 py-3">₹{item.currentCost.toLocaleString('en-IN')}</td>
                          <td className="px-4 py-3">₹{futureCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        
        {/* Results Section */}
        <div>
          {isCalculated && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-xl font-semibold mb-4">Results</h2>
              
              <div className="grid grid-cols-1 gap-4 mb-6">
                <ResultDisplay
                  label="Current Value"
                  value={`₹${currentAmount.toLocaleString('en-IN')}`}
                  icon={<DollarSign className="text-primary-500" />}
                />
                
                <ResultDisplay
                  label={`Value After ${years} Years`}
                  value={`₹${futureAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                  icon={<Calendar className="text-amber-500" />}
                />
                
                <ResultDisplay
                  label="Purchasing Power Loss"
                  value={`${purchasingPowerLoss.toFixed(2)}%`}
                  icon={<TrendingDown className="text-rose-500" />}
                />
                
                <ResultDisplay
                  label="Amount Needed to Maintain Purchasing Power"
                  value={`₹${futureAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                  icon={<BarChart2 className="text-emerald-500" />}
                />
              </div>

              <ActionableInsights
                summary={inflationSummary}
                insights={inflationInsights}
                nextSteps={inflationNextSteps}
              />
              
              {/* Chart showing inflation effect - Mobile Friendly */}
              <div className="mt-8">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-medium">Inflation Growth Over Time</h3>
                  {/* Mobile-only helper text */}
                  <span className="text-xs text-gray-500 dark:text-gray-400 sm:hidden">Tap to interact</span>
                </div>
                
                {/* Added touch-action-none for better touch handling */}
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 touch-action-none">
                  {/* Mobile-optimized container with guaranteed visibility */}
                  <div className="min-h-[300px] h-auto sm:h-80 w-full px-2 pt-4 pb-2 sm:p-4">
                    <FinancialChart 
                      data={
                        // For mobile, display fewer data points - only every nth year plus the final year
                        years > 30 
                          ? chartData.filter((_, idx) => idx % 10 === 0 || idx === chartData.length - 1)
                          : years > 15
                            ? chartData.filter((_, idx) => idx % 5 === 0 || idx === chartData.length - 1)
                            : years > 5
                              ? chartData.filter((_, idx) => idx % 2 === 0 || idx === chartData.length - 1)
                              : chartData
                      }
                      title=""
                      type="line"
                      xAxisLabel="Years"
                      yAxisLabel="Amount (₹)"
                      height={280} // Increased height
                    />
                  </div>
                  
                  {/* Key data points legend */}
                  <div className="mt-4 flex flex-wrap justify-center gap-4 px-2">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-primary-500 mr-2"></div>
                      <span className="text-xs font-medium">Starting: ₹{currentAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                      <span className="text-xs font-medium">Final: ₹{futureAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-rose-500 mr-2"></div>
                      <span className="text-xs font-medium">Loss: {purchasingPowerLoss.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-center">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Impact:</span> ₹{currentAmount.toLocaleString('en-IN')} today will need {' '}
                    <span className="font-medium text-amber-600 dark:text-amber-400">
                      ₹{futureAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span> {' '}
                    in {years} years to buy the same goods and services.
                  </p>
                </div>
              </div>
              
              {/* Purchasing power visualization */}
              <div className="mt-8">
                <h3 className="text-lg font-medium mb-3">Purchasing Power Comparison</h3>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <div className="flex-grow">
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-300">Current Purchasing Power</div>
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-200">₹{currentAmount.toLocaleString('en-IN')}</div>
                  </div>
                  
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div className="bg-primary-500 h-2.5 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                  
                  <div className="mt-4 flex items-center">
                    <div className="flex-grow">
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-300">Future Purchasing Power</div>
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-200">₹{(currentAmount * (1 - purchasingPowerLoss/100)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                  </div>
                  
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div className="bg-secondary-500 h-2.5 rounded-full" style={{ width: `${100 - purchasingPowerLoss}%` }}></div>
                  </div>
                  
                  <div className="mt-3 text-xs text-center text-gray-500 dark:text-gray-400">
                    You'll need ₹{futureAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })} in {years} years to buy what ₹{currentAmount.toLocaleString('en-IN')} buys today.
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Yearly Breakdown Table - Mobile Optimized */}
      {isCalculated && yearlyData.length > 0 && (
        <motion.div
          className="mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold mb-4">Year-by-Year Impact of Inflation</h2>
          
          {/* Table explanation for mobile users */}
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 md:hidden">
            Swipe horizontally to see more data →
          </p>
          
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className={`min-w-full divide-y divide-gray-200 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <thead className={isDark ? 'bg-gray-800' : 'bg-gray-50'}>
                <tr>
                  <th className="sticky left-0 z-10 px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider bg-inherit">
                    Year
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Amount Needed
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Purchasing Power Left
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    <span className="whitespace-nowrap">Loss Due to Inflation</span>
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {/* Only show every other year or 5 years for better mobile display when we have many years */}
                {yearlyData
                  .filter((_, idx) => years > 20 
                    ? idx % 5 === 0 || idx === yearlyData.length - 1  // Every 5 years for long periods
                    : years > 10 
                      ? idx % 2 === 0 || idx === yearlyData.length - 1  // Every other year for medium periods
                      : true)  // Show all years for short periods
                  .map((data, index) => (
                    <tr key={index} className={index % 2 === 0 ? (isDark ? 'bg-gray-800' : 'bg-white') : (isDark ? 'bg-gray-750' : 'bg-gray-50')}>
                      <td className="sticky left-0 z-10 px-4 sm:px-6 py-3 bg-inherit font-medium">
                        {data.year}
                      </td>
                      <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                        ₹{data.nominalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </td>
                      <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                        ₹{data.realValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </td>
                      <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-rose-600 dark:text-rose-400">
                        ₹{data.inflationImpact.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Mobile condensed summary */}
          <div className="mt-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 md:hidden">
            <div className="text-sm">
              <div className="font-medium mb-2">Key Insights:</div>
              <ul className="space-y-1 list-disc pl-4 text-gray-600 dark:text-gray-300">
                <li>After {years} years, your money will have lost {purchasingPowerLoss.toFixed(1)}% of its value</li>
                <li>You'll need ₹{futureAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })} to match today's ₹{currentAmount.toLocaleString('en-IN')}</li>
                <li>The inflation rate of {inflationRate}% reduces your purchasing power every year</li>
              </ul>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Information Section */}
      <div className="mt-12 bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Understanding Inflation</h2>
        
        <div className="space-y-4">
          <p>
            <strong>Inflation</strong> is the rate at which the general level of prices for goods and services rises, causing purchasing power to fall over time. It's one of the most critical factors to consider when planning for long-term financial goals.
          </p>
          
          <div>
            <h3 className="font-medium mb-2">Why Inflation Matters:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Erodes the purchasing power of your savings over time</li>
              <li>Reduces the real returns on your investments</li>
              <li>Makes achieving long-term financial goals more challenging</li>
              <li>Can significantly impact retirement planning</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Strategies to Beat Inflation:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Invest in equity</strong>: Historically, stocks have outpaced inflation over the long term</li>
              <li><strong>Real estate</strong>: Property values and rental income often rise with inflation</li>
              <li><strong>Inflation-linked bonds</strong>: These adjust with inflation rates</li>
              <li><strong>Gold and precious metals</strong>: Traditional hedges against inflation</li>
              <li><strong>Increase your income</strong>: Regularly negotiate salary raises that exceed inflation</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Historical Inflation Rates in India:</h3>
            <p className="mb-2">India has experienced varying inflation rates over the years:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Average inflation (2010-2020): ~6%</li>
              <li>Highest in recent decades: ~12% (2009-2010)</li>
              <li>RBI's current inflation target: 4% (with a band of ±2%)</li>
            </ul>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Financial Planning Tip:</strong> When setting financial goals, always account for inflation. For long-term goals like retirement, you'll need significantly more money than you might initially calculate if you don't factor in inflation's impact.
            </p>
          </div>
        </div>
      </div>
    </CalculatorLayout>
  );
};

export default InflationCalculator; 
