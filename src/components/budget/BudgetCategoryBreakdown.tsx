import React, { useState } from 'react';
import { useBudget } from '../../context/BudgetContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useCategories } from '../../context/CategoryContext';
import {
  Layers,
  Search,
  Plus,
  Edit2,
  Trash2,
  AlertOctagon,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  SearchX,
  Receipt,
} from 'lucide-react';
import { clsx } from 'clsx';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { renderCategoryIcon } from '../../utils/iconHelper';
import { Link } from 'react-router-dom';

interface BudgetCategoryBreakdownProps {
  onAddCategoryBudget: () => void;
  onEditCategoryBudget: (categoryBudget: {
    id: string;
    category: string;
    limit: number;
  }) => void;
  onDeleteCategoryBudget: (id: string, categoryName: string) => void;
}

export const BudgetCategoryBreakdown: React.FC<BudgetCategoryBreakdownProps> = ({
  onAddCategoryBudget,
  onEditCategoryBudget,
  onDeleteCategoryBudget,
}) => {
  const { metrics } = useBudget();
  const { preferredCurrency, formatCurrency } = useCurrency();
  const { getCategoryIconName, getCategoryColor } = useCategories();
  const { categoryBudgets, unbudgetedCategories } = metrics;
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'budgeted' | 'all'>('budgeted');

  const formattedMonthLabel = (() => {
    if (!metrics.selectedMonth || metrics.selectedMonth === 'all') return 'this period';
    const [y, m] = metrics.selectedMonth.split('-').map(Number);
    const d = new Date(y, m - 1, 1);
    return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(d);
  })();

  const totalAllCategoriesCount = categoryBudgets.length + unbudgetedCategories.length;

  const filteredBudgeted = categoryBudgets.filter((cat) =>
    cat.category.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  const filteredUnbudgeted = unbudgetedCategories.filter((cat) =>
    cat.category.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  const totalFilteredCount =
    activeTab === 'budgeted'
      ? filteredBudgeted.length
      : filteredBudgeted.length + filteredUnbudgeted.length;

  return (
    <div className="bg-white dark:bg-[#12131a] border border-slate-200/80 dark:border-[#1e202b] rounded-3xl p-4 sm:p-6 lg:p-7 shadow-subtle dark:shadow-none space-y-6 transition-colors duration-200">
      {/* Header, Actions, Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-[#22242d]">
        <div>
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Granular Allocations ({preferredCurrency})
          </span>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-500 dark:text-[#8e8bf5]" />
            <span>Category Spending against Limits</span>
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          {/* Filter Tab pills */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-[#121319] rounded-xl border border-slate-200/60 dark:border-[#22242e] w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveTab('budgeted')}
              className={clsx(
                'flex-1 sm:flex-initial text-center justify-center px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
                activeTab === 'budgeted'
                  ? 'bg-white dark:bg-[#1e2028] text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              Budgeted ({categoryBudgets.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={clsx(
                'flex-1 sm:flex-initial text-center justify-center px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
                activeTab === 'all'
                  ? 'bg-white dark:bg-[#1e2028] text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              All Expenses ({totalAllCategoriesCount})
            </button>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAddCategoryBudget}
            leftIcon={<Plus className="w-3.5 h-3.5 stroke-[2.5]" />}
            className="w-full sm:w-auto justify-center text-indigo-600 dark:text-[#8e8bf5] border-indigo-200/60 dark:border-[#2f3242] hover:bg-indigo-50 dark:hover:bg-[#1e2028]"
          >
            Add Category Budget
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <Input
        placeholder="Search categories (e.g. Food, Housing, Utilities)..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onClear={() => setSearchTerm('')}
        leftIcon={<Search className="w-4 h-4" />}
      />

      {/* Content Rendering based on activeTab */}
      {activeTab === 'budgeted' ? (
        // ----------------- TAB: BUDGETED ONLY -----------------
        filteredBudgeted.length > 0 ? (
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Active Category Limits ({filteredBudgeted.length})
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredBudgeted.map((cat) => {
                const visualPct = Math.min(Math.max(cat.percentageUsed, 0), 100);
                const iconName = getCategoryIconName(cat.category);
                const customColor = getCategoryColor(cat.category) || cat.color;

                const StatusBadgeIcon =
                  cat.statusLevel === 'safe'
                    ? CheckCircle2
                    : cat.statusLevel === 'warning'
                    ? AlertTriangle
                    : AlertOctagon;

                return (
                  <div
                    key={cat.id || cat.category}
                    className={clsx(
                      'p-3.5 sm:p-5 bg-slate-50/80 dark:bg-[#121319] border rounded-2xl space-y-4 transition-all duration-200 hover:shadow-sm group',
                      cat.isOverBudget
                        ? 'border-rose-300 dark:border-rose-900/50 bg-rose-50/30 dark:bg-[#1f1418]'
                        : 'border-slate-200/60 dark:border-[#22242e] hover:border-slate-300 dark:hover:border-[#2f3242]'
                    )}
                  >
                    {/* Category Card Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border"
                          style={{
                            backgroundColor: `${customColor}18`,
                            borderColor: `${customColor}30`,
                            color: customColor,
                          }}
                        >
                          {renderCategoryIcon(iconName, 'w-4 h-4')}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>{cat.category}</span>
                            {cat.isOverBudget && (
                              <Badge variant="danger" size="sm">
                                Over Budget
                              </Badge>
                            )}
                          </h4>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {cat.transactionCount}{' '}
                            {cat.transactionCount === 1 ? 'transaction' : 'transactions'}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons (Edit / Delete) */}
                      <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                        {cat.id && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                onEditCategoryBudget({
                                  id: cat.id!,
                                  category: cat.category,
                                  limit: cat.limit,
                                })
                              }
                              title="Edit Category Limit"
                              className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-[#8e8bf5] hover:bg-slate-200/60 dark:hover:bg-[#20222a] rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                onDeleteCategoryBudget(cat.id!, cat.category)
                              }
                              title="Delete Category Limit"
                              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-[#f87171] hover:bg-slate-200/60 dark:hover:bg-[#20222a] rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* 3 Metric Stats Row */}
                    <div className="grid grid-cols-3 gap-1 sm:gap-2 text-center py-2 px-1.5 sm:px-3 bg-white/80 dark:bg-[#161720] border border-slate-100 dark:border-[#22242d] rounded-xl">
                      <div className="min-w-0">
                        <span className="text-[9.5px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                          Limit
                        </span>
                        <span className="text-[11px] sm:text-xs font-black text-slate-900 dark:text-white tabular-nums block truncate">
                          {formatCurrency(cat.limit, preferredCurrency)}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <span className="text-[9.5px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                          Spent
                        </span>
                        <span className="text-[11px] sm:text-xs font-black text-rose-600 dark:text-[#f87171] tabular-nums block truncate">
                          {formatCurrency(cat.spent, preferredCurrency)}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <span className="text-[9.5px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                          {cat.isOverBudget ? 'Over By' : 'Remaining'}
                        </span>
                        <span
                          className={clsx(
                            'text-[11px] sm:text-xs font-black tabular-nums block truncate',
                            cat.isOverBudget
                              ? 'text-rose-600 dark:text-[#f87171]'
                              : 'text-emerald-600 dark:text-[#4ade80]'
                          )}
                        >
                          {cat.isOverBudget
                            ? `-${formatCurrency(cat.overBudgetAmount, preferredCurrency)}`
                            : formatCurrency(cat.remaining, preferredCurrency)}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar & Percentage */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <StatusBadgeIcon className="w-3.5 h-3.5" />
                          <span>{cat.percentageUsed}% used</span>
                        </span>
                        <span
                          className={clsx(
                            'font-extrabold tabular-nums',
                            cat.isOverBudget
                              ? 'text-rose-600 dark:text-[#f87171]'
                              : cat.percentageUsed >= 90
                              ? 'text-orange-600 dark:text-[#fb923c]'
                              : cat.percentageUsed >= 70
                              ? 'text-amber-600 dark:text-[#fbbf24]'
                              : 'text-emerald-600 dark:text-[#4ade80]'
                          )}
                        >
                          {cat.isOverBudget
                            ? `${cat.percentageUsed}% (Over Limit)`
                            : `${formatCurrency(cat.remaining, preferredCurrency)} left`}
                        </span>
                      </div>

                      <div className="w-full bg-slate-200/80 dark:bg-[#20222a] h-2 rounded-full overflow-hidden p-0.5 border border-slate-200/40 dark:border-[#282a36]">
                        <div
                          className={clsx(
                            'h-full rounded-full transition-all duration-700',
                            cat.isOverBudget
                              ? 'bg-rose-500'
                              : cat.percentageUsed >= 90
                              ? 'bg-orange-500'
                              : cat.percentageUsed >= 70
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          )}
                          style={{ width: `${visualPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : categoryBudgets.length === 0 ? (
          <EmptyState
            icon={<Layers className="w-6 h-6 text-indigo-500 dark:text-[#8e8bf5]" />}
            title={`No budgets for ${formattedMonthLabel} yet.`}
            description="Create a budget for this month to start tracking your spending."
            action={
              <Button
                type="button"
                variant="lavender"
                onClick={onAddCategoryBudget}
                leftIcon={<Plus className="w-3.5 h-3.5 stroke-[2.5]" />}
              >
                Create Category Budget
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={<SearchX className="w-5 h-5 text-slate-400" />}
            title="No matching category budgets"
            description={`We couldn't find any category budgets matching "${searchTerm}".`}
            action={
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setSearchTerm('')}
              >
                Clear Filter
              </Button>
            }
          />
        )
      ) : (
        // ----------------- TAB: ALL EXPENSES & CATEGORIES -----------------
        totalFilteredCount > 0 ? (
          <div className="space-y-6">
            {/* 1. Budgeted Categories (if any match) */}
            {filteredBudgeted.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Budgeted Categories ({filteredBudgeted.length})
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredBudgeted.map((cat) => {
                    const visualPct = Math.min(Math.max(cat.percentageUsed, 0), 100);
                    const iconName = getCategoryIconName(cat.category);
                    const customColor = getCategoryColor(cat.category) || cat.color;

                    const StatusBadgeIcon =
                      cat.statusLevel === 'safe'
                        ? CheckCircle2
                        : cat.statusLevel === 'warning'
                        ? AlertTriangle
                        : AlertOctagon;

                    return (
                      <div
                        key={cat.id || cat.category}
                        className={clsx(
                          'p-3.5 sm:p-5 bg-slate-50/80 dark:bg-[#121319] border rounded-2xl space-y-4 transition-all duration-200 hover:shadow-sm group',
                          cat.isOverBudget
                            ? 'border-rose-300 dark:border-rose-900/50 bg-rose-50/30 dark:bg-[#1f1418]'
                            : 'border-slate-200/60 dark:border-[#22242e] hover:border-slate-300 dark:hover:border-[#2f3242]'
                        )}
                      >
                        {/* Category Card Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border"
                              style={{
                                backgroundColor: `${customColor}18`,
                                borderColor: `${customColor}30`,
                                color: customColor,
                              }}
                            >
                              {renderCategoryIcon(iconName, 'w-4 h-4')}
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span>{cat.category}</span>
                                {cat.isOverBudget && (
                                  <Badge variant="danger" size="sm">
                                    Over Budget
                                  </Badge>
                                )}
                              </h4>
                              <span className="text-[11px] text-slate-400 font-medium">
                                {cat.transactionCount}{' '}
                                {cat.transactionCount === 1 ? 'transaction' : 'transactions'}
                              </span>
                            </div>
                          </div>

                          {/* Action buttons (Edit / Delete) */}
                          <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                            {cat.id && (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    onEditCategoryBudget({
                                      id: cat.id!,
                                      category: cat.category,
                                      limit: cat.limit,
                                    })
                                  }
                                  title="Edit Category Limit"
                                  className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-[#8e8bf5] hover:bg-slate-200/60 dark:hover:bg-[#20222a] rounded-lg transition-colors cursor-pointer"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    onDeleteCategoryBudget(cat.id!, cat.category)
                                  }
                                  title="Delete Category Limit"
                                  className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-[#f87171] hover:bg-slate-200/60 dark:hover:bg-[#20222a] rounded-lg transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* 3 Metric Stats Row */}
                        <div className="grid grid-cols-3 gap-1 sm:gap-2 text-center py-2 px-1.5 sm:px-3 bg-white/80 dark:bg-[#161720] border border-slate-100 dark:border-[#22242d] rounded-xl">
                          <div className="min-w-0">
                            <span className="text-[9.5px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                              Limit
                            </span>
                            <span className="text-[11px] sm:text-xs font-black text-slate-900 dark:text-white tabular-nums block truncate">
                              {formatCurrency(cat.limit, preferredCurrency)}
                            </span>
                          </div>

                          <div className="min-w-0">
                            <span className="text-[9.5px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                              Spent
                            </span>
                            <span className="text-[11px] sm:text-xs font-black text-rose-600 dark:text-[#f87171] tabular-nums block truncate">
                              {formatCurrency(cat.spent, preferredCurrency)}
                            </span>
                          </div>

                          <div className="min-w-0">
                            <span className="text-[9.5px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                              {cat.isOverBudget ? 'Over By' : 'Remaining'}
                            </span>
                            <span
                              className={clsx(
                                'text-[11px] sm:text-xs font-black tabular-nums block truncate',
                                cat.isOverBudget
                                  ? 'text-rose-600 dark:text-[#f87171]'
                                  : 'text-emerald-600 dark:text-[#4ade80]'
                              )}
                            >
                              {cat.isOverBudget
                                ? `-${formatCurrency(cat.overBudgetAmount, preferredCurrency)}`
                                : formatCurrency(cat.remaining, preferredCurrency)}
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar & Percentage */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] font-bold">
                            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <StatusBadgeIcon className="w-3.5 h-3.5" />
                              <span>{cat.percentageUsed}% used</span>
                            </span>
                            <span
                              className={clsx(
                                'font-extrabold tabular-nums',
                                cat.isOverBudget
                                  ? 'text-rose-600 dark:text-[#f87171]'
                                  : cat.percentageUsed >= 90
                                  ? 'text-orange-600 dark:text-[#fb923c]'
                                  : cat.percentageUsed >= 70
                                  ? 'text-amber-600 dark:text-[#fbbf24]'
                                  : 'text-emerald-600 dark:text-[#4ade80]'
                              )}
                            >
                              {cat.isOverBudget
                                ? `${cat.percentageUsed}% (Over Limit)`
                                : `${formatCurrency(cat.remaining, preferredCurrency)} left`}
                            </span>
                          </div>

                          <div className="w-full bg-slate-200/80 dark:bg-[#20222a] h-2 rounded-full overflow-hidden p-0.5 border border-slate-200/40 dark:border-[#282a36]">
                            <div
                              className={clsx(
                                'h-full rounded-full transition-all duration-700',
                                cat.isOverBudget
                                  ? 'bg-rose-500'
                                  : cat.percentageUsed >= 90
                                  ? 'bg-orange-500'
                                  : cat.percentageUsed >= 70
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              )}
                              style={{ width: `${visualPct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. Unbudgeted Categories with Expenses */}
            {filteredUnbudgeted.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Unbudgeted Categories with Spending ({filteredUnbudgeted.length})
                    </h4>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                      Categories that have recorded expenses in this period without an assigned budget ceiling.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredUnbudgeted.map((cat) => {
                    const iconName = getCategoryIconName(cat.category);
                    const customColor = getCategoryColor(cat.category) || cat.color;
                    return (
                      <div
                        key={cat.category}
                        className="p-4 sm:p-5 bg-slate-50/80 dark:bg-[#121319] border border-slate-200/60 dark:border-[#22242e] rounded-2xl flex flex-col min-[480px]:flex-row min-[480px]:items-center justify-between gap-3 group hover:border-slate-300 dark:hover:border-[#2f3242] transition-all shadow-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                            style={{
                              backgroundColor: `${customColor}18`,
                              borderColor: `${customColor}30`,
                              color: customColor,
                            }}
                          >
                            {renderCategoryIcon(iconName, 'w-4 h-4')}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h5 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                {cat.category}
                              </h5>
                              <span className="px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-[#20222a] text-[10px] font-semibold text-slate-600 dark:text-slate-400 shrink-0">
                                Unbudgeted
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-rose-600 dark:text-[#f87171] font-black tabular-nums">
                                {formatCurrency(cat.spent, preferredCurrency)}
                              </span>
                              <span className="text-[11px] text-slate-400 font-medium truncate">
                                ({cat.transactionCount}{' '}
                                {cat.transactionCount === 1 ? 'transaction' : 'transactions'})
                              </span>
                            </div>
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            onEditCategoryBudget({
                              id: '',
                              category: cat.category,
                              limit: Math.ceil(cat.spent / 50) * 50 || 100,
                            });
                          }}
                          leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
                          className="text-indigo-600 dark:text-[#8e8bf5] border-indigo-200/70 dark:border-indigo-500/30 hover:bg-indigo-50 dark:hover:bg-[#1e2028] shrink-0"
                        >
                          Set Limit
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : totalAllCategoriesCount === 0 ? (
          <EmptyState
            icon={<Receipt className="w-6 h-6 text-indigo-500 dark:text-[#8e8bf5]" />}
            title={`No budgets for ${formattedMonthLabel} yet.`}
            description="Create a budget for this month to start tracking your spending."
            action={
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="lavender"
                  onClick={onAddCategoryBudget}
                  leftIcon={<Plus className="w-3.5 h-3.5 stroke-[2.5]" />}
                >
                  Create Category Budget
                </Button>
                <Link
                  to="/add-expense"
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-[#1e2028] dark:hover:bg-[#252834] text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Log Expense</span>
                </Link>
              </div>
            }
          />
        ) : (
          <EmptyState
            icon={<SearchX className="w-5 h-5 text-slate-400" />}
            title="No matching categories"
            description={`We couldn't find any categories matching "${searchTerm}".`}
            action={
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setSearchTerm('')}
              >
                Clear Filter
              </Button>
            }
          />
        )
      )}
    </div>
  );
};
