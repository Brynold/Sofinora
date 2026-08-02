import { annualRateToNominalMonthlyRate, calculateMonthlyLoanPayment } from './finance';

export interface ProjectionPoint {
  year: number;
  value: number;
}

export interface StepUpSipResult {
  invested: number;
  maturity: number;
  returns: number;
  flatSipMaturity: number;
  yearly: ProjectionPoint[];
}

export const calculateStepUpSip = (
  monthlyInvestment: number,
  annualStepUpPercent: number,
  annualReturnPercent: number,
  years: number,
): StepUpSipResult => {
  const months = Math.max(0, Math.round(years * 12));
  const monthlyRate = annualRateToNominalMonthlyRate(annualReturnPercent);
  let balance = 0;
  let flatBalance = 0;
  let invested = 0;
  const yearly: ProjectionPoint[] = [];

  for (let month = 0; month < months; month += 1) {
    const completedYears = Math.floor(month / 12);
    const steppedContribution = monthlyInvestment * Math.pow(1 + annualStepUpPercent / 100, completedYears);
    balance = (balance + steppedContribution) * (1 + monthlyRate);
    flatBalance = (flatBalance + monthlyInvestment) * (1 + monthlyRate);
    invested += steppedContribution;
    if ((month + 1) % 12 === 0) yearly.push({ year: (month + 1) / 12, value: Math.round(balance) });
  }

  return {
    invested: Math.round(invested),
    maturity: Math.round(balance),
    returns: Math.round(balance - invested),
    flatSipMaturity: Math.round(flatBalance),
    yearly,
  };
};

export interface LoanPrepaymentResult {
  emi: number;
  originalInterest: number;
  revisedInterest: number;
  interestSaved: number;
  monthsSaved: number;
  revisedMonths: number;
  yearly: ProjectionPoint[];
}

export const calculateLoanPrepayment = (
  principal: number,
  annualRatePercent: number,
  years: number,
  oneTimePrepayment: number,
  prepaymentAfterYears: number,
  extraMonthlyPayment: number,
): LoanPrepaymentResult => {
  const originalMonths = Math.max(1, Math.round(years * 12));
  const monthlyRate = annualRateToNominalMonthlyRate(annualRatePercent);
  const emi = calculateMonthlyLoanPayment(principal, annualRatePercent, originalMonths);
  const originalInterest = emi * originalMonths - principal;
  const prepaymentMonth = Math.max(1, Math.round(prepaymentAfterYears * 12));
  let balance = principal;
  let interestPaid = 0;
  let month = 0;
  const yearly: ProjectionPoint[] = [];
  const maximumMonths = originalMonths * 2;

  while (balance > 0.01 && month < maximumMonths) {
    month += 1;
    const interest = balance * monthlyRate;
    interestPaid += interest;
    balance += interest;
    const payment = Math.min(balance, emi + Math.max(0, extraMonthlyPayment));
    balance -= payment;
    if (month === prepaymentMonth && balance > 0) balance = Math.max(0, balance - Math.max(0, oneTimePrepayment));
    if (month % 12 === 0 || balance <= 0.01) yearly.push({ year: month / 12, value: Math.max(0, Math.round(balance)) });
  }

  return {
    emi: Math.round(emi),
    originalInterest: Math.round(originalInterest),
    revisedInterest: Math.round(interestPaid),
    interestSaved: Math.max(0, Math.round(originalInterest - interestPaid)),
    monthsSaved: Math.max(0, originalMonths - month),
    revisedMonths: month,
    yearly,
  };
};

export interface SwpResult {
  endingBalance: number;
  totalWithdrawn: number;
  estimatedEarnings: number;
  depletionMonth: number | null;
  yearly: ProjectionPoint[];
}

