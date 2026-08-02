import { describe, expect, it } from 'vitest';
import {
  calculateLoanPrepayment,
  calculateSalaryTaxComparison,
  calculateStepUpSip,
  calculateSwp,
  estimateYouTubeEarnings,
} from './advancedCalculators';

describe('advanced calculator formulas', () => {
  it('makes a step-up SIP worth more than a flat SIP', () => {
    const result = calculateStepUpSip(10_000, 10, 12, 10);
    expect(result.maturity).toBeGreaterThan(result.flatSipMaturity);
    expect(result.invested).toBeGreaterThan(1_200_000);
  });

  it('shows loan prepayments saving interest and tenure', () => {
    const result = calculateLoanPrepayment(5_000_000, 8.5, 20, 500_000, 3, 5_000);
    expect(result.interestSaved).toBeGreaterThan(0);
    expect(result.monthsSaved).toBeGreaterThan(0);
  });

  it('detects an unsustainable SWP', () => {
    const result = calculateSwp(1_000_000, 50_000, 6, 10, 0);
    expect(result.depletionMonth).not.toBeNull();
    expect(result.endingBalance).toBe(0);
  });

  it('applies the AY 2026-27 new-regime rebate to salary under the threshold', () => {
    const result = calculateSalaryTaxComparison(1_200_000, 150_000);
    expect(result.newTax).toBe(0);
    expect(result.recommended).toBe('new');
  });

  it('estimates YouTube revenue from views, RPM, and outside income', () => {
    const result = estimateYouTubeEarnings(1_000_000, 20, 80, 200, 25_000);
    expect(result.expected).toBe(105_000);
    expect(result.low).toBe(45_000);
    expect(result.high).toBe(225_000);
    expect(result.annualExpected).toBe(1_260_000);
  });
});
