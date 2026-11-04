import React from 'react';
import { AnalyticsSummaryMetrics } from '../../utils/analyticsCalculations';
import { useCurrency } from '../../context/CurrencyContext';
import {
  TrendingUp,
  TrendingDown,
  Flame,
  Activity,
} from 'lucide-react';

interface AnalyticsSummaryCardsProps {
  metrics: AnalyticsSummaryMetrics;
}

export const AnalyticsSummaryCards: React.FC<AnalyticsSummaryCardsProps> = ({ metrics }) => {
  const { preferredCurrency, formatCurrency } = useCurrency();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {/* 1. Total Earned */}
      <div className="group bg-white dark:bg-[#12131a] border border-slate-200/80 dark:border-[#1e202b] hover:border-emerald-200 dark:hover:border-emerald-500/30 rounded-3xl p-4 sm:p-6 flex flex-col justify-between min-h-[135px] sm:min-h-[145px] shadow-subtle dark:shadow-none transition-all duration-200">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Earned
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-[#14291f] text-emerald-600 dark:text-[#22c55e] flex items-center justify-center border border-emerald-200/60 dark:border-emerald-500/20 shadow-2xs group-hover:scale-105 transition-transform">
            <TrendingUp className="w-4 h-4 stroke-[2.2]" />
          </div>
        </div>
        <div className="mt-3 min-w-0">
          <div className="text-xl min-[360px]:text-2xl sm:text-[26px] font-black text-emerald-600 dark:text-[#22c55e] tracking-tight tabular-nums truncate">
            +{formatCurrency(metrics.totalEarned, preferredCurrency)}
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-1 block truncate">
            {metrics.incomeCount} recorded inflows
          </span>
        </div>
      </div>

      {/* 2. Total Spent */}
      <div className="group bg-white dark:bg-[#12131a] border border-slate-200/80 dark:border-[#1e202b] hover:border-rose-200 dark:hover:border-rose-500/30 rounded-3xl p-4 sm:p-6 flex flex-col justify-between min-h-[135px] sm:min-h-[145px] shadow-subtle dark:shadow-none transition-all duration-200">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Spent
          </span>
          <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-[#2e181e] text-rose-600 dark:text-[#f87171] flex items-center justify-center border border-rose-200/60 dark:border-rose-500/20 shadow-2xs group-hover:scale-105 transition-transform">
            <TrendingDown className="w-4 h-4 stroke-[2.2]" />
          </div>
        </div>
        <div className="mt-3 min-w-0">
          <div className="text-xl min-[360px]:text-2xl sm:text-[26px] font-black text-rose-600 dark:text-[#f87171] tracking-tight tabular-nums truncate">
            −{formatCurrency(metrics.totalSpent, preferredCurrency)}
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-1 block truncate">
            {metrics.expenseCount} recorded outflows
          </span>
        </div>
      </div>

      {/* 3. Highest Spending Category */}
      <div className="group bg-white dark:bg-[#12131a] border border-slate-200/80 dark:border-[#1e202b] hover:border-amber-200 dark:hover:border-amber-500/30 rounded-3xl p-4 sm:p-6 flex flex-col justify-between min-h-[135px] sm:min-h-[145px] shadow-subtle dark:shadow-none transition-all duration-200">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Top Category
          </span>
          <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-[#2e1c18] text-[#fb923c] flex items-center justify-center border border-amber-200/60 dark:border-amber-500/20 shadow-2xs group-hover:scale-105 transition-transform">
            <Flame className="w-4 h-4 stroke-[2.2]" />
          </div>
        </div>
        <div className="mt-3 min-w-0">
          <div className="text-xl min-[360px]:text-2xl sm:text-[26px] font-black text-slate-900 dark:text-white tracking-tight truncate">
            {metrics.highestCategory ? metrics.highestCategory.name : 'None'}
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-1 block truncate">
            {metrics.highestCategory
              ? `${formatCurrency(metrics.highestCategory.amount, preferredCurrency)} (${metrics.highestCategory.percentage}%)`
              : 'No expenses logged'}
          </span>
        </div>
      </div>

      {/* 4. Total Transactions Volume */}
      <div className="group bg-white dark:bg-[#12131a] border border-slate-200/80 dark:border-[#1e202b] hover:border-indigo-200 dark:hover:border-indigo-500/30 rounded-3xl p-4 sm:p-6 flex flex-col justify-between min-h-[135px] sm:min-h-[145px] shadow-subtle dark:shadow-none transition-all duration-200">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Volume & Activity
          </span>
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-[#1b1f38] text-indigo-600 dark:text-[#8e8bf5] flex items-center justify-center border border-indigo-200/60 dark:border-indigo-500/20 shadow-2xs group-hover:scale-105 transition-transform">
            <Activity className="w-4 h-4 stroke-[2.2]" />
          </div>
        </div>
        <div className="mt-3 min-w-0">
          <div className="text-xl min-[360px]:text-2xl sm:text-[26px] font-black text-slate-900 dark:text-white tracking-tight tabular-nums truncate">
            {metrics.totalTransactions}
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-1 block truncate">
            Avg. Outflow: {formatCurrency(metrics.averageExpense, preferredCurrency)}
          </span>
        </div>
      </div>
    </div>
  );
};
