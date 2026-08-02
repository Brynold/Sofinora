const ones = [
  '', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
  'seventeen', 'eighteen', 'nineteen',
];

const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

const belowHundred = (value: number): string => {
  if (value < 20) return ones[value];
  return `${tens[Math.floor(value / 10)]}${value % 10 ? `-${ones[value % 10]}` : ''}`;
};

const belowThousand = (value: number): string => {
  if (value < 100) return belowHundred(value);
  const remainder = value % 100;
  return `${ones[Math.floor(value / 100)]} hundred${remainder ? ` ${belowHundred(remainder)}` : ''}`;
};

const indianIntegerWords = (value: number): string => {
  if (value < 1_000) return belowThousand(value);
  if (value < 100_000) {
    const remainder = value % 1_000;
    return `${belowHundred(Math.floor(value / 1_000))} thousand${remainder ? ` ${belowThousand(remainder)}` : ''}`;
  }
  if (value < 10_000_000) {
    const remainder = value % 100_000;
    return `${belowHundred(Math.floor(value / 100_000))} lakh${remainder ? ` ${indianIntegerWords(remainder)}` : ''}`;
  }

  const remainder = value % 10_000_000;
  return `${indianIntegerWords(Math.floor(value / 10_000_000))} crore${remainder ? ` ${indianIntegerWords(remainder)}` : ''}`;
};

export const amountToIndianWords = (value: number): string => {
  if (!Number.isFinite(value) || value < 0 || !Number.isSafeInteger(Math.floor(value))) return '';

  const rounded = Math.round(value * 100) / 100;
  const rupees = Math.floor(rounded);
  const paise = Math.round((rounded - rupees) * 100);
  const rupeeWords = rupees === 0 ? 'zero' : indianIntegerWords(rupees);
  const paiseWords = paise > 0 ? ` and ${indianIntegerWords(paise)} paise` : '';
  const words = `${rupeeWords} rupee${rupees === 1 ? '' : 's'}${paiseWords}`;

  return words.charAt(0).toUpperCase() + words.slice(1);
};
