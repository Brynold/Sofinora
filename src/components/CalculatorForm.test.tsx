import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from '../context/ThemeContext';
import { FormField, Input } from './CalculatorForm';

function NumberField() {
  const [value, setValue] = useState(0);
  return (
    <ThemeProvider>
      <Input
        aria-label="Amount"
        type="number"
        value={value}
        onChange={(event) => setValue(Number(event.target.value))}
      />
    </ThemeProvider>
  );
}

describe('numeric calculator input', () => {
  it('removes a default zero when the user starts entering a value', () => {
    render(<NumberField />);
    const input = screen.getByLabelText('Amount') as HTMLInputElement;
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '077888' } });
    expect(input.value).toBe('77888');
  });

  it('allows the field to stay empty while it is being edited', () => {
    render(<NumberField />);
    const input = screen.getByLabelText('Amount') as HTMLInputElement;
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '' } });
    expect(input.value).toBe('');
    fireEvent.blur(input);
    expect(input.value).toBe('0');
  });

  it('accepts large amounts without a browser number spinner', () => {
    render(<NumberField />);
    const input = screen.getByLabelText('Amount') as HTMLInputElement;
    expect(input.type).toBe('text');
    expect(input.inputMode).toBe('decimal');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '1000000000000' } });
    expect(input.value).toBe('1000000000000');
  });

  it('shows Indian amount wording for currency fields', () => {
    render(
      <ThemeProvider>
        <FormField label="Initial Investment">
          <Input aria-label="Investment amount" type="number" prefix="₹" value={125000} readOnly />
        </FormField>
      </ThemeProvider>,
    );

    expect(screen.getByText('In words: One lakh twenty-five thousand rupees')).toBeInTheDocument();
  });

  it('does not show amount wording for rates', () => {
    render(
      <ThemeProvider>
        <FormField label="Interest Rate">
          <Input aria-label="Interest rate" type="number" suffix="%" value={12} readOnly />
        </FormField>
      </ThemeProvider>,
    );

    expect(screen.queryByText(/in words:/i)).not.toBeInTheDocument();
  });
});
