import React, { ReactNode, createContext, useContext, useEffect, useRef, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { amountToIndianWords } from '../utils/amountWords';
import { ChevronDown } from 'lucide-react';

const FormFieldLabelContext = createContext('');

interface FormFieldProps {
  label: string;
  children: ReactNode;
  hint?: string;
  labelClass?: string;
}

export const FormField: React.FC<FormFieldProps> = ({ label, children, hint, labelClass }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <label className="mb-5 block sm:mb-6">
      <span className={`mb-2 block text-[15px] font-semibold leading-5 sm:text-sm sm:font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} ${labelClass || ''}`}>
        {label}
      </span>
      <FormFieldLabelContext.Provider value={label}>
        {children}
        {hint && <p className="mt-1.5 text-xs text-gray-500">{hint}</p>}
      </FormFieldLabelContext.Provider>
    </label>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  prefix?: string;
  suffix?: string;
  amountInWords?: boolean;
}

export const Input: React.FC<InputProps> = ({
  prefix,
  suffix,
  className,
  value,
  onChange,
  onFocus,
  onBlur,
  type,
  amountInWords,
  ...props
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const fieldLabel = useContext(FormFieldLabelContext);
  const isFocused = useRef(false);
  const externalValue = value == null ? '' : String(value);
  const [draftValue, setDraftValue] = useState(externalValue);
  const inferredAmountField = prefix === '₹' || (!suffix && /₹|amount|investment|deposit|contribution|savings|salary|allowance|rent|housing|utilit|grocer|transport|healthcare|expense|income|cash flow|principal/i.test(fieldLabel));
  const showAmountInWords = type === 'number' && (amountInWords ?? inferredAmountField);
  const displayedValue = isFocused.current ? draftValue : externalValue;
  const numericValue = Number(displayedValue.replace(/,/g, ''));
  const amountWords = showAmountInWords && displayedValue !== '' && numericValue >= 0
    ? amountToIndianWords(numericValue)
    : '';

  useEffect(() => {
    if (!isFocused.current) setDraftValue(externalValue);
  }, [externalValue]);

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    isFocused.current = true;
    if (type === 'number' && externalValue === '0') setDraftValue('');
    onFocus?.(event);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let nextValue = event.currentTarget.value;
    if (type === 'number') {
      nextValue = nextValue.replace(/,/g, '');
      const isNegative = nextValue.startsWith('-');
      const unsignedValue = nextValue.replace(/-/g, '').replace(/[^\d.]/g, '');
      const [whole = '', ...decimalParts] = unsignedValue.split('.');
      nextValue = `${isNegative ? '-' : ''}${whole}${decimalParts.length ? `.${decimalParts.join('')}` : ''}`;
      nextValue = nextValue.replace(/^(-?)0+(?=\d)/, '$1');
    }
    setDraftValue(nextValue);
    event.currentTarget.value = nextValue;
    onChange?.(event);
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    isFocused.current = false;
    setDraftValue(externalValue);
    onBlur?.(event);
  };

  return (
    <div>
      <div className="relative group">
        {prefix && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
            <span className={isDark ? 'text-gray-400 group-hover:text-primary-400' : 'text-gray-500 group-hover:text-primary-500'}>
              {prefix}
            </span>
          </div>
        )}
        <input
          {...props}
          type={type === 'number' ? 'text' : type}
          inputMode={type === 'number' ? (props.inputMode ?? 'decimal') : props.inputMode}
          autoComplete={type === 'number' ? 'off' : props.autoComplete}
          value={displayedValue}
          onFocus={handleFocus}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`min-h-12 min-w-0 w-full rounded-xl tabular-nums text-base ${
            isDark
              ? 'border-dark-border bg-dark-elevated text-white focus:border-primary-500 focus:ring-primary-600 hover:border-gray-600'
              : 'border-gray-300 bg-white text-gray-700 focus:border-primary-500 focus:ring-primary-500 hover:border-gray-400'
          } border px-3.5 py-3 shadow-sm transition-all sm:min-h-0 sm:py-2.5 sm:text-sm ${
            prefix ? 'pl-9' : ''
          } ${suffix ? 'pr-14' : ''} ${className || ''}`}
        />
        {suffix && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none">
            <span className={isDark ? 'text-gray-400 group-hover:text-primary-400' : 'text-gray-500 group-hover:text-primary-500'}>
              {suffix}
            </span>
          </div>
        )}
      </div>
      {amountWords && (
        <p className={`mt-1.5 text-xs leading-5 ${isDark ? 'text-cyan-200/80' : 'text-cyan-700'}`} aria-live="polite">
          In words: {amountWords}
        </p>
      )}
    </div>
  );
};

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, className, ...props }) => {
  return (
    <button
      {...props}
      className={`flex min-h-[3.25rem] touch-manipulation items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-5 py-3 font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:from-primary-700 hover:to-primary-600 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 ${className || ''}`}
    >
      {children}
    </button>
  );
};

