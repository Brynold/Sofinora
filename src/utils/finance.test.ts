import { describe, expect, it } from 'vitest';
import {
  annualRateToEffectiveMonthlyRate,
  calculateCAGR,
  calculateIRRFromCashFlows,
  calculateMonthlyLoanPayment,
  calculateNPV,
  futureValue,
  futureValueOfMonthlySeries,
  safePercentage,
} from './finance';

describe('finance utilities', () => {
  it('calculates compound growth', () => {
    expect(futureValue(100_000, 0.1, 2)).toBeCloseTo(121_000, 6);
  });

  it('calculates CAGR from beginning and ending values', () => {
    expect(calculateCAGR(100_000, 121_000, 2)).toBeCloseTo(0.1, 8);
  });

  it('calculates EMI and handles a zero-interest loan', () => {
    expect(calculateMonthlyLoanPayment(1_000_000, 12, 120)).toBeCloseTo(14_347.09, 1);
    expect(calculateMonthlyLoanPayment(120_000, 0, 12)).toBe(10_000);
  });

  it('handles zero-rate monthly contributions', () => {
    expect(futureValueOfMonthlySeries({ payment: 5_000, months: 12, monthlyRate: 0 })).toBe(60_000);
  });

  it('credits beginning-of-month SIP payments for one extra period', () => {
    const ordinary = futureValueOfMonthlySeries({ payment: 10_000, months: 12, monthlyRate: 0.01, contributionAtStart: false });
    const due = futureValueOfMonthlySeries({ payment: 10_000, months: 12, monthlyRate: 0.01, contributionAtStart: true });
    expect(due).toBeCloseTo(ordinary * 1.01, 6);
  });

  it('converts nominal compounding to an effective monthly rate', () => {
    const monthly = annualRateToEffectiveMonthlyRate(12, 4);
    expect(Math.pow(1 + monthly, 12)).toBeCloseTo(Math.pow(1.03, 4), 10);
  });

  it('solves a simple IRR and brings NPV close to zero', () => {
    const flows = [{ year: 1, amount: 1_100 }];
    const irr = calculateIRRFromCashFlows(1_000, flows);
    expect(irr).not.toBeNull();
    expect(irr!).toBeCloseTo(0.1, 6);
    expect(calculateNPV(irr!, 1_000, flows)).toBeCloseTo(0, 6);
  });

  it('rejects cash-flow sets without a valid sign change', () => {
    expect(calculateIRRFromCashFlows(0, [{ year: 1, amount: 100 }])).toBeNull();
  });

  it('returns a safe percentage for an empty total', () => {
    expect(safePercentage(10, 0)).toBe(0);
  });
});
