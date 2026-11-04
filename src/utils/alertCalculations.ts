import { Transaction, CurrencyCode, CategoryBudgetProgress } from '../types';
import { convertCurrency, FALLBACK_RATES } from '../services/currencyService';
import { formatCurrency } from './currencyFormatter';
import { parseTransactionDate } from './analyticsCalculations';

export interface SpendingAlert {
  id: string;
  type: 'budget_exceeded' | 'budget_warning' | 'spending_trend' | 'top_category';
  title: string;
  message: string;
  severity: 'danger' | 'warning' | 'info' | 'success';
  metricLabel?: string;
  category?: string;
}

export interface PeriodComparison {
  currentTotal: number;
  previousTotal: number;
  percentageChange: number;
  isIncrease: boolean;
  difference: number;
  hasEnoughData: boolean;
  periodLabel: string;
}

/**
 * Generates simple, reliable, and actionable spending alerts based on real transaction and budget data.
 */
export const calculateSpendingAlerts = (
  transactions: Transaction[],
  categoryBudgets: CategoryBudgetProgress[] = [],
  monthlyBudget: number = 0,
  targetCurrency: CurrencyCode = 'NGN',
  rates: Record<string, number> = FALLBACK_RATES
): SpendingAlert[] => {
  const alerts: SpendingAlert[] = [];
  if (!Array.isArray(transactions)) return alerts;

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // Filter current month expenses
  const currentMonthExpenses = transactions.filter((tx) => {
    if (!tx || (tx.type || '').toString().toLowerCase() !== 'expense') return false;
    const d = parseTransactionDate(tx.date);
    const txMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return txMonth === currentMonth;
  });

  const totalCurrentMonthSpend = currentMonthExpenses.reduce((sum, tx) => {
    const txCurr = tx.currency || 'NGN';
    return sum + convertCurrency(Number(tx.amount) || 0, txCurr, targetCurrency, rates);
  }, 0);

  // 1. Overall Monthly Budget Alert
  if (monthlyBudget > 0) {
    const percentUsed = (totalCurrentMonthSpend / monthlyBudget) * 100;
    if (percentUsed >= 100) {
      alerts.push({
        id: 'monthly-budget-exceeded',
        type: 'budget_exceeded',
        title: 'Monthly Budget Exceeded',
        message: `You've spent ${formatCurrency(totalCurrentMonthSpend, targetCurrency)}, exceeding your monthly ceiling of ${formatCurrency(monthlyBudget, targetCurrency)}.`,
        severity: 'danger',
        metricLabel: `${Math.round(percentUsed)}% Used`,
      });
    } else if (percentUsed >= 80) {
      alerts.push({
        id: 'monthly-budget-warning',
        type: 'budget_warning',
        title: 'Approaching Monthly Budget Limit',
        message: `You've used ${Math.round(percentUsed)}% of your monthly budget with ${formatCurrency(monthlyBudget - totalCurrentMonthSpend, targetCurrency)} remaining.`,
        severity: 'warning',
        metricLabel: `${Math.round(percentUsed)}% Used`,
      });
    }
  }

  // 2. Category Budget Alerts
  if (Array.isArray(categoryBudgets)) {
    for (const cat of categoryBudgets) {
      if (cat.limit <= 0) continue;
      if (cat.percentageUsed >= 100) {
        alerts.push({
          id: `cat-exceeded-${cat.category}`,
          type: 'budget_exceeded',
          title: `${cat.category} Budget Exceeded`,
          message: `You've spent ${formatCurrency(cat.spent, targetCurrency)} on ${cat.category}, which is over your limit of ${formatCurrency(cat.limit, targetCurrency)}.`,
          severity: 'danger',
          metricLabel: `${Math.round(cat.percentageUsed)}%`,
          category: cat.category,
        });
      } else if (cat.percentageUsed >= 80) {
        alerts.push({
          id: `cat-warning-${cat.category}`,
          type: 'budget_warning',
          title: `Approaching ${cat.category} Limit`,
          message: `You've used ${Math.round(cat.percentageUsed)}% of your ${cat.category} budget. ${formatCurrency(cat.remaining, targetCurrency)} left.`,
          severity: 'warning',
          metricLabel: `${Math.round(cat.percentageUsed)}%`,
          category: cat.category,
        });
      }
    }
  }

  // 3. Week-over-Week Spending Trend Alert
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  let thisWeekSpend = 0;
  let lastWeekSpend = 0;

  for (const tx of transactions) {
    if ((tx.type || '').toString().toLowerCase() !== 'expense') continue;
    const txDate = parseTransactionDate(tx.date);
    const converted = convertCurrency(Number(tx.amount) || 0, tx.currency || 'NGN', targetCurrency, rates);

    if (txDate >= oneWeekAgo && txDate <= now) {
      thisWeekSpend += converted;
    } else if (txDate >= twoWeeksAgo && txDate < oneWeekAgo) {
      lastWeekSpend += converted;
    }
  }

  if (lastWeekSpend > 0 && thisWeekSpend > 0) {
    const diff = thisWeekSpend - lastWeekSpend;
    const percentDiff = Math.abs((diff / lastWeekSpend) * 100);

    if (diff > 0 && percentDiff >= 15) {
      alerts.push({
        id: 'trend-higher-spend',
        type: 'spending_trend',
        title: 'Spending Increased This Week',
        message: `Your spending this week (${formatCurrency(thisWeekSpend, targetCurrency)}) is ${Math.round(percentDiff)}% higher than last week (${formatCurrency(lastWeekSpend, targetCurrency)}).`,
        severity: 'warning',
        metricLabel: `+${Math.round(percentDiff)}%`,
      });
    } else if (diff < 0 && percentDiff >= 15) {
      alerts.push({
        id: 'trend-lower-spend',
        type: 'spending_trend',
        title: 'Spending Decreased This Week',
        message: `Great job! Your spending this week (${formatCurrency(thisWeekSpend, targetCurrency)}) is ${Math.round(percentDiff)}% lower than last week.`,
        severity: 'success',
        metricLabel: `-${Math.round(percentDiff)}%`,
      });
    }
  }

  // 4. Highest Spending Category Alert
  if (currentMonthExpenses.length > 0) {
    const categoryTotals = new Map<string, number>();
    for (const tx of currentMonthExpenses) {
      const cat = (tx.category || 'Other').trim();
      const converted = convertCurrency(Number(tx.amount) || 0, tx.currency || 'NGN', targetCurrency, rates);
      categoryTotals.set(cat, (categoryTotals.get(cat) || 0) + converted);
    }

    let topCatName = '';
    let topCatSpend = 0;
    categoryTotals.forEach((amount, name) => {
      if (amount > topCatSpend) {
        topCatSpend = amount;
        topCatName = name;
      }
    });

    if (topCatName && totalCurrentMonthSpend > 0) {
      const topCatPercent = Math.round((topCatSpend / totalCurrentMonthSpend) * 100);
      if (topCatPercent >= 35) {
        alerts.push({
          id: 'top-spending-cat',
          type: 'top_category',
          title: `Highest Spending in ${topCatName}`,
          message: `${topCatName} represents ${topCatPercent}% of your total expenses this month (${formatCurrency(topCatSpend, targetCurrency)}).`,
          severity: 'info',
          metricLabel: `${topCatPercent}% of Spend`,
          category: topCatName,
        });
      }
    }
  }

  return alerts;
};

