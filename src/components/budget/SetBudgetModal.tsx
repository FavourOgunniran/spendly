import React, { useState, useEffect } from 'react';
import { Check, RotateCcw, PiggyBank } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useCurrency } from '../../context/CurrencyContext';

interface SetBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBudget: number;
  onSave: (amount: number) => void;
  onReset?: () => void;
  monthLabel?: string;
}

export const SetBudgetModal: React.FC<SetBudgetModalProps> = ({
  isOpen,
  onClose,
  currentBudget,
  onSave,
  onReset,
  monthLabel,
}) => {
  const { preferredCurrency, currentCurrencyInfo } = useCurrency();
  const [amount, setAmount] = useState(
    currentBudget > 0 ? currentBudget.toString() : ''
  );
  const [error, setError] = useState<string | null>(null);

  const symbol = currentCurrencyInfo?.symbol || '$';

  useEffect(() => {
    if (isOpen) {
      setAmount(currentBudget > 0 ? currentBudget.toString() : '');
      setError(null);
    }
  }, [isOpen, currentBudget]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) {
      setError(`Please enter a valid monthly budget amount greater than ${symbol}0.`);
      return;
    }

    onSave(parsed);
    onClose();
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
      onClose();
    }
  };

  // Adjust preset amounts based on currency scale (e.g. NGN vs USD)
  const isNGN = preferredCurrency === 'NGN';
  const presetAmounts = isNGN
    ? [50000, 100000, 250000, 500000, 1000000]
    : [1500, 2500, 3500, 5000, 7500];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={
        currentBudget > 0
          ? `Adjust Budget: ${monthLabel || 'Monthly'} (${preferredCurrency})`
          : `Set Budget: ${monthLabel || 'Monthly'} (${preferredCurrency})`
      }
      subtitle={`Define your overall spending ceiling for ${monthLabel || 'this month'} in ${currentCurrencyInfo?.name || preferredCurrency}`}
      icon={<PiggyBank className="w-4 h-4" />}
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {/* Monthly Budget Input */}
        <Input
          label={`Monthly Budget Ceiling (${symbol} ${preferredCurrency})`}
          isRequired
          type="number"
          step="any"
          min="0"
          placeholder={isNGN ? '500000.00' : '3500.00'}
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            setError(null);
          }}
          prefixText={symbol}
          error={error || undefined}
          autoFocus
        />

        {/* Quick Amount Presets */}
        <div className="space-y-1.5 pt-0.5">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            Quick Suggestions
          </span>
          <div className="flex flex-wrap gap-2">
            {presetAmounts.map((preset) => {
              const isSelected = amount === preset.toString();
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setAmount(preset.toString());
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

        {/* Reset / Remove Budget Target */}
        {currentBudget > 0 && onReset && (
          <div className="pt-1">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-rose-500 hover:text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset / Remove Budget Target</span>
            </button>
          </div>
        )}

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
            Save Budget
          </Button>
        </div>
      </form>
    </Modal>
  );
};
