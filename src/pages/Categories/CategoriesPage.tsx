import React, { useState, useMemo } from 'react';
import { useCategories } from '../../context/CategoryContext';
import { useTransactions } from '../../context/TransactionContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useToast } from '../../context/ToastContext';
import { CategoryItem, TransactionType } from '../../types';
import { CategoryModal } from '../../components/categories/CategoryModal';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { renderCategoryIcon } from '../../utils/iconHelper';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  Plus,
  Search,
  Layers,
  Edit3,
  Trash2,
  ArrowDown,
  ArrowUp,
  FolderPlus,
  RotateCcw,
} from 'lucide-react';
import { clsx } from 'clsx';
import { Link } from 'react-router-dom';

export const CategoriesPage: React.FC = () => {
  const {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    resetToDefaults,
  } = useCategories();
  const { transactions } = useTransactions();
  const { preferredCurrency, formatCurrency, convert } = useCurrency();
  const { success, error: toastError, info } = useToast();

  const [activeType, setActiveType] = useState<TransactionType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    category: CategoryItem | null;
  }>({
    isOpen: false,
    category: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Compute spend/income aggregate per category
  const categoryStats = useMemo(() => {
    const stats: Record<string, { count: number; total: number }> = {};
    for (const tx of transactions) {
      const cat = (tx.category || 'Other').trim();
      const txCurr = tx.currency || 'NGN';
      const converted = convert(Number(tx.amount) || 0, txCurr, preferredCurrency);
      if (!stats[cat]) {
        stats[cat] = { count: 0, total: 0 };
      }
      stats[cat].count += 1;
      stats[cat].total += converted;
    }
    return stats;
  }, [transactions, preferredCurrency, convert]);

  // Unique groups
  const availableGroups = useMemo(() => {
    const set = new Set<string>();
    categories.forEach((c) => {
      if (c.group) set.add(c.group);
    });
    return Array.from(set);
  }, [categories]);

  // Filtered list
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const matchesType = activeType === 'all' || cat.type === activeType;
      const matchesGroup = selectedGroup === 'all' || cat.group === selectedGroup;
      const matchesSearch =
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        cat.group.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesType && matchesGroup && matchesSearch;
    });
  }, [categories, activeType, selectedGroup, searchTerm]);

  // Grouped for display
  const groupedCategories = useMemo(() => {
    const groups: Record<string, CategoryItem[]> = {};
    filteredCategories.forEach((cat) => {
      const g = cat.group || 'Other';
      if (!groups[g]) groups[g] = [];
      groups[g].push(cat);
    });
    return groups;
  }, [filteredCategories]);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (catData: Omit<CategoryItem, 'id'>) => {
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, catData);
        success('Category Updated', `"${catData.name}" has been updated.`, { priority: 'medium' });
      } else {
        await addCategory(catData);
        success('Category Created', `"${catData.name}" is now ready for use.`, { priority: 'medium' });
      }
    } catch {
      toastError('Operation Failed', 'Could not save category. Please try again.', { priority: 'high' });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.category) return;
    setIsDeleting(true);
    try {
      await deleteCategory(deleteConfirm.category.id);
      success('Category Deleted', `"${deleteConfirm.category.name}" was removed.`, { priority: 'medium' });
      setDeleteConfirm({ isOpen: false, category: null });
    } catch {
      toastError('Delete Failed', 'Could not remove category. Please try again.', { priority: 'high' });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetDefaults = async () => {
    try {
      await resetToDefaults();
      info('Categories Restored', 'Standard category presets have been restored.', { priority: 'low' });
    } catch {
      toastError('Reset Failed', 'Could not reset categories.', { priority: 'high' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Categories & Classifications
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Organize expenses and income streams with custom colors, icons, and groups.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetDefaults}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            className="text-slate-600 dark:text-slate-300"
          >
            Reset Defaults
          </Button>
          <Button
            variant="lavender"
            size="sm"
            onClick={handleOpenAdd}
            leftIcon={<Plus className="w-4 h-4 stroke-[2.5]" />}
          >
            Create Category
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#12131a] border border-slate-200/80 dark:border-[#1e202b] rounded-3xl p-4 sm:p-5 shadow-subtle dark:shadow-none space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Type Toggle Pills */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-[#101116] rounded-xl border border-slate-200/80 dark:border-[#1e2028] w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveType('all')}
              className={clsx(
                'flex-1 sm:flex-initial text-center justify-center px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
                activeType === 'all'
                  ? 'bg-white dark:bg-[#20222a] text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              All ({categories.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveType('expense')}
              className={clsx(
                'flex-1 sm:flex-initial text-center justify-center flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
                activeType === 'expense'
                  ? 'bg-white dark:bg-[#20222a] text-rose-600 dark:text-[#f87171] shadow-xs'
                  : 'text-slate-500 hover:text-rose-600'
              )}
            >
              <ArrowDown className="w-3 h-3 stroke-[2.5]" />
              <span>Expenses</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveType('income')}
              className={clsx(
                'flex-1 sm:flex-initial text-center justify-center flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
                activeType === 'income'
                  ? 'bg-white dark:bg-[#20222a] text-emerald-600 dark:text-[#22c55e] shadow-xs'
                  : 'text-slate-500 hover:text-emerald-600'
              )}
            >
              <ArrowUp className="w-3 h-3 stroke-[2.5]" />
              <span>Income</span>
            </button>
          </div>

          {/* Group Filter pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setSelectedGroup('all')}
              className={clsx(
                'px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-all cursor-pointer border',
                selectedGroup === 'all'
                  ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30'
                  : 'bg-slate-50 dark:bg-[#1a1c26] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 border-slate-200/60 dark:border-[#282a38]'
              )}
            >
              All Groups
            </button>
            {availableGroups.map((grp) => (
              <button
                key={grp}
                type="button"
                onClick={() => setSelectedGroup(grp)}
                className={clsx(
                  'px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-all cursor-pointer border',
                  selectedGroup === grp
                    ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30'
                    : 'bg-slate-50 dark:bg-[#1a1c26] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 border-slate-200/60 dark:border-[#282a38]'
                )}
              >
                {grp}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <Input
          placeholder="Search category by name, group, or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onClear={() => setSearchTerm('')}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </div>

      {/* Main Categories Grid by Group */}
      {Object.keys(groupedCategories).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedCategories).map(([groupName, items]) => (
            <div key={groupName} className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <Layers className="w-4 h-4 text-indigo-500 dark:text-[#8e8bf5]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {groupName} ({items.length})
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {items.map((cat) => {
                  const stats = categoryStats[cat.name] || { count: 0, total: 0 };
                  const isExpense = cat.type === 'expense';
                  return (
                    <div
                      key={cat.id}
                      className="group bg-white dark:bg-[#16171d] hover:bg-slate-50/70 dark:hover:bg-[#1b1c24] border border-slate-200/80 dark:border-[#22242d] hover:border-slate-300 dark:hover:border-[#2f3240] rounded-2xl p-4 shadow-subtle dark:shadow-none transition-all flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform"
                            style={{
                              backgroundColor: `${cat.color}20`,
                              color: cat.color,
                            }}
                          >
                            {renderCategoryIcon(cat.icon, 'w-5 h-5 stroke-[2.2]')}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                                {cat.name}
                              </h4>
                              {cat.isCustom && (
                                <span className="px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 text-[9px] font-extrabold border border-indigo-200/50 dark:border-indigo-500/30">
                                  Custom
                                </span>
                              )}
                            </div>
                            <span className="text-[10.5px] font-semibold text-slate-400 dark:text-slate-500">
                              {cat.group} • {cat.type}
                            </span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(cat)}
                            title="Edit Category"
                            className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-[#8e8bf5] hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {cat.isCustom && (
                            <button
                              type="button"
                              onClick={() => setDeleteConfirm({ isOpen: true, category: cat })}
                              title="Delete Category"
                              className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {cat.description && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                          {cat.description}
                        </p>
                      )}

                      {/* Spend / Activity stats footer */}
                      <div className="pt-3 mt-3 border-t border-slate-100 dark:border-[#20222b] flex items-center justify-between">
                        <span className="text-[10.5px] font-medium text-slate-400">
                          {stats.count} {stats.count === 1 ? 'entry' : 'entries'} recorded
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={clsx(
                              'text-xs font-bold tabular-nums',
                              isExpense
                                ? 'text-rose-600 dark:text-[#f87171]'
                                : 'text-emerald-600 dark:text-[#22c55e]'
                            )}
                          >
                            {stats.total > 0
                              ? `${isExpense ? '-' : '+'}${formatCurrency(stats.total, preferredCurrency)}`
                              : formatCurrency(0, preferredCurrency)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<FolderPlus className="w-8 h-8 text-indigo-500" />}
          title="No categories match your search"
          description="Try clearing your filters or create a new custom category."
          action={
            <Button variant="lavender" size="sm" onClick={handleOpenAdd}>
              + Create Category
            </Button>
          }
        />
      )}

      {/* Quick link banner to budget */}
      <div className="p-4 bg-slate-100 dark:bg-[#151720] border border-slate-200 dark:border-[#22242d] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-[#8e8bf5] flex items-center justify-center font-bold">
            ₦
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              Want to set monthly spending caps for these categories?
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Configure spending ceilings on the Budgets page to receive real-time warnings.
            </p>
          </div>
        </div>
        <Link
          to="/budget"
          className="px-3.5 py-1.5 bg-white dark:bg-[#20222a] hover:bg-slate-50 text-indigo-600 dark:text-[#8e8bf5] border border-indigo-200/60 dark:border-indigo-500/30 rounded-xl text-xs font-bold shadow-2xs transition-all shrink-0"
        >
          Manage Budgets →
        </Link>
      </div>

      {/* Modals */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
        }}
        onSave={handleSaveCategory}
        initialData={editingCategory}
      />

      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        isLoading={isDeleting}
        title="Delete Category"
        message={`Are you sure you want to remove the category "${deleteConfirm.category?.name}"? Any transactions assigned to this category will keep their transaction history.`}
        confirmLabel="Delete Category"
        onConfirm={handleConfirmDelete}
        onCancel={() => !isDeleting && setDeleteConfirm({ isOpen: false, category: null })}
      />
    </div>
  );
};
