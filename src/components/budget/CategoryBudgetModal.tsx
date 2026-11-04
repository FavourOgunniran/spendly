import React, { useState, useEffect } from 'react';
import { Layers, Check } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Select, SelectOption } from '../ui/Select';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useCurrency } from '../../context/CurrencyContext';
import { useCategories } from '../../context/CategoryContext';
import { renderCategoryIcon } from '../../utils/iconHelper';

interface CategoryBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: string, limit: number) => void;
  initialData?: {
    id?: string;
    category: string;
    limit: number;
  } | null;
  existingBudgetedCategories?: string[];
  monthLabel?: string;
}

export const CategoryBudgetModal: React.FC<CategoryBudgetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  existingBudgetedCategories = [],
  monthLabel,
}) => {
  const { preferredCurrency, currentCurrencyInfo } = useCurrency();
  const { expenseCategories } = useCategories();
  const symbol = currentCurrencyInfo?.symbol || '$';

  const [category, setCategory] = useState<string>('Food & Dining');
  const [limit, setLimit] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setCategory(initialData.category);
      setLimit(initialData.limit.toString());
    } else {
      // Pick first unbudgeted category if possible
      const available = expenseCategories.find(
        (c) => !existingBudgetedCategories.includes(c.name)
      );
      setCategory(available?.name || expenseCategories[0]?.name || 'Food & Dining');
      setLimit('');
    }
    setError(null);
  }, [initialData, isOpen, existingBudgetedCategories, expenseCategories]);

  const categoryOptions: SelectOption[] = expenseCategories.map((cat) => {
    const isAlreadyBudgetedByAnother = initialData
      ? existingBudgetedCategories.includes(cat.name) && cat.name !== initialData.category
      : existingBudgetedCategories.includes(cat.name);

    return {
      value: cat.name,
      label: cat.name,
      icon: renderCategoryIcon(cat.icon, 'w-3.5 h-3.5'),
      colorDot: cat.color,
      description: isAlreadyBudgetedByAnother
        ? 'Already budgeted'
        : cat.description || cat.group,
      disabled: isAlreadyBudgetedByAnother,
    };
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedLimit = parseFloat(limit);
    if (!category.trim()) {
      setError('Please select a category.');
      return;
    }
    if (isNaN(parsedLimit) || parsedLimit <= 0) {
      setError(`Please enter a valid spending limit greater than ${symbol}0.`);
      return;
    }

    onSave(category, parsedLimit);
    onClose();
  };

  const isNGN = preferredCurrency === 'NGN';
  const presetAmounts = isNGN
    ? [20000, 50000, 100000, 150000, 250000]
    : [100, 250, 500, 750, 1000];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={
        initialData
          ? `Edit Category Limit: ${monthLabel ? `${monthLabel} ` : ''}(${preferredCurrency})`
          : `Set Category Limit: ${monthLabel ? `${monthLabel} ` : ''}(${preferredCurrency})`
      }
      subtitle={
        initialData
          ? `Adjust ceiling limit for ${initialData.category} in ${monthLabel || 'this period'}`
          : `Cap spending for a specific expense category in ${monthLabel || 'this period'} (${currentCurrencyInfo?.name || preferredCurrency})`
      }
      icon={<Layers className="w-4 h-4" />}
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {/* Custom Category Select Component */}
        <Select
          label="Category"
          isRequired
          options={categoryOptions}
          value={category}
          onChange={(newVal) => {
            setCategory(newVal);
            setError(null);
          }}
          placeholder="Select an expense category"
        />

        {/* Limit Amount Input Component */}
        <Input
          label={`Monthly Limit Amount (${symbol} ${preferredCurrency})`}
          isRequired
          type="number"
          step="any"
          min="0"
          placeholder={isNGN ? '50000.00' : '500.00'}
          value={limit}
          onChange={(e) => {
            setLimit(e.target.value);
            setError(null);
          }}
          prefixText={symbol}
          error={error || undefined}
          autoFocus={!initialData}
        />

        {/* Quick Amount Presets */}
        <div className="space-y-1.5 pt-0.5">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            Quick Suggestions
          </span>
          <div className="flex flex-wrap gap-2">
            {presetAmounts.map((preset) => {
              const isSelected = limit === preset.toString();
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setLimit(preset.toString());
                    setError(null);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-bold shadow-xs'
                      : 'bg-slate-100 dark:bg-[#20222a] hover:bg-slate-200 dark:hover:bg-[#282b39] text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {symbol}{preset.toLocaleString()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-center gap-2.5 pt-3 border-t border-slate-100 dark:border-[#22242d]">
          <Button
            type="button"
            variant="secondary"
            className="w-full sm:flex-1"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="lavender"
            className="w-full sm:flex-1"
            leftIcon={<Check className="w-4 h-4 stroke-[2.5]" />}
          >
            {initialData ? 'Update Limit' : 'Save Limit'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
