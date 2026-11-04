import React, { useState } from 'react';
import { useBudget } from '../../context/BudgetContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useToast } from '../../context/ToastContext';
import { BudgetOverviewCard } from '../../components/budget/BudgetOverviewCard';
import { SetBudgetModal } from '../../components/budget/SetBudgetModal';
import { CategoryBudgetModal } from '../../components/budget/CategoryBudgetModal';
import { BudgetCategoryBreakdown } from '../../components/budget/BudgetCategoryBreakdown';
import { BudgetInsightsSection } from '../../components/budget/BudgetInsightsSection';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import {
  Plus,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const BudgetPage: React.FC = () => {
  const {
    monthlyBudget,
    setMonthlyBudget,
    resetBudget,
    selectedMonth,
    setSelectedMonth,
    categoryBudgets,
    addCategoryBudget,
    updateCategoryBudget,
    deleteCategoryBudget,
    metrics,
  } = useBudget();

  const { preferredCurrency, formatCurrency } = useCurrency();
  const { success, info, error: toastError } = useToast();

  // Modals state
  const [isMonthlyBudgetModalOpen, setIsMonthlyBudgetModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategoryData, setEditingCategoryData] = useState<{
    id?: string;
    category: string;
    limit: number;
  } | null>(null);

  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    id: string;
    categoryName: string;
  }>({
    isOpen: false,
    id: '',
    categoryName: '',
  });

  const [isConfirmResetOpen, setIsConfirmResetOpen] = useState(false);
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);
  const [isResettingBudget, setIsResettingBudget] = useState(false);

  // Month navigation helpers
  const handlePrevMonth = () => {
    if (!selectedMonth || selectedMonth === 'all') return;
    const [y, m] = selectedMonth.split('-').map(Number);
    const date = new Date(y, m - 2, 1);
    const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      '0'
    )}`;
    setSelectedMonth(newMonth);
  };

  const handleNextMonth = () => {
    if (!selectedMonth || selectedMonth === 'all') return;
    const [y, m] = selectedMonth.split('-').map(Number);
    const date = new Date(y, m, 1);
    const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      '0'
    )}`;
    setSelectedMonth(newMonth);
  };

  const handleCurrentMonth = () => {
    const d = new Date();
    const currentMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      '0'
    )}`;
    setSelectedMonth(currentMonth);
  };

  // Formatted Month Label
  const formattedMonthLabel = (() => {
    if (!selectedMonth || selectedMonth === 'all') return 'All Time';
    const [y, m] = selectedMonth.split('-').map(Number);
    const date = new Date(y, m - 1, 1);
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric',
    }).format(date);
  })();

  const isCurrentMonthActive = (() => {
    const d = new Date();
    const currentMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      '0'
    )}`;
    return selectedMonth === currentMonth;
  })();

  // Handlers for monthly budget
  const handleSaveMonthlyBudget = async (amount: number) => {
    try {
      await setMonthlyBudget(amount);
      success(
        'Monthly Budget Updated',
        `Spending ceiling for ${formattedMonthLabel} is now ${formatCurrency(amount, preferredCurrency)}.`,
        { priority: 'medium' }
      );
    } catch (err) {
      console.error('[BudgetPage] Set monthly budget failed:', err);
      toastError(
        'Unable to Update Budget',
        'Could not save your monthly budget. Please check your connection and try again.',
        { priority: 'high' }
      );
    }
  };

  const handleResetMonthlyBudget = async () => {
    setIsResettingBudget(true);
    try {
      await resetBudget();
      info('Budget Target Reset', `Monthly budget target for ${formattedMonthLabel} has been reset to zero.`, { priority: 'medium' });
      setIsConfirmResetOpen(false);
    } catch (err) {
      console.error('[BudgetPage] Reset budget failed:', err);
      toastError(
        'Unable to Reset Budget',
        'Could not reset budget settings. Please try again.',
        { priority: 'high' }
      );
    } finally {
      setIsResettingBudget(false);
    }
  };

  // Handlers for category budget
  const handleOpenAddCategoryModal = () => {
    setEditingCategoryData(null);
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategoryModal = (item: {
    id: string;
    category: string;
    limit: number;
  }) => {
    setEditingCategoryData(item);
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategoryBudget = async (category: string, limit: number) => {
    try {
      if (editingCategoryData && editingCategoryData.id) {
        await updateCategoryBudget(editingCategoryData.id, category, limit);
        success(
          'Category Limit Updated',
          `${category} limit for ${formattedMonthLabel} updated to ${formatCurrency(limit, preferredCurrency)}.`,
          { priority: 'medium' }
        );
      } else {
        await addCategoryBudget(category, limit);
        success(
          'Category Budget Created',
          `${category} limit for ${formattedMonthLabel} set to ${formatCurrency(limit, preferredCurrency)}.`,
          { priority: 'medium' }
        );
      }
    } catch (err) {
      console.error('[BudgetPage] Save category budget failed:', err);
      toastError(
        'Unable to Save Category Limit',
        'Could not save the category budget. Please try again.',
        { priority: 'high' }
      );
    }
  };

  const handleConfirmDeleteCategory = async () => {
    if (confirmDelete.id) {
      const catName = confirmDelete.categoryName;
      setIsDeletingCategory(true);
      try {
        await deleteCategoryBudget(confirmDelete.id);
        success(
          'Category Budget Deleted',
          `${catName} budget allocation was removed.`,
          { priority: 'medium' }
        );
        setConfirmDelete({ isOpen: false, id: '', categoryName: '' });
      } catch (err) {
        console.error('[BudgetPage] Delete category budget failed:', err);
        toastError(
          'Unable to Remove Limit',
          'Could not remove category budget. Please try again.',
          { priority: 'high' }
        );
      } finally {
        setIsDeletingCategory(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Period Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Monthly Budget & Spending Limits ({preferredCurrency})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Real-time expense tracking, category ceilings, and dynamic pace projections in {preferredCurrency}.
          </p>
        </div>

        {/* Month Selector & Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Month Navigator */}
          <div className="flex items-center bg-white dark:bg-[#16171d] border border-slate-200/80 dark:border-[#22242d] rounded-xl p-1 shadow-xs">
            <button
              type="button"
              onClick={handlePrevMonth}
              title="Previous Month"
              className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-[#20222a] transition-colors"
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
              className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-[#20222a] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {!isCurrentMonthActive && (
            <button
              type="button"
              onClick={handleCurrentMonth}
              className="px-3 py-2 bg-slate-100 dark:bg-[#1e2028] hover:bg-slate-200 dark:hover:bg-[#252834] text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all"
            >
              Current Month
            </button>
          )}

          {/* Quick Action: Add Category Limit */}
          <button
            type="button"
            onClick={handleOpenAddCategoryModal}
            className="px-3.5 py-2 bg-white dark:bg-[#16171d] hover:bg-slate-50 dark:hover:bg-[#1e2028] text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-[#22242d] rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-500 dark:text-[#8e8bf5]" />
            <span className="hidden sm:inline">Add Category Limit</span>
            <span className="sm:hidden">+ Category</span>
          </button>

          {/* Quick Action: Adjust / Set Budget */}
          <button
            type="button"
            onClick={() => setIsMonthlyBudgetModalOpen(true)}
            className="px-4 py-2 bg-[#8e8bf5] hover:bg-[#9d9af7] active:scale-[0.98] text-[#1d1760] font-bold text-xs rounded-xl shadow-sm shadow-indigo-500/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{monthlyBudget > 0 ? 'Adjust Budget' : 'Set Budget'}</span>
          </button>
        </div>
      </div>

      {/* 1. Hero Progress Meter Card */}
      <BudgetOverviewCard
        metrics={metrics}
        onEditBudget={() => setIsMonthlyBudgetModalOpen(true)}
        onResetBudget={() => setIsConfirmResetOpen(true)}
      />

      {/* 2. Budget Insights & Spending Velocity */}
      <BudgetInsightsSection metrics={metrics} />

      {/* 3. Category Level Spending Breakdown */}
      <BudgetCategoryBreakdown
        onAddCategoryBudget={handleOpenAddCategoryModal}
        onEditCategoryBudget={handleOpenEditCategoryModal}
        onDeleteCategoryBudget={(id, categoryName) =>
          setConfirmDelete({ isOpen: true, id, categoryName })
        }
      />

      {/* 4. Smart Budgeting Advice Card */}
      <div className="p-5 bg-gradient-to-r from-indigo-50/80 to-purple-50/50 dark:from-[#151722] dark:to-[#181a26] border border-indigo-100/80 dark:border-[#222538] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-subtle dark:shadow-none">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#8e8bf5] text-[#1d1760] flex items-center justify-center font-bold shrink-0 shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              Automated Currency & Expense Synchronization
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Expenses recorded in foreign currencies (USD, GBP, EUR) are converted into {preferredCurrency} automatically at live Frankfurter FX rates.
            </p>
          </div>
        </div>

        <Link
          to="/transactions"
          className="px-4 py-2 bg-white dark:bg-[#1e2028] hover:bg-slate-50 dark:hover:bg-[#252834] text-indigo-600 dark:text-[#8e8bf5] border border-indigo-200/60 dark:border-[#2f3242] rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto shrink-0"
        >
          <span>Manage Transactions</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Modals */}
      {/* 1. Monthly Budget Modal */}
      <SetBudgetModal
        isOpen={isMonthlyBudgetModalOpen}
        onClose={() => setIsMonthlyBudgetModalOpen(false)}
        currentBudget={monthlyBudget}
        onSave={handleSaveMonthlyBudget}
        onReset={handleResetMonthlyBudget}
        monthLabel={formattedMonthLabel}
      />

      {/* 2. Category Budget Modal */}
      <CategoryBudgetModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setEditingCategoryData(null);
        }}
        onSave={handleSaveCategoryBudget}
        initialData={editingCategoryData}
        existingBudgetedCategories={categoryBudgets.map((c) => c.category)}
        monthLabel={formattedMonthLabel}
      />

      {/* 3. Confirm Delete Category Budget Modal */}
      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        isLoading={isDeletingCategory}
        title="Delete Category Limit"
        message={`Are you sure you want to remove the spending limit for "${confirmDelete.categoryName}"? Existing transactions will not be deleted.`}
        confirmLabel="Remove Limit"
        onConfirm={handleConfirmDeleteCategory}
        onCancel={() =>
          !isDeletingCategory &&
          setConfirmDelete({ isOpen: false, id: '', categoryName: '' })
        }
      />

      {/* 4. Confirm Reset Monthly Budget Modal */}
      <ConfirmModal
        isOpen={isConfirmResetOpen}
        isLoading={isResettingBudget}
        title="Reset Monthly Budget"
        message="Are you sure you want to reset your monthly budget target? This will clear your spending ceiling until you set a new one."
        confirmLabel="Reset Target"
        onConfirm={handleResetMonthlyBudget}
        onCancel={() => !isResettingBudget && setIsConfirmResetOpen(false)}
      />
    </div>
  );
};
