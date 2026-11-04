import {
  Transaction,
  CategoryBudget,
  CategoryBudgetProgress,
  BudgetMetrics,
  BudgetStatus,
  BudgetInsight,
  CurrencyCode,
} from '../types';
import { CATEGORY_COLORS } from './analyticsCalculations';
import { formatCurrency } from './currencyFormatter';
import { convertCurrency, FALLBACK_RATES } from '../services/currencyService';

/**
 * Calculates the remaining budget.
 * Remaining Budget = Monthly Budget - Total Expenses
 */
export const calculateRemainingBudget = (
  monthlyBudget: number,
  totalExpenses: number
): number => {
  return monthlyBudget - totalExpenses;
};

/**
 * Calculates the percentage of budget used.
 * Budget Progress = (Total Expenses / Total Budget) * 100
 */
export const calculatePercentageUsed = (
  monthlyBudget: number,
  totalExpenses: number
): number => {
  if (monthlyBudget <= 0) return 0;
  return Number(((totalExpenses / monthlyBudget) * 100).toFixed(1));
};

/**
 * Evaluates budget status and returns appropriate feedback message & styling tokens.
 */
export const getBudgetStatus = (
  percentageUsed: number,
  monthlyBudget: number,
  overBudgetAmount: number = 0,
  currency: CurrencyCode = 'NGN'
): BudgetStatus => {
  if (monthlyBudget <= 0) {
    return {
      level: 'unset',
      message: "You haven't set a monthly budget yet. Set one to start tracking your spending.",
      colorClass: 'text-slate-500 dark:text-slate-400',
      badgeClass:
        'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700',
      progressGradient: 'from-slate-400 to-slate-500',
    };
  }

  if (percentageUsed <= 70) {
    return {
      level: 'safe',
      message: "You're doing great. You're within your budget.",
      colorClass: 'text-[#22c55e] dark:text-[#4ade80]',
      badgeClass:
        'bg-emerald-50 dark:bg-[#14291f] text-emerald-700 dark:text-[#4ade80] border-emerald-200 dark:border-emerald-500/20',
      progressGradient: 'from-emerald-500 to-[#22c55e]',
    };
  }

  if (percentageUsed < 90) {
    return {
      level: 'warning',
      message: "You're approaching your monthly budget limit.",
      colorClass: 'text-[#f59e0b] dark:text-[#fbbf24]',
      badgeClass:
        'bg-amber-50 dark:bg-[#2e2318] text-amber-700 dark:text-[#fbbf24] border-amber-200 dark:border-amber-500/20',
      progressGradient: 'from-amber-500 to-[#fb923c]',
    };
  }

  if (percentageUsed <= 100) {
    return {
      level: 'critical',
      message: `Careful! You've used ${percentageUsed}% of your budget.`,
      colorClass: 'text-[#ea580c] dark:text-[#fb923c]',
      badgeClass:
        'bg-orange-50 dark:bg-[#2e1d18] text-orange-700 dark:text-[#fb923c] border-orange-200 dark:border-orange-500/20',
      progressGradient: 'from-orange-500 to-rose-500',
    };
  }

  return {
    level: 'exceeded',
    message: `You've exceeded your budget by ${formatCurrency(overBudgetAmount, currency)}.`,
    colorClass: 'text-[#e11d48] dark:text-[#f87171]',
    badgeClass:
      'bg-rose-50 dark:bg-[#2e181e] text-rose-700 dark:text-[#f87171] border-rose-200 dark:border-rose-500/20',
    progressGradient: 'from-rose-500 to-red-600',
  };
};

/**
 * Filter transactions for a given month ('YYYY-MM') or return all if 'all'.
 */
export const filterTransactionsByMonth = (
  transactions: Transaction[],
  monthStr: string
): Transaction[] => {
  if (!monthStr || monthStr === 'all') return transactions;
  return transactions.filter((tx) => {
    if (!tx || !tx.date) return false;
    return tx.date.startsWith(monthStr);
  });
};

/**
 * Calculates spending velocity and month-end projection.
 */
