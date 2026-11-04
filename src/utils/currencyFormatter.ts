import { CurrencyCode } from '../types';
import { CURRENCY_MAP } from '../services/currencyService';

export interface FormatCurrencyOptions {
  /**
   * Force decimal digits display. Defaults to auto:
   * (0 decimals if integer e.g. ₦50,000, 2 decimals if fractional e.g. ₦50,000.50).
   */
  decimals?: boolean | number;
  /**
   * If true, abbreviates large numbers (e.g. 1.2M, 50K).
   */
  compact?: boolean;
}

/**
 * Universal Currency Formatter for Spendly.
 * Standardizes monetary formatting across the entire app with proper symbol, commas,
 * and clean integer/decimal representations (e.g. ₦50,000 or $1,250.50).
 *
 * @param amount Numeric value to format
 * @param currency Currency code (defaults to 'NGN')
 * @param options Optional configuration for decimals or compact mode
 * @returns Formatted currency string (e.g. ₦50,000, $100.25)
 */
export const formatCurrency = (
  amount: number,
  currency: CurrencyCode = 'NGN',
  options: FormatCurrencyOptions = {}
): string => {
  const numericAmount = Number(amount);
  const safeAmount = isNaN(numericAmount) ? 0 : numericAmount;
  const currCode = (currency || 'NGN').toUpperCase();
  const info = CURRENCY_MAP[currCode];
  const symbol = info ? info.symbol : (currCode === 'NGN' ? '₦' : '$');

  // Determine decimal fraction digits:
  // If explicitly specified as number, use that.
  // If explicitly true, use 2. If false, use 0.
  // If undefined/auto: use 0 if integer, 2 if has fractional cents.
  let minDecimals = 0;
  let maxDecimals = 0;

  if (typeof options.decimals === 'number') {
    minDecimals = options.decimals;
    maxDecimals = options.decimals;
  } else if (options.decimals === true) {
    minDecimals = 2;
    maxDecimals = 2;
  } else if (options.decimals === false) {
    minDecimals = 0;
    maxDecimals = 0;
  } else {
    const isInteger = Math.abs(safeAmount - Math.round(safeAmount)) < 0.001;
    minDecimals = isInteger ? 0 : 2;
    maxDecimals = isInteger ? 0 : 2;
  }

  if (options.compact && Math.abs(safeAmount) >= 1000) {
    try {
      const compactFormatter = new Intl.NumberFormat('en-US', {
        notation: 'compact',
        maximumFractionDigits: 1,
      });
      return `${symbol}${compactFormatter.format(safeAmount)}`;
    } catch {
      // Fallback
    }
  }

  const locale = info ? info.locale : 'en-US';

  try {
    const formattedNumber = safeAmount.toLocaleString(locale, {
      minimumFractionDigits: minDecimals,
      maximumFractionDigits: maxDecimals,
    });
    return `${symbol}${formattedNumber}`;
  } catch {
    const formattedNumber = safeAmount.toLocaleString('en-US', {
      minimumFractionDigits: minDecimals,
      maximumFractionDigits: maxDecimals,
    });
    return `${symbol}${formattedNumber}`;
  }
};
