import React, { useState } from 'react';
import { TransactionForm } from '../../components/transactions/TransactionForm';
import { TransactionList } from '../../components/transactions/TransactionList';
import { useTransactions } from '../../context/TransactionContext';
import { useCurrency } from '../../context/CurrencyContext';
import { Transaction } from '../../types';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';

export const TransactionsPage: React.FC = () => {
  const { summary } = useTransactions();
  const { preferredCurrency, formatCurrency } = useCurrency();
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const handleEdit = (tx: Transaction) => {
    setEditingTransaction(tx);
    // Smooth scroll to top on mobile/tablets
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingTransaction(null);
  };

  return (
    <div className="space-y-6">
      {/* Top 3 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Net Balance */}
        <div className="group sm:col-span-2 lg:col-span-1 bg-white dark:bg-[#12131a] border border-slate-200/80 dark:border-[#1e202b] hover:border-slate-300 dark:hover:border-[#2a2d3b] rounded-3xl p-4 sm:p-6 flex items-center justify-between shadow-subtle dark:shadow-none transition-all duration-200">
          <div className="min-w-0 pr-2">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[10.5px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider truncate">
                Net Balance ({preferredCurrency})
              </span>
            </div>
            <div className="text-xl sm:text-2xl lg:text-[28px] font-black text-slate-900 dark:text-white tracking-tight tabular-nums leading-none truncate">
              {formatCurrency(summary.totalBalance, preferredCurrency)}
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-1.5 block truncate">
              Current calculated balance
            </span>
          </div>
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-indigo-50 dark:bg-[#1c1e2e] text-indigo-600 dark:text-[#8e8bf5] flex items-center justify-center border border-indigo-200/60 dark:border-indigo-500/20 shadow-2xs group-hover:scale-105 transition-transform shrink-0">
            <Wallet className="w-5 h-5 stroke-[2]" />
          </div>
        </div>

        {/* Total Income */}
        <div className="group bg-white dark:bg-[#12131a] border border-slate-200/80 dark:border-[#1e202b] hover:border-emerald-200 dark:hover:border-emerald-500/30 rounded-3xl p-4 sm:p-6 flex items-center justify-between shadow-subtle dark:shadow-none transition-all duration-200">
          <div className="min-w-0 pr-2">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[10.5px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider truncate">
                Total Income ({preferredCurrency})
              </span>
            </div>
            <div className="text-xl sm:text-2xl lg:text-[28px] font-black text-emerald-600 dark:text-[#22c55e] tracking-tight tabular-nums leading-none truncate">
              +{formatCurrency(summary.totalIncome, preferredCurrency)}
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-1.5 block truncate">
              Cumulative incoming cash
            </span>
          </div>
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-50 dark:bg-[#14291f] text-emerald-600 dark:text-[#22c55e] flex items-center justify-center border border-emerald-200/70 dark:border-emerald-500/20 shadow-2xs group-hover:scale-105 transition-transform shrink-0">
            <TrendingUp className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        {/* Total Expenses */}
        <div className="group bg-white dark:bg-[#12131a] border border-slate-200/80 dark:border-[#1e202b] hover:border-rose-200 dark:hover:border-rose-500/30 rounded-3xl p-4 sm:p-6 flex items-center justify-between shadow-subtle dark:shadow-none transition-all duration-200">
          <div className="min-w-0 pr-2">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[10.5px] font-extrabold text-rose-600 dark:text-rose-400 uppercase tracking-wider truncate">
                Total Expenses ({preferredCurrency})
              </span>
            </div>
            <div className="text-xl sm:text-2xl lg:text-[28px] font-black text-rose-600 dark:text-[#f87171] tracking-tight tabular-nums leading-none truncate">
              −{formatCurrency(summary.totalExpenses, preferredCurrency)}
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-1.5 block truncate">
              Cumulative recorded spend
            </span>
          </div>
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-rose-50 dark:bg-[#2e181e] text-rose-600 dark:text-[#f87171] flex items-center justify-center border border-rose-200/70 dark:border-rose-500/20 shadow-2xs group-hover:scale-105 transition-transform shrink-0">
            <TrendingDown className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>
      </div>

      {/* Main Grid: Form on Left, Records on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5">
          <TransactionForm
            initialData={editingTransaction}
            onCancelEdit={handleCancelEdit}
            onSuccess={handleCancelEdit}
          />
        </div>

        <div className="lg:col-span-7">
          <TransactionList onEdit={handleEdit} />
        </div>
      </div>
    </div>
  );
};