export const calculateSpendingVelocity = (
  totalExpenses: number,
  monthlyBudget: number,
  selectedMonth: string
) => {
  const now = new Date();
  let targetYear = now.getFullYear();
  let targetMonth = now.getMonth(); // 0-11

  if (selectedMonth && selectedMonth !== 'all') {
    const [y, m] = selectedMonth.split('-').map(Number);
    if (!isNaN(y) && !isNaN(m)) {
      targetYear = y;
      targetMonth = m - 1;
    }
  }

  // Days in selected month
  const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();

  // Compute days passed
  const isCurrentMonth =
    now.getFullYear() === targetYear && now.getMonth() === targetMonth;
  const isPastMonth =
    targetYear < now.getFullYear() ||
    (targetYear === now.getFullYear() && targetMonth < now.getMonth());

  let daysPassed: number;
  if (isCurrentMonth) {
    daysPassed = Math.max(1, now.getDate());
  } else if (isPastMonth) {
    daysPassed = daysInMonth;
  } else {
    daysPassed = 1;
  }

  const daysRemaining = Math.max(0, daysInMonth - daysPassed);
  const dailyBurnRate = Number((totalExpenses / daysPassed).toFixed(2));
  const projectedMonthlySpend = Number((dailyBurnRate * daysInMonth).toFixed(2));
  const projectedBudgetDifference = Number(
    (monthlyBudget - projectedMonthlySpend).toFixed(2)
  );

  return {
    daysInMonth,
    daysPassed,
    daysRemaining,
    dailyBurnRate,
    projectedMonthlySpend,
    projectedBudgetDifference,
  };
};

/**
 * Calculates category budget progress for both budgeted and unbudgeted categories,
 * normalizing foreign-currency expenses into the user's targetCurrency.
 */
export const calculateCategoryBudgetsProgress = (
  categoryBudgets: CategoryBudget[],
  transactions: Transaction[],
  selectedMonth: string,
  targetCurrency: CurrencyCode = 'NGN',
  rates: Record<string, number> = FALLBACK_RATES
): {
  budgeted: CategoryBudgetProgress[];
  unbudgeted: CategoryBudgetProgress[];
} => {
  const filteredTx = filterTransactionsByMonth(transactions, selectedMonth);

  // Filter for valid expenses
  const expenseTransactions = filteredTx.filter(
    (tx) =>
      tx &&
      tx.type &&
      tx.type.toString().toLowerCase().trim() === 'expense' &&
      Number(tx.amount) > 0
  );

  // Map expenses by category with currency conversion
  const expenseMap = new Map<string, { total: number; count: number }>();
  for (const tx of expenseTransactions) {
    const cat = (tx.category || 'Other').trim();
    const rawAmount = Number(tx.amount) || 0;
    const txCurr = tx.currency || 'NGN';
    const convertedAmount = convertCurrency(rawAmount, txCurr, targetCurrency, rates);

    const current = expenseMap.get(cat) || { total: 0, count: 0 };
    expenseMap.set(cat, {
      total: current.total + convertedAmount,
      count: current.count + 1,
    });
  }

  // Calculate budgeted categories
  const budgetedResults: CategoryBudgetProgress[] = [];
  const budgetedCategoryNames = new Set<string>();

  for (const cb of categoryBudgets) {
    const catName = cb.category.trim();
    budgetedCategoryNames.add(catName);
    const expData = expenseMap.get(catName) || { total: 0, count: 0 };
    const spent = Number(expData.total.toFixed(2));
    const limit = Number(cb.limit) || 0;
    const remaining = Number((limit - spent).toFixed(2));
    const percentageUsed = limit > 0 ? Number(((spent / limit) * 100).toFixed(1)) : 0;
    const isOverBudget = remaining < 0;
    const overBudgetAmount = isOverBudget ? Math.abs(remaining) : 0;
    const status = getBudgetStatus(percentageUsed, limit, overBudgetAmount, targetCurrency);
    const color = CATEGORY_COLORS[catName] || '#6366f1';

    budgetedResults.push({
      id: cb.id,
      category: catName,
      limit,
      spent,
      remaining,
      percentageUsed,
      isOverBudget,
      overBudgetAmount,
      statusLevel: status.level,
      color,
      transactionCount: expData.count,
    });
  }

  // Sort budgeted by % used descending
  budgetedResults.sort((a, b) => b.percentageUsed - a.percentageUsed);

  // Calculate unbudgeted categories that have expenses
  const unbudgetedResults: CategoryBudgetProgress[] = [];
  expenseMap.forEach((expData, catName) => {
    if (!budgetedCategoryNames.has(catName)) {
      const spent = Number(expData.total.toFixed(2));
      const color = CATEGORY_COLORS[catName] || '#94a3b8';
      unbudgetedResults.push({
        category: catName,
        limit: 0,
        spent,
        remaining: 0,
        percentageUsed: 0,
        isOverBudget: false,
        overBudgetAmount: 0,
        statusLevel: 'unset',
        color,
        transactionCount: expData.count,
      });
    }
  });

  // Sort unbudgeted by spent descending
  unbudgetedResults.sort((a, b) => b.spent - a.spent);

  return {
    budgeted: budgetedResults,
    unbudgeted: unbudgetedResults,
  };
};

