import React, { useState, useEffect, useRef } from 'react';
import {
  TransactionType,
  NewTransactionInput,
  Transaction,
  CurrencyCode,
  RecurrenceInterval,
} from '../../types';
import { useTransactions } from '../../context/TransactionContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useCategories } from '../../context/CategoryContext';
import { useToast } from '../../context/ToastContext';
import {
  PlusCircle,
  ArrowDown,
  ArrowUp,
  Edit3,
  X,
  Calendar,
  Sparkles,
  PenLine,
  Repeat,
  FileText,
} from 'lucide-react';
import { clsx } from 'clsx';
import { Select, SelectOption } from '../ui/Select';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { SUPPORTED_CURRENCIES, CURRENCY_MAP } from '../../services/currencyService';
import { renderCategoryIcon } from '../../utils/iconHelper';

interface TransactionFormProps {
  initialData?: Transaction | null;
  onCancelEdit?: () => void;
  onSuccess?: () => void;
  defaultType?: TransactionType;
}

const RECURRENCE_OPTIONS: SelectOption[] = [
  { value: 'monthly', label: 'Monthly (Subscriptions, Rent, Bills)' },
  { value: 'weekly', label: 'Weekly (Groceries, Allowance)' },
  { value: 'daily', label: 'Daily (Commute, Coffee)' },
  { value: 'yearly', label: 'Yearly (Annual Software, Insurance)' },
];

