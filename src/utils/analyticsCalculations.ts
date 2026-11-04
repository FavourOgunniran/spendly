import { Transaction, CurrencyCode } from '../types';
import { convertCurrency, FALLBACK_RATES } from '../services/currencyService';

export interface CategoryExpenseData {
  name: string;
  amount: number;
  percentage: number;
  color: string;
  count: number;
}

export interface MonthlyCashFlowData {
  month: string;
  income: number;
  expenses: number;
  net: number;
  sortKey: number; // for chronological sorting
}

export interface AnalyticsSummaryMetrics {
  totalEarned: number;
  totalSpent: number;
  netCashFlow: number;
  totalTransactions: number;
  incomeCount: number;
  expenseCount: number;
  highestCategory: {
    name: string;
    amount: number;
    percentage: number;
  } | null;
  averageExpense: number;
  currency?: CurrencyCode;
}

export const CATEGORY_COLORS: Record<string, string> = {
  'Food & Dining': '#b4b2f8',
  'Food': '#b4b2f8',
  'Housing & Rent': '#6366f1',
  'Housing': '#6366f1',
  'Rent': '#6366f1',
  'Transportation': '#34d399',
  'Transport': '#34d399',
  'Entertainment': '#f472b6',
  'Shopping': '#fb7185',
  'Utilities': '#fb923c',
  'Utility': '#fb923c',
  'Healthcare': '#38bdf8',
  'Health': '#38bdf8',
  'Education': '#a78bfa',
  'Freelance': '#10b981',
  'Salary': '#22c55e',
  'Investment': '#8b5cf6',
  'Other': '#94a3b8',
};

const PALETTE_FALLBACKS = [
  '#b4b2f8',
  '#6366f1',
  '#34d399',
  '#f472b6',
  '#fb7185',
  '#fb923c',
  '#38bdf8',
  '#a78bfa',
  '#10b981',
  '#22c55e',
  '#8b5cf6',
  '#94a3b8',
  '#e879f9',
  '#38bdf8',
  '#4ade80',
];

/**
 * Robust date parser supporting YYYY-MM-DD and standard ISO dates
 */
export const parseTransactionDate = (dateStr: string): Date => {
  if (!dateStr) return new Date();
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? new Date() : d;
};

/**
 * Aggregates expenses by category with currency conversion to targetCurrency.
 */
export const getExpensesByCategory = (
  transactions: Transaction[],
  targetCurrency: CurrencyCode = 'NGN',
  rates: Record<string, number> = FALLBACK_RATES
): CategoryExpenseData[] => {
  if (!Array.isArray(transactions) || transactions.length === 0) return [];

  // Filter strictly for expense records with positive amounts
  const expenseTransactions = transactions.filter(
    (tx) =>
      tx &&
      tx.type &&
      tx.type.toString().toLowerCase().trim() === 'expense' &&
      Number(tx.amount) > 0
  );

  const convertedExpenses = expenseTransactions.map((tx) => {
    const txCurr = tx.currency || 'NGN';
    const converted = convertCurrency(Number(tx.amount) || 0, txCurr, targetCurrency, rates);
    return {
      ...tx,
      convertedAmount: converted,
    };
  });

  const totalExpenseAmount = convertedExpenses.reduce(
    (acc, tx) => acc + tx.convertedAmount,
    0
  );

  if (totalExpenseAmount <= 0) return [];

  const categoryMap = new Map<string, { amount: number; count: number }>();

  for (const tx of convertedExpenses) {
    const catName = (tx.category || 'Other').trim();
    const current = categoryMap.get(catName) || { amount: 0, count: 0 };
    categoryMap.set(catName, {
      amount: current.amount + tx.convertedAmount,
      count: current.count + 1,
    });
  }

  const result: CategoryExpenseData[] = [];
  let colorIndex = 0;

  categoryMap.forEach((val, cat) => {
    const percentage = Number(((val.amount / totalExpenseAmount) * 100).toFixed(1));
    const color =
      CATEGORY_COLORS[cat] ||
      PALETTE_FALLBACKS[colorIndex % PALETTE_FALLBACKS.length];
    colorIndex++;

    result.push({
      name: cat,
      amount: Number(val.amount.toFixed(2)),
      percentage,
      color,
      count: val.count,
    });
  });

  // Sort descending by amount
  return result.sort((a, b) => b.amount - a.amount);
};

