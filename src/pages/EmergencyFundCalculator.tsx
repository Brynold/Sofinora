import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Umbrella, ArrowRight, PiggyBank, Home } from 'lucide-react';
import CalculatorLayout from '../components/CalculatorLayout';
import { FormField, Input, Select, Button, ResultDisplay } from '../components/CalculatorForm';
import FinancialChart, { ChartData } from '../components/FinancialChart';
import ActionableInsights from '../components/ActionableInsights';

const EmergencyFundCalculator: React.FC = () => {
  // State variables
  const [monthsNeeded, setMonthsNeeded] = useState<number>(6);
  const [currentSavings, setCurrentSavings] = useState<number>(100000);
  const [rentMortgage, setRentMortgage] = useState<number>(20000);
  const [utilities, setUtilities] = useState<number>(5000);
  const [groceries, setGroceries] = useState<number>(8000);
  const [transportation, setTransportation] = useState<number>(6000);
  const [healthcare, setHealthcare] = useState<number>(3000);
  const [otherEssentials, setOtherEssentials] = useState<number>(8000);
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [employmentStability, setEmploymentStability] = useState<'stable' | 'moderate' | 'unstable'>('moderate');
  const [dependents, setDependents] = useState<number>(0);
  
  // Results
  const [totalMonthlyExpenses, setTotalMonthlyExpenses] = useState<number>(0);
  const [recommendedFund, setRecommendedFund] = useState<number>(0);
  const [fundGap, setFundGap] = useState<number>(0);
  const [savingProgress, setSavingProgress] = useState<number>(0);
  const [adjustedMonths, setAdjustedMonths] = useState<number>(6);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isCalculated, setIsCalculated] = useState<boolean>(false);
  const formatMoney = (value: number) => `₹${Math.round(value).toLocaleString('en-IN')}`;
  const currentCoverageMonths = totalMonthlyExpenses > 0 ? currentSavings / totalMonthlyExpenses : 0;
  const monthlyTopUpForOneYear = fundGap > 0 ? fundGap / 12 : 0;
  const emergencySummary = `Based on your essential expenses, a target emergency fund of ${formatMoney(recommendedFund)} gives you about ${adjustedMonths} months of coverage.`;
  const emergencyInsights = [
    {
      title: 'Current runway',
      detail: `Your existing savings cover about ${currentCoverageMonths.toFixed(1)} months of essentials at the current spending level.`,
      tone: currentCoverageMonths >= adjustedMonths ? 'positive' as const : 'neutral' as const,
    },
    {
      title: 'Catch-up target',
      detail: fundGap > 0
        ? `Saving about ${formatMoney(monthlyTopUpForOneYear)} per month for the next 12 months would close the current gap.`
        : 'You are already at or above the recommended level, so the next job is keeping the buffer liquid and accessible.',
      tone: fundGap > 0 ? 'action' as const : 'positive' as const,
    },
    {
      title: 'Risk-adjusted buffer',
      detail: adjustedMonths !== monthsNeeded
        ? `Your risk profile changed the recommendation from ${monthsNeeded} to ${adjustedMonths} months of expenses.`
        : `Your selected risk factors kept the recommendation at the base ${monthsNeeded}-month target.`,
      tone: 'neutral' as const,
    },
  ];
  const emergencyNextSteps = [
    { label: 'Check EMI affordability', to: '/calculators/emi' },
    { label: 'Review net worth', to: '/calculators/net-worth' },
  ];
  
  // Calculate total monthly expenses whenever individual expenses change
  useEffect(() => {
    const calculatedTotal = rentMortgage + utilities + groceries + transportation + healthcare + otherEssentials;
    setTotalMonthlyExpenses(calculatedTotal);
  }, [rentMortgage, utilities, groceries, transportation, healthcare, otherEssentials]);
  
  // Calculate recommended emergency fund amount
  const calculateEmergencyFund = () => {
    // Determine months adjustment based on risk factors
    let monthsAdjustment = 0;
    
    // Adjust based on selected risk level
    if (riskLevel === 'low') monthsAdjustment -= 1;
    if (riskLevel === 'high') monthsAdjustment += 1;
    
    // Adjust based on employment stability
    if (employmentStability === 'stable') monthsAdjustment -= 1;
    if (employmentStability === 'unstable') monthsAdjustment += 2;
    
    // Adjust based on dependents
    if (dependents >= 3) monthsAdjustment += 2;
    else if (dependents > 0) monthsAdjustment += 1;
    
    // Calculate adjusted months (minimum 3, maximum 12)
    const calculatedAdjustedMonths = Math.max(3, Math.min(12, monthsNeeded + monthsAdjustment));
    setAdjustedMonths(calculatedAdjustedMonths);
    
    // Calculate recommended fund
    const calculatedRecommendedFund = totalMonthlyExpenses * calculatedAdjustedMonths;
    setRecommendedFund(calculatedRecommendedFund);
    
    // Calculate gap between current savings and recommended fund
    const calculatedFundGap = Math.max(0, calculatedRecommendedFund - currentSavings);
    setFundGap(calculatedFundGap);
    
    // Calculate saving progress as a percentage
    const calculatedProgress = Math.min(100, (currentSavings / calculatedRecommendedFund) * 100);
    setSavingProgress(calculatedProgress);
    
    // Update chart data
    const expenseBreakdown: ChartData[] = [
      { name: 'Rent/Mortgage', value: rentMortgage, color: 'primary' },
      { name: 'Utilities', value: utilities, color: 'secondary' },
      { name: 'Groceries', value: groceries, color: 'emerald' },
      { name: 'Transportation', value: transportation, color: 'amber' },
      { name: 'Healthcare', value: healthcare, color: 'rose' },
      { name: 'Other Essentials', value: otherEssentials, color: 'blue' }
    ];
    
    setChartData(expenseBreakdown);
    setIsCalculated(true);
  };
  
  // Suggestions for building emergency fund
  const getSuggestions = () => {
    let suggestions = [];
    
    if (savingProgress < 25) {
      suggestions = [
        "Start small - aim to save just 5-10% of your income initially",
        "Cut non-essential expenses temporarily to boost savings",
        "Consider a side gig to accelerate your emergency fund savings",
        "Save your tax refunds and work bonuses instead of spending them"
      ];
    } else if (savingProgress < 50) {
      suggestions = [
        "Increase your savings rate to 10-15% of your income",
        "Review and negotiate your bills (phone, internet, insurance)",
        "Look for ways to reduce your biggest expense categories",
        "Set up automatic transfers to your emergency fund account"
      ];
    } else if (savingProgress < 75) {
      suggestions = [
        "You're making good progress! Keep maintaining your savings rate",
        "Consider moving your emergency fund to a high-yield savings account",
        "Reevaluate your emergency fund goal as your expenses change",
        "Start thinking about other financial goals once you reach 100%"
      ];
    } else {
      suggestions = [
        "You're in great shape! Maintain your emergency fund with regular checks",
        "Consider laddering a portion in short-term deposits for better returns",
        "Review your emergency fund amount annually as expenses change",
        "Start allocating additional savings to other financial goals"
      ];
    }
    
    return suggestions;
  };
  
  return (
    <CalculatorLayout
      title="Emergency Fund Calculator"
      description="Calculate how much you should save for unexpected expenses and emergencies to ensure financial security."
      icon={<Umbrella size={24} />}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Form */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Essential Monthly Expenses</h2>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Enter your essential monthly expenses that you would need to cover during an emergency. Include only necessities, not discretionary spending.
          </p>
          
          <FormField label="Housing (Rent/Mortgage)">
            <Input
              type="number"
              value={rentMortgage}
              onChange={(e) => setRentMortgage(Number(e.target.value))}
              placeholder="Enter monthly housing cost"
              min={0}
            />
          </FormField>
          
          <FormField label="Utilities (Electricity, Water, Gas, etc.)">
            <Input
              type="number"
              value={utilities}
              onChange={(e) => setUtilities(Number(e.target.value))}
              placeholder="Enter monthly utilities cost"
              min={0}
            />
          </FormField>
          
          <FormField label="Groceries">
            <Input
              type="number"
              value={groceries}
              onChange={(e) => setGroceries(Number(e.target.value))}
              placeholder="Enter monthly groceries cost"
              min={0}
            />
          </FormField>
          
          <FormField label="Transportation (Fuel, Public Transit)">
            <Input
              type="number"
              value={transportation}
              onChange={(e) => setTransportation(Number(e.target.value))}
              placeholder="Enter monthly transportation cost"
              min={0}
            />
          </FormField>
          
          <FormField label="Healthcare (Insurance, Medications)">
            <Input
              type="number"
              value={healthcare}
              onChange={(e) => setHealthcare(Number(e.target.value))}
              placeholder="Enter monthly healthcare cost"
              min={0}
            />
          </FormField>
          
          <FormField label="Other Essential Expenses">
            <Input
              type="number"
              value={otherEssentials}
              onChange={(e) => setOtherEssentials(Number(e.target.value))}
              placeholder="Enter other essential expenses"
              min={0}
            />
          </FormField>
          
          <hr className="my-6 border-gray-200 dark:border-gray-700" />
          
          <h2 className="text-xl font-semibold mb-4">Personal Factors</h2>
          
          <FormField label="Current Emergency Savings">
            <Input
              type="number"
              value={currentSavings}
              onChange={(e) => setCurrentSavings(Number(e.target.value))}
              placeholder="Enter current emergency savings"
              min={0}
            />
          </FormField>
          
          <FormField label="Base Number of Months to Cover">
            <Input
              type="number"
              value={monthsNeeded}
              onChange={(e) => setMonthsNeeded(Number(e.target.value))}
              placeholder="Enter number of months"
              min={3}
              max={12}
            />
            <div className="text-xs text-gray-500 mt-1">
              Standard recommendation is 3-6 months
            </div>
          </FormField>
          
          <FormField label="Income Stability">
            <Select
              value={employmentStability}
              onChange={(e) => setEmploymentStability(e.target.value as any)}
            >
              <option value="stable">Stable (Government job, tenured position)</option>
              <option value="moderate">Moderate (Standard full-time employment)</option>
              <option value="unstable">Unstable (Freelance, commission-based, contract)</option>
            </Select>
          </FormField>
          
          <FormField label="Personal Risk Level">
            <Select
              value={riskLevel}
              onChange={(e) => setRiskLevel(e.target.value as any)}
            >
              <option value="low">Low (Multiple income sources, low debt)</option>
              <option value="medium">Medium (Average situation)</option>
              <option value="high">High (Specialized job, single income household)</option>
            </Select>
          </FormField>
          
          <FormField label="Number of Dependents">
            <Input
              type="number"
              value={dependents}
              onChange={(e) => setDependents(Number(e.target.value))}
              placeholder="Enter number of dependents"
              min={0}
              max={10}
            />
          </FormField>
          
          <div className="mt-6">
            <Button onClick={calculateEmergencyFund} className="w-full">
              Calculate Emergency Fund <ArrowRight size={16} className="ml-2" />
            </Button>
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
              <h2 className="text-xl font-semibold mb-4">Emergency Fund Summary</h2>
              
              <div className="grid grid-cols-1 gap-4 mb-6">
                <ResultDisplay
                  label="Total Monthly Essential Expenses"
                  value={`₹${totalMonthlyExpenses.toLocaleString('en-IN')}`}
                  icon={<Home className="text-primary-500" />}
                />
                
                <ResultDisplay
                  label={`Recommended Coverage (${adjustedMonths} months)`}
                  value={`₹${recommendedFund.toLocaleString('en-IN')}`}
                  icon={<Umbrella className="text-emerald-500" />}
                />
                
                <ResultDisplay
                  label="Current Emergency Savings"
                  value={`₹${currentSavings.toLocaleString('en-IN')}`}
                  icon={<PiggyBank className="text-blue-500" />}
                />
                
                <ResultDisplay
                  label="Additional Savings Needed"
                  value={`₹${fundGap.toLocaleString('en-IN')}`}
                  icon={<DollarSign className="text-amber-500" />}
                />
              </div>
              
              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Your Progress</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{savingProgress.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${
                      savingProgress < 33 ? 'bg-rose-500' : 
                      savingProgress < 66 ? 'bg-amber-500' : 
                      'bg-emerald-500'
                    }`} 
                    style={{ width: `${savingProgress}%` }}
                  ></div>
                </div>
                <div className="mt-2">
                  <span className={`text-sm ${
                    savingProgress < 33 ? 'text-rose-600 dark:text-rose-400' : 
                    savingProgress < 66 ? 'text-amber-600 dark:text-amber-400' : 
                    'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {savingProgress < 33 ? 'Just starting out' : 
                     savingProgress < 66 ? 'Good progress' : 
                     savingProgress < 100 ? 'Almost there!' : 
                     'Fully funded!'}
                  </span>
                </div>
              </div>
              
              {/* Expense Breakdown Chart */}
              <div className="mt-8">
                <h3 className="text-lg font-medium mb-3">Monthly Expenses Breakdown</h3>
                <div className="h-64">
                  <FinancialChart 
                    data={chartData}
                    title=""
                    type="pie"
                  />
                </div>
              </div>
              
              {/* Savings Suggestions */}
              <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 p-5 rounded-lg">
                <h3 className="text-lg font-medium mb-3 text-blue-800 dark:text-blue-300">
                  Suggestions to Build Your Emergency Fund
                </h3>
                <ul className="space-y-2">
                  {getSuggestions().map((suggestion, index) => (
                    <li key={index} className="flex items-start">
                      <span className="inline-flex items-center justify-center flex-shrink-0 w-5 h-5 mr-2 bg-blue-200 dark:bg-blue-800 rounded-full text-blue-600 dark:text-blue-300 text-xs">
                        {index + 1}
                      </span>
                      <span className="text-sm text-blue-800 dark:text-blue-200">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <ActionableInsights
                summary={emergencySummary}
                insights={emergencyInsights}
                nextSteps={emergencyNextSteps}
              />
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Information Section */}
      <div className="mt-12 bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">About Emergency Funds</h2>
        
        <div className="space-y-4">
          <p>
            <strong>An emergency fund</strong> is a financial safety net designed to cover unexpected expenses or financial surprises without derailing your longer-term financial goals or forcing you into debt.
          </p>
          
          <div>
            <h3 className="font-medium mb-2">Why You Need an Emergency Fund:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Provides financial security during unexpected events (job loss, medical emergencies)</li>
              <li>Reduces the need to rely on high-interest debt during emergencies</li>
              <li>Offers peace of mind and reduces financial stress</li>
              <li>Prevents you from liquidating long-term investments at inopportune times</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Key Considerations:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Accessibility:</strong> Keep your emergency fund in liquid accounts like savings accounts</li>
              <li><strong>Separation:</strong> Maintain your emergency fund separate from your regular checking account</li>
              <li><strong>Regular Review:</strong> Reassess your emergency fund needs as your life circumstances change</li>
              <li><strong>Replenishment:</strong> If you use your emergency fund, make it a priority to rebuild it</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">How Much is Enough?</h3>
            <p>The traditional advice is to save 3-6 months of essential expenses, but your ideal amount depends on:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Income stability and job security</li>
              <li>Number of income earners in your household</li>
              <li>Number of dependents</li>
              <li>Health status and insurance coverage</li>
              <li>Other safety nets available to you</li>
            </ul>
          </div>
          
          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-md">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Important:</strong> Your emergency fund should be kept in a liquid, easily accessible account like a high-yield savings account. While it won't earn as much as investments, the purpose is safety and accessibility, not growth.
            </p>
          </div>
        </div>
      </div>
    </CalculatorLayout>
  );
};

export default EmergencyFundCalculator; 
