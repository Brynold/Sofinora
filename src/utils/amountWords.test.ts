import { describe, expect, it } from 'vitest';
import { amountToIndianWords } from './amountWords';

describe('amountToIndianWords', () => {
  it.each([
    [0, 'Zero rupees'],
    [1, 'One rupee'],
    [1_250, 'One thousand two hundred fifty rupees'],
    [125_000, 'One lakh twenty-five thousand rupees'],
    [53_00_000, 'Fifty-three lakh rupees'],
    [1_25_50_000, 'One crore twenty-five lakh fifty thousand rupees'],
    [100.5, 'One hundred rupees and fifty paise'],
  ])('converts %s using the Indian numbering system', (value, words) => {
    expect(amountToIndianWords(value as number)).toBe(words);
  });

  it('ignores invalid and negative amounts', () => {
    expect(amountToIndianWords(Number.NaN)).toBe('');
    expect(amountToIndianWords(-10)).toBe('');
  });
});