/**
 * Aggregates transactions into monthly Income vs Expenses timeline converting each to targetCurrency.
 */
export const getMonthlyCashFlow = (
  transactions: Transaction[],
  targetCurrency: CurrencyCode = 'NGN',
  rates: Record<string, number> = FALLBACK_RATES
): MonthlyCashFlowData[] => {
  if (!Array.isArray(transactions) || transactions.length === 0) return [];

  const monthMap = new Map<
    string,
    { income: number; expenses: number; sortKey: number; label: string }
  >();

  for (const tx of transactions) {
    if (!tx) continue;
    const dateObj = parseTransactionDate(tx.date);
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth();
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
    const label = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      year: 'numeric',
    }).format(dateObj);

    const sortKey = year * 100 + month;
    const current = monthMap.get(monthKey) || {
      income: 0,
      expenses: 0,
      sortKey,
      label,
    };

    const rawAmount = Number(tx.amount) || 0;
    const txCurr = tx.currency || 'NGN';
    const amount = convertCurrency(rawAmount, txCurr, targetCurrency, rates);
    const typeStr = (tx.type || '').toString().toLowerCase().trim();

    if (typeStr === 'income') {
      current.income += amount;
    } else if (typeStr === 'expense') {
      current.expenses += amount;
    }

    monthMap.set(monthKey, current);
  }

  const result: MonthlyCashFlowData[] = [];
  monthMap.forEach((val) => {
    result.push({
      month: val.label,
      income: Number(val.income.toFixed(2)),
      expenses: Number(val.expenses.toFixed(2)),
      net: Number((val.income - val.expenses).toFixed(2)),
      sortKey: val.sortKey,
    });
  });

  // Sort chronologically from earliest to latest
  return result.sort((a, b) => a.sortKey - b.sortKey);
};

/**
 * Computes high-level analytics summary metrics in targetCurrency.
 */
export const getAnalyticsSummary = (
  transactions: Transaction[],
  targetCurrency: CurrencyCode = 'NGN',
  rates: Record<string, number> = FALLBACK_RATES
): AnalyticsSummaryMetrics => {
  if (!Array.isArray(transactions) || transactions.length === 0) {
    return {
      totalEarned: 0,
      totalSpent: 0,
      netCashFlow: 0,
      totalTransactions: 0,
      incomeCount: 0,
      expenseCount: 0,
      highestCategory: null,
      averageExpense: 0,
      currency: targetCurrency,
    };
  }

  const incomeTransactions = transactions.filter(
    (tx) => tx && tx.type && tx.type.toString().toLowerCase().trim() === 'income'
  );
  const expenseTransactions = transactions.filter(
    (tx) => tx && tx.type && tx.type.toString().toLowerCase().trim() === 'expense'
  );

  const totalEarned = incomeTransactions.reduce((sum, tx) => {
    const txCurr = tx.currency || 'NGN';
    return sum + convertCurrency(Number(tx.amount) || 0, txCurr, targetCurrency, rates);
  }, 0);

  const totalSpent = expenseTransactions.reduce((sum, tx) => {
    const txCurr = tx.currency || 'NGN';
    return sum + convertCurrency(Number(tx.amount) || 0, txCurr, targetCurrency, rates);
  }, 0);

  const netCashFlow = totalEarned - totalSpent;

  const categoryBreakdown = getExpensesByCategory(transactions, targetCurrency, rates);
  const highestCategory =
    categoryBreakdown.length > 0
      ? {
          name: categoryBreakdown[0].name,
          amount: categoryBreakdown[0].amount,
          percentage: categoryBreakdown[0].percentage,
        }
      : null;

  const averageExpense =
    expenseTransactions.length > 0
      ? totalSpent / expenseTransactions.length
      : 0;

  return {
    totalEarned: Number(totalEarned.toFixed(2)),
    totalSpent: Number(totalSpent.toFixed(2)),
    netCashFlow: Number(netCashFlow.toFixed(2)),
    totalTransactions: transactions.length,
    incomeCount: incomeTransactions.length,
    expenseCount: expenseTransactions.length,
    highestCategory,
    averageExpense: Number(averageExpense.toFixed(2)),
    currency: targetCurrency,
  };
};
