import React, { useState } from 'react';
import { Home, Building, Map, CreditCard, Calculator, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import CalculatorLayout from '../components/CalculatorLayout';
import { FormField, Input, Button, ResultDisplay } from '../components/CalculatorForm';
import ActionableInsights from '../components/ActionableInsights';
import { useTheme } from '../context/ThemeContext';
import { formatCurrencyINR } from '../utils/finance';
import { calculateHRAExemption } from '../utils/planning';

const HRACalculator: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // State variables
  const [basicSalary, setBasicSalary] = useState<number>(50000);
  const [dearnessAllowance, setDearnessAllowance] = useState<number>(0);
  const [hraReceived, setHraReceived] = useState<number>(20000);
  const [rentPaid, setRentPaid] = useState<number>(25000);
  const [isMetroCity, setIsMetroCity] = useState<boolean>(true);
  const [showResults, setShowResults] = useState<boolean>(false);
  
  // Results
  const [exemptedHRA, setExemptedHRA] = useState<number>(0);
  const [taxableHRA, setTaxableHRA] = useState<number>(0);
  const salaryForHRA = basicSalary + dearnessAllowance;
  const rentEligibility = Math.max(0, rentPaid - salaryForHRA * 0.1);
  const exemptedShare = hraReceived > 0 ? (exemptedHRA / hraReceived) * 100 : 0;
  const hraSummary = `Out of ${formatCurrencyINR(hraReceived)} of monthly HRA, about ${formatCurrencyINR(exemptedHRA)} is exempt and ${formatCurrencyINR(taxableHRA)} remains taxable with the current salary, rent, and city inputs.`;
  const hraInsights = [
    {
      title: 'Claim efficiency',
      detail: hraReceived > 0
        ? `${exemptedShare.toFixed(1)}% of your HRA is currently tax-exempt. Higher rent support or stronger salary structure can improve this only within tax-rule limits.`
        : 'You need some HRA in your salary structure before exemption can apply.',
      tone: exemptedShare >= 75 ? 'positive' as const : exemptedShare >= 40 ? 'neutral' as const : 'caution' as const,
    },
    {
      title: 'Rent test',
      detail: `Rent minus 10% of eligible salary comes to ${formatCurrencyINR(rentEligibility)} per month. If this number is low, it becomes the main cap on your exemption.`,
      tone: rentEligibility > 0 ? 'neutral' as const : 'caution' as const,
    },
    {
      title: 'Annual impact',
      detail: `On a yearly view, about ${formatCurrencyINR(exemptedHRA * 12)} stays exempt while ${formatCurrencyINR(taxableHRA * 12)} gets added to taxable salary.`,
      tone: 'action' as const,
    },
  ];
  const hraNextSteps = [
    { label: 'Track net worth', to: '/calculators/net-worth' },
    { label: 'Build emergency fund', to: '/calculators/emergency-fund' },
  ];
  
  // Calculate HRA exemption
  const calculateHRA = () => {
    // Per Income Tax Act, HRA exemption is the least of:
    // 1. Actual HRA received
    // 2. Rent paid minus 10% of basic salary
    // 3. 50% of basic salary (for metro cities) or 40% of basic salary (for non-metro cities)
    
    const result = calculateHRAExemption({ basicSalary, dearnessAllowance, hraReceived, rentPaid, isMetroCity });
    setExemptedHRA(Math.round(result.exemptedHRA));
    setTaxableHRA(Math.round(result.taxableHRA));
    setShowResults(true);
  };
  
  return (
    <CalculatorLayout
      title="HRA Calculator"
      description="Calculate your House Rent Allowance tax exemption accurately with our HRA calculator. Find out how much of your HRA is tax-free based on your salary, rent, and city."
      icon={<Home size={24} />}
    >
      <div className="space-y-6">
        <motion.div 
          className={`rounded-lg p-4 border ${isDark ? 'bg-primary-900/30 border-primary-800' : 'bg-blue-50 border-blue-100'}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p className={`text-sm ${isDark ? 'text-primary-100' : 'text-blue-800'}`}>
            <strong>Old-regime tax estimate:</strong> HRA exemption is generally unavailable under the new tax regime. Keep rent evidence and verify eligibility for the financial year before filing.
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
              <CreditCard size={18} />
              <h3 className="font-medium">Salary Details</h3>
            </div>
            
            <FormField label="Basic Salary (Monthly)">
              <Input
                type="number"
                prefix="₹"
                value={basicSalary}
                onChange={(e) => setBasicSalary(Number(e.target.value))}
                placeholder="Enter basic salary amount"
                min="1"
              />
            </FormField>

            <FormField
              label="Dearness Allowance for retirement benefits (Monthly)"
              hint="Enter only DA that forms part of retirement benefits. Leave as zero if not applicable."
            >
              <Input
                type="number"
                prefix="₹"
                value={dearnessAllowance}
                onChange={(e) => setDearnessAllowance(Math.max(0, Number(e.target.value)))}
                min="0"
                step="500"
              />
            </FormField>
            
            <FormField label="HRA Received (Monthly)">
              <Input
                type="number"
                prefix="₹"
                value={hraReceived}
                onChange={(e) => setHraReceived(Number(e.target.value))}
                placeholder="Enter HRA received"
                min="0"
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
              <Building2 size={18} />
              <h3 className="font-medium">Rent & Location</h3>
            </div>
            
            <FormField label="Rent Paid (Monthly)">
              <Input
                type="number"
                prefix="₹"
                value={rentPaid}
                onChange={(e) => setRentPaid(Number(e.target.value))}
                placeholder="Enter rent paid"
                min="0"
              />
            </FormField>
            
            <FormField label="City Type">
              <div className="grid grid-cols-2 gap-3 mt-1">
                <motion.div
                  onClick={() => setIsMetroCity(true)}
                  className={`cursor-pointer rounded-lg p-3 text-center text-sm transition-all ${
                    isMetroCity
                      ? isDark 
                        ? 'bg-primary-900 text-primary-100 border-2 border-primary-700 font-medium'
                        : 'bg-primary-100 text-primary-700 border-2 border-primary-300 font-medium'
                      : isDark
                        ? 'bg-dark-border text-gray-300 border border-dark-border hover:bg-dark-border/80'
                        : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex flex-col items-center justify-center gap-1">
                    <Building size={16} />
                    <span>Metro City</span>
                    <span className="text-xs opacity-70">(Delhi, Mumbai, Chennai, Kolkata)</span>
                  </div>
                </motion.div>
                
                <motion.div
                  onClick={() => setIsMetroCity(false)}
                  className={`cursor-pointer rounded-lg p-3 text-center text-sm transition-all ${
                    !isMetroCity
                      ? isDark 
                        ? 'bg-primary-900 text-primary-100 border-2 border-primary-700 font-medium'
                        : 'bg-primary-100 text-primary-700 border-2 border-primary-300 font-medium'
                      : isDark
                        ? 'bg-dark-border text-gray-300 border border-dark-border hover:bg-dark-border/80'
                        : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex flex-col items-center justify-center gap-1">
                    <Map size={16} />
                    <span>Non-Metro City</span>
                    <span className="text-xs opacity-70">(All other cities)</span>
                  </div>
                </motion.div>
              </div>
            </FormField>
          </motion.div>
        </div>

        <div className="flex justify-center mt-6">
          <Button onClick={calculateHRA} className="px-8">
            Calculate HRA Exemption
          </Button>
        </div>

        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <ResultDisplay
                label="Exempted HRA"
                value={`₹${exemptedHRA.toLocaleString()}`}
                subtext="Not taxable"
                icon={<Home size={20} />}
                iconBgColor={isDark ? 'bg-emerald-900/30' : 'bg-emerald-100'}
                iconColor={isDark ? 'text-emerald-400' : 'text-emerald-600'}
              />
              
              <ResultDisplay
                label="Taxable HRA"
                value={`₹${taxableHRA.toLocaleString()}`}
                subtext="Added to your income"
                icon={<Calculator size={20} />}
                iconBgColor={isDark ? 'bg-orange-900/30' : 'bg-orange-100'}
                iconColor={isDark ? 'text-orange-400' : 'text-orange-600'}
              />
              
              <ResultDisplay
                label="Total HRA Received"
                value={`₹${hraReceived.toLocaleString()}`}
                subtext="Monthly amount"
                icon={<CreditCard size={20} />}
                iconBgColor={isDark ? 'bg-blue-900/30' : 'bg-blue-100'}
                iconColor={isDark ? 'text-blue-400' : 'text-blue-600'}
              />
            </div>

            <motion.div 
              className={`mt-6 rounded-lg p-5 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <h3 className={`text-lg font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>HRA Calculation Details</h3>
              
              <div className="space-y-3">
                <div className={`flex justify-between py-2 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Actual HRA Received</span>
                  <span className={isDark ? 'text-white font-medium' : 'text-gray-800 font-medium'}>₹{hraReceived.toLocaleString()}</span>
                </div>
                
                <div className={`flex justify-between py-2 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Rent Paid - 10% of Basic Salary</span>
                  <span className={isDark ? 'text-white font-medium' : 'text-gray-800 font-medium'}>₹{Math.max(0, rentPaid - basicSalary * 0.1).toLocaleString()}</span>
                </div>
                
                <div className={`flex justify-between py-2 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                    {isMetroCity ? '50% of Basic Salary (Metro)' : '40% of Basic Salary (Non-Metro)'}
                  </span>
                  <span className={isDark ? 'text-white font-medium' : 'text-gray-800 font-medium'}>
                    ₹{(basicSalary * (isMetroCity ? 0.5 : 0.4)).toLocaleString()}
                  </span>
                </div>
                
                <div className={`flex justify-between py-2 ${isDark ? 'text-emerald-400' : 'text-emerald-600'} font-medium`}>
                  <span>Exempted HRA (Minimum of the above three)</span>
                  <span>₹{exemptedHRA.toLocaleString()}</span>
                </div>
              </div>
            </motion.div>

            <ActionableInsights
              title="Use This HRA Result"
              summary={hraSummary}
              insights={hraInsights}
              nextSteps={hraNextSteps}
            />
            
            <motion.div 
              className={`mt-6 rounded-lg p-4 border ${isDark ? 'bg-primary-900/20 border-primary-800/50' : 'bg-blue-50 border-blue-100'}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h4 className={`font-medium mb-2 ${isDark ? 'text-primary-300' : 'text-blue-700'}`}>Important Note:</h4>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                This calculation is based on monthly figures. For annual tax calculations, multiply the monthly values by 12.
                Remember that HRA exemption is only available if you're living in a rented accommodation and paying rent.
              </p>
            </motion.div>
          </motion.div>
        )}
      </div>
    </CalculatorLayout>
  );
};

export default HRACalculator; 
