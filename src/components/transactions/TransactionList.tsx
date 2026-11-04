import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useTransactions } from '../../context/TransactionContext';
import { useCategories } from '../../context/CategoryContext';
import { useCurrency } from '../../context/CurrencyContext';
import { TransactionItem } from './TransactionItem';
import { Transaction, TransactionType } from '../../types';
import {
  ListFilter,
  Search,
  FolderClosed,
  SearchX,
  SlidersHorizontal,
  ArrowDown,
  ArrowUp,
  Repeat,
} from 'lucide-react';
import { clsx } from 'clsx';
import { EmptyState } from '../ui/EmptyState';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';

interface TransactionListProps {
  onEdit?: (transaction: Transaction) => void;
}

type DateRangeFilter = 'all' | 'today' | 'week' | 'month' | 'last30';
type SortOption = 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc';

export const TransactionList: React.FC<TransactionListProps> = ({ onEdit }) => {
  const { transactions } = useTransactions();
  const { categories } = useCategories();
  const { preferredCurrency, convert } = useCurrency();

  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRangeFilter>('all');
  const [onlyRecurring, setOnlyRecurring] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SortOption>('date_desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Pressing "/" focuses search bar, "Escape" clears it
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      if (e.key === '/' && !isInput) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
        setSearchTerm('');
        searchInputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Filter logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // 1. Type filter
      if (filterType !== 'all' && tx.type !== filterType) {
        return false;
      }

      // 2. Category filter
      if (selectedCategory !== 'all' && tx.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }

      // 3. Recurring filter
      if (onlyRecurring && !tx.isRecurring) {
        return false;
      }

      // 4. Date Range filter
      if (dateRange !== 'all') {
        const txDate = new Date(tx.date);
        if (dateRange === 'today') {
          if (tx.date !== todayStr) return false;
        } else if (dateRange === 'week') {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          if (txDate < sevenDaysAgo) return false;
        } else if (dateRange === 'month') {
          const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          if (txDate < firstDayOfMonth) return false;
        } else if (dateRange === 'last30') {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          if (txDate < thirtyDaysAgo) return false;
        }
      }

      // 5. Amount filter (normalized to preferredCurrency)
      const convertedAmount = convert(tx.amount, tx.currency || 'NGN', preferredCurrency);
      if (minAmount) {
        const min = parseFloat(minAmount);
        if (!isNaN(min) && convertedAmount < min) return false;
      }
      if (maxAmount) {
        const max = parseFloat(maxAmount);
        if (!isNaN(max) && convertedAmount > max) return false;
      }

      // 6. Search text
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesTitle = tx.title.toLowerCase().includes(query);
        const matchesCat = tx.category.toLowerCase().includes(query);
        const matchesDesc = (tx.description || tx.notes || '').toLowerCase().includes(query);
        if (!matchesTitle && !matchesCat && !matchesDesc) {
          return false;
        }
      }

      return true;
    });
  }, [
    transactions,
    filterType,
    selectedCategory,
    onlyRecurring,
    dateRange,
    minAmount,
    maxAmount,
    searchTerm,
    preferredCurrency,
    convert,
    todayStr,
    now,
  ]);

  // Sort logic
  const sortedTransactions = useMemo(() => {
    const list = [...filteredTransactions];
    list.sort((a, b) => {
      const timeA = new Date(a.date).getTime();
      const timeB = new Date(b.date).getTime();
      const amtA = convert(a.amount, a.currency || 'NGN', preferredCurrency);
      const amtB = convert(b.amount, b.currency || 'NGN', preferredCurrency);

      if (sortBy === 'date_desc') {
        const diff = timeB - timeA;
        if (diff !== 0) return diff;
        const createdA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const createdB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        if (createdB !== createdA) return createdB - createdA;
        return b.id.localeCompare(a.id);
      }
      if (sortBy === 'date_asc') {
        const diff = timeA - timeB;
        if (diff !== 0) return diff;
        const createdA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const createdB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        if (createdA !== createdB) return createdA - createdB;
        return a.id.localeCompare(b.id);
      }
      if (sortBy === 'amount_desc') return amtB - amtA;
      if (sortBy === 'amount_asc') return amtA - amtB;
      return 0;
    });
    return list;
  }, [filteredTransactions, sortBy, convert, preferredCurrency]);

  const isAnyFilterActive =
    searchTerm !== '' ||
    filterType !== 'all' ||
    selectedCategory !== 'all' ||
    dateRange !== 'all' ||
    onlyRecurring ||
    minAmount !== '' ||
    maxAmount !== '';

  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setSelectedCategory('all');
    setDateRange('all');
    setOnlyRecurring(false);
    setMinAmount('');
    setMaxAmount('');
    setSortBy('date_desc');
  };

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...categories.map((c) => ({ value: c.name, label: c.name })),
  ];

  const sortOptions = [
    { value: 'date_desc', label: 'Newest First (Date)' },
    { value: 'date_asc', label: 'Oldest First (Date)' },
    { value: 'amount_desc', label: 'Highest Amount' },
    { value: 'amount_asc', label: 'Lowest Amount' },
  ];

  return (
    <div className="bg-white dark:bg-[#12131a] border border-slate-200/80 dark:border-[#1e202b] rounded-3xl p-4 sm:p-6 lg:p-7 shadow-subtle dark:shadow-none space-y-4 transition-colors duration-200">
      {/* Header with Title and Type Filter Pills */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-[#20222b]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-[#20222a] text-slate-700 dark:text-slate-300 flex items-center justify-center border border-slate-200/70 dark:border-[#2a2c38] shadow-xs shrink-0">
            <ListFilter className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight flex items-center gap-2">
              <span className="truncate">Transaction Records</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#20222a] text-[10px] font-bold text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-[#282a38] shrink-0">
                {sortedTransactions.length}
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
              Showing {sortedTransactions.length} of {transactions.length} total entries
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 p-1 bg-slate-100/90 dark:bg-[#101116] rounded-xl border border-slate-200/70 dark:border-[#1e2028] text-xs font-semibold w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={clsx(
              'flex-1 sm:flex-initial text-center justify-center px-3 py-1.5 rounded-lg transition-all text-xs font-bold cursor-pointer',
              filterType === 'all'
                ? 'bg-white dark:bg-[#252834] text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilterType('expense')}
            className={clsx(
              'flex-1 sm:flex-initial text-center justify-center flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all text-xs font-bold cursor-pointer',
              filterType === 'expense'
                ? 'bg-white dark:bg-[#252834] text-rose-600 dark:text-[#f87171] shadow-xs'
                : 'text-slate-500 hover:text-rose-600'
            )}
          >
            <ArrowDown className="w-3 h-3 stroke-[2.5]" />
            <span>Expenses</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterType('income')}
            className={clsx(
              'flex-1 sm:flex-initial text-center justify-center flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all text-xs font-bold cursor-pointer',
              filterType === 'income'
                ? 'bg-white dark:bg-[#252834] text-emerald-600 dark:text-[#22c55e] shadow-xs'
                : 'text-slate-500 hover:text-emerald-600'
            )}
          >
            <ArrowUp className="w-3 h-3 stroke-[2.5]" />
            <span>Income</span>
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="flex items-center gap-2.5">
        <div className="flex-1 min-w-0">
          <Input
            ref={searchInputRef}
            placeholder="Search by title, category, note..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClear={() => {
              setSearchTerm('');
              searchInputRef.current?.focus();
            }}
            leftIcon={<Search className="w-4 h-4 stroke-[2.2]" />}
            rightIcon={
              searchTerm ? (
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold border border-indigo-200">
                  {sortedTransactions.length} found
                </span>
              ) : undefined
            }
          />
        </div>

        <Button
          type="button"
          variant={showAdvancedFilters || isAnyFilterActive ? 'secondary' : 'outline'}
          size="md"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          leftIcon={<SlidersHorizontal className="w-4 h-4" />}
          className={clsx(
            'shrink-0',
            isAnyFilterActive && 'ring-2 ring-indigo-500/20 text-indigo-600 dark:text-[#8e8bf5]'
          )}
        >
          Filters
        </Button>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <div className="p-4 bg-slate-50 dark:bg-[#111218] border border-slate-200/80 dark:border-[#22242d] rounded-xl space-y-3 animate-in fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Category Dropdown */}
            <Select
              label="Filter Category"
              options={categoryOptions}
              value={selectedCategory}
              onChange={(val) => setSelectedCategory(val)}
            />

            {/* Date Range Selector */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Date Range
              </label>
              <div className="grid grid-cols-5 gap-1 text-[10px] font-bold">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'today', label: 'Today' },
                  { id: 'week', label: '7D' },
                  { id: 'month', label: 'Month' },
                  { id: 'last30', label: '30D' },
                ].map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDateRange(d.id as DateRangeFilter)}
                    className={clsx(
                      'py-2 px-1 rounded-lg border transition-all cursor-pointer text-center truncate',
                      dateRange === d.id
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white dark:bg-[#1e202a] text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-[#282b39]'
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sorting Order */}
            <Select
              label="Sort Order"
              options={sortOptions}
              value={sortBy}
              onChange={(val) => setSortBy(val as SortOption)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200/60 dark:border-[#20222b] items-center">
            {/* Amount Range */}
            <div className="sm:col-span-2 grid grid-cols-1 min-[340px]:grid-cols-2 gap-2">
              <Input
                label="Min Amount"
                type="number"
                step="any"
                min="0"
                placeholder="0"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
              />
              <Input
                label="Max Amount"
                type="number"
                step="any"
                min="0"
                placeholder="Unlimited"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
              />
            </div>

            {/* Recurring Toggle & Clear */}
            <div className="flex items-center justify-between sm:justify-end gap-3 pt-4 sm:pt-0">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={onlyRecurring}
                  onChange={(e) => setOnlyRecurring(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <Repeat className="w-3.5 h-3.5 text-indigo-500" />
                <span>Recurring Only</span>
              </label>

              {isAnyFilterActive && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs text-rose-500 hover:underline font-semibold cursor-pointer"
                >
                  Reset All
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Records Container */}
      <div className="border border-slate-200/90 dark:border-[#242633] rounded-2xl min-h-[460px] p-3.5 flex flex-col bg-slate-50/40 dark:bg-[#111218]/40">
        {sortedTransactions.length > 0 ? (
          <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
            {sortedTransactions.map((tx) => (
              <TransactionItem key={tx.id} transaction={tx} onEdit={onEdit} />
            ))}
          </div>
        ) : isAnyFilterActive ? (
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            <EmptyState
              icon={<SearchX className="w-6 h-6" />}
              title="No matching transactions"
              description="No transactions match your current search, category, date, or amount filters."
              action={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResetFilters}
                  leftIcon={<SlidersHorizontal className="w-3.5 h-3.5" />}
                  className="text-indigo-600 dark:text-[#8e8bf5]"
                >
                  Reset All Filters
                </Button>
              }
              className="w-full bg-transparent border-0"
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            <EmptyState
              icon={<FolderClosed className="w-6 h-6" />}
              title="No transactions yet"
              description="Add your first expense or income to start tracking your financial journey!"
              className="w-full bg-transparent border-0"
            />
          </div>
        )}
      </div>
    </div>
  );
};