interface ResultDisplayProps {
  label: string;
  value: string | number;
  highlight?: boolean;
  darkCustomClass?: string;
  subtext?: string;
  icon?: React.ReactNode;
  iconBgColor?: string;
  iconColor?: string;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ 
  label, 
  value, 
  highlight = false, 
  darkCustomClass,
  subtext,
  icon,
  iconBgColor,
  iconColor
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`mb-3 rounded-2xl p-4 transition-all sm:mb-4 sm:p-5 ${
      darkCustomClass || (
        isDark 
          ? (highlight 
              ? 'bg-primary-900/30 border border-primary-800/40 shadow-md' 
              : 'bg-dark-elevated hover:bg-dark-inset border border-dark-border')
          : (highlight 
              ? 'bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200 shadow-md' 
              : 'bg-gray-50 hover:bg-gray-100 border border-gray-100')
      )
    }`}>
      {icon && (
        <div className="flex items-center mb-3">
          <div className={`w-10 h-10 rounded-full ${iconBgColor || (isDark ? 'bg-primary-900/50' : 'bg-primary-100')} flex items-center justify-center`}>
            <div className={`${iconColor || (isDark ? 'text-primary-400' : 'text-primary-600')}`}>
              {icon}
            </div>
          </div>
        </div>
      )}
      <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-1`}>{label}</p>
      <p className={`text-xl md:text-2xl font-bold tabular-nums ${
        isDark 
          ? (highlight ? 'text-primary-400' : 'text-white')
          : (highlight ? 'text-primary-700' : 'text-gray-800')
      } break-words`}>
        {value}
      </p>
      {subtext && <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-1`}>{subtext}</p>}
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  prefix?: string;
}

export const Select: React.FC<SelectProps> = ({ prefix, children, className, ...props }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="group relative min-w-0">
      {prefix && (
        <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
          <span className={isDark ? 'text-gray-400 group-hover:text-primary-400' : 'text-gray-500 group-hover:text-primary-500'}>
            {prefix}
          </span>
        </div>
      )}
      <select
        {...props}
        className={`app-select block min-h-12 w-full appearance-none rounded-xl text-base ${
          isDark 
            ? 'border-dark-border bg-dark-elevated text-white focus:border-primary-500 focus:ring-primary-600 hover:border-gray-600' 
            : 'border-gray-300 bg-white text-gray-700 focus:border-primary-500 focus:ring-primary-500 hover:border-gray-400'
        } border px-3.5 py-3 pr-11 shadow-sm transition-all sm:text-sm ${
          prefix ? 'pl-9' : ''
        } ${className || ''}`}
      >
        {children}
      </select>
      <span className={`pointer-events-none absolute inset-y-0 right-0 flex w-11 items-center justify-center ${
        isDark ? 'text-slate-400 group-hover:text-cyan-300' : 'text-slate-500 group-hover:text-cyan-700'
      }`} aria-hidden="true">
        <ChevronDown size={18} strokeWidth={2.25} />
      </span>
    </div>
  );
}; 