/**
 * Generates dynamic, real-time insights based on converted budget and expense data.
 */
export const generateBudgetInsights = (
  monthlyBudget: number,
  totalExpenses: number,
  categoryProgress: CategoryBudgetProgress[],
  velocity: ReturnType<typeof calculateSpendingVelocity>,
  currency: CurrencyCode = 'NGN'
): BudgetInsight[] => {
  const insights: BudgetInsight[] = [];

  // Insight 1: Highest spending category
  if (categoryProgress.length > 0) {
    const highestSpendCat = [...categoryProgress].sort((a, b) => b.spent - a.spent)[0];
    if (highestSpendCat && highestSpendCat.spent > 0) {
      const shareOfSpend =
        totalExpenses > 0
          ? ((highestSpendCat.spent / totalExpenses) * 100).toFixed(1)
          : '0';

      insights.push({
        id: 'ins-highest-spend',
        type: 'highest_spend',
        title: 'Highest Spending Area',
        description: `${highestSpendCat.category} is your highest expense area at ${formatCurrency(
          highestSpendCat.spent,
          currency
        )}, accounting for ${shareOfSpend}% of all expenses.`,
        severity: 'normal',
        value: formatCurrency(highestSpendCat.spent, currency),
        categoryName: highestSpendCat.category,
      });
    }
  }

  // Insight 2: Over budget categories
  const overBudgetCats = categoryProgress.filter((c) => c.isOverBudget);
  if (overBudgetCats.length > 0) {
    const catNames = overBudgetCats.map((c) => c.category).join(', ');
    const totalOver = overBudgetCats.reduce(
      (sum, c) => sum + c.overBudgetAmount,
      0
    );
    insights.push({
      id: 'ins-over-budget-categories',
      type: 'over_budget',
      title: `${overBudgetCats.length} ${
        overBudgetCats.length === 1 ? 'Category' : 'Categories'
      } Exceeded`,
      description: `${catNames} exceeded allocated limits by a combined total of ${formatCurrency(
        totalOver,
        currency
      )}.`,
      severity: 'danger',
      value: `-${formatCurrency(totalOver, currency)}`,
    });
  }

  // Insight 3: Category closest to exceeding its budget (between 70% and 100%)
  const nearLimitCats = categoryProgress
    .filter((c) => !c.isOverBudget && c.percentageUsed >= 70 && c.limit > 0)
    .sort((a, b) => b.percentageUsed - a.percentageUsed);

  if (nearLimitCats.length > 0) {
    const topNear = nearLimitCats[0];
    insights.push({
      id: 'ins-near-limit',
      type: 'near_limit',
      title: `${topNear.category} Nearing Limit`,
      description: `${topNear.category} has reached ${topNear.percentageUsed}% of its ${formatCurrency(
        topNear.limit,
        currency
      )} limit with ${formatCurrency(topNear.remaining, currency)} remaining.`,
      severity: 'warning',
      value: `${topNear.percentageUsed}%`,
      categoryName: topNear.category,
    });
  }

  // Insight 4: Percentage of monthly budget remaining
  if (monthlyBudget > 0) {
    const remaining = monthlyBudget - totalExpenses;
    const remainingPct = Number(
      Math.max(0, ((remaining / monthlyBudget) * 100)).toFixed(1)
    );
    if (remaining >= 0) {
      insights.push({
        id: 'ins-remaining-runway',
        type: 'remaining_runway',
        title: 'Available Budget Runway',
        description: `You have ${remainingPct}% (${formatCurrency(
          remaining,
          currency
        )}) of your total monthly budget remaining.`,
        severity: remainingPct > 25 ? 'success' : 'warning',
        value: `${remainingPct}%`,
      });
    } else {
      insights.push({
        id: 'ins-total-over-budget',
        type: 'over_budget',
        title: 'Monthly Limit Exceeded',
        description: `Your spending exceeds your planned ceiling by ${formatCurrency(
          Math.abs(remaining),
          currency
        )}.`,
        severity: 'danger',
        value: `-${formatCurrency(Math.abs(remaining), currency)}`,
      });
    }
  }

  // Insight 5: Spending Pace & Projected End of Month
  if (monthlyBudget > 0 && totalExpenses > 0) {
    const { dailyBurnRate, projectedMonthlySpend, projectedBudgetDifference, daysRemaining } =
      velocity;

    if (daysRemaining > 0) {
      if (projectedBudgetDifference >= 0) {
        insights.push({
          id: 'ins-pace-safe',
          type: 'spending_pace',
          title: 'Projected On-Track Pace',
          description: `At your average burn rate of ${formatCurrency(
            dailyBurnRate,
            currency
          )}/day, you are on track to spend ${formatCurrency(
            projectedMonthlySpend,
            currency
          )}, finishing ${formatCurrency(projectedBudgetDifference, currency)} under budget.`,
          severity: 'success',
          value: `${formatCurrency(dailyBurnRate, currency)}/day`,
        });
      } else {
        insights.push({
          id: 'ins-pace-warning',
          type: 'spending_pace',
          title: 'Projected Over-Pace Warning',
          description: `At ${formatCurrency(
            dailyBurnRate,
            currency
          )}/day, you are projected to reach ${formatCurrency(
            projectedMonthlySpend,
            currency
          )} by month end, exceeding your budget by ${formatCurrency(
            Math.abs(projectedBudgetDifference),
            currency
          )}.`,
          severity: 'danger',
          value: `${formatCurrency(dailyBurnRate, currency)}/day`,
        });
      }
    }
  }

  return insights;
};

