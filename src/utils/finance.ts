export interface TimedCashFlow {
  year: number;
  amount: number;
}

const EPSILON = 1e-9;

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

export const roundTo = (value: number, digits = 2): number => {
  const factor = Math.pow(10, digits);
  return Math.round((value + Number.EPSILON) * factor) / factor;
};

export const safePercentage = (value: number, total: number): number => {
  if (total === 0) {
    return 0;
  }

  return (value / total) * 100;
};

export const formatCurrencyINR = (value: number, digits = 0): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);

export const annualRateToNominalMonthlyRate = (annualRatePercent: number): number =>
  annualRatePercent / 1200;

export const calculateCAGR = (initialValue: number, finalValue: number, years: number): number => {
  if (initialValue <= 0 || finalValue <= 0 || years <= 0) {
    throw new RangeError('CAGR values and duration must be positive.');
  }
  return Math.pow(finalValue / initialValue, 1 / years) - 1;
};

export const calculateMonthlyLoanPayment = (
  principal: number,
  annualRatePercent: number,
  months: number,
): number => {
  if (principal <= 0 || annualRatePercent < 0 || months <= 0) {
    throw new RangeError('Loan principal and duration must be positive, and rate cannot be negative.');
  }
  const monthlyRate = annualRateToNominalMonthlyRate(annualRatePercent);
  if (Math.abs(monthlyRate) < EPSILON) return principal / months;
  return principal * monthlyRate * Math.pow(1 + monthlyRate, months) /
    (Math.pow(1 + monthlyRate, months) - 1);
};

export const annualRateToEffectiveMonthlyRate = (
  annualRatePercent: number,
  compoundsPerYear = 12
): number => {
  if (compoundsPerYear <= 0) {
    return 0;
  }

  const annualRate = annualRatePercent / 100;
  return Math.pow(1 + annualRate / compoundsPerYear, compoundsPerYear / 12) - 1;
};

export const futureValue = (principal: number, ratePerPeriod: number, periods: number): number => {
  if (periods <= 0) {
    return principal;
  }

  if (Math.abs(ratePerPeriod) < EPSILON) {
    return principal;
  }

  return principal * Math.pow(1 + ratePerPeriod, periods);
};

interface MonthlySeriesOptions {
  contributionAtStart?: boolean;
  monthlyRate: number;
  months: number;
  payment: number;
}

export const futureValueOfMonthlySeries = ({
  payment,
  months,
  monthlyRate,
  contributionAtStart = true,
}: MonthlySeriesOptions): number => {
  if (months <= 0 || payment === 0) {
    return 0;
  }

  if (Math.abs(monthlyRate) < EPSILON) {
    return payment * months;
  }

  const ordinaryAnnuity =
    payment * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);

  return contributionAtStart ? ordinaryAnnuity * (1 + monthlyRate) : ordinaryAnnuity;
};

export const calculateNPV = (
  rate: number,
  initialInvestment: number,
  cashFlows: TimedCashFlow[]
): number => {
  if (rate <= -1) {
    return Number.POSITIVE_INFINITY;
  }

  return [...cashFlows]
    .sort((a, b) => a.year - b.year)
    .reduce(
      (npv, flow) => npv + flow.amount / Math.pow(1 + rate, flow.year),
      -initialInvestment
    );
};

export const calculateIRRFromCashFlows = (
  initialInvestment: number,
  cashFlows: TimedCashFlow[]
): number | null => {
  const normalizedCashFlows = cashFlows.filter(
    (flow) => Number.isFinite(flow.year) && Number.isFinite(flow.amount)
  );

  const hasPositiveFlow = normalizedCashFlows.some((flow) => flow.amount > 0);
  const hasNegativeFlow = initialInvestment > 0 || normalizedCashFlows.some((flow) => flow.amount < 0);

  if (!hasPositiveFlow || !hasNegativeFlow) {
    return null;
  }

  let low = -0.9999;
  let high = 0.1;
  let lowNpv = calculateNPV(low, initialInvestment, normalizedCashFlows);
  let highNpv = calculateNPV(high, initialInvestment, normalizedCashFlows);

  while (Math.sign(lowNpv) === Math.sign(highNpv) && high < 1000) {
    high = high < 1 ? high + 0.5 : high * 2;
    highNpv = calculateNPV(high, initialInvestment, normalizedCashFlows);
  }

  if (Math.sign(lowNpv) === Math.sign(highNpv)) {
    return null;
  }

  for (let iteration = 0; iteration < 250; iteration += 1) {
    const mid = (low + high) / 2;
    const midNpv = calculateNPV(mid, initialInvestment, normalizedCashFlows);

    if (Math.abs(midNpv) < 1e-7) {
      return mid;
    }

    if (Math.sign(midNpv) === Math.sign(lowNpv)) {
      low = mid;
      lowNpv = midNpv;
    } else {
      high = mid;
      highNpv = midNpv;
    }
  }

  return (low + high) / 2;
};
