import { Transaction, FinancialSummary, CurrencyCode } from '../types';
import { convertCurrency, FALLBACK_RATES } from '../services/currencyService';
export { formatCurrency } from './currencyFormatter';

/**
 * Calculates the total income from a list of transactions, converting each to targetCurrency.
 */
export const calculateTotalIncome = (
  transactions: Transaction[],
  targetCurrency: CurrencyCode = 'NGN',
  rates: Record<string, number> = FALLBACK_RATES
): number => {
  return transactions
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => {
      const txCurrency = tx.currency || 'NGN';
      const converted = convertCurrency(tx.amount, txCurrency, targetCurrency, rates);
      return sum + converted;
    }, 0);
};

/**
 * Calculates the total expenses from a list of transactions, converting each to targetCurrency.
 */
export const calculateTotalExpenses = (
  transactions: Transaction[],
  targetCurrency: CurrencyCode = 'NGN',
  rates: Record<string, number> = FALLBACK_RATES
): number => {
  return transactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => {
      const txCurrency = tx.currency || 'NGN';
      const converted = convertCurrency(tx.amount, txCurrency, targetCurrency, rates);
      return sum + converted;
    }, 0);
};

/**
 * Calculates the net total balance.
 */
export const calculateTotalBalance = (totalIncome: number, totalExpenses: number): number => {
  return Number((totalIncome - totalExpenses).toFixed(2));
};

/**
 * Calculates the savings rate percentage.
 */
export const calculateSavingsRate = (totalIncome: number, totalExpenses: number): number => {
  if (totalIncome <= 0) return 0;
  const netSavings = totalIncome - totalExpenses;
  return Number(Math.max(0, (netSavings / totalIncome) * 100).toFixed(1));
};

/**
 * Aggregates all financial metrics into a single summary object in targetCurrency.
 */
export const calculateFinancialSummary = (
  transactions: Transaction[],
  targetCurrency: CurrencyCode = 'NGN',
  rates: Record<string, number> = FALLBACK_RATES
): FinancialSummary => {
  const totalIncome = Number(calculateTotalIncome(transactions, targetCurrency, rates).toFixed(2));
  const totalExpenses = Number(calculateTotalExpenses(transactions, targetCurrency, rates).toFixed(2));
  const totalBalance = calculateTotalBalance(totalIncome, totalExpenses);
  const savingsRate = calculateSavingsRate(totalIncome, totalExpenses);

  return {
    totalBalance,
    totalIncome,
    totalExpenses,
    savingsRate,
    transactionCount: transactions.length,
    currency: targetCurrency,
  };
};