/**
 * Computes period-over-period spending comparison (e.g. Current Month vs Previous Month).
 */
export const calculatePeriodComparison = (
  transactions: Transaction[],
  selectedMonth: string, // 'YYYY-MM' or 'all'
  targetCurrency: CurrencyCode = 'NGN',
  rates: Record<string, number> = FALLBACK_RATES
): PeriodComparison => {
  if (!Array.isArray(transactions) || transactions.length === 0 || selectedMonth === 'all') {
    return {
      currentTotal: 0,
      previousTotal: 0,
      percentageChange: 0,
      isIncrease: false,
      difference: 0,
      hasEnoughData: false,
      periodLabel: 'Selected Period',
    };
  }

  const [y, m] = selectedMonth.split('-').map(Number);
  const prevDate = new Date(y, m - 2, 1);
  const prevMonthKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

  let currentTotal = 0;
  let previousTotal = 0;

  for (const tx of transactions) {
    if (!tx || (tx.type || '').toString().toLowerCase() !== 'expense') continue;
    const d = parseTransactionDate(tx.date);
    const txMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const converted = convertCurrency(Number(tx.amount) || 0, tx.currency || 'NGN', targetCurrency, rates);

    if (txMonth === selectedMonth) {
      currentTotal += converted;
    } else if (txMonth === prevMonthKey) {
      previousTotal += converted;
    }
  }

  const hasEnoughData = previousTotal > 0 && currentTotal > 0;
  const difference = currentTotal - previousTotal;
  const percentageChange = previousTotal > 0 ? (Math.abs(difference) / previousTotal) * 100 : 0;
  const isIncrease = difference > 0;

  return {
    currentTotal: Number(currentTotal.toFixed(2)),
    previousTotal: Number(previousTotal.toFixed(2)),
    percentageChange: Number(percentageChange.toFixed(1)),
    isIncrease,
    difference: Number(Math.abs(difference).toFixed(2)),
    hasEnoughData,
    periodLabel: 'vs. Previous Month',
  };
};
