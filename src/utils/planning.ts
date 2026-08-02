import { roundTo } from './finance';

export interface SSYProjectionInput {
  annualRatePercent: number;
  depositYears: number;
  yearlyDeposit: number;
}

export interface SSYYear {
  year: number;
  deposit: number;
  interest: number;
  balance: number;
}

export const calculateSSYProjection = ({
  annualRatePercent,
  depositYears,
  yearlyDeposit,
}: SSYProjectionInput) => {
  if (yearlyDeposit <= 0 || annualRatePercent < 0 || depositYears < 0) {
    throw new RangeError('SSY inputs must be non-negative and the deposit must be positive.');
  }

  const effectiveDepositYears = Math.min(Math.floor(depositYears), 15);
  const annualRate = annualRatePercent / 100;
  const schedule: SSYYear[] = [];
  let balance = 0;
  let totalDeposited = 0;

  for (let year = 1; year <= 21; year += 1) {
    const deposit = year <= effectiveDepositYears ? yearlyDeposit : 0;
    totalDeposited += deposit;
    const interest = (balance + deposit) * annualRate;
    balance += deposit + interest;
    schedule.push({
      year,
      deposit: roundTo(deposit),
      interest: roundTo(interest),
      balance: roundTo(balance),
    });
  }

  return {
    maturityAmount: roundTo(balance),
    totalDeposited: roundTo(totalDeposited),
    interestEarned: roundTo(balance - totalDeposited),
    schedule,
  };
};

export interface HRAInput {
  basicSalary: number;
  dearnessAllowance: number;
  hraReceived: number;
  rentPaid: number;
  isMetroCity: boolean;
}

export const calculateHRAExemption = ({
  basicSalary,
  dearnessAllowance,
  hraReceived,
  rentPaid,
  isMetroCity,
}: HRAInput) => {
  const eligibleSalary = Math.max(0, basicSalary) + Math.max(0, dearnessAllowance);
  const actualHRA = Math.max(0, hraReceived);
  const rentExcess = Math.max(0, rentPaid) - eligibleSalary * 0.1;
  const salaryCap = eligibleSalary * (isMetroCity ? 0.5 : 0.4);
  const exempted = Math.max(0, Math.min(actualHRA, rentExcess, salaryCap));

  return {
    eligibleSalary: roundTo(eligibleSalary),
    exemptedHRA: roundTo(exempted),
    taxableHRA: roundTo(actualHRA - exempted),
  };
};

export const futureRetirementIncome = (
  annualIncomeToday: number,
  replacementRate: number,
  inflationRatePercent: number,
  years: number,
) => {
  if (annualIncomeToday < 0 || replacementRate < 0 || inflationRatePercent < 0 || years < 0) {
    throw new RangeError('Retirement inputs cannot be negative.');
  }

  return annualIncomeToday * replacementRate * Math.pow(1 + inflationRatePercent / 100, years);
};
