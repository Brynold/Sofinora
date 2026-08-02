import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle, Clock, DollarSign, PiggyBank, TrendingUp, User, Target, BarChart2, Shield, Home } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { futureRetirementIncome } from '../utils/planning';
import ShareReportButton from '../components/ShareReportButton';
import { amountToIndianWords } from '../utils/amountWords';

// Typing for assessment questions and responses
interface Question {
  id: string;
  text: string;
  subtext?: string;
  type: 'range' | 'select' | 'number' | 'age';
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  prefix?: string;
  suffix?: string;
  icon: React.ReactNode;
}

interface UserResponses {
  [key: string]: any;
}

// Type for recommendation cards
interface RecommendationCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  actions: string[];
  color: string;
}

const SecureYourFuture: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // State for the assessment
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<UserResponses>({});
  const [completed, setCompleted] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendationCard[]>([]);
  
  // Assessment questions
  const questions: Question[] = [
    {
      id: 'currentAge',
      text: 'What is your current age?',
      subtext: 'Your age helps us determine your time horizon for retirement planning.',
      type: 'age',
      min: 18,
      max: 100,
      icon: <User size={24} />
    },
    {
      id: 'retirementAge',
      text: 'At what age do you plan to retire?',
      subtext: 'This helps us calculate how many years you have to save for retirement.',
      type: 'age',
      min: 45,
      max: 100,
      icon: <Clock size={24} />
    },
    {
      id: 'currentSavings',
      text: 'What are your current retirement savings?',
      subtext: 'Include all retirement accounts such as 401(k), IRA, and other investments.',
      type: 'number',
      prefix: '₹',
      icon: <PiggyBank size={24} />
    },
    {
      id: 'monthlyIncome',
      text: 'What is your monthly income?',
      subtext: 'Your take-home pay after taxes.',
      type: 'number',
      prefix: '₹',
      icon: <DollarSign size={24} />
    },
    {
      id: 'monthlySavings',
      text: 'How much do you save monthly for retirement?',
      subtext: 'Include all contributions to retirement accounts.',
      type: 'number',
      prefix: '₹',
      icon: <PiggyBank size={24} />
    },
    {
      id: 'inflationRate',
      text: 'What inflation rate should we plan for?',
      subtext: 'A long-term assumption of 5–7% is often used for planning. You can adjust it.',
      type: 'number',
      suffix: '%',
      min: 0,
      max: 15,
      icon: <TrendingUp size={24} />
    },
    {
      id: 'riskTolerance',
      text: 'What is your risk tolerance?',
      subtext: 'This helps determine your investment approach.',
      type: 'select',
      options: [
        { value: 'conservative', label: 'Conservative - I prefer stability over high returns' },
        { value: 'moderate', label: 'Moderate - I can tolerate some market fluctuations' },
        { value: 'aggressive', label: 'Aggressive - I can handle significant market volatility' }
      ],
      icon: <BarChart2 size={24} />
    },
    {
      id: 'retirementLifestyle',
      text: 'What lifestyle do you envision in retirement?',
      subtext: 'This helps estimate your retirement expenses.',
      type: 'select',
      options: [
        { value: 'modest', label: 'Modest - Simple living, minimal expenses' },
        { value: 'comfortable', label: 'Comfortable - Similar to current lifestyle' },
        { value: 'luxurious', label: 'Luxurious - Upgraded lifestyle with travel and leisure' }
      ],
      icon: <Home size={24} />
    },
    {
      id: 'healthExpectation',
      text: 'How would you rate your expected healthcare needs in retirement?',
      subtext: 'This helps plan for medical expenses.',
      type: 'select',
      options: [
        { value: 'low', label: 'Low - Generally healthy, minimal expected healthcare costs' },
        { value: 'moderate', label: 'Moderate - Some ongoing medical expenses expected' },
        { value: 'high', label: 'High - Significant healthcare needs anticipated' }
      ],
      icon: <Shield size={24} />
    },
    {
      id: 'financialGoals',
      text: 'What are your top financial goals besides retirement?',
      subtext: 'Select the ones most important to you.',
      type: 'select',
      options: [
        { value: 'homeownership', label: 'Buying a home or upgrading current home' },
        { value: 'education', label: 'Saving for education (self or children)' },
        { value: 'travel', label: 'Extensive travel' },
        { value: 'startBusiness', label: 'Starting a business' },
        { value: 'legacy', label: 'Leaving a legacy/inheritance' }
      ],
      icon: <Target size={24} />
    }
  ];
  
  // Handle input changes
  const handleInputChange = (questionId: string, value: any) => {
    // Only store the raw value without any processing
    setResponses({
      ...responses,
      [questionId]: value
    });
  };
  
  // Move to the next question
  const handleNext = () => {
    if (animating) return;
    
    setAnimating(true);
    setTimeout(() => {
      if (currentStep < questions.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        // Final step, generate recommendations
        generateRecommendations();
        setCompleted(true);
      }
      setAnimating(false);
    }, 500);
  };
  
  // Move to the previous question
  const handlePrevious = () => {
    if (animating || currentStep === 0) return;
    
    setAnimating(true);
    setTimeout(() => {
      setCurrentStep(currentStep - 1);
      setAnimating(false);
    }, 500);
  };
  
  // Restart the assessment
  const restartAssessment = () => {
    setResponses({});
    setCurrentStep(0);
    setCompleted(false);
    setRecommendations([]);
  };
  
  // Generate personalized recommendations based on responses
  const generateRecommendations = () => {
    const newRecommendations: RecommendationCard[] = [];
    
    // Helper function to extract numeric values from text inputs
    const extractNumber = (input: string): number => {
      if (!input) return 0;
      
      // Try direct conversion first
      const directNumber = parseFloat(input);
      if (!isNaN(directNumber)) return directNumber;
      
      // Dictionary for text-based numbers
      const numberWords: {[key: string]: number} = {
        'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
        'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
        'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15,
        'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19, 'twenty': 20,
        'thirty': 30, 'forty': 40, 'fifty': 50, 'sixty': 60, 'seventy': 70,
        'eighty': 80, 'ninety': 90, 'hundred': 100, 'thousand': 1000, 'million': 1000000,
        'lakh': 100000, 'crore': 10000000
      };
      
      // Basic text-to-number conversion
      const lowerInput = input.toLowerCase();
      for (const [word, value] of Object.entries(numberWords)) {
        if (lowerInput.includes(word)) {
          return value; // Simple implementation - returns the first match found
        }
      }
      
      // Extract any numbers from the string using regex
      const matches = lowerInput.match(/\d+/g);
      if (matches && matches.length > 0) {
        return parseFloat(matches[0]);
      }
      
      return 0;
    };
    
    // Calculate years until retirement
    const currentAge = extractNumber(responses.currentAge || '0');
    const retirementAge = extractNumber(responses.retirementAge || '65');
    const yearsUntilRetirement = Math.max(0, retirementAge - currentAge);
    
    // Calculate retirement savings needed (using 4% rule as a simple approximation)
    const monthlyIncome = extractNumber(responses.monthlyIncome || '0');
    const annualIncome = monthlyIncome * 12;
    const desiredReplacementRate = 
      responses.retirementLifestyle === 'modest' ? 0.6 : 
      responses.retirementLifestyle === 'comfortable' ? 0.8 : 0.9;
    
    const inflationRate = Math.max(0, extractNumber(responses.inflationRate || '6')) / 100;
    const annualRetirementIncome = futureRetirementIncome(
      annualIncome,
      desiredReplacementRate,
      inflationRate * 100,
      yearsUntilRetirement,
    );
    const retirementNestegg = annualRetirementIncome * 25; // Using 4% rule
    
    // Current savings and growth
    const currentSavings = extractNumber(responses.currentSavings || '0');
    const monthlySavings = extractNumber(responses.monthlySavings || '0');
    const annualSavings = monthlySavings * 12;
    
    // Estimate growth rate based on risk tolerance
    const growthRate = 
      responses.riskTolerance === 'conservative' ? 0.06 : 
      responses.riskTolerance === 'moderate' ? 0.08 : 0.10;
    
    // Calculate future value of current savings
    const futureValueCurrentSavings = currentSavings * Math.pow(1 + growthRate, yearsUntilRetirement);
    
    // Calculate future value of monthly contributions
    const futureValueMonthlyContributions = 
      annualSavings * (Math.pow(1 + growthRate, yearsUntilRetirement) - 1) / growthRate;
    
    // Total expected retirement savings
    const expectedRetirementSavings = futureValueCurrentSavings + futureValueMonthlyContributions;
    
    // Shortfall or surplus
    const shortfall = retirementNestegg - expectedRetirementSavings;
    
    // Add recommendations based on analysis
    
    // 1. Savings recommendation
    if (shortfall > 0) {
      const additionalMonthlySavingsNeeded = 
        (shortfall * growthRate) / 
        (Math.pow(1 + growthRate, yearsUntilRetirement) - 1) / 12;
      
      newRecommendations.push({
        title: 'Increase Your Retirement Savings',
        description: `Based on your goals, we recommend increasing your monthly retirement contributions by approximately ₹${Math.round(additionalMonthlySavingsNeeded).toLocaleString()} to reach your target retirement savings.`,
        icon: <PiggyBank size={32} />,
        actions: [
          `Set up an automatic transfer of ₹${Math.round(additionalMonthlySavingsNeeded).toLocaleString()} to your retirement accounts each month`,
          'Review and reduce discretionary expenses to free up more money for savings',
          'Consider increasing your income through side gigs or career advancement'
        ],
        color: 'blue'
      });
    } else {
      newRecommendations.push({
        title: 'You\'re On Track for Retirement',
        description: `Your current savings rate of ₹${monthlySavings.toLocaleString()} per month is sufficient to meet your retirement goals. Keep up the good work!`,
        icon: <CheckCircle size={32} />,
        actions: [
          'Continue your current savings rate',
          'Consider diversifying your investments to reduce risk',
          'Regularly review your retirement plan to ensure you stay on track'
        ],
        color: 'green'
      });
    }
    
    // 2. Investment strategy recommendation
    const investmentRec = {
      title: 'Optimize Your Investment Strategy',
      description: `Based on your ${responses.riskTolerance} risk tolerance and ${yearsUntilRetirement} years until retirement, we recommend the following asset allocation:`,
      icon: <TrendingUp size={32} />,
      actions: [] as string[],
      color: 'purple'
    };
    
    if (responses.riskTolerance === 'conservative') {
      investmentRec.actions = [
        '50-60% in bonds and fixed income',
        '30-40% in large-cap stocks',
        '5-10% in international stocks',
        '5% in cash or money market funds'
      ];
    } else if (responses.riskTolerance === 'moderate') {
      investmentRec.actions = [
        '30-40% in bonds and fixed income',
        '40-50% in large-cap stocks',
        '10-15% in small-cap and mid-cap stocks',
        '10-15% in international stocks'
      ];
    } else {
      investmentRec.actions = [
        '10-20% in bonds and fixed income',
        '40-50% in large-cap stocks',
        '20-25% in small-cap and mid-cap stocks',
        '15-20% in international stocks',
        '0-5% in alternative investments'
      ];
    }
    
    newRecommendations.push(investmentRec);
    
    // 3. Timeline recommendation
    const timelineSteps = [];
    
    if (yearsUntilRetirement > 20) {
      timelineSteps.push('Focus on maximizing growth through higher equity allocation');
      timelineSteps.push('Consider tax-advantaged investment vehicles');
      timelineSteps.push('Build emergency fund of 3-6 months expenses');
    } else if (yearsUntilRetirement > 10) {
      timelineSteps.push('Begin shifting towards more conservative investments');
      timelineSteps.push('Increase contributions to catch up if needed');
      timelineSteps.push('Review insurance coverage');
    } else {
      timelineSteps.push('Shift significantly towards capital preservation');
      timelineSteps.push('Develop a retirement income strategy');
      timelineSteps.push('Consider healthcare costs and coverage options');
    }
    
    newRecommendations.push({
      title: 'Your Retirement Timeline',
      description: `With ${yearsUntilRetirement} years until your planned retirement, here are your key action items:`,
      icon: <Clock size={32} />,
      actions: timelineSteps,
      color: 'amber'
    });
    
    // 4. Additional financial goals recommendation
    const goalRec = {
      title: 'Balancing Retirement with Other Goals',
      description: 'Here\'s how to balance your retirement savings with your other financial goals:',
      icon: <Target size={32} />,
      actions: [] as string[],
      color: 'pink'
    };
    
    if (responses.financialGoals === 'homeownership') {
      goalRec.actions = [
        'Aim to keep mortgage payments under 28% of your gross monthly income',
        'Save separately for home down payment without reducing retirement contributions',
        'Consider a slightly longer mortgage term to maintain retirement savings rate'
      ];
    } else if (responses.financialGoals === 'education') {
      goalRec.actions = [
        'Prioritize retirement savings over education funding (children can get loans, you cannot for retirement)',
        'Look into tax-advantaged education savings accounts',
        'Research scholarships, grants and work-study options'
      ];
    } else if (responses.financialGoals === 'travel') {
      goalRec.actions = [
        'Create a separate travel fund with automatic contributions',
        'Consider travel rewards credit cards to maximize points',
        'Look into travel during off-peak seasons to reduce costs'
      ];
    } else if (responses.financialGoals === 'startBusiness') {
      goalRec.actions = [
        'Create a separate business startup fund',
        'Consider starting your business as a side hustle before full commitment',
        'Explore low-cost business models to minimize impact on retirement savings'
      ];
    } else if (responses.financialGoals === 'legacy') {
      goalRec.actions = [
        'Consult with an estate planning attorney',
        'Consider life insurance as a wealth transfer tool',
        'Look into establishing a trust for more control over asset distribution'
      ];
    }
    
    if (goalRec.actions.length > 0) {
      newRecommendations.push(goalRec);
    }
    
    setRecommendations(newRecommendations);
  };
  
  // Current question
  const currentQuestion = questions[currentStep];
  
  // Check if the current question has been answered
  const isCurrentQuestionAnswered = () => {
    if (!currentQuestion) return false;
    
    const response = responses[currentQuestion.id];
    
    // Any non-empty input is considered valid for all question types
    return response !== undefined && response !== null && response !== '';
  };
  
  // Get response percent for progress indicator
  const getResponsePercent = () => {
    const answeredQuestions = Object.keys(responses).length;
    return Math.round((answeredQuestions / questions.length) * 100);
  };
  
  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        type: "spring", 
        stiffness: 100, 
        damping: 15 
      }
    },
    exit: { 
      opacity: 0, 
      x: -50,
      transition: { 
        ease: "easeOut", 
        duration: 0.3
      }
    }
  };
  
  const resultCardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({ 
      opacity: 1, 
      y: 0,
      transition: { 
        delay: i * 0.2,
        duration: 0.5
      }
    })
  };
  
  const backgroundVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };
  
  // Particles for background animation
  const Particles = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full ${isDark ? 'bg-primary-600/10' : 'bg-primary-500/10'}`}
          initial={{ opacity: 0 }}
          animate={{
            x: [
              Math.random() * 100 - 50,
              Math.random() * 100 - 50,
              Math.random() * 100 - 50,
            ],
            y: [
              Math.random() * 100 - 50,
              Math.random() * 100 - 50,
              Math.random() * 100 - 50,
            ],
            scale: [Math.random() * 0.5 + 0.5, Math.random() * 0.5 + 1, Math.random() * 0.5 + 0.5],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: Math.random() * 20 + 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 50 + 20}px`,
            height: `${Math.random() * 50 + 20}px`,
          }}
        />
      ))}
    </div>
  );
  
  // Determine background color class based on current question (for gradient effect)
  const getBackgroundColorClass = () => {
    const colorClasses = [
      'from-blue-500/10 to-purple-500/5',
      'from-purple-500/10 to-pink-500/5',
      'from-pink-500/10 to-red-500/5',
      'from-red-500/10 to-orange-500/5',
      'from-orange-500/10 to-amber-500/5',
      'from-amber-500/10 to-yellow-500/5',
      'from-yellow-500/10 to-lime-500/5',
      'from-lime-500/10 to-green-500/5',
      'from-green-500/10 to-emerald-500/5',
    ];
    
    return colorClasses[currentStep % colorClasses.length];
  };
  
  // Question Input Component
  const QuestionInput = ({ question }: { question: Question }) => {
    switch (question.type) {
      case 'age':
        return (
          <div className="w-full">
            <input
              key={`age-input-${question.id}`}
              type="text" 
              autoFocus
              value={responses[question.id] || ''}
              onInput={(e) => {
                const target = e.target as HTMLInputElement;
                setResponses({
                  ...responses,
                  [question.id]: target.value
                });
              }}
              className={`w-full px-4 py-3 text-lg rounded-lg ${
                isDark 
                  ? 'bg-dark-card border-dark-border text-white' 
                  : 'bg-white border-gray-200 text-gray-800'
              } border focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all`}
              placeholder="Enter your age (e.g. 35 or thirty five)"
            />
          </div>
        );
      
      case 'number':
        const numericAmount = Number(String(responses[question.id] || '').replace(/,/g, ''));
        const amountWords = question.prefix === '₹' && Number.isFinite(numericAmount) && numericAmount >= 0
          ? amountToIndianWords(numericAmount)
          : '';
        return (
          <div className="w-full">
            <div className="relative">
              {question.prefix && (
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  {question.prefix}
                </div>
              )}
              <input
                key={`number-input-${question.id}`}
                type="text"
                inputMode="decimal"
                autoFocus
                value={responses[question.id] || ''}
                onInput={(e) => {
                  const target = e.target as HTMLInputElement;
                  setResponses({
                    ...responses,
                    [question.id]: target.value
                  });
                }}
                className={`w-full px-4 py-3 ${question.prefix ? 'pl-8' : ''} text-lg rounded-lg ${
                  isDark
                    ? 'bg-dark-card border-dark-border text-white'
                    : 'bg-white border-gray-200 text-gray-800'
                } border focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all`}
                placeholder="Enter amount"
              />
            </div>
            {amountWords && (
              <p className={`mt-2 text-sm ${isDark ? 'text-cyan-200/80' : 'text-cyan-700'}`} aria-live="polite">
                In words: {amountWords}
              </p>
            )}
          </div>
        );
      
      case 'select':
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <div
                key={option.value}
                onClick={() => handleInputChange(question.id, option.value)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  responses[question.id] === option.value
                    ? isDark 
                      ? 'bg-primary-900/30 border-primary-700 text-primary-300' 
                      : 'bg-primary-50 border-primary-200 text-primary-700'
                    : isDark 
                      ? 'bg-dark-card border-dark-border text-gray-300 hover:bg-dark-700' 
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <div className={`mr-3 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    responses[question.id] === option.value
                      ? isDark 
                        ? 'border-primary-400' 
                        : 'border-primary-500'
                      : isDark 
                        ? 'border-gray-600' 
                        : 'border-gray-300'
                  }`}>
                    {responses[question.id] === option.value && (
                      <div className={`w-2.5 h-2.5 rounded-full ${
                        isDark ? 'bg-primary-400' : 'bg-primary-500'
                      }`}></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${
                      responses[question.id] === option.value
                        ? isDark ? 'text-primary-300' : 'text-primary-700'
                        : ''
                    }`}>{option.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className={`min-h-screen ${isDark ? 'bg-dark-bg text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="relative overflow-hidden">
        {/* Animated background particles */}
        <Particles />
        
        {/* Main content container */}
        <div className="container mx-auto px-4 py-4 pt-16 max-w-5xl relative z-10">
          {!completed ? (
            <>
              {/* Assessment header */}
              <div className="mb-6 text-center">
                <motion.h1 
                  className="text-3xl md:text-4xl font-bold mb-4"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  Secure Your Financial Future
                </motion.h1>
                <motion.p 
                  className={`text-lg md:text-xl ${isDark ? 'text-gray-300' : 'text-gray-600'} max-w-3xl mx-auto`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  Answer a few questions to receive personalized recommendations for achieving financial freedom in retirement.
                </motion.p>
              </div>
              
              {/* Progress indicator */}
              <div className="mb-8">
                <div className="flex justify-between text-sm mb-2">
                  <span>{currentStep + 1} of {questions.length}</span>
                  <span>{getResponsePercent()}% Complete</span>
                </div>
                <div className={`h-2 w-full rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <motion.div 
                    className="h-full rounded-full bg-primary-500"
                    initial={{ width: `${((currentStep) / questions.length) * 100}%` }}
                    animate={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
              
              {/* Question card */}
              <motion.div 
                className={`rounded-2xl shadow-xl overflow-hidden mb-8`}
                variants={backgroundVariants}
                initial="hidden"
                animate="visible"
              >
                <div className={`bg-gradient-to-br ${getBackgroundColorClass()} p-0.5`}>
                  <div className={`${isDark ? 'bg-dark-card' : 'bg-white'} rounded-xl p-8`}>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentStep}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="min-h-[350px] flex flex-col"
                      >
                        {/* Question header */}
                        <div className="mb-8">
                          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${
                            isDark ? 'bg-primary-900/30 text-primary-400' : 'bg-primary-100 text-primary-600'
                          } mb-4`}>
                            {currentQuestion.icon}
                          </div>
                          <h2 className="text-2xl font-semibold mb-2">{currentQuestion.text}</h2>
                          {currentQuestion.subtext && (
                            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{currentQuestion.subtext}</p>
                          )}
                        </div>
                        
                        {/* Question input */}
                        <div className="flex-grow mb-8">
                          <QuestionInput question={currentQuestion} />
                        </div>
                        
                        {/* Navigation buttons */}
                        <div className="flex justify-between items-center">
                          <button
                            onClick={handlePrevious}
                            disabled={currentStep === 0}
                            className={`px-6 py-3 rounded-lg ${
                              currentStep === 0
                                ? isDark ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            } transition-colors`}
                          >
                            Previous
                          </button>
                          
                          <motion.button
                            onClick={handleNext}
                            disabled={!isCurrentQuestionAnswered()}
                            className={`px-6 py-3 rounded-lg flex items-center ${
                              !isCurrentQuestionAnswered()
                                ? isDark ? 'bg-primary-900/30 text-primary-700 cursor-not-allowed' : 'bg-primary-100 text-primary-300 cursor-not-allowed'
                                : isDark ? 'bg-primary-600 text-white hover:bg-primary-500' : 'bg-primary-600 text-white hover:bg-primary-500'
                            } transition-colors`}
                            whileHover={isCurrentQuestionAnswered() ? { scale: 1.05 } : {}}
                            whileTap={isCurrentQuestionAnswered() ? { scale: 0.95 } : {}}
                          >
                            {currentStep === questions.length - 1 ? 'Complete' : 'Next'}
                            <ArrowRight size={18} className="ml-2" />
                          </motion.button>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            </>
          ) : (
            <>
              {/* Results header */}
              <motion.div 
                className="mb-8 text-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-3xl md:text-4xl font-bold mb-4">Your Personalized Financial Plan</h1>
                <p className={`text-lg md:text-xl ${isDark ? 'text-gray-300' : 'text-gray-600'} max-w-3xl mx-auto mb-8`}>
                  Based on your responses, we've created a comprehensive plan to help you achieve financial freedom for retirement.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <ShareReportButton
                    summary="This personalized financial plan was created from my retirement goals, savings, income, and risk preferences."
                    details={recommendations.map((recommendation) => `${recommendation.title}: ${recommendation.description}`)}
                  />
                  <motion.button
                    onClick={restartAssessment}
                    className={`px-6 py-2 rounded-full ${
                      isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } transition-colors`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Restart Assessment
                  </motion.button>
                </div>
              </motion.div>
              
              {/* Results cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {recommendations.map((recommendation, index) => (
                  <motion.div
                    key={index}
                    custom={index}
                    variants={resultCardVariants}
                    initial="hidden"
                    animate="visible"
                    className={`rounded-2xl shadow-xl overflow-hidden`}
                  >
                    <div className={`bg-gradient-to-br ${
                      recommendation.color === 'blue' ? 'from-blue-500/20 to-blue-600/5' :
                      recommendation.color === 'green' ? 'from-green-500/20 to-green-600/5' :
                      recommendation.color === 'purple' ? 'from-purple-500/20 to-purple-600/5' :
                      recommendation.color === 'amber' ? 'from-amber-500/20 to-amber-600/5' :
                      'from-pink-500/20 to-pink-600/5'
                    } p-0.5`}>
                      <div className={`${isDark ? 'bg-dark-card' : 'bg-white'} rounded-xl p-6`}>
                        <div className="flex items-start gap-4 mb-4">
                          <div className={`p-3 rounded-xl ${
                            recommendation.color === 'blue' ? isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600' :
                            recommendation.color === 'green' ? isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-600' :
                            recommendation.color === 'purple' ? isDark ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-600' :
                            recommendation.color === 'amber' ? isDark ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-100 text-amber-600' :
                            isDark ? 'bg-pink-900/30 text-pink-400' : 'bg-pink-100 text-pink-600'
                          } flex-shrink-0`}>
                            {recommendation.icon}
                          </div>
                          <div>
                            <h3 className={`text-xl font-semibold mb-1 ${
                              recommendation.color === 'blue' ? isDark ? 'text-blue-400' : 'text-blue-600' :
                              recommendation.color === 'green' ? isDark ? 'text-green-400' : 'text-green-600' :
                              recommendation.color === 'purple' ? isDark ? 'text-purple-400' : 'text-purple-600' :
                              recommendation.color === 'amber' ? isDark ? 'text-amber-400' : 'text-amber-600' :
                              isDark ? 'text-pink-400' : 'text-pink-600'
                            }`}>
                              {recommendation.title}
                            </h3>
                            <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              {recommendation.description}
                            </p>
                          </div>
                        </div>
                        
                        <ul className={`mt-4 space-y-2 ${isDark ? 'bg-dark-700/40' : 'bg-gray-50'} rounded-lg p-4`}>
                          {recommendation.actions.map((action, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className={`mt-1 ${
                                recommendation.color === 'blue' ? isDark ? 'text-blue-400' : 'text-blue-600' :
                                recommendation.color === 'green' ? isDark ? 'text-green-400' : 'text-green-600' :
                                recommendation.color === 'purple' ? isDark ? 'text-purple-400' : 'text-purple-600' :
                                recommendation.color === 'amber' ? isDark ? 'text-amber-400' : 'text-amber-600' :
                                isDark ? 'text-pink-400' : 'text-pink-600'
                              }`}>•</span>
                              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Call to action */}
              <motion.div 
                className={`mt-12 p-6 rounded-2xl ${
                  isDark ? 'bg-primary-900/20 border border-primary-800/50' : 'bg-primary-50 border border-primary-100'
                } text-center`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-primary-300' : 'text-primary-700'}`}>
                  Take Action on Your Financial Plan
                </h3>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
                  Your personalized retirement plan is ready. Explore our calculators to put these recommendations into action.
                </p>
                <motion.button
                  className={`px-6 py-3 rounded-lg ${
                    isDark ? 'bg-primary-600 text-white hover:bg-primary-500' : 'bg-primary-600 text-white hover:bg-primary-500'
                  } transition-colors mx-auto`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.location.href = '/'}
                >
                  Explore Financial Calculators
                </motion.button>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecureYourFuture; 
