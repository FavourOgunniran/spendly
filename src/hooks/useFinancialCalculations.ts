import { useMemo } from 'react';
import { Transaction, FinancialSummary } from '../types';
import { calculateFinancialSummary } from '../utils/calculations';

/**
 * Custom hook to compute and memoize financial metrics from transaction data.
 * Re-runs automatically whenever the transactions array changes.
 */
export const useFinancialCalculations = (
  transactions: Transaction[]
): FinancialSummary => {
  return useMemo(() => {
    return calculateFinancialSummary(transactions);
  }, [transactions]);
};