export const calculateSwp = (
  initialInvestment: number,
  monthlyWithdrawal: number,
  annualReturnPercent: number,
  years: number,
  annualWithdrawalIncreasePercent: number,
): SwpResult => {
  const totalMonths = Math.max(0, Math.round(years * 12));
  const monthlyRate = annualRateToNominalMonthlyRate(annualReturnPercent);
  let balance = initialInvestment;
  let totalWithdrawn = 0;
  let depletionMonth: number | null = null;
  const yearly: ProjectionPoint[] = [];

  for (let month = 0; month < totalMonths; month += 1) {
    const completedYears = Math.floor(month / 12);
    const plannedWithdrawal = monthlyWithdrawal * Math.pow(1 + annualWithdrawalIncreasePercent / 100, completedYears);
    const actualWithdrawal = Math.min(balance, plannedWithdrawal);
    balance -= actualWithdrawal;
    totalWithdrawn += actualWithdrawal;
    balance *= 1 + monthlyRate;
    if (balance <= 0.01 && depletionMonth === null) depletionMonth = month + 1;
    if ((month + 1) % 12 === 0 || depletionMonth === month + 1) {
      yearly.push({ year: (month + 1) / 12, value: Math.max(0, Math.round(balance)) });
    }
    if (depletionMonth !== null) break;
  }

  return {
    endingBalance: Math.max(0, Math.round(balance)),
    totalWithdrawn: Math.round(totalWithdrawn),
    estimatedEarnings: Math.round(balance + totalWithdrawn - initialInvestment),
    depletionMonth,
    yearly,
  };
};

type Slab = [limit: number, rate: number];

const taxFromSlabs = (income: number, slabs: Slab[]): number => {
  let tax = 0;
  let previousLimit = 0;
  for (const [limit, rate] of slabs) {
    const taxableInSlab = Math.max(0, Math.min(income, limit) - previousLimit);
    tax += taxableInSlab * rate;
    previousLimit = limit;
    if (income <= limit) break;
  }
  return tax;
};

export interface TaxComparisonResult {
  oldTaxableIncome: number;
  newTaxableIncome: number;
  oldTax: number;
  newTax: number;
  recommended: 'old' | 'new' | 'equal';
  savings: number;
}

export const calculateSalaryTaxComparison = (
  grossSalary: number,
  oldRegimeDeductions: number,
): TaxComparisonResult => {
  const oldTaxableIncome = Math.max(0, grossSalary - 50_000 - Math.max(0, oldRegimeDeductions));
  const newTaxableIncome = Math.max(0, grossSalary - 75_000);
  let oldTax = taxFromSlabs(oldTaxableIncome, [[250_000, 0], [500_000, 0.05], [1_000_000, 0.2], [Infinity, 0.3]]);
  let newTax = taxFromSlabs(newTaxableIncome, [[400_000, 0], [800_000, 0.05], [1_200_000, 0.1], [1_600_000, 0.15], [2_000_000, 0.2], [2_400_000, 0.25], [Infinity, 0.3]]);

  if (oldTaxableIncome <= 500_000) oldTax = Math.max(0, oldTax - Math.min(oldTax, 12_500));
  if (newTaxableIncome <= 1_200_000) newTax = 0;
  else newTax = Math.min(newTax, newTaxableIncome - 1_200_000); // marginal relief near the rebate threshold

  oldTax = Math.round(oldTax * 1.04);
  newTax = Math.round(newTax * 1.04);
  const recommended = oldTax === newTax ? 'equal' : oldTax < newTax ? 'old' : 'new';

  return {
    oldTaxableIncome: Math.round(oldTaxableIncome),
    newTaxableIncome: Math.round(newTaxableIncome),
    oldTax,
    newTax,
    recommended,
    savings: Math.abs(oldTax - newTax),
  };
};

export interface YouTubeEarningsResult {
  low: number;
  expected: number;
  high: number;
  annualExpected: number;
  youtubeRevenue: number;
  additionalIncome: number;
}

export const estimateYouTubeEarnings = (
  monthlyViews: number,
  lowRpm: number,
  expectedRpm: number,
  highRpm: number,
  additionalMonthlyIncome: number,
): YouTubeEarningsResult => {
  const viewUnits = Math.max(0, monthlyViews) / 1_000;
  const additionalIncome = Math.max(0, additionalMonthlyIncome);
  const low = viewUnits * Math.max(0, lowRpm) + additionalIncome;
  const expectedYouTubeRevenue = viewUnits * Math.max(0, expectedRpm);
  const expected = expectedYouTubeRevenue + additionalIncome;
  const high = viewUnits * Math.max(0, highRpm) + additionalIncome;

  return {
    low: Math.round(low),
    expected: Math.round(expected),
    high: Math.round(high),
    annualExpected: Math.round(expected * 12),
    youtubeRevenue: Math.round(expectedYouTubeRevenue),
    additionalIncome: Math.round(additionalIncome),
  };
};