/**
 * Computes all budget metrics from monthly budget, category limits, transactions, and selected month,
 * accurately converting any foreign transactions to targetCurrency.
 */
export const calculateBudgetMetrics = (
  monthlyBudget: number,
  categoryBudgets: CategoryBudget[],
  transactions: Transaction[],
  selectedMonth: string = '2026-08',
  targetCurrency: CurrencyCode = 'NGN',
  rates: Record<string, number> = FALLBACK_RATES
): BudgetMetrics => {
  const filteredTx = filterTransactionsByMonth(transactions, selectedMonth);
  const expenseTransactions = filteredTx.filter(
    (tx) =>
      tx &&
      tx.type &&
      tx.type.toString().toLowerCase().trim() === 'expense' &&
      Number(tx.amount) > 0
  );

  const totalExpenses = Number(
    expenseTransactions
      .reduce((sum, tx) => {
        const txCurr = tx.currency || 'NGN';
        const converted = convertCurrency(Number(tx.amount) || 0, txCurr, targetCurrency, rates);
        return sum + converted;
      }, 0)
      .toFixed(2)
  );

  const remainingBudget = Number(
    calculateRemainingBudget(monthlyBudget, totalExpenses).toFixed(2)
  );
  const percentageUsed = calculatePercentageUsed(monthlyBudget, totalExpenses);
  const isOverBudget = remainingBudget < 0;
  const overBudgetAmount = isOverBudget ? Math.abs(remainingBudget) : 0;
  const status = getBudgetStatus(percentageUsed, monthlyBudget, overBudgetAmount, targetCurrency);

  // Velocity calculation
  const velocity = calculateSpendingVelocity(
    totalExpenses,
    monthlyBudget,
    selectedMonth
  );

  // Category progress
  const { budgeted, unbudgeted } = calculateCategoryBudgetsProgress(
    categoryBudgets,
    transactions,
    selectedMonth,
    targetCurrency,
    rates
  );

  // Real insights
  const insights = generateBudgetInsights(
    monthlyBudget,
    totalExpenses,
    [...budgeted, ...unbudgeted],
    velocity,
    targetCurrency
  );

  return {
    monthlyBudget: Number(monthlyBudget.toFixed(2)),
    totalExpenses,
    remainingBudget,
    percentageUsed,
    isOverBudget,
    overBudgetAmount,
    status,
    daysInMonth: velocity.daysInMonth,
    daysPassed: velocity.daysPassed,
    daysRemaining: velocity.daysRemaining,
    dailyBurnRate: velocity.dailyBurnRate,
    projectedMonthlySpend: velocity.projectedMonthlySpend,
    projectedBudgetDifference: velocity.projectedBudgetDifference,
    categoryBudgets: budgeted,
    unbudgetedCategories: unbudgeted,
    insights,
    selectedMonth,
    currency: targetCurrency,
  };
};
