import React, { useState } from 'react';
import { Transaction } from '../../types';
import { useTransactions } from '../../context/TransactionContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useCategories } from '../../context/CategoryContext';
import { useToast } from '../../context/ToastContext';
import { ConfirmModal } from '../ui/ConfirmModal';
import { renderCategoryIcon } from '../../utils/iconHelper';
import {
  ArrowDownRight,
  ArrowUpRight,
  Trash2,
  Calendar,
  Edit3,
  Repeat,
} from 'lucide-react';
import { clsx } from 'clsx';
import { CURRENCY_MAP } from '../../services/currencyService';

interface TransactionItemProps {
  transaction: Transaction;
  onEdit?: (transaction: Transaction) => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  onEdit,
}) => {
  const { deleteTransaction } = useTransactions();
  const { preferredCurrency, formatCurrency, convert } = useCurrency();
  const { getCategoryByName, getCategoryColor, getCategoryIconName } = useCategories();
  const { success, error: toastError } = useToast();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isIncome = transaction.type === 'income';
  const categoryItem = getCategoryByName(transaction.category, transaction.type);
  const catColor = categoryItem?.color || getCategoryColor(transaction.category);
  const catIconName = categoryItem?.icon || getCategoryIconName(transaction.category);

  const txCurrency = transaction.currency || 'NGN';
  const isDifferentCurrency = txCurrency.toUpperCase() !== preferredCurrency.toUpperCase();
  const convertedAmount = isDifferentCurrency
    ? convert(transaction.amount, txCurrency, preferredCurrency)
    : transaction.amount;

  const currencyFlag = CURRENCY_MAP[txCurrency]?.flag || '';

  // Format date and check for relative day (Today / Yesterday)
  const txDate = new Date(transaction.date);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const isToday =
    txDate.toISOString().split('T')[0] === today.toISOString().split('T')[0];
  const isYesterday =
    txDate.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0];

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(txDate);

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await deleteTransaction(transaction.id);
      setIsConfirmOpen(false);
      success(
        'Transaction Deleted',
        `"${transaction.title}" (${formatCurrency(transaction.amount, txCurrency)}) was removed.`,
        { priority: 'medium' }
      );
    } catch (err) {
      console.error('[TransactionItem] Delete failed:', err);
      toastError(
        'Unable to Delete Transaction',
        'Could not delete the transaction. Please check your connection and try again.',
        { priority: 'high' }
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const memoText = transaction.description || transaction.notes;

  return (
    <>
      <div className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 p-3 sm:p-3.5 bg-slate-50/80 dark:bg-[#121319] hover:bg-white dark:hover:bg-[#181922] border border-slate-200/80 dark:border-[#22242d] hover:border-slate-300 dark:hover:border-[#2f3240] rounded-2xl transition-all duration-150 shadow-2xs hover:shadow-xs">
        {/* Mobile Top Row / Desktop Left Part */}
        <div className="flex items-center justify-between sm:justify-start gap-3 min-w-0 sm:flex-1">
          {/* Category Icon Surface with dynamic color */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-transform duration-150 group-hover:scale-105 shadow-2xs"
            style={{
              backgroundColor: `${catColor}18`,
              borderColor: `${catColor}35`,
              color: catColor,
            }}
          >
            {renderCategoryIcon(catIconName, 'w-4 h-4 stroke-[2.2]')}
          </div>

          {/* Text Content */}
          <div className="flex flex-col min-w-0 flex-1">
            {/* Title & Notes */}
            <div className="flex items-center gap-2">
              <span className="text-[13.5px] font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-tight truncate group-hover:text-indigo-600 dark:group-hover:text-[#8e8bf5] transition-colors">
                {transaction.title}
              </span>
              {memoText && (
                <span className="hidden md:inline-block text-[11px] text-slate-400 dark:text-slate-500 font-medium truncate max-w-[180px]">
                  — {memoText}
                </span>
              )}
            </div>

            {/* Mobile note */}
            {memoText && (
              <span className="md:hidden text-[11px] text-slate-400 dark:text-slate-500 font-medium truncate mt-0.5">
                {memoText}
              </span>
            )}

            {/* Desktop Tags (Category, Recurring, Currency, Date) */}
            <div className="hidden sm:flex items-center flex-wrap gap-1.5 mt-1">
              {/* Category Pill */}
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border"
                style={{
                  backgroundColor: `${catColor}12`,
                  borderColor: `${catColor}30`,
                  color: catColor,
                }}
              >
                {transaction.category}
              </span>

              {/* Recurring Badge */}
              {transaction.isRecurring && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 text-[10px] font-bold border border-purple-200 dark:border-purple-800/60">
                  <Repeat className="w-2.5 h-2.5" />
                  <span className="capitalize">{transaction.recurringInterval || 'recurring'}</span>
                </span>
              )}

              {/* Currency Tag */}
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#1a1c26] text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-[#282a38]">
                <span>{currencyFlag}</span>
                <span>{txCurrency}</span>
              </span>

              {/* Date Badge */}
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10.5px] font-semibold text-slate-400 dark:text-slate-500">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>{formattedDate}</span>
                {isToday && (
                  <span className="ml-1 px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 text-[9.5px] font-extrabold border border-indigo-200/50">
                    Today
                  </span>
                )}
                {isYesterday && (
                  <span className="ml-1 px-1.5 py-0.2 rounded bg-slate-100 dark:bg-[#20222a] text-slate-500 dark:text-slate-400 text-[9.5px] font-bold">
                    Yesterday
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Mobile Amount (displayed next to title on mobile) */}
          <div className="flex sm:hidden flex-col items-end shrink-0 pl-1.5">
            <div
              className={clsx(
                'flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg border text-[11px] sm:text-xs font-extrabold tabular-nums tracking-tight shadow-2xs',
                isIncome
                  ? 'bg-emerald-50/90 dark:bg-[#14291f]/90 text-emerald-600 dark:text-[#22c55e] border-emerald-200/80 dark:border-emerald-500/20'
                  : 'bg-rose-50/90 dark:bg-[#2e181e]/90 text-rose-600 dark:text-[#f87171] border-rose-200/80 dark:border-rose-500/20'
              )}
            >
              {isIncome ? (
                <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
              ) : (
                <ArrowDownRight className="w-3 h-3 stroke-[2.5]" />
              )}
              <span>
                {isIncome ? '+' : '-'}
                {formatCurrency(transaction.amount, txCurrency)}
              </span>
            </div>

            {isDifferentCurrency && (
              <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5 tabular-nums">
                ≈ {isIncome ? '+' : '-'}{formatCurrency(convertedAmount, preferredCurrency)}
              </span>
            )}
          </div>
        </div>

        {/* Mobile Bottom Row: Category Pill, Date & Action Buttons */}
        <div className="flex sm:hidden items-center justify-between pt-2 border-t border-slate-100 dark:border-[#1c1e28] gap-2">
          <div className="flex items-center flex-wrap gap-1.5 min-w-0 flex-1">
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border truncate max-w-[120px]"
              style={{
                backgroundColor: `${catColor}12`,
                borderColor: `${catColor}30`,
                color: catColor,
              }}
            >
              {transaction.category}
            </span>

            {transaction.isRecurring && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 text-[10px] font-bold border border-purple-200 dark:border-purple-800/60">
                <Repeat className="w-2.5 h-2.5" />
                <span className="capitalize">{transaction.recurringInterval || 'recurring'}</span>
              </span>
            )}

            <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-slate-400 dark:text-slate-500 shrink-0">
              <span>{formattedDate}</span>
              {isToday && (
                <span className="ml-0.5 px-1 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 text-[9px] font-bold">
                  Today
                </span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-0.5 shrink-0">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(transaction)}
                title="Edit Transaction"
                className="p-1.5 sm:p-2 min-w-[34px] min-h-[34px] flex items-center justify-center text-slate-400 hover:text-indigo-600 dark:hover:text-[#8e8bf5] hover:bg-indigo-50 dark:hover:bg-[#1b1f38] rounded-xl transition-colors cursor-pointer"
              >
                <Edit3 className="w-4 h-4 stroke-[2.2]" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsConfirmOpen(true)}
              title="Delete Transaction"
              className="p-1.5 sm:p-2 min-w-[34px] min-h-[34px] flex items-center justify-center text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4 stroke-[2.2]" />
            </button>
          </div>
        </div>

        {/* Desktop Right: Amount & Actions (hidden on mobile) */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <div className="flex flex-col items-end">
            <div
              className={clsx(
                'flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs sm:text-[13px] font-extrabold tabular-nums tracking-tight shadow-2xs',
                isIncome
                  ? 'bg-emerald-50/90 dark:bg-[#14291f]/90 text-emerald-600 dark:text-[#22c55e] border-emerald-200/80 dark:border-emerald-500/20'
                  : 'bg-rose-50/90 dark:bg-[#2e181e]/90 text-rose-600 dark:text-[#f87171] border-rose-200/80 dark:border-rose-500/20'
              )}
            >
              {isIncome ? (
                <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />
              )}
              <span>
                {isIncome ? '+' : '-'}
                {formatCurrency(transaction.amount, txCurrency)}
              </span>
            </div>

            {isDifferentCurrency && (
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5 tabular-nums pr-1">
                ≈ {isIncome ? '+' : '-'}{formatCurrency(convertedAmount, preferredCurrency)}
              </span>
            )}
          </div>

          {/* Edit */}
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(transaction)}
              title="Edit Transaction"
              className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-[#8e8bf5] hover:bg-indigo-50 dark:hover:bg-[#1b1f38] rounded-xl transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 stroke-[2.2]" />
            </button>
          )}

          {/* Delete */}
          <button
            type="button"
            onClick={() => setIsConfirmOpen(true)}
            title="Delete Transaction"
            className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 stroke-[2.2]" />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        isLoading={isDeleting}
        title="Delete Transaction"
        message={`Are you sure you want to delete "${transaction.title}" (${formatCurrency(
          transaction.amount,
          txCurrency
        )})? This action cannot be undone.`}
        confirmLabel="Delete Record"
        onConfirm={handleDeleteConfirm}
        onCancel={() => !isDeleting && setIsConfirmOpen(false)}
      />
    </>
  );
};
