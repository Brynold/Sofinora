import { describe, expect, it } from 'vitest';
import { calculateHRAExemption, calculateSSYProjection, futureRetirementIncome } from './planning';

describe('government scheme and planning calculations', () => {
  it('runs every new SSY account for 21 years and stops deposits after 15', () => {
    const result = calculateSSYProjection({ yearlyDeposit: 10_000, annualRatePercent: 0, depositYears: 15 });
    expect(result.schedule).toHaveLength(21);
    expect(result.totalDeposited).toBe(150_000);
    expect(result.maturityAmount).toBe(150_000);
    expect(result.schedule[15].deposit).toBe(0);
  });

  it('includes eligible DA in the HRA salary basis', () => {
    const result = calculateHRAExemption({
      basicSalary: 40_000,
      dearnessAllowance: 10_000,
      hraReceived: 25_000,
      rentPaid: 20_000,
      isMetroCity: true,
    });
    expect(result.eligibleSalary).toBe(50_000);
    expect(result.exemptedHRA).toBe(15_000);
    expect(result.taxableHRA).toBe(10_000);
  });

  it('never produces a negative HRA exemption', () => {
    const result = calculateHRAExemption({ basicSalary: 50_000, dearnessAllowance: 0, hraReceived: 20_000, rentPaid: 2_000, isMetroCity: false });
    expect(result.exemptedHRA).toBe(0);
    expect(result.taxableHRA).toBe(20_000);
  });

  it('inflates the retirement income target before sizing the corpus', () => {
    expect(futureRetirementIncome(600_000, 0.8, 6, 20)).toBeCloseTo(1_539_425.03, 1);
  });
});