export const TransactionForm: React.FC<TransactionFormProps> = ({
  initialData,
  onCancelEdit,
  onSuccess,
  defaultType = 'expense',
}) => {
  const { addTransaction, updateTransaction } = useTransactions();
  const { preferredCurrency } = useCurrency();
  const { expenseCategories, incomeCategories } = useCategories();
  const { success, error: toastError } = useToast();

  const isEditing = !!initialData;
  const titleInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [txCurrency, setTxCurrency] = useState<CurrencyCode>(preferredCurrency || 'NGN');
  const [type, setType] = useState<TransactionType>(defaultType);
  const [category, setCategory] = useState<string>('Food & Dining');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [recurringInterval, setRecurringInterval] = useState<RecurrenceInterval>('monthly');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const isSubmittingRef = useRef<boolean>(false);

  // Sync default currency with preferredCurrency when not editing
  useEffect(() => {
    if (!initialData && preferredCurrency) {
      setTxCurrency(preferredCurrency);
    }
  }, [preferredCurrency, initialData]);

  // Sync form if initialData changes (when editing is initiated or cancelled)
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setAmount(initialData.amount.toString());
      setTxCurrency(initialData.currency || preferredCurrency || 'NGN');
      setType(initialData.type);
      setCategory(initialData.category);
      setDate(initialData.date);
      setDescription(initialData.description || initialData.notes || '');
      setIsRecurring(!!initialData.isRecurring);
      setRecurringInterval(initialData.recurringInterval || 'monthly');
      setError(null);
    }
  }, [initialData, preferredCurrency]);

  const resetForm = () => {
    setTitle('');
    setAmount('');
    setTxCurrency(preferredCurrency || 'NGN');
    setType(defaultType);
    const defaultCat = defaultType === 'income' ? 'Salary' : 'Food & Dining';
    setCategory(defaultCat);
    setDate(new Date().toISOString().split('T')[0]);
    setDescription('');
    setIsRecurring(false);
    setRecurringInterval('monthly');
    setError(null);
  };

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const available = newType === 'income' ? incomeCategories : expenseCategories;
    if (available.length > 0) {
      setCategory(available[0].name);
    }
  };

  const handleSetQuickDate = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    setDate(d.toISOString().split('T')[0]);
  };

  const handleAddAmount = (extra: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + extra).toFixed(2).replace(/\.00$/, ''));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent double submission from rapid clicks
    if (isSubmittingRef.current || isSubmitting) {
      return;
    }

    setError(null);
    const parsedAmount = parseFloat(amount);

    if (!title.trim()) {
      setError('Please enter a transaction title.');
      toastError('Validation Failed', 'Transaction title cannot be empty.', { priority: 'high' });
      titleInputRef.current?.focus();
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount greater than 0.');
      toastError('Invalid Amount', 'Please specify a positive numeric value.', { priority: 'high' });
      return;
    }
    if (!date) {
      setError('Please select a transaction date.');
      toastError('Date Missing', 'Transaction date is required.', { priority: 'high' });
      return;
    }

    const txInput: NewTransactionInput = {
      title: title.trim(),
      amount: parsedAmount,
      currency: txCurrency,
      type,
      category: category || (type === 'income' ? 'Salary' : 'Other'),
      date,
      description: description.trim() || undefined,
      notes: description.trim() || undefined,
      isRecurring,
      recurringInterval: isRecurring ? recurringInterval : undefined,
    };

    // Lock submission across the entire lifecycle until reset/navigation completes
    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      // -------------------------------------------------------------
      // 1. DATABASE SAVE PHASE
      // Determine whether the transaction was successfully written
      // -------------------------------------------------------------
      if (isEditing && initialData) {
        await updateTransaction(initialData.id, txInput);
      } else {
        await addTransaction(txInput);
      }

      // -------------------------------------------------------------
      // 2. NOTIFICATION PHASE (Only after confirmed database save)
      // Exactly one success notification per submission
      // -------------------------------------------------------------
      if (isEditing) {
        success('Transaction updated successfully.', undefined, { priority: 'medium' });
      } else if (type === 'income') {
        success('Income added successfully.', undefined, { priority: 'medium' });
      } else {
        success('Expense added successfully.', undefined, { priority: 'medium' });
      }

      // -------------------------------------------------------------
      // 3. UI STATE & FORM RESET PHASE (Isolated secondary operations)
      // Any non-database glitch here will never show a save failure
      // -------------------------------------------------------------
      try {
        if (isEditing) {
          if (onCancelEdit) onCancelEdit();
        } else {
          resetForm();
        }
      } catch (resetErr) {
        console.warn('[TransactionForm] Secondary form reset warning:', resetErr);
      }

      // -------------------------------------------------------------
      // 4. POST-SAVE NAVIGATION / CALLBACK PHASE
      // -------------------------------------------------------------
      if (onSuccess) {
        try {
          onSuccess();
        } catch (secondaryErr) {
          console.warn('[TransactionForm] Secondary post-save callback warning:', secondaryErr);
        }
      }
    } catch (saveError: unknown) {
      console.error('[TransactionForm] Database save failed:', saveError);
      
      // -------------------------------------------------------------
      // 5. GENUINE FAILURE NOTIFICATION
      // Only triggered if the actual database save genuinely failed!
      // -------------------------------------------------------------
      if (isEditing) {
        toastError('Unable to update transaction. Please try again.', undefined, { priority: 'high' });
      } else if (type === 'income') {
        toastError('Unable to add income. Please try again.', undefined, { priority: 'high' });
      } else {
        toastError('Unable to add expense. Please try again.', undefined, { priority: 'high' });
      }
    } finally {
      // Release submission lock after the entire lifecycle has resolved
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const currentCategoryList = type === 'income' ? incomeCategories : expenseCategories;

  const categoryOptions: SelectOption[] = currentCategoryList.map((cat) => ({
    value: cat.name,
    label: cat.name,
    icon: renderCategoryIcon(cat.icon, 'w-3.5 h-3.5'),
    colorDot: cat.color,
    description: cat.description || cat.group,
  }));

  const currencyOptions: SelectOption[] = SUPPORTED_CURRENCIES.map((c) => ({
    value: c.code,
    label: `${c.flag} | (${c.code})`,
    description: `${c.name} (${c.symbol})`,
  }));

  const currentCurrencySymbol = CURRENCY_MAP[txCurrency]?.symbol || '$';
  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

  return (
    <form
      onSubmit={handleSubmit}
      className={clsx(
        'bg-white dark:bg-[#12131a] border rounded-3xl p-4 sm:p-6 lg:p-7 shadow-subtle dark:shadow-none space-y-4 sm:space-y-5 transition-all duration-200',
        isEditing
          ? 'border-indigo-500/80 ring-2 ring-indigo-500/20'
          : 'border-slate-200/80 dark:border-[#1e202b]'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#20222b]">
        <div className="flex items-center gap-2.5">
          <div
            className={clsx(
              'w-8 h-8 rounded-xl flex items-center justify-center border shadow-xs transition-colors',
              isEditing
                ? 'bg-indigo-50 dark:bg-[#1f2035] text-indigo-600 dark:text-[#8e8bf5] border-indigo-200 dark:border-indigo-500/30'
                : 'bg-slate-100 dark:bg-[#20222a] text-slate-700 dark:text-slate-300 border-slate-200/70 dark:border-[#2a2c38]'
            )}
          >
            {isEditing ? (
              <Edit3 className="w-4 h-4 stroke-[2.2]" />
            ) : (
              <PlusCircle className="w-4 h-4 stroke-[2.2]" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
              {isEditing ? 'Edit Transaction' : 'Record Transaction'}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {isEditing ? 'Update recorded details' : 'Log an expense or income entry'}
            </p>
          </div>
        </div>

        {isEditing ? (
          <button
            type="button"
            onClick={onCancelEdit}
            disabled={isSubmitting}
            className="text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1 font-semibold px-2.5 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </button>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#20222a] text-[10px] text-slate-500 dark:text-slate-400 font-semibold border border-slate-200/60 dark:border-[#282a36]">
            <Sparkles className="w-2.5 h-2.5 text-indigo-500 dark:text-[#8e8bf5]" />
            Multi-Currency
          </span>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Type Switcher Pills */}
      <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100/90 dark:bg-[#101116] rounded-xl border border-slate-200/70 dark:border-[#1e2028]">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => handleTypeChange('expense')}
          className={clsx(
            'flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-50',
            type === 'expense'
              ? 'bg-white dark:bg-[#20222a] text-rose-600 dark:text-[#f87171] border border-rose-200/90 dark:border-rose-500/20 shadow-xs ring-1 ring-rose-500/10'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          )}
        >
          <div className="w-5 h-5 rounded-md bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center">
            <ArrowDown className="w-3 h-3 stroke-[2.5]" />
          </div>
          <span>Expense</span>
        </button>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => handleTypeChange('income')}
          className={clsx(
            'flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-50',
            type === 'income'
              ? 'bg-white dark:bg-[#20222a] text-emerald-600 dark:text-[#22c55e] border border-emerald-200/90 dark:border-emerald-500/20 shadow-xs ring-1 ring-emerald-500/10'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          )}
        >
          <div className="w-5 h-5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center">
            <ArrowUp className="w-3 h-3 stroke-[2.5]" />
          </div>
          <span>Income</span>
        </button>
      </div>

      {/* Title Input */}
      <Input
        ref={titleInputRef}
        label="Expense / Income Name"
        isRequired
        disabled={isSubmitting}
        placeholder="e.g. Netflix Subscription, Whole Foods Grocery, Client Retainer"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onClear={() => setTitle('')}
        leftIcon={<PenLine className="w-4 h-4 stroke-[2.2]" />}
      />

      {/* Currency & Amount Combined Row */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
        <div className="sm:col-span-5">
          <Select
            label="Currency"
            isRequired
            options={currencyOptions}
            value={txCurrency}
            onChange={(val) => setTxCurrency(val)}
          />
        </div>

        <div className="sm:col-span-7">
          <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Amount ({currentCurrencySymbol}) <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-1 flex-wrap">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleAddAmount(1000)}
                className="px-2 py-0.5 rounded bg-slate-100 dark:bg-[#1e202a] hover:bg-slate-200 dark:hover:bg-[#262835] text-[10px] font-bold text-slate-600 dark:text-slate-300 cursor-pointer disabled:opacity-50"
              >
                +1K
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleAddAmount(5000)}
                className="px-2 py-0.5 rounded bg-slate-100 dark:bg-[#1e202a] hover:bg-slate-200 dark:hover:bg-[#262835] text-[10px] font-bold text-slate-600 dark:text-slate-300 cursor-pointer disabled:opacity-50"
              >
                +5K
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleAddAmount(20000)}
                className="px-2 py-0.5 rounded bg-slate-100 dark:bg-[#1e202a] hover:bg-slate-200 dark:hover:bg-[#262835] text-[10px] font-bold text-slate-600 dark:text-slate-300 cursor-pointer disabled:opacity-50"
              >
                +20K
              </button>
            </div>
          </div>
          <Input
            type="number"
            step="any"
            min="0"
            disabled={isSubmitting}
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            prefixText={currentCurrencySymbol}
            className="tabular-nums font-bold"
          />
        </div>
      </div>

      {/* Category & Date Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
        <Select
          label="Category"
          isRequired
          options={categoryOptions}
          value={category}
          onChange={(newVal) => setCategory(newVal)}
        />

        {/* Date Picker */}
        <div>
          <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Date <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-1 flex-wrap">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSetQuickDate(0)}
                className={clsx(
                  'px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer disabled:opacity-50',
                  date === todayStr
                    ? 'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-bold'
                    : 'bg-slate-100 dark:bg-[#1e202a] text-slate-600 dark:text-slate-300'
                )}
              >
                Today
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSetQuickDate(1)}
                className={clsx(
                  'px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer disabled:opacity-50',
                  date === yesterdayStr
                    ? 'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-bold'
                    : 'bg-slate-100 dark:bg-[#1e202a] text-slate-600 dark:text-slate-300'
                )}
              >
                Yesterday
              </button>
            </div>
          </div>
          <Input
            type="date"
            disabled={isSubmitting}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            leftIcon={<Calendar className="w-4 h-4 stroke-[2.2]" />}
          />
        </div>
      </div>

      {/* Recurring Expense Section */}
      <div className="p-3.5 bg-slate-50 dark:bg-[#121319] border border-slate-200/80 dark:border-[#22242d] rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Repeat className="w-4 h-4 text-indigo-500 dark:text-[#8e8bf5]" />
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Recurring {type === 'expense' ? 'Expense' : 'Income'}
              </span>
              <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                Monthly rent, bills, subscriptions, weekly allowances
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              disabled={isSubmitting}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        {isRecurring && (
          <div className="pt-2 border-t border-slate-200/60 dark:border-[#20222b] animate-in fade-in">
            <Select
              label="Repeat Frequency"
              options={RECURRENCE_OPTIONS}
              value={recurringInterval}
              onChange={(val) => setRecurringInterval(val as RecurrenceInterval)}
            />
          </div>
        )}
      </div>

      {/* Optional Description / Notes */}
      <div className="space-y-1.5">
        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          <span>Notes & Description</span>
          <span className="text-[10px] text-slate-400 font-normal lowercase tracking-normal">(optional)</span>
        </label>
        <textarea
          rows={2}
          disabled={isSubmitting}
          placeholder="Add memo, invoice number, vendor, or extra notes..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#121319] hover:bg-slate-100/70 dark:hover:bg-[#161722] focus:bg-white dark:focus:bg-[#161722] border border-slate-200/90 dark:border-[#262835] rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none"
        />
      </div>

      {/* Submit Button */}
      <div className="flex flex-col-reverse sm:flex-row items-center gap-2.5 pt-1">
        {isEditing && (
          <Button
            type="button"
            variant="secondary"
            className="w-full sm:flex-1"
            disabled={isSubmitting}
            onClick={onCancelEdit}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="lavender"
          className="w-full sm:flex-1"
          isLoading={isSubmitting}
          leftIcon={
            isEditing ? (
              <Edit3 className="w-3.5 h-3.5" />
            ) : (
              <PlusCircle className="w-3.5 h-3.5" />
            )
          }
        >
          {isEditing
            ? 'Update Transaction'
            : `Save ${type === 'income' ? 'Income' : 'Expense'}`}
        </Button>
      </div>
    </form>
  );
};
