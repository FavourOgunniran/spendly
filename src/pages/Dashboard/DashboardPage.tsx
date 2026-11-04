import React, { useMemo } from 'react';
import { useTransactions } from '../../context/TransactionContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useBudget } from '../../context/BudgetContext';
import { useCategories } from '../../context/CategoryContext';
import { getExpensesByCategory } from '../../utils/analyticsCalculations';
import { calculateSpendingAlerts } from '../../utils/alertCalculations';
import { Link } from 'react-router-dom';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  ArrowRight,
  Plus,
  Clock,
  PieChart as PieIcon,
  AlertTriangle,
  AlertOctagon,
  Target,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { clsx } from 'clsx';
import { EmptyState } from '../../components/ui/EmptyState';
import { renderCategoryIcon } from '../../utils/iconHelper';
import { CURRENCY_MAP } from '../../services/currencyService';

export const DashboardPage: React.FC = () => {
  const { summary, transactions } = useTransactions();
  const { preferredCurrency, rates, formatCurrency, convert } = useCurrency();
  const { metrics } = useBudget();
  const { getCategoryIconName, getCategoryColor } = useCategories();
  const { totalBalance, totalIncome, totalExpenses, savingsRate } = summary;

  // Dynamically compute real category breakdown strictly from live transactions in preferredCurrency
  const categoryExpenses = useMemo(
    () => getExpensesByCategory(transactions, preferredCurrency, rates),
    [transactions, preferredCurrency, rates]
  );

  // Compute smart spending alerts
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

  const topAlert = spendingAlerts.length > 0 ? spendingAlerts[0] : null;

  // SVG Donut calculation constants
  const radius = 36;
  const circumference = 2 * Math.PI * radius;

  // Map real authenticated user transactions for recent activity display (newest first, up to 5)
  const recentActivities = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => {
      const timeA = new Date(a.date).getTime();
      const timeB = new Date(b.date).getTime();
      const diff = timeB - timeA;
      if (diff !== 0) return diff;
      const createdA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const createdB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (createdB !== createdA) return createdB - createdA;
      return b.id.localeCompare(a.id);
    });

    return sorted.slice(0, 5).map((tx) => {
      const txCurr = tx.currency || 'NGN';
      const isDiff = txCurr.toUpperCase() !== preferredCurrency.toUpperCase();
      const converted = isDiff ? convert(tx.amount, txCurr, preferredCurrency) : tx.amount;
      const catColor = getCategoryColor(tx.category);
      const iconName = getCategoryIconName(tx.category);

      return {
        id: tx.id,
        title: tx.title || tx.category || 'Untitled Transaction',
        category: tx.category || 'Other',
        date: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(
          new Date(tx.date)
        ),
        amount: tx.type === 'income' ? converted : -converted,
        rawAmount: tx.type === 'income' ? tx.amount : -tx.amount,
        rawCurrency: txCurr,
        isDifferentCurrency: isDiff,
        type: tx.type,
        color: catColor,
        iconName,
      };
    });
  }, [transactions, preferredCurrency, convert, getCategoryColor, getCategoryIconName]);

  // Prepare dynamic donut slices
  let accumulatedOffset = 0;
  const donutSlices = categoryExpenses.map((cat) => {
    const strokeLength = (cat.percentage / 100) * circumference;
    const strokeOffset = -accumulatedOffset;
    accumulatedOffset += strokeLength;
    return {
      ...cat,
      strokeLength,
      strokeOffset,
    };
  });

  const currencyFlag = CURRENCY_MAP[preferredCurrency]?.flag || '🌐';

  return (
    <div className="space-y-6">
      {/* 0. Proactive Spending Alert Banner (if any detected) */}
      {topAlert && (
        <div
          className={clsx(
            'p-3.5 sm:p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in transition-all',
            topAlert.severity === 'danger'
              ? 'bg-rose-50/90 dark:bg-[#1e1216] border-rose-200 dark:border-rose-900/60'
              : 'bg-amber-50/90 dark:bg-[#1e1710] border-amber-200 dark:border-amber-900/60'
          )}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={clsx(
                'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border shadow-2xs',
                topAlert.severity === 'danger'
                  ? 'bg-rose-100 dark:bg-[#2c151c] text-rose-600 dark:text-[#f87171] border-rose-200 dark:border-rose-800/40'
                  : 'bg-amber-100 dark:bg-[#2c2214] text-amber-600 dark:text-[#fbbf24] border-amber-200 dark:border-amber-800/40'
              )}
            >
              {topAlert.severity === 'danger' ? (
                <AlertOctagon className="w-4 h-4" />
              ) : (
                <AlertTriangle className="w-4 h-4" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {topAlert.title}
                </span>
                {topAlert.metricLabel && (
                  <span
                    className={clsx(
                      'px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide',
                      topAlert.severity === 'danger'
                        ? 'bg-rose-200/70 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200'
                        : 'bg-amber-200/70 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200'
                    )}
                  >
                    {topAlert.metricLabel}
                  </span>
                )}
              </div>
              <p className="text-[11.5px] text-slate-600 dark:text-slate-300 font-medium line-clamp-1 mt-0.5">
                {topAlert.message}
              </p>
            </div>
          </div>

          <Link
            to="/insights"
            className="text-xs font-bold text-indigo-600 dark:text-[#8e8bf5] hover:underline shrink-0 flex items-center gap-1 self-end sm:self-auto"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* 1. Hero Total Balance Card (Fintech Layout inspired by Reference) */}
      <div className="w-full bg-white dark:bg-[#12131a] border border-slate-200/80 dark:border-[#1e202b] rounded-3xl p-4 sm:p-6 lg:p-7 relative overflow-hidden shadow-subtle dark:shadow-none transition-all duration-200">
        {/* Top Header Row with Currency Chip & Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-[#1a1b24]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-[#1c1e2e] text-indigo-600 dark:text-[#8e8bf5] flex items-center justify-center border border-indigo-200/60 dark:border-indigo-500/20 shadow-2xs shrink-0">
              <Wallet className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Total Calculated Balance
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#1e202a] text-[10px] font-extrabold text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-white/5">
                  <span>{currencyFlag}</span>
                  <span>{preferredCurrency}</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5 truncate">
                Real-time synchronized net capital
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap w-full sm:w-auto">
            <Link
              to="/budget"
              className="flex-1 sm:flex-initial justify-center px-3.5 py-2 bg-slate-100 hover:bg-slate-200/80 dark:bg-[#1e202a] dark:hover:bg-[#252836] text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer text-center"
            >
              <Target className="w-3.5 h-3.5 text-indigo-500 dark:text-[#8e8bf5]" />
              <span>Budgets</span>
            </Link>
            <Link
              to="/add-expense"
              className="flex-1 sm:flex-initial justify-center px-4 py-2 bg-[#8e8bf5] hover:bg-[#9e9bf8] active:scale-[0.98] text-[#1d1760] rounded-xl text-xs font-black shadow-xs flex items-center gap-1.5 transition-all cursor-pointer text-center"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Record Expense</span>
            </Link>
          </div>
        </div>

        {/* Large Balance Display with Micro-indicators */}
        <div className="pt-6 flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div className="min-w-0 flex-1">
            <div className="text-2xl min-[360px]:text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white tabular-nums leading-tight break-words">
              {formatCurrency(totalBalance, preferredCurrency)}
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-2.5 sm:mt-3">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-[#14291f] text-emerald-700 dark:text-[#22c55e] text-[10.5px] sm:text-[11px] font-extrabold border border-emerald-200/60 dark:border-emerald-500/20 shrink-0">
                <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                <span>Live Portfolio</span>
              </span>
              <span className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 font-medium truncate">
                Combined cash flow across all categories
              </span>
            </div>
          </div>

          {/* Mini Inflow vs Outflow pill badges */}
          <div className="grid grid-cols-1 min-[380px]:grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <div className="p-2 sm:p-3 bg-slate-50 dark:bg-[#161720] border border-slate-100 dark:border-[#20222e] rounded-2xl flex items-center gap-1.5 sm:gap-2.5 min-w-0">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl bg-emerald-100/80 dark:bg-[#14291f] text-emerald-600 dark:text-[#22c55e] flex items-center justify-center shrink-0">
                <ArrowDownRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[9.5px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">Inflow</span>
                <span className="text-xs sm:text-sm font-black text-emerald-600 dark:text-[#22c55e] tabular-nums truncate block">
                  +{formatCurrency(totalIncome, preferredCurrency)}
                </span>
              </div>
            </div>

            <div className="p-2 sm:p-3 bg-slate-50 dark:bg-[#161720] border border-slate-100 dark:border-[#20222e] rounded-2xl flex items-center gap-1.5 sm:gap-2.5 min-w-0">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl bg-rose-100/80 dark:bg-[#2e181e] text-rose-600 dark:text-[#f87171] flex items-center justify-center shrink-0">
                <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[9.5px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">Outflow</span>
                <span className="text-xs sm:text-sm font-black text-rose-600 dark:text-[#f87171] tabular-nums truncate block">
                  −{formatCurrency(totalExpenses, preferredCurrency)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Three Metric Cards Row (Refined Fintech Layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Total Income */}
        <div className="group bg-white dark:bg-[#12131a] border border-slate-200/80 dark:border-[#1e202b] hover:border-emerald-200 dark:hover:border-emerald-500/30 rounded-3xl p-4 sm:p-6 flex flex-col justify-between min-h-[135px] sm:min-h-[145px] shadow-subtle dark:shadow-none transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Income
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-[#14291f] text-emerald-600 dark:text-[#22c55e] flex items-center justify-center border border-emerald-200/60 dark:border-emerald-500/20 shadow-2xs group-hover:scale-105 transition-transform">
              <TrendingUp className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-3 min-w-0">
            <div className="text-xl sm:text-2xl lg:text-3xl font-black text-emerald-600 dark:text-[#22c55e] tracking-tight tabular-nums truncate">
              +{formatCurrency(totalIncome, preferredCurrency)}
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-1 block">
              Cumulative incoming cash receipts
            </span>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="group bg-white dark:bg-[#12131a] border border-slate-200/80 dark:border-[#1e202b] hover:border-rose-200 dark:hover:border-rose-500/30 rounded-3xl p-4 sm:p-6 flex flex-col justify-between min-h-[135px] sm:min-h-[145px] shadow-subtle dark:shadow-none transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Expenses
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-[#2e181e] text-rose-600 dark:text-[#f87171] flex items-center justify-center border border-rose-200/60 dark:border-rose-500/20 shadow-2xs group-hover:scale-105 transition-transform">
              <TrendingDown className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-3 min-w-0">
            <div className="text-xl sm:text-2xl lg:text-3xl font-black text-rose-600 dark:text-[#f87171] tracking-tight tabular-nums truncate">
              −{formatCurrency(totalExpenses, preferredCurrency)}
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-1 block">
              Recorded outlays and subscriptions
            </span>
          </div>
        </div>

        {/* Savings Rate */}
        <div className="group sm:col-span-2 lg:col-span-1 bg-white dark:bg-[#12131a] border border-slate-200/80 dark:border-[#1e202b] hover:border-indigo-200 dark:hover:border-indigo-500/30 rounded-3xl p-4 sm:p-6 flex flex-col justify-between min-h-[135px] sm:min-h-[145px] shadow-subtle dark:shadow-none transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Savings Retention Rate
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-[#1b1f38] text-indigo-600 dark:text-[#8e8bf5] flex items-center justify-center border border-indigo-200/60 dark:border-indigo-500/20 shadow-2xs group-hover:scale-105 transition-transform">
              <PiggyBank className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-3 min-w-0">
            <div className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight tabular-nums truncate">
              {savingsRate.toFixed(1)}%
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-1 block">
              Net retained capital efficiency
            </span>
          </div>
        </div>
      </div>

      {/* 3. Budget Overview Card on Dashboard */}
      {metrics.monthlyBudget > 0 && (
        <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-[#12131a] border border-slate-200/80 dark:border-[#1e202b] shadow-subtle dark:shadow-none space-y-3.5 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-[#1c1e2e] text-indigo-600 dark:text-[#8e8bf5] flex items-center justify-center shrink-0">
                <Target className="w-4 h-4 stroke-[2.4]" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  Monthly Budget Utilization ({metrics.selectedMonth})
                </h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium truncate">
                  Spending progress against active ceiling
                </p>
              </div>
            </div>
            <Link
              to="/budget"
              className="text-xs font-bold text-indigo-600 dark:text-[#8e8bf5] hover:underline flex items-center gap-1 shrink-0"
            >
              <span>Manage Budgets</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-bold pt-1">
            <span className="text-slate-800 dark:text-slate-200 tabular-nums">
              {formatCurrency(metrics.totalExpenses, preferredCurrency)}{' '}
              <span className="text-slate-400 font-normal">/ {formatCurrency(metrics.monthlyBudget, preferredCurrency)} allocated</span>
            </span>
            <span
              className={clsx(
                'tabular-nums font-black',
                metrics.isOverBudget
                  ? 'text-rose-600 dark:text-[#f87171]'
                  : metrics.percentageUsed >= 80
                  ? 'text-amber-600 dark:text-[#fbbf24]'
                  : 'text-emerald-600 dark:text-[#22c55e]'
              )}
            >
              {metrics.percentageUsed.toFixed(0)}% used • {formatCurrency(metrics.remainingBudget, preferredCurrency)} left
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2.5 bg-slate-100 dark:bg-[#1c1e27] rounded-full overflow-hidden p-0.5 border border-slate-200/40 dark:border-white/5">
            <div
              className={clsx(
                'h-full rounded-full transition-all duration-700',
                metrics.isOverBudget
                  ? 'bg-rose-500'
                  : metrics.percentageUsed >= 80
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              )}
              style={{ width: `${Math.min(100, metrics.percentageUsed)}%` }}
            />
          </div>
        </div>
      )}

      {/* 4. Lower Row: Category Analytics & Recent Activity Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Spending by Category Donut */}
        <div className="lg:col-span-7 bg-white dark:bg-[#12131a] border border-slate-200/80 dark:border-[#1e202b] rounded-3xl p-4 sm:p-6 lg:p-7 shadow-subtle dark:shadow-none transition-colors duration-200">
          <div className="flex items-start justify-between mb-6 pb-3 border-b border-slate-100 dark:border-[#1c1d26]">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Spending Breakdown
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 font-medium">
                Distribution across categories ({preferredCurrency})
              </p>
            </div>
            <Link
              to="/insights"
              className="text-xs font-bold text-indigo-600 dark:text-[#8e8bf5] hover:underline transition-colors flex items-center gap-1"
            >
              <span>Insights</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {categoryExpenses.length > 0 && totalExpenses > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
              {/* Dynamic Donut SVG with Centered Hole Text */}
              <div className="sm:col-span-6 flex items-center justify-center relative py-2">
                <div className="w-48 h-48 relative flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle
                      cx="50"
                      cy="50"
                      r={radius}
                      fill="none"
                      stroke="currentColor"
                      className="text-slate-100 dark:text-[#1c1e28]"
                      strokeWidth="13"
                    />

                    {donutSlices.map((slice) => (
                      <circle
                        key={slice.name}
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="none"
                        stroke={slice.color}
                        strokeWidth="13"
                        strokeDasharray={`${slice.strokeLength} ${circumference}`}
                        strokeDashoffset={slice.strokeOffset}
                        className="transition-all duration-700 ease-out"
                      />
                    ))}
                  </svg>

                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-2">
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Total Spent
                    </span>
                    <span
                      className="text-base min-[360px]:text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight tabular-nums mt-0.5 max-w-[130px] truncate"
                      title={formatCurrency(totalExpenses, preferredCurrency)}
                    >
                      {formatCurrency(totalExpenses, preferredCurrency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Clean Legend Rows with Color Dots, Percentage & Right-Aligned Amounts */}
              <div className="sm:col-span-6 space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
                {categoryExpenses.map((cat) => {
                  const iconName = getCategoryIconName(cat.name);
                  return (
                    <div
                      key={cat.name}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-[#181a24] transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: `${cat.color}20`,
                            color: cat.color,
                          }}
                        >
                          {renderCategoryIcon(iconName, 'w-3.5 h-3.5')}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                            {cat.name}
                          </span>
                          <span className="text-[10px] text-slate-400 tabular-nums">
                            {cat.percentage}% of total
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-black text-slate-900 dark:text-white tabular-nums shrink-0">
                        {formatCurrency(cat.amount, preferredCurrency)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <EmptyState
              icon={<PieIcon className="w-6 h-6 text-indigo-500 dark:text-[#8e8bf5]" />}
              title="No expense data recorded"
              description="Add an expense transaction to view real-time category distribution."
              action={
                <Link
                  to="/add-expense"
                  className="px-4 py-2 bg-[#8e8bf5] hover:bg-[#9e9bf8] text-[#1d1760] rounded-xl text-xs font-bold transition-all inline-block shadow-xs"
                >
                  + Log Expense
                </Link>
              }
              className="py-10 bg-transparent border-0"
            />
          )}
        </div>

        {/* Right: Recent Activity Card */}
        <div className="lg:col-span-5 bg-white dark:bg-[#12131a] border border-slate-200/80 dark:border-[#1e202b] rounded-3xl p-4 sm:p-6 lg:p-7 shadow-subtle dark:shadow-none transition-colors duration-200">
          <div>
            {/* Header: Title + Count Badge + View All */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-[#1c1d26]">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  Recent Activity
                </h3>
                {transactions.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#1e202c] text-[10.5px] font-extrabold text-slate-600 dark:text-slate-300">
                    {Math.min(5, transactions.length)} of {transactions.length}
                  </span>
                )}
              </div>
              {transactions.length > 0 && (
                <Link
                  to="/expenses"
                  className="text-xs font-bold text-indigo-600 dark:text-[#8e8bf5] hover:text-indigo-700 dark:hover:text-[#9e9bf9] flex items-center gap-1 transition-colors"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            {/* Transaction Feed */}
            {recentActivities.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-[#1c1d26]">
                {recentActivities.map((act) => {
                  const isPositive = act.type === 'income';
                  return (
                    <div
                      key={act.id}
                      className="group flex items-center justify-between py-3 px-2 -mx-2 rounded-xl hover:bg-slate-50/80 dark:hover:bg-[#181a24] transition-all duration-150"
                    >
                      {/* Left: Category Icon & Details */}
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105 shadow-2xs"
                          style={{
                            backgroundColor: `${act.color}15`,
                            color: act.color,
                            borderColor: `${act.color}30`,
                          }}
                        >
                          {renderCategoryIcon(act.iconName, 'w-4 h-4')}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-[#8e8bf5] transition-colors truncate">
                            {act.title}
                          </span>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                            <span className="truncate">{act.category}</span>
                            <span className="text-slate-300 dark:text-slate-600">•</span>
                            <span className="shrink-0">{act.date}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Amount & Currency Details */}
                      <div className="flex flex-col items-end shrink-0 pl-2">
                        <span
                          className={clsx(
                            'text-xs sm:text-sm font-black tracking-tight tabular-nums',
                            isPositive
                              ? 'text-emerald-600 dark:text-[#22c55e]'
                              : 'text-slate-900 dark:text-white'
                          )}
                        >
                          {isPositive
                            ? `+${formatCurrency(Math.abs(act.rawAmount), act.rawCurrency)}`
                            : `−${formatCurrency(Math.abs(act.rawAmount), act.rawCurrency)}`}
                        </span>
                        {act.isDifferentCurrency && (
                          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 tabular-nums mt-0.5">
                            ≈ {isPositive ? '+' : '−'}{formatCurrency(Math.abs(act.amount), preferredCurrency)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 px-4 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-[#1e202c] text-indigo-500 dark:text-[#8e8bf5] flex items-center justify-center mb-3 shadow-xs">
                  <Clock className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  No recent activity
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[220px]">
                  Add your first expense to start tracking your spending.
                </p>
                <Link
                  to="/add-expense"
                  className="mt-4 px-4 py-2 bg-[#8e8bf5] hover:bg-[#9e9bf8] text-[#1d1760] rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Add Expense</span>
                </Link>
              </div>
            )}
          </div>

          {/* Bottom Footer Action Strip */}
          <div className="pt-3.5 mt-3 border-t border-slate-100 dark:border-[#1c1d26] flex items-center justify-between text-xs font-bold">
            <Link
              to="/categories"
              className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1e202c] transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-500 dark:text-[#8e8bf5]" />
              <span>Categories</span>
            </Link>
            <Link
              to="/add-expense"
              className="text-indigo-600 dark:text-[#8e8bf5] hover:underline flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-indigo-50/50 dark:hover:bg-[#1f2130] transition-colors"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Record Expense</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
