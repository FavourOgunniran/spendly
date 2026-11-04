import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { CategoryExpenseData } from '../../utils/analyticsCalculations';
import { useCurrency } from '../../context/CurrencyContext';
import { PieChart as PieIcon, Layers } from 'lucide-react';
import { EmptyState } from '../ui/EmptyState';

interface CategoryExpenseChartProps {
  data: CategoryExpenseData[];
  totalSpent: number;
}

export const CategoryExpenseChart: React.FC<CategoryExpenseChartProps> = ({
  data,
  totalSpent,
}) => {
  const { preferredCurrency, formatCurrency } = useCurrency();

  if (data.length === 0 || totalSpent === 0) {
    return (
      <div className="bg-white dark:bg-[#12131a] border border-slate-200/80 dark:border-[#1e202b] rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-subtle dark:shadow-none min-h-[420px]">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-indigo-600 dark:text-[#8e8bf5]" />
            <span>Expenses by Category</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
            Category distribution across all recorded expenses
          </p>
        </div>

        <div className="my-auto py-8">
          <EmptyState
            icon={<Layers className="w-6 h-6 text-indigo-500 dark:text-[#8e8bf5]" />}
            title="No expense data recorded"
            description="Add your first expense transaction to view the category breakdown visualization."
            className="bg-transparent border-0"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#12131a] border border-slate-200/80 dark:border-[#1e202b] rounded-3xl p-4 sm:p-6 lg:p-7 shadow-subtle dark:shadow-none transition-colors duration-200 min-h-[380px] sm:min-h-[420px] w-full min-w-0">
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-indigo-600 dark:text-[#8e8bf5]" />
            <span>Expenses by Category ({preferredCurrency})</span>
          </h3>
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
            {data.length} Categories
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
          Category distribution across all recorded expenses in {preferredCurrency}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center my-4">
        {/* Donut Chart with Center Amount */}
        <div className="md:col-span-5 relative flex items-center justify-center min-h-[220px] w-full min-w-0">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as CategoryExpenseData;
                    return (
                      <div className="bg-slate-900 dark:bg-[#20222a] border border-slate-700 dark:border-[#2f3242] p-3 rounded-xl shadow-xl text-xs text-white">
                        <div className="font-bold flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span>{item.name}</span>
                        </div>
                        <div className="mt-1 text-slate-300 font-semibold">
                          {formatCurrency(item.amount, preferredCurrency)} ({item.percentage}%)
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {item.count} transaction{item.count !== 1 ? 's' : ''}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={62}
                outerRadius={86}
                paddingAngle={3}
                dataKey="amount"
                stroke="none"
              >
                {data.map((entry) => (
                  <Cell key={`cell-${entry.name}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center Callout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-2">
            <span
              className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight max-w-[110px] truncate"
              title={formatCurrency(totalSpent, preferredCurrency)}
            >
              {formatCurrency(totalSpent, preferredCurrency)}
            </span>
            <span className="text-[10px] sm:text-[10.5px] font-medium text-slate-400">
              Total Spent
            </span>
          </div>
        </div>

        {/* Category Breakdown Progress Bars List */}
        <div className="md:col-span-7 space-y-3 pl-0 md:pl-2 max-h-[260px] overflow-y-auto pr-1 w-full min-w-0">
          {data.map((item) => (
            <div key={item.name} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-slate-800 dark:text-slate-200">
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 font-bold">
                  <span className="text-slate-900 dark:text-white">
                    {formatCurrency(item.amount, preferredCurrency)}
                  </span>
                  <span
                    className="text-[11px] font-extrabold w-10 text-right"
                    style={{ color: item.color }}
                  >
                    {item.percentage}%
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 dark:bg-[#20222a] h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.max(item.percentage, 2)}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
