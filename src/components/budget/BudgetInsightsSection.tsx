import React from 'react';
import { BudgetMetrics } from '../../types';
import { useCurrency } from '../../context/CurrencyContext';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Calendar,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { clsx } from 'clsx';

interface BudgetInsightsSectionProps {
  metrics: BudgetMetrics;
}

export const BudgetInsightsSection: React.FC<BudgetInsightsSectionProps> = ({
  metrics,
}) => {
  const { preferredCurrency, formatCurrency } = useCurrency();
  const {
    insights,
    daysInMonth,
    daysPassed,
    daysRemaining,
    dailyBurnRate,
    projectedMonthlySpend,
    projectedBudgetDifference,
    monthlyBudget,
    totalExpenses,
  } = metrics;

  const isBudgetSet = monthlyBudget > 0;
  const hasExpenses = totalExpenses > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-[#1e2028] text-indigo-600 dark:text-[#8e8bf5] flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Budget Intelligence & Spending Velocity ({preferredCurrency})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Calculated real-time forecasts based on actual expense pacing in {preferredCurrency}
            </p>
          </div>
        </div>

        {/* Days Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-[#1c1e27] border border-slate-200/60 dark:border-[#282a36] rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>
            Day {daysPassed} of {daysInMonth} ({daysRemaining} days left)
          </span>
        </div>
      </div>

      {/* Spending Velocity Bar */}
      {isBudgetSet && hasExpenses && (
        <div className="p-5 bg-white dark:bg-[#16171d] border border-slate-200/80 dark:border-[#22242d] rounded-2xl shadow-subtle dark:shadow-none space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={clsx(
                  'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                  projectedBudgetDifference >= 0
                    ? 'bg-emerald-50 dark:bg-[#14291f] text-emerald-600 dark:text-[#4ade80]'
                    : 'bg-rose-50 dark:bg-[#2e181e] text-rose-600 dark:text-[#f87171]'
                )}
              >
                {projectedBudgetDifference >= 0 ? (
                  <ShieldCheck className="w-5 h-5" />
                ) : (
                  <AlertOctagon className="w-5 h-5" />
                )}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {projectedBudgetDifference >= 0
                    ? 'Pacing within Budget Target'
                    : 'Projected Budget Overrun Warning'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  Current burn rate is{' '}
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {formatCurrency(dailyBurnRate, preferredCurrency)}/day
                  </span>
                  . Estimated month-end total:{' '}
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {formatCurrency(projectedMonthlySpend, preferredCurrency)}
                  </span>
                  .
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
              <div className="text-right">
                <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">
                  {projectedBudgetDifference >= 0 ? 'Projected Surplus' : 'Projected Deficit'}
                </span>
                <span
                  className={clsx(
                    'text-sm font-extrabold tracking-tight',
                    projectedBudgetDifference >= 0
                      ? 'text-emerald-600 dark:text-[#4ade80]'
                      : 'text-rose-600 dark:text-[#f87171]'
                  )}
                >
                  {projectedBudgetDifference >= 0
                    ? `+${formatCurrency(projectedBudgetDifference, preferredCurrency)}`
                    : `-${formatCurrency(Math.abs(projectedBudgetDifference), preferredCurrency)}`}
                </span>
              </div>
            </div>
          </div>

          {/* Mini pace track */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
              <span>Month Progress ({Math.round((daysPassed / daysInMonth) * 100)}%)</span>
              <span>
                Projected Spend vs Budget ({Math.round((projectedMonthlySpend / (monthlyBudget || 1)) * 100)}%)
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-[#20222a] rounded-full overflow-hidden flex">
              <div
                className={clsx(
                  'h-full rounded-full transition-all duration-700',
                  projectedBudgetDifference >= 0 ? 'bg-[#22c55e]' : 'bg-[#f87171]'
                )}
                style={{
                  width: `${Math.min(
                    100,
                    Math.round((projectedMonthlySpend / (monthlyBudget || 1)) * 100)
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Grid of Dynamic Insights */}
      {insights.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {insights.map((ins) => {
            const Icon =
              ins.severity === 'danger'
                ? AlertOctagon
                : ins.severity === 'warning'
                ? AlertTriangle
                : ins.severity === 'success'
                ? CheckCircle2
                : TrendingUp;

            const cardBorder =
              ins.severity === 'danger'
                ? 'border-rose-200/80 dark:border-rose-900/40 bg-rose-50/40 dark:bg-[#201518]'
                : ins.severity === 'warning'
                ? 'border-amber-200/80 dark:border-amber-900/40 bg-amber-50/40 dark:bg-[#201b15]'
                : ins.severity === 'success'
                ? 'border-emerald-200/80 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-[#14221a]'
                : 'border-slate-200/80 dark:border-[#22242d] bg-white dark:bg-[#16171d]';

            const iconStyles =
              ins.severity === 'danger'
                ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-[#f87171]'
                : ins.severity === 'warning'
                ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-[#fbbf24]'
                : ins.severity === 'success'
                ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-[#4ade80]'
                : 'bg-indigo-50 dark:bg-[#1f2233] text-indigo-600 dark:text-[#8e8bf5]';

            return (
              <div
                key={ins.id}
                className={clsx(
                  'p-4 rounded-2xl border flex flex-col justify-between space-y-3 transition-all duration-200 shadow-subtle dark:shadow-none',
                  cardBorder
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={clsx(
                        'w-8 h-8 rounded-xl flex items-center justify-center shrink-0',
                        iconStyles
                      )}
                    >
                      <Icon className="w-4 h-4 stroke-[2.2]" />
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                      {ins.title}
                    </span>
                  </div>
                  {ins.value && (
                    <span
                      className={clsx(
                        'text-xs font-extrabold px-2 py-0.5 rounded-lg shrink-0',
                        ins.severity === 'danger'
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                          : ins.severity === 'warning'
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                          : ins.severity === 'success'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          : 'bg-slate-100 dark:bg-[#20222a] text-slate-700 dark:text-slate-300'
                      )}
                    >
                      {ins.value}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {ins.description}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-6 bg-slate-50 dark:bg-[#14151b] border border-dashed border-slate-200 dark:border-[#282a36] rounded-2xl text-center">
          <Clock className="w-6 h-6 text-slate-400 mx-auto mb-2" />
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Awaiting Expense Activity
          </h4>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
            Dynamic spending intelligence and pace projections will populate as you log transactions for this period.
          </p>
        </div>
      )}
    </div>
  );
};
