import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { MonthlyCashFlowData } from '../../utils/analyticsCalculations';
import { useCurrency } from '../../context/CurrencyContext';
import { BarChart3, TrendingUp } from 'lucide-react';
import { EmptyState } from '../ui/EmptyState';

interface IncomeExpenseBarChartProps {
  data: MonthlyCashFlowData[];
  totalIncome: number;
  totalExpenses: number;
}

export const IncomeExpenseBarChart: React.FC<IncomeExpenseBarChartProps> = ({
  data,
  totalIncome,
  totalExpenses,
}) => {
  const { preferredCurrency, currentCurrencyInfo, formatCurrency } = useCurrency();
  const symbol = currentCurrencyInfo?.symbol || '$';

  if (data.length === 0 || (totalIncome === 0 && totalExpenses === 0)) {
    return (
      <div className="bg-white dark:bg-[#12131a] border border-slate-200/80 dark:border-[#1e202b] rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-subtle dark:shadow-none min-h-[420px]">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-[#8e8bf5]" />
            <span>Income vs Expenses</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
            Cash flow comparisons and historical distribution
          </p>
        </div>

        <div className="my-auto py-8">
          <EmptyState
            icon={<TrendingUp className="w-6 h-6 text-indigo-500 dark:text-[#8e8bf5]" />}
            title="No transaction records found"
            description="Add income and expense transactions to view cash flow comparisons."
            className="bg-transparent border-0"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#12131a] border border-slate-200/80 dark:border-[#1e202b] rounded-3xl p-4 sm:p-6 lg:p-7 flex flex-col justify-between shadow-subtle dark:shadow-none transition-colors duration-200 min-h-[380px] sm:min-h-[420px] w-full min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-[#8e8bf5]" />
            <span>Income vs Expenses ({preferredCurrency})</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
            Cash flow comparisons across timeline in {preferredCurrency}
          </p>
        </div>

        {/* Total Ratio Indicator */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs font-bold flex-wrap">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-[#22c55e]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
            <span>Income: {formatCurrency(totalIncome, preferredCurrency)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-600 dark:text-[#f87171]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f87171]" />
            <span>Expenses: {formatCurrency(totalExpenses, preferredCurrency)}</span>
          </div>
        </div>
      </div>

      <div className="h-64 mt-6 w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            barGap={6}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#282a36"
              opacity={0.3}
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              tickFormatter={(val) =>
                `${symbol}${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`
              }
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-900 dark:bg-[#20222a] border border-slate-700 dark:border-[#2f3242] p-3 rounded-xl shadow-xl text-xs text-white space-y-1">
                      <div className="font-bold border-b border-slate-700 pb-1 text-slate-200">
                        {label}
                      </div>
                      <div className="text-emerald-400 font-semibold flex items-center justify-between gap-4">
                        <span>Income:</span>
                        <span>+{formatCurrency(Number(payload[0]?.value || 0), preferredCurrency)}</span>
                      </div>
                      <div className="text-rose-400 font-semibold flex items-center justify-between gap-4">
                        <span>Expenses:</span>
                        <span>-{formatCurrency(Number(payload[1]?.value || 0), preferredCurrency)}</span>
                      </div>
                      {payload[0] && payload[1] && (
                        <div className="text-indigo-300 font-bold pt-1 border-t border-slate-700/60 flex items-center justify-between gap-4">
                          <span>Net Cash Flow:</span>
                          <span>
                            {formatCurrency(
                              Number(payload[0].value || 0) - Number(payload[1].value || 0),
                              preferredCurrency
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: 15, fontSize: 12 }}
              formatter={(value) => (
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 capitalize">
                  {value}
                </span>
              )}
            />
            <Bar
              dataKey="income"
              name="Income"
              fill="#22c55e"
              radius={[6, 6, 0, 0]}
              maxBarSize={45}
            />
            <Bar
              dataKey="expenses"
              name="Expenses"
              fill="#f87171"
              radius={[6, 6, 0, 0]}
              maxBarSize={45}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
