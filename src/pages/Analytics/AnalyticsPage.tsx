import React, { useMemo } from 'react';
import { useTransactions } from '../../context/TransactionContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useBudget } from '../../context/BudgetContext';
import {
  getExpensesByCategory,
  getMonthlyCashFlow,
  getAnalyticsSummary,
} from '../../utils/analyticsCalculations';
import {
  calculateSpendingAlerts,
  calculatePeriodComparison,
} from '../../utils/alertCalculations';
import { AnalyticsSummaryCards } from '../../components/analytics/AnalyticsSummaryCards';
import { CategoryExpenseChart } from '../../components/analytics/CategoryExpenseChart';
import { IncomeExpenseBarChart } from '../../components/analytics/IncomeExpenseBarChart';
import { SmartAlertsSection } from '../../components/analytics/SmartAlertsSection';
import {
  Calendar,
  Plus,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';

export const AnalyticsPage: React.FC = () => {
  const { transactions, summary } = useTransactions();
  const { preferredCurrency, rates, formatCurrency } = useCurrency();
  const { metrics, selectedMonth, setSelectedMonth } = useBudget();

  // Month navigation helpers
  const handlePrevMonth = () => {
    if (!selectedMonth || selectedMonth === 'all') return;
    const [y, m] = selectedMonth.split('-').map(Number);
    const date = new Date(y, m - 2, 1);
    const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(newMonth);
  };

  const handleNextMonth = () => {
    if (!selectedMonth || selectedMonth === 'all') return;
    const [y, m] = selectedMonth.split('-').map(Number);
    const date = new Date(y, m, 1);
    const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(newMonth);
  };

  const handleResetToCurrentMonth = () => {
    const d = new Date();
    const currentMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(currentMonth);
  };

  const formattedMonthLabel = useMemo(() => {
    if (!selectedMonth || selectedMonth === 'all') return 'All Time';
    const [y, m] = selectedMonth.split('-').map(Number);
    const date = new Date(y, m - 1, 1);
    return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);
  }, [selectedMonth]);

  const isCurrentMonth = useMemo(() => {
    const d = new Date();
    const currentMonthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return selectedMonth === currentMonthStr;
  }, [selectedMonth]);

  // Analytics Calculations (strictly memoized on live data in preferredCurrency)
  const categoryData = useMemo(
    () => getExpensesByCategory(transactions, preferredCurrency, rates),
    [transactions, preferredCurrency, rates]
  );

  const cashFlowData = useMemo(
    () => getMonthlyCashFlow(transactions, preferredCurrency, rates),
    [transactions, preferredCurrency, rates]
  );

  const analyticsMetrics = useMemo(
    () => getAnalyticsSummary(transactions, preferredCurrency, rates),
    [transactions, preferredCurrency, rates]
  );

  const spendingAlerts = useMemo(
    () =>
      calculateSpendingAlerts(
        transactions,
        metrics.categoryBudgets,
        metrics.monthlyBudget,
        preferredCurrency,
        rates
      ),
    [transactions, metrics.categoryBudgets, metrics.monthlyBudget, preferredCurrency, rates]
  );

  const periodComparison = useMemo(
    () =>
      calculatePeriodComparison(
        transactions,
        selectedMonth,
        preferredCurrency,
        rates
      ),
    [transactions, selectedMonth, preferredCurrency, rates]
  );

  return (
    <div className="space-y-6">
      {/* Top Header Strip & Period Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-[#8e8bf5] border border-indigo-200/60 dark:border-indigo-500/30">
              Financial Insights
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            Spending & Cash Flow Insights ({preferredCurrency})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Understand where your money goes with clear category breakdowns, trends, and smart alerts.
          </p>
        </div>

        {/* Controls: Month Navigator + Add Expense */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Month Navigator */}
          <div className="flex items-center bg-white dark:bg-[#16171d] border border-slate-200/80 dark:border-[#22242d] rounded-xl p-1 shadow-xs">
            <button
              type="button"
              onClick={handlePrevMonth}
              title="Previous Month"
              className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-[#20222a] transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1 px-2 sm:px-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 min-w-[105px] sm:min-w-[130px] justify-center">
              <Calendar className="w-3.5 h-3.5 text-indigo-500 dark:text-[#8e8bf5] shrink-0" />
              <span className="truncate">{formattedMonthLabel}</span>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              title="Next Month"
              className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-[#20222a] transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {!isCurrentMonth && (
            <button
              type="button"
              onClick={handleResetToCurrentMonth}
              className="px-3 py-2 bg-slate-100 dark:bg-[#1e2028] hover:bg-slate-200 dark:hover:bg-[#252834] text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all"
            >
              Current Month
            </button>
          )}

          {/* Quick Add Expense */}
          <Link
            to="/add-expense"
            className="px-3.5 py-2 bg-[#8e8bf5] hover:bg-[#9d9af7] active:scale-[0.98] text-[#1d1760] font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Expense</span>
          </Link>
        </div>
      </div>

      {/* 1. Summary Metrics KPI Cards */}
      <AnalyticsSummaryCards metrics={analyticsMetrics} />

      {/* 2. Period Comparison Banner (Where enough data exists) */}
      {periodComparison.hasEnoughData && (
        <div className="p-4 sm:p-5 bg-white dark:bg-[#16171d] border border-slate-200/80 dark:border-[#22242d] rounded-2xl shadow-subtle dark:shadow-none flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className={clsx(
                'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                periodComparison.isIncrease
                  ? 'bg-amber-50 dark:bg-[#2e1f14] text-amber-600 dark:text-[#fbbf24]'
                  : 'bg-emerald-50 dark:bg-[#14291f] text-emerald-600 dark:text-[#4ade80]'
              )}
            >
              {periodComparison.isIncrease ? (
                <TrendingUp className="w-5 h-5" />
              ) : (
                <TrendingDown className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Monthly Spending Comparison ({formattedMonthLabel})
                </h4>
                <span
                  className={clsx(
                    'text-[10px] font-extrabold px-2 py-0.5 rounded-md',
                    periodComparison.isIncrease
                      ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                      : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                  )}
                >
                  {periodComparison.isIncrease ? '+' : '-'}{periodComparison.percentageChange}%
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                {periodComparison.isIncrease ? (
                  <>
                    You spent <strong className="text-slate-800 dark:text-slate-200">{formatCurrency(periodComparison.difference, preferredCurrency)}</strong> more than the previous month ({formatCurrency(periodComparison.previousTotal, preferredCurrency)}).
                  </>
                ) : (
                  <>
                    You spent <strong className="text-slate-800 dark:text-slate-200">{formatCurrency(periodComparison.difference, preferredCurrency)}</strong> less than the previous month ({formatCurrency(periodComparison.previousTotal, preferredCurrency)}).
                  </>
                )}
              </p>
            </div>
          </div>

          <Link
            to="/expenses"
            className="text-xs font-bold text-indigo-600 dark:text-[#8e8bf5] hover:underline flex items-center gap-1 shrink-0 self-start sm:self-auto"
          >
            <span>View All Expenses</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* 3. Interactive Charts Grid (Spending by Category & Cash Flow Trends) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-6 min-w-0 w-full">
          <CategoryExpenseChart
            data={categoryData}
            totalSpent={summary.totalExpenses}
          />
        </div>
        <div className="lg:col-span-6 min-w-0 w-full">
          <IncomeExpenseBarChart
            data={cashFlowData}
            totalIncome={summary.totalIncome}
            totalExpenses={summary.totalExpenses}
          />
        </div>
      </div>

      {/* 4. Simple Smart Alerts Section */}
      <SmartAlertsSection alerts={spendingAlerts} />
    </div>
  );
};
