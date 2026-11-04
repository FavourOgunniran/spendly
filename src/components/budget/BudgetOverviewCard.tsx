import React from 'react';
import { BudgetMetrics } from '../../types';
import { useCurrency } from '../../context/CurrencyContext';
import {
  Wallet,
  TrendingDown,
  PiggyBank,
  Percent,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  HelpCircle,
  Edit3,
  PlusCircle,
  RotateCcw,
} from 'lucide-react';
import { clsx } from 'clsx';

interface BudgetOverviewCardProps {
  metrics: BudgetMetrics;
  onEditBudget: () => void;
  onResetBudget?: () => void;
}

export const BudgetOverviewCard: React.FC<BudgetOverviewCardProps> = ({
  metrics,
  onEditBudget,
  onResetBudget,
}) => {
  const { preferredCurrency, formatCurrency } = useCurrency();
  const {
    monthlyBudget,
    totalExpenses,
    remainingBudget,
    percentageUsed,
    isOverBudget,
    overBudgetAmount,
    status,
  } = metrics;

  const isBudgetSet = monthlyBudget > 0;
  // Clamped percentage for the visual bar (capped at 100% for width rendering)
  const visualPercentage = Math.min(Math.max(percentageUsed, 0), 100);

  const formattedMonth = (() => {
    if (!metrics.selectedMonth || metrics.selectedMonth === 'all') return 'Monthly';
    const [y, m] = metrics.selectedMonth.split('-').map(Number);
    const d = new Date(y, m - 1, 1);
    return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(d);
  })();

  // Status Icon
  const StatusIcon =
    status.level === 'safe'
      ? CheckCircle2
      : status.level === 'warning'
      ? AlertTriangle
      : status.level === 'critical' || status.level === 'exceeded'
      ? AlertOctagon
      : HelpCircle;

  return (
    <div className="bg-white dark:bg-[#12131a] border border-slate-200/80 dark:border-[#1e202b] rounded-3xl p-4 sm:p-6 lg:p-7 shadow-subtle dark:shadow-none space-y-5 sm:space-y-6 transition-colors duration-200">
      {/* Card Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-2 border-b border-slate-100 dark:border-[#22242d]">
        <div className="min-w-0">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block truncate">
            Overall Target • {formattedMonth} ({preferredCurrency})
          </span>
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
            Spending Limit & Velocity
          </h3>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto shrink-0">
          {isBudgetSet && onResetBudget && (
            <button
              type="button"
              onClick={onResetBudget}
              title="Reset budget target"
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 dark:bg-[#1e2028] hover:bg-slate-100 dark:hover:bg-[#252834] text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-[#2f3242] rounded-xl text-xs font-semibold transition-all shadow-sm cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          <button
            type="button"
            onClick={onEditBudget}
            className={clsx(
              'flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer',
              isBudgetSet
                ? 'bg-slate-50 dark:bg-[#1e2028] hover:bg-slate-100 dark:hover:bg-[#252834] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#2f3242]'
                : 'bg-[#8e8bf5] hover:bg-[#9d9af7] text-[#1d1760] shadow-indigo-500/20 active:scale-[0.98]'
            )}
          >
            {isBudgetSet ? (
              <>
                <Edit3 className="w-3.5 h-3.5 text-indigo-500 dark:text-[#8e8bf5]" />
                <span>Adjust Budget</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Set Budget for {formattedMonth}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 4 Metric Columns Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* 1. Monthly Budget */}
        <div className="p-3 sm:p-4 bg-slate-50/80 dark:bg-[#121319] border border-slate-200/60 dark:border-[#22242e] rounded-xl flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10.5px] sm:text-[11px] font-bold uppercase tracking-wider truncate">
              Budget
            </span>
            <Wallet className="w-4 h-4 text-indigo-500 dark:text-[#8e8bf5] shrink-0" />
          </div>
          <div className="min-w-0">
            <div className="text-sm min-[360px]:text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight tabular-nums truncate">
              {isBudgetSet ? formatCurrency(monthlyBudget, preferredCurrency) : 'Not Set'}
            </div>
            <span className="text-[10px] sm:text-[10.5px] text-slate-400 font-medium block truncate">
              {isBudgetSet ? 'Monthly limit' : 'Click Adjust to set'}
            </span>
          </div>
        </div>

        {/* 2. Total Spent */}
        <div className="p-3 sm:p-4 bg-slate-50/80 dark:bg-[#121319] border border-slate-200/60 dark:border-[#22242e] rounded-xl flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10.5px] sm:text-[11px] font-bold uppercase tracking-wider truncate">
              Spent
            </span>
            <TrendingDown className="w-4 h-4 text-rose-500 dark:text-[#f87171] shrink-0" />
          </div>
          <div className="min-w-0">
            <div className="text-sm min-[360px]:text-base sm:text-xl font-black text-rose-600 dark:text-[#f87171] tracking-tight tabular-nums truncate">
              {formatCurrency(totalExpenses, preferredCurrency)}
            </div>
            <span className="text-[10px] sm:text-[10.5px] text-slate-400 font-medium block truncate">
              Actual expenses
            </span>
          </div>
        </div>

        {/* 3. Remaining Budget */}
        <div className="p-3 sm:p-4 bg-slate-50/80 dark:bg-[#121319] border border-slate-200/60 dark:border-[#22242e] rounded-xl flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10.5px] sm:text-[11px] font-bold uppercase tracking-wider truncate">
              Remaining
            </span>
            <PiggyBank
              className={clsx(
                'w-4 h-4 shrink-0',
                !isBudgetSet
                  ? 'text-slate-400'
                  : isOverBudget
                  ? 'text-rose-500'
                  : 'text-emerald-500'
              )}
            />
          </div>
          <div className="min-w-0">
            <div
              className={clsx(
                'text-sm min-[360px]:text-base sm:text-xl font-black tracking-tight tabular-nums truncate',
                !isBudgetSet
                  ? 'text-slate-500'
                  : isOverBudget
                  ? 'text-rose-600 dark:text-[#f87171]'
                  : 'text-emerald-600 dark:text-[#22c55e]'
              )}
            >
              {!isBudgetSet
                ? '—'
                : isOverBudget
                ? `-${formatCurrency(overBudgetAmount, preferredCurrency)}`
                : formatCurrency(remainingBudget, preferredCurrency)}
            </div>
            <span className="text-[10px] sm:text-[10.5px] text-slate-400 font-medium block truncate">
              {!isBudgetSet
                ? 'Target required'
                : isOverBudget
                ? 'Over budget'
                : 'Available to spend'}
            </span>
          </div>
        </div>

        {/* 4. Percentage Used */}
        <div className="p-3 sm:p-4 bg-slate-50/80 dark:bg-[#121319] border border-slate-200/60 dark:border-[#22242e] rounded-xl flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10.5px] sm:text-[11px] font-bold uppercase tracking-wider truncate">
              Progress
            </span>
            <Percent className="w-4 h-4 text-indigo-500 dark:text-[#8e8bf5] shrink-0" />
          </div>
          <div className="min-w-0">
            <div className="text-sm min-[360px]:text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight tabular-nums truncate">
              {isBudgetSet ? `${percentageUsed}%` : '0%'}
            </div>
            <span className="text-[10px] sm:text-[10.5px] text-slate-400 font-medium block truncate">
              {isBudgetSet ? 'Of total ceiling' : 'No ceiling set'}
            </span>
          </div>
        </div>
      </div>

      {/* Visual Progress Meter Bar */}
      {isBudgetSet && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-700 dark:text-slate-300">
              Budget Consumption
            </span>
            <span className={clsx('font-extrabold', status.colorClass)}>
              {percentageUsed}% Used {isOverBudget && '(Exceeded)'}
            </span>
          </div>

          {/* Progress Track */}
          <div className="w-full h-3.5 bg-slate-100 dark:bg-[#20222a] rounded-full overflow-hidden p-0.5 border border-slate-200/60 dark:border-[#282a36]">
            <div
              className={clsx(
                'h-full rounded-full transition-all duration-700 bg-gradient-to-r',
                status.progressGradient
              )}
              style={{ width: `${visualPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Dynamic Status Feedback Banner */}
      <div
        className={clsx(
          'p-4 rounded-xl border flex items-center justify-between gap-3 transition-all',
          status.badgeClass
        )}
      >
        <div className="flex items-center gap-3">
          <StatusIcon className="w-5 h-5 shrink-0 stroke-[2.2]" />
          <div className="flex flex-col">
            {!isBudgetSet ? (
              <span className="text-xs font-bold leading-tight">
                No monthly budget target configured for {formattedMonth} yet.
              </span>
            ) : (
              <span className="text-xs font-bold leading-tight">
                {status.message}
              </span>
            )}
            {isOverBudget && (
              <span className="text-[11px] opacity-90 mt-0.5 font-medium">
                You have exceeded your planned limit by {formatCurrency(overBudgetAmount, preferredCurrency)}. Consider adjusting your budget or reducing non-essential expenses.
              </span>
            )}
            {!isBudgetSet && (
              <span className="text-[11px] opacity-90 mt-0.5 font-medium">
                Define a spending ceiling for {formattedMonth} to monitor cash flow and prevent overspending.
              </span>
            )}
          </div>
        </div>

        {!isBudgetSet && (
          <button
            type="button"
            onClick={onEditBudget}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shrink-0 transition-all shadow-xs cursor-pointer"
          >
            Create Budget
          </button>
        )}
      </div>
    </div>
  );
};
